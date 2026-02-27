"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  MarketCandidate,
  PromptTemplate,
  PromptType,
  WhitelistedSource,
  RSSFeed,
  TrendInput,
  GuardrailSwitch,
  AIRunLog,
  Platform,
  RiskLevel,
  GenerateConfig,
} from "@/lib/types";
import {
  Sparkles,
  Play,
  FileText,
  Globe,
  Shield,
  ScrollText,
  Plus,
  Trash2,
  Lock,
  Unlock,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye,
  Clock,
  Zap,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUp,
  ArrowUpDown,
  ShieldAlert,
  Loader2,
  FlaskConical,
} from "lucide-react";
import { HowItWorks } from "@/components/how-it-works";

// ── Sample Data ───────────────────────────────────────────────────────

const CATEGORIES = [
  "Women's Health",
  "Femtech",
  "Reproductive Rights",
  "Wellness",
  "Policy & Regulation",
  "Research & Science",
  "Business & Funding",
  "Culture & Society",
];

const SAMPLE_CANDIDATES: MarketCandidate[] = [
  {
    id: "mc-1",
    question: "Will the FDA approve an over-the-counter birth control pill by July 2026?",
    resolve_by: "2026-07-31",
    resolution_criteria: "FDA issues formal approval letter for any OTC oral contraceptive. Source: FDA press releases at fda.gov/news-events.",
    sources_found: [
      { url: "https://fda.gov/news-events", title: "FDA Newsroom", domain: "fda.gov", summary: "Official FDA announcements", fetched_at: "2026-02-26T08:00:00Z", reliability_score: 0.98 },
      { url: "https://reuters.com/health", title: "Reuters Health", domain: "reuters.com", summary: "Reuters coverage of FDA decisions", fetched_at: "2026-02-26T08:00:00Z", reliability_score: 0.92 },
    ],
    confidence: 0.82,
    engagement_score: 87,
    risk_flags: [],
    risk_level: "low",
    category: "Women's Health",
    why_yes: "Advisory committee recommended approval in late 2025. Manufacturer submitted final data.",
    why_no: "FDA has requested additional safety monitoring data. Timeline may slip.",
    what_changes: "FDA advisory committee vote or formal response letter.",
    status: "proposed",
  },
  {
    id: "mc-2",
    question: "Will a major US employer announce fertility benefits expansion in Q1 2026?",
    resolve_by: "2026-03-31",
    resolution_criteria: "Any Fortune 500 company publicly announces new or expanded fertility/IVF coverage. Source: company press release or SEC filing.",
    sources_found: [
      { url: "https://bloomberg.com/benefits", title: "Bloomberg Benefits Coverage", domain: "bloomberg.com", summary: "Corporate benefits trends", fetched_at: "2026-02-26T08:00:00Z", reliability_score: 0.90 },
    ],
    confidence: 0.71,
    engagement_score: 74,
    risk_flags: ["Only 1 source found"],
    risk_level: "low",
    category: "Business & Funding",
    why_yes: "Multiple companies signaled interest at benefits conferences in January.",
    why_no: "Economic headwinds may delay benefits expansions.",
    what_changes: "Q1 earnings calls or HR announcements.",
    status: "proposed",
  },
  {
    id: "mc-3",
    question: "Will menopause-focused startups raise over $100M total in 2026?",
    resolve_by: "2026-12-31",
    resolution_criteria: "Combined disclosed funding rounds for menopause/perimenopause startups exceed $100M in 2026. Source: Crunchbase or PitchBook data.",
    sources_found: [
      { url: "https://crunchbase.com", title: "Crunchbase", domain: "crunchbase.com", summary: "Startup funding database", fetched_at: "2026-02-26T08:00:00Z", reliability_score: 0.88 },
      { url: "https://femtechinsider.com", title: "Femtech Insider", domain: "femtechinsider.com", summary: "Femtech funding tracker", fetched_at: "2026-02-26T08:00:00Z", reliability_score: 0.82 },
    ],
    confidence: 0.65,
    engagement_score: 69,
    risk_flags: ["Long resolution window", "Aggregate metric hard to verify"],
    risk_level: "medium",
    category: "Femtech",
    why_yes: "2025 saw $78M raised. Investor interest growing. Several companies in late-stage rounds.",
    why_no: "VC market still cautious. Many rounds may not be disclosed.",
    what_changes: "Major funding announcements or VC market shifts.",
    status: "proposed",
  },
];

