"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { Platform } from "@/lib/types";
import {
  Calendar as CalendarIcon,
  List,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Eye,
  XCircle,
  ArrowRight,
  ExternalLink,
  Key,
  Sparkles,
} from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PLATFORMS: Platform[] = ["x", "instagram", "tiktok", "linkedin", "email"];

// Extended queue entry with failure details
type QueueEntry = {
  id: string;
  draft_id: string;
  platform: Platform;
  scheduled_at: string;
  posted_at: string | null;
  status: "scheduled" | "posting" | "posted" | "failed" | "paused";
  retry_count: number;
  content_preview: string;
  failure_reason?: string;
  next_retry_at?: string;
  max_retries: number;
  token_error?: boolean;
  post_url?: string;
};

// Sample queue data for demonstration
const SAMPLE_QUEUE: QueueEntry[] = [
  {
    id: "sp-1",
    draft_id: "d-1",
    platform: "x",
    scheduled_at: "2026-02-26T10:00:00Z",
    status: "failed",
    retry_count: 2,
    posted_at: null,
    content_preview: "Will the FDA approve an OTC birth control pill by July 2026?",
    failure_reason: "Authentication failed: token expired or revoked. Re-authorize your X account.",
    next_retry_at: "2026-02-26T10:15:00Z",
    max_retries: 3,
    token_error: true,
  },
  {
    id: "sp-2",
    draft_id: "d-2",
    platform: "instagram",
    scheduled_at: "2026-02-26T12:00:00Z",
    status: "scheduled",
    retry_count: 0,
    posted_at: null,
    content_preview: "Major US employers expanding fertility benefits in Q1 2026",
    max_retries: 3,
  },
  {
    id: "sp-3",
    draft_id: "d-3",
    platform: "x",
    scheduled_at: "2026-02-26T14:00:00Z",
    status: "failed",
    retry_count: 3,
    posted_at: null,
    content_preview: "Menopause startup funding tracker: $100M milestone?",
    failure_reason: "Rate limit exceeded. API returned 429 after 3 retries. Manual retry required.",
    max_retries: 3,
  },
  {
    id: "sp-4",
    draft_id: "d-4",
    platform: "linkedin",
    scheduled_at: "2026-02-26T09:00:00Z",
    status: "posted",
    retry_count: 0,
    posted_at: "2026-02-26T09:00:12Z",
    post_url: "https://linkedin.com/posts/example",
    content_preview: "New non-hormonal menopause treatments on the horizon",
    max_retries: 3,
  },
  {
    id: "sp-5",
    draft_id: "d-5",
    platform: "instagram",
    scheduled_at: "2026-02-26T16:00:00Z",
    status: "paused",
    retry_count: 0,
    posted_at: null,
    content_preview: "FemTech funding hits record highs \u2014 what does it mean?",
    max_retries: 3,
  },
];

