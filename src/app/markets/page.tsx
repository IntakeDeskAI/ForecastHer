import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MarketCard } from "@/components/market-card";
import { Badge } from "@/components/ui/badge";
import type { Market } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markets",
  description: "Browse prediction markets on women's health, fertility, femtech, and more.",
};

const categories = [
  { slug: "all", label: "All", emoji: "🔮" },
  { slug: "womens-health", label: "Women's Health", emoji: "💊" },
  { slug: "fertility", label: "Fertility", emoji: "🍼" },
  { slug: "femtech", label: "FemTech", emoji: "🔬" },
  { slug: "wellness", label: "Wellness", emoji: "🌿" },
  { slug: "culture", label: "Culture", emoji: "💄" },
  { slug: "business", label: "Business", emoji: "📈" },
];

// Sample markets — play-money previews spanning women's health, culture, policy, business, sports
const sampleMarkets: Market[] = [
  {
    id: "sample-1",
    title: "Will a new non-hormonal menopause treatment receive full FDA approval in 2026?",
    description: null,
    category: "womens-health",
    resolution_criteria: "FDA grants full approval to a non-hormonal drug specifically for menopause symptoms.",
    resolution_source: "FDA.gov",
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: 73.2,
    no_shares: 0,
    volume: 0,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "Will a WNBA team surpass 15,000 average attendance for the 2026 season?",
    description: null,
    category: "culture",
    resolution_criteria: "Official WNBA attendance data shows any team averaging 15,000+ per home game across the 2026 regular season.",
    resolution_source: "WNBA.com official stats",
    closes_at: "2026-09-30T00:00:00Z",
    resolves_at: "2026-10-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: 45.8,
    no_shares: 0,
    volume: 0,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    title: "Will the US pass federal paid family leave legislation by end of 2026?",
    description: null,
    category: "business",
    resolution_criteria: "A federal paid family leave bill is signed into law by December 31, 2026.",
    resolution_source: "Congress.gov",
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: -61.9,
    no_shares: 0,
    volume: 0,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-4",
    title: "Will AI-powered at-home diagnostics for endometriosis achieve clinical-grade accuracy in 2026?",
    description: null,
    category: "femtech",
    resolution_criteria: "A peer-reviewed study reports >90% accuracy for an AI endometriosis diagnostic tool.",
    resolution_source: null,
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: -61.9,
    no_shares: 0,
    volume: 0,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-5",
    title: "Will egg freezing costs drop below $8,000 average in the US by end of 2026?",
    description: null,
    category: "fertility",
    resolution_criteria: "Average cost tracked by FertilityIQ or similar drops below $8,000.",
    resolution_source: null,
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: -32.4,
    no_shares: 0,
    volume: 0,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-6",
    title: "Will a women-led consumer health startup raise a $100M+ round in 2026?",
    description: null,
    category: "business",
    resolution_criteria: "A women-led consumer health startup raises >$100M in a single round, per Crunchbase.",
    resolution_source: "Crunchbase",
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: 48.6,
    no_shares: 0,
    volume: 0,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
];

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "all";
  const sort = params.sort || "volume";

  let markets: Market[] = sampleMarkets;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("markets")
      .select("*")
      .eq("status", "open");

    if (activeCategory !== "all") {
      query = query.eq("category", activeCategory);
    }

    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "closing") {
      query = query.order("closes_at", { ascending: true });
    } else {
      query = query.order("volume", { ascending: false });
    }

    const { data } = await query.limit(50);
    if (data && data.length > 0) {
      markets = data;
    } else if (activeCategory !== "all") {
      markets = sampleMarkets.filter((m) => m.category === activeCategory);
    }
  } catch {
    if (activeCategory !== "all") {
      markets = sampleMarkets.filter((m) => m.category === activeCategory);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-serif text-3xl font-bold">
          Markets
        </h1>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          Play money
        </span>
      </div>
      <p className="text-muted-foreground mb-1">
        Questions we plan to launch. Odds shown are illustrative.
      </p>
      <p className="text-xs text-muted-foreground/70 mb-8">
        Real trading begins in beta with play-money credits.{" "}
        <Link href="/how-it-works" className="underline hover:text-foreground">
          How resolution works
        </Link>
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <a
            key={cat.slug}
            href={`/markets${cat.slug === "all" ? "" : `?category=${cat.slug}`}`}
          >
            <Badge
              variant={activeCategory === cat.slug ? "default" : "outline"}
              className={`cursor-pointer text-sm px-4 py-1.5 ${
                activeCategory === cat.slug
                  ? "gradient-purple text-white"
                  : "hover:bg-accent"
              }`}
            >
              {cat.emoji} {cat.label}
            </Badge>
          </a>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Sort:</span>
        <a
          href={`/markets?${activeCategory !== "all" ? `category=${activeCategory}&` : ""}sort=volume`}
          className={sort === "volume" ? "text-primary font-medium" : "hover:text-foreground"}
        >
          Trending
        </a>
        <a
          href={`/markets?${activeCategory !== "all" ? `category=${activeCategory}&` : ""}sort=newest`}
          className={sort === "newest" ? "text-primary font-medium" : "hover:text-foreground"}
        >
          Newest
        </a>
        <a
          href={`/markets?${activeCategory !== "all" ? `category=${activeCategory}&` : ""}sort=closing`}
          className={sort === "closing" ? "text-primary font-medium" : "hover:text-foreground"}
        >
          Closing Soon
        </a>
      </div>

      {/* Markets Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No markets found in this category yet.</p>
          <p className="text-sm mt-2">Check back soon or try a different category.</p>
        </div>
      )}
    </div>
  );
}
