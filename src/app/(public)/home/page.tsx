"use client";

import { Hero } from "@/components/shared/hero";
import { CategoryGrid } from "@/components/categories/category-grid";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

export default function HomePage() {
  const { lang } = useLang();
  const tr = t[lang].home;
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <>
      <Hero />
      <CategoryGrid />

      {/* Daily stats section */}
      <section className="grid-bg py-16 border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: "1,200+", label: tr.statStudents, color: "#eab308" },
              { value: "8", label: tr.statAreas, color: "#06b6d4" },
              { value: "500+", label: tr.statQuestions, color: "#22c55e" },
              {
                value: kh ? "??????" : "Real-time",
                label: tr.statLive,
                color: "#ef4444",
              },
            ].map(({ value, label, color }) => (
              <div
                key={label}
                className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0_#000] flex flex-col gap-1"
              >
                <span className="text-3xl font-black" style={{ color }}>
                  {value}
                </span>
                <span
                  className="text-sm font-bold text-zinc-600"
                  style={khFont}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <div
              className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-lg mb-3"
              style={khFont}
            >
              {tr.howBadge}
            </div>
            <h2 className="text-4xl font-black" style={khFont}>
              {tr.howTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: tr.step1Title,
                desc: tr.step1Desc,
                color: "#eab308",
              },
              {
                step: "02",
                title: tr.step2Title,
                desc: tr.step2Desc,
                color: "#22c55e",
              },
              {
                step: "03",
                title: tr.step3Title,
                desc: tr.step3Desc,
                color: "#06b6d4",
              },
            ].map(({ step, title, desc, color }) => (
              <div
                key={step}
                className="bg-white border-2 border-black rounded-3xl p-8 shadow-[4px_4px_0_#000] flex flex-col gap-4"
              >
                <div
                  className="w-14 h-14 border-2 border-black rounded-2xl flex items-center justify-center font-black text-xl shadow-[2px_2px_0_#000]"
                  style={{ backgroundColor: color }}
                >
                  {step}
                </div>
                <h3 className="text-xl font-black" style={khFont}>
                  {title}
                </h3>
                <p
                  className="text-sm text-zinc-600 leading-relaxed"
                  style={khFont}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
