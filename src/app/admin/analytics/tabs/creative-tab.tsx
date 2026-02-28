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
import { Sparkles, ImageIcon, Link2 } from "lucide-react";
import type { AnalyticsData } from "./types";

export function CreativeTab({ data }: { data: AnalyticsData }) {
  const { creatives } = data;
  const hasData = creatives.length > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Which hook and creative drives signups. Requires <code className="text-xs bg-muted px-1 rounded">utm_content</code> on all Growth Ops links.
      </p>

      {/* Top creatives table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Creative Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="py-8 text-center">
              <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold text-sm">No creative data yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add <code className="bg-muted px-1 rounded">utm_content</code> to your Growth Ops links to track which creatives drive signups.
              </p>
              <div className="mt-3 rounded-lg border p-3 text-left max-w-md mx-auto">
                <p className="text-xs font-medium mb-1">Example UTM-tagged link:</p>
                <p className="text-[10px] text-muted-foreground font-mono break-all">
                  forecasther.ai/?utm_source=x&amp;utm_medium=social&amp;utm_campaign=wk1&amp;utm_content=motd_day01
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">utm_content</TableHead>
                  <TableHead className="text-xs">Platform</TableHead>
                  <TableHead className="text-xs text-right">Clicks</TableHead>
                  <TableHead className="text-xs text-right">Signups</TableHead>
                  <TableHead className="text-xs text-right">Signup Rate</TableHead>
                  <TableHead className="text-xs text-right">Verdict</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creatives.map((c) => {
                  const rate = c.clicks > 0 ? ((c.signups / c.clicks) * 100).toFixed(1) : "0.0";
                  const rateNum = parseFloat(rate);
                  return (
                    <TableRow key={`${c.utm_content}/${c.platform}`}>
                      <TableCell className="font-mono text-xs">{c.utm_content}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{c.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{c.clicks}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">{c.signups}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{rate}%</TableCell>
                      <TableCell className="text-right">
                        {rateNum >= 5 ? (
                          <Badge className="bg-green-600 text-xs">Double down</Badge>
                        ) : rateNum >= 2 ? (
                          <Badge variant="secondary" className="text-xs">Keep</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Rewrite</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* UTM enforcement note */}
      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <CardContent className="py-4 flex items-start gap-3">
          <Link2 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">UTM Enforcement</p>
            <p className="text-xs text-muted-foreground mt-1">
              Every outbound link from Growth Ops should use <code className="bg-muted px-1 rounded">utm_content</code> to identify the specific creative.
              Format: <code className="bg-muted px-1 rounded">motd_x_day01</code>, <code className="bg-muted px-1 rounded">recap_thread_wk1</code>, etc.
            </p>
          </div>
        </CardContent>
      </Card>

      {hasData && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="py-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Insight</p>
              <p className="text-xs text-muted-foreground mt-1">
                {creatives.filter(c => c.signups > 0).length > 0
                  ? `${creatives.filter(c => c.clicks > 0 && (c.signups / c.clicks) >= 0.05).length} creatives have 5%+ signup rate. Double down on those.`
                  : "No signups attributed to creatives yet. Keep tagging and the data will come."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
