import { MetadataRoute } from "next";

// PWA / web app manifest — served at /manifest.webmanifest.
// Makes KWD installable ("Add to Home Screen") and sets the brand theme color
// for the browser/OS chrome. Brand: yellow #eab308 on black, road-safety identity.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "វិថីសុវត្ថិភាព · The Way of Safety — Kesararam With Digital",
    short_name: "វិថីសុវត្ថិភាព",
    description:
      "Free bilingual (ខ្មែរ / English) road-safety learning for Cambodia: traffic signs, road rules, quizzes, and live games. By Kesararam With Digital.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#eab308",
    lang: "km",
    dir: "ltr",
    categories: ["education", "kids"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
