import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ForecastHer – Women's Prediction Marketplace",
    short_name: "ForecastHer",
    description:
      "The first prediction marketplace built for women — covering women's health, fertility, menopause, femtech, and wellness trends.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
