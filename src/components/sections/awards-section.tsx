"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Award, Star, Sparkles, ArrowRight, ShieldCheck, MapPin, Users } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CautionTape } from "@/components/brand/brand-kit";

export function AwardsSection() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative bg-amber-500/10 border-b-2 border-black py-12 md:py-16 overflow-hidden">
      {/* Top Caution Tape Accent */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <CautionTape variant="caution" height={14} />
      </div>

      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header Badge */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black tracking-wider uppercase px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] mb-4">
            <Trophy size={16} className="text-amber-400 animate-bounce" />
            <span>{kh ? "សមិទ្ធផលក្រុម — CHAM AWARDS" : "TEAM ACHIEVEMENT — CHAM AWARDS"}</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-black text-balance"
            style={khFont}
          >
            {kh ? (
              <>
                ជើងឯកថ្នាក់ជាតិ <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_#000]">២០២៦</span>
              </>
            ) : (
              <>
                NATIONAL CHAMPIONS <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_#000]">2026</span>
              </>
            )}
          </h2>
          <p
            className="mt-3 text-base sm:text-lg font-bold text-zinc-800 max-w-2xl text-balance"
            style={khFont}
          >
            Technovation Girls Cambodia x Future Digital Talents 2026
          </p>
        </div>

        {/* Main Award Feature Banner Card */}
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_#000] p-6 sm:p-8 md:p-10 relative overflow-hidden">
          {/* Champion Corner Banner */}
          <div className="absolute -top-1 -right-1 z-20 overflow-hidden w-36 h-36 pointer-events-none">
            <div className="bg-amber-400 border-2 border-black text-black font-black text-[11px] uppercase tracking-wider py-1 text-center shadow-[2px_2px_0_#000] transform rotate-45 translate-x-8 translate-y-6 w-48">
              ★ #1 CHAMPION ★
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Image Showcase with Brutalist Frame */}
            <div className="lg:col-span-6 relative">
              <div
                className="relative bg-black p-2 border-2 border-black shadow-[6px_6px_0_#000] transition-transform duration-300 hover:-translate-y-1"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative aspect-[4/3] overflow-hidden border border-black bg-zinc-900">
                  <img
                    src="https://res.cloudinary.com/dpgivqzrl/image/upload/v1783435140/OURTEAMFOUNDER_wcg9ao.webp"
                    alt="Cham Awards National Champion Technovation Girls 2026 Team"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  
                  {/* Photo Caption Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="inline-flex items-center gap-1.5 bg-amber-400 text-black text-[10px] font-mono font-black uppercase px-2.5 py-1 border border-black shadow-[2px_2px_0_#000] mb-1">
                      <Award size={12} /> Technovation Girls Cambodia
                    </div>
                    <p className="text-xs font-bold leading-snug line-clamp-2" style={khFont}>
                      {kh
                        ? "ក្រុមសិស្សនារីកម្ពុជាឈ្នះជើងឯកថ្នាក់ជាតិ ផ្នែក Junior Division"
                        : "Cambodian young women team winning Junior Division National Championship"}
                    </p>
                  </div>
                </div>

                {/* Interactive Trophy Badge Float */}
                <div className="absolute -bottom-4 -right-4 bg-amber-400 border-2 border-black p-3 shadow-[4px_4px_0_#000] flex items-center gap-2.5 animate-pulse">
                  <div className="w-10 h-10 bg-black text-amber-400 flex items-center justify-center border border-black">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-black uppercase tracking-wider text-black">AWARD</div>
                    <div className="text-xs font-black uppercase text-black">JUNIOR DIVISION</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Story & Details */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <div className="inline-flex items-center gap-2 bg-zinc-100 border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wider w-fit" style={khFont}>
                <Sparkles size={14} className="text-amber-500" />
                <span>{kh ? "ពានរង្វាន់កិត្តិយសថ្នាក់ជាតិ" : "National Honor Award"}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-black leading-tight" style={khFont}>
                {kh ? (
                  "ក្រុមបានឈ្នះជើងឯកថ្នាក់ជាតិ Junior Division នៅ Technovation Girls Cambodia 2026"
                ) : (
                  "National Champion, Junior Division — Technovation Girls Cambodia 2026"
                )}
              </h3>

              <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-medium" style={khFont}>
                {kh
                  ? "ក្រុមយើងបានឈ្នះពានរង្វាន់ជើងឯកថ្នាក់ជាតិ (National Champion, Junior Division) ក្នុងកម្មវិធីប្រកួត Technovation Girls Cambodia x Future Digital Talents 2026 ដោយប្រកួតប្រជែងជាមួយក្រុមបច្ចេកវិទ្យាមកពីទូទាំងប្រទេសកម្ពុជា ដើម្បីដោះស្រាយបញ្ហាសុវត្ថិភាពចរាចរណ៍សម្រាប់យុវជន។"
                  : "The team won National Champion, Junior Division at Technovation Girls Cambodia x Future Digital Talents 2026, competing against teams nationwide to build digital road-safety education for young Cambodians."}
              </p>

              {/* Key Achievements Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-amber-100/80 border-2 border-black p-3 shadow-[3px_3px_0_#000]">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black mb-1">
                    <Trophy size={14} className="text-amber-600" /> #1 CHAMPION
                  </div>
                  <div className="text-xs font-bold text-zinc-800" style={khFont}>
                    {kh ? "ជើងឯកថ្នាក់ជាតិ" : "National Winner"}
                  </div>
                </div>

                <div className="bg-blue-100/80 border-2 border-black p-3 shadow-[3px_3px_0_#000]">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black mb-1">
                    <Users size={14} className="text-blue-600" /> TEAM #50777
                  </div>
                  <div className="text-xs font-bold text-zinc-800" style={khFont}>
                    {kh ? "ក្រុម ៥០៧៧៧" : "Junior Division"}
                  </div>
                </div>

                <div className="bg-emerald-100/80 border-2 border-black p-3 shadow-[3px_3px_0_#000]">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black mb-1">
                    <ShieldCheck size={14} className="text-emerald-600" /> ROAD SAFETY
                  </div>
                  <div className="text-xs font-bold text-zinc-800" style={khFont}>
                    {kh ? "សុវត្ថិភាពចរាចរណ៍" : "Digital Solution"}
                  </div>
                </div>

                <div className="bg-purple-100/80 border-2 border-black p-3 shadow-[3px_3px_0_#000]">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black mb-1">
                    <MapPin size={14} className="text-purple-600" /> SIEM REAP
                  </div>
                  <div className="text-xs font-bold text-zinc-800" style={khFont}>
                    {kh ? "សាលាកេសារារាម" : "Kesararam School"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/about"
                  className="nb-btn bg-amber-400 text-black hover:bg-amber-300 text-sm font-black uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[4px_4px_0_#000] inline-flex items-center gap-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  style={khFont}
                >
                  <span>{kh ? "អានអំពីក្រុមយើង" : "Learn Team Story"}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/Regional-Pitch-Event"
                  className="bg-white text-black hover:bg-zinc-100 text-sm font-black uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[4px_4px_0_#000] inline-flex items-center gap-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  style={khFont}
                >
                  <Award size={16} />
                  <span>{kh ? "ទស្សនា PITCH EVENT" : "View Regional Pitch"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
