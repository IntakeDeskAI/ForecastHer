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
import { Zap, BarChart3 } from "lucide-react";
import type { AnalyticsData } from "./types";

export function AcquisitionTab({ data }: { data: AnalyticsData }) {
  const { sources, campaigns, bestChannel } = data;
  const hasSources = sources.length > 0;
  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Source / medium and campaign leaderboards from GA4 data.
      </p>

      {/* Best channel highlight */}
      {bestChannel && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="py-3 flex items-center gap-3">
            <Zap className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Best channel: <span className="text-green-700">{bestChannel.source}/{bestChannel.medium}</span></p>
              <p className="text-xs text-muted-foreground">{bestChannel.signups} signups, {bestChannel.sessions} sessions this period</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source / Medium leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Source / Medium Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasSources ? (
            <div className="py-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No source data yet. Appears after GA4 ingestion.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Source / Medium</TableHead>
                  <TableHead className="text-xs text-right">Sessions</TableHead>
                  <TableHead className="text-xs text-right">Users</TableHead>
                  <TableHead className="text-xs text-right">CTA Clicks</TableHead>
                  <TableHead className="text-xs text-right">Signups</TableHead>
                  <TableHead className="text-xs text-right">Signup Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((s) => {
                  const rate = s.ctaClicks > 0 ? ((s.signups / s.ctaClicks) * 100).toFixed(1) : "—";
                  return (
                    <TableRow key={`${s.source}/${s.medium}`}>
                      <TableCell className="font-medium text-sm">{s.source}/{s.medium}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{s.sessions}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{s.users}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{s.ctaClicks}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">{s.signups}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs font-mono">{rate}%</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Campaign leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Campaign Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasCampaigns ? (
            <div className="py-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No campaign data yet. Use UTM-tagged links to see campaign performance.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Campaign</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs text-right">Sessions</TableHead>
                  <TableHead className="text-xs text-right">Clicks</TableHead>
                  <TableHead className="text-xs text-right">Signups</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={`${c.campaign}/${c.source}`}>
                    <TableCell className="font-mono text-xs">{c.campaign}</TableCell>
                    <TableCell className="text-xs">{c.source}/{c.medium}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{c.sessions}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{c.clicks}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">{c.signups}</TableCell>
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
