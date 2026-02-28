-- ForecastHer Analytics Schema
-- Run in Supabase SQL editor to create analytics tables

-- Daily aggregate metrics (one row per date per hostname)
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  hostname text NOT NULL DEFAULT 'forecasther.ai',
  sessions integer NOT NULL DEFAULT 0,
  users integer NOT NULL DEFAULT 0,
  new_users integer NOT NULL DEFAULT 0,
  pageviews integer NOT NULL DEFAULT 0,
  waitlist_signups integer NOT NULL DEFAULT 0,
  waitlist_cta_clicks integer NOT NULL DEFAULT 0,
  market_views integer NOT NULL DEFAULT 0,
  UNIQUE(date, hostname)
);

-- Traffic by source/medium
CREATE TABLE IF NOT EXISTS analytics_source_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  hostname text NOT NULL DEFAULT 'forecasther.ai',
  source text NOT NULL DEFAULT '(direct)',
  medium text NOT NULL DEFAULT '(none)',
  sessions integer NOT NULL DEFAULT 0,
  users integer NOT NULL DEFAULT 0,
  waitlist_cta_clicks integer NOT NULL DEFAULT 0,
  waitlist_signups integer NOT NULL DEFAULT 0,
  UNIQUE(date, hostname, source, medium)
);

-- Campaign performance
CREATE TABLE IF NOT EXISTS analytics_campaign_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  hostname text NOT NULL DEFAULT 'forecasther.ai',
  campaign text NOT NULL DEFAULT '(not set)',
  source text NOT NULL DEFAULT '(direct)',
  medium text NOT NULL DEFAULT '(none)',
  sessions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  waitlist_signups integer NOT NULL DEFAULT 0,
  UNIQUE(date, hostname, campaign, source, medium)
);

-- Page-level metrics
CREATE TABLE IF NOT EXISTS analytics_page_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  hostname text NOT NULL DEFAULT 'forecasther.ai',
  page_path text NOT NULL,
  pageviews integer NOT NULL DEFAULT 0,
  waitlist_signups integer NOT NULL DEFAULT 0,
  waitlist_cta_clicks integer NOT NULL DEFAULT 0,
  UNIQUE(date, hostname, page_path)
);

-- Topic-level aggregation
CREATE TABLE IF NOT EXISTS analytics_topic_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  topic_name text NOT NULL,
  sessions integer NOT NULL DEFAULT 0,
  cta_clicks integer NOT NULL DEFAULT 0,
  signups integer NOT NULL DEFAULT 0,
  velocity_score real NOT NULL DEFAULT 0,
  UNIQUE(date, topic_name)
);

-- Creative / UTM content performance
CREATE TABLE IF NOT EXISTS analytics_creative_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  utm_content text NOT NULL,
  platform text NOT NULL DEFAULT 'unknown',
  clicks integer NOT NULL DEFAULT 0,
  signups integer NOT NULL DEFAULT 0,
  signup_rate real NOT NULL DEFAULT 0,
  UNIQUE(date, utm_content, platform)
);

-- AI/rules-based recommendations
CREATE TABLE IF NOT EXISTS analytics_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  title text NOT NULL,
  reason text NOT NULL,
  action_label text NOT NULL,
  action_url text,
  expected_impact text NOT NULL DEFAULT 'medium',
  evidence_json jsonb DEFAULT '{}',
  dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Ingestion health tracking
CREATE TABLE IF NOT EXISTS analytics_health (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  last_ingestion_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  last_error text,
  records_ingested integer DEFAULT 0
);

-- Streaks
CREATE TABLE IF NOT EXISTS analytics_streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  publish_streak integer NOT NULL DEFAULT 0,
  distribute_streak integer NOT NULL DEFAULT 0,
  signup_streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_source_daily_date ON analytics_source_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign_daily_date ON analytics_campaign_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_page_daily_date ON analytics_page_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_topic_daily_date ON analytics_topic_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_creative_daily_date ON analytics_creative_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_recommendations_date ON analytics_recommendations(date);

-- Insert initial health row
INSERT INTO analytics_health (status) VALUES ('pending') ON CONFLICT DO NOTHING;

-- Insert initial streaks row
INSERT INTO analytics_streaks (publish_streak, distribute_streak, signup_streak) VALUES (0, 0, 0) ON CONFLICT DO NOTHING;
