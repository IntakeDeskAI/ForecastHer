import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/growth-ops/metrics?range=today|week|all
 *
 * Returns aggregated metrics for the dashboard.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "today";

    const supabase = createAdminClient();

    const today = new Date().toISOString().split("T")[0];

    // Get today's metrics
    const { data: todayRow } = await supabase
      .from("growth_metrics_daily")
      .select("*")
      .eq("date", today)
      .single();

    // Get this week's metrics (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStart = weekAgo.toISOString().split("T")[0];

    const { data: weekRows } = await supabase
      .from("growth_metrics_daily")
      .select("*")
      .gte("date", weekStart)
      .order("date", { ascending: true });

    // Aggregate week
    const weekTotals = (weekRows ?? []).reduce(
      (acc, row) => ({
        signups: acc.signups + (row.signups ?? 0),
        clicks: acc.clicks + (row.clicks ?? 0),
        impressions: acc.impressions + (row.impressions ?? 0),
        posts: acc.posts + (row.posts ?? 0),
        comments: acc.comments + (row.comments ?? 0),
        dms: acc.dms + (row.dms ?? 0),
      }),
      { signups: 0, clicks: 0, impressions: 0, posts: 0, comments: 0, dms: 0 }
    );

    // Get X post breakdown (top performers)
    const { data: topPosts } = await supabase
      .from("x_posts")
      .select("tweet_id, tweet_url, text_preview, impressions, likes, retweets, replies, quotes, bookmarks, tags, posted_at, last_synced_at")
      .order("impressions", { ascending: false })
      .limit(10);

    return NextResponse.json({
      today: todayRow ?? {
        date: today,
        signups: 0,
        clicks: 0,
        impressions: 0,
        posts: 0,
        comments: 0,
        dms: 0,
        best_post_url: null,
        best_channel: null,
      },
      week: {
        ...weekTotals,
        dailyBreakdown: weekRows ?? [],
      },
      topPosts: topPosts ?? [],
      range,
    });
  } catch (err) {
    console.error("Metrics fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch metrics." },
      { status: 500 }
    );
  }
}
