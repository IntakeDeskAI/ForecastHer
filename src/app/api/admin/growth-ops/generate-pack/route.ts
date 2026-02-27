import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/admin/growth-ops/generate-pack
 *
 * Generates a full week pack (or today pack) of assets using Claude.
 *
 * Body: {
 *   type: "week" | "today"
 *   dayCount?: number            — defaults to 7 for week, 1 for today
 *   marketQuestion?: string      — optional: use a specific market for today pack
 * }
 *
 * Returns: {
 *   ok: true,
 *   pack: {
 *     markets: Array<{ question, category, resolvesBy, resolutionCriteria }>
 *     scripts: Array<{ platform, marketIndex, content }>
 *     utms: Array<{ source, medium, campaign, content, fullUrl }>
 *   },
 *   usage: { input_tokens, output_tokens }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type = "week", dayCount, marketQuestion } = body;

    const count = dayCount ?? (type === "week" ? 7 : 1);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured. Add it in your environment variables." },
        { status: 503 }
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a growth marketing strategist for ForecastHer, a prediction market platform focused on women's health, femtech, and women-centric topics.

Key rules:
- ForecastHer is pre-launch. Use "waitlist", "beta credits", "pre-launch".
- Beta credits have no cash value — always state this.
- Resolution criteria must be specific, auditable, with a named source.
- Brand voice: smart, confident, accessible, never condescending.
- Every post must include a disclosure line: "Illustrative odds only. Not financial or medical advice. Play money beta."
- Markets should cover diverse women-centric topics: health, career, policy, sports, tech, finance.

You must respond ONLY with valid JSON. No markdown, no code fences, no explanation.`;

    const specificMarketLine = marketQuestion
      ? `Use this specific market as Market 1: "${marketQuestion}". Generate the remaining ${count - 1} markets fresh.`
      : "";

    const userPrompt = `Generate a ${type === "week" ? "Week 1" : "Today"} content pack with ${count} markets.

${specificMarketLine}

Return this exact JSON structure:
{
  "markets": [
    {
      "question": "Will [specific event] happen by [date]?",
      "category": "one of: Women's Health, FemTech, Career, Policy, Sports, Finance",
      "resolvesBy": "YYYY-MM-DD",
      "resolutionCriteria": "Resolves YES if [specific measurable condition] according to [named source] by [date]."
    }
  ],
  "scripts": [
    {
      "platform": "x",
      "marketIndex": 0,
      "content": "The full post text ready to copy-paste. Include disclosure line."
    },
    {
      "platform": "instagram",
      "marketIndex": 0,
      "content": "The full caption with hashtags. Include disclosure line."
    },
    {
      "platform": "tiktok",
      "marketIndex": 0,
      "content": "Hook: [hook]\\nBody: [body]\\nCTA: [cta]. Include disclosure line."
    },
    {
      "platform": "linkedin",
      "marketIndex": 0,
      "content": "The full professional post. Include disclosure line."
    }
  ],
  "utms": [
    {
      "source": "x",
      "medium": "social",
      "campaign": "week1-day1",
      "content": "motd-hook",
      "fullUrl": "https://forecasther.ai/?utm_source=x&utm_medium=social&utm_campaign=week1-day1&utm_content=motd-hook"
    }
  ]
}

Rules:
- Generate exactly ${count} markets
- For each market, generate 4 scripts (x, instagram, tiktok, linkedin)
- For each market, generate 4 UTM links (one per platform)
- Markets must be timely, specific, and have auditable resolution criteria
- Scripts must be ready to post — no placeholders, no brackets
- Each script must end with the disclosure line
- UTM campaigns should follow the pattern: week1-day{N}
- Return ONLY the JSON object, nothing else`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const rawText = textBlock?.text ?? "";

    if (!rawText) {
      return NextResponse.json(
        { error: "AI returned empty response. Try again." },
        { status: 500 }
      );
    }

    // Parse JSON — strip any accidental markdown fences
    const cleaned = rawText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    let pack;
    try {
      pack = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Try again.", raw: rawText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      pack,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error("Generate pack error:", err);

    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid ANTHROPIC_API_KEY. Check your environment variables." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate pack." },
      { status: 500 }
    );
  }
}
