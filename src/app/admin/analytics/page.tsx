"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Loader2,
  Brain,
  ArrowDownRight,
  Globe,
  BarChart3,
  Hash,
  Palette,
  Activity,
  ExternalLink,
} from "lucide-react";
import type { AnalyticsData } from "./tabs/types";
import { IntelligenceTab } from "./tabs/intelligence";
import { FunnelTab } from "./tabs/funnel";
import { AcquisitionTab } from "./tabs/acquisition";
import { MarketsTab } from "./tabs/markets-tab";
import { TopicsTab } from "./tabs/topics-tab";
import { CreativeTab } from "./tabs/creative-tab";
import { EventsTab } from "./tabs/events-tab";
import { GA4LiveTab } from "./tabs/ga4-live";

const EMPTY_DATA: AnalyticsData = {
  range: "7d",
  today: { date: new Date().toISOString().split("T")[0], sessions: 0, users: 0, new_users: 0, pageviews: 0, waitlist_signups: 0, waitlist_cta_clicks: 0, market_views: 0 },
  current: { sessions: 0, users: 0, newUsers: 0, pageviews: 0, signups: 0, ctaClicks: 0, marketViews: 0 },
  prior: { sessions: 0, users: 0, signups: 0, ctaClicks: 0, marketViews: 0 },
  daily: [],
  signalStrength: 0,
  trendVelocity: 0,
  conversionRate: 0,
  todayConversion: 0,
  bestChannel: null,
  sources: [],
  campaigns: [],
  pages: [],
  topics: [],
  creatives: [],
  recommendations: [],
  health: { status: "pending", last_ingestion_at: null },
  streaks: { publish_streak: 0, distribute_streak: 0, signup_streak: 0 },
};

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silent — shows empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Forecast Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            What&apos;s working. What&apos;s trending. What to do next.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range */}
          <div className="flex rounded-md border border-border overflow-hidden">
            {(["7d", "14d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-purple-600 text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {r === "7d" ? "7 days" : r === "14d" ? "14 days" : "30 days"}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="intelligence">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="intelligence" className="gap-1 text-xs">
            <Brain className="h-3.5 w-3.5" /> Intelligence
          </TabsTrigger>
          <TabsTrigger value="funnel" className="gap-1 text-xs">
            <ArrowDownRight className="h-3.5 w-3.5" /> Funnel
          </TabsTrigger>
          <TabsTrigger value="acquisition" className="gap-1 text-xs">
            <Globe className="h-3.5 w-3.5" /> Acquisition
          </TabsTrigger>
          <TabsTrigger value="markets" className="gap-1 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> Markets
          </TabsTrigger>
          <TabsTrigger value="topics" className="gap-1 text-xs">
            <Hash className="h-3.5 w-3.5" /> Topics
          </TabsTrigger>
          <TabsTrigger value="creative" className="gap-1 text-xs">
            <Palette className="h-3.5 w-3.5" /> Creative
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1 text-xs">
            <Activity className="h-3.5 w-3.5" /> Events
          </TabsTrigger>
          <TabsTrigger value="ga4" className="gap-1 text-xs">
            <ExternalLink className="h-3.5 w-3.5" /> GA4 Live
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="intelligence" className="mt-4">
              <IntelligenceTab data={data} />
            </TabsContent>
            <TabsContent value="funnel" className="mt-4">
              <FunnelTab data={data} />
            </TabsContent>
            <TabsContent value="acquisition" className="mt-4">
              <AcquisitionTab data={data} />
            </TabsContent>
            <TabsContent value="markets" className="mt-4">
              <MarketsTab data={data} />
            </TabsContent>
            <TabsContent value="topics" className="mt-4">
              <TopicsTab data={data} />
            </TabsContent>
            <TabsContent value="creative" className="mt-4">
              <CreativeTab data={data} />
            </TabsContent>
            <TabsContent value="events" className="mt-4">
              <EventsTab data={data} />
            </TabsContent>
            <TabsContent value="ga4" className="mt-4">
              <GA4LiveTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
