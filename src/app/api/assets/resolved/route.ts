import { NextRequest, NextResponse } from "next/server";

// POST /api/assets/resolved — generate resolved market badge assets
export async function POST(req: NextRequest) {
  const body = await req.json();
  const marketIds: string[] = body.market_ids || [];

  const assets = marketIds.map((marketId) => ({
    id: crypto.randomUUID(),
    market_id: marketId,
    type: "resolved_badge",
    url: null,
    hash: null,
    version: 1,
    created_at: new Date().toISOString(),
  }));

  return NextResponse.json({
    asset_ids: assets.map((a) => a.id),
    assets,
  });
}
