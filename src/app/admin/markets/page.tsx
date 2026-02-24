"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { yesPrice, formatPct } from "@/lib/lmsr";
import type { Market } from "@/lib/types";

export default function AdminMarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  const loadMarkets = useCallback(async () => {
    const { data } = await supabase
      .from("markets")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMarkets(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (profile?.is_admin) {
        setIsAdmin(true);
        loadMarkets();
      }
    }
    checkAdmin();
  }, [supabase, loadMarkets]);

  async function resolveMarket(marketId: string, resolution: number) {
    const { error } = await supabase.rpc("resolve_market", {
      p_market_id: marketId,
      p_resolution: resolution,
    });
    if (error) {
      alert("Error resolving market: " + error.message);
    } else {
      loadMarkets();
    }
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground">
          You need admin privileges to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Admin: Markets</h1>
          <p className="text-muted-foreground">Manage and resolve markets.</p>
        </div>
        <CreateMarketDialog onCreated={loadMarkets} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-4">
          {markets.map((market) => {
            const prob = yesPrice(
              market.yes_shares,
              market.no_shares,
              market.liquidity_param
            );
            return (
              <Card key={market.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {market.category}
                        </Badge>
                        <Badge
                          variant={
                            market.status === "open"
                              ? "default"
                              : market.status === "resolved"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {market.status}
                        </Badge>
                        {market.featured && (
                          <Badge className="text-xs gradient-purple text-white">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{market.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPct(prob)} YES · ${market.volume.toLocaleString()}{" "}
                        vol · Closes{" "}
                        {new Date(market.closes_at).toLocaleDateString()}
                      </p>
                    </div>
                    {market.status === "open" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => resolveMarket(market.id, 1)}
                        >
                          Resolve YES
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => resolveMarket(market.id, 0)}
                        >
                          Resolve NO
                        </Button>
                      </div>
                    )}
                    {market.status === "resolved" && (
                      <Badge
                        className={
                          market.resolution === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {market.resolution === 1 ? "YES" : "NO"}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateMarketDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const { error } = await supabase.from("markets").insert({
      title: form.get("title") as string,
      description: form.get("description") as string,
      category: form.get("category") as string,
      resolution_criteria: form.get("resolution_criteria") as string,
      resolution_source: (form.get("resolution_source") as string) || null,
      closes_at: form.get("closes_at") as string,
      resolves_at: form.get("resolves_at") as string,
      liquidity_param: 100,
      featured: form.get("featured") === "on",
    });

    if (error) {
      alert("Error creating market: " + error.message);
    } else {
      setOpen(false);
      onCreated();
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-purple text-white">Create Market</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Market</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Question</Label>
            <Input
              id="title"
              name="title"
              placeholder="Will X happen by Y?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detailed context about this market..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="womens-health">Women&apos;s Health</option>
              <option value="fertility">Fertility</option>
              <option value="femtech">FemTech</option>
              <option value="wellness">Wellness</option>
              <option value="culture">Culture</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resolution_criteria">Resolution Criteria</Label>
            <Textarea
              id="resolution_criteria"
              name="resolution_criteria"
              placeholder="How will this market be resolved?"
              rows={2}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resolution_source">Resolution Source (optional)</Label>
            <Input
              id="resolution_source"
              name="resolution_source"
              placeholder="e.g., FDA.gov, Crunchbase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closes_at">Closes At</Label>
              <Input id="closes_at" name="closes_at" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolves_at">Resolves At</Label>
              <Input id="resolves_at" name="resolves_at" type="datetime-local" required />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" name="featured" />
            <Label htmlFor="featured">Featured on homepage</Label>
          </div>
          <Button type="submit" className="w-full gradient-purple text-white" disabled={loading}>
            {loading ? "Creating..." : "Create Market"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
