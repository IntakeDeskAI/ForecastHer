-- ═══════════════════════════════════════════════════════════════════════
-- Growth Ops: Missions, Day Plans, Checklists, Activity, Metrics, Streaks
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Growth Missions — weekly/campaign playbooks
create table if not exists growth_missions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  goal_signups integer not null default 0,
  goal_posts integer not null default 0,
  goal_comments integer not null default 0,
  goal_dms integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Growth Day Plans — one per day, pulled by the Today page
create table if not exists growth_day_plans (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references growth_missions(id) on delete cascade,
  day_number integer not null,
  date date not null,
  target_signups integer not null default 0,
  target_posts integer not null default 0,
  target_comments integer not null default 0,
  target_dms integer not null default 0,
  focus text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_growth_day_plans_date on growth_day_plans(date);

-- 3. Growth Checklist Items — powers the three-phase checklist
create table if not exists growth_checklist_items (
  id uuid primary key default gen_random_uuid(),
  day_plan_id uuid not null references growth_day_plans(id) on delete cascade,
  phase text not null check (phase in ('create', 'publish', 'distribute')),
  title text not null,
  required_count integer,
  completed_count integer not null default 0,
  is_required boolean not null default true,
  deep_link text,
  context jsonb default '{}'::jsonb,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done', 'blocked')),
  blocked_reason text,
  sort_order integer not null default 0
);

create index if not exists idx_growth_checklist_day on growth_checklist_items(day_plan_id);

-- 4. UTM Links
create table if not exists utm_links (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  utm_source text not null,
  utm_medium text not null,
  utm_campaign text not null,
  utm_content text,
  created_at timestamptz not null default now()
);

-- 5. Growth Activity Log — audit trail
create table if not exists growth_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  day_plan_id uuid references growth_day_plans(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_growth_activity_date on growth_activity_log(created_at);

-- 6. Growth Metrics Daily — scoreboard tiles
create table if not exists growth_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  signups integer not null default 0,
  clicks integer not null default 0,
  impressions integer not null default 0,
  posts integer not null default 0,
  comments integer not null default 0,
  dms integer not null default 0,
  best_post_url text,
  best_channel text,
  notes text
);

-- 7. Growth Streaks
create table if not exists growth_streaks (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  streak_type text not null check (streak_type in ('publish', 'distribute', 'signups')),
  current_count integer not null default 0,
  last_success_date date,
  updated_at timestamptz not null default now(),
  unique (admin_user_id, streak_type)
);

-- 8. Add mission linkage columns to growth_tasks if it exists
-- (These are added as nullable to not break existing data)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'growth_tasks') then
    alter table growth_tasks add column if not exists mission_id uuid references growth_missions(id);
    alter table growth_tasks add column if not exists day_plan_id uuid references growth_day_plans(id);
    alter table growth_tasks add column if not exists phase text;
    alter table growth_tasks add column if not exists platform text;
    alter table growth_tasks add column if not exists utm_id uuid references utm_links(id);
    alter table growth_tasks add column if not exists draft_id uuid;
    alter table growth_tasks add column if not exists asset_id uuid;
    alter table growth_tasks add column if not exists success_metric_signups integer default 0;
    alter table growth_tasks add column if not exists success_metric_clicks integer default 0;
    alter table growth_tasks add column if not exists success_metric_impressions integer default 0;
  end if;
end $$;

-- RLS policies (admin-only access via service role)
alter table growth_missions enable row level security;
alter table growth_day_plans enable row level security;
alter table growth_checklist_items enable row level security;
alter table utm_links enable row level security;
alter table growth_activity_log enable row level security;
alter table growth_metrics_daily enable row level security;
alter table growth_streaks enable row level security;
