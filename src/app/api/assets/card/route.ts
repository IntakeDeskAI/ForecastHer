import { NextRequest, NextResponse } from "next/server";

// POST /api/assets/card — generate market card assets
export async function POST(req: NextRequest) {
  const body = await req.json();

  const marketId = body.market_id;
  const numbersLabel = body.numbers_label || "illustrative";

  // Placeholder: In production, generates images (square card, story, carousel, thumbnail)
  // using a service like Vercel OG, Satori, or an external image API
  const assetTypes = ["square_card", "story_card", "carousel_p1", "thumbnail"];
  const assets = assetTypes.map((type) => ({
    id: crypto.randomUUID(),
    market_id: marketId,
    type,
    url: null, // generated URL would go here
    hash: null,
    version: 1,
    numbers_label: numbersLabel,
    created_at: new Date().toISOString(),
  }));

  return NextResponse.json({
    asset_ids: assets.map((a) => a.id),
    assets,
    message: "Asset generation is a placeholder. Connect an image generation service in Admin.",
  });
}
