import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/analytics?range=7d|14d|30d
 *
 * Returns all analytics data needed for the Intelligence Command Center.
 * Reads from DB tables populated by the GA4 ingestion job.
 * Cached for 5 minutes.
 */
export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") ?? "7d";
  const days = range === "30d" ? 30 : range === "14d" ? 14 : 7;

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
  const priorStart = new Date(Date.now() - days * 2 * 86400000).toISOString().split("T")[0];

  try {
    // Parallel queries
    const [
      dailyRes,
      priorDailyRes,
      todayRes,
      sourcesRes,
      campaignsRes,
      pagesRes,
      topicsRes,
      creativesRes,
      recsRes,
      healthRes,
      streaksRes,
    ] = await Promise.all([
      // Current period daily
      supabase.from("analytics_daily").select("*").gte("date", startDate).lte("date", today).order("date"),
      // Prior period for comparison
      supabase.from("analytics_daily").select("*").gte("date", priorStart).lt("date", startDate).order("date"),
      // Today only
      supabase.from("analytics_daily").select("*").eq("date", today).single(),
      // Sources
      supabase.from("analytics_source_daily").select("*").gte("date", startDate).lte("date", today),
      // Campaigns
      supabase.from("analytics_campaign_daily").select("*").gte("date", startDate).lte("date", today),
      // Pages
      supabase.from("analytics_page_daily").select("*").gte("date", startDate).lte("date", today),
      // Topics
      supabase.from("analytics_topic_daily").select("*").gte("date", startDate).lte("date", today).order("velocity_score", { ascending: false }),
      // Creatives
      supabase.from("analytics_creative_daily").select("*").gte("date", startDate).lte("date", today),
      // Recommendations
      supabase.from("analytics_recommendations").select("*").eq("date", today).eq("dismissed", false).order("created_at", { ascending: false }).limit(5),
      // Health
      supabase.from("analytics_health").select("*").limit(1).single(),
      // Streaks
      supabase.from("analytics_streaks").select("*").limit(1).single(),
    ]);

    const daily = dailyRes.data ?? [];
    const priorDaily = priorDailyRes.data ?? [];
    const todayData = todayRes.data;

    // Aggregate period totals
    const sum = (arr: typeof daily, key: string) =>
      arr.reduce((s, r) => s + ((r as Record<string, number>)[key] ?? 0), 0);

    const current = {
      sessions: sum(daily, "sessions"),
      users: sum(daily, "users"),
      newUsers: sum(daily, "new_users"),
      pageviews: sum(daily, "pageviews"),
      signups: sum(daily, "waitlist_signups"),
      ctaClicks: sum(daily, "waitlist_cta_clicks"),
      marketViews: sum(daily, "market_views"),
    };

    const prior = {
      sessions: sum(priorDaily, "sessions"),
      users: sum(priorDaily, "users"),
      signups: sum(priorDaily, "waitlist_signups"),
      ctaClicks: sum(priorDaily, "waitlist_cta_clicks"),
      marketViews: sum(priorDaily, "market_views"),
    };

    // Signal Strength (0-100)
    const signalStrength = computeSignalStrength(current, daily);

    // Trend Velocity (0-100)
    const trendVelocity = computeTrendVelocity(current, prior);

    // Conversion rate
    const conversionRate = current.ctaClicks > 0 ? current.signups / current.ctaClicks : 0;
    const todayConversion = todayData
      ? todayData.waitlist_cta_clicks > 0
        ? todayData.waitlist_signups / todayData.waitlist_cta_clicks
        : 0
      : 0;

    // Best channel
    const sourceAgg = aggregateSources(sourcesRes.data ?? []);
    const bestChannel = sourceAgg.length > 0 ? sourceAgg[0] : null;

    // Aggregate sources, campaigns, pages, topics, creatives
    const campaignAgg = aggregateCampaigns(campaignsRes.data ?? []);
    const pageAgg = aggregatePages(pagesRes.data ?? []);
    const topicAgg = topicsRes.data ?? [];
    const creativeAgg = aggregateCreatives(creativesRes.data ?? []);

    return NextResponse.json({
      range,
      today: todayData ?? { date: today, sessions: 0, users: 0, new_users: 0, pageviews: 0, waitlist_signups: 0, waitlist_cta_clicks: 0, market_views: 0 },
      current,
      prior,
      daily,
      signalStrength,
      trendVelocity,
      conversionRate,
      todayConversion,
      bestChannel,
      sources: sourceAgg,
      campaigns: campaignAgg,
      pages: pageAgg,
      topics: topicAgg,
      creatives: creativeAgg,
      recommendations: recsRes.data ?? [],
      health: healthRes.data ?? { status: "pending", last_ingestion_at: null },
      streaks: streaksRes.data ?? { publish_streak: 0, distribute_streak: 0, signup_streak: 0 },
    }, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    // Return empty structure so UI still renders
    return NextResponse.json({
      range,
      today: { date: today, sessions: 0, users: 0, new_users: 0, pageviews: 0, waitlist_signups: 0, waitlist_cta_clicks: 0, market_views: 0 },
      current: { sessions: 0, users: 0, newUsers: 0, pageviews: 0, signups: 0, ctaClicks: 0, marketViews: 0 },
      prior: { sessions: 0, users: 0, signups: 0, ctaClicks: 0, marketViews: 0 },
      daily: [],
      signalStrength: 0,
      trendVelocity: 0,
      conversionRate: 0,
      todayConversion: 0,
      bestChannel: null,
      sources: [],
      campaigns: [],
      pages: [],
      topics: [],
      creatives: [],
      recommendations: [],
      health: { status: "no_tables", last_ingestion_at: null },
      streaks: { publish_streak: 0, distribute_streak: 0, signup_streak: 0 },
    });
  }
}

