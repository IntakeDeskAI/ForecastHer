# ForecastHer MVP — Implementation Plan

## Executive Summary

Transform ForecastHer from a static waitlist landing page into a functional prediction marketplace MVP, modeled after Polymarket (UX simplicity, share-based trading) and Kalshi (fiat-first, regulated approach). The MVP uses a **simplified AMM (Automated Market Maker)** rather than a full order book, keeping the trading engine tractable while still delivering the core prediction market experience.

---

## Architecture Decision: AMM vs Order Book

| Approach | Polymarket | Kalshi | **ForecastHer MVP** |
|----------|-----------|--------|---------------------|
| Matching | CLOB (order book) | Order book | **AMM (LMSR)** |
| Currency | USDC (crypto) | USD (fiat) | **USD (Stripe)** |
| Resolution | UMA oracle + team | Internal team | **Admin team** |
| Regulation | CFTC (2025) | CFTC (2021) | **Play money → real later** |

**Why AMM for MVP:** An order book requires market makers and liquidity providers from day one. An AMM (specifically LMSR — Logarithmic Market Scoring Rule, used by early prediction markets like Metaculus and Manifold) provides instant liquidity with no counterparty needed. Users always have someone to trade against. This is the proven path for bootstrapping a prediction market.

**Why Play Money first:** Avoids CFTC regulation entirely for launch. Manifold Markets proved this model works for building community. Transition to real money once you have regulatory clarity and user base. Play money with "founding member credits" aligns perfectly with the existing waitlist promise.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router) | SSR for SEO, Server Actions for forms, API routes for trading engine |
| **UI** | Tailwind CSS + shadcn/ui | Rapid development, accessible components, matches existing purple/teal palette |
| **Database** | Supabase (PostgreSQL) | Already integrated, RLS for security, Realtime for live odds |
| **Auth** | Supabase Auth | Email/password + Google OAuth, built-in session management |
| **Realtime** | Supabase Realtime | Live odds updates via PostgreSQL NOTIFY/LISTEN |
| **Payments** | Stripe (future) | Deposits/withdrawals when transitioning to real money |
| **Hosting** | Vercel | Zero-config Next.js deployment, edge network |
| **Analytics** | PostHog (free tier) | User behavior, funnel tracking |

---

## Database Schema

### Core Tables

```sql
-- Users (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  balance DECIMAL(12,2) DEFAULT 1000.00,  -- starting play money
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Markets
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                     -- "Will X happen by Y?"
  description TEXT,                        -- detailed context
  category VARCHAR(50) NOT NULL,           -- 'womens-health', 'fertility', 'femtech', etc.
  resolution_criteria TEXT NOT NULL,       -- how the market resolves
  resolution_source TEXT,                  -- specific source URL or "consensus"
  closes_at TIMESTAMPTZ NOT NULL,          -- when trading stops
  resolves_at TIMESTAMPTZ NOT NULL,        -- when outcome is determined
  resolution SMALLINT,                     -- NULL=open, 1=yes, 0=no
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  liquidity_param DECIMAL(10,2) DEFAULT 100.00,  -- LMSR 'b' parameter
  yes_shares DECIMAL(14,4) DEFAULT 0,     -- total YES shares outstanding
  no_shares DECIMAL(14,4) DEFAULT 0,      -- total NO shares outstanding
  volume DECIMAL(14,2) DEFAULT 0,         -- total trade volume
  status VARCHAR(20) DEFAULT 'open',      -- 'open', 'closed', 'resolved', 'cancelled'
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades (immutable ledger)
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  side VARCHAR(3) NOT NULL,               -- 'yes' or 'no'
  action VARCHAR(4) NOT NULL,             -- 'buy' or 'sell'
  shares DECIMAL(12,4) NOT NULL,
  cost DECIMAL(12,4) NOT NULL,            -- total cost in play money
  price DECIMAL(8,4) NOT NULL,            -- avg price per share at time of trade
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Positions (materialized view of user holdings)
CREATE TABLE positions (
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

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  slug VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  color VARCHAR(20),
  sort_order INT DEFAULT 0
);
```

### Seed Categories

```sql
INSERT INTO categories VALUES
  ('womens-health', 'Women''s Health', '💊', '#7c3aed', 1),
  ('fertility', 'Fertility', '🍼', '#0d9488', 2),
  ('femtech', 'FemTech', '🔬', '#4338ca', 3),
  ('wellness', 'Wellness', '🌿', '#059669', 4),
  ('culture', 'Culture', '💄', '#be185d', 5),
  ('business', 'Business', '📈', '#b45309', 6);
```

