import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/admin/tokens/test — verify a platform token works
 * Body: { platform, api_key, from_email?, from_name? }
 *
 * For email/Resend: validates the API key by fetching domains.
 * For social platforms: validates basic key format (full OAuth test is platform-specific).
 */
export async function POST(request: Request) {
  try {
    const { platform, api_key, from_email } = await request.json();

    if (!platform || !api_key) {
      return NextResponse.json({ error: "Platform and API key are required." }, { status: 400 });
    }

    if (platform === "email") {
      return testResend(api_key, from_email);
    }

    // Social platforms — validate key looks reasonable
    if (api_key.length < 10) {
      return NextResponse.json({ error: "API key looks too short. Check your key." }, { status: 400 });
    }

    // We can't fully verify social tokens without calling each platform API,
    // but we can confirm the key was saved and the format is reasonable.
    return NextResponse.json({
      ok: true,
      message: `${platform} token format accepted. Full verification happens on first post.`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

async function testResend(apiKey: string, fromEmail?: string) {
  try {
    const resend = new Resend(apiKey);

    // Verify the key by fetching domains — if the key is invalid, this will throw
    const { data, error } = await resend.domains.list();

    if (error) {
      return NextResponse.json(
        { error: `Resend API error: ${error.message}` },
        { status: 400 }
      );
    }

    const domains = data?.data ?? [];
    const verifiedDomains = domains.filter((d) => d.status === "verified");

    // If a from_email was provided, check if its domain is verified
    if (fromEmail) {
      const emailDomain = fromEmail.split("@")[1];
      const domainVerified = verifiedDomains.some((d) => d.name === emailDomain);
      if (!domainVerified) {
        return NextResponse.json({
          ok: true,
          warning: `API key is valid but domain "${emailDomain}" is not verified in Resend. Emails may send from Resend's shared domain.`,
          domains: domains.map((d) => ({ name: d.name, status: d.status })),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Resend API key verified. ${verifiedDomains.length} verified domain${verifiedDomains.length !== 1 ? "s" : ""} found.`,
      domains: domains.map((d) => ({ name: d.name, status: d.status })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to verify Resend key." },
      { status: 400 }
    );
  }
}
