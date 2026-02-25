import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketCard } from "@/components/market-card";
import { createClient } from "@/lib/supabase/server";
import type { Market } from "@/lib/types";

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
    volume: 12450,
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
    volume: 9340,
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
            Early Access — Play-Money Beta
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            The Prediction Market for Women&apos;s Health &amp; Culture
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Sharp questions. Credible resolution. A community that actually knows the domain. Trade on what&apos;s next in femtech, fertility, wellness, policy, and culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gradient-purple text-white shadow-lg shadow-purple/30 hover:shadow-purple/50 transition-shadow text-base px-8">
                Join the Waitlist
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="text-base px-8">
                Preview Markets
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Free play-money credits on signup. Founding members get early access when real-money trading launches.
          </p>
        </div>
      </section>

      {/* Why Join Today */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-4">
            Why join today, not later
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            We&apos;re in early access. Here&apos;s what&apos;s real right now.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Founding member status",
                body: "First 500 members lock in founding badges, priority access to real-money markets, and the ability to propose new questions.",
              },
              {
                title: "1,000 play-money credits",
                body: "Start trading immediately with free credits. Build your track record, climb the leaderboard, and prove your forecasting edge before stakes go up.",
              },
              {
                title: "Shape the questions",
                body: "Founding members vote on which markets launch next. Your domain knowledge decides what gets asked — not a generic algorithm.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-muted border border-accent rounded-2xl p-7 hover:-translate-y-1 transition-transform"
              >
                <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-[#faf8ff]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center">
              Preview Markets
            </h2>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              Play money
            </span>
          </div>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            Real questions with clear resolution criteria. Trade now with play credits — real-money trading coming soon.
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

      {/* What Makes This Different */}
      <section className="py-20 bg-gradient-to-br from-[#ede9fe] to-[#ccfbf1]">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12">
            Not just &ldquo;for women&rdquo; — built on domain expertise
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Questions that matter",
                body: "FDA approvals, fertility costs, femtech funding, policy shifts, WNBA attendance — every market is sourced from real debates in women's health and culture.",
              },
              {
                title: "Transparent resolution",
                body: "Every market lists its resolution criteria and sources upfront. No vibes. No ambiguity. You know the rules before you trade.",
              },
              {
                title: "Community that knows the domain",
                body: "Clinicians, researchers, patients, founders, and advocates — people who actually follow women's health are better forecasters on these questions than the general public.",
              },
              {
                title: "Play money today, real stakes soon",
                body: "We're building the credibility infrastructure first. Track records, resolution quality, and community trust — then real-money trading once we have regulatory approvals.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-7 border border-purple/10"
              >
                <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#1a1a2e] text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-3">
            Get in early. Build your track record.
          </h2>
          <p className="text-white/60 mb-8">
            Free play-money credits, founding member status, and a seat at the table when real-money trading launches.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gradient-purple text-white text-base px-10 shadow-lg shadow-purple/30">
              Join the Waitlist
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
