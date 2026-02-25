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
import {
  MessageSquare,
  Vote,
  Trophy,
  Shield,
  Inbox,
  Check,
  X,
  Flag,
  Send,
  UserPlus,
  AlertTriangle,
} from "lucide-react";

function Suggestions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Community-submitted market suggestions with auto-tagging and spam filtering.
      </p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Inbox className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No community suggestions yet.</p>
          <p className="text-xs mt-1">Suggestions will appear here once the community form is live.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Votes() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Weekly poll builder and results.</p>
        <Button size="sm" className="gradient-purple text-white">
          <Vote className="h-4 w-4 mr-1" /> Create Poll
        </Button>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Vote className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No polls created yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralLeaderboard() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Top referrers, rewards, and fraud checks.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Referral program not yet active.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Moderation() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Flagged comments queue and reply suggestions.</p>
        <Badge variant="outline" className="text-xs">
          Safe Replies Only: On
        </Badge>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No flagged comments.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Community</h1>
        <p className="text-sm text-muted-foreground">
          Manage suggestions, polls, referrals, and moderation.
        </p>
      </div>

      <Tabs defaultValue="suggestions">
        <TabsList>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="votes">Votes</TabsTrigger>
          <TabsTrigger value="referrals">Referral Leaderboard</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>
        <TabsContent value="suggestions" className="mt-4"><Suggestions /></TabsContent>
        <TabsContent value="votes" className="mt-4"><Votes /></TabsContent>
        <TabsContent value="referrals" className="mt-4"><ReferralLeaderboard /></TabsContent>
        <TabsContent value="moderation" className="mt-4"><Moderation /></TabsContent>
      </Tabs>
    </div>
  );
}
