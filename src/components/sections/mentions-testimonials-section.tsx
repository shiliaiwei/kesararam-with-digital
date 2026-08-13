"use client";

import { useState } from "react";
import { Quote, Star, Award, Building2, CheckCircle2, Sparkles, Heart, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CautionTape } from "@/components/brand/brand-kit";
import { Marquee } from "@/components/ui/marquee";
import Link from "next/link";

// ── Mentions / Partners Dataset ──
const MENTIONS_DATA = [
  {
    nameEn: "Technovation Girls Global",
    nameKh: "Technovation Girls ពិភពលោក",
    badgeEn: "National Champions 2026",
    badgeKh: "ជើងឯកថ្នាក់ជាតិ ២០២៦",
    color: "#eab308",
    logoSrc: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556277/logo-girls_o7e3tg.png",
  },
  {
    nameEn: "Ministry of Education, Youth & Sport",
    nameKh: "ក្រសួងអប់រំ យុវជន និងកីឡា",
    badgeEn: "Curriculum Aligned",
    badgeKh: "ស្របតាមកម្មវិធីសិក្សា",
    color: "#3b82f6",
    logoSrc: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/66aafc8e5a697_obtttu.png",
  },
  {
    nameEn: "Future Digital Talents Cambodia",
    nameKh: "Future Digital Talents កម្ពុជា",
    badgeEn: "Junior Division Winner",
    badgeKh: "ម្ចាស់ពាន Junior Division",
    color: "#22c55e",
    logoSrc: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/FDTboy_qofevj.png",
  },
  {
    nameEn: "Kesararam Primary School Siem Reap",
    nameKh: "សាលាបឋមសិក្សាកេសរារាម សៀមរាប",
    badgeEn: "Founding School & Lab",
    badgeKh: "សាលាស្ថាបនិក និងការអនុវត្ត",
    color: "#a855f7",
    logoSrc: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1782299398/kwdblacknobackground_tikazv.png",
  },
  {
    nameEn: "UN Sustainable Development Goals",
    nameKh: "គោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព UN",
    badgeEn: "SDG 4 & SDG 11 Aligned",
    badgeKh: "គោលដៅ SDG 4 និង SDG 11",
    color: "#06b6d4",
    logoSrc: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1782299393/KWDxTGC_d2m05u.png",
  },
];

