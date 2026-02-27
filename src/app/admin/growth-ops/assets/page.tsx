"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Package,
  Image,
  FileText,
  Link2,
  CheckCircle,
  Loader2,
  Plus,
  Copy,
  Pencil,
  Trash2,
  BarChart3,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface Asset {
  id: string;
  type: "market" | "image" | "script" | "utm";
  label: string;
  platform?: string;
  status: "ready" | "draft" | "missing";
  preview?: string;
}

interface ScriptTemplate {
  id: string;
  name: string;
  platform: string;
  template: string;
  variables: string[];
}

interface UTMLink {
  id: string;
  url: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  fullUrl: string;
}

interface GeneratedPack {
  markets: Array<{ question: string; category: string; resolvesBy: string; resolutionCriteria: string }>;
  scripts: Array<{ platform: string; marketIndex: number; content: string }>;
  utms: Array<{ source: string; medium: string; campaign: string; content: string; fullUrl: string }>;
}

/* ═══════════════════════════════════════════════════════════════════════
   INITIAL STATE
   ═══════════════════════════════════════════════════════════════════════ */

const INITIAL_INVENTORY: Asset[] = [];
const INITIAL_TEMPLATES: ScriptTemplate[] = [
  {
    id: "t1",
    name: "X Market Hook",
    platform: "x",
    template: "{{hook}}\n\nResolution: {{resolution_criteria}}\n\nOdds: {{yes_pct}}% Yes\n\nWhat do you think?\n\nForcast the future → {{link}}\n\n(Illustrative, pre-launch)",
    variables: ["hook", "resolution_criteria", "yes_pct", "link"],
  },
  {
    id: "t2",
    name: "Instagram Caption",
    platform: "ig",
    template: "{{hook}}\n\n🔮 Resolution: {{resolution_criteria}}\n📊 Current odds: {{yes_pct}}% Yes\n\nWhat's your forecast? Comment below 👇\n\n#ForecastHer #WomenInPrediction #FemTech",
    variables: ["hook", "resolution_criteria", "yes_pct"],
  },
  {
    id: "t3",
    name: "TikTok Script",
    platform: "tiktok",
    template: "Hook: {{hook}}\n\nBody: Here's a real prediction market where you can put a number on it. The resolution criteria is: {{resolution_criteria}}. Right now the crowd says {{yes_pct}}% yes.\n\nCTA: Follow for more markets you can actually audit.",
    variables: ["hook", "resolution_criteria", "yes_pct"],
  },
  {
    id: "t4",
    name: "LinkedIn Post",
    platform: "linkedin",
    template: "{{hook}}\n\nAt ForecastHer, every market has transparent resolution criteria:\n→ {{resolution_criteria}}\n\nCurrent crowd odds: {{yes_pct}}% Yes\n\nPrediction markets aren't just for finance. They're for anyone who wants to put a number on the future.\n\n{{link}}",
    variables: ["hook", "resolution_criteria", "yes_pct", "link"],
  },
];

const PLATFORM_LABELS: Record<string, string> = {
  x: "X",
  ig: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  email: "Email",
};

