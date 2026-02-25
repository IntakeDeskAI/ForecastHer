import { NextRequest, NextResponse } from "next/server";

// GET /api/analytics/overview
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const windowDays = parseInt(searchParams.get("window_days") || "7", 10);

  // Placeholder: In production, aggregates from analytics tables
  return NextResponse.json({
    window_days: windowDays,
    waitlist_signups: 0,
    ctr: 0,
    follower_change: 0,
    posts_published: 0,
    top_posts: [],
    engagement_rate: 0,
    period_start: new Date(Date.now() - windowDays * 86400000).toISOString(),
    period_end: new Date().toISOString(),
  });
}
