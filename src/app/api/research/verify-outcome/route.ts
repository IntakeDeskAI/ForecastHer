import { NextRequest, NextResponse } from "next/server";

// POST /api/research/verify-outcome — verify market resolution outcomes
export async function POST(req: NextRequest) {
  const body = await req.json();
  const markets = body.markets || [];

  // Placeholder: In production, checks resolution sources for each due market
  return NextResponse.json({
    resolved: [],
    resolved_ids: [],
    unverifiable: markets.map((m: Record<string, unknown>) => m.id || m),
    verified_at: new Date().toISOString(),
    message: "Outcome verification requires connected resolution sources.",
  });
}
