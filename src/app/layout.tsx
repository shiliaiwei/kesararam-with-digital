import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/context/lang-context";
import { ErrorDebugPanel } from "@/components/ErrorDebugPanel";
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
    images: [{
      url: "/brand/kwd-black-text.png",
      width: 1200,
      height: 630,
      alt: "KWD Cover",
    }],
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
        <link rel="icon" type="image/svg+xml" href="/brand/kwd.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/kwd-black-text.png" />
        <link rel="apple-touch-icon" href="/brand/kwd.png" />
        <link rel="shortcut icon" href="/brand/kwd.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <LangProvider>
          {children}
          <Toaster richColors closeButton />
          <ErrorDebugPanel />
        </LangProvider>
      </body>
    </html>
  );
}
