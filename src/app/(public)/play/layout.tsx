import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Game | KWD Quiz",
  description: "Join a live quiz game session. Enter your game code and compete with other players in real-time.",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Join Game | KWD Quiz",
    description: "Join a live quiz game session and compete with other players",
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
