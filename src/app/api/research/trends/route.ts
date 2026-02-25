import { NextRequest, NextResponse } from "next/server";

// POST /api/research/trends — scan trend sources
export async function POST(req: NextRequest) {
  const body = await req.json();
  const sources = body.sources || ["x", "reddit", "google_trends", "rss"];
  const categories = body.categories || [];
  const limit = body.limit || 50;

  // Placeholder: In production, this calls external APIs
  // (X API, Reddit API, Google Trends, RSS parsers)
  return NextResponse.json({
    trends: [],
    sources_scanned: sources,
    categories_filtered: categories,
    limit,
    scanned_at: new Date().toISOString(),
    message: "Trend scanning not yet connected to external sources. Configure API keys in Admin > Tokens.",
  });
}
