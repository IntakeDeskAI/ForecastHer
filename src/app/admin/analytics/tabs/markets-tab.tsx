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
import { BarChart3, Eye } from "lucide-react";
import type { AnalyticsData } from "./types";

export function MarketsTab({ data }: { data: AnalyticsData }) {
  // Extract market pages from page data
  const marketPages = data.pages
    .filter((p) => p.page_path.startsWith("/markets/") && p.page_path !== "/markets")
    .sort((a, b) => b.pageviews - a.pageviews);

  const totalMarketViews = data.current.marketViews;
  const hasData = marketPages.length > 0 || totalMarketViews > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Market page engagement and what markets to build next.
      </p>

      {/* Market views KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Eye className="h-4 w-4 mx-auto text-purple-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{totalMarketViews}</div>
            <div className="text-xs text-muted-foreground">Market views ({data.range})</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <BarChart3 className="h-4 w-4 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{marketPages.length}</div>
            <div className="text-xs text-muted-foreground">Markets with views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold font-mono">
              {marketPages.length > 0 ? Math.round(totalMarketViews / marketPages.length) : 0}
            </div>
            <div className="text-xs text-muted-foreground">Avg views per market</div>
          </CardContent>
        </Card>
      </div>

      {/* Market leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Market Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="py-8 text-center">
              <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold text-sm">No market view data yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Market views are tracked via GA4. Data appears here after ingestion runs.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Market Path</TableHead>
                  <TableHead className="text-xs text-right">Views</TableHead>
                  <TableHead className="text-xs text-right">CTA Clicks</TableHead>
                  <TableHead className="text-xs text-right">Signups</TableHead>
                  <TableHead className="text-xs text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketPages.slice(0, 20).map((p, i) => {
                  const rate = p.ctaClicks > 0 ? ((p.signups / p.ctaClicks) * 100).toFixed(1) : "—";
                  return (
                    <TableRow key={p.page_path}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-xs font-mono truncate max-w-[250px]">{p.page_path}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{p.pageviews}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{p.ctaClicks}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{p.signups}</TableCell>
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
    </div>
  );
}
