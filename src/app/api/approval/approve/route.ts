import { NextRequest, NextResponse } from "next/server";

// POST /api/approval/approve — approve a draft
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { draft_id, approval_type, user_id, note } = body;

  if (!draft_id || !approval_type) {
    return NextResponse.json({ error: "draft_id and approval_type are required" }, { status: 400 });
  }

  const validTypes = ["approve_copy", "approve_assets"];
  if (!validTypes.includes(approval_type)) {
    return NextResponse.json({ error: `approval_type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  // In production, records approval event and updates draft status
  return NextResponse.json({
    draft_id,
    approval_type,
    approved_by: user_id || "system",
    note: note || null,
    timestamp: new Date().toISOString(),
  });
}
