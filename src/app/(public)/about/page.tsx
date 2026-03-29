import type { Metadata } from "next";
import { AboutClient } from "./about-client";

export const metadata: Metadata = {
  title: "About — KWD · Kesararam With Digital",
  description: "Team KWD — young Cambodian girls building road safety education through Technovation Girls.",
};

export default function AboutPage() {
  return <AboutClient />;
}
