-- ═══════════════════════════════════════════════════════════════════════
-- Content Drafts: AI-generated social media drafts for review/approval
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists content_drafts (
  id uuid primary key default gen_random_uuid(),
  market_id text,
  market_title text,
  platform text not null check (platform in ('x', 'instagram', 'tiktok', 'linkedin', 'email')),
  format text not null default 'card_caption',
  status text not null default 'new' check (status in ('new', 'needs_review', 'approved', 'scheduled', 'posted', 'rejected')),
  hook text not null default '',
  body text not null default '',
  cta text not null default '',
  hashtags text[] default '{}',
  first_comment text,
  disclosure_line text,
  utm_link text,
  confidence integer not null default 0,
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  citations jsonb default '[]'::jsonb,
  compliance_checks jsonb default '[]'::jsonb,
  asset_ids text[] default '{}',
  approval_history jsonb default '[]'::jsonb,
  prompt_used text,
  model_used text,
  final_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_drafts_status on content_drafts(status);
create index if not exists idx_content_drafts_platform on content_drafts(platform);
create index if not exists idx_content_drafts_created on content_drafts(created_at desc);

-- RLS (admin-only via service role)
alter table content_drafts enable row level security;
