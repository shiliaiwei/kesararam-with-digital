"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

// ── Tools used to build this project ─────────────────────────────────────────
const TOOLS = [
  { name: "GitHub",           desc: "Version control and source code hosting" },
  { name: "VS Code",          desc: "Primary code editor" },
  { name: "Kiro",             desc: "AI-powered IDE assistant" },
  { name: "Neon DB",          desc: "Serverless PostgreSQL database" },
  { name: "Next.js",          desc: "React full-stack framework" },
  { name: "TypeScript",       desc: "Statically typed JavaScript" },
  { name: "Tailwind CSS",     desc: "Utility-first CSS framework" },
  { name: "Vercel",           desc: "Deployment and hosting platform" },
  { name: "Cloudinary",       desc: "Media storage and CDN delivery" },
  { name: "Figma",            desc: "UI design and prototyping" },
  { name: "Affinity",         desc: "Vector and raster graphic design" },
  { name: "Claude AI",        desc: "AI assistant for code and content" },
  { name: "ChatGPT",          desc: "AI language model for research" },
  { name: "Gemini",           desc: "Google AI for multimodal tasks" },
  { name: "Grok",             desc: "AI reasoning and analysis" },
  { name: "Kimi AI",          desc: "Long-context AI assistant" },
  { name: "Copilot",          desc: "AI code completion in editor" },
  { name: "DeepSeek",         desc: "Open-source AI model" },
  { name: "Qwen",             desc: "Alibaba multilingual AI model" },
  { name: "NotebookLM",       desc: "Google AI research notebook" },
  { name: "Yoanbao",          desc: "AI writing assistant" },
  { name: "AI Studio",        desc: "Google AI model playground" },
  { name: "Firebase Studio",  desc: "Google app development platform" },
  { name: "Wisk Google Lab",  desc: "Google experimental AI workspace" },
  { name: "Stitch Google",    desc: "Google design-to-code tool" },
  { name: "v0 by Vercel",     desc: "AI UI component generator" },
  { name: "Antigravity",      desc: "Creative AI tool" },
  { name: "Vector Magic",     desc: "Bitmap to vector conversion" },
  { name: "Git",              desc: "Distributed version control system" },
  { name: "HTML",             desc: "Web markup language" },
  { name: "CSS",              desc: "Web styling language" },
  { name: "Kahoot",           desc: "Inspiration for live quiz mechanics" },
  { name: "YouTube",          desc: "Video reference and research" },
  { name: "Pinterest",        desc: "Visual design inspiration" },
  { name: "TikTok",           desc: "Short-form content reference" },
  { name: "X (Twitter)",      desc: "Tech community and announcements" },
  { name: "Xauhongshe",       desc: "Chinese developer community" },
  { name: "Ministry of Public Works and Transport", desc: "Official Cambodian driving regulation authority (Prakas)" },
  { name: "Cambodia Driving Rule App", desc: "Official reference for driving theory content" },
];