// ── Testimonials Dataset ──
const TESTIMONIALS_DATA = [
  {
    nameEn: "Technovation Mentor",
    nameKh: "គ្រូណែនាំ Technovation",
    roleEn: "Technovation Girls Program",
    roleKh: "កម្មវិធី Technovation Girls",
    quoteEn:
      "These girls didn't just build an app — they built confidence. Watching them go from 'I don't know how' to 'I built this' is the most rewarding thing I've ever been part of.",
    quoteKh:
      "ពួកគេមិនបានបង្កើតតែ app ប៉ុណ្ណោះទេ — ពួកគេបានបង្កើតទំនុកចិត្ត។ ការមើលឃើញការផ្លាស់ប្ដូរពី «ខ្ញុំមិនដឹងទេ» ទៅ «ខ្ញុំបានធ្វើ» ជាបទពិសោធន៍ដ៏មានន័យ ហើយជាមោទនភាពដ៏ធំធេងបំផុត។",
    color: "#eab308",
    rating: 5,
  },
  {
    nameEn: "Primary School Teacher",
    nameKh: "លោកគ្រូ បឋមសិក្សា",
    roleEn: "Kesararam Primary School",
    roleKh: "សាលាបឋមសិក្សាកេសរារាម",
    quoteEn:
      "KWD proves that road safety education can be engaging, bilingual, and student-led. Our students are proud to see their school on a national stage.",
    quoteKh:
      "KWD បញ្ជាក់ថា ការអប់រំចរាចរអាចច្នៃប្រឌិត ២ ភាសា និងដឹកនាំដោយសិស្ស។ សិស្សរបស់យើងមោទនភាពដែលឈ្មោះសាលានៅលើឆាកជាតិ។",
    color: "#22c55e",
    rating: 5,
  },
  {
    nameEn: "Student Learner",
    nameKh: "សិស្សប្រើប្រាស់ KWD",
    roleEn: "KWD Active Student User",
    roleKh: "អ្នកប្រើប្រាស់ KWD",
    quoteEn:
      "I used to be confused by traffic signs. Now I practice every day on KWD and feel confident. The Khmer language support makes everything so clear!",
    quoteKh:
      "ពីការភ័យខ្លាច និងស្រពិចស្រពិលលើសញ្ញាចរាចរ ទៅជាការរៀនរៀងរាល់ថ្ងៃលើ KWD — ភាសាខ្មែរ ច្បាស់ ងាយ យល់ ១០០%។",
    color: "#3b82f6",
    rating: 5,
  },
  {
    nameEn: "Traffic Police Officer",
    nameKh: "មន្ត្រីចរាចរណ៍",
    roleEn: "Traffic Safety Department",
    roleKh: "នាយកដ្ឋានសុវត្ថិភាពចរាចរ",
    quoteEn:
      "We are impressed by this platform. It covers more than we expected from a student project. This kind of education can genuinely prevent road accidents.",
    quoteKh:
      "ប្រព័ន្ធសំណួរ និងប្រភេទវិញ្ញាសា មានស្តង់ដារខ្ពស់ ហួសពីការរំពឹងទុក។ ដំណោះស្រាយអប់រំដ៏ចំគោលដៅ ដែលនឹងកាត់បន្ថយគ្រោះថ្នាក់ចរាចរ។",
    color: "#ef4444",
    rating: 5,
  },
  {
    nameEn: "Parent of Student",
    nameKh: "ឪពុកម្ដាយរបស់សិស្ស",
    roleEn: "Siem Reap Community Parent",
    roleKh: "អាណាព្យាបាលសិស្ស",
    quoteEn:
      "I am so proud of this platform. My child uses it every day to study. The Khmer language makes it easy for our whole family to learn together.",
    quoteKh:
      "ខ្ញុំមោទនភាពពីកម្មវិធីនេះ។ កូនខ្ញុំប្រើរៀងរាល់ថ្ងៃ ហើយយល់ដឹងច្រើនជាមុន។ ភាសាខ្មែរ ជួយឱ្យក្រុមគ្រួសារទាំងមូលរៀនជាមួយគ្នា។",
    color: "#a855f7",
    rating: 5,
  },
];

