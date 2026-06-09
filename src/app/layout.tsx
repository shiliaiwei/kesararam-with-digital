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
    "Most students fail not because they're not smart — but because no one made learning easy. KWD is Cambodia's free bilingual education platform that turns complex knowledge into something anyone can understand, remember, and use.",
  keywords: [
    "education platform",
    "Cambodia",
    "bilingual learning",
    "interactive learning",
    "KWD",
    "knowledge",
    "students",
    "free learning",
    "Khmer education",
  ],
  metadataBase: new URL("https://www.kesararamwithdigital.tech"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    siteName: "KWD — Kesararam With Digital",
    locale: "en_US",
    type: "website",
    title: "KWD — Learn Anything. Understand Everything.",
    description: "Most students fail not because they're not smart — but because no one made learning easy. KWD changes that. Free, bilingual, built for Cambodia.",
    images: [{
      url: "/brand/kwd-green.png",
      width: 1200,
      height: 630,
      alt: "KWD Logo",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KWD — Learn Anything. Understand Everything.",
    description: "Most students fail not because they're not smart — but because no one made learning easy. KWD changes that. Free, bilingual, built for Cambodia.",
    images: ["/brand/kwd-green.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = "https://www.kesararamwithdigital.tech";

// Schema.org structured data — helps search engines and LLMs identify the
// organization behind the site and enables rich results.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: "Kesararam With Digital",
      alternateName: "KWD",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/kwd-green.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/brand/kwd-green.png`,
      description:
        "KWD is Cambodia's free bilingual education platform that turns complex knowledge into something anyone can understand, remember, and use.",
      email: "kesararamwithdigital@gmail.com",
      foundingDate: "2025",
      areaServed: { "@type": "Country", name: "Cambodia" },
      sameAs: ["https://t.me/kesararamwithdigital"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "KWD — Kesararam With Digital",
      description:
        "Free, bilingual education platform built for Cambodia. Learn anything, understand everything.",
      inLanguage: ["en", "km"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/kwd-green.png" />
        <link rel="apple-touch-icon" href="/brand/kwd-green.png" />
        <link rel="shortcut icon" href="/brand/kwd-green.png" />
        {/* Preconnect to Cloudinary — reduces LCP for sign images */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Preload critical brand fonts (WOFF2) to speed first paint */}
        <link rel="preload" href="/Google_Sans/static/GoogleSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/Google_Sans/static/GoogleSans-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        {/* Schema.org structured data (Organization + WebSite) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
