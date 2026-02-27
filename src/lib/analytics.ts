/**
 * GA4 event tracking helpers for ForecastHer.
 *
 * Usage:
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent("waitlist_cta_click", { page_path: "/", button_location: "hero" });
 */

type EventParams = Record<string, string | number | boolean | undefined>;

/** Send a custom GA4 event */
export function trackEvent(eventName: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

// ── Convenience wrappers for key events ──────────────────────────────

/** User clicks a "Join Waitlist" button */
export function trackWaitlistCtaClick(location: string) {
  trackEvent("waitlist_cta_click", {
    page_path: window.location.pathname,
    button_location: location,
  });
}

/** User successfully submits the waitlist form */
export function trackWaitlistSignup(params?: { position?: number }) {
  // Grab UTM values from cookie or URL
  const utms = getUtmParams();
  trackEvent("waitlist_signup", {
    page_path: window.location.pathname,
    position: params?.position,
    ...utms,
  });
}

/** User views a market detail page */
export function trackMarketView(marketId: string, marketTitle?: string) {
  trackEvent("market_view", {
    page_path: window.location.pathname,
    market_id: marketId,
    market_title: marketTitle?.slice(0, 100),
  });
}

/** User views the How It Works page */
export function trackHowItWorksView() {
  trackEvent("how_it_works_view", {
    page_path: window.location.pathname,
  });
}

/** User clicks an outbound link */
export function trackOutboundClick(url: string, linkText?: string) {
  trackEvent("outbound_click", {
    page_path: window.location.pathname,
    outbound_url: url,
    link_text: linkText?.slice(0, 100),
  });
}

// ── UTM Helpers ──────────────────────────────────────────────────────

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const UTM_COOKIE_NAME = "fh_utm";
const UTM_COOKIE_DAYS = 7;

/** Parse UTMs from URL and store in a first-party cookie */
export function captureUtmParams() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const utms: Record<string, string> = {};
  let hasUtm = false;

  for (const key of UTM_KEYS) {
    const val = url.searchParams.get(key);
    if (val) {
      utms[key] = val;
      hasUtm = true;
    }
  }

  if (hasUtm) {
    const expires = new Date(Date.now() + UTM_COOKIE_DAYS * 86400000).toUTCString();
    document.cookie = `${UTM_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(utms))};path=/;expires=${expires};SameSite=Lax`;
  }
}

/** Read UTMs from cookie or current URL params */
export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  // Try cookie first
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${UTM_COOKIE_NAME}=([^;]*)`));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      // Bad cookie, fall through
    }
  }

  // Fallback: read from current URL
  const url = new URL(window.location.href);
  const result: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const val = url.searchParams.get(key);
    if (val) result[key] = val;
  }
  return result;
}
