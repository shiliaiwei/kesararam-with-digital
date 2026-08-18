import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import VideoAdsClient from "./videoads-client";

/* Internal marketing tool — keep it out of search results. */
export const metadata: Metadata = {
  title: "Video Ads · វិថី សុវត្ថិភាព",
  description: "Kesararam With Digital short-video promo generator (admin only).",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

/* Admin-only: this is the reel recorder for social promos. */
export default async function VideoAdsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return <VideoAdsClient />;
}
