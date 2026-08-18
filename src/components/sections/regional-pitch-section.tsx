"use client";

import Link from "next/link";
import { Presentation, ShieldCheck, Lock, ArrowRight, Award, Video, FileText, CheckCircle2 } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CautionTape, SignShape } from "@/components/brand/brand-kit";

export function RegionalPitchSection() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  return (
    <section className="bg-white border-b-2 border-black py-14 md:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <div
            className="inline-flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] mb-3"
            style={khFont}
          >
            <Presentation size={14} className="text-amber-400" />
            <span>{kh ? "ព្រឹត្តិការណ៍ PITCH ថ្នាក់តំបន់" : "REGIONAL PITCH EVENT 2026"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black uppercase tracking-tight" style={khFont}>
            {kh ? (
              <>
                ការបង្ហាញ PITCH <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">ថ្នាក់តំបន់</span>
              </>
            ) : (
              <>
                TECHNOVATION <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">REGIONAL PITCH</span>
              </>
            )}
          </h2>

          <p className="mt-3 text-base sm:text-lg font-medium text-zinc-600 max-w-2xl" style={khFont}>
            {kh
              ? "ការបង្ហាញដំណោះស្រាយបច្ចេកវិទ្យាសុវត្ថិភាពចរាចរណ៍ Kesararam With Digital ជូនដល់គណៈកម្មការបច្ចេកវិទ្យា និងអប់រំថ្នាក់ជាតិ"
              : "Presenting Kesararam With Digital - Kesararam With Digital to national tech & education leaders at Technovation Cambodia."}
          </p>
        </div>

        {/* Main Regional Pitch Feature Card */}
        <div className="bg-zinc-900 border-[3px] border-black shadow-[8px_8px_0_#000] p-6 sm:p-8 md:p-10 text-white relative overflow-hidden">
          
          {/* Top Caution Strip */}
          <div className="absolute top-0 left-0 right-0">
            <CautionTape variant="dashed" height={10} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            
            {/* Left Image Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative bg-black p-2 border-2 border-amber-400 shadow-[6px_6px_0_#000]">
                <div className="relative aspect-[16/10] overflow-hidden border border-zinc-800 bg-zinc-950">
                  <img
                    src="https://res.cloudinary.com/dpgivqzrl/image/upload/v1783437729/DSC_1031_pxbzfi.jpg"
                    alt="Technovation Regional Pitch Day Presentation Team Kesararam With Digital"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Photo Tag */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-amber-400 text-black text-[10px] font-mono font-black uppercase px-2.5 py-1 border border-black shadow-[2px_2px_0_#000]">
                      LIVE PITCH DAY 2026
                    </span>
                    <span className="bg-black/80 text-amber-400 text-[10px] font-mono border border-amber-400/40 px-2 py-0.5">
                      TEAM #50777
                    </span>
                  </div>
                </div>

                {/* Floating SignShape Badge */}
                <div className="absolute -top-4 -left-4">
                  <SignShape shape="diamond" body="#eab308" size={54}>
                    <Presentation size={24} className="text-black" />
                  </SignShape>
                </div>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 bg-amber-400 text-black text-xs font-mono font-black uppercase px-3 py-1 border border-black shadow-[2px_2px_0_#000]">
                <Award size={14} /> {kh ? "ពានរង្វាន់ផ្នែក Junior Division" : "JUNIOR DIVISION FINALIST"}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-wide leading-tight" style={khFont}>
                {kh
                  ? "ការបង្ហាញដំណោះស្រាយអប់រំ និងស្គាល់សញ្ញាចរាចរណ៍"
                  : "Pitching Digital Road Safety Education to National Judges"}
              </h3>

              <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed" style={khFont}>
                {kh
                  ? "ក្នុងព្រឹត្តិការណ៍ Regional Pitch ក្រុមបានធ្វើបទបង្ហាញរយៈពេល ៤ នាទី និងឆ្លើយសំណួរជាមួយគណៈកម្មការជំនាញ លើការផ្លាស់ប្តូរការរៀនសញ្ញាចរាចរណ៍តាមបែបឌីជីថលសម្រាប់សិស្សកម្ពុជា។"
                  : "During the Regional Pitch Event, the team delivered a live 4-minute presentation and interactive demo, showcasing how Kesararam With Digital makes learning road signs engaging, bilingual, and accessible for youth."}
              </p>

              {/* Feature Highlights List */}
              <div className="space-y-2.5 pt-1">
                {[
                  {
                    en: "Live 4-Minute Presentation & App Demo before Tech Leaders",
                    kh: "ការធ្វើបទបង្ហាញផ្ទាល់ ៤ នាទី និង Demo កម្មវិធីជូនថ្នាក់ដឹកនាំបច្ចេកវិទ្យា",
                  },
                  {
                    en: "Protected Pitch Portal access with Code 50777",
                    kh: "ច្រកទ្វារចូលមើលឯកសារ Pitch ជាមួយលេខកូដសម្ងាត់ ៥០៧៧៧",
                  },
                  {
                    en: "Bilingual Curriculum & Suar AI assistant showcase",
                    kh: "ការបង្ហាញមេរៀនពីរភាសា និងប្រព័ន្ធ Suar AI",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-200 font-medium">
                    <CheckCircle2 size={16} className="text-amber-400 flex-shrink-0" />
                    <span style={khFont}>{kh ? item.kh : item.en}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/Regional-Pitch-Event"
                  className="nb-btn bg-amber-400 text-black hover:bg-amber-300 text-sm font-black uppercase tracking-wider px-5 py-3 border-2 border-black shadow-[4px_4px_0_#000] inline-flex items-center gap-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  style={khFont}
                >
                  <Lock size={16} className="text-black" />
                  <span>{kh ? "ចូលមើល PITCH PORTAL" : "Enter Regional Pitch Portal"}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
