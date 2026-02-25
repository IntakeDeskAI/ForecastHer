import { NextRequest, NextResponse } from "next/server";

// POST /api/content/drafts/attach-assets
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { draft_ids, asset_ids } = body;

  if (!draft_ids || !asset_ids) {
    return NextResponse.json({ error: "draft_ids and asset_ids are required" }, { status: 400 });
  }

  // In production, link assets to drafts in Supabase
  return NextResponse.json({
    attached: draft_ids.length,
    draft_ids,
    asset_ids,
  });
}
