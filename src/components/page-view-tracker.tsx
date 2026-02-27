"use client";

import { useEffect } from "react";
import { trackMarketView, trackHowItWorksView } from "@/lib/analytics";

/** Fires a market_view event once on mount. */
export function MarketViewTracker({ marketId, marketTitle }: { marketId: string; marketTitle?: string }) {
  useEffect(() => {
    trackMarketView(marketId, marketTitle);
  }, [marketId, marketTitle]);
  return null;
}

/** Fires a how_it_works_view event once on mount. */
export function HowItWorksViewTracker() {
  useEffect(() => {
    trackHowItWorksView();
  }, []);
  return null;
}