### Key RPC Functions

```sql
-- LMSR price calculation
-- Price of YES = e^(yes_shares/b) / (e^(yes_shares/b) + e^(no_shares/b))
-- Implemented as a PostgreSQL function for atomic trades

CREATE OR REPLACE FUNCTION execute_trade(
  p_user_id UUID,
  p_market_id UUID,
  p_side VARCHAR(3),    -- 'yes' or 'no'
  p_action VARCHAR(4),  -- 'buy' or 'sell'
  p_amount DECIMAL      -- dollar amount to spend (buy) or shares to sell (sell)
) RETURNS JSONB AS $$
  -- Atomic transaction:
  -- 1. Calculate shares received (buy) or cost returned (sell) via LMSR
  -- 2. Update market yes_shares/no_shares
  -- 3. Update user balance
  -- 4. Insert trade record
  -- 5. Upsert position
  -- 6. Return new price + trade details
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION resolve_market(
  p_market_id UUID,
  p_resolution SMALLINT  -- 1=yes, 0=no
) RETURNS VOID AS $$
  -- 1. Set market resolution + status
  -- 2. For each position holder:
  --    Credit balance += winning_shares * 1.00
  -- 3. Zero out all positions
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_market_price(p_market_id UUID)
RETURNS DECIMAL AS $$
  -- Returns current YES probability using LMSR formula
$$ LANGUAGE plpgsql;
```

---

## Pages & Routes

```
/                          → Landing page (existing, enhanced)
/markets                   → Market listing (browse, filter, search)
/markets/[id]              → Market detail (trade, chart, comments)
/markets/create            → Create new market (authenticated)
/portfolio                 → User's positions, P&L, trade history
/leaderboard               → Top traders by profit
/profile/[username]        → Public user profile
/auth/login                → Login (email + OAuth)
/auth/signup               → Signup with onboarding flow
/how-it-works              → Explainer page
/about                     → Founder story, mission
/admin/markets             → Admin: manage/resolve markets (protected)
/privacy.html              → (existing)
/terms.html                → (existing)
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup
- Initialize Next.js 15 project with App Router
- Install Tailwind CSS + shadcn/ui
- Set up Supabase project (reuse existing or fresh)
- Configure Supabase Auth (email + Google)
- Set up Vercel deployment pipeline
- Migrate existing landing page design tokens (colors, fonts, spacing)

### 1.2 Database & Auth
- Create all tables above with RLS policies
- Implement Supabase Auth with email/password + Google
- Create signup flow: email → verify → choose username → get 1,000 credits
- Profile page with avatar, username, balance display
- Session management with Supabase middleware

### 1.3 Design System
- Port existing color palette to Tailwind config:
  - Primary: `#A78BFA` (purple)
  - Accent: `#4FD1C5` (teal)
  - Surfaces: `#fefcff`, `#faf8ff`, `#1a1a2e`
- Build core components with shadcn/ui:
  - Button (primary, secondary, ghost)
  - Card (market card, stat card)
  - Input / Form
  - Modal / Dialog
  - Badge (category tags)
  - Progress bar (odds bar)
- Layout: sticky nav + content + footer
- Mobile-first responsive breakpoints

---

## Phase 2: Trading Engine (Week 3-4)

### 2.1 LMSR Market Maker
Implement the Logarithmic Market Scoring Rule in PostgreSQL:

```
Cost function: C(q) = b * ln(e^(q_yes/b) + e^(q_no/b))
Price of YES:  p_yes = e^(q_yes/b) / (e^(q_yes/b) + e^(q_no/b))
Price of NO:   p_no = 1 - p_yes
```

Where:
- `q_yes`, `q_no` = total outstanding shares
- `b` = liquidity parameter (higher = more stable prices, lower = more reactive)

The `execute_trade` RPC function handles:
1. Calculate new share quantities after trade
2. Compute cost via difference in cost function
3. Debit/credit user balance atomically
4. Record trade
5. Update position
6. Return execution details

### 2.2 Market Detail Page (`/markets/[id]`)
- Market question (large, prominent)
- Current YES/NO probability with animated bar
- Trade panel: Buy YES / Buy NO with amount input
- Potential payout calculator ("If you spend $10 on YES at 42¢, you get $23.81 if correct")
- Price history chart (simple line chart using Chart.js or Recharts)
- Resolution criteria clearly displayed
- Comments section
- Related markets sidebar

