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
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

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
  ];

  return (
    <footer className="bg-white text-black border-t-4 border-black">
      {/* Caution tape */}
      <div className="caution-tape" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Logo centered at top */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 mb-4">
            <Image
              src="/logo.svg"
              alt="KWD Logo"
              width={96}
              height={96}
              className="object-contain"
              unoptimized
            />
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed text-center max-w-md" style={khFont}>
            {tr.tagline}
          </p>
          <p
            className="text-xs text-zinc-500 mt-2 text-center"
            style={{ fontFamily: "Siemreap, sans-serif" }}
          >
            រៀន — ប្រកួត — ជោគជ័យ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Learn */}
          <div>
            <h4
              className="font-black text-sm text-yellow-600 tracking-widest uppercase mb-4"
              style={khFont}
            >
              {tr.learnTitle}
            </h4>
            <ul className="flex flex-col gap-2">
              {LEARN_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-600 hover:text-black hover:underline transition-colors"
                    style={khFont}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4
              className="font-black text-sm text-cyan-600 tracking-widest uppercase mb-4"
              style={khFont}
            >
              {tr.platformTitle}
            </h4>
            <ul className="flex flex-col gap-2">
              {PLATFORM_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-600 hover:text-black hover:underline transition-colors"
                    style={khFont}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-black text-sm text-green-600 tracking-widest uppercase mb-4"
              style={khFont}
            >
              {tr.contactTitle}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-zinc-600">
              <li>kesararamwithdigital.tech</li>
              <li>Cambodia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Kesararam With Digital. All rights
            reserved.
          </p>
          <div className="flex gap-4 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-black hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-black hover:underline">
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-zinc-400">
            Built for Cambodian road safety education.
          </p>
        </div>
      </div>
    </footer>
  );
}
