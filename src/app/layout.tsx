import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { UtmCapture } from "@/components/utm-capture";

const SITE_URL = "https://forecasther.ai";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ForecastHer – Women's Prediction Marketplace",
    template: "%s | ForecastHer",
  },
  description:
    "Join ForecastHer, the first prediction marketplace for women's health, fertility, menopause, and femtech trends. Waitlist now for early access.",
  keywords: [
    "women's prediction marketplace",
    "femtech forecasts",
    "women's health predictions",
    "fertility predictions",
    "prediction market for women",
    "menopause predictions",
    "women's wellness",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔮</text></svg>",
  },
  other: {
    "geo.region": "US-ID",
    "geo.placename": "Boise",
    "geo.position": "43.6150;-116.2023",
    ICBM: "43.6150, -116.2023",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ForecastHer",
    title: "ForecastHer – Women's Prediction Marketplace",
    description:
      "Join ForecastHer, the first prediction marketplace for women's health, fertility, menopause, and femtech trends. Waitlist now for early access.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ForecastHer – Diverse women using a prediction marketplace for women's health and femtech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ForecastHer – Women's Prediction Marketplace",
    description:
      "Join ForecastHer, the first prediction marketplace for women's health, fertility, menopause, and femtech trends. Waitlist now for early access.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "ForecastHer",
                  url: SITE_URL,
                  logo: `${SITE_URL}/og-image.png`,
                  description:
                    "The first prediction marketplace built for women — covering women's health, fertility, menopause, femtech, and wellness trends.",
                  foundingDate: "2026",
                  sameAs: [],
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Boise",
                    addressRegion: "ID",
                    addressCountry: "US",
                  },
                },
                {
                  "@type": "WebSite",
                  name: "ForecastHer",
                  url: SITE_URL,
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${SITE_URL}/markets?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "What is ForecastHer?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "ForecastHer is the first prediction marketplace built for women. Trade on real questions about women's health, fertility, menopause, femtech, and cultural trends using crowd wisdom.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "How does a prediction market work?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "A prediction market lets participants buy and sell shares in future outcomes. Prices reflect the crowd's estimate of the probability of an event happening. On ForecastHer, you trade on outcomes related to women's health, wellness, and culture.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is ForecastHer free to use?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes! Sign up for early access and receive 1,000 free beta credits plus founding member status. ForecastHer uses virtual beta credits — no real money is required to participate.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What topics can I predict on ForecastHer?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "ForecastHer covers women's health (menopause, fertility, PCOS), femtech innovations, wellness trends, culture, and business — all through the lens of outcomes that matter to women.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Who is ForecastHer built for?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "ForecastHer is built by and for women who want more than tracking — foresight, community, and a voice in the narratives that shape women's health and futures.",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        <UtmCapture />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