export function Footer() {
  const { lang } = useLang();
  const tr = t[lang].footer;
  const nav = t[lang].nav;
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const LEARN_LINKS = [
    { label: kh ? "សញ្ញាចរាចរ" : "Traffic Signs", href: "/road-sign" },
    { label: kh ? "ច្បាប់ចរាចរ" : "Road Traffic Law", href: "/road-traffic" },
    { label: kh ? "សិទ្ធិដំណើរ" : "Right of Way", href: "/priority" },
    { label: kh ? "ជំនាញបើកបរ" : "Driving Skills", href: "/driving" },
    { label: kh ? "ប្រភេទទាំងអស់" : "All Categories", href: "/home" },
  ];

  const PLATFORM_LINKS = [
    { label: nav.leaderboard, href: "/leaderboard" },
    { label: nav.suarAI, href: "/suar/ai" },
    { label: nav.about, href: "/about" },
    { label: nav.login, href: "/login" },
    { label: kh ? "ការណែនាំម៉ាក" : "Brand Guideline", href: "/brand" },
    { label: kh ? "ផែនទីគេហទំព័រ" : "Sitemap", href: "/sitemap-page" },
  ];

  return (
    <footer className="bg-white text-black border-t-4 border-black">
      <div className="caution-tape" />

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center mb-14">
          <div className="w-20 h-20 mb-4 border-2 border-black shadow-[4px_4px_0_#000] flex items-center justify-center bg-white p-2">
            <Image src="/brand/kwd.svg" alt="KWD" width={64} height={64} className="object-contain" unoptimized />
          </div>
          <p className="text-sm font-bold text-zinc-700 leading-relaxed text-center max-w-md" style={kf}>
            {tr.tagline}
          </p>
          <p className="text-xs text-zinc-500 mt-2 text-center" style={{ fontFamily: "Siemreap, sans-serif" }}>
            រៀន — ប្រកួត — ជោគជ័យ
          </p>
        </div>

        {/* Nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">
          <div>
            <h4 className="font-black text-xs text-yellow-600 tracking-widest uppercase mb-4 border-b-2 border-black pb-2" style={kf}>
              {tr.learnTitle}
            </h4>
            <ul className="flex flex-col gap-2">
              {LEARN_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-600 hover:text-black font-medium transition-colors" style={kf}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs text-cyan-600 tracking-widest uppercase mb-4 border-b-2 border-black pb-2" style={kf}>
              {tr.platformTitle}
            </h4>
            <ul className="flex flex-col gap-2">
              {PLATFORM_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-zinc-600 hover:text-black font-medium transition-colors" style={kf}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs text-green-600 tracking-widest uppercase mb-4 border-b-2 border-black pb-2" style={kf}>
              {tr.contactTitle}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-zinc-600 font-medium">
              <li>kesararamwithdigital.tech</li>
              <li>{kh ? "ប្រទេសកម្ពុជា" : "Cambodia"}</li>
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors" style={kf}>
                  {kh ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-black transition-colors" style={kf}>
                  {kh ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Service"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Built with section */}
        <div className="border-t-2 border-black pt-10 mb-10">
          <h4 className="font-black text-xs tracking-widest uppercase mb-1 text-black" style={kf}>
            {kh ? "បង្កើតដោយប្រើ" : "Built With"}
          </h4>
          <p className="text-xs text-zinc-500 mb-5 font-medium" style={kf}>
            {kh
              ? "ឧបករណ៍ បច្ចេកវិទ្យា និងវេទិកាដែលបានប្រើក្នុងការបង្កើតគម្រោងនេះ — ដាក់លើ ដើម្បីមើលឈ្មោះ"
              : "Every tool, technology, and platform that shaped this project — hover to reveal"}
          </p>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map(({ name, desc }) => (
              <div key={name} className="relative group">
                <span
                  className="inline-block px-2.5 py-1 text-[11px] font-black uppercase tracking-wide border-2 border-black bg-white cursor-default select-none transition-all duration-100 group-hover:bg-black group-hover:text-yellow-400 group-hover:shadow-[2px_2px_0_#ca8a04]"
                >
                  {name}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 z-50 hidden group-hover:block pointer-events-none">
                  <div className="bg-black text-white text-[10px] font-bold px-3 py-1.5 whitespace-nowrap border border-black shadow-[2px_2px_0_#ca8a04] max-w-[220px] leading-snug">
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t-2 border-zinc-200 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-zinc-500 font-medium" style={kf}>
            &copy; {new Date().getFullYear()} Kesararam With Digital.{" "}
            {kh ? "រក្សាសិទ្ធិគ្រប់យ៉ាង" : "All rights reserved."}
          </p>
          <p className="text-xs text-zinc-400 font-medium" style={kf}>
            {kh ? "បង្កើតសម្រាប់ការអប់រំសុវត្ថិភាពចរាចរណ៍កម្ពុជា" : "Built for Cambodian road safety education."}
          </p>
        </div>
      </div>
    </footer>
  );
}
