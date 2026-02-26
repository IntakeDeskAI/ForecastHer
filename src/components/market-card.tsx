import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPct } from "@/lib/lmsr";
import type { Market } from "@/lib/types";

const categoryConfig: Record<
  string,
  { emoji: string; label: string; className: string }
> = {
  "womens-health": {
    emoji: "💊",
    label: "Women's Health",
    className: "bg-[#ede9fe] text-[#7c3aed]",
  },
  fertility: {
    emoji: "🍼",
    label: "Fertility",
    className: "bg-[#ccfbf1] text-[#0d9488]",
  },
  femtech: {
    emoji: "🔬",
    label: "FemTech",
    className: "bg-[#e0e7ff] text-[#4338ca]",
  },
  wellness: {
    emoji: "🌿",
    label: "Wellness",
    className: "bg-[#d1fae5] text-[#059669]",
  },
  culture: {
    emoji: "💄",
    label: "Culture",
    className: "bg-[#fce7f3] text-[#be185d]",
  },
  business: {
    emoji: "📈",
    label: "Business",
    className: "bg-[#fef3c7] text-[#b45309]",
  },
};

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const cat = categoryConfig[market.category] ?? {
    emoji: "📊",
    label: market.category,
    className: "bg-muted text-muted-foreground",
  };

  // Calculate YES probability from LMSR
  const b = market.liquidity_param;
  const expYes = Math.exp(market.yes_shares / b);
  const expNo = Math.exp(market.no_shares / b);
  const yesProbability = expYes / (expYes + expNo);
  const pctWidth = Math.round(yesProbability * 100);

  const closesAt = new Date(market.closes_at);
  const isResolved = market.status === "resolved";

  return (
    <Link href={`/markets/${market.id}`}>
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-purple-light cursor-pointer">
        <CardContent className="flex h-full flex-col p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{cat.emoji}</span>
            <Badge variant="secondary" className={`text-[0.68rem] font-semibold uppercase tracking-wide ${cat.className}`}>
              {cat.label}
            </Badge>
            {isResolved && (
              <Badge variant="outline" className="ml-auto text-[0.65rem]">
                Resolved
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[0.92rem] font-semibold leading-snug text-foreground mb-4 flex-1">
            {market.title}
          </h3>

          {/* Odds Bar */}
          <div className="mb-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full odds-bar-fill rounded-full transition-all duration-700"
                style={{ width: `${pctWidth}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                <span className="font-bold text-primary">{formatPct(yesProbability)}</span> Yes
              </span>
              <span>
                <span className="font-bold text-muted-foreground/70">{formatPct(1 - yesProbability)}</span> No
              </span>
            </div>
          </div>

          {/* Resolution criteria preview */}
          {market.resolution_criteria && (
            <p className="text-[0.7rem] text-muted-foreground/70 mb-1.5 line-clamp-2 leading-relaxed italic">
              Resolves: {market.resolution_criteria}
            </p>
          )}
          {market.resolution_source && (
            <p className="text-[0.68rem] text-primary/70 mb-3 font-medium">
              Source: {market.resolution_source}
            </p>
          )}

          {/* Meta */}
          <div className="flex justify-between items-center text-[0.72rem]">
            <span className="text-muted-foreground">
              {isResolved
                ? `Resolved ${new Date(market.resolved_at!).toLocaleDateString()}`
                : `Closes ${closesAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </span>
            {market.volume > 0 ? (
              <span className="text-muted-foreground">
                {market.volume.toLocaleString()} beta credits
              </span>
            ) : (
              <span className="text-muted-foreground/50 italic">
                Illustrative
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
