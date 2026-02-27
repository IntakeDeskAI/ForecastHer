"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  Calendar,
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
}

interface TaskRow {
  id: string;
  task: string;
  platform: string;
  impressions: number;
  clicks: number;
  signups: number;
  notes: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   INITIAL STATE
   ═══════════════════════════════════════════════════════════════════════ */

const today = new Date().toISOString().split("T")[0];

export default function ReportPage() {
  const [todayMetrics] = useState<DailyMetrics>({
    date: today,
    signups: 0,
    clicks: 0,
    impressions: 0,
    posts: 0,
    comments: 0,
    dms: 0,
  });

  const [weekMetrics] = useState<DailyMetrics>({
    date: "week",
    signups: 0,
    clicks: 0,
    impressions: 0,
    posts: 0,
    comments: 0,
    dms: 0,
  });

  const [taskRows] = useState<TaskRow[]>([]);
  const [generatingDebrief, setGeneratingDebrief] = useState(false);
  const [debrief, setDebrief] = useState("");

  async function handleGenerateDebrief() {
    setGeneratingDebrief(true);
    // Simulated — will call API when connected
    await new Promise((r) => setTimeout(r, 2000));
    setDebrief(
      "## Weekly Debrief\n\n**What worked:**\n- (No data yet — complete your first week to generate insights)\n\n**What to stop:**\n- N/A\n\n**What to double down on:**\n- Ship the daily loop consistently for 7 days to generate enough data for real analysis."
    );
    setGeneratingDebrief(false);
  }

  return (
    <div className="space-y-6">
      {/* Top metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <UserPlus className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{todayMetrics.signups}</div>
            <div className="text-xs text-muted-foreground">Signups today</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              This week: {weekMetrics.signups}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Send className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{todayMetrics.posts}</div>
            <div className="text-xs text-muted-foreground">Posts shipped</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              This week: {weekMetrics.posts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <MessageSquare className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{todayMetrics.comments}</div>
            <div className="text-xs text-muted-foreground">Comments shipped</div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              This week: {weekMetrics.comments}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Mail className="h-5 w-5 mx-auto text-orange-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{todayMetrics.dms}</div>
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
              <span className="text-2xl font-bold font-mono">{todayMetrics.impressions}</span>
              <span className="text-xs text-muted-foreground">today</span>
              <span className="text-xs text-muted-foreground/60 ml-auto">
                week: {weekMetrics.impressions}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Clicks</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono">{todayMetrics.clicks}</span>
              <span className="text-xs text-muted-foreground">today</span>
              <span className="text-xs text-muted-foreground/60 ml-auto">
                week: {weekMetrics.clicks}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task results table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <FileText className="h-4 w-4" /> Task Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskRows.length === 0 ? (
            <div className="py-8 text-center">
              <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-base">No task data yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete tasks in the daily loop to see performance data here. Each task row shows impressions, clicks, signups, and notes.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Signups</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm">{row.task}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{row.platform}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.impressions}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.clicks}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.signups}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.notes}</TableCell>
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
                AI analyzes your task results, metrics, and notes to produce actionable insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