export default function AssetsPage() {
  const [inventory, setInventory] = useState<Asset[]>(INITIAL_INVENTORY);
  const [templates, setTemplates] = useState<ScriptTemplate[]>(INITIAL_TEMPLATES);
  const [utmLinks, setUtmLinks] = useState<UTMLink[]>([]);
  const [generating, setGenerating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editTemplateText, setEditTemplateText] = useState("");

  // UTM builder state
  const [utmUrl, setUtmUrl] = useState("https://forecasther.ai");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");

  // Inventory counts
  const counts = {
    markets: inventory.filter((a) => a.type === "market" && a.status === "ready").length,
    images: inventory.filter((a) => a.type === "image" && a.status === "ready").length,
    scripts: inventory.filter((a) => a.type === "script" && a.status === "ready").length,
    utms: utmLinks.length,
  };

  const [generatedPack, setGeneratedPack] = useState<GeneratedPack | null>(null);
  const [genError, setGenError] = useState("");

  async function handleGenerateWeekPack() {
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/admin/growth-ops/generate-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "week", dayCount: 7 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error || "Generation failed.");
        setGenerating(false);
        return;
      }
      setGeneratedPack(data.pack);
      // Build inventory from generated pack
      const newAssets: Asset[] = [];
      data.pack.markets?.forEach((m: { question: string }, i: number) => {
        newAssets.push({
          id: `mkt-${i}`,
          type: "market",
          label: m.question,
          status: "ready",
        });
      });
      data.pack.scripts?.forEach(
        (s: { platform: string; marketIndex: number; content: string }, i: number) => {
          newAssets.push({
            id: `scr-${i}`,
            type: "script",
            label: `Day ${s.marketIndex + 1} — ${PLATFORM_LABELS[s.platform] ?? s.platform}`,
            platform: s.platform,
            status: "ready",
            preview: s.content,
          });
        }
      );
      setInventory(newAssets);
      // Auto-create UTM links
      const newUtms: UTMLink[] = (data.pack.utms ?? []).map(
        (u: { source: string; medium: string; campaign: string; content: string; fullUrl: string }, i: number) => ({
          id: `utm-gen-${i}`,
          url: "https://forecasther.ai",
          source: u.source,
          medium: u.medium,
          campaign: u.campaign,
          content: u.content,
          fullUrl: u.fullUrl,
        })
      );
      setUtmLinks((prev) => [...prev, ...newUtms]);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setGenerating(false);
    }
  }

  function buildUtmUrl(): string {
    const params = new URLSearchParams();
    if (utmSource) params.set("utm_source", utmSource);
    if (utmMedium) params.set("utm_medium", utmMedium);
    if (utmCampaign) params.set("utm_campaign", utmCampaign);
    if (utmContent) params.set("utm_content", utmContent);
    const qs = params.toString();
    return qs ? `${utmUrl}?${qs}` : utmUrl;
  }

  function addUtmLink() {
    if (!utmSource || !utmMedium || !utmCampaign) return;
    const link: UTMLink = {
      id: `utm-${Date.now()}`,
      url: utmUrl,
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      content: utmContent,
      fullUrl: buildUtmUrl(),
    };
    setUtmLinks((prev) => [...prev, link]);
    setUtmSource("");
    setUtmMedium("");
    setUtmContent("");
  }

  function removeUtmLink(id: string) {
    setUtmLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function startEditTemplate(t: ScriptTemplate) {
    setEditingTemplate(t.id);
    setEditTemplateText(t.template);
  }

  function saveTemplate(id: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, template: editTemplateText } : t))
    );
    setEditingTemplate(null);
  }

  return (
    <div className="space-y-6">
      {/* Week Pack Generator */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base font-serif">Week Pack Generator</CardTitle>
            </div>
            <Button
              onClick={handleGenerateWeekPack}
              disabled={generating}
              className="gradient-purple text-white gap-1"
              size="sm"
            >
              {generating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" /> Generate Week 1 Pack
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            AI generates a complete week of assets: 7 markets, 7 X posts, 7 IG captions, 7 TikTok scripts, 7 LinkedIn posts, 7 UTM links.
          </p>
          {genError && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400 mb-3">
              {genError}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <BarChart3 className="h-4 w-4 mx-auto text-purple-500 mb-1" />
              <div className="text-lg font-bold font-mono">{counts.markets}</div>
              <div className="text-xs text-muted-foreground">Markets ready</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Image className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <div className="text-lg font-bold font-mono">{counts.images}</div>
              <div className="text-xs text-muted-foreground">Cards ready</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <FileText className="h-4 w-4 mx-auto text-green-500 mb-1" />
              <div className="text-lg font-bold font-mono">{counts.scripts}</div>
              <div className="text-xs text-muted-foreground">Scripts ready</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Link2 className="h-4 w-4 mx-auto text-orange-500 mb-1" />
              <div className="text-lg font-bold font-mono">{counts.utms}</div>
              <div className="text-xs text-muted-foreground">UTMs ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Inventory */}
      {inventory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif">Asset Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="text-sm">{asset.label}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {asset.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {asset.platform ? PLATFORM_LABELS[asset.platform] ?? asset.platform : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asset.status === "ready"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : asset.status === "draft"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                        }
                      >
                        {asset.status === "ready" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {asset.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {inventory.length === 0 && !generatedPack && (
        <Card>
          <CardContent className="py-10 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-base">No assets yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a Week Pack to populate your asset inventory, or create assets individually.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Pack Preview */}
      {generatedPack && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" /> Generated Pack
              </CardTitle>
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                {generatedPack.markets.length} markets, {generatedPack.scripts.length} scripts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Markets */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Markets</h4>
              {generatedPack.markets.map((m, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">Day {i + 1}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{m.category}</Badge>
                  </div>
                  <p className="text-sm font-medium">{m.question}</p>
                  <p className="text-xs text-muted-foreground">{m.resolutionCriteria}</p>
                  <p className="text-[10px] text-muted-foreground">Resolves by: {m.resolvesBy}</p>
                </div>
              ))}
            </div>

            {/* Scripts (expandable) */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Scripts ({generatedPack.scripts.length})</h4>
              {generatedPack.scripts.map((s, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {PLATFORM_LABELS[s.platform] ?? s.platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Day {s.marketIndex + 1}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(s.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 rounded p-2 max-h-32 overflow-y-auto">
                    {s.content}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* UTM Link Builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Link2 className="h-4 w-4" /> UTM Link Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">URL</Label>
              <Input
                value={utmUrl}
                onChange={(e) => setUtmUrl(e.target.value)}
                placeholder="https://forecasther.ai"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Select value={utmSource} onValueChange={setUtmSource}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x">X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="dm">DM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Medium</Label>
              <Select value={utmMedium} onValueChange={setUtmMedium}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="dm">DM</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Campaign</Label>
              <Input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="week1-motd"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Content</Label>
              <Input
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                placeholder="hook-variant-a"
                className="text-sm"
              />
            </div>
          </div>

          {/* Preview */}
          {(utmSource || utmMedium || utmCampaign) && (
            <div className="flex items-center gap-2 bg-muted/50 rounded px-3 py-2">
              <code className="text-xs break-all flex-1">{buildUtmUrl()}</code>
              <Button size="sm" variant="ghost" className="h-6 px-2 shrink-0" onClick={() => copyToClipboard(buildUtmUrl())}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          <Button size="sm" onClick={addUtmLink} disabled={!utmSource || !utmMedium || !utmCampaign}>
            <Plus className="h-3 w-3 mr-1" /> Add UTM Link
          </Button>

          {/* UTM list */}
          {utmLinks.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Medium</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {utmLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="text-xs">{link.source}</TableCell>
                    <TableCell className="text-xs">{link.medium}</TableCell>
                    <TableCell className="text-xs">{link.campaign}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{link.content || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyToClipboard(link.fullUrl)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => removeUtmLink(link.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <FileText className="h-4 w-4" /> Script Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.map((t) => (
            <div key={t.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {PLATFORM_LABELS[t.platform] ?? t.platform}
                  </Badge>
                  <span className="text-sm font-medium">{t.name}</span>
                </div>
                {editingTemplate === t.id ? (
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" className="h-6 text-xs" onClick={() => saveTemplate(t.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditingTemplate(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => startEditTemplate(t)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {editingTemplate === t.id ? (
                <Textarea
                  value={editTemplateText}
                  onChange={(e) => setEditTemplateText(e.target.value)}
                  rows={5}
                  className="font-mono text-xs"
                />
              ) : (
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded p-2 font-mono">
                  {t.template}
                </pre>
              )}
              <div className="flex gap-1 flex-wrap">
                {t.variables.map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px] font-mono">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
