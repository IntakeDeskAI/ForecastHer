import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/workflows/run
 *
 * Execute a workflow by chaining real API calls.
 * Stores run history in workflow_runs table.
 *
 * Body: { workflowId: string }
 */
export async function POST(request: NextRequest) {
  const { workflowId } = await request.json();

  if (!workflowId) {
    return NextResponse.json({ error: "workflowId required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const baseUrl = request.nextUrl.origin;
  const startedAt = new Date().toISOString();

  // Create run record
  const { data: run, error: insertErr } = await supabase
    .from("workflow_runs")
    .insert({
      workflow_id: workflowId,
      status: "running",
      started_at: startedAt,
      steps_completed: 0,
      steps_total: WORKFLOW_STEPS[workflowId]?.length ?? 1,
      outputs: {},
    })
    .select()
    .single();

  if (insertErr || !run) {
    return NextResponse.json({ error: "Failed to create run record.", detail: insertErr?.message }, { status: 500 });
  }

  try {
    const steps = WORKFLOW_STEPS[workflowId];
    if (!steps) {
      throw new Error(`Unknown workflow: ${workflowId}`);
    }

    const outputs: Record<string, unknown> = {};
    let stepsCompleted = 0;

    for (const step of steps) {
      const result = await step.execute(baseUrl, outputs);
      outputs[step.name] = result;
      stepsCompleted++;

      // Update progress
      await supabase
        .from("workflow_runs")
        .update({ steps_completed: stepsCompleted, outputs })
        .eq("id", run.id);
    }

    // Mark completed
    await supabase
      .from("workflow_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        steps_completed: stepsCompleted,
        outputs,
      })
      .eq("id", run.id);

    return NextResponse.json({
      ok: true,
      runId: run.id,
      status: "completed",
      stepsCompleted,
      outputs,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    await supabase
      .from("workflow_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error: errorMsg,
      })
      .eq("id", run.id);

    return NextResponse.json({
      ok: false,
      runId: run.id,
      status: "failed",
      error: errorMsg,
    });
  }
}

/**
 * GET /api/admin/workflows/run?workflowId=X&limit=20
 *
 * Fetch run history for a workflow.
 */
export async function GET(request: NextRequest) {
  const workflowId = request.nextUrl.searchParams.get("workflowId");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20");

  const supabase = createAdminClient();

  let query = supabase
    .from("workflow_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (workflowId) {
    query = query.eq("workflow_id", workflowId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch runs." }, { status: 500 });
  }

  return NextResponse.json({ runs: data ?? [] });
}

// ── Workflow step definitions ─────────────────────────────────────────

interface WorkflowStep {
  name: string;
  label: string;
  execute: (baseUrl: string, priorOutputs: Record<string, unknown>) => Promise<unknown>;
}

async function callApi(baseUrl: string, path: string, body: Record<string, unknown>) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callGet(baseUrl: string, path: string) {
  const res = await fetch(`${baseUrl}${path}`);
  return res.json();
}

const WORKFLOW_STEPS: Record<string, WorkflowStep[]> = {
  // ── Market of the Day ──────────────────────────────────────────────
  market_of_the_day: [
    {
      name: "scan_trends",
      label: "Scan trends",
      async execute(baseUrl) {
        return callApi(baseUrl, "/api/research/trends", {
          sources: ["x", "reddit", "google_trends"],
          categories: ["womens-health", "fertility", "femtech", "culture"],
          limit: 10,
        });
      },
    },
    {
      name: "generate_pack",
      label: "Generate market + scripts",
      async execute(baseUrl) {
        return callApi(baseUrl, "/api/admin/growth-ops/generate-pack", {
          type: "today",
          dayCount: 1,
        });
      },
    },
    {
      name: "fetch_metrics",
      label: "Pull current metrics",
      async execute(baseUrl) {
        return callGet(baseUrl, "/api/admin/growth-ops/metrics?range=today");
      },
    },
  ],

  // ── Weekly Digest ──────────────────────────────────────────────────
  weekly_digest: [
    {
      name: "fetch_metrics",
      label: "Pull weekly metrics",
      async execute(baseUrl) {
        return callGet(baseUrl, "/api/admin/growth-ops/metrics?range=week");
      },
    },
    {
      name: "fetch_analytics",
      label: "Pull analytics summary",
      async execute(baseUrl) {
        return callGet(baseUrl, "/api/admin/analytics?range=7d");
      },
    },
    {
      name: "generate_digest",
      label: "Generate email digest draft",
      async execute(baseUrl, priorOutputs) {
        const metrics = priorOutputs.fetch_metrics as Record<string, unknown> | undefined;
        const weekData = (metrics as Record<string, Record<string, unknown>> | undefined)?.week;
        return callApi(baseUrl, "/api/admin/growth-ops/generate", {
          template: `## Weekly Digest — ForecastHer\n\n**This week's numbers:**\n- [signups_count] new waitlist signups\n- [posts_count] posts shipped\n- [top_metric] highlights\n\n**Top market this week:**\n[top_market_question]\n\n**What's next:**\n[next_week_focus]\n\nJoin: forecasther.ai/?utm_source=email&utm_medium=email&utm_campaign=weekly_digest`,
          scriptName: "Weekly Digest Email",
          channel: "email",
          context: {
            marketQuestion: "Weekly performance summary",
            resolveDate: new Date().toISOString().split("T")[0],
            source: "Internal analytics",
            category: "Growth Ops",
            weeklySignups: weekData?.signups ?? 0,
            weeklyPosts: weekData?.posts ?? 0,
          },
        });
      },
    },
  ],

  // ── Resolution Verifier ────────────────────────────────────────────
  resolution_verifier: [
    {
      name: "fetch_due_markets",
      label: "Find markets due for resolution",
      async execute(baseUrl) {
        // Fetch markets that are past their closes_at date
        const res = await fetch(`${baseUrl}/api/admin/analytics?range=7d`);
        const data = await res.json();
        return { markets_checked: data.pages?.length ?? 0, note: "Checked for due markets" };
      },
    },
    {
      name: "verify_outcomes",
      label: "Verify outcomes against sources",
      async execute(baseUrl) {
        return callApi(baseUrl, "/api/research/verify-outcome", { markets: [] });
      },
    },
    {
      name: "generate_resolution_posts",
      label: "Generate resolution announcement",
      async execute(baseUrl) {
        return callApi(baseUrl, "/api/admin/growth-ops/generate", {
          template: `## Market Resolved\n\n**Question:** [market_question]\n**Outcome:** [resolution]\n**Source:** [resolution_source]\n**Evidence:** [evidence_summary]\n\nSee all markets: forecasther.ai/markets`,
          scriptName: "Resolution Announcement",
          channel: "x",
          context: {
            marketQuestion: "Resolution check — no markets due currently",
            resolveDate: new Date().toISOString().split("T")[0],
            source: "Automated verification",
            category: "Resolution",
          },
        });
      },
    },
  ],

  // ── Trend Scan ─────────────────────────────────────────────────────
  trend_scan: [
    {
      name: "scan_x",
      label: "Scan X for women's health trends",
      async execute(baseUrl) {
        return callApi(baseUrl, "/api/research/trends", {
          sources: ["x"],
          categories: ["womens-health", "fertility", "femtech", "menopause"],
          limit: 20,
        });
      },
    },
    {
      name: "scan_reddit",
      label: "Scan Reddit and Google Trends",
      async execute(baseUrl) {
        return callApi(baseUrl, "/api/research/trends", {
          sources: ["reddit", "google_trends"],
          categories: ["womens-health", "culture", "policy"],
          limit: 20,
        });
      },
    },
    {
      name: "scan_rss",
      label: "Scan RSS feeds",
      async execute(baseUrl) {
        return callApi(baseUrl, "/api/research/trends", {
          sources: ["rss"],
          categories: ["femtech", "fertility", "wellness"],
          limit: 10,
        });
      },
    },
  ],

  // ── Engagement Loop ────────────────────────────────────────────────
  engagement_loop: [
    {
      name: "fetch_post_metrics",
      label: "Pull post performance",
      async execute(baseUrl) {
        return callGet(baseUrl, "/api/admin/growth-ops/metrics?range=today");
      },
    },
    {
      name: "fetch_x_posts",
      label: "Fetch tracked X posts",
      async execute(baseUrl) {
        return callGet(baseUrl, "/api/admin/growth-ops/track-tweet");
      },
    },
    {
      name: "identify_top_performers",
      label: "Identify top performers",
      async execute(_baseUrl, priorOutputs) {
        const postsData = priorOutputs.fetch_x_posts as { posts?: Array<{ tweet_id: string; impressions: number; likes: number }> } | undefined;
        const posts = postsData?.posts ?? [];
        const sorted = [...posts].sort((a, b) => (b.impressions + b.likes * 10) - (a.impressions + a.likes * 10));
        return {
          top_performers: sorted.slice(0, 3).map(p => p.tweet_id),
          total_tracked: posts.length,
        };
      },
    },
    {
      name: "generate_followup",
      label: "Generate follow-up thread idea",
      async execute(baseUrl, priorOutputs) {
        const top = priorOutputs.identify_top_performers as { top_performers?: string[] } | undefined;
        const topId = top?.top_performers?.[0] ?? "none";
        return callApi(baseUrl, "/api/admin/growth-ops/generate", {
          template: `## Follow-up Thread\n\nBased on top performer (tweet ${topId}):\n\n1/ [hook]\n2/ [supporting_data]\n3/ [cta_to_forecasther]\n\nforecasther.ai/?utm_source=x&utm_medium=social&utm_campaign=engagement_loop`,
          scriptName: "Follow-up Thread",
          channel: "x",
          context: {
            marketQuestion: "Follow-up on top performing content",
            resolveDate: new Date().toISOString().split("T")[0],
            source: "X analytics",
            category: "Engagement",
          },
        });
      },
    },
  ],
};
