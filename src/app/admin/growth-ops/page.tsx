"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Flame,
  Sparkles,
  Rocket,
  Send,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  UserPlus,
  MousePointerClick,
  BarChart3,
  Zap,
  Play,
  Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  deepLink?: string;
  requiredCount?: number;
  completedCount?: number;
}

interface PhaseData {
  id: string;
  title: string;
  items: ChecklistItem[];
  primaryAction: string;
  primaryLink: string;
  secondaryAction: string;
  secondaryLink?: string;
  microcopy: string;
}

interface Blocker {
  id: string;
  message: string;
  severity: "warning" | "error";
}

interface Streak {
  type: string;
  count: number;
}

/* ═══════════════════════════════════════════════════════════════════════
   INITIAL STATE (will be replaced by DB queries)
   ═══════════════════════════════════════════════════════════════════════ */

const INITIAL_PHASES: PhaseData[] = [
  {
    id: "create",
    title: "Create",
    items: [
      { id: "c1", label: "Select Market of the Day", done: false, deepLink: "/markets" },
      { id: "c2", label: "Generate card image", done: false, deepLink: "/content" },
      { id: "c3", label: "Generate platform scripts", done: false, deepLink: "/content" },
      { id: "c4", label: "Generate UTM links", done: false, deepLink: "/growth-ops/assets" },
    ],
    primaryAction: "Generate Today Pack",
    primaryLink: "/growth-ops/assets",
    secondaryAction: "Pick a market manually",
    secondaryLink: "/markets",
    microcopy: "Done when you have 1 market, 1 image, 4 scripts, 4 UTMs.",
  },
  {
    id: "publish",
    title: "Publish",
    items: [
      { id: "p1", label: "Post to X", done: false, deepLink: "/growth-ops/publish" },
      { id: "p2", label: "Post to Instagram", done: false, deepLink: "/growth-ops/publish" },
      { id: "p3", label: "Post to TikTok", done: false, deepLink: "/growth-ops/publish" },
      { id: "p4", label: "Post to LinkedIn", done: false, deepLink: "/growth-ops/publish" },
    ],
    primaryAction: "Open Publish",
    primaryLink: "/growth-ops/publish",
    secondaryAction: "Send all to Scheduler",
    secondaryLink: "/scheduler",
    microcopy: "Done when all four are Scheduled or Posted.",
  },
  {
    id: "distribute",
    title: "Distribute",
    items: [
      { id: "d1", label: "X comments", done: false, requiredCount: 20, completedCount: 0, deepLink: "/growth-ops/distribute" },
      { id: "d2", label: "LinkedIn comments", done: false, requiredCount: 10, completedCount: 0, deepLink: "/growth-ops/distribute" },
      { id: "d3", label: "DMs", done: false, requiredCount: 10, completedCount: 0, deepLink: "/growth-ops/distribute" },
      { id: "d4", label: "Reddit replies", done: false, requiredCount: 5, completedCount: 0, deepLink: "/growth-ops/distribute" },
    ],
    primaryAction: "Open Distribute Queue",
    primaryLink: "/growth-ops/distribute",
    secondaryAction: "Generate comment suggestions",
    microcopy: "Done when counts hit target. Quality beats volume, but volume is the floor.",
  },
];

const PHASE_ICONS: Record<string, React.ReactNode> = {
  create: <Sparkles className="h-5 w-5" />,
  publish: <Send className="h-5 w-5" />,
  distribute: <MessageSquare className="h-5 w-5" />,
};

const PHASE_COLORS: Record<string, string> = {
  create: "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20",
  publish: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
  distribute: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
};

