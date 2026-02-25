import { NextResponse } from "next/server";

// GET /api/publisher/status — check publisher health
export async function GET() {
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
