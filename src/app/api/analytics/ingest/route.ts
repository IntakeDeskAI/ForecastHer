import { NextRequest, NextResponse } from "next/server";

// POST /api/analytics/ingest — ingest analytics events
export async function POST(req: NextRequest) {
  const body = await req.json();
  const events = body.events || [];

  // Placeholder: In production, writes to analytics table
  return NextResponse.json({
    ingested: events.length,
    timestamp: new Date().toISOString(),
  });
}
