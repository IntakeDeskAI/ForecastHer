"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import type { ContentDraft, DraftStatus, Platform, RiskLevel, DraftFormat } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Trash2,
  Edit3,
  Lock,
  Eye,
  Link,
  Image,
  RefreshCw,
  Download,
  Clock,
  FileText,
  Search,
  Plus,
  Hash,
  Sparkles,
} from "lucide-react";

// ── Draft Queue Tab ──────────────────────────────────────────────────

function DraftQueue() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [drafts] = useState<ContentDraft[]>([]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="x">X</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" /> Approve Low Risk
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Send className="h-3 w-3 mr-1" /> Schedule Selected
          </Button>
        </div>
      </div>

      {drafts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-10">
            <div className="text-center mb-6">
              <FileText className="h-10 w-10 mx-auto mb-3 text-purple-400" />
              <h3 className="font-semibold text-base">No drafts in the queue</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Your content pipeline is empty. Run the quickstart to generate draft posts
                from AI-proposed markets, ready for your review.
              </p>
            </div>

            <div className="max-w-lg mx-auto space-y-3">
              <div className="rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg gradient-purple text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">1-Minute Quickstart</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generate 3 markets with sources, create drafts for X and Instagram,
                      generate card assets, and build a schedule plan (no posting).
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" className="gradient-purple text-white text-xs gap-1">
                        <Sparkles className="h-3 w-3" /> Run Quickstart
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <Send className="h-3 w-3" /> Generate from Existing Markets
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground px-2">
                <div className="flex-1 border-t" />
                <span>or</span>
                <div className="flex-1 border-t" />
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" className="text-xs">
                  Write a Draft Manually
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Enable Market of the Day Workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Draft Title</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Citations</TableHead>
                <TableHead>Disclosure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded" />
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate font-medium text-sm">
                    {d.hook || "Untitled"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                    {d.market_title || "—"}
                  </TableCell>
                  <TableCell>
                    <PlatformBadge platform={d.platform} />
                  </TableCell>
                  <TableCell className="text-xs capitalize">{d.format.replace("_", " ")}</TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell className="text-xs font-mono">{d.confidence}%</TableCell>
                  <TableCell>
                    <RiskBadge level={d.risk_level} />
                  </TableCell>
                  <TableCell className="text-xs font-mono">{d.citations.length}</TableCell>
                  <TableCell>
                    {d.disclosure_line ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
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

// ── Editor Tab ───────────────────────────────────────────────────────

function DraftEditor() {
  const [hook, setHook] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [disclosureLine, setDisclosureLine] = useState(
    "Illustrative odds only. Not financial or medical advice. Play money beta."
  );
  const [utmLink, setUtmLink] = useState("");
  const [platform, setPlatform] = useState<Platform>("x");

  const complianceChecks = [
    { rule: "Disclosure present", passed: !!disclosureLine.trim(), detail: null },
    { rule: "No medical advice language", passed: true, detail: null },
    { rule: "No invented metrics", passed: true, detail: null },
    { rule: "Citations present", passed: false, detail: "No citations added yet" },
    { rule: "Pre-launch label used", passed: disclosureLine.toLowerCase().includes("illustrative") || disclosureLine.toLowerCase().includes("play money"), detail: null },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Content fields */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x">X (Twitter)</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">New Draft</Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-hook">Hook</Label>
          <Input
            id="editor-hook"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="Attention-grabbing opening line..."
          />
          <p className="text-xs text-muted-foreground">{hook.length} chars</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-body">Body</Label>
          <Textarea
            id="editor-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Main content..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground">{body.length} chars</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-cta">CTA</Label>
          <Input
            id="editor-cta"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="Join the waitlist at forcasther.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-hashtags">
            <Hash className="h-3 w-3 inline mr-1" />
            Hashtags
          </Label>
          <Input
            id="editor-hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#ForecastHer #WomensHealth #PredictionMarkets"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-first-comment">First Comment</Label>
          <Textarea
            id="editor-first-comment"
            value={firstComment}
            onChange={(e) => setFirstComment(e.target.value)}
            placeholder="Follow-up comment to boost engagement..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-disclosure">Disclosure Line</Label>
          <Textarea
            id="editor-disclosure"
            value={disclosureLine}
            onChange={(e) => setDisclosureLine(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-utm">
            <Link className="h-3 w-3 inline mr-1" />
            UTM Link
          </Label>
          <Input
            id="editor-utm"
            value={utmLink}
            onChange={(e) => setUtmLink(e.target.value)}
            placeholder="https://forcasther.com/?utm_source=x&utm_medium=social"
          />
        </div>
      </div>

      {/* Right: Preview + Compliance */}
      <div className="space-y-4">
        {/* Preview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview ({platform})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
              {hook && <p className="font-semibold">{hook}</p>}
              {body && <p className="whitespace-pre-wrap">{body}</p>}
              {cta && <p className="text-purple-dark font-medium">{cta}</p>}
              {hashtags && <p className="text-muted-foreground text-xs">{hashtags}</p>}
              {disclosureLine && (
                <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">
                  {disclosureLine}
                </p>
              )}
              {!hook && !body && (
                <p className="text-muted-foreground text-center py-4">Start typing to see preview...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Citations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4" /> Citations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-xs">No citations added. Click below to add sources.</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Citation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Checks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Compliance Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {check.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <span className={check.passed ? "" : "text-muted-foreground"}>{check.rule}</span>
                  {check.detail && (
                    <span className="text-xs text-muted-foreground ml-auto">{check.detail}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Approval Workflow */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve Copy
          </Button>
          <Button variant="outline" size="sm">
            <Image className="h-3.5 w-3.5 mr-1" /> Approve Assets
          </Button>
          <Button variant="outline" size="sm">
            <Lock className="h-3.5 w-3.5 mr-1" /> Lock
          </Button>
          <Button className="gradient-purple text-white" size="sm">
            <Send className="h-3.5 w-3.5 mr-1" /> Send to Scheduler
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Asset Generator Tab ──────────────────────────────────────────────

function AssetGenerator() {
  const [marketQuestion, setMarketQuestion] = useState("");
  const [oddsLabel, setOddsLabel] = useState("beta_credits");
  const [resolveDate, setResolveDate] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("womens-health");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Market Question</Label>
          <Textarea
            value={marketQuestion}
            onChange={(e) => setMarketQuestion(e.target.value)}
            placeholder="Will a new non-hormonal menopause treatment receive full FDA approval in 2026?"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Odds Label</Label>
            <Select value={oddsLabel} onValueChange={setOddsLabel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beta_credits">Beta Credits</SelectItem>
                <SelectItem value="illustrative">Illustrative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Resolve Date</Label>
            <Input type="date" value={resolveDate} onChange={(e) => setResolveDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryIcon} onValueChange={setCategoryIcon}>
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
        <Separator />
        <div className="flex gap-3">
          <Button className="gradient-purple text-white">
            <Image className="h-4 w-4 mr-1" /> Generate All
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
          </Button>
        </div>
      </div>

      {/* Output previews */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Generated Assets</h3>
        <div className="grid grid-cols-2 gap-3">
          {["Square Card", "Story Card", "Carousel P1", "Thumbnail", "Resolved Badge"].map((label) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center mb-2">
                  <Image className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-xs font-medium text-center">{label}</p>
                <div className="flex gap-1 justify-center mt-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6" title="Export to draft">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" title="Version history">
                    <Clock className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Templates Tab ────────────────────────────────────────────────────

const TEMPLATES = [
  { name: "Market Card", format: "card_caption", variables: ["market_question", "resolve_date", "why_yes", "why_no", "cta", "disclosure", "sources"] },
  { name: "Resolved Card", format: "card_caption", variables: ["market_question", "outcome", "resolve_date", "disclosure"] },
  { name: "X Thread", format: "thread", variables: ["market_question", "why_yes", "why_no", "cta", "disclosure", "sources"] },
  { name: "LinkedIn Post", format: "single_post", variables: ["market_question", "why_yes", "why_no", "cta", "disclosure"] },
  { name: "TikTok Script", format: "short_script", variables: ["market_question", "hook", "why_yes", "why_no", "cta"] },
  { name: "Weekly Email", format: "weekly_digest", variables: ["analytics", "markets", "cta", "disclosure"] },
];

function Templates() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Content templates with injectable variables. Each accepts the style guide as context.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <Card key={t.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-xs mb-3">{t.format.replace("_", " ")}</Badge>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {t.variables.map((v) => (
                    <Badge key={v} variant="secondary" className="text-[10px] font-mono">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                <Edit3 className="h-3 w-3 mr-1" /> Edit Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Style Guide Tab ──────────────────────────────────────────────────

function StyleGuide() {
  const [forbiddenPhrases, setForbiddenPhrases] = useState(
    "guaranteed returns, proven results, medical advice, doctor recommended, cure, treatment plan, invest now, real money"
  );
  const [disclosureRules, setDisclosureRules] = useState(
    "Every post mentioning odds, volume, profit, returns, trading, or leaderboard MUST include disclosure.\nDefault: \"Illustrative odds only. Not financial or medical advice. Play money beta.\""
  );
  const [medicalRestrictions, setMedicalRestrictions] = useState(
    "Never claim to diagnose, treat, cure, or prevent any disease.\nAlways say \"may\" or \"could\" instead of definitive statements.\nLink to official sources (FDA, NIH) for any health claims."
  );
  const [toneExamples, setToneExamples] = useState(
    "Confident but not arrogant. Informative, not preachy.\nUse \"we\" sparingly — focus on \"you\" and the community.\nCelebrate women's achievements without being condescending."
  );
  const [emojiPolicy, setEmojiPolicy] = useState(
    "Allowed: 🔮 ✨ 📊 💡 🎯 🏆\nAvoid: 🔥 💰 🚀 (too hype-y)\nMax 2 emoji per post. Zero in disclosure lines."
  );
  const [hashtagPolicy, setHashtagPolicy] = useState(
    "Always include: #ForecastHer\nRotate from: #WomensHealth #FemTech #PredictionMarkets #WomenInScience\nMax 5 hashtags on X, 15 on Instagram."
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="text-sm text-muted-foreground">
        Editable rules fed into every AI content generation prompt.
      </p>

      {[
        { label: "Forbidden Phrases", value: forbiddenPhrases, setter: setForbiddenPhrases },
        { label: "Disclosure Rules", value: disclosureRules, setter: setDisclosureRules },
        { label: "Medical Claims Restrictions", value: medicalRestrictions, setter: setMedicalRestrictions },
        { label: "Tone Examples", value: toneExamples, setter: setToneExamples },
        { label: "Emoji Policy", value: emojiPolicy, setter: setEmojiPolicy },
        { label: "Hashtag Policy", value: hashtagPolicy, setter: setHashtagPolicy },
      ].map((field) => (
        <div key={field.label} className="space-y-2">
          <Label>{field.label}</Label>
          <Textarea
            value={field.value}
            onChange={(e) => field.setter(e.target.value)}
            rows={3}
            className="font-mono text-xs"
          />
        </div>
      ))}

      <Button className="gradient-purple text-white">Save Style Guide</Button>
    </div>
  );
}

// ── Shared Badge Components ──────────────────────────────────────────

function StatusBadge({ status }: { status: DraftStatus }) {
  const variants: Record<DraftStatus, string> = {
    new: "bg-blue-100 text-blue-700",
    needs_review: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    scheduled: "bg-purple-100 text-purple-700",
    posted: "bg-gray-100 text-gray-700",
    blocked: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="outline" className={`text-xs capitalize ${variants[status]}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const labels: Record<Platform, string> = {
    x: "X",
    instagram: "IG",
    tiktok: "TT",
    linkedin: "LI",
    email: "Email",
  };
  return (
    <Badge variant="outline" className="text-xs">
      {labels[platform]}
    </Badge>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const cls =
    level === "high"
      ? "bg-red-100 text-red-700"
      : level === "medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";
  return (
    <Badge variant="outline" className={`text-xs capitalize ${cls}`}>
      {level}
    </Badge>
  );
}

// ── Main Content Studio Page ─────────────────────────────────────────

export default function ContentStudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Content Studio</h1>
        <p className="text-sm text-muted-foreground">
          Create, review, and approve content for all platforms.
        </p>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Draft Queue</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="assets">Asset Generator</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="style">Style Guide</TabsTrigger>
        </TabsList>
        <TabsContent value="queue" className="mt-4">
          <DraftQueue />
        </TabsContent>
        <TabsContent value="editor" className="mt-4">
          <DraftEditor />
        </TabsContent>
        <TabsContent value="assets" className="mt-4">
          <AssetGenerator />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <Templates />
        </TabsContent>
        <TabsContent value="style" className="mt-4">
          <StyleGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}
