/** Shared types for analytics tabs */

export interface AnalyticsData {
  range: string;
  today: DailyRow;
  current: PeriodTotals;
  prior: PeriodTotals;
  daily: DailyRow[];
  signalStrength: number;
  trendVelocity: number;
  conversionRate: number;
  todayConversion: number;
  bestChannel: SourceAgg | null;
  sources: SourceAgg[];
  campaigns: CampaignAgg[];
  pages: PageAgg[];
  topics: TopicRow[];
  creatives: CreativeAgg[];
  recommendations: Recommendation[];
  health: HealthRow;
  streaks: StreaksRow;
}

export interface DailyRow {
  date: string;
  sessions: number;
  users: number;
  new_users: number;
  pageviews: number;
  waitlist_signups: number;
  waitlist_cta_clicks: number;
  market_views: number;
}

export interface PeriodTotals {
  sessions: number;
  users: number;
  newUsers?: number;
  pageviews?: number;
  signups: number;
  ctaClicks: number;
  marketViews: number;
}

export interface SourceAgg {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  ctaClicks: number;
  signups: number;
}

export interface CampaignAgg {
  campaign: string;
  source: string;
  medium: string;
  sessions: number;
  clicks: number;
  signups: number;
}

export interface PageAgg {
  page_path: string;
  pageviews: number;
  signups: number;
  ctaClicks: number;
}

export interface TopicRow {
  date: string;
  topic_name: string;
  sessions: number;
  cta_clicks: number;
  signups: number;
  velocity_score: number;
}

export interface CreativeAgg {
  utm_content: string;
  platform: string;
  clicks: number;
  signups: number;
  signupRate: number;
}

export interface Recommendation {
  id: string;
  date: string;
  title: string;
  reason: string;
  action_label: string;
  action_url: string | null;
  expected_impact: string;
  evidence_json: Record<string, unknown>;
  dismissed: boolean;
}

export interface HealthRow {
  status: string;
  last_ingestion_at: string | null;
  last_error?: string;
}

export interface StreaksRow {
  publish_streak: number;
  distribute_streak: number;
  signup_streak: number;
}
