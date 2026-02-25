"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Clock,
  AlertTriangle,
  TrendingUp,
  MousePointerClick,
  UserPlus,
  ShieldAlert,
  FileWarning,
  BookX,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Pause,
  Play,
} from "lucide-react";

// Static placeholder data for dev mode
const QUEUE_HEALTH = {
  drafts_ready: 0,
  awaiting_review: 0,
  scheduled_24h: 0,
  failed_24h: 0,
};

const GROWTH = {
  waitlist_today: 0,
  ctr_today: "0%",
  follower_change: "+0",
};

const RISK = {
  needs_review: 0,
  missing_citations: 0,
  disclosure_missing: 0,
  source_stale: 0,
};

const POSTING = {
  next_post: { x: "—", instagram: "—", tiktok: "—", linkedin: "—" },
  tokens_status: "not_configured" as const,
};

const ALERTS: {
  id: string;
  type: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "error";
  time: string;
}[] = [];

const TIMELINE: {
  time: string;
  posts: { platform: string; title: string; status: string }[];
}[] = [];

export default function CommandCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Command Center</h1>
          <p className="text-sm text-muted-foreground">
            System overview — answer &quot;is it working?&quot; in 10 seconds.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 inline-block" />
          Normal
        </Badge>
      </div>

      {/* Top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Queue Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Queue Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Drafts ready</span>
              <span className="font-mono font-semibold">{QUEUE_HEALTH.drafts_ready}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Awaiting review</span>
              <span className="font-mono font-semibold">{QUEUE_HEALTH.awaiting_review}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Scheduled (24h)</span>
              <span className="font-mono font-semibold">{QUEUE_HEALTH.scheduled_24h}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Failed (24h)</span>
              <span className={`font-mono font-semibold ${QUEUE_HEALTH.failed_24h > 0 ? "text-destructive" : ""}`}>
                {QUEUE_HEALTH.failed_24h}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><UserPlus className="h-3 w-3" /> Waitlist today</span>
              <span className="font-mono font-semibold">{GROWTH.waitlist_today}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> CTR today</span>
              <span className="font-mono font-semibold">{GROWTH.ctr_today}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Follower change</span>
              <span className="font-mono font-semibold">{GROWTH.follower_change}</span>
            </div>
          </CardContent>
        </Card>

        {/* Risk */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Needs review</span>
              <span className="font-mono font-semibold">{RISK.needs_review}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><FileWarning className="h-3 w-3" /> Missing citations</span>
              <span className="font-mono font-semibold">{RISK.missing_citations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><BookX className="h-3 w-3" /> Disclosure missing</span>
              <span className="font-mono font-semibold">{RISK.disclosure_missing}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Source stale</span>
              <span className="font-mono font-semibold">{RISK.source_stale}</span>
            </div>
          </CardContent>
        </Card>

        {/* Posting */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Posting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(POSTING.next_post).map(([platform, time]) => (
              <div key={platform} className="flex justify-between text-sm">
                <span className="capitalize">{platform}</span>
                <span className="font-mono text-muted-foreground text-xs">{time}</span>
              </div>
            ))}
            <div className="pt-1">
              <Badge variant="outline" className="text-xs w-full justify-center">
                Tokens: {POSTING.tokens_status === "not_configured" ? "Not configured" : "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content: Timeline + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today&apos;s Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {TIMELINE.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No posts scheduled for today.</p>
                <p className="text-xs mt-1">Run &quot;Generate today content&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {TIMELINE.map((slot) => (
                  <div key={slot.time} className="flex gap-3 text-sm">
                    <span className="font-mono text-muted-foreground w-14 shrink-0">{slot.time}</span>
                    <div className="flex flex-wrap gap-2">
                      {slot.posts.map((post, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {post.platform}: {post.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ALERTS.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-50 text-green-500" />
                <p className="text-sm">All clear. No active alerts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3 text-sm ${
                      alert.severity === "error"
                        ? "border-destructive/30 bg-destructive/5"
                        : alert.severity === "warning"
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-border"
                    }`}
                  >
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.detail}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="gradient-purple text-white" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Today Content
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Safe Drafts
            </Button>
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause All Posting
            </Button>
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Run Weekly Digest Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
