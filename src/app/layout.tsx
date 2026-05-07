import type { Metadata, Viewport } from "next";
import { Inter, Kantumruy_Pro, Siemreap } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/context/lang-context";
import { ErrorDebugPanel } from "@/components/ErrorDebugPanel";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const kantumruy = Kantumruy_Pro({
  variable: "--font-kh-header",
  subsets: ["khmer"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siemreap = Siemreap({
  variable: "--font-kh-body",
  subsets: ["khmer"],
  display: "swap",
  weight: ["400"],
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
      url: "/brand/kwd-green_ofhdec.png",
      width: 1200,
      height: 630,
      alt: "KWD Logo",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KWD — Kesararam With Digital",
    description: "Master Cambodia's road rules and driving theory with our interactive learning platform.",
    images: ["/brand/kwd-green_ofhdec.png"],
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
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/kwd-green_ofhdec.png" />
        <link rel="apple-touch-icon" href="/brand/kwd-green_ofhdec.png" />
        <link rel="shortcut icon" href="/brand/kwd-green_ofhdec.png" />
      </head>
      <body className={`${inter.variable} ${kantumruy.variable} ${siemreap.variable} font-sans antialiased overflow-x-hidden`}>
        <GoogleAnalytics />
        <LangProvider>
          {children}
          <Toaster richColors closeButton />
          <ErrorDebugPanel />
        </LangProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
