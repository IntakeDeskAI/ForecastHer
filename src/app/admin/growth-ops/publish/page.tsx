"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  Pencil,
  Copy,
  ChevronRight,
  Shield,
  BookOpen,
  Hash,
  Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

type PostStatus = "draft" | "approved" | "scheduled" | "posted";

interface ChannelDraft {
  id: string;
  platform: string;
  content: string;
  status: PostStatus;
  characterLimit: number;
  hasDisclosure: boolean;
  hasSource: boolean;
}

interface MarketOption {
  id: string;
  title: string;
  resolution: string;
  yesPct: number;
}

/* ═══════════════════════════════════════════════════════════════════════
   INITIAL STATE
   ═══════════════════════════════════════════════════════════════════════ */

const SAMPLE_MARKETS: MarketOption[] = [
  { id: "m1", title: "Will a woman-led startup raise a $100M+ Series B by Q2 2026?", resolution: "CrunchBase confirms a Series B ≥ $100M with a female CEO by June 30, 2026.", yesPct: 42 },
  { id: "m2", title: "Will the US women's soccer team win the 2027 World Cup?", resolution: "FIFA official results for the 2027 Women's World Cup final.", yesPct: 28 },
  { id: "m3", title: "Will a femtech IPO happen by end of 2026?", resolution: "SEC filing confirms IPO of a company categorized as femtech by December 31, 2026.", yesPct: 35 },
];

const PLATFORM_CONFIG: Record<string, { label: string; charLimit: number; color: string }> = {
  x: { label: "X (Twitter)", charLimit: 280, color: "bg-black text-white" },
  ig: { label: "Instagram", charLimit: 2200, color: "bg-pink-600 text-white" },
  tiktok: { label: "TikTok", charLimit: 4000, color: "bg-black text-white" },
  linkedin: { label: "LinkedIn", charLimit: 3000, color: "bg-blue-600 text-white" },
};

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "border-gray-200 bg-gray-50 text-gray-700" },
  approved: { label: "Approved", color: "border-blue-200 bg-blue-50 text-blue-700" },
  scheduled: { label: "Scheduled", color: "border-purple-200 bg-purple-50 text-purple-700" },
  posted: { label: "Posted", color: "border-green-200 bg-green-50 text-green-700" },
};

