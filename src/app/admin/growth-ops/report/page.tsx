"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  Heart,
  Repeat2,
  MessageCircle,
  Bookmark,
  ExternalLink,
  Pencil,
  Check,
  X,
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

  // Track tweet state
  const [trackUrl, setTrackUrl] = useState("");
  const [trackText, setTrackText] = useState("");
  const [trackImpressions, setTrackImpressions] = useState("");
  const [trackLikes, setTrackLikes] = useState("");
  const [trackRetweets, setTrackRetweets] = useState("");
  const [trackReplies, setTrackReplies] = useState("");
  const [trackBookmarks, setTrackBookmarks] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackResult, setTrackResult] = useState("");

  // Inline edit state
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ impressions: "", likes: "", retweets: "", replies: "", bookmarks: "" });
  const [saving, setSaving] = useState(false);

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

  async function handleTrackTweet() {
    if (!trackUrl.trim()) return;
    setTracking(true);
    setTrackResult("");
    try {
      const res = await fetch("/api/admin/growth-ops/track-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetUrl: trackUrl.trim(),
          textPreview: trackText.trim() || undefined,
          impressions: trackImpressions ? parseInt(trackImpressions) : undefined,
          likes: trackLikes ? parseInt(trackLikes) : undefined,
          retweets: trackRetweets ? parseInt(trackRetweets) : undefined,
          replies: trackReplies ? parseInt(trackReplies) : undefined,
          bookmarks: trackBookmarks ? parseInt(trackBookmarks) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTrackResult(data.error || "Failed to track tweet.");
        return;
      }
      setTrackResult("Tweet tracked with metrics!");
      setTrackUrl("");
      setTrackText("");
      setTrackImpressions("");
      setTrackLikes("");
      setTrackRetweets("");
      setTrackReplies("");
      setTrackBookmarks("");
      await fetchMetrics();
    } catch (err) {
      setTrackResult(err instanceof Error ? err.message : "Network error.");
    } finally {
      setTracking(false);
    }
  }

  function startEdit(post: XPost) {
    setEditingTweetId(post.tweet_id);
    setEditFields({
      impressions: String(post.impressions),
      likes: String(post.likes),
      retweets: String(post.retweets),
      replies: String(post.replies),
      bookmarks: String(post.bookmarks),
    });
  }

  function cancelEdit() {
    setEditingTweetId(null);
  }

  async function saveEdit(tweetId: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/growth-ops/track-tweet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetId,
          impressions: parseInt(editFields.impressions) || 0,
          likes: parseInt(editFields.likes) || 0,
          retweets: parseInt(editFields.retweets) || 0,
          replies: parseInt(editFields.replies) || 0,
          bookmarks: parseInt(editFields.bookmarks) || 0,
        }),
      });
      if (res.ok) {
        setEditingTweetId(null);
        await fetchMetrics();
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
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
          "## Weekly Debrief\n\n**What worked:**\n- (Add more tweets and metrics to generate real insights)\n\n**What to stop:**\n- N/A\n\n**What to double down on:**\n- Ship the daily loop consistently for 7 days to generate enough data for real analysis."
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
      {/* Track Tweet + Manual Metrics */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Plus className="h-4 w-4" /> Log Tweet + Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste a tweet URL and enter the numbers you see on X. No API needed — just copy from X analytics.
          </p>

          {/* Row 1: URL + tweet text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tweet URL</Label>
              <Input
                value={trackUrl}
                onChange={(e) => setTrackUrl(e.target.value)}
                placeholder="https://x.com/yourhandle/status/123456789"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tweet text (optional)</Label>
              <Input
                value={trackText}
                onChange={(e) => setTrackText(e.target.value)}
                placeholder="Paste the tweet text for reference"
                className="text-sm"
              />
            </div>
          </div>

          {/* Row 2: Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Eye className="h-3 w-3" /> Impressions</Label>
              <Input
                type="number"
                value={trackImpressions}
                onChange={(e) => setTrackImpressions(e.target.value)}
                placeholder="0"
                className="text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Heart className="h-3 w-3" /> Likes</Label>
              <Input
                type="number"
                value={trackLikes}
                onChange={(e) => setTrackLikes(e.target.value)}
                placeholder="0"
                className="text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Repeat2 className="h-3 w-3" /> Retweets</Label>
              <Input
                type="number"
                value={trackRetweets}
                onChange={(e) => setTrackRetweets(e.target.value)}
                placeholder="0"
                className="text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Replies</Label>
              <Input
                type="number"
                value={trackReplies}
                onChange={(e) => setTrackReplies(e.target.value)}
                placeholder="0"
                className="text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Bookmark className="h-3 w-3" /> Bookmarks</Label>
              <Input
                type="number"
                value={trackBookmarks}
                onChange={(e) => setTrackBookmarks(e.target.value)}
                placeholder="0"
                className="text-sm font-mono"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleTrackTweet}
            disabled={tracking || !trackUrl.trim()}
            className="gap-1"
          >
            {tracking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            Log Tweet
          </Button>

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
            {topPosts.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {topPosts.length} tweets tracked
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
                Use the form above to log tweets with their metrics from X analytics.
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
                  <TableHead className="w-16" />
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

                    {editingTweetId === post.tweet_id ? (
                      <>
                        <TableCell className="text-right">
                          <Input type="number" value={editFields.impressions} onChange={(e) => setEditFields({ ...editFields, impressions: e.target.value })} className="w-20 text-xs font-mono h-7 ml-auto text-right" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" value={editFields.likes} onChange={(e) => setEditFields({ ...editFields, likes: e.target.value })} className="w-16 text-xs font-mono h-7 ml-auto text-right" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" value={editFields.retweets} onChange={(e) => setEditFields({ ...editFields, retweets: e.target.value })} className="w-16 text-xs font-mono h-7 ml-auto text-right" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" value={editFields.replies} onChange={(e) => setEditFields({ ...editFields, replies: e.target.value })} className="w-16 text-xs font-mono h-7 ml-auto text-right" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" value={editFields.bookmarks} onChange={(e) => setEditFields({ ...editFields, bookmarks: e.target.value })} className="w-16 text-xs font-mono h-7 ml-auto text-right" />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => saveEdit(post.tweet_id)} disabled={saving}>
                              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-green-600" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEdit}>
                              <X className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-right font-mono text-sm">{post.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{post.likes}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{post.retweets}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{post.replies}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{post.bookmarks}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => startEdit(post)}>
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <a href={post.tweet_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground mt-1.5" />
                            </a>
                          </div>
                        </TableCell>
                      </>
                    )}
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
