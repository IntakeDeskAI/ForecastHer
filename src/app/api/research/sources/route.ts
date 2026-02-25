import { NextRequest, NextResponse } from "next/server";

// POST /api/research/sources — fetch and validate sources for markets
export async function POST(req: NextRequest) {
  const body = await req.json();
  const markets = body.markets || [];
  const minSources = body.min_sources || 2;

  // Placeholder: In production, fetches URLs, extracts content, validates freshness
  const marketsWithSources = markets.map((market: Record<string, unknown>) => ({
    ...market,
    sources: [],
    sources_count: 0,
    meets_minimum: false,
  }));

  return NextResponse.json({
    markets_with_sources: marketsWithSources,
    min_sources_required: minSources,
    fetched_at: new Date().toISOString(),
  });
}
