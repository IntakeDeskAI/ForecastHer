# ForecastHer — Project Context

## Deployment

- **Hosting**: Vercel
- **Production branch**: `main`
- **Deploy trigger**: Vercel auto-deploys from `main` on push
- **Branch protection**: Direct pushes to `main` are blocked (403). All changes must go through a PR on GitHub and be merged there.
- **Workflow**: Develop on feature branches → push branch → create PR on GitHub → merge PR → Vercel deploys from `main`

## Git Conventions

- Feature branches: `claude/<description>-<session-id>`
- After pushing a feature branch, always remind the user to create and merge a PR on GitHub — changes won't be visible on the live site until merged into `main`
- `gh` CLI is not authenticated in this environment. PRs must be created via the GitHub web UI.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **Database**: Supabase (Auth + Postgres with RLS)
- **UI**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Auth**: Supabase Auth (email/password + Google OAuth)

## Project Structure

```
src/app/           — Next.js App Router pages and API routes
src/components/    — React components (navbar, footer, market-card, UI primitives)
src/lib/           — Utilities (supabase client, LMSR math, types)
public/            — Static assets (og-image.png, SVGs)
```

## Key Files

- `src/app/layout.tsx` — Root layout with metadata, viewport, Open Graph, JSON-LD schema
- `src/app/page.tsx` — Homepage (hero, "what you get", market preview, differentiators, CTA)
- `src/app/robots.ts` — Dynamic robots.txt generation
- `src/app/sitemap.ts` — Dynamic sitemap.xml generation
- `src/components/market-card.tsx` — Market card component (shows resolution criteria, illustrative label for sample data)
- `src/components/navbar.tsx` — Navigation bar (waitlist CTA, no "Trade Now")

## Pre-Launch Status

ForecastHer is **pre-launch**. Important rules for all copy and UI:

1. **No fake activity numbers.** Sample market volume must be 0. The market card shows "Illustrative" for volume=0 markets. Never invent volume, trade counts, or user counts.
2. **No implying the product is live.** CTAs say "Join the Waitlist" or "Explore Market Preview", never "Start Trading" or "Trade Now."
3. **Label everything clearly.** Markets page says "Odds shown are illustrative." Leaderboard shows "Season Zero starts soon" empty state when no real DB data exists.
4. **Play money, stated plainly.** The hero says: "Pre-launch beta. Play money. Real money later pending approvals."
5. **Resolution criteria visible.** Every market card shows its resolution criteria. This is a trust differentiator — don't remove it.
6. **Domain**: `forcasther.com` (note: one 'e' in forcast, this is the actual domain spelling)
