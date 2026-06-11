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
    default: "KWD — Learn Cambodia's Road Signs & Traffic Rules | Khmer & English",
    template: "%s | KWD — Kesararam With Digital",
  },
  description:
    "KWD is Cambodia's free, fully bilingual (ខ្មែរ / English) road-safety education platform. Learn traffic signs, road rules, and safe-driving theory through interactive lessons, quizzes, and live multiplayer games — on any phone or computer, anytime.",
  applicationName: "KWD — Kesararam With Digital",
  authors: [{ name: "Kesararam With Digital", url: "https://www.kesararamwithdigital.tech" }],
  creator: "Kesararam With Digital (Technovation Girls 2026, Team #50777)",
  publisher: "Kesararam With Digital",
  category: "education",
  keywords: [
    // English — intent & topic
    "Cambodia road signs",
    "Cambodia traffic rules",
    "traffic signs Cambodia",
    "road safety Cambodia",
    "learn driving rules Cambodia",
    "Khmer driving theory",
    "traffic law Cambodia",
    "road sign quiz",
    "traffic sign game",
    "driving theory practice",
    "bilingual education Cambodia",
    "free education platform",
    "road safety education",
    "learn traffic signs online",
    // Brand
    "KWD",
    "Kesararam With Digital",
    // Khmer (ខ្មែរ)
    "ច្បាប់ចរាចរណ៍",
    "ផ្លាកសញ្ញាចរាចរណ៍",
    "សញ្ញាចរាចរណ៍",
    "សុវត្ថិភាពចរាចរណ៍",
    "សញ្ញាផ្លូវ",
    "រៀនបើកបរ",
    "ច្បាប់ផ្លូវគោក",
    "ការអប់រំ",
  ],
  metadataBase: new URL("https://www.kesararamwithdigital.tech"),
  alternates: {
    canonical: "./",
    languages: {
      en: "/",
      km: "/",
      "x-default": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    siteName: "KWD — Kesararam With Digital",
    locale: "en_US",
    alternateLocale: "km_KH",
    type: "website",
    url: "https://www.kesararamwithdigital.tech",
    title: "KWD — Learn Cambodia's Road Signs & Traffic Rules, Free & Bilingual",
    description:
      "Free bilingual (ខ្មែរ / English) road-safety learning for Cambodia: traffic signs, road rules, interactive quizzes, and live multiplayer games. Learn on any device, anytime.",
    images: [{
      url: "/brand/og-cover.png",
      width: 1200,
      height: 630,
      alt: "KWD — Kesararam With Digital, bilingual road-safety learning for Cambodia",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KWD — Learn Cambodia's Road Signs & Traffic Rules, Free & Bilingual",
    description:
      "Cambodia's free bilingual road-safety platform: traffic signs, road rules, quizzes, and live games in Khmer & English.",
    images: ["/brand/og-cover.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = "https://www.kesararamwithdigital.tech";

// Schema.org structured data — helps search engines and LLMs identify the
// organization behind the site, understand the bilingual road-safety
// curriculum, and surface rich results.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: "Kesararam With Digital",
      alternateName: ["KWD", "Kesararam With Digital"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/kwd-green.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/brand/kwd-green.png`,
      slogan: "Learn the road. Stay safe. In Khmer and English.",
      description:
        "KWD (Kesararam With Digital) is Cambodia's free, fully bilingual (Khmer & English) road-safety education platform — teaching traffic signs, road rules, and safe-driving theory through interactive lessons, quizzes, and live multiplayer games.",
      email: "kesararamwithdigital@gmail.com",
      foundingDate: "2025",
      knowsLanguage: ["km", "en"],
      areaServed: { "@type": "Country", name: "Cambodia" },
      foundingLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Siem Reap",
          addressCountry: "KH",
        },
      },
      sameAs: ["https://t.me/kesararamwithdigital"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "KWD — Kesararam With Digital",
      alternateName: "KWD",
      description:
        "Cambodia's free, bilingual (Khmer & English) road-safety platform — learn traffic signs and road rules through lessons, quizzes, and live games.",
      inLanguage: ["en", "km"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "EducationalOccupationalProgram",
      "@id": `${SITE_URL}/#program`,
      name: "Bilingual Road-Safety & Traffic-Sign Course",
      description:
        "A free, self-paced road-safety curriculum in Khmer and English covering Cambodian traffic signs, priority and right-of-way rules, safe driving, technical knowledge, emergencies, and the carriage of people and goods.",
      educationalProgramMode: "online",
      inLanguage: ["km", "en"],
      provider: { "@id": `${SITE_URL}/#organization` },
      url: `${SITE_URL}/learn`,
      occupationalCategory: "Road safety education",
      hasCourse: [
        { "@type": "Course", name: "Road Traffic", url: `${SITE_URL}/learn/road-traffic`, provider: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "Course", name: "Road Signs", url: `${SITE_URL}/learn/road-sign`, provider: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "Course", name: "Priority & Right of Way", url: `${SITE_URL}/learn/priority`, provider: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "Course", name: "Driving", url: `${SITE_URL}/learn/driving`, provider: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "Course", name: "Technical Knowledge", url: `${SITE_URL}/learn/technical`, provider: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "Course", name: "Emergencies", url: `${SITE_URL}/learn/emergency`, provider: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "Course", name: "Loading People & Goods", url: `${SITE_URL}/learn/loading-people-goods`, provider: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "Course", name: "General Knowledge", url: `${SITE_URL}/learn/general-knowledge`, provider: { "@id": `${SITE_URL}/#organization` } },
      ],
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
