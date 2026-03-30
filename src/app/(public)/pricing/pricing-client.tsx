"use client";
import { useLang } from "@/context/lang-context";
import { PricingCards } from "@/components/pricing/pricing-cards";

export function PricingPageClient() {
  const { lang } = useLang();
  return <PricingCards lang={lang} />;
}
