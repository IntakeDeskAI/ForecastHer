import { NextRequest, NextResponse } from "next/server";

// POST /api/publisher/schedule — schedule drafts for posting
export async function POST(req: NextRequest) {
  const body = await req.json();
  const draftIds: string[] = body.draft_ids || [];
  const windows = body.windows || {};

  // Default posting windows (hour ranges in America/Boise timezone)
  const defaultWindows: Record<string, { hour_start: number; hour_end: number }> = {
    x: { hour_start: 9, hour_end: 11 },
    instagram: { hour_start: 11, hour_end: 13 },
    tiktok: { hour_start: 17, hour_end: 20 },
    linkedin: { hour_start: 8, hour_end: 10 },
  };

  const mergedWindows = { ...defaultWindows, ...windows };

  const scheduled = draftIds.map((draftId) => ({
    id: crypto.randomUUID(),
    draft_id: draftId,
    scheduled_at: new Date().toISOString(), // placeholder
    status: "scheduled",
    retry_count: 0,
    windows: mergedWindows,
  }));

  return NextResponse.json({
    scheduled_count: scheduled.length,
    posts: scheduled,
  });
}
