"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  UserPlus,
  Send,
  MessageSquare,
  Mail,
  TrendingUp,
  MousePointerClick,
  Eye,
  Sparkles,
  Loader2,
  Calendar,
  RefreshCw,
  Plus,
  Heart,
  Repeat2,
  MessageCircle,
  Bookmark,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface DailyMetrics {
  date: string;
  signups: number;
  clicks: number;
  impressions: number;
  posts: number;
  comments: number;
  dms: number;
  best_post_url?: string | null;
  best_channel?: string | null;
}

interface XPost {
  tweet_id: string;
  tweet_url: string;
  text_preview: string;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  tags: string[];
  posted_at: string;
  last_synced_at: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

const today = new Date().toISOString().split("T")[0];

const EMPTY_METRICS: DailyMetrics = {
  date: today,
  signups: 0,
  clicks: 0,
  impressions: 0,
  posts: 0,
  comments: 0,
  dms: 0,
};

export default function ReportPage() {
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics>(EMPTY_METRICS);
  const [weekMetrics, setWeekMetrics] = useState<DailyMetrics>({ ...EMPTY_METRICS, date: "week" });
  const [topPosts, setTopPosts] = useState<XPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");

  // Track tweet state
  const [trackUrl, setTrackUrl] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackResult, setTrackResult] = useState("");

  // Debrief
  const [generatingDebrief, setGeneratingDebrief] = useState(false);
  const [debrief, setDebrief] = useState("");

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/growth-ops/metrics?range=week");
      if (!res.ok) return;
      const data = await res.json();

