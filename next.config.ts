import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Bundle the docs/brand-assets/brand-mockups/ files into the /api/brand-mockups
  // serverless function so fs.readFileSync can find them in production.
  outputFileTracingIncludes: {
    "/api/brand-mockups": ["./docs/brand-assets/brand-mockups/**/*"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during Next.js builds on CI to avoid build failures from warnings.
    // We still run lint in CI or locally; this prevents Vercel's build from failing.
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year for images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "**.neon.tech" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "cdnjs.cloudflare.com" },
    ],
  },
  async headers() {
    return [
      // Serve .well-known files as plain text, no redirects
      {
        source: "/.well-known/:file",
        headers: [
          { key: "Content-Type", value: "text/plain" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Server", value: "KWD-Server" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' required by Next.js for inline styles/scripts in RSC
              // 'unsafe-eval' required by Next.js dev mode and some libraries (GSAP, Mapbox)
              // googletagmanager/analytics loaded via next/script with strategy="afterInteractive"
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://events.mapbox.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.clarity.ms https://*.clarity.ms",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://api.mapbox.com",
              "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://cdn.jsdelivr.net https://raw.githubusercontent.com https://avatars.githubusercontent.com https://cdnjs.cloudflare.com https://api.mapbox.com https://*.mapbox.com https://www.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://*.c.bing.com",
              "connect-src 'self' wss://*.pusher.com https://*.pusher.com https://*.neon.tech https://api.cloudinary.com https://cdn.jsdelivr.net https://res.cloudinary.com https://api.mapbox.com https://events.mapbox.com https://*.mapbox.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://ssl.google-analytics.com https://*.clarity.ms https://*.c.bing.com",
              "media-src 'self' https://res.cloudinary.com",
              "worker-src 'self' blob:",
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Long-term cache for static assets
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache public images for 1 year
      {
        source: "/brand/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/avatar/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/Google_Sans/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect old category URLs to /learn/[category]
      {
        source: "/road-traffic",
        destination: "/learn/road-traffic",
        permanent: true,
      },
      {
        source: "/road-sign",
        destination: "/learn/road-sign",
        permanent: true,
      },
      {
        source: "/priority",
        destination: "/learn/priority",
        permanent: true,
      },
      {
        source: "/driving",
        destination: "/learn/driving",
        permanent: true,
      },
      {
        source: "/technical",
        destination: "/learn/technical",
        permanent: true,
      },
      {
        source: "/emergency",
        destination: "/learn/emergency",
        permanent: true,
      },
      {
        source: "/loading-people-goods",
        destination: "/learn/loading-people-goods",
        permanent: true,
      },
      {
        source: "/general-knowledge",
        destination: "/learn/general-knowledge",
        permanent: true,
      },
      // Redirect /about to /home (if /about doesn't exist)
      {
        source: "/forum",
        destination: "/home",
        permanent: false,
      },
    ];
  },
  // Empty turbopack config to acknowledge we're using Turbopack
  // Google Drive API will run server-side only via API routes with runtime: 'nodejs'
  turbopack: {},
};

export default nextConfig;
