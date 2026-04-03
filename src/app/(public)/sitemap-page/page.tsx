import type { Metadata } from "next";
import { SitemapClient } from "./sitemap-client";

export const metadata: Metadata = {
  title: "Sitemap — KWD",
  description: "Complete site structure and navigation map for KWD — Kesararam With Digital.",
};

export default function SitemapPage() {
  return <SitemapClient />;
}
