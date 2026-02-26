export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  balance: number;
  is_admin: boolean;
  created_at: string;
}

export interface Market {
  id: string;
  title: string;
  description: string | null;
  category: string;
  resolution_criteria: string;
  resolution_source: string | null;
  closes_at: string;
  resolves_at: string;
  resolution: number | null; // null=open, 1=yes, 0=no
  resolved_at: string | null;
  created_by: string | null;
  liquidity_param: number;
  yes_shares: number;
  no_shares: number;
  volume: number;
  status: "open" | "closed" | "resolved" | "cancelled";
  featured: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  market_id: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  shares: number;
  cost: number;
  price: number;
  created_at: string;
}

export interface Position {
  id: string;
  user_id: string;
  market_id: string;
  yes_shares: number;
  no_shares: number;
  avg_yes_price: number | null;
  avg_no_price: number | null;
  realized_pnl: number;
}

export interface Comment {
  id: string;
  market_id: string;
  user_id: string;
  body: string;
  created_at: string;
  // joined
  profiles?: Pick<Profile, "username" | "avatar_url">;
}

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
}

export type MarketWithCategory = Market & {
  categories?: Category;
};

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_profit: number;
  total_trades: number;
  win_rate: number;
}

// ── Admin Types ──────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";
export type DraftStatus = "new" | "needs_review" | "approved" | "scheduled" | "posted" | "blocked";
export type DraftFormat = "thread" | "card_caption" | "short_script" | "single_post" | "weekly_digest";
export type Platform = "x" | "instagram" | "tiktok" | "linkedin" | "email";

export interface MarketSuggestion {
  id: string;
  question: string;
  category: string;
  suggested_by: "ai" | "community" | "editor";
  trend_source: string | null;
  proposed_resolve_date: string | null;
  risk_level: RiskLevel;
  status: "new" | "accepted" | "rejected";
  rejection_reason: string | null;
  created_at: string;
}

export interface AdminMarket extends Market {
  why_yes: string[];
  why_no: string[];
  what_would_change: string[];
  confidence: number;
  risk_level: RiskLevel;
  notes: string | null;
  tags: string[];
  disclosure_template: string | null;
  resolution_sources: string[];
}

export interface ContentDraft {
  id: string;
  market_id: string | null;
  market_title: string | null;
  platform: Platform;
  format: DraftFormat;
  status: DraftStatus;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  first_comment: string | null;
  disclosure_line: string | null;
  utm_link: string | null;
  confidence: number;
  risk_level: RiskLevel;
  citations: Citation[];
  compliance_checks: ComplianceCheck[];
  asset_ids: string[];
  approval_history: ApprovalEvent[];
  prompt_used: string | null;
  model_used: string | null;
  final_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  id: string;
  source_url: string;
  source_title: string;
  summary: string;
  fetched_at: string;
  is_stale: boolean;
}

export interface ComplianceCheck {
  rule: string;
  passed: boolean;
  detail: string | null;
}

export interface ApprovalEvent {
  action: "approve_copy" | "approve_assets" | "lock" | "reject" | "reopen";
  user_id: string;
  username: string;
  timestamp: string;
  note: string | null;
}

