import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * POST /api/admin/growth-ops/generate
 *
 * Generate a filled-in script from a template using Claude.
 *
 * Body: {
 *   template: string       — The script template with [variable] placeholders
 *   scriptName: string      — Name of the script (e.g. "Market of the Day — X Post")
 *   channel: string         — Target channel (x, linkedin, ig, tiktok, reddit, email, dm)
 *   context: {
 *     marketQuestion: string  — The market question to base content on
 *     resolveDate: string     — Resolution date
 *     source: string          — Resolution source / criteria
 *     category: string        — Market category
 *     recipientName?: string  — For DM templates
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { template, scriptName, channel, context } = body;

    if (!template || !context?.marketQuestion) {
      return NextResponse.json(
        { error: "Template and market question are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured. Add it to your environment variables." },
        { status: 503 }
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a growth marketing copywriter for ForecastHer, a prediction market platform focused on women's health, femtech, and women-centric topics. ForecastHer is pre-launch and uses play money (beta credits).

Key rules:
- Never claim the product is live. Use "pre-launch", "waitlist", "beta credits".
- Beta credits have no cash value — always state this.
- Resolution criteria must be specific and auditable.
- Keep the brand voice: smart, confident, accessible, never condescending.
- Use the exact format and structure of the provided template.
- Fill in ALL [bracketed variables] with real, specific content.
- Do NOT include the brackets in the output.
- Do NOT add extra sections or change the template structure.
- For UTM links, use: forcasther.com/?utm_source=${channel}&utm_medium=social&utm_campaign=growth&utm_content=ai_draft
- Keep the tone appropriate for the channel (X = punchy, LinkedIn = professional, IG = visual, TikTok = hook-driven, Reddit = community-first, DM = personal, Email = concise).`;

    const userPrompt = `Fill in this ${scriptName} template for the ${channel} channel.

TEMPLATE:
${template}

CONTEXT:
Market Question: ${context.marketQuestion}
Resolve Date: ${context.resolveDate || "TBD"}
Resolution Source: ${context.source || "Not specified"}
Category: ${context.category || "Women's Health"}
${context.recipientName ? `Recipient Name: ${context.recipientName}` : ""}

Instructions:
1. Replace every [bracketed variable] with specific, compelling content based on the market question.
2. Research-quality reasons — make the YES and NO cases genuinely arguable.
3. Keep the exact structure of the template.
4. Output ONLY the filled-in script, nothing else. No preamble, no explanation.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        { role: "user", content: userPrompt },
      ],
      system: systemPrompt,
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const generatedText = textBlock?.text ?? "";

    if (!generatedText) {
      return NextResponse.json(
        { error: "AI returned empty response. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      draft: generatedText,
      model: message.model,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error("Growth ops generate error:", err);

    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid ANTHROPIC_API_KEY. Check your environment variables." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate draft." },
      { status: 500 }
    );
  }
}
