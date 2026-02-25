import { createClient } from "@/lib/supabase/server";
import { TradePanel } from "@/components/trade-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { yesPrice, formatPct } from "@/lib/lmsr";
import { Clock, BarChart3, Users, Info } from "lucide-react";
import type { Market } from "@/lib/types";
import type { Metadata } from "next";

const categoryConfig: Record<string, { emoji: string; label: string; className: string }> = {
  "womens-health": { emoji: "💊", label: "Women's Health", className: "bg-[#ede9fe] text-[#7c3aed]" },
  fertility: { emoji: "🍼", label: "Fertility", className: "bg-[#ccfbf1] text-[#0d9488]" },
  femtech: { emoji: "🔬", label: "FemTech", className: "bg-[#e0e7ff] text-[#4338ca]" },
  wellness: { emoji: "🌿", label: "Wellness", className: "bg-[#d1fae5] text-[#059669]" },
  culture: { emoji: "💄", label: "Culture", className: "bg-[#fce7f3] text-[#be185d]" },
  business: { emoji: "📈", label: "Business", className: "bg-[#fef3c7] text-[#b45309]" },
};

// Sample market for demo
function getSampleMarket(id: string): Market {
  return {
    id,
    title: "Will a new non-hormonal menopause treatment receive full FDA approval in 2026?",
    description: "This market resolves YES if the FDA grants full approval (not just EUA or fast-track designation) to a non-hormonal pharmaceutical treatment specifically indicated for menopause symptoms before December 31, 2026. The treatment must be a new molecular entity, not a reformulation of existing drugs.",
    category: "womens-health",
    resolution_criteria: "FDA grants full approval to a non-hormonal drug specifically for menopause symptoms. Verified via FDA.gov press releases and approval database.",
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
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let title = "Market";

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("markets").select("title").eq("id", id).single();
    if (data) title = data.title;
  } catch {
    // fallback
  }

  return { title };
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let market: Market;
  let userId: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("markets").select("*").eq("id", id).single();
    market = data ?? getSampleMarket(id);

    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    market = getSampleMarket(id);
  }

  const cat = categoryConfig[market.category] ?? {
    emoji: "📊",
    label: market.category,
    className: "bg-muted text-muted-foreground",
  };

  const b = market.liquidity_param;
  const probability = yesPrice(market.yes_shares, market.no_shares, b);
  const pctWidth = Math.round(probability * 100);

  const closesAt = new Date(market.closes_at);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((closesAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={cat.className}>
                {cat.emoji} {cat.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {market.status === "open" ? "Trading" : market.status}
              </Badge>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold leading-snug">
              {market.title}
            </h1>
          </div>

          {/* Big Probability Display */}
          <div className="bg-muted rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Probability</p>
                <p className="text-4xl font-bold text-primary">{formatPct(probability)}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p className="flex items-center gap-1 justify-end"><Clock className="h-3.5 w-3.5" /> {daysLeft} days left</p>
                <p className="flex items-center gap-1 justify-end mt-1"><BarChart3 className="h-3.5 w-3.5" /> ${market.volume.toLocaleString()} volume</p>
              </div>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden">
              <div
                className="h-full odds-bar-fill rounded-full transition-all duration-700"
                style={{ width: `${pctWidth}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2 text-muted-foreground">
              <span><span className="font-bold text-primary">{formatPct(probability)}</span> Yes</span>
              <span><span className="font-bold">{formatPct(1 - probability)}</span> No</span>
            </div>
          </div>

          {/* Description */}
          {market.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" /> About This Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {market.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Resolution Criteria */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" /> Resolution Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {market.resolution_criteria}
              </p>
              {market.resolution_source && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Resolution source:</span> {market.resolution_source}
                  </div>
                </>
              )}
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Closes:</span>{" "}
                {closesAt.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Trade Panel */}
        <div className="space-y-6">
          <TradePanel market={market} userId={userId} />

          {/* Market Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-medium">${market.volume.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liquidity</span>
                <span className="font-medium">{market.liquidity_param}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(market.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
