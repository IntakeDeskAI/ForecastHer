import { NextResponse } from "next/server";

// GET /api/approval/audit — retrieve audit log
export async function GET() {
  // In production, queries the audit_log table
  return NextResponse.json({
    entries: [],
    total: 0,
    message: "Audit log will populate as actions are performed.",
  });
}
