-- ForecastHer MVP Database Schema
-- Run this in the Supabase SQL Editor

-- ============================================
-- Categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  color VARCHAR(20),
  sort_order INT DEFAULT 0
);

INSERT INTO categories (slug, name, emoji, color, sort_order) VALUES
  ('womens-health', 'Women''s Health', '💊', '#7c3aed', 1),
  ('fertility', 'Fertility', '🍼', '#0d9488', 2),
  ('femtech', 'FemTech', '🔬', '#4338ca', 3),
  ('wellness', 'Wellness', '🌿', '#059669', 4),
  ('culture', 'Culture', '💄', '#be185d', 5),
  ('business', 'Business', '📈', '#b45309', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Profiles (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  balance DECIMAL(12,2) DEFAULT 1000.00,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::TEXT, 12)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username')
  )
  ON CONFLICT (username) DO UPDATE
  SET username = 'user_' || LEFT(NEW.id::TEXT, 20);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Markets
-- ============================================
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL REFERENCES categories(slug),
  resolution_criteria TEXT NOT NULL,
  resolution_source TEXT,
  closes_at TIMESTAMPTZ NOT NULL,
  resolves_at TIMESTAMPTZ NOT NULL,
  resolution SMALLINT, -- NULL=open, 1=yes, 0=no
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  liquidity_param DECIMAL(10,2) DEFAULT 100.00,
  yes_shares DECIMAL(14,4) DEFAULT 0,
  no_shares DECIMAL(14,4) DEFAULT 0,
  volume DECIMAL(14,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved', 'cancelled')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Trades (immutable ledger)
-- ============================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  side VARCHAR(3) NOT NULL CHECK (side IN ('yes', 'no')),
  action VARCHAR(4) NOT NULL CHECK (action IN ('buy', 'sell')),
  shares DECIMAL(12,4) NOT NULL,
  cost DECIMAL(12,4) NOT NULL,
  price DECIMAL(8,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Positions (user holdings per market)
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  yes_shares DECIMAL(12,4) DEFAULT 0,
  no_shares DECIMAL(12,4) DEFAULT 0,
  avg_yes_price DECIMAL(8,4),
  avg_no_price DECIMAL(8,4),
  realized_pnl DECIMAL(12,4) DEFAULT 0,
  UNIQUE(user_id, market_id)
);

-- ============================================
-- Comments
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
CREATE INDEX IF NOT EXISTS idx_markets_featured ON markets(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_market ON trades(market_id);
CREATE INDEX IF NOT EXISTS idx_positions_user ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_market ON comments(market_id);

-- ============================================
-- LMSR Trading Function
-- ============================================
CREATE OR REPLACE FUNCTION execute_trade(
  p_user_id UUID,
  p_market_id UUID,
  p_side VARCHAR(3),
  p_action VARCHAR(4),
  p_amount DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_market markets%ROWTYPE;
  v_user profiles%ROWTYPE;
  v_b DECIMAL;
  v_old_yes DECIMAL;
  v_old_no DECIMAL;
  v_new_yes DECIMAL;
  v_new_no DECIMAL;
  v_old_cost DECIMAL;
  v_new_cost DECIMAL;
  v_trade_cost DECIMAL;
  v_shares DECIMAL;
  v_avg_price DECIMAL;
  v_max_old DECIMAL;
  v_max_new DECIMAL;
BEGIN
  -- Lock the market row
  SELECT * INTO v_market FROM markets WHERE id = p_market_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found';
  END IF;
  IF v_market.status != 'open' THEN
    RAISE EXCEPTION 'Market is not open for trading';
  END IF;
  IF v_market.closes_at < NOW() THEN
    RAISE EXCEPTION 'Market has closed';
  END IF;

  -- Lock the user row
  SELECT * INTO v_user FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  v_b := v_market.liquidity_param;
  v_old_yes := v_market.yes_shares;
  v_old_no := v_market.no_shares;

  IF p_action = 'buy' THEN
    -- Binary search for shares from dollar amount
    DECLARE
      lo DECIMAL := 0;
      hi DECIMAL := p_amount * 100;
      mid DECIMAL;
      cost_check DECIMAL;
    BEGIN
      FOR i IN 1..100 LOOP
        mid := (lo + hi) / 2;
        -- Calculate cost for 'mid' shares
        IF p_side = 'yes' THEN
          v_new_yes := v_old_yes + mid;
          v_new_no := v_old_no;
        ELSE
          v_new_yes := v_old_yes;
          v_new_no := v_old_no + mid;
        END IF;

        -- Cost function with log-sum-exp trick
        v_max_old := GREATEST(v_old_yes / v_b, v_old_no / v_b);
        v_old_cost := v_b * (v_max_old + LN(EXP(v_old_yes / v_b - v_max_old) + EXP(v_old_no / v_b - v_max_old)));
        v_max_new := GREATEST(v_new_yes / v_b, v_new_no / v_b);
        v_new_cost := v_b * (v_max_new + LN(EXP(v_new_yes / v_b - v_max_new) + EXP(v_new_no / v_b - v_max_new)));

        cost_check := v_new_cost - v_old_cost;

        IF cost_check < p_amount THEN
          lo := mid;
        ELSE
          hi := mid;
        END IF;
      END LOOP;
      v_shares := (lo + hi) / 2;
    END;

    -- Recalculate exact cost
    IF p_side = 'yes' THEN
      v_new_yes := v_old_yes + v_shares;
      v_new_no := v_old_no;
    ELSE
      v_new_yes := v_old_yes;
      v_new_no := v_old_no + v_shares;
    END IF;

    v_max_old := GREATEST(v_old_yes / v_b, v_old_no / v_b);
    v_old_cost := v_b * (v_max_old + LN(EXP(v_old_yes / v_b - v_max_old) + EXP(v_old_no / v_b - v_max_old)));
    v_max_new := GREATEST(v_new_yes / v_b, v_new_no / v_b);
    v_new_cost := v_b * (v_max_new + LN(EXP(v_new_yes / v_b - v_max_new) + EXP(v_new_no / v_b - v_max_new)));

    v_trade_cost := v_new_cost - v_old_cost;

    IF v_user.balance < v_trade_cost THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;

    v_avg_price := v_trade_cost / v_shares;

    -- Update user balance
    UPDATE profiles SET balance = balance - v_trade_cost WHERE id = p_user_id;

    -- Update market
    UPDATE markets
    SET yes_shares = v_new_yes,
        no_shares = v_new_no,
        volume = volume + v_trade_cost
    WHERE id = p_market_id;

    -- Insert trade
    INSERT INTO trades (user_id, market_id, side, action, shares, cost, price)
    VALUES (p_user_id, p_market_id, p_side, 'buy', v_shares, v_trade_cost, v_avg_price);

    -- Upsert position
    INSERT INTO positions (user_id, market_id, yes_shares, no_shares, avg_yes_price, avg_no_price)
    VALUES (
      p_user_id, p_market_id,
      CASE WHEN p_side = 'yes' THEN v_shares ELSE 0 END,
      CASE WHEN p_side = 'no' THEN v_shares ELSE 0 END,
      CASE WHEN p_side = 'yes' THEN v_avg_price ELSE NULL END,
      CASE WHEN p_side = 'no' THEN v_avg_price ELSE NULL END
    )
    ON CONFLICT (user_id, market_id) DO UPDATE SET
      yes_shares = positions.yes_shares + CASE WHEN p_side = 'yes' THEN v_shares ELSE 0 END,
      no_shares = positions.no_shares + CASE WHEN p_side = 'no' THEN v_shares ELSE 0 END,
      avg_yes_price = CASE
        WHEN p_side = 'yes' THEN
          (COALESCE(positions.avg_yes_price, 0) * positions.yes_shares + v_avg_price * v_shares)
          / (positions.yes_shares + v_shares)
        ELSE positions.avg_yes_price
      END,
      avg_no_price = CASE
        WHEN p_side = 'no' THEN
          (COALESCE(positions.avg_no_price, 0) * positions.no_shares + v_avg_price * v_shares)
          / (positions.no_shares + v_shares)
        ELSE positions.avg_no_price
      END;

    RETURN jsonb_build_object(
      'shares_received', v_shares,
      'cost', v_trade_cost,
      'avg_price', v_avg_price,
      'new_yes_price', EXP(v_new_yes / v_b) / (EXP(v_new_yes / v_b) + EXP(v_new_no / v_b))
    );

  ELSE
    RAISE EXCEPTION 'Sell not implemented yet';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Resolve Market Function
-- ============================================
CREATE OR REPLACE FUNCTION resolve_market(
  p_market_id UUID,
  p_resolution SMALLINT
) RETURNS VOID AS $$
DECLARE
  v_pos RECORD;
  v_payout DECIMAL;
BEGIN
  -- Update market status
  UPDATE markets
  SET status = 'resolved',
      resolution = p_resolution,
      resolved_at = NOW()
  WHERE id = p_market_id AND status IN ('open', 'closed');

  -- Pay out winners
  FOR v_pos IN SELECT * FROM positions WHERE market_id = p_market_id LOOP
    IF p_resolution = 1 THEN
      v_payout := v_pos.yes_shares; -- $1 per winning share
    ELSE
      v_payout := v_pos.no_shares;
    END IF;

    IF v_payout > 0 THEN
      UPDATE profiles SET balance = balance + v_payout WHERE id = v_pos.user_id;
      UPDATE positions
      SET realized_pnl = realized_pnl + v_payout,
          yes_shares = 0,
          no_shares = 0
      WHERE id = v_pos.id;
    ELSE
      UPDATE positions
      SET yes_shares = 0,
          no_shares = 0
      WHERE id = v_pos.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Leaderboard Function
-- ============================================
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INT DEFAULT 50)
RETURNS TABLE(
  user_id UUID,
  username VARCHAR,
  avatar_url TEXT,
  total_profit DECIMAL,
  total_trades BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.username,
    p.avatar_url,
    COALESCE(SUM(pos.realized_pnl), 0) + (p.balance - 1000) AS total_profit,
    COALESCE(COUNT(t.id), 0) AS total_trades
  FROM profiles p
  LEFT JOIN positions pos ON pos.user_id = p.id
  LEFT JOIN trades t ON t.user_id = p.id
  GROUP BY p.id, p.username, p.avatar_url, p.balance
  HAVING COALESCE(COUNT(t.id), 0) > 0
  ORDER BY total_profit DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Waitlist count function (keep existing)
-- ============================================
CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM waitlist);
EXCEPTION
  WHEN undefined_table THEN
    RETURN 500;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories: readable by all
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Profiles: readable by all, editable by owner
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Markets: readable by all, insertable by authenticated
CREATE POLICY "Markets are viewable by everyone" ON markets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create markets" ON markets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Trades: readable by owner and for public market data
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Trades insertable via RPC" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Positions: readable by owner
CREATE POLICY "Users can view own positions" ON positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Positions managed via RPC" ON positions FOR ALL USING (auth.uid() = user_id);

-- Comments: readable by all, insertable by authenticated
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Seed Sample Markets
-- ============================================
INSERT INTO markets (title, description, category, resolution_criteria, resolution_source, closes_at, resolves_at, liquidity_param, yes_shares, no_shares, volume, featured) VALUES
(
  'Will a new non-hormonal menopause treatment receive full FDA approval in 2026?',
  'This market resolves YES if the FDA grants full approval (not just EUA or fast-track designation) to a non-hormonal pharmaceutical treatment specifically indicated for menopause symptoms before December 31, 2026.',
  'womens-health',
  'FDA grants full approval to a non-hormonal drug specifically for menopause symptoms. Verified via FDA.gov press releases.',
  'FDA.gov',
  '2026-12-31T00:00:00Z',
  '2027-01-15T00:00:00Z',
  100, 73.2, 0, 12450, TRUE
),
(
  'Will egg freezing costs drop below $8,000 average in the US by end of 2026?',
  'Tracks the average cost of a single egg freezing cycle in the United States.',
  'fertility',
  'Average cost tracked by FertilityIQ or similar authoritative source drops below $8,000.',
  NULL,
  '2026-12-31T00:00:00Z',
  '2027-01-15T00:00:00Z',
  100, -32.4, 0, 8920, TRUE
),
(
  'Will a major celebrity publicly share a menopause journey that goes viral in 2026?',
  'Resolves based on a celebrity with 5M+ social media followers sharing their menopause/perimenopause experience.',
  'culture',
  'A celebrity''s menopause/perimenopause post reaches 1M+ engagements on any platform.',
  NULL,
  '2026-12-31T00:00:00Z',
  '2027-01-15T00:00:00Z',
  100, 115, 0, 15230, TRUE
),
(
  'Will AI-powered at-home diagnostics for endometriosis achieve clinical-grade accuracy in 2026?',
  'Tracks progress in AI diagnostic tools for endometriosis that can be used outside clinical settings.',
  'femtech',
  'A peer-reviewed study reports >90% sensitivity and specificity for an AI-based endometriosis diagnostic.',
  NULL,
  '2026-12-31T00:00:00Z',
  '2027-01-15T00:00:00Z',
  100, -61.9, 0, 6340, TRUE
),
(
  'Will microdosing GLP-1 drugs gain widespread use for PCOS management by end of 2026?',
  'Tracks whether GLP-1 receptor agonists become commonly recommended for PCOS management.',
  'wellness',
  'At least two major health systems or professional organizations recommend GLP-1 for PCOS management.',
  NULL,
  '2026-12-31T00:00:00Z',
  '2027-01-15T00:00:00Z',
  100, 20.1, 0, 9870, TRUE
),
(
  'Will women''s longevity-focused interventions see a breakthrough funding round exceeding $100M in 2026?',
  'Tracks venture capital investment in women-specific longevity research and interventions.',
  'business',
  'A women''s longevity startup raises >$100M in a single round, per Crunchbase or similar.',
  NULL,
  '2026-12-31T00:00:00Z',
  '2027-01-15T00:00:00Z',
  100, 48.6, 0, 11200, TRUE
)
ON CONFLICT DO NOTHING;
