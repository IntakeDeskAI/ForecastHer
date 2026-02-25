"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TrendingUp,
  MousePointerClick,
  UserPlus,
  Link,
  Image,
  Hash,
  Trophy,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

function Overview() {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Waitlist Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">0</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" /> CTR by Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">—</div>
            <p className="text-xs text-muted-foreground mt-1">No data yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">—</div>
            <p className="text-xs text-muted-foreground mt-1">No posts yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Waitlist Signups by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Chart will appear when data is available.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Attribution() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">UTM breakdown and post-to-signup conversion.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Link className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No attribution data yet.</p>
          <p className="text-xs mt-1">UTM tracking will populate after posts with tracked links go live.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function CreativePerformance() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Format and asset template performance comparison.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Format</CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Image className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-xs">No format data yet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Asset Template</CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Image className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-xs">No template data yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TopicPerformance() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Category and resolution post performance.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Hash className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No topic data yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function HookLeaderboard() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Top and bottom performing hooks with AI improvement suggestions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-green-500" /> Top 50 Hooks
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-xs">No hook data yet. Post content to start tracking.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-red-400" /> Bottom 50 Hooks
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-xs text-muted-foreground">No data yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track performance across platforms, content formats, and topics.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="creative">Creative</TabsTrigger>
          <TabsTrigger value="topic">Topic</TabsTrigger>
          <TabsTrigger value="hooks">Hook Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4"><Overview /></TabsContent>
        <TabsContent value="attribution" className="mt-4"><Attribution /></TabsContent>
        <TabsContent value="creative" className="mt-4"><CreativePerformance /></TabsContent>
        <TabsContent value="topic" className="mt-4"><TopicPerformance /></TabsContent>
        <TabsContent value="hooks" className="mt-4"><HookLeaderboard /></TabsContent>
      </Tabs>
    </div>
  );
}
