import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/publisher/status — check publisher health from real token data
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: tokens } = await supabase
      .from("platform_tokens")
      .select("platform, status");

    const tokenMap = new Map(
      (tokens ?? []).map((t: { platform: string; status: string }) => [t.platform, t.status])
    );

    const platforms = Object.fromEntries(
      ["x", "instagram", "tiktok", "linkedin", "email"].map((p) => [
        p,
        {
          connected: tokenMap.get(p) === "active",
          status: tokenMap.has(p) ? tokenMap.get(p) : "not_configured",
        },
      ])
    );

    return NextResponse.json({
      platforms,
      autopost_enabled: false,
      last_post: null,
    });
  } catch {
    return NextResponse.json({
      platforms: {
        x: { connected: false, status: "not_configured" },
        instagram: { connected: false, status: "not_configured" },
        tiktok: { connected: false, status: "not_configured" },
        linkedin: { connected: false, status: "not_configured" },
        email: { connected: false, status: "not_configured" },
      },
      autopost_enabled: false,
      last_post: null,
    });
  }
}
