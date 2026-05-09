import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Live Driving Theory Quiz Cambodia",
  description: "Join interactive live quizzes on Cambodian driving theory and road rules. Test your knowledge in real-time and compete with top students.",
  openGraph: {
    title: "Live Driving Theory Quiz Cambodia",
    description: "Join interactive live quizzes on Cambodian driving theory and road rules.",
    type: "website",
  },
};

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
