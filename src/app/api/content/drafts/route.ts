import { NextRequest, NextResponse } from "next/server";

// In-memory store for dev mode. Replace with Supabase table in production.
const drafts: Record<string, unknown>[] = [];

// GET /api/content/drafts
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  let result = [...drafts];

  const status = searchParams.get("status");
  if (status) result = result.filter((d: Record<string, unknown>) => d.status === status);

  const platform = searchParams.get("platform");
  if (platform) result = result.filter((d: Record<string, unknown>) => d.platform === platform);

  const marketId = searchParams.get("market_id");
  if (marketId) result = result.filter((d: Record<string, unknown>) => d.market_id === marketId);

  return NextResponse.json(result);
}

// POST /api/content/drafts — create drafts for a market
export async function POST(req: NextRequest) {
  const body = await req.json();

  const platforms = body.platforms || ["x"];
  const formatMap = body.format_map || { x: "thread", instagram: "card_caption", tiktok: "short_script", linkedin: "single_post" };
  const mode = body.mode || "prelaunch";
  const numbersLabel = body.numbers_label || "illustrative";

  const newDrafts = platforms.map((platform: string) => ({
    id: crypto.randomUUID(),
    market_id: body.market_id || null,
    platform,
    format: formatMap[platform] || "single_post",
    status: "new",
    hook: "",
    body: "",
    cta: "",
    hashtags: [],
    first_comment: null,
    disclosure_line: mode === "prelaunch"
      ? "Illustrative odds only. Not financial or medical advice. Play money beta."
      : null,
    utm_link: null,
    confidence: 0,
    risk_level: "low",
    citations: [],
    compliance_checks: [],
    asset_ids: [],
    approval_history: [],
    prompt_used: null,
    model_used: null,
    final_text: null,
    mode,
    numbers_label: numbersLabel,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  drafts.push(...newDrafts);

  return NextResponse.json(
    { draft_ids: newDrafts.map((d: Record<string, unknown>) => d.id), count: newDrafts.length },
    { status: 201 }
  );
}
