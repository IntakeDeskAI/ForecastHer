"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ScheduledPost, Platform } from "@/lib/types";
import {
  Calendar as CalendarIcon,
  List,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Eye,
} from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PLATFORMS: Platform[] = ["x", "instagram", "tiktok", "linkedin", "email"];

function CalendarView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">This Week</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            &larr; Prev
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Today
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Next &rarr;
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden min-w-[700px]">
          {/* Header */}
          <div className="bg-muted p-2 text-xs font-medium text-muted-foreground">Platform</div>
          {DAYS.map((day) => (
            <div key={day} className="bg-muted p-2 text-xs font-medium text-center text-muted-foreground">
              {day}
            </div>
          ))}
          {/* Rows per platform */}
          {PLATFORMS.map((platform) => (
            <>
              <div key={`${platform}-label`} className="bg-card p-2 text-xs font-medium capitalize border-t border-border">
                {platform}
              </div>
              {DAYS.map((day) => (
                <div
                  key={`${platform}-${day}`}
                  className="bg-card p-2 min-h-[60px] border-t border-border text-center"
                >
                  <span className="text-xs text-muted-foreground">—</span>
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

function QueueView() {
  const [posts] = useState<ScheduledPost[]>([]);

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No posts scheduled.</p>
            <p className="text-xs mt-1">Approve drafts in Content Studio to add them to the schedule.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="text-sm font-mono">
                    {new Date(post.scheduled_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">{post.platform}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {post.draft_id}
                  </TableCell>
                  <TableCell>
                    <ScheduleStatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-xs font-mono">{post.retry_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {post.status === "scheduled" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Pause">
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {post.status === "paused" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Resume">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {post.status === "failed" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Retry">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function ScheduleStatusBadge({ status }: { status: ScheduledPost["status"] }) {
  const variants: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    posting: "bg-yellow-100 text-yellow-700",
    posted: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    paused: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge variant="outline" className={`text-xs capitalize ${variants[status]}`}>
      {status}
    </Badge>
  );
}

export default function SchedulerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Scheduler</h1>
        <p className="text-sm text-muted-foreground">
          Calendar and queue view for scheduled posts across all platforms.
        </p>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="queue">
            <List className="h-3.5 w-3.5 mr-1" /> Queue
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          <CalendarView />
        </TabsContent>
        <TabsContent value="queue" className="mt-4">
          <QueueView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
