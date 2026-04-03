"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

export function Footer() {
  const { lang } = useLang();
  const tr = t[lang].footer;
  const nav = t[lang].nav;
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const LEARN_LINKS = [
    { label: kh ? "\u179f\u1789\u17d2\u1789\u17b6\u1785\u179a\u17b6\u1785\u179a" : "Traffic Signs", href: "/road-sign" },
    { label: kh ? "\u1785\u17d2\u1794\u17b6\u1794\u17cb\u1785\u179a\u17b6\u1785\u179a" : "Road Traffic Law", href: "/road-traffic" },
    { label: kh ? "\u179f\u17b7\u1791\u17d2\u1792\u17b7\u178f\u17d2\u178f\u1793\u17d0\u17a2\u179a" : "Right of Way", href: "/priority" },
    { label: kh ? "\u1787\u17d0\u1793\u17d2\u1793\u17b6\u1789\u1794\u17be\u1780\u1794\u179a" : "Driving Skills", href: "/driving" },
    { label: kh ? "\u1794\u17d2\u179a\u1797\u17be\u178f\u178f\u17b6\u1798\u17a2\u179f\u17cb" : "All Categories", href: "/home" },
  ];

  const PLATFORM_LINKS = [
    { label: nav.leaderboard, href: "/leaderboard" },
    { label: nav.suarAI, href: "/suar/ai" },
    { label: nav.about, href: "/about" },
    { label: nav.login, href: "/login" },
    { label: kh ? "\u1780\u17b6\u179a\u178e\u17c2\u1793\u17b6\u17c6\u1798\u17d0\u17b6\u1780" : "Brand Guideline", href: "/brand" },
  ];

  return (
    <footer className="bg-white text-black border-t-4 border-black">
      <div className="caution-tape" />

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex flex-col items-center mb-14">
          <div className="w-28 h-28 mb-4 flex items-center justify-center">
            <Image src="/brand/kwd-black-text.png" alt="KWD" width={112} height={112} className="object-contain w-full h-full" unoptimized />
          </div>
          <p className="text-sm font-bold text-zinc-700 leading-relaxed text-center max-w-md" style={kf}>
            {tr.tagline}
          </p>
          <p className="text-xs text-zinc-500 mt-2 text-center" style={{ fontFamily: "Siemreap, sans-serif" }}>
            {"\u179a\u17b9\u1793"} {"\u2014"} {"\u1794\u17d2\u179a\u1780\u17bd\u178f"} {"\u2014"} {"\u1787\u17c4\u1782\u1787\u17d0\u1799"}
          </p>
        </div>

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
              <li>{kh ? "\u1794\u17d2\u179a\u178f\u17be\u179f\u1780\u1798\u17d2\u1796\u17bb\u1787\u17b6" : "Cambodia"}</li>
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors" style={kf}>
                  {kh ? "\u1782\u17c4\u179b\u1780\u17b6\u179a\u178e\u17cb\u17a1\u1780\u1787\u1793\u1797\u17b6\u1796" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-black transition-colors" style={kf}>
                  {kh ? "\u179b\u1780\u17d2\u1781\u1781\u178e\u17cb\u1794\u17d2\u179a\u17be\u1794\u17d2\u179a\u17b6\u179f\u17cb" : "Terms of Service"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-zinc-200 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-zinc-500 font-medium" style={kf}>
            &copy; {new Date().getFullYear()} Kesararam With Digital.{" "}
            {kh ? "\u179a\u1780\u17d2\u179f\u17b6\u179f\u17b7\u1791\u17d2\u1792\u17b7\u1782\u17d2\u179a\u1794\u17cb\u1799\u17d0\u17b6\u1784" : "All rights reserved."}
          </p>
          <p className="text-xs text-zinc-400 font-medium" style={kf}>
            {kh ? "\u1794\u1784\u17d2\u1780\u17be\u178f\u179f\u1798\u17d2\u179a\u17b6\u1794\u17cb\u1780\u17b6\u179a\u17a2\u1794\u17cb\u179a\u17c6\u179f\u17bd\u179c\u178f\u17d2\u178f\u1797\u17b6\u1796\u1785\u179a\u17b6\u1785\u179a\u178e\u17cb\u1780\u1798\u17d2\u1796\u17bb\u1787\u17b6" : "Built for Cambodian road safety education."}
          </p>
        </div>
      </div>
    </footer>
  );
}
