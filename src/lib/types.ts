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
