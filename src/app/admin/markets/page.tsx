"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { yesPrice, formatPct } from "@/lib/lmsr";
import type { Market, RiskLevel, MarketSuggestion } from "@/lib/types";
import {
  Plus,
  Check,
  X,
  Merge,
  FileText,
  Archive,
  Eye,
  CheckCircle,
  AlertTriangle,
  Search,
} from "lucide-react";

// ── Market Inbox Tab ─────────────────────────────────────────────────

const SAMPLE_SUGGESTIONS: MarketSuggestion[] = [];

function MarketInbox() {
  const [suggestions] = useState<MarketSuggestion[]>(SAMPLE_SUGGESTIONS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          AI-proposed and community-suggested markets awaiting triage.
        </p>
        <Button size="sm" className="gradient-purple text-white">
          <Plus className="h-4 w-4 mr-1" /> Run Trend Scan
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No market suggestions yet.</p>
            <p className="text-xs mt-1">
              Run a trend scan or enable the Market of the Day workflow to populate the inbox.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suggested Market Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Suggested By</TableHead>
                <TableHead>Resolve Date</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="max-w-xs truncate font-medium text-sm">
                    {s.question}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {s.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.trend_source || "—"}
                  </TableCell>
                  <TableCell className="text-xs capitalize">{s.suggested_by}</TableCell>
                  <TableCell className="text-xs">
                    {s.proposed_resolve_date
                      ? new Date(s.proposed_resolve_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <RiskBadge level={s.risk_level} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === "new" ? "default" : "outline"}
                      className="text-xs capitalize"
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Accept to Builder">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Reject">
                        <X className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Merge duplicate">
                        <Merge className="h-3.5 w-3.5" />
                      </Button>
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

// ── All Markets Tab ──────────────────────────────────────────────────

function AllMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  const loadMarkets = useCallback(async () => {
    let query = supabase.from("markets").select("*").order("created_at", { ascending: false });
    if (categoryFilter !== "all") query = query.eq("category", categoryFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    if (data) setMarkets(data);
    setLoading(false);
  }, [supabase, categoryFilter, statusFilter]);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  async function resolveMarket(marketId: string, resolution: number) {
    const { error } = await supabase.rpc("resolve_market", {
      p_market_id: marketId,
      p_resolution: resolution,
    });
    if (error) alert("Error: " + error.message);
    else loadMarkets();
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="womens-health">Women&apos;s Health</SelectItem>
            <SelectItem value="fertility">Fertility</SelectItem>
            <SelectItem value="femtech">FemTech</SelectItem>
            <SelectItem value="wellness">Wellness</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading markets...</p>
      ) : markets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No markets found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {markets.map((market) => {
            const prob = yesPrice(market.yes_shares, market.no_shares, market.liquidity_param);
            return (
              <Card key={market.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs capitalize">
                          {market.category}
                        </Badge>
                        <Badge
                          variant={market.status === "open" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {market.status}
                        </Badge>
                        {market.featured && (
                          <Badge className="text-xs gradient-purple text-white">Featured</Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{market.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPct(prob)} YES · ${market.volume.toLocaleString()} vol · Closes{" "}
                        {new Date(market.closes_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {market.status === "open" && (
                        <>
                          <Button variant="outline" size="sm" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" /> Create Drafts
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => resolveMarket(market.id, 1)}
                          >
                            YES
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => resolveMarket(market.id, 0)}
                          >
                            NO
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Archive">
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {market.status === "resolved" && (
                        <Badge
                          className={
                            market.resolution === 1
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {market.resolution === 1 ? "YES" : "NO"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Market Builder Tab ───────────────────────────────────────────────

function MarketBuilder() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("womens-health");
  const [resolveDate, setResolveDate] = useState("");
  const [resolutionCriteria, setResolutionCriteria] = useState("");
  const [resolutionSources, setResolutionSources] = useState<string[]>([""]);
  const [tags, setTags] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low");
  const [disclosureTemplate, setDisclosureTemplate] = useState("standard");
  const [whyYes, setWhyYes] = useState<string[]>([""]);
  const [whyNo, setWhyNo] = useState<string[]>([""]);
  const [whatWouldChange, setWhatWouldChange] = useState<string[]>([""]);
  const [confidence, setConfidence] = useState([50]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const validationErrors: string[] = [];
  if (!question.trim()) validationErrors.push("Market question is required");
  if (!resolveDate) validationErrors.push("Resolve date is required");
  if (!resolutionSources.some((s) => s.trim())) validationErrors.push("At least one resolution source is required");
  if (!resolutionCriteria.trim()) validationErrors.push("Resolution criteria is required");

  async function handleSaveDraft() {
    if (validationErrors.length > 0) return;
    setSaving(true);
    const { error } = await supabase.from("markets").insert({
      title: question,
      category,
      resolves_at: resolveDate,
      resolution_criteria: resolutionCriteria,
      resolution_source: resolutionSources.filter((s) => s.trim()).join(", "),
      liquidity_param: 100,
      closes_at: resolveDate,
      featured: false,
      status: "open",
    });
    if (error) alert("Error: " + error.message);
    else {
      setQuestion("");
      setResolutionCriteria("");
      setResolutionSources([""]);
      alert("Market saved as draft.");
    }
    setSaving(false);
  }

  function updateListItem(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addListItem(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => [...prev, ""]);
  }

  function removeListItem(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column: Core fields */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="builder-question">Market Question *</Label>
          <Textarea
            id="builder-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will X happen by Y?"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="womens-health">Women&apos;s Health</SelectItem>
                <SelectItem value="fertility">Fertility</SelectItem>
                <SelectItem value="femtech">FemTech</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="builder-resolve-date">Resolve By *</Label>
            <Input
              id="builder-resolve-date"
              type="datetime-local"
              value={resolveDate}
              onChange={(e) => setResolveDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="builder-criteria">Resolution Criteria *</Label>
          <Textarea
            id="builder-criteria"
            value={resolutionCriteria}
            onChange={(e) => setResolutionCriteria(e.target.value)}
            placeholder="How will this market be resolved?"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Resolution Sources *</Label>
          {resolutionSources.map((source, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={source}
                onChange={(e) => updateListItem(setResolutionSources, i, e.target.value)}
                placeholder="e.g., FDA.gov, ClinicalTrials.gov"
              />
              {resolutionSources.length > 1 && (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeListItem(setResolutionSources, i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addListItem(setResolutionSources)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Source
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="builder-tags">Tags</Label>
          <Input
            id="builder-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma-separated tags"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Risk Level *</Label>
            <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Disclosure Template</Label>
            <Select value={disclosureTemplate} onValueChange={setDisclosureTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="medical">Medical/Health</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="none">None Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Right column: Analysis & notes */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Why YES</Label>
          {whyYes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => updateListItem(setWhyYes, i, e.target.value)} placeholder="Reason this could resolve YES" />
              {whyYes.length > 1 && (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeListItem(setWhyYes, i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addListItem(setWhyYes)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Why NO</Label>
          {whyNo.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => updateListItem(setWhyNo, i, e.target.value)} placeholder="Reason this could resolve NO" />
              {whyNo.length > 1 && (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeListItem(setWhyNo, i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addListItem(setWhyNo)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          <Label>What Would Change My Mind</Label>
          {whatWouldChange.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => updateListItem(setWhatWouldChange, i, e.target.value)} placeholder="Signal that would change the odds" />
              {whatWouldChange.length > 1 && (
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeListItem(setWhatWouldChange, i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addListItem(setWhatWouldChange)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Confidence: {confidence[0]}%</Label>
          <Slider value={confidence} onValueChange={setConfidence} min={0} max={100} step={5} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="builder-notes">Notes for Editor</Label>
          <Textarea
            id="builder-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes, context, or instructions..."
            rows={4}
          />
        </div>

        {/* Validation */}
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
            <p className="text-xs font-medium text-yellow-800 mb-1">Validation</p>
            <ul className="text-xs text-yellow-700 space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSaveDraft}
            disabled={validationErrors.length > 0 || saving}
            variant="outline"
          >
            {saving ? "Saving..." : "Save Draft Market"}
          </Button>
          <Button disabled={validationErrors.length > 0} className="gradient-purple text-white">
            <Eye className="h-4 w-4 mr-1" /> Publish Preview
          </Button>
          <Button disabled={validationErrors.length > 0} variant="outline">
            <FileText className="h-4 w-4 mr-1" /> Create Drafts
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Resolutions Tab ──────────────────────────────────────────────────

function Resolutions() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("markets")
        .select("*")
        .in("status", ["open", "closed", "resolved"])
        .order("resolves_at", { ascending: true });
      if (data) setMarkets(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  function getResolutionStatus(m: Market): string {
    if (m.status === "resolved") return "resolved";
    const now = new Date();
    const resolves = new Date(m.resolves_at);
    if (resolves <= now) return "needs_verification";
    return "pending";
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Track markets approaching resolution and verify outcomes.
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : markets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No markets to resolve.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Resolve By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification Source</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Resolved Post</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {markets.map((m) => {
                const resStatus = getResolutionStatus(m);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="max-w-xs truncate font-medium text-sm">
                      {m.title}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(m.resolves_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          resStatus === "resolved" ? "secondary" : resStatus === "needs_verification" ? "destructive" : "outline"
                        }
                        className="text-xs capitalize"
                      >
                        {resStatus.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.resolution_source || "—"}
                    </TableCell>
                    <TableCell>
                      {m.resolution !== null ? (
                        <Badge className={m.resolution === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {m.resolution === 1 ? "YES" : "NO"}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {m.status === "resolved" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {resStatus === "needs_verification" && (
                        <div className="flex gap-1 justify-end">
                          <Button variant="outline" size="sm" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Verify
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" /> Gen Post
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

// ── Risk Badge Component ─────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  const cls =
    level === "high"
      ? "bg-red-100 text-red-700 border-red-200"
      : level === "medium"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-green-100 text-green-700 border-green-200";
  return (
    <Badge variant="outline" className={`text-xs capitalize ${cls}`}>
      {level}
    </Badge>
  );
}

// ── Main Markets Page ────────────────────────────────────────────────

export default function AdminMarketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Markets</h1>
        <p className="text-sm text-muted-foreground">
          Manage market pipeline from suggestion to resolution.
        </p>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="mt-4">
          <MarketInbox />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <AllMarkets />
        </TabsContent>
        <TabsContent value="builder" className="mt-4">
          <MarketBuilder />
        </TabsContent>
        <TabsContent value="resolutions" className="mt-4">
          <Resolutions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
