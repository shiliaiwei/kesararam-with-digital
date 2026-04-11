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
    { label: kh ? "សញ្ញាចរាចរ" : "Traffic Signs", href: "/road-sign" },
    { label: kh ? "ច្បាប់ចរាចរ" : "Road Traffic Law", href: "/road-traffic" },
    { label: kh ? "សិទ្ធិអាទិភាព" : "Right of Way", href: "/priority" },
    { label: kh ? "ជំនាញបើកបរ" : "Driving Skills", href: "/driving" },
    { label: kh ? "ប្រភេទទាំងអស់" : "All Categories", href: "/home" },
  ];

  const PLATFORM_LINKS = [
    { label: nav.leaderboard, href: "/leaderboard" },
    { label: nav.suarAI, href: "/suar/ai" },
    { label: nav.about, href: "/about" },
    { label: nav.login, href: "/login" },
    { label: kh ? "គោលការណ៍ម៉ាក" : "Brand Guideline", href: "/brand" },
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
            {"រៀន"} {"\u2014"} {"ប្រកួត"} {"\u2014"} {"ការពារជីវិត"}
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
              <li>{kh ? "កម្ពុជា" : "Cambodia"}</li>
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors" style={kf}>
                  {kh ? "គោលការណ៍ភាពឯកជន" : "Privacy Policy"}
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
