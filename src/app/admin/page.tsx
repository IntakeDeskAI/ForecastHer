"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
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
  Key,
  Mail,
  Workflow,
  Search,
  ArrowRight,
  XCircle,
  Gauge,
  Shield,
  Wifi,
  CalendarCheck,
  BarChart3,
} from "lucide-react";
import { HowItWorks } from "@/components/how-it-works";

// ── System State Detection ──────────────────────────────────────────

// In production these would come from API/DB. For now, derive from static config.
function getSystemState() {
  const tokensConnected = 0; // No platform tokens configured
  const emailConfigured = false;
  const workflowsEnabled = 0; // No workflows active
  const firstTrendScanRun = false; // No completed trend scans

  const setupComplete =
    tokensConnected > 0 &&
    emailConfigured &&
    workflowsEnabled > 0 &&
    firstTrendScanRun;

  return {
    tokensConnected,
    emailConfigured,
    workflowsEnabled,
    firstTrendScanRun,
    setupComplete,
    setupProgress: [tokensConnected > 0, emailConfigured, workflowsEnabled > 0, firstTrendScanRun].filter(Boolean).length,
  };
}

// ── Setup Checklist ─────────────────────────────────────────────────

const SETUP_STEPS = [
  {
    id: "tokens",
    label: "Connect at least one platform token",
    description: "Link your X, Instagram, TikTok, or LinkedIn account for automated posting.",
    href: "/admin/settings",
    linkLabel: "Go to Tokens",
    check: (s: ReturnType<typeof getSystemState>) => s.tokensConnected > 0,
  },
  {
    id: "email",
    label: "Configure email provider",
    description: "Set up your email service for weekly digests and notifications.",
    href: "/admin/settings",
    linkLabel: "Configure Email",
    check: (s: ReturnType<typeof getSystemState>) => s.emailConfigured,
  },
  {
    id: "workflows",
    label: "Enable at least one workflow schedule",
    description: "Activate Market of the Day, Weekly Digest, or Trend Scan automation.",
    href: "/admin/workflows",
    linkLabel: "Go to Workflows",
    check: (s: ReturnType<typeof getSystemState>) => s.workflowsEnabled > 0,
  },
  {
    id: "trend_scan",
    label: "Run your first trend scan",
    description: "Scan trends to populate your market inbox with AI-proposed questions.",
    href: "/admin/ai-studio",
    linkLabel: "Open AI Studio",
    check: (s: ReturnType<typeof getSystemState>) => s.firstTrendScanRun,
  },
];

