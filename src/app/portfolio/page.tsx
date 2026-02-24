import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { yesPrice, formatPct, formatPrice } from "@/lib/lmsr";
import { Wallet, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch positions with market data
  const { data: positions } = await supabase
    .from("positions")
    .select("*, markets(*)")
    .eq("user_id", user.id)
    .or("yes_shares.gt.0,no_shares.gt.0");

  // Fetch recent trades
  const { data: trades } = await supabase
    .from("trades")
    .select("*, markets(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const balance = profile?.balance ?? 1000;

  // Calculate portfolio value from positions
  let positionValue = 0;
  if (positions) {
    for (const pos of positions) {
      const market = pos.markets;
      if (!market) continue;
      const b = market.liquidity_param;
      const prob = yesPrice(market.yes_shares, market.no_shares, b);
      positionValue += pos.yes_shares * prob + pos.no_shares * (1 - prob);
    }
  }

  const totalValue = balance + positionValue;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold mb-2">
        Portfolio
      </h1>
      <p className="text-muted-foreground mb-8">
        Track your predictions and performance.
      </p>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-lg p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position Value</p>
                <p className="text-2xl font-bold">${positionValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-lg p-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {!positions || positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active positions yet.</p>
              <p className="text-sm mt-1">
                <Link href="/markets" className="text-primary hover:underline">Browse markets</Link> to start trading.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((pos) => {
                const market = pos.markets;
                if (!market) return null;
                const b = market.liquidity_param;
                const prob = yesPrice(market.yes_shares, market.no_shares, b);

                return (
                  <Link key={pos.id} href={`/markets/${pos.market_id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{market.title}</p>
                        <div className="flex gap-3 mt-1">
                          {pos.yes_shares > 0 && (
                            <Badge variant="outline" className="text-xs text-primary">
                              {pos.yes_shares.toFixed(1)} YES @ {formatPrice(pos.avg_yes_price ?? prob)}
                            </Badge>
                          )}
                          {pos.no_shares > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {pos.no_shares.toFixed(1)} NO @ {formatPrice(pos.avg_no_price ?? (1 - prob))}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{formatPct(prob)}</p>
                        <p className="text-xs text-muted-foreground">current</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {!trades || trades.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No trades yet.</p>
          ) : (
            <div className="space-y-2">
              {trades.map((trade, i) => (
                <div key={trade.id}>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{trade.markets?.title ?? "Market"}</p>
                      <p className="text-xs text-muted-foreground">
                        {trade.action.toUpperCase()} {trade.shares.toFixed(1)} {trade.side.toUpperCase()} @ {formatPrice(trade.price)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className={trade.action === "buy" ? "text-red-500" : "text-green-600"}>
                        {trade.action === "buy" ? "-" : "+"}${trade.cost.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {i < trades.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
