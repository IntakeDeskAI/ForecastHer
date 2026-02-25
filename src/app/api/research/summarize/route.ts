import { NextRequest, NextResponse } from "next/server";

// POST /api/research/summarize — AI-summarize source content
export async function POST(req: NextRequest) {
  const body = await req.json();

  return NextResponse.json({
    summaries: [],
    source_count: 0,
    message: "AI summarization not yet connected. Configure AI model keys in Admin.",
  });
}
