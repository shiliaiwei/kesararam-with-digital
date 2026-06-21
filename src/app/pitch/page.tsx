import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import "./pitch.css";
import PitchDeck from "./pitch-deck";

/* Internal presentation deck — keep it out of search results. */
export const metadata: Metadata = {
  title: "Pitch · The Way of Safety",
  description: "KWD Technovation 2026 pitch deck.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d0d0f",
};

/* Public on the web product, but viewable by signed-in accounts only. */
export default async function PitchPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <PitchDeck />;
}