export default function PublishPage() {
  const [selectedMarket, setSelectedMarket] = useState<string>("");
  const [drafts, setDrafts] = useState<ChannelDraft[]>([
    { id: "d-x", platform: "x", content: "", status: "draft", characterLimit: 280, hasDisclosure: false, hasSource: false },
    { id: "d-ig", platform: "ig", content: "", status: "draft", characterLimit: 2200, hasDisclosure: false, hasSource: false },
    { id: "d-tiktok", platform: "tiktok", content: "", status: "draft", characterLimit: 4000, hasDisclosure: false, hasSource: false },
    { id: "d-linkedin", platform: "linkedin", content: "", status: "draft", characterLimit: 3000, hasDisclosure: false, hasSource: false },
  ]);
  const [editing, setEditing] = useState<string | null>(null);

  const market = SAMPLE_MARKETS.find((m) => m.id === selectedMarket);

  function updateDraft(id: string, content: string) {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const hasDisclosure = /illustrative|pre-launch|play money/i.test(content);
        const hasSource = /resolution|criteria|source/i.test(content);
        return { ...d, content, hasDisclosure, hasSource };
      })
    );
  }

  function setStatus(id: string, status: PostStatus) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  const allScheduledOrPosted = drafts.every((d) => d.status === "scheduled" || d.status === "posted");
  const hasDrafts = drafts.some((d) => d.content.length > 0);

  return (
    <div className="space-y-6">
      {/* Market Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Select Today&apos;s Market
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedMarket} onValueChange={setSelectedMarket}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a market to publish today" />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_MARKETS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {market && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <p className="text-sm font-medium">{market.title}</p>
              <p className="text-xs text-muted-foreground">
                <strong>Resolution:</strong> {market.resolution}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Illustrative odds:</strong> {market.yesPct}% Yes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {drafts.map((draft) => {
          const config = PLATFORM_CONFIG[draft.platform];
          const isOverLimit = draft.content.length > draft.characterLimit;
          const statusConf = STATUS_CONFIG[draft.status];

          return (
            <Card key={draft.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${statusConf.color}`}>
                      {draft.status === "posted" && <CheckCircle className="h-3 w-3 mr-0.5" />}
                      {draft.status === "scheduled" && <Clock className="h-3 w-3 mr-0.5" />}
                      {statusConf.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-mono ${isOverLimit ? "text-red-500" : "text-muted-foreground"}`}>
                      {draft.content.length}/{draft.characterLimit}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editing === draft.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={draft.content}
                      onChange={(e) => updateDraft(draft.id, e.target.value)}
                      rows={5}
                      className="text-sm font-mono"
                      placeholder={`Write ${config.label} post...`}
                    />
                    <Button size="sm" onClick={() => setEditing(null)} className="text-xs">
                      Done editing
                    </Button>
                  </div>
                ) : (
                  <div
                    className="min-h-[60px] rounded border bg-muted/20 p-2 text-sm whitespace-pre-wrap cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setEditing(draft.id)}
                  >
                    {draft.content || (
                      <span className="text-muted-foreground italic">Click to write or paste content...</span>
                    )}
                  </div>
                )}

                {/* Guardrails */}
                <div className="flex items-center gap-3 text-[10px]">
                  <span className={`flex items-center gap-0.5 ${draft.hasDisclosure ? "text-green-600" : "text-amber-600"}`}>
                    <Shield className="h-3 w-3" />
                    {draft.hasDisclosure ? "Disclosure present" : "Missing disclosure"}
                  </span>
                  <span className={`flex items-center gap-0.5 ${draft.hasSource ? "text-green-600" : "text-amber-600"}`}>
                    <BookOpen className="h-3 w-3" />
                    {draft.hasSource ? "Source present" : "Missing source"}
                  </span>
                  {isOverLimit && (
                    <span className="flex items-center gap-0.5 text-red-500">
                      <AlertTriangle className="h-3 w-3" /> Over limit
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setEditing(draft.id)}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  {draft.content && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(draft.content)}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  )}
                  {draft.status === "draft" && draft.content && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setStatus(draft.id, "approved")}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Approve
                    </Button>
                  )}
                  {(draft.status === "draft" || draft.status === "approved") && draft.content && (
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setStatus(draft.id, "scheduled")}
                    >
                      <Calendar className="h-3 w-3" /> Send to Scheduler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Guardrails Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Shield className="h-4 w-4" /> Guardrails Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {drafts.map((draft) => {
              const config = PLATFORM_CONFIG[draft.platform];
              const issues: string[] = [];
              if (!draft.hasDisclosure && draft.content) issues.push("Missing pre-launch disclosure");
              if (!draft.hasSource && draft.content) issues.push("Missing resolution source");
              if (draft.content.length > draft.characterLimit) issues.push("Over character limit");
              if (!draft.content) issues.push("No content");

              return (
                <div key={draft.id} className="flex items-center gap-3 text-xs">
                  <Badge variant="outline" className="text-[10px] w-20 justify-center">
                    {config.label}
                  </Badge>
                  {issues.length === 0 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> All clear
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {issues.join(" · ")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary bar */}
      {hasDrafts && (
        <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
          <div className="text-sm">
            <strong>{drafts.filter((d) => d.status === "scheduled" || d.status === "posted").length}</strong> of {drafts.length} channels scheduled or posted
          </div>
          {allScheduledOrPosted ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" /> All published
            </Badge>
          ) : (
            <Link href="/scheduler">
              <Button size="sm" variant="outline" className="text-xs gap-1">
                Open Scheduler <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
