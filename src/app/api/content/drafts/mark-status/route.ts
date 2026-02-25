import { NextRequest, NextResponse } from "next/server";

// POST /api/content/drafts/mark-status
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { draft_ids, status } = body;

  if (!draft_ids || !status) {
    return NextResponse.json({ error: "draft_ids and status are required" }, { status: 400 });
  }

  const validStatuses = ["new", "needs_review", "approved", "scheduled", "posted", "blocked"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
  }

  // In production, update drafts in Supabase
  return NextResponse.json({
    updated: draft_ids.length,
    status,
    draft_ids,
  });
}
