"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

const SECTIONS = [
  {
    title: "Public",
    color: "#eab308",
    pages: [
      { path: "/", label: "Root — redirects to /home" },
      { path: "/home", label: "Homepage — categories, hero, how it works" },
      { path: "/learn", label: "Learn — all 8 knowledge categories" },
      { path: "/play", label: "Play — join live game or solo practice" },
      { path: "/leaderboard", label: "Leaderboard — weekly, monthly, all-time" },
      { path: "/suar/ai", label: "Suar AI — conversational driving theory assistant" },
      { path: "/about", label: "About — team story, mission, gallery" },
      { path: "/login", label: "Login — email or username authentication" },
      { path: "/pricing", label: "Pricing — Free, Teacher Pro, School plans" },
    ],
  },
  {
    title: "Knowledge Categories",
    color: "#3b82f6",
    pages: [
      { path: "/road-sign", label: "Traffic Signs" },
      { path: "/road-traffic", label: "Road Traffic Law" },
      { path: "/priority", label: "Right of Way" },
      { path: "/driving", label: "Driving Skills" },
      { path: "/technical", label: "Vehicle Technology" },
      { path: "/loading-people-goods", label: "Loading People and Goods" },
      { path: "/general-knowledge", label: "General Knowledge" },
      { path: "/emergency", label: "Emergency" },
    ],
  },
  {
    title: "Student",
    color: "#22c55e",
    pages: [
      { path: "/profile/student", label: "Student Profile — stats, edit, avatar" },
      { path: "/play", label: "Join Live Game — enter session code" },
      { path: "/play/[code]", label: "Live Game Session — real-time quiz" },
    ],
  },
  {
    title: "Teacher Dashboard",
    color: "#a855f7",
    pages: [
      { path: "/teacher/sessions", label: "Sessions — list of hosted games" },
      { path: "/teacher/sessions/host", label: "Host Game — create live session" },
      { path: "/teacher/sessions/[code]/analytics", label: "Session Analytics — per-question stats" },
      { path: "/teacher/classes", label: "Classes — manage student groups" },
      { path: "/teacher/profile", label: "Teacher Profile" },
    ],
  },
  {
    title: "Admin Dashboard",
    color: "#ef4444",
    pages: [
      { path: "/admin/users", label: "Users — create, edit, suspend accounts" },
      { path: "/admin/subscriptions", label: "Subscriptions — assign plans manually" },
      { path: "/admin/review", label: "Review Queue — approve or reject content" },
      { path: "/admin/content", label: "Content — all 8 category content managers" },
      { path: "/admin/media", label: "Media Library — Cloudinary browser" },
      { path: "/admin/game-sessions", label: "Game Sessions — all live and solo sessions" },
      { path: "/admin/road-markings", label: "Road Markings — curbs, signals, longitudinal" },
      { path: "/admin/logs", label: "Logs — system audit trail" },
    ],
  },
  {
    title: "Staff Dashboard",
    color: "#f97316",
    pages: [
      { path: "/staff/topics", label: "Topics — create and manage content topics" },
      { path: "/staff/content", label: "Content — submit content for review" },
      { path: "/staff/media", label: "Media Library — Cloudinary browser" },
      { path: "/staff/submissions", label: "My Submissions — track approval status" },
      { path: "/staff/classes", label: "Classes — assigned student groups" },
    ],
  },
  {
    title: "Legal and Brand",
    color: "#6b7280",
    pages: [
      { path: "/privacy", label: "Privacy Policy" },
      { path: "/terms", label: "Terms of Service" },
      { path: "/brand", label: "Brand Guideline" },
      { path: "/sitemap-page", label: "Sitemap (this page)" },
    ],
  },
  {
    title: "API Routes",
    color: "#000000",
    pages: [
      { path: "/api/auth/me", label: "GET — current session user" },
      { path: "/api/game/sessions", label: "POST — create live session" },
      { path: "/api/game/sessions/[code]/events", label: "GET — SSE stream for live game" },
      { path: "/api/game/solo", label: "GET — start solo practice" },
      { path: "/api/ai/chat", label: "POST — Suar AI conversational assistant" },
      { path: "/api/leaderboard", label: "GET — global leaderboard by period" },
      { path: "/api/cloudinary/images", label: "GET — media assets from Cloudinary" },
      { path: "/api/cloudinary/folders", label: "GET — folder list from Cloudinary" },
      { path: "/api/health", label: "GET — deployment health check" },
    ],
  },
];

export function SitemapClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-black text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-black uppercase tracking-widest text-yellow-400 mb-2">KWD — Kesararam With Digital</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3" style={kf}>
            {kh ? "ផែនទីគេហទំព័រ" : "Sitemap"}
          </h1>
          <p className="text-sm text-zinc-400 font-medium" style={kf}>
            {kh
              ? "រចនាសម្ព័ន្ធពេញលេញនៃគេហទំព័រ KWD"
              : "Complete structure of every page, route, and API endpoint in the KWD platform."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">
        {SECTIONS.map(({ title, color, pages }) => (
          <div key={title}>
            <div className="flex items-stretch gap-0 mb-4">
              <div className="w-1.5" style={{ background: color }} />
              <div className="px-4 py-1.5 flex items-center" style={{ background: color, borderRight: "2px solid #000" }}>
                <span className="text-[10px] font-black uppercase tracking-widest text-black">{title}</span>
              </div>
            </div>
            <div className="border-2 border-black overflow-hidden shadow-[3px_3px_0_#000]">
              {pages.map(({ path, label }, i) => (
                <div
                  key={path}
                  className="flex items-start gap-4 px-4 py-3 hover:bg-yellow-50 transition-colors"
                  style={{ borderBottom: i < pages.length - 1 ? "1px solid #e5e7eb" : undefined }}
                >
                  <code className="text-[11px] font-mono font-bold text-zinc-500 whitespace-nowrap pt-0.5 min-w-[180px]">
                    {path}
                  </code>
                  <span className="text-sm text-zinc-700 font-medium" style={kf}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="border-t-2 border-black pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-zinc-500 font-medium" style={kf}>
            &copy; {new Date().getFullYear()} KWD — Kesararam With Digital
          </p>
          <div className="flex gap-4 text-xs font-bold">
            <Link href="/terms" className="text-zinc-500 hover:text-black transition-colors" style={kf}>Terms</Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-black transition-colors" style={kf}>Privacy</Link>
            <Link href="/brand" className="text-zinc-500 hover:text-black transition-colors" style={kf}>Brand</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
