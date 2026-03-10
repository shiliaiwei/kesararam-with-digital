import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/context/lang-context";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL("https://kesararamwithdigital.tech"),
  openGraph: {
    siteName: "KWD — Kesararam With Digital",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LangProvider>
          {children}
          <Toaster richColors closeButton />
          <Analytics />
        </LangProvider>
      </body>
    </html>
  );
}
