"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { SECTIONS } from "@/data/terms-data";

export default function TermsPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">

      {/* Header */}
      <header className="border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[10px] font-mono text-zinc-400 mb-3 uppercase tracking-widest">
            {kh ? "ឯកសារច្បាប់" : "Legal Document"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900" style={kf}>
            {kh ? "លក្ខខណ្ឌប្រើប្រាស់ KWD" : "KWD Terms of Use"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-xl leading-relaxed" style={kf}>
            {kh
              ? "ការប្រើប្រាស់ KWD មានន័យថាអ្នកយល់ព្រមនឹងលក្ខខណ្ឌទាំងនេះ។"
              : "By using KWD you agree to these terms. Please read them carefully before using the platform."}
          </p>
          <p className="mt-3 text-xs text-zinc-400 font-mono">
            {kh
              ? "ធ្វើបច្ចុប្បន្នភាព មិថុនា ២០២៦ · KWD · Technovation Girls 2026 · ក្រុម #50777 · Junior Division · សៀមរាប, កម្ពុជា"
              : "Last updated June 2026 · KWD · Technovation Girls 2026 · Team #50777 · Junior Division · Siem Reap, Cambodia"}
          </p>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-16">

        {/* Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <nav className="sticky top-24 space-y-0.5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-baseline gap-2 py-1.5 text-sm transition-colors ${
                  active === s.id
                    ? "text-zinc-900 font-semibold"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <span className="text-[10px] font-mono shrink-0 w-5 text-zinc-300">{s.num}</span>
                <span style={kf}>{kh ? s.heading.kh : s.heading.en}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="space-y-0 divide-y divide-zinc-100">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 py-10 first:pt-0">

                {/* Section heading */}
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-xs font-mono text-zinc-300 shrink-0">{s.num}</span>
                  <h2 className="text-base font-bold text-zinc-900 leading-snug" style={kf}>
                    {kh ? s.heading.kh : s.heading.en}
                  </h2>
                </div>

                {/* Body — active language only */}
                <div className="space-y-3">
                  {(kh ? s.kh : s.en).split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm text-zinc-700 leading-relaxed" style={kf}>
                      {para.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < para.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>

              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200 mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
            <span style={kf}>© 2026 Kesararam With Digital · kesararamwithdigital.tech</span>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-zinc-700 transition-colors" style={kf}>
                {kh ? "ភាពឯកជន" : "Privacy"}
              </Link>
              <Link href="/about" className="hover:text-zinc-700 transition-colors" style={kf}>
                {kh ? "អំពីយើង" : "About"}
              </Link>
              <a href="mailto:kesararamwithdigital@gmail.com" className="hover:text-zinc-700 transition-colors">
                kesararamwithdigital@gmail.com
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
