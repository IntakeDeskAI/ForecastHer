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

// FAQ items for the trust section
const FAQ_ITEMS = [
  {
    question: "How are markets resolved?",
    answer:
      "We publish the resolution source and criteria up front. When the resolve date hits, we verify the outcome using the listed source and log the decision publicly.",
  },
  {
    question: "Can anyone change the result?",
    answer:
      "No. Resolution criteria and sources are locked once the market opens. The outcome is determined by the pre-stated rules, not by discretion.",
  },
  {
    question: "Is this real money?",
    answer:
      "Not yet. Beta uses play-money credits. Real-money markets will only launch after required regulatory approvals.",
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
      {/* ─── 1. Hero ─────────────────────────────────────────────────── */}
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
            Early Access &mdash; Play-Money Beta
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            The Prediction Market for Women&apos;s Health &amp; Culture
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Sharp questions. Credible resolution. A community that actually knows the domain.
            Trade on what&apos;s next in femtech, fertility, wellness, policy, and culture.
          </p>

          {/* Triple CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gradient-purple text-white shadow-lg shadow-purple/30 hover:shadow-purple/50 transition-shadow text-base px-8">
                Join the Waitlist
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="text-base px-8">
                Browse Markets
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="ghost" className="text-base px-6">
                How Resolution Works
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground/80 mt-5">
            Start by browsing live market previews. Every market shows exactly how it will be resolved.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Pre-launch beta. Play money. Real money later pending approvals.
          </p>
        </div>
      </section>

      {/* ─── Social Proof Strip ──────────────────────────────────────── */}
      <section className="py-6 bg-white border-b border-border">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Trusted by early forecasters
          </p>
          <p className="text-center text-sm text-muted-foreground mb-4">
            Pre-launch beta with play-money credits. Built for clear rules, clean sources, and transparent outcomes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors">
                Join the waitlist
              </span>
            </Link>
            <Link href="/signup">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
                Request beta access
              </span>
            </Link>
            <Link href="/how-it-works">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
                See how markets resolve
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. Market Preview Grid ──────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-[#faf8ff]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-3">
            Market Preview
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            Real questions. Clear resolution criteria. Odds shown are illustrative &mdash; real trading begins in beta.
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

      {/* ─── 3. Resolution You Can Audit ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-4">
            Resolution you can audit
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Every market includes a clear resolve-by date, specific criteria that decides yes vs. no,
            a primary resolution source, and a public record of the outcome.
            We don&apos;t do vibes. We do rules.
          </p>

          {/* Resolution criteria cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: "&#128197;", title: "Resolve-by date", desc: "Every market has a deadline. No open-ended ambiguity." },
              { icon: "&#9989;", title: "Yes/No criteria", desc: "Specific conditions that decide the outcome. Published before trading opens." },
              { icon: "&#128279;", title: "Primary source", desc: "FDA.gov, Congress.gov, Crunchbase \u2014 the source is named upfront." },
              { icon: "&#128220;", title: "Public record", desc: "Resolution decisions are logged with the evidence used. Fully auditable." },
            ].map((item, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-xl p-5 text-center">
                <span className="text-2xl block mb-2" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link href="/how-it-works">
              <Button variant="outline" className="text-sm">
                How Resolution Works
              </Button>
            </Link>
            <Link href="/markets">
              <Button variant="outline" className="text-sm">
                Browse Markets
              </Button>
            </Link>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <details key={i} className="group border border-border rounded-xl">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium hover:bg-muted/30 transition-colors rounded-xl">
                  {faq.question}
                  <span className="text-muted-foreground ml-2 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. What We're Optimizing For (Principles) ───────────────── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-3">
            What we&apos;re optimizing for
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            These are the principles we evaluate every decision against.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Resolution clarity over volume",
                body: "We'd rather have 20 markets with bulletproof criteria than 200 with vague rules. Every market should be resolvable by a stranger reading the criteria.",
              },
              {
                title: "Sources you can check",
                body: "Every market names its resolution source upfront. If the source isn't credible or verifiable, the market doesn't launch.",
              },
              {
                title: "Domain expertise matters",
                body: "Clinicians, researchers, patients, and advocates who follow women's health are better forecasters on these questions than the general public.",
              },
              {
                title: "No fake activity",
                body: "Zero volume means zero volume. We don't inflate numbers, invent users, or pretend the platform is busier than it is.",
              },
              {
                title: "Play money first, earn trust",
                body: "Real-money trading comes only after regulatory approvals and after we've proven the resolution process works. Track records first, stakes second.",
              },
              {
                title: "Transparency by default",
                body: "Resolution decisions, criteria changes, and platform updates are public. If we make a mistake, we publish the correction.",
              },
            ].map((principle, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-6 hover:-translate-y-0.5 transition-transform">
                <h3 className="font-semibold text-foreground mb-2 text-sm">{principle.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Founder Story ────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#ede9fe] to-[#ccfbf1]">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-8">
            Why ForecastHer exists
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-purple/10">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Prediction markets are powerful because they reward people who see clearly.
              But most markets ignore the questions women actually care about &mdash; and when
              they do show up, the resolution rules are often vague.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ForecastHer is building a better standard: markets designed around women&apos;s health,
              femtech, women&apos;s sports, culture, and consumer trends, with resolution criteria
              you can audit.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We&apos;re starting with play-money credits in beta. Real money comes later, only after
              the proper approvals. The point right now is simple: build the most credible
              forecasting community for women-led topics on the internet.
            </p>

            {/* Founder card */}
            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground italic mb-4">
                Built by a team with experience in femtech, consumer health, and product growth.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/how-it-works">
                  <Button variant="outline" size="sm" className="text-xs">
                    How Resolution Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Team & Advisors ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-3">
            Built with domain expertise
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            Markets live or die by trust. We care about sources, incentives, and resolution quality.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                title: "Product & Markets",
                body: "People who have built consumer apps and community products at scale.",
              },
              {
                title: "Women's Health & FemTech",
                body: "Advisors with experience in women's health, clinical research, and femtech.",
              },
              {
                title: "Compliance & Operations",
                body: "Guidance from operators who understand regulatory reality and marketplace integrity.",
              },
            ].map((col, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-2xl p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">{col.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{col.body}</p>
              </div>
            ))}
          </div>

          {/* Advisor recruitment CTA */}
          <div className="bg-gradient-to-r from-[#ede9fe] to-[#ccfbf1] rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
              We&apos;re recruiting advisors in women&apos;s health and market design.
              Want to help set the standard?
            </p>
            <Link href="/signup">
              <Button className="gradient-purple text-white">
                Apply to Advise
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. Building with the Community ──────────────────────────── */}
      <section className="py-12 bg-gray-50 border-t border-b border-border">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            We&apos;re building with the community
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div>
              <span className="block text-2xl font-bold text-foreground">Founding Wall</span>
              <span className="text-xs">First 50 members, opt-in only</span>
            </div>
            <div className="hidden sm:block w-px bg-border" />
            <div>
              <span className="block text-2xl font-bold text-foreground">Community Voices</span>
              <span className="text-xs">Top market proposers and referrers</span>
            </div>
            <div className="hidden sm:block w-px bg-border" />
            <div>
              <span className="block text-2xl font-bold text-foreground">Open Roadmap</span>
              <span className="text-xs">What we&apos;re building next, publicly</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Final CTA ────────────────────────────────────────────── */}
      <section className="py-20 bg-[#1a1a2e] text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-3">
            Get early access to the beta
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Join the waitlist to get play-money credits, propose markets,
            and earn a founding badge.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gradient-purple text-white text-base px-10 shadow-lg shadow-purple/30">
                Join the Waitlist
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="text-base px-8 text-white border-white/20 hover:bg-white/10">
                Refer a Friend
              </Button>
            </Link>
          </div>
          <p className="text-white/40 text-xs mt-5">
            No spam. Just markets worth arguing about and resolving cleanly.
          </p>
        </div>
      </section>
    </>
  );
}
