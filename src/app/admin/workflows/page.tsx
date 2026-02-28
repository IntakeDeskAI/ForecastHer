"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Workflow,
  Zap,
  Loader2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { HowItWorks } from "@/components/how-it-works";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  schedule: string;
  steps: { name: string; label: string }[];
  destination: { label: string; href: string };
}

interface RunRecord {
  id: string;
  workflow_id: string;
  status: "running" | "completed" | "failed" | "cancelled";
  started_at: string;
  completed_at: string | null;
  steps_completed: number;
  steps_total: number;
  outputs: Record<string, unknown> | null;
  error: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   WORKFLOW DEFINITIONS (matches API step definitions)
   ═══════════════════════════════════════════════════════════════════════ */

const WORKFLOWS: WorkflowDef[] = [
  {
    id: "market_of_the_day",
    name: "Market of the Day",
    description: "Scan trends → generate market + 4-platform scripts with UTMs → pull current metrics.",
    schedule: "Daily 8 AM",
    steps: [
      { name: "scan_trends", label: "Scan trends (X, Reddit, Google Trends)" },
      { name: "generate_pack", label: "Generate market + scripts via Claude" },
      { name: "fetch_metrics", label: "Pull current metrics" },
    ],
    destination: { label: "Growth Ops", href: "/admin/growth-ops" },
  },
  {
    id: "weekly_digest",
    name: "Weekly Digest",
    description: "Pull week's metrics + analytics → generate email digest draft via Claude.",
    schedule: "Mon 7 AM",
    steps: [
      { name: "fetch_metrics", label: "Pull weekly metrics" },
      { name: "fetch_analytics", label: "Pull analytics summary" },
      { name: "generate_digest", label: "Generate email digest draft" },
    ],
    destination: { label: "Analytics", href: "/admin/analytics" },
  },
  {
    id: "resolution_verifier",
    name: "Resolution Verifier",
    description: "Find markets due for resolution → verify outcomes against sources → generate resolution posts.",
    schedule: "Hourly",
    steps: [
      { name: "fetch_due_markets", label: "Find markets due for resolution" },
      { name: "verify_outcomes", label: "Verify outcomes against sources" },
      { name: "generate_resolution_posts", label: "Generate resolution announcement" },
    ],
    destination: { label: "Markets", href: "/admin/markets" },
  },
  {
    id: "trend_scan",
    name: "Trend Scan",
    description: "Scan X, Reddit, Google Trends, and RSS feeds for emerging women's health topics.",
    schedule: "Daily 6 AM",
    steps: [
      { name: "scan_x", label: "Scan X for women's health trends" },
      { name: "scan_reddit", label: "Scan Reddit and Google Trends" },
      { name: "scan_rss", label: "Scan RSS feeds" },
    ],
    destination: { label: "AI Studio", href: "/admin/ai-studio" },
  },
  {
    id: "engagement_loop",
    name: "Engagement Loop",
    description: "Pull post performance → identify top performers → generate follow-up thread ideas.",
    schedule: "Daily 6 PM",
    steps: [
      { name: "fetch_post_metrics", label: "Pull post performance" },
      { name: "fetch_x_posts", label: "Fetch tracked X posts" },
      { name: "identify_top_performers", label: "Identify top performers" },
      { name: "generate_followup", label: "Generate follow-up thread idea" },
    ],
    destination: { label: "Growth Report", href: "/admin/growth-ops/report" },
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   WORKFLOW CARD
   ═══════════════════════════════════════════════════════════════════════ */

function WorkflowCard({
  workflow,
  runs,
  onRun,
  isActive,
  onToggle,
}: {
  workflow: WorkflowDef;
  runs: RunRecord[];
  onRun: (id: string) => void;
  isActive: boolean;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLastOutput, setShowLastOutput] = useState(false);

  const currentRun = runs.find((r) => r.status === "running");
  const isRunning = !!currentRun;
  const lastRun = runs[0];
  const recentRuns = runs.slice(0, 20);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Workflow className="h-4 w-4 text-purple-600" />
              <h3 className="font-medium text-sm">{workflow.name}</h3>
              <Badge variant={isActive ? "default" : "outline"} className="text-xs">
                {isActive ? "Active" : "Inactive"}
              </Badge>
              {isRunning && (
                <Badge className="bg-blue-100 text-blue-700 text-xs gap-1">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Running
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{workflow.description}</p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {workflow.schedule}
              </span>
              <span>{workflow.steps.length} steps</span>
            </div>

            {/* Live step progress */}
            {isRunning && currentRun && (
              <div className="mt-3 space-y-1.5">
                {workflow.steps.map((step, i) => {
                  const done = i < currentRun.steps_completed;
                  const active = i === currentRun.steps_completed;
                  return (
                    <div key={step.name} className="flex items-center gap-2 text-xs">
                      {done ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : active ? (
                        <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <span className={done ? "text-green-700" : active ? "text-blue-700 font-medium" : "text-muted-foreground"}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-1 pl-5">
                  <Link
                    href={workflow.destination.href}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-purple-600"
                  >
                    Results will appear in {workflow.destination.label}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Last run result + quick links */}
            {!isRunning && lastRun && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-1 text-xs">
                  {lastRun.status === "completed" ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : lastRun.status === "failed" ? (
                    <XCircle className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span className={lastRun.status === "failed" ? "text-red-600" : "text-green-600"}>
                    Last run: {timeAgo(lastRun.started_at)} — {lastRun.status}
                    {lastRun.status === "completed" && ` (${lastRun.steps_completed}/${lastRun.steps_total} steps)`}
                  </span>
                  {lastRun.error && (
                    <span className="text-red-500 ml-1 truncate max-w-[300px]" title={lastRun.error}>
                      {lastRun.error}
                    </span>
                  )}
                </div>
                {lastRun.status === "completed" && (
                  <div className="flex items-center gap-2 pl-4">
                    {lastRun.outputs && Object.keys(lastRun.outputs).length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] px-2 gap-1"
                        onClick={() => setShowLastOutput(!showLastOutput)}
                      >
                        <Eye className="h-3 w-3" />
                        {showLastOutput ? "Hide Output" : "View Output"}
                      </Button>
                    )}
                    <Link
                      href={workflow.destination.href}
                      className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Go to {workflow.destination.label}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}
                {showLastOutput && lastRun.outputs && (
                  <pre className="text-[10px] bg-muted rounded p-2 overflow-x-auto max-h-60 ml-4">
                    {JSON.stringify(lastRun.outputs, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onRun(workflow.id)}
              disabled={isRunning}
            >
              {isRunning ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running&hellip;</>
              ) : (
                <><Play className="h-3 w-3 mr-1" /> Run Now</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={isActive ? "Pause" : "Activate"}
              onClick={() => onToggle(workflow.id)}
            >
              {isActive ? <Pause className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className={`h-3.5 w-3.5 transition-transform ${showSettings ? "rotate-90" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="mt-3 rounded-lg border bg-muted/50 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pipeline Steps</h4>
            <div className="space-y-1">
              {workflow.steps.map((step, i) => (
                <div key={step.name} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-mono w-4">{i + 1}.</span>
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground font-mono">({step.name})</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t">
              <div>
                <span className="text-muted-foreground">Schedule</span>
                <p className="font-semibold">{workflow.schedule}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total runs</span>
                <p className="font-semibold">{runs.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Run History */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-xs w-full"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${expanded ? "rotate-90" : ""}`} />
          Run History ({recentRuns.length})
        </Button>

        {expanded && (
          <div className="mt-2 rounded-lg border overflow-hidden">
            {recentRuns.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No runs yet. Click &quot;Run Now&quot; to execute this workflow.
              </div>
            ) : (
              <div className="divide-y">
                {recentRuns.map((run) => (
                  <RunRow key={run.id} run={run} stepsTotal={workflow.steps.length} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RunRow({ run, stepsTotal }: { run: RunRecord; stepsTotal: number }) {
  const [showOutput, setShowOutput] = useState(false);
  const hasOutput = run.outputs && Object.keys(run.outputs).length > 0;

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 text-xs">
        {run.status === "completed" ? (
          <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
        ) : run.status === "failed" ? (
          <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
        ) : run.status === "running" ? (
          <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin shrink-0" />
        ) : (
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="font-medium">{timeAgo(run.started_at)}</span>
        <Badge
          variant="outline"
          className={`text-[10px] ${
            run.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
            run.status === "failed" ? "bg-red-50 text-red-600 border-red-200" :
            run.status === "running" ? "bg-blue-50 text-blue-600 border-blue-200" : ""
          }`}
        >
          {run.status}
        </Badge>
        <span className="text-muted-foreground">{run.steps_completed}/{stepsTotal} steps</span>
        {run.completed_at && (
          <span className="text-muted-foreground ml-auto">
            {duration(run.started_at, run.completed_at)}
          </span>
        )}
        {hasOutput && (
          <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 ml-auto" onClick={() => setShowOutput(!showOutput)}>
            {showOutput ? "Hide" : "Output"}
          </Button>
        )}
      </div>
      {run.error && (
        <p className="text-xs text-red-500 mt-1 pl-6">{run.error}</p>
      )}
      {showOutput && run.outputs && (
        <pre className="text-[10px] bg-muted rounded p-2 mt-2 overflow-x-auto max-h-40">
          {JSON.stringify(run.outputs, null, 2)}
        </pre>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function duration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function WorkflowsPage() {
  const [runsByWorkflow, setRunsByWorkflow] = useState<Record<string, RunRecord[]>>({});
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [noTable, setNoTable] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fh_workflows_state");
      if (saved) setActiveIds(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/workflows/run?limit=20");
      if (!res.ok) {
        setNoTable(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const runs: RunRecord[] = data.runs ?? [];

      const grouped: Record<string, RunRecord[]> = {};
      for (const run of runs) {
        if (!grouped[run.workflow_id]) grouped[run.workflow_id] = [];
        grouped[run.workflow_id].push(run);
      }
      setRunsByWorkflow(grouped);
      setNoTable(false);
    } catch {
      setNoTable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Poll while any workflow is running
  useEffect(() => {
    const hasRunning = Object.values(runsByWorkflow).some((runs) =>
      runs.some((r) => r.status === "running")
    );
    if (!hasRunning) return;
    const interval = setInterval(fetchRuns, 2000);
    return () => clearInterval(interval);
  }, [runsByWorkflow, fetchRuns]);

  async function handleRun(workflowId: string) {
    // Optimistically show running state
    setRunsByWorkflow((prev) => ({
      ...prev,
      [workflowId]: [
        {
          id: "temp-" + Date.now(),
          workflow_id: workflowId,
          status: "running" as const,
          started_at: new Date().toISOString(),
          completed_at: null,
          steps_completed: 0,
          steps_total: WORKFLOWS.find((w) => w.id === workflowId)?.steps.length ?? 1,
          outputs: null,
          error: null,
        },
        ...(prev[workflowId] ?? []),
      ],
    }));

    try {
      await fetch("/api/admin/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId }),
      });
    } catch {
      // Will show on refetch
    }
    await fetchRuns();
  }

  function handleToggle(id: string) {
    setActiveIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("fh_workflows_state", JSON.stringify(next));
        localStorage.setItem("fh_workflows_active_count", String(next.length));
      } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Automated pipelines that call your real APIs — trend scanning, content generation, metric pulls.
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-xs ${noTable ? "border-amber-200 bg-amber-50 text-amber-700" : "border-green-200 bg-green-50 text-green-700"}`}
        >
          {noTable ? "DB: Run Migration" : "Live Execution"}
        </Badge>
      </div>

      {noTable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Run the workflow_runs migration</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Workflows execute real API calls but need the <code className="bg-amber-100 px-1 rounded">workflow_runs</code> table to store history.
              Run <code className="bg-amber-100 px-1 rounded">004_workflow_runs.sql</code> in Supabase SQL Editor.
            </p>
          </div>
        </div>
      )}

      <HowItWorks
        steps={[
          "Click \"Run Now\" to execute a workflow. Each step calls real ForecastHer APIs — trends, Claude AI generation, analytics, X post metrics.",
          "Market of the Day: Scans trends → generates market + 4-platform scripts (X, IG, TikTok, LinkedIn) with UTMs → pulls metrics.",
          "Weekly Digest: Pulls week's analytics → generates email digest draft via Claude AI.",
          "Engagement Loop: Pulls X post metrics → identifies top performers → generates follow-up thread ideas.",
          "Run history persists in the database. Click \"Run History\" on any workflow to see past results with full output.",
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {WORKFLOWS.map((w) => (
            <WorkflowCard
              key={w.id}
              workflow={w}
              runs={runsByWorkflow[w.id] ?? []}
              onRun={handleRun}
              isActive={activeIds.includes(w.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