export function MentionsTestimonialsSection() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  return (
    <section className="bg-white border-b-2 border-black py-14 md:py-20 relative overflow-hidden">
      
      {/* Top Caution Strip Accent */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <CautionTape variant="caution" height={12} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div
            className="inline-flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] mb-3"
            style={khFont}
          >
            <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: "5s" }} />
            <span>{kh ? "ការលើកឡើង និងការវាយតម្លៃ" : "AS MENTIONED IN & WHAT PEOPLE SAY"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black uppercase tracking-tight" style={khFont}>
            {kh ? (
              <>
                ត្រូវបានលើកឡើងក្នង <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">កម្មវិធីថ្នាក់ជាតិ</span> និងពិភពលោក
              </>
            ) : (
              <>
                WE HAVE BEEN <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">MENTIONED</span> EVERYWHERE
              </>
            )}
          </h2>

          <p className="mt-3 text-base sm:text-lg font-medium text-zinc-600" style={khFont}>
            {kh
              ? "ការទទួលស្គាល់ពីកម្មវិធី Technovation ក្រសួងអប់រំ គ្រូណែនាំ លោកគ្រូអ្នកគ្រូ មន្ត្រីចរាចរណ៍ និងអាណាព្យាបាលសិស្ស"
              : "Recognized by Technovation Girls Global, MoEYS, educational partners, police officers, teachers, and parents across Cambodia."}
          </p>
        </div>

        {/* ── PART 1: AS MENTIONED IN — INFINITE MARQUEE ── */}
        <div className="mb-14 bg-zinc-900 border-[3px] border-black shadow-[6px_6px_0_#000] p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-amber-400">
              <Building2 size={16} /> {kh ? "ដៃគូ និងការផ្សព្វផ្សាយ" : "PROJECT MENTIONS & ORGANIZATIONS"}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              {kh ? "រ៉ូតបង្ហាញដៃគូស្ថាប័ន" : "INFINITE MOTION MARQUEE"}
            </div>
          </div>

          <Marquee pauseOnHover repeat={4} className="[--duration:28s] [--gap:1.5rem]">
            {MENTIONS_DATA.map((item, idx) => (
              <div
                key={idx}
                className="bg-black border-2 border-zinc-700 hover:border-amber-400 p-4 shadow-[4px_4px_0_#000] flex items-center gap-4 transition-all hover:-translate-y-0.5 cursor-pointer min-w-[280px]"
              >
                <div
                  className="w-12 h-12 border-2 border-black flex items-center justify-center p-1.5 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <img src={item.logoSrc} alt={item.nameEn} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs font-black text-white line-clamp-1" style={khFont}>
                    {kh ? item.nameKh : item.nameEn}
                  </div>
                  <div
                    className="inline-block text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black mt-1"
                    style={{ backgroundColor: item.color, color: "#000" }}
                  >
                    {kh ? item.badgeKh : item.badgeEn}
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>

        {/* ── PART 2: WHAT PEOPLE SAY — TESTIMONIALS MARQUEE ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2 text-base font-black text-black uppercase" style={khFont}>
              <MessageSquare size={20} className="text-amber-500" />
              <span>{kh ? "មតិ និងការវាយតម្លៃពីអ្នកប្រើប្រាស់ (What People Say)" : "WHAT PEOPLE SAY ABOUT KWD"}</span>
            </div>
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase">
              ★ 5.0 RATING
            </div>
          </div>

          {/* Testimonial Cards Infinite Motion Marquee */}
          <Marquee pauseOnHover repeat={3} reverse className="[--duration:35s] [--gap:1.5rem]">
            {TESTIMONIALS_DATA.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border-[3px] border-black p-5 sm:p-6 shadow-[5px_5px_0_#000] flex flex-col justify-between min-w-[320px] max-w-[380px] hover:shadow-[7px_7px_0_#000] transition-all hover:-translate-y-1"
              >
                <div>
                  {/* Quote Icon & Rating Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-9 h-9 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                      style={{ backgroundColor: item.color }}
                    >
                      <Quote size={18} className="text-black" />
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  {/* Quote Text */}
                  <p className="text-xs sm:text-sm text-zinc-800 font-medium leading-relaxed italic mb-4" style={khFont}>
                    "{kh ? item.quoteKh : item.quoteEn}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-black uppercase" style={khFont}>
                      {kh ? item.nameKh : item.nameEn}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-500 font-bold" style={khFont}>
                      {kh ? item.roleKh : item.roleEn}
                    </p>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </Marquee>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 bg-amber-400 border-[3px] border-black p-6 sm:p-8 shadow-[6px_6px_0_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-black uppercase" style={khFont}>
              {kh ? "ចូលរួមរៀនជាមួយសិស្សកម្ពុជារាប់ពាន់នាក់!" : "Join 1,000+ Students Learning Road Safety!"}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-zinc-800" style={khFont}>
              {kh
                ? "រៀនសញ្ញាចរាចរណ៍ និងច្បាប់ផ្លូវវិថីដោយឥតគិតថ្លៃ ជាមួយ KWD"
                : "Master Cambodian traffic signs and driving theory for free on KWD."}
            </p>
          </div>

          <Link
            href="/learn"
            className="nb-btn bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 border-2 border-black shadow-[3px_3px_0_#000] inline-flex items-center gap-2 transition-all flex-shrink-0"
            style={khFont}
          >
            <span>{kh ? "ចាប់ផ្ដើមរៀនឥឡូវ" : "Start Learning Now"}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
