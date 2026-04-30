import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typescript: {
    // TypeScript errors are caught in CI — don't block Vercel builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "**.neon.tech" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "cdnjs.cloudflare.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",               value: "DENY" },
          { key: "X-Content-Type-Options",         value: "nosniff" },
          { key: "X-DNS-Prefetch-Control",         value: "on" },
          { key: "Referrer-Policy",                value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",             value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
          { key: "Strict-Transport-Security",      value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection",               value: "1; mode=block" },
          { key: "Server",                         value: "KWD-Server" },
          { key: "Cross-Origin-Opener-Policy",     value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy",   value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy",   value: "require-corp" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' required for Next.js; 'unsafe-eval' required by Mapbox GL JS (WebGL)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://events.mapbox.com",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://api.mapbox.com",
              "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://cdn.jsdelivr.net https://raw.githubusercontent.com https://cdnjs.cloudflare.com https://api.mapbox.com https://*.mapbox.com",
              "connect-src 'self' https://*.neon.tech https://api.cloudinary.com https://cdn.jsdelivr.net https://res.cloudinary.com https://api.mapbox.com https://events.mapbox.com https://*.mapbox.com",
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
    ];
  },
  // Empty turbopack config to acknowledge we're using Turbopack
  // Google Drive API will run server-side only via API routes with runtime: 'nodejs'
  turbopack: {},
};

export default nextConfig;