export default function GrowthOpsTodayPage() {
  const { toast } = useToast();
  const [phases, setPhases] = useState<PhaseData[]>(INITIAL_PHASES);
  const [notes, setNotes] = useState("");
  const [blockers] = useState<Blocker[]>([
    // These will come from system checks — tokens, UTMs, etc.
  ]);
  const [streaks] = useState<Streak[]>([
    { type: "Publishing", count: 0 },
    { type: "Distribution", count: 0 },
    { type: "Signups", count: 0 },
  ]);
  const [metrics, setMetrics] = useState({
    signups: 0,
    clicks: 0,
    impressions: 0,
    bestPost: "—",
    bestChannel: "—",
  });

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/growth-ops/metrics?range=today");
      if (!res.ok) return;
      const data = await res.json();
      setMetrics({
        signups: data.today.signups ?? 0,
        clicks: data.today.clicks ?? 0,
        impressions: data.today.impressions ?? 0,
        bestPost: data.today.best_post_url ?? "—",
        bestChannel: data.today.best_channel ?? "—",
      });
    } catch {
      // Silent fail — keeps showing zeros
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const [generatingPack, setGeneratingPack] = useState(false);
  const [packError, setPackError] = useState("");
  const [packGenerated, setPackGenerated] = useState(false);
  const [packData, setPackData] = useState<{
    markets?: { question: string; category: string; resolvesBy: string; resolutionCriteria: string }[];
    scripts?: { platform: string; marketIndex: number; content: string }[];
    utms?: { source: string; medium: string; campaign: string; content: string; fullUrl: string }[];
  } | null>(null);
  const [expandedScript, setExpandedScript] = useState<number | null>(null);

  // Targets (will come from day_plan)
  const targets = { posts: 4, comments: 30, dms: 10, signups: 25 };

  // Load latest pack from today's workflow run on mount
  useEffect(() => {
    async function loadLatestPack() {
      try {
        const res = await fetch("/api/admin/workflows/run?workflowId=market_of_the_day&limit=1");
        if (!res.ok) return;
        const data = await res.json();
        const run = data.runs?.[0];
        if (run?.status === "completed" && run.outputs?.generate_pack?.pack) {
          setPackData(run.outputs.generate_pack.pack);
          setPackGenerated(true);
          // Mark Create phase items as done
          setPhases((prev) =>
            prev.map((phase) =>
              phase.id === "create"
                ? { ...phase, items: phase.items.map((item) => ({ ...item, done: true })) }
                : phase
            )
          );
        }
      } catch { /* silent */ }
    }
    loadLatestPack();
  }, []);

  async function handleGenerateTodayPack() {
    setGeneratingPack(true);
    setPackError("");
    try {
      const res = await fetch("/api/admin/growth-ops/generate-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "today", dayCount: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPackError(data.error || "Generation failed.");
        toast("error", data.error || "Pack generation failed.");
        return;
      }
      // Store and display the generated pack
      setPackData(data.pack);
      toast("success", `Pack generated: ${data.pack?.markets?.length ?? 0} market(s), ${data.pack?.scripts?.length ?? 0} scripts.`);
      // Mark Create phase items as done since AI generated the pack
      setPhases((prev) =>
        prev.map((phase) =>
          phase.id === "create"
            ? {
                ...phase,
                items: phase.items.map((item) => ({ ...item, done: true })),
              }
            : phase
        )
      );
      setPackGenerated(true);
    } catch (err) {
      setPackError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setGeneratingPack(false);
    }
  }

  // Compute progress
  const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);
  const doneItems = phases.reduce((sum, p) => sum + p.items.filter((i) => i.done).length, 0);
  const progressPercent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  // Determine status chip
  function getStatusChip(): { label: string; color: string } {
    if (totalItems === 0) return { label: "Setup Required", color: "border-amber-200 bg-amber-50 text-amber-700" };
    if (doneItems === totalItems) return { label: "Complete", color: "border-green-200 bg-green-50 text-green-700" };
    if (doneItems > 0) return { label: "On Track", color: "border-blue-200 bg-blue-50 text-blue-700" };
    return { label: "Not Started", color: "border-gray-200 bg-gray-50 text-gray-700" };
  }

  function toggleItem(phaseId: string, itemId: string) {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              items: phase.items.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            }
          : phase
      )
    );
  }

  function phaseProgress(phase: PhaseData): number {
    const done = phase.items.filter((i) => i.done).length;
    return phase.items.length > 0 ? Math.round((done / phase.items.length) * 100) : 0;
  }

  const statusChip = getStatusChip();

  return (
    <div className="flex gap-6">
      {/* ── Main column ─────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Mission Banner */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50/80 to-background dark:from-purple-950/20 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-serif font-bold">Today&apos;s Mission</h2>
                  <Badge variant="outline" className={statusChip.color}>
                    {statusChip.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Execute the daily loop. Create one market. Publish everywhere. Distribute through comments and DMs. Log results.
                </p>
                <p className="text-xs text-muted-foreground">
                  Targets today: <strong>{targets.posts} posts</strong>, <strong>{targets.comments} comments</strong>, <strong>{targets.dms} DMs</strong>, <strong>{targets.signups} signups</strong>
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Button size="sm" className="gradient-purple text-white gap-1">
                    <Play className="h-3 w-3" /> Start Today
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={handleGenerateTodayPack}
                    disabled={generatingPack || packGenerated}
                  >
                    {generatingPack ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                    ) : packGenerated ? (
                      <><CheckCircle className="h-3 w-3 text-green-600" /> Pack Generated</>
                    ) : (
                      <><Sparkles className="h-3 w-3" /> Generate Today Pack</>
                    )}
                  </Button>
                </div>
                {packError && (
                  <p className="text-xs text-red-500 pt-1">{packError}</p>
                )}
                <p className="text-xs text-muted-foreground/70 pt-1">
                  Pre-launch. No fake activity. Every post includes disclosure and resolution source.
                </p>
              </div>

              {/* Streaks widget */}
              <div className="lg:w-48 shrink-0">
                <div className="rounded-lg border bg-background p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Streaks
                  </div>
                  {streaks.map((s) => (
                    <div key={s.type} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{s.type} streak</span>
                      <span className="font-mono font-medium">{s.count} days</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground/60 pt-1">
                    Streaks are built by shipping, not planning.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Checklist Cards */}
        <div className="space-y-4">
          {phases.map((phase, phaseIndex) => (
            <Card key={phase.id} className={PHASE_COLORS[phase.id]}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-background border text-xs font-bold">
                      {phaseIndex + 1}
                    </div>
                    {PHASE_ICONS[phase.id]}
                    <CardTitle className="text-base font-serif">{phase.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {phase.items.filter((i) => i.done).length}/{phase.items.length}
                    </span>
                    <div className="w-20">
                      <Progress value={phaseProgress(phase)} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Checklist items */}
                <div className="space-y-2">
                  {phase.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 group"
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.done}
                        onCheckedChange={() => toggleItem(phase.id, item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm flex-1 cursor-pointer ${
                          item.done ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.label}
                        {item.requiredCount != null && (
                          <span className="text-muted-foreground ml-1 font-mono text-xs">
                            ({item.completedCount ?? 0}/{item.requiredCount})
                          </span>
                        )}
                      </label>
                      {item.deepLink && (
                        <Link href={item.deepLink}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Do it <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Link href={phase.primaryLink}>
                    <Button size="sm" variant="default" className="text-xs gap-1">
                      <Zap className="h-3 w-3" /> {phase.primaryAction}
                    </Button>
                  </Link>
                  {phase.secondaryLink ? (
                    <Link href={phase.secondaryLink}>
                      <Button size="sm" variant="ghost" className="text-xs">
                        {phase.secondaryAction}
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" /> {phase.secondaryAction}
                    </Button>
                  )}
                </div>

                {/* Microcopy */}
                <p className="text-xs text-muted-foreground/70 italic">
                  {phase.microcopy}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Generated Pack */}
        {packData && (packData.markets?.length ?? 0) > 0 && (
          <Card className="border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" /> Today&apos;s Pack
                </CardTitle>
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">
                  {packData.markets?.length ?? 0} market{(packData.markets?.length ?? 0) !== 1 ? "s" : ""} &middot; {packData.scripts?.length ?? 0} scripts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Markets */}
              {packData.markets?.map((market, i) => (
                <div key={i} className="rounded-lg border bg-background p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium">{market.question}</h4>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{market.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{market.resolutionCriteria}</p>
                  <p className="text-[10px] text-muted-foreground">Resolves by {market.resolvesBy}</p>

                  {/* Scripts for this market */}
                  <div className="flex gap-1.5 pt-1">
                    {packData.scripts
                      ?.filter((s) => s.marketIndex === i)
                      .map((script, si) => {
                        const globalIdx = i * 4 + si;
                        const isExpanded = expandedScript === globalIdx;
                        return (
                          <div key={si} className="flex-1 min-w-0">
                            <Button
                              variant={isExpanded ? "default" : "outline"}
                              size="sm"
                              className="w-full text-[10px] h-6 capitalize"
                              onClick={() => setExpandedScript(isExpanded ? null : globalIdx)}
                            >
                              {script.platform}
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  {/* Expanded script content */}
                  {packData.scripts
                    ?.filter((s) => s.marketIndex === i)
                    .map((script, si) => {
                      const globalIdx = i * 4 + si;
                      if (expandedScript !== globalIdx) return null;
                      return (
                        <div key={si} className="rounded border bg-muted/50 p-3 mt-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-medium uppercase text-muted-foreground">{script.platform}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[10px] px-1.5"
                              onClick={() => {
                                navigator.clipboard.writeText(script.content);
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                          <p className="text-xs whitespace-pre-wrap">{script.content}</p>
                        </div>
                      );
                    })}
                </div>
              ))}

              {/* UTM Links */}
              {(packData.utms?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-muted-foreground">UTM Links</h4>
                  <div className="space-y-1">
                    {packData.utms?.map((utm, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <Badge variant="outline" className="text-[9px] capitalize shrink-0">{utm.source}</Badge>
                        <code className="text-[10px] text-muted-foreground truncate flex-1">{utm.fullUrl}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[10px] px-1.5 shrink-0"
                          onClick={() => navigator.clipboard.writeText(utm.fullUrl)}
                        >
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Live Scoreboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Today&apos;s Scoreboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <UserPlus className="h-4 w-4 mx-auto text-green-600 mb-1" />
                <div className="text-2xl font-bold font-mono">{metrics.signups}</div>
                <div className="text-xs text-muted-foreground">Signups today</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <MousePointerClick className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                <div className="text-2xl font-bold font-mono">{metrics.clicks}</div>
                <div className="text-xs text-muted-foreground">Clicks today</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                <div className="text-sm font-medium mt-1">{metrics.bestPost}</div>
                <div className="text-xs text-muted-foreground">Best post</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Rocket className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                <div className="text-sm font-medium mt-1">{metrics.bestChannel}</div>
                <div className="text-xs text-muted-foreground">Biggest channel</div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Textarea
                placeholder="What worked today, what flopped, what to repeat tomorrow."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Blockers */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Blockers
              </h4>
              {blockers.length === 0 ? (
                <p className="text-xs text-green-600">No blockers. Keep shipping.</p>
              ) : (
                <div className="space-y-1">
                  {blockers.map((b) => (
                    <div
                      key={b.id}
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
                        b.severity === "error"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                      }`}
                    >
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {b.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Right rail (sticky) ─────────────────────────── */}
      <div className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-6 space-y-4">
          {/* Targets meter */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-purple-600" /> Today&apos;s Targets
              </h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Overall</span>
                    <span className="font-mono">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Posts</span>
                    <span className="font-mono">0/{targets.posts}</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Comments</span>
                    <span className="font-mono">0/{targets.comments}</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">DMs</span>
                    <span className="font-mono">0/{targets.dms}</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Signups</span>
                    <span className="font-mono">0/{targets.signups}</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streaks */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Streaks
              </h3>
              {streaks.map((s) => (
                <div key={s.type} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.type}</span>
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5">
                    {s.count}d
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Alerts
              </h3>
              {blockers.length === 0 ? (
                <p className="text-xs text-muted-foreground">All clear.</p>
              ) : (
                blockers.map((b) => (
                  <p key={b.id} className="text-xs text-amber-700 dark:text-amber-400">
                    {b.message}
                  </p>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardContent className="pt-4 space-y-1.5">
              <h3 className="text-sm font-medium">Quick Links</h3>
              {[
                { label: "Open X", url: "https://x.com" },
                { label: "Open LinkedIn", url: "https://linkedin.com" },
                { label: "Open TikTok", url: "https://tiktok.com" },
                { label: "Open Reddit", url: "https://reddit.com" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
