import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Students Leaderboard Cambodia | Rankings",
  description: "Check the live leaderboard for the top driving theory students in Cambodia. Practice your road signs and rules to earn points and claim rewards.",
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
