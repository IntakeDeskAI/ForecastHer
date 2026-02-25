import { NextRequest, NextResponse } from "next/server";

// POST /api/approval/lock — lock a draft (no further edits)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { draft_id, user_id } = body;

  if (!draft_id) {
    return NextResponse.json({ error: "draft_id is required" }, { status: 400 });
  }

  return NextResponse.json({
    draft_id,
    locked: true,
    locked_by: user_id || "system",
    timestamp: new Date().toISOString(),
  });
}