export interface Asset {
  id: string;
  market_id: string | null;
  type: "square_card" | "story_card" | "carousel_p1" | "thumbnail" | "resolved_badge";
  url: string;
  hash: string;
  version: number;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  draft_id: string;
  platform: Platform;
  scheduled_at: string;
  posted_at: string | null;
  status: "scheduled" | "posting" | "posted" | "failed" | "paused";
  retry_count: number;
  error_message: string | null;
  utm_params: Record<string, string>;
  posting_account: string | null;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  schedule: string | null; // cron expression
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: "running" | "completed" | "failed" | "cancelled";
  started_at: string;
  completed_at: string | null;
  steps_completed: number;
  steps_total: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown> | null;
  error: string | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: "market" | "draft" | "asset" | "post" | "workflow" | "token" | "approval";
  entity_id: string;
  user_id: string;
  username: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface PlatformToken {
  platform: Platform;
  account_name: string;
  status: "active" | "expired" | "revoked";
  last_used: string | null;
  expires_at: string | null;
}

export type AdminRole = "owner" | "editor" | "reviewer" | "analyst";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface Alert {
  id: string;
  type: "source_fetch_failed" | "publisher_auth_expired" | "low_confidence_draft" | "compliance_block";
  title: string;
  detail: string;
  severity: "info" | "warning" | "error";
  acknowledged: boolean;
  created_at: string;
}

// ── AI Studio Types ─────────────────────────────────────────────────

export type AIOutputType = "markets" | "drafts" | "assets" | "schedule";
export type NumbersLabel = "illustrative" | "beta_credits";
export type PromptType =
  | "market_proposal"
  | "market_scoring"
  | "research_summarizer"
  | "platform_writer"
  | "compliance_rewrite"
  | "hook_generator"
  | "weekly_digest"
  | "comment_reply";

export interface GenerateConfig {
  mode: "pre_launch" | "live";
  outputs: AIOutputType[];
  platforms: Platform[];
  volume: 1 | 3 | 5;
  categories_allowed: string[];
  risk_ceiling: RiskLevel;
  require_sources_min: number;
  confidence_min: number;
  numbers_label: NumbersLabel;
  disclosure_template: string;
}

export interface MarketCandidate {
  id: string;
  question: string;
  resolve_by: string;
  resolution_criteria: string;
  sources_found: SourceReference[];
  confidence: number;
  engagement_score: number;
  risk_flags: string[];
  risk_level: RiskLevel;
  category: string;
  why_yes: string;
  why_no: string;
  what_changes: string;
  status: "proposed" | "accepted" | "rejected" | "created";
}

export interface SourceReference {
  url: string;
  title: string;
  domain: string;
  summary: string;
  fetched_at: string;
  reliability_score: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  type: PromptType;
  version: number;
  content: string;
  variables: string[];
  is_locked: boolean;
  last_used: string | null;
  performance_stats: {
    uses: number;
    avg_confidence: number;
    avg_engagement: number;
    compliance_pass_rate: number;
  };
  examples: string[];
  versions: PromptVersion[];
  created_at: string;
  updated_at: string;
}

export interface PromptVersion {
  version: number;
  content: string;
  changed_by: string;
  changed_at: string;
  note: string | null;
}

export interface WhitelistedSource {
  id: string;
  domain: string;
  name: string;
  type: "news" | "government" | "research" | "industry" | "social";
  reliability_score: number;
  is_active: boolean;
  added_at: string;
}

export interface RSSFeed {
  id: string;
  url: string;
  name: string;
  category: string;
  last_fetched: string | null;
  is_active: boolean;
  item_count: number;
}

export interface TrendInput {
  source: "reddit" | "x_trends" | "google_trends" | "newsletters";
  is_enabled: boolean;
  config: Record<string, unknown>;
}

export interface SourceFreshnessRule {
  max_age_hours: number;
  source_type: string;
  action: "warn" | "block";
}

export interface GuardrailSwitch {
  id: string;
  label: string;
  description: string;
  is_enabled: boolean;
  category: "compliance" | "safety" | "quality";
}

export interface GuardrailPhraseList {
  forbidden: string[];
  required: string[];
}

export interface RiskCategoryMap {
  category: string;
  default_risk: RiskLevel;
  requires_extra_review: boolean;
}

export interface AIRunLog {
  id: string;
  run_type: "generate_markets" | "generate_drafts" | "generate_assets" | "compliance_check" | "trend_scan" | "research" | "scoring";
  status: "running" | "completed" | "failed";
  started_at: string;
  completed_at: string | null;
  input_payload: Record<string, unknown>;
  prompt_version: string;
  model_used: string;
  sources_used: SourceReference[];
  output: Record<string, unknown> | null;
  compliance_results: ComplianceCheck[];
  human_edits: string | null;
  final_posted_version: string | null;
  outcome_metrics: Record<string, number> | null;
  duration_ms: number | null;
  tokens_used: number | null;
  error: string | null;
}
