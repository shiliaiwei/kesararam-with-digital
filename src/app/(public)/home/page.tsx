"use client";

import { RoadSigns3DHero } from "@/components/hero/road-signs-3d-hero";
import { SponsorsMarquee } from "@/components/sections/sponsors-marquee";
import { CategoryGrid } from "@/components/categories/category-grid";
import { WazeLiveMap } from "@/components/maps/waze-live-map";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

export default function HomePage() {
  const { lang } = useLang();
  const tr =
 t[lang].home;
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <>
      {/* Hero: 3D animated road signs marquee */}
      <RoadSigns3DHero />

      <CategoryGrid />

      {/* Daily stats */}
      <section className="grid-bg py-16 border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: "1,200+", label: tr.statStudents, color: "#eab308" },
              { value: "8",      label: tr.statAreas,    color: "#06b6d4" },
              { value: "500+",   label: tr.statQuestions, color: "#22c55e" },
              { value: "Real-time", label: tr.statLive,  color: "#ef4444" },
            ].map(({ value, label, color }) => (
              <div key={label}
                className="bg-white border-2 border-black rounded-none p-6 shadow-[4px_4px_0_#000] flex flex-col gap-1">
                <span className="text-3xl font-black" style={{ color }}>{value}</span>
                <span className="text-sm font-bold text-zinc-600" style={khFont}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-none mb-3" style={khFont}>
              {tr.howBadge}
            </div>
            <h2 className="text-4xl font-black" style={khFont}>{tr.howTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { step: "01", title: tr.step1Title, desc: tr.step1Desc, color: "#eab308" },
              { step: "02", title: tr.step2Title, desc: tr.step2Desc, color: "#22c55e" },
              { step: "03", title: tr.step3Title, desc: tr.step3Desc, color: "#06b6d4" },
            ].map(({ step, title, desc, color }) => (
              <div key={step}
                className="bg-white border-2 border-black rounded-none p-8 shadow-[4px_4px_0_#000] flex flex-col gap-4">
                <div className="w-14 h-14 border-2 border-black rounded-none flex items-center justify-center font-black text-xl shadow-[2px_2px_0_#000]"
                  style={{ backgroundColor: color }}>
                  {step}
                </div>
                <h3 className="text-xl font-black" style={khFont}>{title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed" style={khFont}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Live Traffic Map */}
          <div className="mt-16">
            <div className="mb-8 text-center">
              <div className="inline-block bg-red-500 text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-none mb-3">
                {kh ? "ផែនទីចរាចរណ៍ផ្ទាល់" : "Live Traffic"}
              </div>
              <h2 className="text-3xl font-black mb-2" style={khFont}>
                {kh ? "ស្ថានភាពចរាចរណ៍ពេលនេះ" : "Real-Time Road Safety"}
              </h2>
              <p className="text-sm text-zinc-600 max-w-2xl mx-auto" style={khFont}>
                {kh 
                  ? "មើលស្ថានភាពចរាចរណ៍ផ្ទាល់ គ្រោះថ្នាក់ និងការព្រមានផ្លូវ ដើម្បីធ្វើដំណើរប្រកបដោយសុវត្ថិភាព"
                  : "View live traffic conditions, accidents, and road alerts to travel safely"}
              </p>
            </div>
            <WazeLiveMap lat={13.41013} lon={103.94728} zoom={12} />
          </div>
        </div>
      </section>

      {/* Sponsors / Trust section */}
      <SponsorsMarquee />
    </>
  );
}
