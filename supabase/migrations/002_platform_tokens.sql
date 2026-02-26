-- Platform tokens for admin settings
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS platform_tokens (
  platform VARCHAR(20) PRIMARY KEY,
  api_key TEXT NOT NULL,
  from_email TEXT,
  from_name TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS — only accessed server-side via service role key
ALTER TABLE platform_tokens ENABLE ROW LEVEL SECURITY;

-- No public access — admin client (service role) bypasses RLS
-- This ensures tokens are never exposed to the browser
