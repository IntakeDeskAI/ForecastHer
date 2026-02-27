import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/growth-ops/track-tweet
 *
 * Add a tweet to tracking. Accepts either a tweet URL or a tweet ID.
 *
 * Body: {
 *   tweetUrl?: string    — full URL like https://x.com/user/status/123456
 *   tweetId?: string     — just the numeric ID
 *   tags?: string[]      — optional tags like ["motd", "comment", "thread"]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tweetUrl, tweetId: rawId, tags } = body;

    // Extract tweet ID from URL or use directly
    let tweetId = rawId;
    let url = tweetUrl;

    if (tweetUrl && !tweetId) {
      // Parse URL: https://x.com/user/status/123456 or https://twitter.com/user/status/123456
      const match = tweetUrl.match(/status\/(\d+)/);
      if (match) {
        tweetId = match[1];
      }
    }

    if (!tweetId) {
      return NextResponse.json(
        { error: "Provide a tweetUrl or tweetId." },
        { status: 400 }
      );
    }

    if (!url) {
      url = `https://x.com/i/web/status/${tweetId}`;
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("x_posts")
      .upsert(
        {
          tweet_id: tweetId,
          tweet_url: url,
          tags: tags ?? [],
          posted_at: new Date().toISOString(),
        },
        { onConflict: "tweet_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Track tweet error:", error);
      return NextResponse.json(
        { error: "Failed to track tweet." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, post: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

/**
 * GET /api/admin/growth-ops/track-tweet
 *
 * List all tracked tweets, most recent first.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("x_posts")
      .select("*")
      .order("posted_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch tweets." }, { status: 500 });
    }

    return NextResponse.json({ posts: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