      setTodayMetrics(data.today);
      setWeekMetrics({
        date: "week",
        signups: data.week.signups,
        clicks: data.week.clicks,
        impressions: data.week.impressions,
        posts: data.week.posts,
        comments: data.week.comments,
        dms: data.week.dms,
      });
      setTopPosts(data.topPosts ?? []);
    } catch {
      // Silent fail — dashboard still shows zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  async function handleSyncX() {
    setSyncing(true);
    setSyncResult("");
    try {
      const res = await fetch("/api/admin/growth-ops/fetch-x-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setSyncResult(data.error || "Sync failed.");
        return;
      }
      setSyncResult(`Synced ${data.synced} tweets. ${data.totals.impressions.toLocaleString()} total impressions.`);
      // Refresh metrics
      await fetchMetrics();
    } catch (err) {
      setSyncResult(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleTrackTweet() {
    if (!trackUrl.trim()) return;
    setTracking(true);
    setTrackResult("");
    try {
      const res = await fetch("/api/admin/growth-ops/track-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetUrl: trackUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTrackResult(data.error || "Failed to track tweet.");
        return;
      }
      setTrackResult("Tweet tracked! Click 'Sync from X' to pull its metrics.");
      setTrackUrl("");
      await fetchMetrics();
    } catch (err) {
      setTrackResult(err instanceof Error ? err.message : "Network error.");
    } finally {
      setTracking(false);
    }
  }

  async function handleGenerateDebrief() {
    setGeneratingDebrief(true);
    try {
      const res = await fetch("/api/admin/growth-ops/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: `## Weekly Debrief\n\n**What worked:**\n- [winning_tactic_1]\n- [winning_tactic_2]\n\n**What to stop:**\n- [underperforming_tactic]\n\n**What to double down on:**\n- [highest_roi_action]\n\n**Metrics summary:**\n- [metrics_summary]\n\n**Next week focus:**\n- [next_week_priority]`,
          scriptName: "Weekly Debrief",
          channel: "email",
          context: {
            marketQuestion: "Weekly performance review",
            resolveDate: today,
            source: "Dashboard metrics",
            category: "Growth Ops",
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.draft) {
        setDebrief(data.draft);
      } else {
        setDebrief(
          "## Weekly Debrief\n\n**What worked:**\n- (Synced X metrics to track real performance)\n\n**What to stop:**\n- N/A\n\n**What to double down on:**\n- Ship the daily loop consistently for 7 days to generate enough data for real analysis."
        );
      }
    } catch {
      setDebrief("Failed to generate debrief. Check that ANTHROPIC_API_KEY is configured.");
    } finally {
      setGeneratingDebrief(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sync Controls */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> X Data Sync
            </CardTitle>
            <Button
              size="sm"
              onClick={handleSyncX}
              disabled={syncing}
              className="gap-1 text-xs"
            >
              {syncing ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Syncing...</>
              ) : (
                <><RefreshCw className="h-3 w-3" /> Sync from X</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste tweet URLs to track them, then sync to pull impressions, likes, retweets, and replies from the X API.
          </p>

          {/* Track Tweet Input */}
          <div className="flex gap-2">
            <Input
              value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
              placeholder="https://x.com/yourhandle/status/123456789"
              className="text-sm flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleTrackTweet()}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleTrackTweet}
              disabled={tracking || !trackUrl.trim()}
              className="gap-1 text-xs shrink-0"
            >
              {tracking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Track Tweet
            </Button>
          </div>

          {/* Status messages */}
          {syncResult && (
            <div className={`text-xs px-2 py-1 rounded ${syncResult.startsWith("Synced") ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
              {syncResult}
            </div>
          )}
          {trackResult && (
            <div className={`text-xs px-2 py-1 rounded ${trackResult.startsWith("Tweet tracked") ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
              {trackResult}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <UserPlus className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold font-mono">
              {loading ? "—" : todayMetrics.signups}
            </div>
            <div className="text-xs text-muted-foreground">Signups today</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              This week: {weekMetrics.signups}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Send className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold font-mono">
              {loading ? "—" : todayMetrics.posts}
            </div>
            <div className="text-xs text-muted-foreground">Posts tracked</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              This week: {weekMetrics.posts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <MessageSquare className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <div className="text-2xl font-bold font-mono">
              {loading ? "—" : todayMetrics.comments}
            </div>
            <div className="text-xs text-muted-foreground">Comments shipped</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              This week: {weekMetrics.comments}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Mail className="h-5 w-5 mx-auto text-orange-600 mb-1" />
            <div className="text-2xl font-bold font-mono">
              {loading ? "—" : todayMetrics.dms}
            </div>
            <div className="text-xs text-muted-foreground">DMs shipped</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              This week: {weekMetrics.dms}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Impressions</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono">
                {loading ? "—" : todayMetrics.impressions.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">today</span>
              <span className="text-xs text-muted-foreground/60 ml-auto">
                week: {weekMetrics.impressions.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono">
                {loading ? "—" : todayMetrics.clicks.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">today</span>
              <span className="text-xs text-muted-foreground/60 ml-auto">
                week: {weekMetrics.clicks.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* X Post Performance Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> X Post Performance
            </CardTitle>
            {topPosts.length > 0 && topPosts[0].last_synced_at && (
              <span className="text-[10px] text-muted-foreground">
                Last synced: {new Date(topPosts[0].last_synced_at).toLocaleString()}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {topPosts.length === 0 ? (
            <div className="py-8 text-center">
              <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-base">No X posts tracked yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Paste tweet URLs above and click &quot;Track Tweet&quot;, then &quot;Sync from X&quot; to pull metrics.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tweet</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1"><Eye className="h-3 w-3" /> Imp.</div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1"><Heart className="h-3 w-3" /> Likes</div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1"><Repeat2 className="h-3 w-3" /> RT</div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1"><MessageCircle className="h-3 w-3" /> Replies</div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1"><Bookmark className="h-3 w-3" /> Saves</div>
                  </TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPosts.map((post) => (
                  <TableRow key={post.tweet_id}>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="text-xs truncate">{post.text_preview || `Tweet ${post.tweet_id}`}</p>
                        <div className="flex gap-1 mt-0.5">
                          {post.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(post.posted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{post.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{post.likes}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{post.retweets}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{post.replies}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{post.bookmarks}</TableCell>
                    <TableCell>
                      <a href={post.tweet_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Weekly Debrief Generator */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Weekly Debrief
            </CardTitle>
            <Button
              size="sm"
              onClick={handleGenerateDebrief}
              disabled={generatingDebrief}
              className="gradient-purple text-white gap-1 text-xs"
            >
              {generatingDebrief ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" /> Generate Weekly Debrief
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {debrief ? (
            <div className="prose prose-sm max-w-none">
              <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm">
                {debrief}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Generate a weekly debrief to see what worked, what to stop, and what to double down on.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                AI analyzes your tracked X posts, metrics, and notes to produce actionable insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
