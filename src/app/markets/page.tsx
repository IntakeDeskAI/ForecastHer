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

// Same sample markets from the home page for demo purposes
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
    volume: 12450,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    title: "Will egg freezing costs drop below $8,000 average in the US by end of 2026?",
    description: null,
    category: "fertility",
    resolution_criteria: "Average cost tracked by FertilityIQ drops below $8,000.",
    resolution_source: null,
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: -32.4,
    no_shares: 0,
    volume: 8920,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    title: "Will a major celebrity publicly share a menopause journey that goes viral in 2026?",
    description: null,
    category: "culture",
    resolution_criteria: "A celebrity's menopause/perimenopause post reaches 1M+ engagements.",
    resolution_source: null,
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: 115,
    no_shares: 0,
    volume: 15230,
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
    volume: 6340,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-5",
    title: "Will microdosing GLP-1 drugs gain widespread use for PCOS management by end of 2026?",
    description: null,
    category: "wellness",
    resolution_criteria: "At least two major health systems recommend GLP-1 for PCOS management.",
    resolution_source: null,
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: 20.1,
    no_shares: 0,
    volume: 9870,
    status: "open",
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-6",
    title: "Will women's longevity-focused interventions see a breakthrough funding round exceeding $100M in 2026?",
    description: null,
    category: "business",
    resolution_criteria: "A women's longevity startup raises >$100M in a single round, per Crunchbase.",
    resolution_source: null,
    closes_at: "2026-12-31T00:00:00Z",
    resolves_at: "2027-01-15T00:00:00Z",
    resolution: null,
    resolved_at: null,
    created_by: null,
    liquidity_param: 100,
    yes_shares: 48.6,
    no_shares: 0,
    volume: 11200,
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
      <h1 className="font-serif text-3xl font-bold mb-2">
        Markets
      </h1>
      <p className="text-muted-foreground mb-8">
        Browse and trade on prediction markets that matter to women.
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
