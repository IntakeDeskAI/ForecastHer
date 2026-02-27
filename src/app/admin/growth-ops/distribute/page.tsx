"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Mail,
  Copy,
  ExternalLink,
  CheckCircle,
  Sparkles,
  Loader2,
  Hash,
  Send,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface CommentItem {
  id: string;
  platform: "x" | "linkedin";
  threadUrl: string;
  threadTitle: string;
  suggestedComment: string;
  done: boolean;
}

interface DMItem {
  id: string;
  person: string;
  type: "founder" | "creator" | "newsletter" | "press" | "user";
  template: string;
  personalizeField: string;
  sent: boolean;
}

interface RedditItem {
  id: string;
  subreddit: string;
  threadTitle: string;
  threadUrl: string;
  suggestedReply: string;
  done: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   INITIAL STATE (empty — will be populated by AI or manual entry)
   ═══════════════════════════════════════════════════════════════════════ */

function generateEmptyComments(platform: "x" | "linkedin", count: number): CommentItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${platform}-${i + 1}`,
    platform,
    threadUrl: "",
    threadTitle: `${platform === "x" ? "X" : "LinkedIn"} thread #${i + 1}`,
    suggestedComment: "",
    done: false,
  }));
}

function generateEmptyDMs(count: number): DMItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `dm-${i + 1}`,
    person: "",
    type: "user" as const,
    template: "",
    personalizeField: "",
    sent: false,
  }));
}

function generateEmptyReddit(count: number): RedditItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `reddit-${i + 1}`,
    subreddit: "",
    threadTitle: `Reddit thread #${i + 1}`,
    threadUrl: "",
    suggestedReply: "",
    done: false,
  }));
}

export default function DistributePage() {
  const [xComments, setXComments] = useState<CommentItem[]>(generateEmptyComments("x", 20));
  const [liComments, setLiComments] = useState<CommentItem[]>(generateEmptyComments("linkedin", 10));
  const [dms, setDMs] = useState<DMItem[]>(generateEmptyDMs(10));
  const [reddit, setReddit] = useState<RedditItem[]>(generateEmptyReddit(5));
  const [generatingComments, setGeneratingComments] = useState(false);
  const [generatingDMs, setGeneratingDMs] = useState(false);

  // Counts
  const xDone = xComments.filter((c) => c.done).length;
  const liDone = liComments.filter((c) => c.done).length;
  const dmsDone = dms.filter((d) => d.sent).length;
  const redditDone = reddit.filter((r) => r.done).length;

  function toggleComment(list: CommentItem[], setList: React.Dispatch<React.SetStateAction<CommentItem[]>>, id: string) {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  }

  function toggleDM(id: string) {
    setDMs((prev) => prev.map((d) => (d.id === id ? { ...d, sent: !d.sent } : d)));
  }

  function toggleReddit(id: string) {
    setReddit((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  }

  function copyToClipboard(text: string) {
    if (text) navigator.clipboard.writeText(text);
  }

  async function handleGenerateComments() {
    setGeneratingComments(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGeneratingComments(false);
  }

  async function handleGenerateDMs() {
    setGeneratingDMs(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGeneratingDMs(false);
  }

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">X Comments</span>
            <span className="text-xs font-mono">{xDone}/20</span>
          </div>
          <Progress value={(xDone / 20) * 100} className="h-1.5" />
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">LinkedIn Comments</span>
            <span className="text-xs font-mono">{liDone}/10</span>
          </div>
          <Progress value={(liDone / 10) * 100} className="h-1.5" />
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">DMs</span>
            <span className="text-xs font-mono">{dmsDone}/10</span>
          </div>
          <Progress value={(dmsDone / 10) * 100} className="h-1.5" />
        </div>
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Reddit Replies</span>
            <span className="text-xs font-mono">{redditDone}/5</span>
          </div>
          <Progress value={(redditDone / 5) * 100} className="h-1.5" />
        </div>
      </div>

      {/* Comment Queue */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Comment Queue
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1"
              onClick={handleGenerateComments}
              disabled={generatingComments}
            >
              {generatingComments ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generate Suggestions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* X Comments */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-black text-white text-[10px]">X</Badge>
              <span className="text-sm font-medium">X Comments ({xDone}/20)</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1.5">
              {xComments.map((item) => (
                <div key={item.id} className="flex items-start gap-2 group rounded p-1.5 hover:bg-muted/30">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => toggleComment(xComments, setXComments, item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>
                        {item.threadTitle}
                      </span>
                      {item.threadUrl && (
                        <a href={item.threadUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                    {item.suggestedComment && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.suggestedComment}</p>
                    )}
                  </div>
                  {item.suggestedComment && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(item.suggestedComment)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn Comments */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-600 text-white text-[10px]">LinkedIn</Badge>
              <span className="text-sm font-medium">LinkedIn Comments ({liDone}/10)</span>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1.5">
              {liComments.map((item) => (
                <div key={item.id} className="flex items-start gap-2 group rounded p-1.5 hover:bg-muted/30">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => toggleComment(liComments, setLiComments, item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>
                      {item.threadTitle}
                    </span>
                    {item.suggestedComment && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.suggestedComment}</p>
                    )}
                  </div>
                  {item.suggestedComment && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(item.suggestedComment)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DM Queue */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <Mail className="h-4 w-4" /> DM Queue
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1"
              onClick={handleGenerateDMs}
              disabled={generatingDMs}
            >
              {generatingDMs ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generate Templates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Person</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Personalize</TableHead>
                <TableHead className="w-16">Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dms.map((dm) => (
                <TableRow key={dm.id} className={dm.sent ? "opacity-50" : ""}>
                  <TableCell>
                    <Checkbox checked={dm.sent} onCheckedChange={() => toggleDM(dm.id)} />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={dm.person}
                      onChange={(e) =>
                        setDMs((prev) =>
                          prev.map((d) => (d.id === dm.id ? { ...d, person: e.target.value } : d))
                        )
                      }
                      placeholder="@handle"
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {dm.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground truncate block max-w-[200px]">
                      {dm.template || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={dm.personalizeField}
                      onChange={(e) =>
                        setDMs((prev) =>
                          prev.map((d) => (d.id === dm.id ? { ...d, personalizeField: e.target.value } : d))
                        )
                      }
                      placeholder="Their market interest..."
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    {dm.sent ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <Send className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reddit Queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Hash className="h-4 w-4" /> Reddit Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reddit.map((item) => (
              <div key={item.id} className="flex items-start gap-2 group rounded-lg border p-3 hover:bg-muted/30">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={() => toggleReddit(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                      {item.subreddit || "r/subreddit"}
                    </Badge>
                    <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>
                      {item.threadTitle}
                    </span>
                    {item.threadUrl && (
                      <a href={item.threadUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                  {item.suggestedReply ? (
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-muted-foreground flex-1">{item.suggestedReply}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(item.suggestedReply)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 italic">No suggested reply yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