### 2.3 Market Listing Page (`/markets`)
- Grid of market cards (reuse existing card design, enhanced)
- Each card: title, category badge, YES probability, volume, closing date
- Filter by category (sidebar or tabs)
- Sort: trending, newest, closing soon, highest volume
- Search bar
- "Create Market" CTA button

---

## Phase 3: Portfolio & Social (Week 5-6)

### 3.1 Portfolio Page (`/portfolio`)
- Balance display (play money credits)
- Active positions table:
  - Market name, side (YES/NO), shares, avg price, current price, P&L
- Trade history (all past trades)
- Resolved positions with final P&L
- Total portfolio value (balance + position values)

### 3.2 Leaderboard (`/leaderboard`)
- Ranked by total profit
- Weekly, monthly, all-time tabs
- Username, avatar, profit, win rate, total trades
- Encourage competition and engagement

### 3.3 Market Creation (`/markets/create`)
- Form: question, description, category, resolution criteria, closing date, resolution date
- Preview card showing how the market will look
- Submit for admin review (markets go to "pending" status)
- Admin approval workflow

### 3.4 Comments
- Threaded comments on each market
- @mentions
- Markdown support

---

## Phase 4: Polish & Launch (Week 7-8)

### 4.1 Landing Page Integration
- Preserve existing landing page as `/` for non-authenticated users
- Add sticky nav: Home, Markets, How It Works, About, Login/Signup
- Update hero CTA from "Join Waitlist" → "Start Predicting" (for logged-out) or "Browse Markets" (for logged-in)
- Retain waitlist for non-launch markets

### 4.2 Onboarding Flow
- First-time user tutorial (3-4 tooltips):
  1. "Here's how markets work" (browse page)
  2. "Pick a side — YES or NO" (trade panel)
  3. "Track your predictions" (portfolio)
  4. "Your 1,000 free credits to start"
- "How It Works" page with visual explainer

### 4.3 Real-time Updates
- Supabase Realtime subscriptions:
  - Market prices update live on listing and detail pages
  - Portfolio values update when trades happen
  - Comment count badges update

### 4.4 Admin Dashboard
- `/admin/markets`: list all markets, approve pending, resolve active
- Resolution interface: select YES/NO, add resolution notes
- User management (view, credit adjustments)

### 4.5 Notifications
- Email notifications via Resend:
  - Market resolved (your position paid out)
  - Market closing soon (you have a position)
  - Welcome + onboarding sequence

---

## MVP Scope Boundaries

### In Scope (MVP)
- Play money trading (1,000 credits on signup)
- Binary YES/NO markets with LMSR
- 6 categories focused on women's health/femtech
- User accounts with email + Google auth
- Market browsing, trading, and portfolio
- Admin market creation and resolution
- User-proposed markets (admin-approved)
- Comments on markets
- Leaderboard
- Basic mobile responsiveness
- Real-time price updates

### Out of Scope (Post-MVP)
- Real money / payments (requires regulatory)
- Full order book (CLOB)
- Multi-outcome markets (more than YES/NO)
- API / programmatic trading
- Mobile native app
- AI-powered insights
- Social features (follow, share, referrals)
- Embed widgets for external sites
- Advanced charting
- Crypto/Web3 integration

---

## Key UX Decisions (Inspired by Polymarket + Kalshi)

1. **Share-based, not percentage-based**: Users buy shares at a price (e.g., 42¢). If correct, each share pays $1. This is how both Polymarket and Kalshi work — it's intuitive.

2. **Prominent probability display**: The YES percentage is the hero number on every market card, like Polymarket. Color-coded bar (purple fill on gray).

3. **One-click trading**: Like Kalshi's quick trade chips. "Buy YES" and "Buy NO" are primary actions, amount input is simple.

4. **Payout calculator**: Before confirming, show "You'd win $X if correct." Polymarket does this well.

5. **Mobile-first trade panel**: Slide-up panel on mobile for trading, like Kalshi's mobile app.

6. **Categories as first-class nav**: Unlike Polymarket (search-first), lean into curated categories that match the brand. "Women's Health", "Fertility", "FemTech" etc. as primary navigation.

---

## Migration Path from Current Site

The existing static site becomes part of the Next.js app:

```
Current:                    Next.js:
index.html        →        app/page.tsx (landing, server-rendered)
privacy.html      →        app/privacy/page.tsx
terms.html        →        app/terms/page.tsx
styles.css        →        Tailwind config + global.css (design tokens)
script.js         →        Supabase client hooks + components
```

The existing Supabase project can be reused. The `waitlist` table stays — the new `profiles` table is separate. Existing waitlist members get invited to create accounts when the MVP launches.
