import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/tokens — fetch all platform tokens
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("platform_tokens")
      .select("*")
      .order("platform");

    if (error) {
      console.error("Fetch tokens error:", error);
      return NextResponse.json({ error: "Failed to fetch tokens." }, { status: 500 });
    }

    return NextResponse.json({ tokens: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

/**
 * POST /api/admin/tokens — save or update a platform token
 * Body: { platform, api_key, from_email?, from_name? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, api_key, from_email, from_name } = body;

    if (!platform || !api_key) {
      return NextResponse.json({ error: "Platform and API key are required." }, { status: 400 });
    }

    const validPlatforms = ["x", "instagram", "tiktok", "linkedin", "email"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert — update if platform row exists, insert otherwise
    const { error } = await supabase
      .from("platform_tokens")
      .upsert(
        {
          platform,
          api_key,
          from_email: from_email || null,
          from_name: from_name || null,
          status: "active",
          connected_at: new Date().toISOString(),
        },
        { onConflict: "platform" }
      );

    if (error) {
      console.error("Save token error:", error);
      return NextResponse.json({ error: "Failed to save token." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/tokens — revoke a platform token
 * Body: { platform }
 */
export async function DELETE(request: Request) {
  try {
    const { platform } = await request.json();

    if (!platform) {
      return NextResponse.json({ error: "Platform is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("platform_tokens")
      .delete()
      .eq("platform", platform);

    if (error) {
      console.error("Delete token error:", error);
      return NextResponse.json({ error: "Failed to revoke token." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
