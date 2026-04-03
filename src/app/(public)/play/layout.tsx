import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Join Game | KWD Quiz",
  description: "Join a live quiz game session. Enter your game code and compete with other players in real-time.",
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
