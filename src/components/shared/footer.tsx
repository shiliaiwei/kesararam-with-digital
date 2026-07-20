"use client";

import Link from "next/link";
import Image from "next/image";
import { FaYoutube } from "react-icons/fa";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

export function Footer() {
  const { lang } = useLang();
  const tr = t[lang].footer;
  const nav = t[lang].nav;
  const kh = lang === "kh";
  const kf = kh
    ? { fontFamily: "var(--font-system)", fontWeight: 700 }
    : { fontFamily: "var(--font-en)" };

  const LEARN_LINKS = [
    { label: kh ? "សញ្ញាចរាចរ" : "Traffic Signs", href: "/learn/road-sign" },
    { label: kh ? "ច្បាប់ចរាចរ" : "Road Traffic Law", href: "/learn/road-traffic" },
    { label: kh ? "សិទ្ធិអាទិភាព" : "Right of Way", href: "/learn/priority" },
    { label: kh ? "ជំនាញបើកបរ" : "Driving Skills", href: "/learn/driving" },
    { label: kh ? "ប្រភេទទាំងអស់" : "All Categories", href: "/learn" },
  ];

  const PLATFORM_LINKS = [
    { label: nav.leaderboard, href: "/leaderboard" },
    { label: nav.suarAI, href: "/suar/ai" },
    { label: nav.about, href: "/about" },
    { label: nav.login, href: "/login" },
    { label: kh ? "ម៉ាករបស់យើង" : "Brand Guideline", href: "/brand" },
    { label: kh ? "ឯកសារយោង" : "Bibliography", href: "/built-with" },
  ];

  return (
    <footer className="bg-white text-black border-t-4 border-black">
      <div className="caution-tape" />

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex flex-col items-center mb-14">
          <div className="w-28 h-28 mb-4 flex items-center justify-center">
            <Image src="https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg" alt="KWD" width={112} height={112} className="object-contain w-full h-full" unoptimized />
          </div>
          <p className="font-google-sans font-black text-2xl text-black leading-none mb-1 text-center">
            វិថី សុវត្ថិភាព
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 text-center">
            The Way of Safety
          </p>
          {/* Brand emotional quote */}
          <p className="font-google-sans text-base md:text-lg font-black text-black mb-3 text-center max-w-md leading-snug border-b-2 border-yellow-400 pb-2">
            {kh
              ? "ចំណេះដឹងថ្ងៃនេះ ការពារជីវិតថ្ងៃស្អែក"
              : "Knowledge today protects life tomorrow"}
          </p>
          <p className="text-xs text-zinc-500 mt-2 text-center" style={kf}>
            {kh
              ? "ថ្នាលរៀនសុវត្ថិភាពចរាចរណ៍ឌីជីថល សម្រាប់យុវជន និងប្រជាពលរដ្ឋកម្ពុជា។"
              : "A digital road-safety learning platform for Cambodia's youth and people."}
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
              {tr.contactTitle || (kh ? "ទំនាក់ទំនង" : "Contact")}
            </h4>

            <div className="flex flex-wrap gap-3 mb-6">
              {/* Email — green */}
              <a href="mailto:kesararamwithdigital@gmail.com"
                className="group relative flex items-center justify-center w-10 h-10 border-2 border-black transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ background: "#22c55e", boxShadow: "3px 3px 0 #000" }}
                aria-label="Email">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {/* Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Gmail
                </span>
              </a>

              {/* Telegram — blue */}
              <a href="https://t.me/kesararamwithdigital" target="_blank" rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-10 h-10 border-2 border-black transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ background: "#0088cc", boxShadow: "3px 3px 0 #000" }}
                aria-label="Telegram">
                <svg viewBox="0 0 24 24" fill="#fff" className="w-5 h-5">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Telegram
                </span>
              </a>

              {/* Facebook — blue */}
              <a href="https://web.facebook.com/kesararamwithdigital/" target="_blank" rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-10 h-10 border-2 border-black transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ background: "#1877f2", boxShadow: "3px 3px 0 #000" }}
                aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="#fff" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Facebook
                </span>
              </a>

              {/* TikTok — black */}
              <a href="https://www.tiktok.com/@kesararamwithdigital" target="_blank" rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-10 h-10 border-2 border-black transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ background: "#000000", boxShadow: "3px 3px 0 #000" }}
                aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="#fff" className="w-5 h-5">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.73 4.12 1.13 1.09 2.69 1.63 4.26 1.62v3.94c-1.85-.02-3.66-.63-5.17-1.72-.19-.14-.36-.31-.53-.47v7.55c.02 1.48-.4 2.94-1.2 4.17-1.39 2.06-3.83 3.32-6.32 3.23-2.61-.06-5.1-1.48-6.41-3.75-1.57-2.6-1.3-6.09.67-8.42 1.63-1.89 4.15-2.83 6.64-2.5v3.97c-1.35-.3-2.8.15-3.69 1.18-.94 1.04-1.09 2.63-.37 3.82.68 1.18 2.08 1.88 3.44 1.76 1.46-.07 2.76-1.12 2.99-2.56.08-.41.06-.83.06-1.25V0h.03z" />
                </svg>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  TikTok
                </span>
              </a>

              {/* YouTube — red */}
              <a href="https://www.youtube.com/@kesararamwithdigital" target="_blank" rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-10 h-10 border-2 border-black transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ background: "#ef4444", boxShadow: "3px 3px 0 #000" }}
                aria-label="YouTube">
                <FaYoutube className="w-5 h-5 text-white" aria-hidden="true" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  YouTube
                </span>
              </a>



            </div>

            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/privacy" className="text-sm text-zinc-600 hover:text-black font-medium transition-colors" style={kf}>
                  {kh ? "គោលការណ៍ភាពឯកជន" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-zinc-600 hover:text-black font-medium transition-colors" style={kf}>
                  {kh ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Use"}
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
            {kh ? "ចំណេះដឹងសុវត្ថិភាព សម្រាប់ប្រជាជនកម្ពុជាគ្រប់គ្នា" : "Safety knowledge for every Cambodian."}
          </p>
        </div>
      </div>
    </footer>
  );
}
