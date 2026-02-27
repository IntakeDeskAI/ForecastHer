"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const GA_MEASUREMENT_ID = "G-DL4ZFV877E";

// Extend window for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/** Fire a GA4 pageview on route change */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  );
}
