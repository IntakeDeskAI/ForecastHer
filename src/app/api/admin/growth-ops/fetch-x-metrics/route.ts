import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/admin/growth-ops/fetch-x-metrics
 *
 * Fetches metrics for tracked X posts using the X API v2.
 * Uses the Bearer Token stored in platform_tokens.
 *
 * Body (optional): {
 *   tweetIds?: string[]   — specific tweet IDs to refresh (defaults to all un-synced or stale)
 * }
 *
 * Flow:
 * 1. Read X bearer token from platform_tokens
 * 2. Read tweet IDs from x_posts table
 * 3. Call X API v2 /tweets endpoint with metric fields
 * 4. Update x_posts rows with fresh metrics
 * 5. Aggregate into growth_metrics_daily for today
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { tweetIds: requestedIds } = body as { tweetIds?: string[] };

    const supabase = createAdminClient();

    // 1. Get X bearer token
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("platform_tokens")
      .select("api_key, status")
      .eq("platform", "x")
      .single();

    if (tokenErr || !tokenRow?.api_key) {
      return NextResponse.json(
        { error: "X bearer token not configured. Go to Settings → Tokens to add it." },
        { status: 400 }
      );
    }

    if (tokenRow.status !== "active") {
      return NextResponse.json(
        { error: "X token is not active. Reconnect it in Settings → Tokens." },
        { status: 400 }
      );
    }

    const bearerToken = tokenRow.api_key;

    // 2. Get tweet IDs to sync
    let tweetIds: string[];
    if (requestedIds && requestedIds.length > 0) {
      tweetIds = requestedIds;
    } else {
      // Fetch all tracked tweets (limit 100 most recent)
      const { data: posts, error: postsErr } = await supabase
        .from("x_posts")
        .select("tweet_id")
        .order("posted_at", { ascending: false })
        .limit(100);

      if (postsErr) {
        return NextResponse.json({ error: "Failed to read x_posts." }, { status: 500 });
      }

      tweetIds = (posts ?? []).map((p: { tweet_id: string }) => p.tweet_id);
    }

    if (tweetIds.length === 0) {
      return NextResponse.json({
        ok: true,
        synced: 0,
        message: "No tweets to sync. Add tweets first using the Track Tweet feature.",
      });
    }

    // 3. Call X API v2 — batch up to 100 IDs per request
    const allMetrics: TweetMetrics[] = [];
    const batchSize = 100;

    for (let i = 0; i < tweetIds.length; i += batchSize) {
      const batch = tweetIds.slice(i, i + batchSize);
      const ids = batch.join(",");

      const xRes = await fetch(
        `https://api.x.com/2/tweets?ids=${ids}&tweet.fields=public_metrics,created_at,text`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (!xRes.ok) {
        const errBody = await xRes.text();
        console.error("X API error:", xRes.status, errBody);

        if (xRes.status === 401) {
          return NextResponse.json(
            { error: "X bearer token is invalid or expired. Update it in Settings → Tokens." },
            { status: 401 }
          );
        }
        if (xRes.status === 429) {
          return NextResponse.json(
            { error: "X API rate limit hit. Try again in 15 minutes." },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: `X API returned ${xRes.status}. ${errBody}` },
          { status: 502 }
        );
      }

      const xData = await xRes.json();
      const tweets = xData.data ?? [];

      for (const tweet of tweets) {
        const pm = tweet.public_metrics ?? {};
        allMetrics.push({
          tweet_id: tweet.id,
          text_preview: (tweet.text ?? "").slice(0, 280),
          impressions: pm.impression_count ?? 0,
          likes: pm.like_count ?? 0,
          retweets: pm.retweet_count ?? 0,
          replies: pm.reply_count ?? 0,
          quotes: pm.quote_count ?? 0,
          bookmarks: pm.bookmark_count ?? 0,
        });
      }
    }

    // 4. Update x_posts with fresh metrics
    const now = new Date().toISOString();
    for (const m of allMetrics) {
      await supabase
        .from("x_posts")
        .update({
          impressions: m.impressions,
          likes: m.likes,
          retweets: m.retweets,
          replies: m.replies,
          quotes: m.quotes,
          bookmarks: m.bookmarks,
          text_preview: m.text_preview,
          last_synced_at: now,
        })
        .eq("tweet_id", m.tweet_id);
    }

    // 5. Aggregate into growth_metrics_daily for today
    const today = new Date().toISOString().split("T")[0];
    const totalImpressions = allMetrics.reduce((s, m) => s + m.impressions, 0);
    const totalClicks = allMetrics.reduce((s, m) => s + m.likes + m.retweets + m.replies, 0);

    // Find best performing tweet
    const bestTweet = allMetrics.reduce(
      (best, m) => {
        const engagement = m.likes + m.retweets + m.replies + m.quotes;
        return engagement > best.engagement ? { tweet_id: m.tweet_id, engagement } : best;
      },
      { tweet_id: "", engagement: 0 }
    );

    // Upsert today's metrics
    await supabase.from("growth_metrics_daily").upsert(
      {
        date: today,
        impressions: totalImpressions,
        clicks: totalClicks,
        posts: allMetrics.length,
        best_post_url: bestTweet.tweet_id
          ? `https://x.com/i/web/status/${bestTweet.tweet_id}`
          : null,
        best_channel: "x",
      },
      { onConflict: "date" }
    );

    return NextResponse.json({
      ok: true,
      synced: allMetrics.length,
      metrics: allMetrics,
      totals: {
        impressions: totalImpressions,
        engagement: totalClicks,
        bestTweetId: bestTweet.tweet_id,
      },
    });
  } catch (err) {
    console.error("Fetch X metrics error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch X metrics." },
      { status: 500 }
    );
  }
}

interface TweetMetrics {
  tweet_id: string;
  text_preview: string;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
}
