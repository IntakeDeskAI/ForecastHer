"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { yesPrice, noPrice, sharesToBuy, formatPrice, formatPct } from "@/lib/lmsr";
import { createClient } from "@/lib/supabase/client";
import type { Market } from "@/lib/types";

interface TradePanelProps {
  market: Market;
  userId: string | null;
}

export function TradePanel({ market, userId }: TradePanelProps) {
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const b = market.liquidity_param;
  const currentYesPrice = yesPrice(market.yes_shares, market.no_shares, b);
  const currentNoPrice = noPrice(market.yes_shares, market.no_shares, b);
  const currentPrice = side === "yes" ? currentYesPrice : currentNoPrice;

  const amountNum = parseFloat(amount) || 0;
  const shares = amountNum > 0
    ? sharesToBuy(side, amountNum, market.yes_shares, market.no_shares, b)
    : 0;
  const avgPrice = shares > 0 ? amountNum / shares : currentPrice;
  const potentialPayout = shares;
  const potentialProfit = potentialPayout - amountNum;

  const isDisabled = !userId || amountNum <= 0 || market.status !== "open";

  async function handleTrade() {
    if (isDisabled) return;
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("execute_trade", {
        p_user_id: userId,
        p_market_id: market.id,
        p_side: side,
        p_action: "buy",
        p_amount: amountNum,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: `Bought ${data.shares_received.toFixed(1)} ${side.toUpperCase()} shares at ${formatPrice(data.avg_price)} avg!`,
        });
        setAmount("");
      }
    } catch {
      setMessage({ type: "error", text: "Trade failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Side Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === "yes" ? "default" : "outline"}
            className={side === "yes" ? "gradient-purple text-white" : ""}
            onClick={() => setSide("yes")}
          >
            Yes {formatPct(currentYesPrice)}
          </Button>
          <Button
            variant={side === "no" ? "default" : "outline"}
            className={side === "no" ? "bg-gray-800 text-white hover:bg-gray-700" : ""}
            onClick={() => setSide("no")}
          >
            No {formatPct(currentNoPrice)}
          </Button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Amount (beta credits)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="10"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-1">
              {[10, 25, 50, 100].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2"
                  onClick={() => setAmount(preset.toString())}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Payout Calculator */}
        {amountNum > 0 && (
          <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-medium">{shares.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg price</span>
              <span className="font-medium">{formatPrice(avgPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payout if {side.toUpperCase()}</span>
              <span className="font-bold text-primary">${potentialPayout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Potential profit</span>
              <span className="font-bold text-green-600">+${potentialProfit.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Trade Button */}
        <Button
          className={`w-full text-white ${side === "yes" ? "gradient-purple" : "bg-gray-800 hover:bg-gray-700"}`}
          disabled={isDisabled || loading}
          onClick={handleTrade}
        >
          {loading
            ? "Trading..."
            : !userId
            ? "Log in to trade"
            : `Buy ${side.toUpperCase()}`}
        </Button>

        {/* Message */}
        {message && (
          <p className={`text-sm text-center ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