function SetupRequiredBanner() {
  const state = getSystemState();

  return (
    <Card className="border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Setup Required</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete these steps before the system can operate.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-amber-600">{state.setupProgress}</span>
            <span className="text-sm text-muted-foreground">/4</span>
          </div>
        </div>
        <Progress value={(state.setupProgress / 4) * 100} className="mt-3 h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {SETUP_STEPS.map((step) => {
          const done = step.check(state);
          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                done
                  ? "border-green-200 bg-green-50/50 dark:bg-green-950/20"
                  : "border-amber-200 bg-white dark:bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                {done ? (
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {!done && (
                <Link href={step.href}>
                  <Button size="sm" variant="outline" className="text-xs gap-1 shrink-0">
                    {step.linkLabel} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Operator Loop Blocks ────────────────────────────────────────────

function ContentVelocityBlock() {
  const scheduledThisWeek = 0;
  const weeklyGoal = 14; // 2 per day
  const pct = weeklyGoal > 0 ? Math.round((scheduledThisWeek / weeklyGoal) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" /> Content Velocity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold">{scheduledThisWeek}</span>
            <span className="text-sm text-muted-foreground ml-1">/ {weeklyGoal}</span>
          </div>
          <span className="text-xs text-muted-foreground">posts this week</span>
        </div>
        <Progress value={pct} className="h-2" />
        {scheduledThisWeek === 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            No posts scheduled. Content pipeline is idle.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ComplianceScoreBlock() {
  // In production: (drafts with citations + disclosure) / total drafts
  const totalDrafts = 0;
  const passingDrafts = 0;
  const score = totalDrafts > 0 ? Math.round((passingDrafts / totalDrafts) * 100) : 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Shield className="h-4 w-4" /> Compliance Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className={`text-3xl font-bold ${score >= 90 ? "text-green-600" : score >= 70 ? "text-amber-600" : "text-red-600"}`}>
              {score}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">citations + disclosure</span>
        </div>
        <Progress value={score} className="h-2" />
        {totalDrafts === 0 && (
          <p className="text-xs text-muted-foreground">No drafts to evaluate yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SystemReadinessBlock() {
  const state = getSystemState();
  const checks = [
    { label: "Platform tokens", ok: state.tokensConnected > 0, detail: state.tokensConnected > 0 ? `${state.tokensConnected} connected` : "None connected" },
    { label: "Email provider", ok: state.emailConfigured, detail: state.emailConfigured ? "Configured" : "Not configured" },
    { label: "Workflows", ok: state.workflowsEnabled > 0, detail: state.workflowsEnabled > 0 ? `${state.workflowsEnabled} active` : "None active" },
    { label: "Sources configured", ok: true, detail: "7 whitelisted domains" }, // From AI Studio sample data
  ];
  const readyCount = checks.filter((c) => c.ok).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Wifi className="h-4 w-4" /> System Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {check.ok ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
              <span>{check.label}</span>
            </div>
            <span className={`text-xs ${check.ok ? "text-muted-foreground" : "text-red-500 font-medium"}`}>
              {check.detail}
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-border mt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Overall</span>
            <Badge variant={readyCount === checks.length ? "default" : "destructive"} className="text-xs">
              {readyCount}/{checks.length} ready
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Context-Aware Quick Actions ─────────────────────────────────────

function ContextAwareActions() {
  const state = getSystemState();

  // Determine primary action based on system state
  let primaryAction: { label: string; icon: React.ReactNode; href: string; description: string };
  let secondaryActions: { label: string; icon: React.ReactNode; href: string }[];

  if (state.tokensConnected === 0) {
    primaryAction = {
      label: "Connect a Platform",
      icon: <Key className="h-4 w-4" />,
      href: "/admin/settings",
      description: "No tokens connected. Connect a platform to enable posting.",
    };
    secondaryActions = [
      { label: "Run Trend Scan", icon: <Search className="h-4 w-4" />, href: "/admin/ai-studio" },
      { label: "Configure Workflows", icon: <Workflow className="h-4 w-4" />, href: "/admin/workflows" },
    ];
  } else if (!state.firstTrendScanRun) {
    primaryAction = {
      label: "Run Trend Scan",
      icon: <Search className="h-4 w-4" />,
      href: "/admin/ai-studio",
      description: "No markets yet. Run a trend scan to populate your inbox.",
    };
    secondaryActions = [
      { label: "Configure Workflows", icon: <Workflow className="h-4 w-4" />, href: "/admin/workflows" },
      { label: "Review Tokens", icon: <Key className="h-4 w-4" />, href: "/admin/settings" },
    ];
  } else {
    // System is more set up - show operational actions
    primaryAction = {
      label: "Generate Today's Content",
      icon: <Sparkles className="h-4 w-4" />,
      href: "/admin/ai-studio",
      description: "Generate market proposals and draft content for today.",
    };
    secondaryActions = [
      { label: "Review & Schedule", icon: <CalendarCheck className="h-4 w-4" />, href: "/admin/content" },
      { label: "Pause All Posting", icon: <Pause className="h-4 w-4" />, href: "/admin/settings" },
      { label: "Run Weekly Digest", icon: <Play className="h-4 w-4" />, href: "/admin/workflows" },
    ];
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary action - prominent */}
        <Link href={primaryAction.href}>
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/30 cursor-pointer transition-colors">
            <div className="h-10 w-10 rounded-lg gradient-purple text-white flex items-center justify-center shrink-0">
              {primaryAction.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{primaryAction.label}</p>
              <p className="text-xs text-muted-foreground">{primaryAction.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </Link>

        {/* Secondary actions */}
        <div className="flex flex-wrap gap-2">
          {secondaryActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                {action.icon}
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── KPI Cards (unchanged data, same layout) ─────────────────────────

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
  next_post: { x: "\u2014", instagram: "\u2014", tiktok: "\u2014", linkedin: "\u2014" },
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

// ── Main Page ───────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const state = getSystemState();

  return (
    <div className="space-y-6">
      {/* Header with honest status badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Command Center</h1>
          <p className="text-sm text-muted-foreground">
            System overview &mdash; answer &quot;is it working?&quot; in 10 seconds.
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-xs ${
            state.setupComplete
              ? ""
              : "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
          }`}
        >
          <span className={`mr-1.5 h-2 w-2 rounded-full inline-block ${
            state.setupComplete ? "bg-green-500" : "bg-amber-500 animate-pulse"
          }`} />
          {state.setupComplete ? "Operational" : "Setup Required"}
        </Badge>
      </div>

      <HowItWorks
        steps={[
          "Check the status badge (top-right): green = operational, amber = setup needed.",
          "Complete the Setup Checklist: connect a platform token, configure email, enable a workflow, and run your first trend scan.",
          "Monitor the three operator blocks: Content Velocity (are we posting enough?), Compliance Score (are posts safe?), System Readiness (is everything connected?).",
          "Review KPI cards for queue health, growth, risk flags, and upcoming posts.",
          "Use Quick Actions (bottom) — they change based on what needs attention next.",
        ]}
      />

      {/* Setup Required Banner - takes over until complete */}
      {!state.setupComplete && <SetupRequiredBanner />}

      {/* Operator Loop: 3 new blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContentVelocityBlock />
        <ComplianceScoreBlock />
        <SystemReadinessBlock />
      </div>

      {/* Original KPI row */}
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
              <Badge
                variant="outline"
                className={`text-xs w-full justify-center ${
                  POSTING.tokens_status === "not_configured"
                    ? "border-red-200 bg-red-50 text-red-600 dark:bg-red-950/20"
                    : ""
                }`}
              >
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
            {ALERTS.length === 0 && state.setupComplete ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-3 opacity-50 text-green-500" />
                <p className="text-sm">All clear. No active alerts.</p>
              </div>
            ) : ALERTS.length === 0 && !state.setupComplete ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-50 text-amber-500" />
                <p className="text-sm font-medium text-amber-600">System not operational</p>
                <p className="text-xs mt-1">Complete setup checklist above to activate monitoring.</p>
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

      {/* Context-Aware Quick Actions */}
      <ContextAwareActions />
    </div>
  );
}
