import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/context/lang-context";
import { ErrorDebugPanel } from "@/components/ErrorDebugPanel";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KWD — Kesararam With Digital",
    template: "%s | KWD",
  },
  description:
    "Cambodian driving knowledge and licensing education platform. Master traffic signs, road laws, and driving theory.",
  keywords: [
    "driving theory",
    "Cambodia",
    "traffic signs",
    "road safety",
    "KWD",
  ],
  metadataBase: new URL("https://www.kesararamwithdigital.tech"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    siteName: "KWD — Kesararam With Digital",
    locale: "en_US",
    type: "website",
    title: "KWD — Kesararam With Digital",
    description: "Master Cambodia's road rules and driving theory with our interactive learning platform.",
    images: [{
      url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg",
      width: 1200,
      height: 630,
      alt: "KWD Logo",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KWD — Kesararam With Digital",
    description: "Master Cambodia's road rules and driving theory with our interactive learning platform.",
    images: ["https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/brand/kwd-black-nobg_zicjml.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/kwd-black.png" />
        <link rel="apple-touch-icon" href="/brand/kwd-black.png" />
        <link rel="shortcut icon" href="/brand/kwd-black-nobg_zicjml.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <LangProvider>
          {children}
          <Toaster richColors closeButton />
          <ErrorDebugPanel />
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
