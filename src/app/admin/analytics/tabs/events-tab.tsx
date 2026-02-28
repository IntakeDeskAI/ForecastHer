"use client";

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
import { Activity, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import type { AnalyticsData } from "./types";

interface TrackedEvent {
  name: string;
  description: string;
  firesOn: string;
  conversionRelevance: "primary" | "secondary" | "observational";
  last24h: number;
  last7d: number;
}

export function EventsTab({ data }: { data: AnalyticsData }) {
  const { today, current } = data;

  const events: TrackedEvent[] = [
    {
      name: "waitlist_cta_click",
      description: "User clicks any \"Join Waitlist\" button",
      firesOn: "Navbar, homepage social strip, advisor CTA, how-it-works CTA",
      conversionRelevance: "primary",
      last24h: today.waitlist_cta_clicks,
      last7d: current.ctaClicks,
    },
    {
      name: "waitlist_signup",
      description: "Waitlist form submitted successfully",
      firesOn: "Hero form, footer form",
      conversionRelevance: "primary",
      last24h: today.waitlist_signups,
      last7d: current.signups,
    },
    {
      name: "market_view",
      description: "Market detail page loaded",
      firesOn: "/markets/[id]",
      conversionRelevance: "secondary",
      last24h: today.market_views,
      last7d: current.marketViews,
    },
    {
      name: "how_it_works_view",
      description: "How It Works page loaded",
      firesOn: "/how-it-works",
      conversionRelevance: "secondary",
      last24h: 0,
      last7d: 0,
    },
    {
      name: "outbound_click",
      description: "External link clicked",
      firesOn: "Footer, outbound links",
      conversionRelevance: "observational",
      last24h: 0,
      last7d: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        All tracked GA4 events with health status and firing locations.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" /> Event Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Event</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Fires On</TableHead>
                <TableHead className="text-xs text-right">Last 24h</TableHead>
                <TableHead className="text-xs text-right">Last 7d</TableHead>
                <TableHead className="text-xs text-center">Relevance</TableHead>
                <TableHead className="text-xs text-center">Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((evt) => {
                const isFiring = evt.last7d > 0;
                return (
                  <TableRow key={evt.name}>
                    <TableCell className="font-mono text-xs text-purple-600 font-medium">{evt.name}</TableCell>
                    <TableCell className="text-xs max-w-[200px]">{evt.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]">{evt.firesOn}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{evt.last24h}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{evt.last7d}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={evt.conversionRelevance === "primary" ? "default" : "secondary"}
                        className={`text-[10px] ${evt.conversionRelevance === "primary" ? "bg-purple-600" : ""}`}
                      >
                        {evt.conversionRelevance}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {isFiring ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Test event CTA */}
      <Card>
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Test event firing</p>
            <p className="text-xs text-muted-foreground">Open your site and verify events appear in GA4 DebugView.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1" asChild>
              <a href="https://forecasther.ai" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" /> Open site
              </a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" asChild>
              <a href="https://analytics.google.com/analytics/web/#/p/G-DL4ZFV877E/debugview" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" /> GA4 DebugView
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UTM params note */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            All events automatically include UTM params (<code className="bg-muted px-1 rounded">utm_source</code>, <code className="bg-muted px-1 rounded">utm_medium</code>, <code className="bg-muted px-1 rounded">utm_campaign</code>, <code className="bg-muted px-1 rounded">utm_content</code>) when present in the visitor&apos;s URL or <code className="bg-muted px-1 rounded">fh_utm</code> cookie.
            No PII (email, phone) is ever sent to GA4.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
