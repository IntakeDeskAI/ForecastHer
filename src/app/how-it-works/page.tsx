import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Search, TrendingUp, DollarSign, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { HowItWorksViewTracker } from "@/components/page-view-tracker";

export const metadata: Metadata = {
  title: "How It Works",
};

const steps = [
  {
    icon: Search,
    title: "Browse Markets",
    description:
      "Explore prediction markets on women's health, fertility, femtech, wellness, and culture. Each market asks a Yes/No question about a future event.",
  },
  {
    icon: TrendingUp,
    title: "Pick a Side",
    description:
      'Think the event will happen? Buy YES shares. Think it won\'t? Buy NO. Share prices range from 1¢ to 99¢ — the price reflects the crowd\'s estimated probability.',
  },
  {
    icon: DollarSign,
    title: "Watch Your Prediction",
    description:
      "Prices change in real-time as other traders buy and sell. You can sell your shares anytime to lock in profits or cut losses — no need to wait for resolution.",
  },
  {
    icon: Trophy,
    title: "Get Paid When You're Right",
    description:
      "When a market resolves, winning shares pay out $1 each. If you bought YES at 40¢ and the event happens, you profit 60¢ per share. That's a 150% return!",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <HowItWorksViewTracker />
      <div className="text-center mb-16">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          How ForecastHer Works
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          ForecastHer is a prediction marketplace where you trade on the outcomes of real-world events. It&apos;s like a stock market, but for the future.
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {steps.map((step, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-accent rounded-xl p-3">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary mb-1">Step {i + 1}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Example */}
      <div className="bg-muted rounded-2xl p-8 mb-16">
        <h2 className="font-serif text-xl font-semibold mb-4 text-center">
          Quick Example
        </h2>
        <div className="max-w-xl mx-auto space-y-4 text-sm">
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Market:</strong> &quot;Will a new non-hormonal menopause treatment receive FDA approval in 2026?&quot;
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">You think YES.</strong> The current price is 68¢ (meaning the crowd thinks there&apos;s a 68% chance). You buy 100 YES shares for $68.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">If you&apos;re right:</strong> Each share pays $1 → you receive $100. That&apos;s a <strong className="text-green-600">$32 profit</strong> (47% return).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">If you&apos;re wrong:</strong> Your shares are worth $0. You lose the $68 you invested.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="font-serif text-2xl font-semibold text-center mb-8">
          Common Questions
        </h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            {
              q: "Is this real money?",
              a: "ForecastHer currently uses play-money beta credits. You start with 1,000 free beta credits when you sign up. We plan to introduce real-money trading in the future once we have the proper regulatory approvals.",
            },
            {
              q: "How are prices determined?",
              a: "Prices are set by an Automated Market Maker (AMM) using the LMSR algorithm. As more people buy YES shares, the price goes up. As more buy NO, it goes down. Prices always reflect the crowd's best estimate of the probability.",
            },
            {
              q: "How are markets resolved?",
              a: "Each market has clear resolution criteria listed on its page. Our team resolves markets based on official sources and reporting. Resolution is transparent and follows the pre-defined rules.",
            },
            {
              q: "Can I sell my shares before a market resolves?",
              a: "Yes! You can sell your shares anytime while a market is open. The AMM always provides liquidity, so you'll always find a buyer.",
            },
          ].map((faq, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold mb-4">
          Ready to test your forecasting edge?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sign up for free beta credits and start building your track record.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/signup">
            <Button size="lg" className="gradient-purple text-white">
              Join the Waitlist
            </Button>
          </Link>
          <Link href="/markets">
            <Button size="lg" variant="outline">
              Preview Markets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
