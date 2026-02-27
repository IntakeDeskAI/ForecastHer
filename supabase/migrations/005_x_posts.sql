-- ═══════════════════════════════════════════════════════════════════════
-- X (Twitter) Posts Tracking — store posted tweets and sync their metrics
-- ═══════════════════════════════════════════════════════════════════════

-- Track individual tweets/posts we've made on X
create table if not exists x_posts (
  id uuid primary key default gen_random_uuid(),
  tweet_id text not null unique,          -- The X/Twitter tweet ID
  tweet_url text not null,                 -- Full URL to the tweet
  text_preview text,                       -- First 280 chars of the tweet
  platform text not null default 'x',
  posted_at timestamptz not null default now(),
  -- Metrics (updated on sync)
  impressions integer not null default 0,
  likes integer not null default 0,
  retweets integer not null default 0,
  replies integer not null default 0,
  quotes integer not null default 0,
  bookmarks integer not null default 0,
  url_clicks integer not null default 0,
  profile_clicks integer not null default 0,
  -- Metadata
  market_id uuid,                          -- Optional link to a market
  utm_link_id uuid references utm_links(id) on delete set null,
  tags text[] default '{}',                -- e.g. ['motd', 'comment', 'thread']
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_x_posts_posted on x_posts(posted_at desc);
create index if not exists idx_x_posts_tweet_id on x_posts(tweet_id);

-- RLS (admin-only via service role)
alter table x_posts enable row level security;
