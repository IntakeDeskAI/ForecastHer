"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  UserPlus,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Flame,
  Eye,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Send,
  BarChart3,
  Link2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { AnalyticsData } from "./types";

function delta(current: number, prior: number): { pct: number; dir: "up" | "flat" | "down" } {
  if (prior === 0) return { pct: current > 0 ? 100 : 0, dir: current > 0 ? "up" : "flat" };
  const pct = Math.round(((current - prior) / prior) * 100);
  return { pct: Math.abs(pct), dir: pct > 5 ? "up" : pct < -5 ? "down" : "flat" };
}

function StatusChip({ dir }: { dir: "up" | "flat" | "down" }) {
  if (dir === "up") return <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 gap-0.5"><TrendingUp className="h-2.5 w-2.5" /> Up</Badge>;
  if (dir === "down") return <Badge className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0 gap-0.5"><TrendingDown className="h-2.5 w-2.5" /> Down</Badge>;
  return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5"><Minus className="h-2.5 w-2.5" /> Flat</Badge>;
}

function ScoreGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-1">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${value}, 100`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono">
          {value}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export function IntelligenceTab({ data }: { data: AnalyticsData }) {
  const { today, current, prior, signalStrength, trendVelocity, bestChannel, recommendations, health, streaks, daily, topics } = data;
  const signupsDelta = delta(today.waitlist_signups, Math.round(current.signups / Math.max(daily.length, 1)));
  const ctaDelta = delta(today.waitlist_cta_clicks, Math.round(current.ctaClicks / Math.max(daily.length, 1)));
  const convRate = today.waitlist_cta_clicks > 0 ? (today.waitlist_signups / today.waitlist_cta_clicks * 100).toFixed(1) : "0.0";
  const avgConvRate = current.ctaClicks > 0 ? (current.signups / current.ctaClicks * 100).toFixed(1) : "0.0";
  const convDelta = delta(parseFloat(convRate), parseFloat(avgConvRate));
  const velocityDelta = delta(trendVelocity, 50);

  const hasData = daily.length > 0;
  const noTables = health.status === "no_tables";

  // Gather top pages and sources for Momentum
  const topPages = data.pages.slice(0, 5);
  const topSources = data.sources.slice(0, 5);

  // Rising / falling topics
  const risingTopics = topics.filter(t => t.velocity_score > 0).slice(0, 5);
  const fallingTopics = [...topics].filter(t => t.velocity_score <= 0).sort((a, b) => a.velocity_score - b.velocity_score).slice(0, 5);

  // Alerts
  const alerts: { message: string; severity: "warning" | "error" }[] = [];
  if (noTables) {
    alerts.push({ message: "Analytics tables not created yet. Run the migration SQL in Supabase.", severity: "warning" });
  }
  if (health.status === "error" && health.last_error) {
    alerts.push({ message: `GA4 ingestion failed: ${health.last_error}`, severity: "error" });
  }
  if (hasData && today.waitlist_signups === 0 && today.waitlist_cta_clicks === 0) {
    alerts.push({ message: "No waitlist events in the last 24h.", severity: "warning" });
  }

  return (
    <div className="space-y-6">
      {/* A) KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Signal Strength */}
        <Card>
          <CardContent className="pt-4 pb-3 flex flex-col items-center">
            <ScoreGauge value={signalStrength} label="Signal Strength" color="hsl(271, 91%, 65%)" />
          </CardContent>
        </Card>

        {/* Signups today */}
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <UserPlus className="h-4 w-4 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{today.waitlist_signups}</div>
            <div className="text-[10px] text-muted-foreground">Signups today</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <StatusChip dir={signupsDelta.dir} />
              <span className="text-[10px] text-muted-foreground">{signupsDelta.pct}% vs avg</span>
            </div>
          </CardContent>
        </Card>

        {/* CTA clicks today */}
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <MousePointerClick className="h-4 w-4 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{today.waitlist_cta_clicks}</div>
            <div className="text-[10px] text-muted-foreground">CTA clicks today</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <StatusChip dir={ctaDelta.dir} />
              <span className="text-[10px] text-muted-foreground">{ctaDelta.pct}% vs avg</span>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto text-purple-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{convRate}%</div>
            <div className="text-[10px] text-muted-foreground">Conversion today</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <StatusChip dir={convDelta.dir} />
              <span className="text-[10px] text-muted-foreground">avg {avgConvRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Trend Velocity */}
        <Card>
          <CardContent className="pt-4 pb-3 flex flex-col items-center">
            <ScoreGauge value={trendVelocity} label="Trend Velocity" color="hsl(142, 71%, 45%)" />
          </CardContent>
        </Card>

        {/* Best Channel */}
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Zap className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <div className="text-sm font-bold truncate">{bestChannel ? `${bestChannel.source}/${bestChannel.medium}` : "—"}</div>
            <div className="text-[10px] text-muted-foreground">Best channel today</div>
            {bestChannel && (
              <div className="text-[10px] text-muted-foreground mt-1">{bestChannel.signups} signups</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* B) Do Next Recommendations */}
        <Card className="lg:col-span-1 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" /> Do Next
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="py-4 text-center">
                <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {noTables
                    ? "Run the analytics migration, then recommendations will appear here."
                    : "Recommendations will generate once analytics data flows in."}
                </p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div key={rec.id} className="rounded-lg border p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{rec.title}</p>
                    <Badge
                      variant={rec.expected_impact === "high" ? "default" : "secondary"}
                      className={`text-[9px] shrink-0 ${rec.expected_impact === "high" ? "bg-green-600" : ""}`}
                    >
                      {rec.expected_impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                  {rec.action_url && (
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1" asChild>
                      <a href={rec.action_url}>{rec.action_label} <ArrowRight className="h-3 w-3" /></a>
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* C) Momentum Widgets */}
        <div className="lg:col-span-2 space-y-4">
          {/* Streaks */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-3 pb-3 text-center">
                <Send className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                <div className="text-xl font-bold font-mono">{streaks.publish_streak}</div>
                <div className="text-[10px] text-muted-foreground">Publishing streak</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3 text-center">
                <Activity className="h-4 w-4 mx-auto text-green-500 mb-1" />
                <div className="text-xl font-bold font-mono">{streaks.distribute_streak}</div>
                <div className="text-[10px] text-muted-foreground">Distribution streak</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3 text-center">
                <Flame className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                <div className="text-xl font-bold font-mono">{streaks.signup_streak}</div>
                <div className="text-[10px] text-muted-foreground">Signup streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Sparks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {topPages.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No page data yet.</p>
                ) : (
                  topPages.map((p, i) => (
                    <div key={p.page_path} className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[200px]">
                        <span className="text-muted-foreground mr-1">{i + 1}.</span>
                        {p.page_path}
                      </span>
                      <span className="font-mono">{p.pageviews}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" /> Top Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {topSources.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No source data yet.</p>
                ) : (
                  topSources.map((s, i) => (
                    <div key={`${s.source}/${s.medium}`} className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[200px]">
                        <span className="text-muted-foreground mr-1">{i + 1}.</span>
                        {s.source}/{s.medium}
                      </span>
                      <span className="font-mono">{s.sessions}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* D) Trend Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" /> Rising Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risingTopics.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No rising topics yet. Data appears after GA4 ingestion runs.</p>
            ) : (
              <div className="space-y-2">
                {risingTopics.map((t) => (
                  <div key={t.topic_name} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{t.topic_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{t.signups} signups</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">+{Math.round(t.velocity_score)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" /> Falling Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fallingTopics.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No falling topics.</p>
            ) : (
              <div className="space-y-2">
                {fallingTopics.map((t) => (
                  <div key={t.topic_name} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{t.topic_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{t.signups} signups</span>
                    </div>
                    <Badge className="bg-red-100 text-red-600 text-xs">{Math.round(t.velocity_score)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* E) Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                a.severity === "error"
                  ? "border-red-300 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                  : "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
              }`}
            >
              {a.severity === "error" ? <XCircle className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Setup instructions when no tables */}
      {noTables && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" /> Setup Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { done: true, label: "GA4 tag installed on public site (G-DL4ZFV877E)" },
              { done: true, label: "Event tracking: waitlist_cta_click, waitlist_signup, market_view, how_it_works_view" },
              { done: true, label: "UTM attribution cookie (fh_utm, 7-day expiry)" },
              { done: false, label: "Run analytics migration SQL in Supabase (supabase/migrations/003_analytics_schema.sql)" },
              { done: false, label: "Create Google Cloud service account + enable GA4 Data API" },
              { done: false, label: "Add GA4_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS_JSON to Vercel env vars" },
              { done: false, label: "Set up Vercel Cron for daily GA4 ingestion" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {step.done
                  ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                }
                <span className={step.done ? "text-muted-foreground line-through" : ""}>{step.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* GA4 connection note */}
      {!noTables && health.last_ingestion_at && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link2 className="h-3 w-3" />
          Last ingestion: {new Date(health.last_ingestion_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}