function CalendarView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">This Week</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            &larr; Prev
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Today
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Next &rarr;
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden min-w-[700px]">
          {/* Header */}
          <div className="bg-muted p-2 text-xs font-medium text-muted-foreground">Platform</div>
          {DAYS.map((day) => (
            <div key={day} className="bg-muted p-2 text-xs font-medium text-center text-muted-foreground">
              {day}
            </div>
          ))}
          {/* Rows per platform */}
          {PLATFORMS.map((platform) => (
            <>
              <div key={`${platform}-label`} className="bg-card p-2 text-xs font-medium capitalize border-t border-border">
                {platform}
              </div>
              {DAYS.map((day) => (
                <div
                  key={`${platform}-${day}`}
                  className="bg-card p-2 min-h-[60px] border-t border-border text-center"
                >
                  <span className="text-xs text-muted-foreground">&mdash;</span>
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

function QueueView() {
  const [posts, setPosts] = useState(SAMPLE_QUEUE);
  const [filter, setFilter] = useState<string>("all");

  const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.status === filter);
  const failedCount = posts.filter((p) => p.status === "failed").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[
            { key: "all", label: "All", count: posts.length },
            { key: "scheduled", label: "Scheduled", count: posts.filter((p) => p.status === "scheduled").length },
            { key: "posted", label: "Posted", count: posts.filter((p) => p.status === "posted").length },
            { key: "failed", label: "Failed", count: failedCount },
            { key: "paused", label: "Paused", count: posts.filter((p) => p.status === "paused").length },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              className={`text-xs gap-1 ${f.key === "failed" && f.count > 0 ? "border-red-300 text-red-600" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.count > 0 && (
                <Badge variant="secondary" className="text-xs ml-1 h-4 min-w-[16px] justify-center">
                  {f.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <RotateCcw className="h-3 w-3" /> Retry All Failed
        </Button>
      </div>

      {/* Failed posts alert */}
      {failedCount > 0 && filter !== "failed" && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">
              {failedCount} post{failedCount > 1 ? "s" : ""} failed to publish
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setFilter("failed")}
          >
            View Failed
          </Button>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-10 text-center">
            <Clock className="h-10 w-10 mx-auto mb-3 text-purple-400" />
            <h3 className="font-semibold text-base">No posts in queue</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Approve drafts in Content Studio to add them to the schedule, or run the quickstart to generate content end-to-end.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <Link href="/admin/content">
                <Button size="sm" className="gradient-purple text-white text-xs gap-1">
                  <Sparkles className="h-3 w-3" /> Go to Content Studio
                </Button>
              </Link>
              <Link href="/admin/ai-studio">
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  Run Quickstart
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className={`${
                post.status === "failed"
                  ? "border-red-200 dark:border-red-900/50"
                  : post.status === "posted"
                  ? "border-green-200 dark:border-green-900/50"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.status === "posted" && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {post.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                      {post.status === "scheduled" && <Clock className="h-4 w-4 text-blue-500" />}
                      {post.status === "paused" && <Pause className="h-4 w-4 text-gray-400" />}
                      <Badge variant="outline" className="text-xs capitalize">{post.platform}</Badge>
                      <ScheduleStatusBadge status={post.status} />
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(post.scheduled_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Content preview */}
                    <p className="text-sm mt-1 truncate">{post.content_preview}</p>

                    {/* Failure detail block */}
                    {post.status === "failed" && post.failure_reason && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-red-700 dark:text-red-400">Failure Reason</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{post.failure_reason}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Retry count</span>
                            <p className="font-mono font-semibold">
                              {post.retry_count}/{post.max_retries}
                              {post.retry_count >= post.max_retries && (
                                <span className="text-red-500 ml-1">(exhausted)</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next retry</span>
                            <p className="font-mono font-semibold">
                              {post.next_retry_at
                                ? new Date(post.next_retry_at).toLocaleTimeString()
                                : post.retry_count >= post.max_retries
                                ? "Manual only"
                                : "\u2014"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Token issue</span>
                            <p className="font-semibold">
                              {post.token_error ? (
                                <span className="text-red-500">Yes</span>
                              ) : (
                                <span className="text-muted-foreground">No</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Posted success */}
                    {post.status === "posted" && post.posted_at && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Posted at {new Date(post.posted_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {post.status === "failed" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                          title="Retry now"
                        >
                          <RotateCcw className="h-3 w-3" /> Retry
                        </Button>
                        {post.token_error && (
                          <Link href="/admin/settings">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs gap-1"
                              title="Fix token"
                            >
                              <Key className="h-3 w-3" /> Fix Token
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                    {post.status === "scheduled" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Pause">
                        <Pause className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {post.status === "paused" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Resume">
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {post.status === "posted" && post.post_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View post">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleStatusBadge({ status }: { status: QueueEntry["status"] }) {
  const variants: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    posting: "bg-yellow-100 text-yellow-700",
    posted: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    paused: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={`text-xs capitalize ${variants[status]}`}>
      {status}
    </Badge>
  );
}

export default function SchedulerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Scheduler</h1>
        <p className="text-sm text-muted-foreground">
          Calendar and queue view for scheduled posts across all platforms.
        </p>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="queue">
            <List className="h-3.5 w-3.5 mr-1" /> Queue
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          <CalendarView />
        </TabsContent>
        <TabsContent value="queue" className="mt-4">
          <QueueView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
