import type { Metadata } from "next";
import { PitchClient } from "./pitch-client";

export const metadata: Metadata = {
  title: "Regional Pitch Event — Kesararam With Digital",
  description: "Regional Pitch Event slide presentation.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RegionalPitchEventPage() {
  return <PitchClient />;
}
