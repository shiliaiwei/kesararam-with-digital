import type { Metadata } from "next";
import { BrandGuidelineClient } from "./brand-client";

export const metadata: Metadata = {
  title: "Brand Guideline — KWD",
  description: "Official brand identity, visual standards, and logo usage guidelines for KWD — Kesararam With Digital.",
};

export default function BrandPage() {
  return <BrandGuidelineClient />;
}
