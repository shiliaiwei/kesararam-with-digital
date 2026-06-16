import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/context/lang-context";
import { ErrorDebugPanel } from "@/components/ErrorDebugPanel";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KWD — Learn Cambodia's Road Signs & Traffic Rules | Khmer & English",
    template: "%s | KWD — Kesararam With Digital",
  },
  description:
    "KWD is Cambodia's free, fully bilingual (ខ្មែរ / English) road-safety education platform. Learn traffic signs, road rules, and safe road-use theory through interactive lessons, quizzes, and live multiplayer games — on any phone or computer, anytime.",
  applicationName: "KWD — Kesararam With Digital",
  manifest: "/manifest.webmanifest",
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
    "learn traffic rules Cambodia",
    "Khmer road safety theory",
    "traffic law Cambodia",
    "road sign quiz",
    "traffic sign game",
    "license test practice Cambodia",
    "road safety theory practice",
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
    "រៀនសុវត្ថិភាពចរាចរណ៍",
    "តេស្តសញ្ញាចរាចរណ៍",
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
  themeColor: "#eab308",
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
        "KWD (Kesararam With Digital) is Cambodia's free, fully bilingual (Khmer & English) road-safety education platform — teaching traffic signs, road rules, and safe road-use theory through interactive lessons, quizzes, and live multiplayer games.",
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
        "A free, self-paced road-safety curriculum in Khmer and English covering Cambodian traffic signs, priority and right-of-way rules, safe road use, technical knowledge, emergencies, and the carriage of people and goods.",
      educationalProgramMode: "online",
      inLanguage: ["km", "en"],
      provider: { "@id": `${SITE_URL}/#organization` },
      url: `${SITE_URL}/learn`,
      occupationalCategory: "Road safety education",
      hasCourse: [
        { slug: "road-traffic", name: "Road Traffic", description: "Core road-traffic rules and the law of the road — how to behave safely in everyday traffic." },
        { slug: "road-sign", name: "Road Signs", description: "Recognize and understand Cambodian traffic signs — warning, prohibition, mandatory, information, and direction signs." },
        { slug: "priority", name: "Priority & Right of Way", description: "Who goes first — intersections, roundabouts, signals, and right-of-way rules." },
        { slug: "driving", name: "Driving", description: "Safe road-use theory and good road behavior for all road users." },
        { slug: "technical", name: "Technical Knowledge", description: "Vehicle and technical fundamentals every road user should understand." },
        { slug: "emergency", name: "Emergencies", description: "What to do in accidents and emergencies on the road." },
        { slug: "loading-people-goods", name: "Loading People & Goods", description: "Rules for safely carrying passengers and cargo." },
        { slug: "general-knowledge", name: "General Knowledge", description: "Broader road-safety awareness and everyday traffic know-how." },
      ].map((c) => ({
        "@type": "Course",
        name: c.name,
        description: c.description,
        url: `${SITE_URL}/learn/${c.slug}`,
        inLanguage: ["km", "en"],
        provider: { "@id": `${SITE_URL}/#organization` },
        // Free, self-paced online course → satisfies Google's "offers or
        // hasCourseInstance" requirement for Course rich results.
        offers: { "@type": "Offer", category: "Free", price: 0, priceCurrency: "USD" },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: "PT1H",
          inLanguage: ["km", "en"],
        },
      })),
    },
    {
      // Q&A in machine-readable form — eligible for Google rich results and
      // frequently quoted by AI assistants (ChatGPT, Claude, Perplexity, Gemini)
      // when users ask how to learn Cambodian traffic signs / road rules.
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is KWD free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Students can learn road safety, study Cambodian traffic signs, and play quiz games for free. Paid plans add tools for teachers, schools, families, and academies.",
          },
        },
        {
          "@type": "Question",
          name: "What languages does KWD support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Everything is fully bilingual — Khmer (ខ្មែរ) and English — and switchable anywhere on the platform.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I learn Cambodian traffic signs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Start in the Road Signs category to study warning, prohibition, mandatory, information and direction signs, then practice with the Sign Match and Catch the Sign games — all bilingual and free.",
          },
        },
        {
          "@type": "Question",
          name: "Can I practice for a traffic license test with KWD?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The Learn categories cover the road-safety theory and the games — especially Category Quiz and Daily Challenge — let you practice with quiz questions to check your knowledge before a license test.",
          },
        },
        {
          "@type": "Question",
          name: "Who made KWD?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "KWD (វិថីសុវត្ថិភាព · The Way of Safety) is built by Kesararam With Digital, a team of young Cambodian women in Siem Reap, as a Technovation Girls 2026 project (Team #50777).",
          },
        },
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
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/brand/kwd-green.png" />
        {/* Preconnect to Cloudinary — reduces LCP for sign images */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Preload official local KWD font stack */}
        <link rel="preload" href="/Roboto/Roboto-VariableFont_wdth,wght.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/Google_Sans/GoogleSans-VariableFont_GRAD,opsz,wght.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/Kantumruy_Pro/static/KantumruyPro-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/Kantumruy_Pro/static/KantumruyPro-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        {/* Material Symbols icon font */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        {/* Schema.org structured data (Organization + WebSite) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-system antialiased overflow-x-hidden">
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
