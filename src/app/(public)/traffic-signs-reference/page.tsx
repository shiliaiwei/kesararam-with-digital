import type { Metadata } from "next";
import { TrafficSignsReferenceClient } from "./client";

export const metadata: Metadata = {
  title: "Cambodia Traffic Signs — Complete Reference List | KWD",
  description:
    "Complete official list of 272 Cambodian traffic control devices across 11 categories: Prohibitory, Mandatory, Priority, Warning, Temporary, Guide, Supplementary, Delineators, Markings, Signals, and Officer Commands. Source: MPWT PW03 series.",
  keywords: [
    "Cambodia traffic signs",
    "Cambodian road signs",
    "PW03 traffic signs",
    "driving theory Cambodia",
    "traffic control devices Cambodia",
    "MPWT road signs",
    "KWD driving",
    "ស្ញ្ញាចរាចរ",
    "ផ្លាកសញ្ញា",
  ],
  openGraph: {
    title: "Cambodia Traffic Signs — Complete Reference List | KWD",
    description:
      "272 official Cambodian traffic control devices across 11 categories. Bilingual Khmer & English. Source: Ministry of Public Works and Transport PW03 series.",
    url: "https://www.kesararamwithdigital.tech/traffic-signs-reference",
    type: "article",
  },
  alternates: {
    canonical: "/traffic-signs-reference",
  },
};

export default function TrafficSignsReferencePage() {
  return <TrafficSignsReferenceClient />;
}
