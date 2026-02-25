import { NextRequest, NextResponse } from "next/server";

// POST /api/publisher/post-now — immediately publish a draft
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { draft_id, platform } = body;

  if (!draft_id) {
    return NextResponse.json({ error: "draft_id is required" }, { status: 400 });
  }

  // Placeholder: In production, calls platform APIs (X, IG, TikTok, LinkedIn)
  return NextResponse.json({
    draft_id,
    platform: platform || "unknown",
    status: "failed",
    error: "Publisher not connected. Configure platform tokens in Admin > Tokens.",
  });
}
