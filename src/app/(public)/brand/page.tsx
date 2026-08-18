import type { Metadata } from "next";
import { BrandGuidelineClient } from "./brand-client";

export const metadata: Metadata = {
  title: "Brand Guideline — Kesararam With Digital",
  description: "Official brand identity, visual standards, and logo usage guidelines for Kesararam With Digital — Kesararam With Digital.",
};

export default function BrandPage() {
  return <BrandGuidelineClient />;
}
