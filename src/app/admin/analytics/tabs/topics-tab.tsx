"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hash, TrendingUp } from "lucide-react";
import type { AnalyticsData } from "./types";

export function TopicsTab({ data }: { data: AnalyticsData }) {
  const { topics } = data;

  // Aggregate topics across dates
  const topicMap = new Map<string, { topic: string; sessions: number; ctaClicks: number; signups: number; velocity: number }>();
  for (const t of topics) {
    const existing = topicMap.get(t.topic_name) ?? { topic: t.topic_name, sessions: 0, ctaClicks: 0, signups: 0, velocity: 0 };
    existing.sessions += t.sessions;
    existing.ctaClicks += t.cta_clicks;
    existing.signups += t.signups;
    existing.velocity = Math.max(existing.velocity, t.velocity_score);
    topicMap.set(t.topic_name, existing);
  }
  const topicList = [...topicMap.values()].sort((a, b) => b.velocity - a.velocity || b.signups - a.signups);
  const hasData = topicList.length > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Category-level traction. Topics come from market tags and page path patterns.
      </p>

      {/* Rising topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" /> Topic Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="py-8 text-center">
              <Hash className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold text-sm">No topic data yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Topics will populate once the GA4 ingestion job maps page paths and market categories to topics.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Topic</TableHead>
                  <TableHead className="text-xs text-right">Sessions</TableHead>
                  <TableHead className="text-xs text-right">CTA Clicks</TableHead>
                  <TableHead className="text-xs text-right">Signups</TableHead>
                  <TableHead className="text-xs text-right">Velocity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topicList.map((t) => (
                  <TableRow key={t.topic}>
                    <TableCell className="font-medium text-sm flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-purple-500" />
                      {t.topic}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{t.sessions}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{t.ctaClicks}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">{t.signups}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={`text-xs font-mono ${
                          t.velocity > 20 ? "bg-green-100 text-green-700" : t.velocity < -10 ? "bg-red-100 text-red-600" : ""
                        }`}
                        variant="secondary"
                      >
                        {t.velocity > 0 ? "+" : ""}{Math.round(t.velocity)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