// ── Computation helpers ──────────────────────────────────────────────

function computeSignalStrength(
  current: { sessions: number; ctaClicks: number; signups: number; marketViews: number; users: number },
  daily: { sessions?: number; users?: number }[]
) {
  // Normalize each metric 0-1 using reasonable ceilings for early stage
  const norm = (val: number, ceil: number) => Math.min(val / Math.max(ceil, 1), 1);

  const sessionsScore = norm(current.sessions, 500);
  const ctaScore = norm(current.ctaClicks, 100);
  const signupScore = norm(current.signups, 50);
  const marketScore = norm(current.marketViews, 200);

  // Returning ratio approximation
  const returningRatio = current.users > 0 && daily.length > 1
    ? Math.min((current.users - (daily[daily.length - 1]?.users ?? 0)) / current.users, 1)
    : 0;

  const raw = 0.25 * signupScore + 0.20 * ctaScore + 0.20 * marketScore + 0.20 * sessionsScore + 0.15 * returningRatio;
  return Math.round(raw * 100);
}

function computeTrendVelocity(
  current: { sessions: number; signups: number; ctaClicks: number; marketViews: number },
  prior: { sessions: number; signups: number; ctaClicks: number; marketViews: number }
) {
  const velocity = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 1 : 0;
    return Math.min((curr - prev) / prev, 2); // Cap at 200% growth
  };

  const avg = (
    velocity(current.sessions, prior.sessions) +
    velocity(current.signups, prior.signups) +
    velocity(current.ctaClicks, prior.ctaClicks) +
    velocity(current.marketViews, prior.marketViews)
  ) / 4;

  // Scale from [-1, 2] to [0, 100]
  return Math.round(Math.max(0, Math.min(100, (avg + 1) * 33.3)));
}

interface SourceRow { source: string; medium: string; sessions: number; users: number; waitlist_cta_clicks: number; waitlist_signups: number }

function aggregateSources(rows: SourceRow[]) {
  const map = new Map<string, { source: string; medium: string; sessions: number; users: number; ctaClicks: number; signups: number }>();
  for (const r of rows) {
    const key = `${r.source}/${r.medium}`;
    const existing = map.get(key) ?? { source: r.source, medium: r.medium, sessions: 0, users: 0, ctaClicks: 0, signups: 0 };
    existing.sessions += r.sessions;
    existing.users += r.users;
    existing.ctaClicks += r.waitlist_cta_clicks;
    existing.signups += r.waitlist_signups;
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.signups - a.signups || b.sessions - a.sessions);
}

interface CampaignRow { campaign: string; source: string; medium: string; sessions: number; clicks: number; waitlist_signups: number }

function aggregateCampaigns(rows: CampaignRow[]) {
  const map = new Map<string, { campaign: string; source: string; medium: string; sessions: number; clicks: number; signups: number }>();
  for (const r of rows) {
    const key = `${r.campaign}/${r.source}`;
    const existing = map.get(key) ?? { campaign: r.campaign, source: r.source, medium: r.medium, sessions: 0, clicks: 0, signups: 0 };
    existing.sessions += r.sessions;
    existing.clicks += r.clicks;
    existing.signups += r.waitlist_signups;
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.signups - a.signups || b.sessions - a.sessions);
}

interface PageRow { page_path: string; pageviews: number; waitlist_signups: number; waitlist_cta_clicks: number }

function aggregatePages(rows: PageRow[]) {
  const map = new Map<string, { page_path: string; pageviews: number; signups: number; ctaClicks: number }>();
  for (const r of rows) {
    const existing = map.get(r.page_path) ?? { page_path: r.page_path, pageviews: 0, signups: 0, ctaClicks: 0 };
    existing.pageviews += r.pageviews;
    existing.signups += r.waitlist_signups;
    existing.ctaClicks += r.waitlist_cta_clicks;
    map.set(r.page_path, existing);
  }
  return [...map.values()].sort((a, b) => b.pageviews - a.pageviews);
}

interface CreativeRow { utm_content: string; platform: string; clicks: number; signups: number; signup_rate: number }

function aggregateCreatives(rows: CreativeRow[]) {
  const map = new Map<string, { utm_content: string; platform: string; clicks: number; signups: number; signupRate: number }>();
  for (const r of rows) {
    const key = `${r.utm_content}/${r.platform}`;
    const existing = map.get(key) ?? { utm_content: r.utm_content, platform: r.platform, clicks: 0, signups: 0, signupRate: 0 };
    existing.clicks += r.clicks;
    existing.signups += r.signups;
    existing.signupRate = existing.clicks > 0 ? existing.signups / existing.clicks : 0;
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.signups - a.signups || b.clicks - a.clicks);
}
