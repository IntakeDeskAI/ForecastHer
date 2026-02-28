"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const GA4_BASE = "https://analytics.google.com/analytics/web";
const PROPERTY = "G-DL4ZFV877E";

const reports = [
  { label: "Realtime", desc: "Active users right now", path: "realtime/overview" },
  { label: "Acquisition Overview", desc: "Where visitors come from", path: "reports/acquisition-overview" },
  { label: "Traffic Acquisition", desc: "Source / medium / campaign", path: "reports/acquisition-traffic-acquisition-v2" },
  { label: "Pages & Screens", desc: "Top pages by views", path: "reports/content-pages-and-screens" },
  { label: "Events", desc: "All tracked events", path: "reports/events-in-events" },
  { label: "Conversions", desc: "Key events marked as conversions", path: "reports/conversions" },
  { label: "DebugView", desc: "Test event firing in real-time", path: "debugview" },
  { label: "Property Settings", desc: "Manage property config", path: "admin" },
];

export function GA4LiveTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Raw GA4 dashboard links. Use Intelligence tab for decisions — use this for debugging and deep dives.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {reports.map((r) => (
          <a
            key={r.label}
            href={`${GA4_BASE}/#/p/${PROPERTY}/${r.path}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card className="hover:border-purple-300 transition-colors cursor-pointer h-full">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{r.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
