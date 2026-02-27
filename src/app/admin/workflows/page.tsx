"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkflowDefinition, WorkflowRun } from "@/lib/types";
import {
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  Workflow,
  Zap,
  Loader2,
} from "lucide-react";
import { HowItWorks } from "@/components/how-it-works";

type WorkflowData = WorkflowDefinition & {
  steps_count: number;
  last_run?: WorkflowRun;
  last_run_label?: string;
};

const INITIAL_WORKFLOWS: WorkflowData[] = [
  {
    id: "market_of_the_day",
    name: "Market of the Day",
    description: "Scan trends, propose markets, generate drafts for all platforms, run compliance checks, and schedule or flag for review.",
    schedule: "0 8 * * *",
    is_active: false,
    config: {},
    created_at: "2026-02-25",
    steps_count: 11,
  },
  {
    id: "weekly_digest",
    name: "Weekly Digest",
    description: "Pull analytics, select top markets from the week, draft email, and queue for review.",
    schedule: "0 7 * * 1",
    is_active: false,
    config: {},
    created_at: "2026-02-25",
    steps_count: 5,
  },
  {
    id: "resolution_verifier",
    name: "Resolution Verifier",
    description: "Check for markets due for resolution, verify outcomes against sources, generate resolved posts and assets.",
    schedule: "0 * * * *",
    is_active: false,
    config: {},
    created_at: "2026-02-25",
    steps_count: 6,
  },
  {
    id: "trend_scan",
    name: "Trend Scan",
    description: "Scan X, Reddit, Google Trends, and RSS feeds for emerging topics in women's health and femtech.",
    schedule: "0 6 * * *",
    is_active: false,
    config: {},
    created_at: "2026-02-25",
    steps_count: 3,
  },
  {
    id: "engagement_loop",
    name: "Engagement Loop",
    description: "Monitor post performance, identify top-performing content, and suggest follow-up posts or threads.",
    schedule: "0 18 * * *",
    is_active: false,
    config: {},
    created_at: "2026-02-25",
    steps_count: 4,
  },
];

function WorkflowCard({
  workflow,
  onToggleActive,
  onRunComplete,
}: {
  workflow: WorkflowData;
  onToggleActive: (id: string) => void;
  onRunComplete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function handleRunNow() {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      onRunComplete(workflow.id);
    }, 1500);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Workflow className="h-4 w-4 text-purple-dark" />
              <h3 className="font-medium text-sm">{workflow.name}</h3>
              <Badge
                variant={workflow.is_active ? "default" : "outline"}
                className="text-xs"
              >
                {workflow.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{workflow.description}</p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {workflow.schedule || "Manual"}
              </span>
              <span>{workflow.steps_count} steps</span>
            </div>
            {workflow.last_run_label && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Last run: {workflow.last_run_label} &mdash; completed
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleRunNow}
              disabled={running}
            >
              {running ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running&hellip;
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" /> Run Now
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={workflow.is_active ? "Pause" : "Activate"}
              onClick={() => onToggleActive(workflow.id)}
            >
              {workflow.is_active ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Configure"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className={`h-3.5 w-3.5 transition-transform ${showSettings ? "rotate-90" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Settings section */}
        {showSettings && (
          <div className="mt-3 rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workflow Settings</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Schedule (cron)</span>
                <p className="font-mono font-semibold">{workflow.schedule || "Manual"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Steps</span>
                <p className="font-semibold">{workflow.steps_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-semibold">{workflow.created_at}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-semibold">{workflow.is_active ? "Active" : "Inactive"}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Full configuration editing will be available once OpenClaw is connected.
            </p>
          </div>
        )}

        {/* Expandable run history */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-xs w-full"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${expanded ? "rotate-90" : ""}`} />
          Last 20 Runs
        </Button>

        {expanded && (
          <div className="mt-2 rounded-lg border border-border overflow-hidden">
            {workflow.last_run_label ? (
              <div className="p-3">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-medium">Manual run</span>
                  <span className="text-muted-foreground">&mdash; {workflow.last_run_label}</span>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">completed</Badge>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No runs yet. Click &quot;Run Now&quot; to execute this workflow.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>(() => {
    // Restore persisted active states from localStorage
    if (typeof window === "undefined") return INITIAL_WORKFLOWS;
    try {
      const saved = localStorage.getItem("fh_workflows_state");
      if (saved) {
        const activeIds: string[] = JSON.parse(saved);
        return INITIAL_WORKFLOWS.map((w) => ({
          ...w,
          is_active: activeIds.includes(w.id),
        }));
      }
    } catch { /* ignore */ }
    return INITIAL_WORKFLOWS;
  });

  function persistWorkflowState(updated: WorkflowData[]) {
    try {
      const activeIds = updated.filter((w) => w.is_active).map((w) => w.id);
      localStorage.setItem("fh_workflows_state", JSON.stringify(activeIds));
      localStorage.setItem("fh_workflows_active_count", String(activeIds.length));
    } catch { /* ignore */ }
  }

  function handleToggleActive(id: string) {
    setWorkflows((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, is_active: !w.is_active } : w
      );
      persistWorkflowState(updated);
      return updated;
    });
  }

  function handleRunComplete(id: string) {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, last_run_label: "just now" } : w
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            OpenClaw-powered automation pipelines for content generation and market management.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          OpenClaw: Not Connected
        </Badge>
      </div>

      <HowItWorks
        steps={[
          "Each workflow is an automated pipeline that runs on a cron schedule. Toggle workflows on/off with the lightning bolt icon, or click \"Run Now\" to execute immediately.",
          "Market of the Day (8 AM daily): Scans trends, proposes markets, generates drafts for all platforms, runs compliance checks, and schedules or flags for review.",
          "Weekly Digest (Mon 7 AM): Pulls analytics, selects top markets, drafts an email, and queues for review.",
          "Trend Scan (6 AM daily): Scans X, Reddit, Google Trends, and RSS feeds for emerging topics in women's health and femtech.",
          "Click \"Last 20 Runs\" on any workflow to see execution history, success/failure status, and duration.",
        ]}
      />

      <div className="space-y-4">
        {workflows.map((w) => (
          <WorkflowCard
            key={w.id}
            workflow={w}
            onToggleActive={handleToggleActive}
            onRunComplete={handleRunComplete}
          />
        ))}
      </div>
    </div>
  );
}
