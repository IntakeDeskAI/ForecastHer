import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/growth-ops/track-tweet
 *
 * Add a tweet to tracking with optional manual metrics.
 *
 * Body: {
 *   tweetUrl?: string           — full URL like https://x.com/user/status/123456
 *   tweetId?: string            — just the numeric ID
 *   tags?: string[]             — optional tags like ["motd", "comment", "thread"]
 *   textPreview?: string        — paste the tweet text for reference
 *   impressions?: number        — manual entry from X analytics
 *   likes?: number
 *   retweets?: number
 *   replies?: number
 *   quotes?: number
 *   bookmarks?: number
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tweetUrl,
      tweetId: rawId,
      tags,
      textPreview,
      impressions,
      likes,
      retweets,
      replies,
      quotes,
      bookmarks,
    } = body;

    // Extract tweet ID from URL or use directly
    let tweetId = rawId;
    let url = tweetUrl;

    if (tweetUrl && !tweetId) {
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

    const row: Record<string, unknown> = {
      tweet_id: tweetId,
      tweet_url: url,
      tags: tags ?? [],
      posted_at: new Date().toISOString(),
    };

    // Include manual metrics if provided
    if (textPreview != null) row.text_preview = textPreview;
    if (impressions != null) row.impressions = impressions;
    if (likes != null) row.likes = likes;
    if (retweets != null) row.retweets = retweets;
    if (replies != null) row.replies = replies;
    if (quotes != null) row.quotes = quotes;
    if (bookmarks != null) row.bookmarks = bookmarks;
    if (impressions != null || likes != null || retweets != null) {
      row.last_synced_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("x_posts")
      .upsert(row, { onConflict: "tweet_id" })
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
 * PATCH /api/admin/growth-ops/track-tweet
 *
 * Update metrics for an existing tracked tweet (manual entry).
 *
 * Body: {
 *   tweetId: string
 *   impressions?: number
 *   likes?: number
 *   retweets?: number
 *   replies?: number
 *   quotes?: number
 *   bookmarks?: number
 *   textPreview?: string
 * }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tweetId, ...fields } = body;

    if (!tweetId) {
      return NextResponse.json({ error: "tweetId is required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updates: Record<string, unknown> = { last_synced_at: new Date().toISOString() };
    if (fields.impressions != null) updates.impressions = fields.impressions;
    if (fields.likes != null) updates.likes = fields.likes;
    if (fields.retweets != null) updates.retweets = fields.retweets;
    if (fields.replies != null) updates.replies = fields.replies;
    if (fields.quotes != null) updates.quotes = fields.quotes;
    if (fields.bookmarks != null) updates.bookmarks = fields.bookmarks;
    if (fields.textPreview != null) updates.text_preview = fields.textPreview;

    const { data, error } = await supabase
      .from("x_posts")
      .update(updates)
      .eq("tweet_id", tweetId)
      .select()
      .single();

    if (error) {
      console.error("Update tweet error:", error);
      return NextResponse.json({ error: "Failed to update tweet." }, { status: 500 });
    }

    // Re-aggregate today's metrics
    await aggregateTodayMetrics(supabase);

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

// Helper: re-aggregate x_posts into growth_metrics_daily for today
async function aggregateTodayMetrics(supabase: ReturnType<typeof createAdminClient>) {
  const today = new Date().toISOString().split("T")[0];

  const { data: posts } = await supabase
    .from("x_posts")
    .select("impressions, likes, retweets, replies, quotes, tweet_id")
    .order("impressions", { ascending: false })
    .limit(100);

  if (!posts || posts.length === 0) return;

  const totalImpressions = posts.reduce((s, p) => s + (p.impressions ?? 0), 0);
  const totalEngagement = posts.reduce((s, p) => s + (p.likes ?? 0) + (p.retweets ?? 0) + (p.replies ?? 0), 0);

  const bestTweet = posts.reduce(
    (best, p) => {
      const eng = (p.likes ?? 0) + (p.retweets ?? 0) + (p.replies ?? 0) + (p.quotes ?? 0);
      return eng > best.engagement ? { tweet_id: p.tweet_id, engagement: eng } : best;
    },
    { tweet_id: "", engagement: 0 }
  );

  await supabase.from("growth_metrics_daily").upsert(
    {
      date: today,
      impressions: totalImpressions,
      clicks: totalEngagement,
      posts: posts.length,
      best_post_url: bestTweet.tweet_id
        ? `https://x.com/i/web/status/${bestTweet.tweet_id}`
        : null,
      best_channel: "x",
    },
    { onConflict: "date" }
  );
}