const SAMPLE_PROMPTS: PromptTemplate[] = [
  {
    id: "p-1",
    name: "propose_markets_v1",
    type: "market_proposal",
    version: 3,
    content: `You are a market research analyst for ForecastHer, a prediction market focused on women's health and femtech.

Given the following trend data and constraints, propose {{volume}} market candidates.

TRENDS:
{{trends}}

CONSTRAINTS:
- Categories allowed: {{categories}}
- Risk ceiling: {{risk_ceiling}}
- Minimum sources required: {{require_sources_min}}

For each market, provide:
1. A clear yes/no question
2. Resolution date (specific datetime)
3. Resolution criteria (painfully specific — what exactly must happen)
4. At least one credible resolution source URL
5. Why yes / Why no / What changes my mind
6. Risk label and any risk flags

Output as JSON array.`,
    variables: ["volume", "trends", "categories", "risk_ceiling", "require_sources_min"],
    is_locked: false,
    last_used: "2026-02-25T14:30:00Z",
    performance_stats: { uses: 12, avg_confidence: 0.76, avg_engagement: 72, compliance_pass_rate: 0.92 },
    examples: ["Output: [{question: '...', resolve_by: '...', ...}]"],
    versions: [
      { version: 3, content: "...", changed_by: "admin", changed_at: "2026-02-25T14:30:00Z", note: "Added risk flags requirement" },
      { version: 2, content: "...", changed_by: "admin", changed_at: "2026-02-20T10:00:00Z", note: "Added resolution source requirement" },
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-15T09:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-15T09:00:00Z",
    updated_at: "2026-02-25T14:30:00Z",
  },
  {
    id: "p-2",
    name: "fetch_and_summarize_sources_v1",
    type: "research_summarizer",
    version: 2,
    content: `Given the following market candidate, find and summarize credible sources.

MARKET:
{{market_question}}

Requirements:
- Find at least {{min_sources}} sources
- Each source must include: URL, title, domain, summary, reliability assessment
- Flag any sources older than {{max_age_hours}} hours
- Identify the single best resolution source

Output as JSON.`,
    variables: ["market_question", "min_sources", "max_age_hours"],
    is_locked: false,
    last_used: "2026-02-25T14:35:00Z",
    performance_stats: { uses: 8, avg_confidence: 0.80, avg_engagement: 0, compliance_pass_rate: 1.0 },
    examples: [],
    versions: [
      { version: 2, content: "...", changed_by: "admin", changed_at: "2026-02-25T14:35:00Z", note: "Added freshness check" },
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-16T11:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-16T11:00:00Z",
    updated_at: "2026-02-25T14:35:00Z",
  },
  {
    id: "p-3",
    name: "score_markets_v1",
    type: "market_scoring",
    version: 1,
    content: `Score the following market candidates on these dimensions:

MARKETS:
{{markets_json}}

Scoring criteria:
- Engagement score (0-100): How likely is this to generate discussion?
- Clarity score (0-100): How unambiguous is the question and resolution criteria?
- Controversy score (0-100): How split will opinions be?
- Risk score (0-100): How likely is this to cause PR or compliance issues?

Rank by: engagement * clarity * (100 - risk) / 10000

Output as ranked JSON array.`,
    variables: ["markets_json"],
    is_locked: true,
    last_used: "2026-02-25T14:40:00Z",
    performance_stats: { uses: 6, avg_confidence: 0, avg_engagement: 0, compliance_pass_rate: 1.0 },
    examples: [],
    versions: [
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-18T08:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-18T08:00:00Z",
    updated_at: "2026-02-18T08:00:00Z",
  },
  {
    id: "p-4",
    name: "platform_drafts_v1",
    type: "platform_writer",
    version: 2,
    content: `Write platform-specific content for this market:

MARKET PACKET:
{{market_packet}}

PLATFORM: {{platform}}
TONE: {{tone}}
DISCLOSURE: {{disclosure}}

Requirements:
- Hook (attention-grabbing first line)
- Body (platform-appropriate length)
- CTA (join waitlist / explore)
- Hashtags (3-5 relevant)
- Disclosure line (REQUIRED, must be included verbatim)

Never claim the product is live. Never invent numbers.
Pre-launch CTAs only: "Join the Waitlist" or "Explore Market Preview."

Output as JSON with fields: hook, body, cta, hashtags, disclosure.`,
    variables: ["market_packet", "platform", "tone", "disclosure"],
    is_locked: false,
    last_used: "2026-02-26T08:00:00Z",
    performance_stats: { uses: 15, avg_confidence: 0.84, avg_engagement: 78, compliance_pass_rate: 0.87 },
    examples: [],
    versions: [
      { version: 2, content: "...", changed_by: "admin", changed_at: "2026-02-24T12:00:00Z", note: "Strengthened pre-launch guardrails" },
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-17T09:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-17T09:00:00Z",
    updated_at: "2026-02-24T12:00:00Z",
  },
  {
    id: "p-5",
    name: "compliance_rewrite_v1",
    type: "compliance_rewrite",
    version: 1,
    content: `Review and rewrite the following draft to ensure compliance:

DRAFT:
{{draft_text}}

PLATFORM: {{platform}}

Check for:
- Missing disclosure line
- Health advice (block)
- Real money implications (block)
- Numeric claims without sources
- Pre-launch disclaimer present
- No "Start Trading" or "Trade Now" language

If issues found, rewrite with fixes. Show diff.

Output as JSON: { passes: boolean, issues: [...], rewritten: "..." }`,
    variables: ["draft_text", "platform"],
    is_locked: true,
    last_used: null,
    performance_stats: { uses: 0, avg_confidence: 0, avg_engagement: 0, compliance_pass_rate: 0 },
    examples: [],
    versions: [
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-20T10:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-20T10:00:00Z",
    updated_at: "2026-02-20T10:00:00Z",
  },
  {
    id: "p-6",
    name: "hook_generator_v1",
    type: "hook_generator",
    version: 1,
    content: `Generate {{count}} hook variants for this market:

MARKET: {{market_question}}
PLATFORM: {{platform}}
TONE: Engaging, empowering, never condescending.

Each hook must:
- Be under {{max_chars}} characters
- Not make health claims
- Not imply the product is live
- Create curiosity without clickbait

Output as JSON array of strings.`,
    variables: ["count", "market_question", "platform", "max_chars"],
    is_locked: false,
    last_used: null,
    performance_stats: { uses: 0, avg_confidence: 0, avg_engagement: 0, compliance_pass_rate: 0 },
    examples: [],
    versions: [
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-22T15:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-22T15:00:00Z",
    updated_at: "2026-02-22T15:00:00Z",
  },
  {
    id: "p-7",
    name: "weekly_digest_v1",
    type: "weekly_digest",
    version: 1,
    content: `Generate a weekly digest email draft.

TOP MARKETS THIS WEEK:
{{markets}}

ANALYTICS SUMMARY:
{{analytics}}

Requirements:
- Subject line (compelling, under 60 chars)
- Preview text (under 90 chars)
- Intro paragraph
- Top 3 markets with resolution status
- CTA: "Explore More Markets"
- Disclosure footer

Output as JSON: { subject, preview, body_html, disclosure }`,
    variables: ["markets", "analytics"],
    is_locked: false,
    last_used: null,
    performance_stats: { uses: 0, avg_confidence: 0, avg_engagement: 0, compliance_pass_rate: 0 },
    examples: [],
    versions: [
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-23T09:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-23T09:00:00Z",
    updated_at: "2026-02-23T09:00:00Z",
  },
  {
    id: "p-8",
    name: "comment_reply_v1",
    type: "comment_reply",
    version: 1,
    content: `Suggest a reply to this comment on our post:

COMMENT: {{comment_text}}
POST CONTEXT: {{post_context}}
PLATFORM: {{platform}}

Guidelines:
- Friendly, knowledgeable tone
- Never give health advice
- If asking about real money: clarify play money beta
- If confused about resolution: point to resolution criteria
- Keep under {{max_chars}} characters

Output 3 reply options as JSON array.`,
    variables: ["comment_text", "post_context", "platform", "max_chars"],
    is_locked: false,
    last_used: null,
    performance_stats: { uses: 0, avg_confidence: 0, avg_engagement: 0, compliance_pass_rate: 0 },
    examples: [],
    versions: [
      { version: 1, content: "...", changed_by: "admin", changed_at: "2026-02-23T11:00:00Z", note: "Initial version" },
    ],
    created_at: "2026-02-23T11:00:00Z",
    updated_at: "2026-02-23T11:00:00Z",
  },
];

const SAMPLE_SOURCES: WhitelistedSource[] = [
  { id: "s-1", domain: "fda.gov", name: "U.S. Food & Drug Administration", type: "government", reliability_score: 0.98, is_active: true, added_at: "2026-02-15" },
  { id: "s-2", domain: "who.int", name: "World Health Organization", type: "government", reliability_score: 0.97, is_active: true, added_at: "2026-02-15" },
  { id: "s-3", domain: "reuters.com", name: "Reuters", type: "news", reliability_score: 0.92, is_active: true, added_at: "2026-02-15" },
  { id: "s-4", domain: "nature.com", name: "Nature", type: "research", reliability_score: 0.96, is_active: true, added_at: "2026-02-15" },
  { id: "s-5", domain: "crunchbase.com", name: "Crunchbase", type: "industry", reliability_score: 0.88, is_active: true, added_at: "2026-02-16" },
  { id: "s-6", domain: "femtechinsider.com", name: "Femtech Insider", type: "industry", reliability_score: 0.82, is_active: true, added_at: "2026-02-16" },
  { id: "s-7", domain: "pubmed.ncbi.nlm.nih.gov", name: "PubMed", type: "research", reliability_score: 0.95, is_active: true, added_at: "2026-02-15" },
];

const SAMPLE_FEEDS: RSSFeed[] = [
  { id: "f-1", url: "https://femtechinsider.com/feed/", name: "Femtech Insider", category: "Femtech", last_fetched: "2026-02-26T06:00:00Z", is_active: true, item_count: 142 },
  { id: "f-2", url: "https://statnews.com/feed/", name: "STAT News", category: "Health", last_fetched: "2026-02-26T06:00:00Z", is_active: true, item_count: 890 },
  { id: "f-3", url: "https://fiercehealthcare.com/rss", name: "Fierce Healthcare", category: "Health Policy", last_fetched: "2026-02-26T06:00:00Z", is_active: true, item_count: 567 },
];

const SAMPLE_TREND_INPUTS: TrendInput[] = [
  { source: "reddit", is_enabled: true, config: { subreddits: ["TwoXChromosomes", "WomensHealth", "Femtech"] } },
  { source: "x_trends", is_enabled: true, config: { keywords: ["womens health", "femtech", "fertility", "menopause"] } },
  { source: "google_trends", is_enabled: true, config: { geo: "US", category: "health" } },
  { source: "newsletters", is_enabled: false, config: {} },
];

const SAMPLE_GUARDRAILS: GuardrailSwitch[] = [
  { id: "g-1", label: "Block if disclosure missing", description: "Prevent any draft from advancing without the required disclosure line", is_enabled: true, category: "compliance" },
  { id: "g-2", label: "Block if citations missing", description: "Require at least one source citation in every market and draft", is_enabled: true, category: "compliance" },
  { id: "g-3", label: "Block if health advice detected", description: "AI critic scans for language that could be construed as medical advice", is_enabled: true, category: "safety" },
  { id: "g-4", label: "Block if real money implication detected", description: "Flag any language suggesting real money trading or financial advice", is_enabled: true, category: "safety" },
  { id: "g-5", label: "Block if numeric claims not backed", description: "Every number cited must have a source URL attached", is_enabled: true, category: "quality" },
  { id: "g-6", label: "Force pre-launch disclaimer injection", description: "Auto-inject pre-launch disclaimer into every draft", is_enabled: true, category: "compliance" },
];

const SAMPLE_RUNS: AIRunLog[] = [
  {
    id: "run-1",
    run_type: "trend_scan",
    status: "completed",
    started_at: "2026-02-26T06:00:00Z",
    completed_at: "2026-02-26T06:02:34Z",
    input_payload: { sources: ["reddit", "x_trends", "google_trends"] },
    prompt_version: "trend_scan_v1",
    model_used: "claude-sonnet-4-6",
    sources_used: [],
    output: { trends_found: 12, top_keywords: ["menopause", "OTC contraception", "fertility benefits"] },
    compliance_results: [],
    human_edits: null,
    final_posted_version: null,
    outcome_metrics: null,
    duration_ms: 154000,
    tokens_used: 3420,
    error: null,
  },
  {
    id: "run-2",
    run_type: "generate_markets",
    status: "completed",
    started_at: "2026-02-26T06:05:00Z",
    completed_at: "2026-02-26T06:07:12Z",
    input_payload: { volume: 5, categories: CATEGORIES.slice(0, 4), risk_ceiling: "low" },
    prompt_version: "propose_markets_v1 (v3)",
    model_used: "claude-sonnet-4-6",
    sources_used: [],
    output: { candidates_proposed: 5, avg_confidence: 0.74 },
    compliance_results: [],
    human_edits: null,
    final_posted_version: null,
    outcome_metrics: null,
    duration_ms: 132000,
    tokens_used: 5810,
    error: null,
  },
  {
    id: "run-3",
    run_type: "compliance_check",
    status: "completed",
    started_at: "2026-02-26T06:10:00Z",
    completed_at: "2026-02-26T06:10:45Z",
    input_payload: { draft_ids: ["d-1", "d-2", "d-3"] },
    prompt_version: "compliance_rewrite_v1 (v1)",
    model_used: "claude-haiku-4-5-20251001",
    sources_used: [],
    output: { passed: 2, failed: 1, issues: ["Draft d-3 missing disclosure line"] },
    compliance_results: [
      { rule: "disclosure_present", passed: false, detail: "Disclosure line missing from draft d-3" },
      { rule: "no_health_advice", passed: true, detail: "" },
      { rule: "pre_launch_language", passed: true, detail: "" },
    ],
    human_edits: null,
    final_posted_version: null,
    outcome_metrics: null,
    duration_ms: 45000,
    tokens_used: 1200,
    error: null,
  },
  {
    id: "run-4",
    run_type: "generate_drafts",
    status: "failed",
    started_at: "2026-02-26T06:15:00Z",
    completed_at: "2026-02-26T06:15:08Z",
    input_payload: { market_id: "mc-3", platforms: ["x", "instagram"] },
    prompt_version: "platform_drafts_v1 (v2)",
    model_used: "claude-sonnet-4-6",
    sources_used: [],
    output: null,
    compliance_results: [],
    human_edits: null,
    final_posted_version: null,
    outcome_metrics: null,
    duration_ms: 8000,
    tokens_used: 0,
    error: "Rate limit exceeded. Retry after 60s.",
  },
];

// ── Shared helper: create a new run log entry ─────────────────────────

let _runCounter = 100;
function createRunLog(
  runType: AIRunLog["run_type"],
  status: AIRunLog["status"],
  overrides?: Partial<AIRunLog>,
): AIRunLog {
  _runCounter++;
  const now = new Date().toISOString();
  return {
    id: `run-${_runCounter}`,
    run_type: runType,
    status,
    started_at: now,
    completed_at: status === "completed" ? now : null,
    input_payload: {},
    prompt_version: "v1",
    model_used: "claude-sonnet-4-6",
    sources_used: [],
    output: status === "completed" ? { result: "ok" } : null,
    compliance_results: [],
    human_edits: null,
    final_posted_version: null,
    outcome_metrics: null,
    duration_ms: status === "completed" ? 2400 : null,
    tokens_used: status === "completed" ? 1820 : null,
    error: status === "failed" ? "An error occurred" : null,
    ...overrides,
  };
}

// ── Tab: Generate ─────────────────────────────────────────────────────

// Threshold enforcement: compute rejection reasons for a candidate
function getGuardrailViolations(candidate: MarketCandidate, config: GenerateConfig): string[] {
  const violations: string[] = [];

  // Source count check
  if (candidate.sources_found.length < config.require_sources_min) {
    violations.push(`Only ${candidate.sources_found.length} source(s) found — minimum is ${config.require_sources_min}`);
  }

  // Confidence check
  if (candidate.confidence < config.confidence_min) {
    violations.push(`Confidence ${(candidate.confidence * 100).toFixed(0)}% is below minimum ${(config.confidence_min * 100).toFixed(0)}%`);
  }

  // Risk ceiling check
  const riskOrder: Record<string, number> = { low: 1, medium: 2, high: 3 };
  if (riskOrder[candidate.risk_level] > riskOrder[config.risk_ceiling]) {
    violations.push(`Risk level "${candidate.risk_level}" exceeds ceiling "${config.risk_ceiling}"`);
  }

  // Long resolution window detection (> 6 months)
  const resolveDate = new Date(candidate.resolve_by);
  const now = new Date();
  const monthsAway = (resolveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsAway > 6) {
    violations.push(`Long resolution window (${Math.round(monthsAway)} months) — aggregate metrics are hard to verify`);
  }

  // Aggregate metric detection
  const aggregatePatterns = /\b(total|combined|aggregate|cumulative|over \$\d+M total)\b/i;
  if (aggregatePatterns.test(candidate.question) || aggregatePatterns.test(candidate.resolution_criteria)) {
    violations.push("Aggregate metric detected — requires owner override to proceed");
  }

  return violations;
}

function GenerateTab({ runs, setRuns }: { runs: AIRunLog[]; setRuns: React.Dispatch<React.SetStateAction<AIRunLog[]>> }) {
  const [config, setConfig] = useState<GenerateConfig>({
    mode: "pre_launch",
    outputs: ["markets"],
    platforms: ["x", "instagram"],
    volume: 5,
    categories_allowed: CATEGORIES.slice(0, 4),
    risk_ceiling: "low",
    require_sources_min: 2,
    confidence_min: 0.70,
    numbers_label: "illustrative",
    disclosure_template: "Illustrative odds only. Not financial or medical advice. Play money beta.",
  });
  const [candidates, setCandidates] = useState<MarketCandidate[]>(SAMPLE_CANDIDATES);
  const [generating, setGenerating] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(true);

  // Individual step loading states
  const [runningStep, setRunningStep] = useState<string | null>(null);
  // Full pipeline loading
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);

  // Run a single step with loading + log entry
  async function runStep(stepType: AIRunLog["run_type"], label: string) {
    setRunningStep(stepType);
    await new Promise((r) => setTimeout(r, 1500));
    const newRun = createRunLog(stepType, "completed", {
      input_payload: { categories: config.categories_allowed, risk_ceiling: config.risk_ceiling },
      prompt_version: `${label}_v1`,
      duration_ms: 1200 + Math.floor(Math.random() * 3000),
      tokens_used: 800 + Math.floor(Math.random() * 4000),
    });
    setRuns((prev) => [newRun, ...prev]);
    setRunningStep(null);
  }

  // Run full pipeline
  async function runFullPipeline() {
    setRunningPipeline(true);
    setPipelineProgress(0);
    const steps: { type: AIRunLog["run_type"]; label: string }[] = [
      { type: "trend_scan", label: "Trend Scan" },
      { type: "generate_markets", label: "Propose Markets" },
      { type: "generate_drafts", label: "Generate Drafts" },
      { type: "compliance_check", label: "Compliance Check" },
    ];
    for (let i = 0; i < steps.length; i++) {
      setPipelineProgress(Math.round(((i) / steps.length) * 100));
      setRunningStep(steps[i].type);
      await new Promise((r) => setTimeout(r, 1200));
      const newRun = createRunLog(steps[i].type, "completed", {
        input_payload: { pipeline: true, step: i + 1, categories: config.categories_allowed },
        prompt_version: `${steps[i].label.toLowerCase().replace(/ /g, "_")}_v1`,
        duration_ms: 1000 + Math.floor(Math.random() * 2000),
        tokens_used: 500 + Math.floor(Math.random() * 3000),
      });
      setRuns((prev) => [newRun, ...prev]);
    }
    setPipelineProgress(100);
    setRunningStep(null);
    await new Promise((r) => setTimeout(r, 400));
    setRunningPipeline(false);
    setPipelineProgress(0);
  }

  // Split candidates into passing and rejected
  const passingCandidates = candidates.filter((c) => getGuardrailViolations(c, config).length === 0);
  const rejectedCandidates = candidates.filter((c) => getGuardrailViolations(c, config).length > 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Mode & Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Mode</Label>
              <Select value={config.mode} onValueChange={(v) => setConfig({ ...config, mode: v as "pre_launch" | "live" })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_launch">Pre-launch</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Volume</Label>
              <Select value={String(config.volume)} onValueChange={(v) => setConfig({ ...config, volume: Number(v) as 1 | 3 | 5 })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 market</SelectItem>
                  <SelectItem value="3">3 markets</SelectItem>
                  <SelectItem value="5">5 markets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Numbers Label</Label>
              <Select value={config.numbers_label} onValueChange={(v) => setConfig({ ...config, numbers_label: v as "illustrative" | "beta_credits" })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="illustrative">Illustrative</SelectItem>
                  <SelectItem value="beta_credits">Beta Credits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quality Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Risk Ceiling</Label>
              <Select value={config.risk_ceiling} onValueChange={(v) => setConfig({ ...config, risk_ceiling: v as RiskLevel })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low only</SelectItem>
                  <SelectItem value="medium">Medium and below</SelectItem>
                  <SelectItem value="high">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Min. Confidence</Label>
                <span className="text-xs text-muted-foreground">{config.confidence_min.toFixed(2)}</span>
              </div>
              <Slider
                value={[config.confidence_min * 100]}
                onValueChange={([v]) => setConfig({ ...config, confidence_min: v / 100 })}
                min={50}
                max={95}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Min. Sources Required</Label>
                <span className="text-xs text-muted-foreground">{config.require_sources_min}</span>
              </div>
              <Slider
                value={[config.require_sources_min]}
                onValueChange={([v]) => setConfig({ ...config, require_sources_min: v })}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Platforms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["x", "instagram", "tiktok", "linkedin", "email"] as Platform[]).map((p) => (
              <div key={p} className="flex items-center justify-between">
                <Label className="text-xs capitalize">{p === "x" ? "X (Twitter)" : p}</Label>
                <Switch
                  checked={config.platforms.includes(p)}
                  onCheckedChange={(checked) => {
                    setConfig({
                      ...config,
                      platforms: checked
                        ? [...config.platforms, p]
                        : config.platforms.filter((pp) => pp !== p),
                    });
                  }}
                  className="scale-75"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Categories Allowed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = config.categories_allowed.includes(cat);
              return (
                <Badge
                  key={cat}
                  variant={active ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() =>
                    setConfig({
                      ...config,
                      categories_allowed: active
                        ? config.categories_allowed.filter((c) => c !== cat)
                        : [...config.categories_allowed, cat],
                    })
                  }
                >
                  {cat}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disclosure template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Disclosure Template (required)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={config.disclosure_template}
            onChange={(e) => setConfig({ ...config, disclosure_template: e.target.value })}
            rows={2}
            className="text-xs"
          />
        </CardContent>
      </Card>

      {/* Pipeline + Step Buttons */}
      {runningPipeline && (
        <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              <span className="text-sm font-medium">Running Full Pipeline...</span>
              <Badge variant="outline" className="text-xs">{pipelineProgress}%</Badge>
            </div>
            <Progress value={pipelineProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          className="gap-2"
          disabled={runningPipeline || runningStep !== null}
          onClick={runFullPipeline}
        >
          {runningPipeline ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {runningPipeline ? "Running Pipeline..." : "Run Full Pipeline"}
        </Button>

        <Separator orientation="vertical" className="h-8 hidden sm:block" />

        <Button
          variant="outline"
          className="gap-2"
          disabled={runningPipeline || runningStep !== null}
          onClick={() => runStep("trend_scan", "Trend Scan")}
        >
          {runningStep === "trend_scan" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {runningStep === "trend_scan" ? "Scanning..." : "Run Trend Scan"}
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          disabled={runningPipeline || runningStep !== null}
          onClick={() => runStep("generate_markets", "Propose Markets")}
        >
          {runningStep === "generate_markets" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          {runningStep === "generate_markets" ? "Proposing..." : "Propose Markets"}
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          disabled={runningPipeline || runningStep !== null || candidates.filter((c) => c.status === "accepted").length === 0}
          onClick={() => runStep("generate_drafts", "Generate Drafts")}
        >
          {runningStep === "generate_drafts" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {runningStep === "generate_drafts" ? "Generating..." : "Generate Drafts"}
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          disabled={runningPipeline || runningStep !== null}
          onClick={() => runStep("compliance_check", "Compliance Check")}
        >
          {runningStep === "compliance_check" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          {runningStep === "compliance_check" ? "Checking..." : "Compliance Check"}
        </Button>
      </div>

      {/* Passing Candidates */}
      {candidates.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Approved Candidates ({passingCandidates.length})
                </CardTitle>
                <Badge variant="outline" className="text-xs">Ranked by engagement</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {passingCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldAlert className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">All candidates were rejected by guardrails.</p>
                  <p className="text-xs mt-1">Lower thresholds or generate more candidates.</p>
                </div>
              ) : (
                passingCandidates.map((candidate) => {
                  const expanded = expandedCandidate === candidate.id;
                  return (
                    <div key={candidate.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium text-sm">{candidate.question}</h4>
                            <Badge variant={candidate.risk_level === "low" ? "default" : candidate.risk_level === "medium" ? "secondary" : "destructive"} className="text-xs">
                              {candidate.risk_level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{candidate.category}</Badge>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span>Confidence: {(candidate.confidence * 100).toFixed(0)}%</span>
                            <span>Engagement: {candidate.engagement_score}</span>
                            <span>Sources: {candidate.sources_found.length}</span>
                            <span>Resolves: {candidate.resolve_by}</span>
                          </div>
                          {candidate.risk_flags.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {candidate.risk_flags.map((flag, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-amber-600 border-amber-300">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant={candidate.status === "accepted" ? "default" : "outline"}
                            className="text-xs"
                            onClick={() => {
                              setCandidates(candidates.map((c) =>
                                c.id === candidate.id
                                  ? { ...c, status: c.status === "accepted" ? "proposed" : "accepted" }
                                  : c
                              ));
                            }}
                          >
                            {candidate.status === "accepted" ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                            {candidate.status === "accepted" ? "Selected" : "Select"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedCandidate(expanded ? null : candidate.id)}
                          >
                            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>

                      {expanded && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div>
                            <Label className="text-xs font-medium">Resolution Criteria</Label>
                            <p className="text-xs text-muted-foreground mt-1">{candidate.resolution_criteria}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs font-medium text-green-600">Why Yes</Label>
                              <p className="text-xs text-muted-foreground mt-1">{candidate.why_yes}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-red-600">Why No</Label>
                              <p className="text-xs text-muted-foreground mt-1">{candidate.why_no}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-blue-600">What Changes</Label>
                              <p className="text-xs text-muted-foreground mt-1">{candidate.what_changes}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Sources</Label>
                            <div className="mt-1 space-y-1">
                              {candidate.sources_found.map((src, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline" className="text-xs">{(src.reliability_score * 100).toFixed(0)}%</Badge>
                                  <span className="text-muted-foreground">{src.domain}</span>
                                  <span className="truncate">{src.title}</span>
                                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="text-xs gap-1"
                              disabled={candidate.status === "created"}
                              onClick={() => {
                                setCandidates(candidates.map((c) =>
                                  c.id === candidate.id ? { ...c, status: "created" as const } : c
                                ));
                              }}
                            >
                              {candidate.status === "created" ? (
                                <><CheckCircle className="h-3 w-3" /> Created</>
                              ) : (
                                <><Plus className="h-3 w-3" /> Create Market</>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(candidate, null, 2));
                              }}
                            >
                              <Copy className="h-3 w-3" /> Copy Packet
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Rejected by Guardrails Section */}
          {rejectedCandidates.length > 0 && (
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                    <ShieldAlert className="h-4 w-4" />
                    Rejected by Guardrails ({rejectedCandidates.length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowRejected(!showRejected)}
                  >
                    {showRejected ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  These candidates failed quality thresholds and cannot be selected for drafts.
                </p>
              </CardHeader>
              {showRejected && (
                <CardContent className="space-y-3">
                  {rejectedCandidates.map((candidate) => {
                    const violations = getGuardrailViolations(candidate, config);
                    const expanded = expandedCandidate === candidate.id;
                    const hasAggregateViolation = violations.some((v) => v.includes("owner override"));

                    return (
                      <div key={candidate.id} className="border border-red-200 dark:border-red-900/50 rounded-lg p-4 bg-red-50/30 dark:bg-red-950/10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium text-sm text-muted-foreground">{candidate.question}</h4>
                              <Badge variant="destructive" className="text-xs">Blocked</Badge>
                              <Badge variant="outline" className="text-xs">{candidate.category}</Badge>
                            </div>
                            {/* Violation reasons */}
                            <div className="mt-2 space-y-1">
                              {violations.map((violation, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                                  <XCircle className="h-3 w-3 shrink-0" />
                                  <span>{violation}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                              <span>Confidence: {(candidate.confidence * 100).toFixed(0)}%</span>
                              <span>Sources: {candidate.sources_found.length}</span>
                              <span>Resolves: {candidate.resolve_by}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {hasAggregateViolation && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                                onClick={() => {
                                  // Owner override: remove from rejected, add to passing
                                  const overridden = { ...candidate, risk_flags: [...candidate.risk_flags, "Owner override applied"] };
                                  setCandidates(candidates.map((c) => c.id === candidate.id ? overridden : c));
                                }}
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Owner Override
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setExpandedCandidate(expanded ? null : candidate.id)}
                            >
                              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>

                        {expanded && (
                          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-900/50 space-y-3">
                            <div>
                              <Label className="text-xs font-medium">Resolution Criteria</Label>
                              <p className="text-xs text-muted-foreground mt-1">{candidate.resolution_criteria}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium">Sources ({candidate.sources_found.length})</Label>
                              <div className="mt-1 space-y-1">
                                {candidate.sources_found.map((src, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline" className="text-xs">{(src.reliability_score * 100).toFixed(0)}%</Badge>
                                    <span className="text-muted-foreground">{src.domain}</span>
                                    <span className="truncate">{src.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ── Tab: Prompt Library ───────────────────────────────────────────────

function PromptLibraryTab() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>(SAMPLE_PROMPTS);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [testingPrompt, setTestingPrompt] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  function toggleLock(promptId: string) {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId ? { ...p, is_locked: !p.is_locked } : p
      )
    );
    setSelectedPrompt((prev) =>
      prev && prev.id === promptId ? { ...prev, is_locked: !prev.is_locked } : prev
    );
  }

  function clonePrompt(prompt: PromptTemplate) {
    const newPrompt: PromptTemplate = {
      ...prompt,
      id: `p-${Date.now()}`,
      name: `${prompt.name}_copy`,
      version: prompt.version + 1,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [
        { version: prompt.version + 1, content: prompt.content, changed_by: "admin", changed_at: new Date().toISOString(), note: `Cloned from ${prompt.name} v${prompt.version}` },
        ...prompt.versions,
      ],
      performance_stats: { uses: 0, avg_confidence: 0, avg_engagement: 0, compliance_pass_rate: 0 },
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    setSelectedPrompt(newPrompt);
  }

  async function testPrompt(promptId: string) {
    setTestingPrompt(promptId);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    setTestingPrompt(null);
    setTestResult(promptId);
    setTimeout(() => setTestResult(null), 4000);
  }

  const filteredPrompts = filterType === "all"
    ? prompts
    : prompts.filter((p) => p.type === filterType);

  const PROMPT_TYPES: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    { value: "market_proposal", label: "Market Proposal" },
    { value: "market_scoring", label: "Market Scoring" },
    { value: "research_summarizer", label: "Research" },
    { value: "platform_writer", label: "Platform Writer" },
    { value: "compliance_rewrite", label: "Compliance" },
    { value: "hook_generator", label: "Hook Generator" },
    { value: "weekly_digest", label: "Weekly Digest" },
    { value: "comment_reply", label: "Comment Reply" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Prompt list */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {PROMPT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1"
            onClick={() => {
              const newPrompt: PromptTemplate = {
                id: `p-${Date.now()}`,
                name: `new_prompt_v1`,
                type: "market_proposal" as PromptType,
                version: 1,
                content: "Enter your prompt template here...",
                variables: [],
                is_locked: false,
                last_used: null,
                performance_stats: { uses: 0, avg_confidence: 0, avg_engagement: 0, compliance_pass_rate: 0 },
                examples: [],
                versions: [{ version: 1, content: "...", changed_by: "admin", changed_at: new Date().toISOString(), note: "Initial version" }],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setPrompts((prev) => [newPrompt, ...prev]);
              setSelectedPrompt(newPrompt);
            }}
          >
            <Plus className="h-3 w-3" /> New
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-2 pr-2">
            {filteredPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className={`cursor-pointer transition-colors ${selectedPrompt?.id === prompt.id ? "border-purple-400 bg-purple-50/50 dark:bg-purple-950/20" : ""}`}
                onClick={() => setSelectedPrompt(prompt)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-medium">{prompt.name}</span>
                    {prompt.is_locked ? (
                      <Lock className="h-3 w-3 text-amber-500" />
                    ) : (
                      <Unlock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">v{prompt.version}</Badge>
                    <span>{prompt.performance_stats.uses} uses</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Prompt detail */}
      <div className="lg:col-span-2">
        {selectedPrompt ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-mono">{selectedPrompt.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">v{selectedPrompt.version}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{selectedPrompt.type.replace("_", " ")}</Badge>
                    {selectedPrompt.is_locked && (
                      <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-300">Locked</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() => toggleLock(selectedPrompt.id)}
                  >
                    {selectedPrompt.is_locked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {selectedPrompt.is_locked ? "Unlock" : "Lock"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() => clonePrompt(selectedPrompt)}
                  >
                    <Copy className="h-3 w-3" /> Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    disabled={testingPrompt === selectedPrompt.id}
                    onClick={() => testPrompt(selectedPrompt.id)}
                  >
                    {testingPrompt === selectedPrompt.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FlaskConical className="h-3 w-3" />
                    )}
                    {testingPrompt === selectedPrompt.id ? "Testing..." : "Test"}
                  </Button>
                </div>
                {testResult === selectedPrompt.id && (
                  <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-800 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Test passed — prompt compiled and returned valid output structure.
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prompt content */}
              <div>
                <Label className="text-xs font-medium">Prompt Template</Label>
                <Textarea
                  value={selectedPrompt.content}
                  rows={12}
                  className="mt-1 font-mono text-xs"
                  readOnly={selectedPrompt.is_locked}
                />
              </div>

              {/* Variables */}
              <div>
                <Label className="text-xs font-medium">Variables</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPrompt.variables.map((v) => (
                    <Badge key={v} variant="secondary" className="text-xs font-mono">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Performance stats */}
              <div>
                <Label className="text-xs font-medium">Performance</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{selectedPrompt.performance_stats.uses}</div>
                    <div className="text-xs text-muted-foreground">Uses</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{(selectedPrompt.performance_stats.avg_confidence * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Avg Confidence</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{selectedPrompt.performance_stats.avg_engagement}</div>
                    <div className="text-xs text-muted-foreground">Avg Engagement</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{(selectedPrompt.performance_stats.compliance_pass_rate * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Compliance Rate</div>
                  </div>
                </div>
              </div>

              {/* Version history */}
              <div>
                <Label className="text-xs font-medium">Version History</Label>
                <div className="mt-2 space-y-2">
                  {selectedPrompt.versions.map((ver) => (
                    <div key={ver.version} className="flex items-center justify-between text-xs p-2 rounded border border-border">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">v{ver.version}</Badge>
                        <span className="text-muted-foreground">{ver.note}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{new Date(ver.changed_at).toLocaleDateString()}</span>
                        <Button size="sm" variant="ghost" className="h-6 text-xs gap-1">
                          <RotateCcw className="h-3 w-3" /> Rollback
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              {!selectedPrompt.is_locked && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="text-xs">Save Changes</Button>
                  <Button size="sm" variant="outline" className="text-xs">Discard</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground text-sm">
              Select a prompt to view and edit
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Tab: Sources & Research ───────────────────────────────────────────

function SourcesResearchTab() {
  const [sources, setSources] = useState<WhitelistedSource[]>(SAMPLE_SOURCES);
  const [feeds, setFeeds] = useState<RSSFeed[]>(SAMPLE_FEEDS);
  const [trendInputs, setTrendInputs] = useState<TrendInput[]>(SAMPLE_TREND_INPUTS);
  const [newDomain, setNewDomain] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [subtab, setSubtab] = useState<"domains" | "feeds" | "trends" | "rules">("domains");

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "domains" as const, label: "Whitelisted Domains", icon: Globe },
          { key: "feeds" as const, label: "RSS Feeds", icon: ScrollText },
          { key: "trends" as const, label: "Trend Inputs", icon: TrendingUp },
          { key: "rules" as const, label: "Freshness & Citation Rules", icon: Shield },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={subtab === tab.key ? "default" : "outline"}
            size="sm"
            className="text-xs gap-1"
            onClick={() => setSubtab(tab.key)}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </Button>
        ))}
      </div>

      {subtab === "domains" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Whitelisted Domains</CardTitle>
              <Badge variant="outline" className="text-xs">{sources.length} domains</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add domain (e.g. cdc.gov)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newDomain.trim()) {
                    const newSource: WhitelistedSource = {
                      id: `s-${Date.now()}`,
                      domain: newDomain.trim(),
                      name: newDomain.trim(),
                      type: "news",
                      reliability_score: 0.80,
                      is_active: true,
                      added_at: new Date().toISOString().slice(0, 10),
                    };
                    setSources((prev) => [...prev, newSource]);
                    setNewDomain("");
                  }
                }}
              />
              <Button
                size="sm"
                className="text-xs gap-1"
                onClick={() => {
                  if (newDomain.trim()) {
                    const newSource: WhitelistedSource = {
                      id: `s-${Date.now()}`,
                      domain: newDomain.trim(),
                      name: newDomain.trim(),
                      type: "news",
                      reliability_score: 0.80,
                      is_active: true,
                      added_at: new Date().toISOString().slice(0, 10),
                    };
                    setSources((prev) => [...prev, newSource]);
                    setNewDomain("");
                  }
                }}
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Domain</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Reliability</TableHead>
                  <TableHead className="text-xs">Active</TableHead>
                  <TableHead className="text-xs w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="text-xs font-mono">{source.domain}</TableCell>
                    <TableCell className="text-xs">{source.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{source.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={source.reliability_score * 100} className="h-1.5 w-16" />
                        <span className="text-xs text-muted-foreground">{(source.reliability_score * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={source.is_active}
                        onCheckedChange={(checked) => {
                          setSources((prev) =>
                            prev.map((s) =>
                              s.id === source.id ? { ...s, is_active: checked } : s
                            )
                          );
                        }}
                        className="scale-75"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSources((prev) => prev.filter((s) => s.id !== source.id))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {subtab === "feeds" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">RSS Feeds</CardTitle>
              <Badge variant="outline" className="text-xs">{feeds.length} feeds</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add RSS feed URL"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                className="h-8 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFeedUrl.trim()) {
                    const newFeed: RSSFeed = {
                      id: `f-${Date.now()}`,
                      url: newFeedUrl.trim(),
                      name: new URL(newFeedUrl.trim()).hostname.replace("www.", ""),
                      category: "General",
                      last_fetched: null,
                      is_active: true,
                      item_count: 0,
                    };
                    setFeeds((prev) => [...prev, newFeed]);
                    setNewFeedUrl("");
                  }
                }}
              />
              <Button
                size="sm"
                className="text-xs gap-1"
                onClick={() => {
                  if (newFeedUrl.trim()) {
                    let feedName = newFeedUrl.trim();
                    try { feedName = new URL(newFeedUrl.trim()).hostname.replace("www.", ""); } catch { /* use raw */ }
                    const newFeed: RSSFeed = {
                      id: `f-${Date.now()}`,
                      url: newFeedUrl.trim(),
                      name: feedName,
                      category: "General",
                      last_fetched: null,
                      is_active: true,
                      item_count: 0,
                    };
                    setFeeds((prev) => [...prev, newFeed]);
                    setNewFeedUrl("");
                  }
                }}
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Feed</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Items</TableHead>
                  <TableHead className="text-xs">Last Fetched</TableHead>
                  <TableHead className="text-xs">Active</TableHead>
                  <TableHead className="text-xs w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeds.map((feed) => (
                  <TableRow key={feed.id}>
                    <TableCell>
                      <div>
                        <div className="text-xs font-medium">{feed.name}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{feed.url}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{feed.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{feed.item_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {feed.last_fetched ? new Date(feed.last_fetched).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={feed.is_active}
                        onCheckedChange={(checked) => {
                          setFeeds((prev) =>
                            prev.map((f) =>
                              f.id === feed.id ? { ...f, is_active: checked } : f
                            )
                          );
                        }}
                        className="scale-75"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setFeeds((prev) => prev.filter((f) => f.id !== feed.id))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {subtab === "trends" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Trend Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendInputs.map((input) => (
              <div key={input.source} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    {input.source === "reddit" && <span className="text-sm">R</span>}
                    {input.source === "x_trends" && <span className="text-sm font-bold">X</span>}
                    {input.source === "google_trends" && <Search className="h-4 w-4" />}
                    {input.source === "newsletters" && <FileText className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium capitalize">{input.source.replace("_", " ")}</div>
                    <div className="text-xs text-muted-foreground">
                      {input.source === "reddit" && `Subreddits: ${(input.config.subreddits as string[] || []).join(", ")}`}
                      {input.source === "x_trends" && `Keywords: ${(input.config.keywords as string[] || []).join(", ")}`}
                      {input.source === "google_trends" && `Region: ${input.config.geo || "US"}`}
                      {input.source === "newsletters" && "Not configured"}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={input.is_enabled}
                  onCheckedChange={(checked) => {
                    setTrendInputs(trendInputs.map((t) =>
                      t.source === input.source ? { ...t, is_enabled: checked } : t
                    ));
                  }}
                  className="scale-75"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {subtab === "rules" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Source Freshness Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: "Breaking news", maxAge: 4, action: "block" },
                { type: "Government / regulatory", maxAge: 72, action: "warn" },
                { type: "Research papers", maxAge: 720, action: "warn" },
                { type: "Industry reports", maxAge: 168, action: "warn" },
              ].map((rule) => (
                <div key={rule.type} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="text-sm font-medium">{rule.type}</div>
                    <div className="text-xs text-muted-foreground">Max age: {rule.maxAge} hours</div>
                  </div>
                  <Badge variant={rule.action === "block" ? "destructive" : "outline"} className="text-xs">
                    {rule.action}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Citation Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Minimum sources per market</Label>
                <Select defaultValue="2">
                  <SelectTrigger className="h-8 text-xs w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Require at least one government/research source</Label>
                <Switch defaultChecked className="scale-75" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Auto-fetch source freshness on draft creation</Label>
                <Switch defaultChecked className="scale-75" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Tab: Guardrails ───────────────────────────────────────────────────

function GuardrailsTab() {
  const [guardrails, setGuardrails] = useState<GuardrailSwitch[]>(SAMPLE_GUARDRAILS);
  const [forbiddenPhrases, setForbiddenPhrases] = useState<string[]>([
    "Start Trading",
    "Trade Now",
    "guaranteed",
    "100% accurate",
    "medical advice",
    "financial advice",
    "real money",
    "invest",
    "profit",
    "you should",
    "we recommend",
    "cure",
    "treatment plan",
  ]);
  const [requiredPhrases, setRequiredPhrases] = useState<string[]>([
    "Illustrative",
    "Play money",
    "Pre-launch",
    "Not financial or medical advice",
  ]);
  const [riskCategories, setRiskCategories] = useState([
    { category: "Women's Health", default_risk: "medium" as RiskLevel, requires_extra_review: true },
    { category: "Femtech", default_risk: "low" as RiskLevel, requires_extra_review: false },
    { category: "Reproductive Rights", default_risk: "high" as RiskLevel, requires_extra_review: true },
    { category: "Wellness", default_risk: "low" as RiskLevel, requires_extra_review: false },
    { category: "Policy & Regulation", default_risk: "medium" as RiskLevel, requires_extra_review: true },
    { category: "Research & Science", default_risk: "low" as RiskLevel, requires_extra_review: false },
    { category: "Business & Funding", default_risk: "low" as RiskLevel, requires_extra_review: false },
    { category: "Culture & Society", default_risk: "medium" as RiskLevel, requires_extra_review: false },
  ]);
  const [newForbidden, setNewForbidden] = useState("");
  const [newRequired, setNewRequired] = useState("");

  return (
    <div className="space-y-6">
      {/* Guardrail Switches */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Enforcement Rules</CardTitle>
            <Badge variant="outline" className="text-xs">
              {guardrails.filter((g) => g.is_enabled).length}/{guardrails.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {guardrails.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${g.is_enabled ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{g.label}</span>
                  <Badge variant="outline" className="text-xs capitalize">{g.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">{g.description}</p>
              </div>
              <Switch
                checked={g.is_enabled}
                onCheckedChange={(checked) => {
                  setGuardrails(guardrails.map((gg) =>
                    gg.id === g.id ? { ...gg, is_enabled: checked } : gg
                  ));
                }}
                className="scale-75 shrink-0"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Phrase lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-600">Forbidden Phrases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add forbidden phrase"
                value={newForbidden}
                onChange={(e) => setNewForbidden(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  if (newForbidden.trim()) {
                    setForbiddenPhrases([...forbiddenPhrases, newForbidden.trim()]);
                    setNewForbidden("");
                  }
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {forbiddenPhrases.map((phrase, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs border-red-200 text-red-700 cursor-pointer hover:bg-red-50 gap-1"
                  onClick={() => setForbiddenPhrases(forbiddenPhrases.filter((_, j) => j !== i))}
                >
                  {phrase}
                  <XCircle className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-600">Required Phrases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add required phrase"
                value={newRequired}
                onChange={(e) => setNewRequired(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  if (newRequired.trim()) {
                    setRequiredPhrases([...requiredPhrases, newRequired.trim()]);
                    setNewRequired("");
                  }
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {requiredPhrases.map((phrase, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs border-green-200 text-green-700 cursor-pointer hover:bg-green-50 gap-1"
                  onClick={() => setRequiredPhrases(requiredPhrases.filter((_, j) => j !== i))}
                >
                  {phrase}
                  <XCircle className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Category Map */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Risk Category Map</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Default Risk</TableHead>
                <TableHead className="text-xs">Extra Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskCategories.map((rc) => (
                <TableRow key={rc.category}>
                  <TableCell className="text-xs font-medium">{rc.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={rc.default_risk === "low" ? "default" : rc.default_risk === "medium" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {rc.default_risk}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rc.requires_extra_review}
                      onCheckedChange={(checked) => {
                        setRiskCategories((prev) =>
                          prev.map((r) =>
                            r.category === rc.category ? { ...r, requires_extra_review: checked } : r
                          )
                        );
                      }}
                      className="scale-75"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Runs & Logs ──────────────────────────────────────────────────

function RunsLogsTab({ runs, setRuns }: { runs: AIRunLog[]; setRuns: React.Dispatch<React.SetStateAction<AIRunLog[]>> }) {
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [rerunningId, setRerunningId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRerun(run: AIRunLog) {
    setRerunningId(run.id);
    await new Promise((r) => setTimeout(r, 2000));
    const rerun = createRunLog(run.run_type, "completed", {
      input_payload: run.input_payload,
      prompt_version: run.prompt_version,
      model_used: run.model_used,
      duration_ms: 1000 + Math.floor(Math.random() * 3000),
      tokens_used: 500 + Math.floor(Math.random() * 4000),
    });
    // Update the old failed run to show it was retried, and add the new successful run
    setRuns((prev) =>
      [rerun, ...prev.map((r) => r.id === run.id ? { ...r, error: `${r.error} (retried)` } : r)]
    );
    setRerunningId(null);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }

  const filteredRuns = runs.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterType !== "all" && r.run_type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-xs w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-8 text-xs w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="trend_scan">Trend Scan</SelectItem>
            <SelectItem value="generate_markets">Generate Markets</SelectItem>
            <SelectItem value="generate_drafts">Generate Drafts</SelectItem>
            <SelectItem value="generate_assets">Generate Assets</SelectItem>
            <SelectItem value="compliance_check">Compliance Check</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="scoring">Scoring</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1 ml-auto"
          disabled={refreshing}
          onClick={handleRefresh}
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Run list */}
      <div className="space-y-3">
        {filteredRuns.map((run) => {
          const expanded = expandedRun === run.id;
          const duration = run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—";
          return (
            <Card key={run.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {run.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {run.status === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
                      {run.status === "running" && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                      <span className="text-sm font-medium capitalize">{run.run_type.replace(/_/g, " ")}</span>
                      <Badge
                        variant={run.status === "completed" ? "default" : run.status === "failed" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {run.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">{run.model_used}</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>{new Date(run.started_at).toLocaleString()}</span>
                      <span>Duration: {duration}</span>
                      {run.tokens_used ? <span>Tokens: {run.tokens_used.toLocaleString()}</span> : null}
                      <span className="font-mono text-xs">{run.prompt_version}</span>
                    </div>
                    {run.error && (
                      <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/20 text-xs text-red-700 dark:text-red-400 flex items-center justify-between gap-2">
                        <span>{run.error}</span>
                        {run.status === "failed" && !run.error.includes("(retried)") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1 shrink-0 border-red-300 hover:bg-red-100"
                            disabled={rerunningId === run.id}
                            onClick={() => handleRerun(run)}
                          >
                            {rerunningId === run.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3 w-3" />
                            )}
                            {rerunningId === run.id ? "Rerunning..." : "Rerun"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setExpandedRun(expanded ? null : run.id)}
                  >
                    {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </Button>
                </div>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div>
                      <Label className="text-xs font-medium">Input Payload</Label>
                      <pre className="mt-1 p-2 rounded bg-muted text-xs font-mono overflow-x-auto">
                        {JSON.stringify(run.input_payload, null, 2)}
                      </pre>
                    </div>
                    {run.output && (
                      <div>
                        <Label className="text-xs font-medium">Output</Label>
                        <pre className="mt-1 p-2 rounded bg-muted text-xs font-mono overflow-x-auto">
                          {JSON.stringify(run.output, null, 2)}
                        </pre>
                      </div>
                    )}
                    {run.compliance_results.length > 0 && (
                      <div>
                        <Label className="text-xs font-medium">Compliance Results</Label>
                        <div className="mt-1 space-y-1">
                          {run.compliance_results.map((cr, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              {cr.passed ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              <span className="font-medium">{cr.rule}</span>
                              {cr.detail && <span className="text-muted-foreground">{cr.detail}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <Copy className="h-3 w-3" /> Copy Log
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        <Eye className="h-3 w-3" /> View Full
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredRuns.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground text-sm">
              No runs match the current filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function AIStudioPage() {
  const [runs, setRuns] = useState<AIRunLog[]>(SAMPLE_RUNS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">AI Studio</h1>
          <p className="text-sm text-muted-foreground">
            Generate markets, manage prompts, configure sources, and enforce guardrails. AI drafts only — human approves.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Mode: Pre-launch
        </Badge>
      </div>

      <HowItWorks
        steps={[
          "Generate: Pick a step (Trend Scan, Propose Markets, Generate Drafts, Compliance Check) or run the full pipeline. Configure platforms, risk level, and tone before running.",
          "Prompts: View and edit AI prompt templates. Lock production prompts (padlock icon) to prevent accidental edits. Clone and test new versions before deploying.",
          "Sources: Manage whitelisted domains (e.g., fda.gov, nature.com) and RSS feeds that AI uses for research. Add/remove sources and set reliability scores.",
          "Guardrails: Toggle compliance switches that block non-compliant content — missing disclosure, missing citations, health advice, real money implications, etc.",
          "Runs: View the log of all AI executions with status, duration, token usage, and output summary. Rerun any failed step from here.",
        ]}
      />

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-9">
          <TabsTrigger value="generate" className="text-xs gap-1">
            <Sparkles className="h-3 w-3" /> Generate
          </TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs gap-1">
            <FileText className="h-3 w-3" /> Prompts
          </TabsTrigger>
          <TabsTrigger value="sources" className="text-xs gap-1">
            <Globe className="h-3 w-3" /> Sources
          </TabsTrigger>
          <TabsTrigger value="guardrails" className="text-xs gap-1">
            <Shield className="h-3 w-3" /> Guardrails
          </TabsTrigger>
          <TabsTrigger value="runs" className="text-xs gap-1">
            <ScrollText className="h-3 w-3" /> Runs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <GenerateTab runs={runs} setRuns={setRuns} />
        </TabsContent>
        <TabsContent value="prompts">
          <PromptLibraryTab />
        </TabsContent>
        <TabsContent value="sources">
          <SourcesResearchTab />
        </TabsContent>
        <TabsContent value="guardrails">
          <GuardrailsTab />
        </TabsContent>
        <TabsContent value="runs">
          <RunsLogsTab runs={runs} setRuns={setRuns} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
