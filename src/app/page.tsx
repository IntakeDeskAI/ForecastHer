import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketCard } from "@/components/market-card";
import { createClient } from "@/lib/supabase/server";
import type { Market } from "@/lib/types";

// Sample markets for when the database isn't seeded yet
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

export default async function HomePage() {
  let markets: Market[] = sampleMarkets;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("markets")
      .select("*")
      .eq("featured", true)
      .eq("status", "open")
      .order("volume", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      markets = data;
    }
  } catch {
    // Use sample markets if DB isn't set up
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ede9fe] via-[#e0e7fe] to-[#ccfbf1] -z-10" />
        <div className="absolute top-[8%] right-[10%] -z-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.25)_0%,transparent_70%)] animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f5f0ff,#ddd6fe,#c4b5fd)] shadow-[0_0_40px_rgba(167,139,250,0.3)]" />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-24 md:py-36 text-center relative z-10">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            The First Prediction Market Built for Her
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Forecast Her Future
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Join the prediction marketplace built for women&apos;s worlds — cycles, wellness, trends, and triumphs. Crowd wisdom meets empowerment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gradient-purple text-white shadow-lg shadow-purple/30 hover:shadow-purple/50 transition-shadow text-base px-8">
                Start Predicting
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="text-base px-8">
                Browse Markets
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Get <strong className="text-primary">1,000 free credits</strong> + <strong className="text-primary">founding member status</strong>
          </p>
        </div>
      </section>

      {/* Problem / Value Prop */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12">
            Women&apos;s futures deserve better predictions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Endless apps track cycles... but who predicts the next breakthrough?",
              "Crowd wisdom is powerful — yet most prediction markets ignore her perspective.",
              "ForecastHer changes that: Real women, real insights, real stakes.",
            ].map((text, i) => (
              <div
                key={i}
                className="bg-muted border border-accent rounded-2xl p-7 text-center hover:-translate-y-1 transition-transform"
              >
                <p className="text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-[#faf8ff]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-3">
            See What&apos;s Coming — Markets for Her
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            Preview prediction markets you&apos;ll be able to trade on. Real questions. Real odds. Real impact.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/markets">
              <Button size="lg" variant="outline">
                View All Markets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Empowerment */}
      <section className="py-20 bg-gradient-to-br from-[#ede9fe] to-[#ccfbf1] text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-6">
            Not Just Predictions — Empowerment
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            ForecastHer is built by and for women who want more than tracking: foresight, community, and control over the narratives that matter.
          </p>
          <div className="inline-block bg-white/70 backdrop-blur-sm rounded-2xl px-10 py-8 border border-purple/20">
            <div className="font-serif text-4xl md:text-5xl font-bold text-gradient-brand mb-2">
              $75B+
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Femtech is booming — but predictions for her health &amp; trends? Untapped until now.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#1a1a2e] text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-3">
            Don&apos;t Miss Out — Her Future Starts Here
          </h2>
          <p className="text-white/60 mb-8">
            Sign up for early access, free credits, and founding member status.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gradient-purple text-white text-base px-10 shadow-lg shadow-purple/30">
              Join ForecastHer
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
