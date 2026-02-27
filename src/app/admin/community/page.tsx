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
  Loader2,
  Plus,
  Trash2,
  BarChart3,
} from "lucide-react";
import { HowItWorks } from "@/components/how-it-works";

function Suggestions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Community-submitted market suggestions with auto-tagging and spam filtering.
      </p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Inbox className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No community suggestions yet.</p>
          <p className="text-xs mt-1">Suggestions will appear here once the community form is live.</p>
          <p className="text-xs mt-3 text-muted-foreground/70">
            Tip: Share your suggestion form link on social media to start collecting market ideas from the community.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

type PollData = {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  created_at: string;
  status: "active" | "closed";
};

function Votes() {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [polls, setPolls] = useState<PollData[]>([]);
  const [publishing, setPublishing] = useState(false);

  function addOption() {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function updateOption(index: number, value: string) {
    setOptions(options.map((o, i) => (i === index ? value : o)));
  }

  function handlePublish() {
    if (!question.trim() || options.some((o) => !o.trim())) return;
    setPublishing(true);
    setTimeout(() => {
      const newPoll: PollData = {
        id: `poll-${Date.now()}`,
        question: question.trim(),
        options: options.map((o) => o.trim()),
        votes: options.map(() => 0),
        created_at: new Date().toISOString(),
        status: "active",
      };
      setPolls((prev) => [newPoll, ...prev]);
      setQuestion("");
      setOptions(["", ""]);
      setShowForm(false);
      setPublishing(false);
    }, 800);
  }

  function handleClosePoll(id: string) {
    setPolls((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "closed" as const } : p))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Weekly poll builder and results.</p>
        <Button
          size="sm"
          className="gradient-purple text-white"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-1" /> Cancel
            </>
          ) : (
            <>
              <Vote className="h-4 w-4 mr-1" /> Create Poll
            </>
          )}
        </Button>
      </div>

      {/* Inline poll creation form */}
      {showForm && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Poll Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Which femtech topic should we cover next?"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Options ({options.length}/4)
              </label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-red-500"
                      onClick={() => removeOption(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={addOption}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                className="gradient-purple text-white"
                onClick={handlePublish}
                disabled={publishing || !question.trim() || options.some((o) => !o.trim())}
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Publishing&hellip;
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" /> Publish Poll
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing polls */}
      {polls.length > 0 ? (
        <div className="space-y-3">
          {polls.map((poll) => (
            <Card
              key={poll.id}
              className={poll.status === "active" ? "border-purple-200 dark:border-purple-800" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <h4 className="text-sm font-medium">{poll.question}</h4>
                      <Badge
                        variant={poll.status === "active" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {poll.status === "active" ? "Active" : "Closed"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {poll.options.map((opt, i) => {
                        const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
                        const pct = totalVotes > 0 ? Math.round((poll.votes[i] / totalVotes) * 100) : 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-1 rounded-md bg-muted overflow-hidden h-7 relative">
                              <div
                                className="absolute inset-y-0 left-0 bg-purple-100 dark:bg-purple-900/40 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                              <span className="relative px-2 text-xs leading-7 font-medium">{opt}</span>
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                              {poll.votes[i]} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {new Date(poll.created_at).toLocaleString()} &middot;{" "}
                      {poll.votes.reduce((a, b) => a + b, 0)} total votes
                    </p>
                  </div>
                  {poll.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => handleClosePoll(poll.id)}
                    >
                      Close Poll
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !showForm && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Vote className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No polls created yet.</p>
              <p className="text-xs mt-1">
                Click &quot;Create Poll&quot; above to build your first community poll.
              </p>
            </CardContent>
          </Card>
        )
      )}
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
          <p className="text-sm font-medium">Referral program not yet active.</p>
          <p className="text-xs mt-1">
            The referral leaderboard will populate once the referral system is configured in Settings.
          </p>
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
          <p className="text-sm font-medium">No flagged comments.</p>
          <p className="text-xs mt-1">
            Comments flagged by the community or auto-moderation will appear here for review.
          </p>
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

      <HowItWorks
        steps={[
          "Suggestions: Community-submitted market ideas land here with auto-tagging. Accept good ones to your market inbox, reject spam.",
          "Votes: Create weekly polls to engage the community and surface what topics people care about most.",
          "Referral Leaderboard: Track top referrers, manage rewards tiers, and flag suspicious patterns for fraud checks.",
          "Moderation: Review flagged comments and use AI-suggested safe replies. \"Safe Replies Only\" mode is on by default to prevent liability.",
        ]}
      />

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
