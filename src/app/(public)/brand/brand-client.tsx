"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";

const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

// ─── Color palette ──────────────────────────────────────────────────────────
const COLORS: { name: string; hex: string; role: { en: string; kh: string } }[] = [
  { name: "Yellow", hex: "#eab308", role: { en: "CTA button · warning signs · brand accent", kh: "ប៊ូតុង CTA សញ្ញាព្រមាន និងពណ៌លេចធ្លោរបស់ម៉ាក (brand accent)" } },
  { name: "Black",  hex: "#000000", role: { en: "Text · borders · structure",               kh: "អក្សរ គែម (borders) និងរចនាសម្ព័ន្ធ" } },
  { name: "White",  hex: "#ffffff", role: { en: "Background · negative space",               kh: "ផ្ទៃខាងក្រោយ និងចន្លោះទំនេរ (negative space)" } },
  { name: "Blue",   hex: "#3b82f6", role: { en: "Info signs · links · signals",              kh: "សញ្ញាព័ត៌មាន តំណភ្ជាប់ និងសញ្ញាវិជ្ជមាន" } },
  { name: "Red",    hex: "#ef4444", role: { en: "Prohibitory signs · danger · stop",         kh: "សញ្ញាហាមឃាត់ សញ្ញាឈប់ និងសញ្ញាគ្រោះថ្នាក់" } },
  { name: "Green",  hex: "#22c55e", role: { en: "Success · active states · go",              kh: "សញ្ញាអនុញ្ញាត ស្ថានភាពជោគជ័យ និងសញ្ញាទៅមុខ" } },
  { name: "Orange", hex: "#f97316", role: { en: "Caution · attention · warning",             kh: "ការប្រុងប្រយ័ត្ន និងការផ្ដោតអារម្មណ៍" } },
  { name: "Purple", hex: "#a855f7", role: { en: "Premium features · game modes",             kh: "មុខងារពិសេស (Premium) និងរបៀបលេងហ្គេមផ្សេងៗ" } },
];

// ─── Logo usage rules ────────────────────────────────────────────────────────
const RULES: { en: string; kh: string }[] = [
  { en: "Do not stretch, rotate, or distort the logo.",            kh: "កុំទាញ បង្វិល ឬធ្វើឱ្យ logo ខូចទ្រង់ទ្រាយ។" },
  { en: "Do not apply drop shadows, gradients, or filters.",       kh: "កុំដាក់ស្រមោល (shadow) gradient ឬ filter លើ logo។" },
  { en: "Do not place the logo on low-contrast backgrounds.",      kh: "កុំដាក់ logo លើ background ដែលមាន contrast ទាប។" },
  { en: "Maintain clear space equal to the height of the K.",      kh: "រក្សាចន្លោះទំនេរជុំវិញ logo ស្មើកម្ពស់អក្សរ K។" },
  { en: "Use kwd-black_nobackground on light backgrounds only.",   kh: "ប្រើ kwd-black_nobackground លើ background ភ្លឺ; ប្រើឡូហ្គោពណ៌ស (Inverted) លើ background ងងឹត។" },
  { en: "Minimum logo height is 24 px in any digital context.",    kh: "ឡូហ្គោត្រូវមានកម្ពស់យ៉ាងតិច ២៤ ភីកសែលក្នុងកម្មវិធីឌីជីថល។" },
  { en: "Do not recolor, outline, or alter the logo in any way.",  kh: "កុំផ្លាស់ប្ដូរពណ៌ ឬបន្ថែម outline លើឡូហ្គោតាមចិត្ត។" },
];

// ─── Product mockups ─────────────────────────────────────────────────────────
const MOCKUP_ASSETS: { src: string; title: { en: string; kh: string } }[] = [
  { src: "/brand/tote_stationery_mockup.png",    title: { en: "Tote & Stationery Set",      kh: "កាបូប & Stationery Set" } },
  { src: "/brand/educational_blocks_mockup.png", title: { en: "Educational Toys & Cards",   kh: "ដុំឈើ & Learning Cards" } },
  { src: "/brand/mug_bottle_mockup.png",         title: { en: "Ceramic Mug & Metal Bottle", kh: "Ceramic Mug & Metal Bottle" } },
  { src: "/brand/apparel_brand_mockup.png",      title: { en: "Premium Brand Apparel",      kh: "Brand Apparel" } },
  { src: "/brand/kwd-mockup-phone.png",          title: { en: "Mobile App Interface",       kh: "គំរូកម្មវិធីទូរស័ព្ទដៃ" } },
  { src: "/brand/kwd-mockup-stationery.png",     title: { en: "Corporate Stationery set",   kh: "គំរូឧបករណ៍ការិយាល័យ" } },
];

// ─── Section index ──────────────────────────────────────────────────────────
const SECTIONS: { id: string; num: string; title: { en: string; kh: string } }[] = [
  { id: "summary", num: "01", title: { en: "Summary",                 kh: "សេចក្ដីសង្ខេប (Summary)" } },
  { id: "name",    num: "02", title: { en: "Brand Name & Meaning",    kh: "១. ឈ្មោះ Brand និងអត្ថន័យ (Brand Name & Meaning)" } },
  { id: "logo",    num: "03", title: { en: "Logo & Meaning",          kh: "២. និមិត្តសញ្ញា (Logo) និងអត្ថន័យ (Logo & Meaning)" } },
  { id: "color",   num: "04", title: { en: "Color Palette",           kh: "៣. ពណ៌ (Color Palette)" } },
  { id: "type",    num: "05", title: { en: "Typography",              kh: "៤. អក្សរ (Typography)" } },
  { id: "dna",     num: "06", title: { en: "Design DNA (Brutalist)",  kh: "៥. ប្រព័ន្ធរចនា DNA (Design DNA — Brutalist)" } },
  { id: "apply",   num: "07", title: { en: "Applications",            kh: "ការប្រើប្រាស់ & Mockups" } },
];

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFontFamily = '"GoogleSans", "Google Sans Khmer", "Google Sans", sans-serif';
  const kf = kh ? { fontFamily: khFontFamily } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  const [active, setActive] = useState<string>(SECTIONS[0].id);

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      {/* Decorative Glowing Orbs behind layout (WOW Aesthetics) */}
      <div className="absolute top-[20%] left-[-10%] w-[40rem] h-[40rem] bg-yellow-300/10 dark:bg-yellow-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] right-[-10%] w-[35rem] h-[35rem] bg-blue-300/10 dark:bg-blue-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Floating Sticky Circular Logo wrapper (Focal Point entry) */}
      <div className="max-w-6xl mx-auto px-6 relative h-0 pointer-events-none">
        <div className="sticky top-6 z-50 w-20 h-20 flex items-center justify-center rounded-[24px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md hover:scale-105 transition-all duration-200 group mt-20 pointer-events-auto">
          {/* Inner static border */}
          <div className="absolute inset-1 rounded-[20px] border border-zinc-100 dark:border-zinc-800/40 pointer-events-none" />
          
          <Image
            src={LOGO_PRIMARY}
            alt="KWD Logo"
            width={52}
            height={52}
            className="object-contain relative z-10 transition-transform duration-200 group-hover:scale-110 dark:invert"
            priority
          />
        </div>
      </div>

      {/* ════ HERO HEADER (Primary Focal Point) ════════════════════════════════════ */}
      <header className="max-w-6xl mx-auto px-6 pt-28 pb-14">
        <div className="w-full bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-transparent dark:from-amber-500/5 dark:via-yellow-400/0 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[28px] p-8 md:p-12 relative overflow-hidden backdrop-blur-sm shadow-sm flex flex-col items-start gap-6">
          <div className="h-20 w-20 shrink-0" /> {/* Spacing helper */}
          
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white" style={kf}>
              {t("KWD Brand Guidelines", "គោលការណ៍ណែនាំម៉ាកយីហោ KWD")}
            </h1>
            <span className="px-3 py-1 bg-yellow-400 text-black border border-black/10 text-[10px] rounded-full font-mono uppercase font-black">v1.0</span>
          </div>

          <p className="max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed" style={kf}>
            {t(
              "Visual identity, design standards, and usage rules that define KWD — Kesararam With Digital across every surface.",
              "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ KWD — Kesararam With Digital"
            )}
          </p>

          <p className="text-xs text-zinc-400 font-bold" style={kf}>
            {t(
              "Last updated: June 2026 — Technovation Girls 2026 · Team #50777 · Siem Reap, Cambodia",
              "ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: មិថុនា ២០២៦ — Technovation Girls 2026 · ក្រុម #50777 · សៀមរាប, កម្ពុជា"
            )}
          </p>
        </div>
      </header>

      {/* ════ MAIN CONTAINER ═══════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] items-start">
          
          {/* Sidebar Nav */}
          <aside className="hidden lg:block sticky top-24 space-y-1.5 p-1 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-[20px]">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block px-4 py-3 text-xs font-bold rounded-[14px] transition-all duration-200 ${
                    on
                      ? "bg-white text-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:bg-zinc-800 dark:text-white border-l-4 border-yellow-500"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50"
                  }`}
                  style={kf}
                >
                  <span className="mr-2 font-mono opacity-50">{s.num}</span>
                  {t(s.title.en, s.title.kh)}
                </a>
              );
            })}
          </aside>

          {/* Sections Stack */}
          <div className="space-y-16">

            {/* 01 — SUMMARY */}
            <section id={SECTIONS[0].id} className="scroll-mt-24">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3" style={kf}>
                  <span className="font-mono text-sm px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">{SECTIONS[0].num}</span>
                  {t(SECTIONS[0].title.en, SECTIONS[0].title.kh)}
                </h2>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed" style={kf}>
                {kh ? (
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>ឈ្មោះពេញ៖ Kesararam With Digital · ពាក្យកាត់៖ KWD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>ឡូហ្គោផ្លូវការ៖ kwd-black_nobackground.png (ខ្មៅលើផ្ទៃថ្លា)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>ពណ៌ស្នូល៖ លឿង #eab308 · ខ្មៅ #000000 · ស #ffffff</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>រចនា DNA៖ គែមខ្មៅ មុំស្រួច ស្រមោលរឹង (Brutalist)</span>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>Full Name: Kesararam With Digital · Abbreviation: KWD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>Official Logo: kwd-black_nobackground.png (black on transparent background)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>Core Colors: Yellow #eab308 · Black #000000 · White #ffffff</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 shrink-0">•</span>
                      <span>Design DNA: Black borders, sharp angles, hard shadow (Brutalist)</span>
                    </li>
                  </ul>
                )}
              </div>
            </section>

            {/* 02 — BRAND NAME & MEANING */}
            <section id={SECTIONS[1].id} className="scroll-mt-24">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3" style={kf}>
                  <span className="font-mono text-sm px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">{SECTIONS[1].num}</span>
                  {t("Brand Name & Meaning", "១. ឈ្មោះ Brand និងអត្ថន័យ (Brand Name & Meaning)")}
                </h2>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed" style={kf}>
                {kh ? (
                  <>
                    <p>
                      KWD មានន័យថា Kesararam With Digital — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍របស់យើង។
                    </p>
                    <p>
                      ពាក្យ With ប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និងបច្ចេកវិទ្យា។ ឌីជីថល (Digital) ជាការប្ដេជ្ញាផ្ដល់នូវឱកាសចូលរៀន (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។
                    </p>
                    <p>
                      KWD ត្រូវបានបង្កើតឡើងដោយយុវនារីខ្មែរនៃសាលាបឋមសិក្សាកេសរារាម ក្រោមទស្សនវិស័យថា៖ ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍គួរតែផ្ដល់ជូនដោយឥតគិតថ្លៃ មានអន្តរកម្ម និងងាយស្រួលចូលប្រើជាភាសាកំណើតរបស់សិស្ស។ ឈ្មោះនេះបញ្ជាក់ថា ការអប់រំមិនបោះបង់ឫសគល់វប្បធម៌ក្នុងយុគឌីជីថលនោះទេ ប៉ុន្តែជំរុញឱ្យឫសគល់នោះរីកចម្រើនទៅមុខតាមបច្ចេកវិទ្យា។
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      KWD stands for Kesararam With Digital — a name that carries the weight of place, purpose, and transformation. Kesararam is the name of the monastery (wat) and the primary school — the oldest seat of learning in our community.
                    </p>
                    <p>
                      The word 'With' declares a partnership between tradition and technology. 'Digital' is a commitment to access, reach, and permanence.
                    </p>
                    <p>
                      KWD was created by young Cambodian women from Kesararam Primary School under the vision that: life-saving road safety education should be free, interactive, and easily accessible in the students' native language. The name asserts that education does not abandon its cultural roots in the digital age, but rather drives those roots forward with technology.
                    </p>
                  </>
                )}

                <div className="p-5 rounded-[18px] bg-amber-50 dark:bg-zinc-950 border border-amber-200/50 dark:border-zinc-800">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1.5">{t("Recommended Usage", "ការណែនាំ")}</p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed">
                    {kh ? (
                      <>ការណែនាំ៖ ប្រើឈ្មោះពេញ «Kesararam With Digital» សម្រាប់ការណែនាំលើកដំបូងក្នុងសារព័ត៌មាន បទបង្ហាញ ឯកសារផ្លូវការ និងដៃគូសហការ។ បន្ទាប់មកអាចប្រើពាក្យកាត់ «KWD» បាន។</>
                    ) : (
                      <>Recommendation: Use the full name "Kesararam With Digital" when introducing the brand for the first time in press, presentations, official documents, and partnerships. Afterwards, the abbreviation "KWD" may be used.</>
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* 03 — LOGO & MEANING */}
            <section id={SECTIONS[2].id} className="scroll-mt-24">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3" style={kf}>
                  <span className="font-mono text-sm px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">{SECTIONS[2].num}</span>
                  {t("Logo & Meaning", "២. និមិត្តសញ្ញា (Logo) និងអត្ថន័យ (Logo & Meaning)")}
                </h2>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6" style={kf}>
                <div className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                  {kh ? (
                    <p>
                      និមិត្តសញ្ញាផ្លេកបន្ទោរលើឡូហ្គោ KWD មិនមែនជាការតុបតែងលម្អឡើយ តែជាទស្សនវិជ្ជាស្នូលរបស់ម៉ាក។ វាផ្ដល់អត្ថន័យដល់ Flash Learning ដោយឈរលើជំនឿថា ក្នុងយុគ AI ចំណេះដឹងត្រូវដើរក្នុងល្បឿននៃពន្លឺ។ វាជាការប្ដេជ្ញារបស់ KWD ក្នុងការផ្ដល់ល្បឿន ឧបករណ៍ និងទំនុកចិត្ត ដើម្បីសិក្សារួមជាមួយ AI និងដឹកនាំការផ្លាស់ប្ដូរនាពេលអនាគត។
                    </p>
                  ) : (
                    <p>
                      The lightning bolt on the KWD logo is not ornamental; it is the core philosophy of the brand. It gives meaning to Flash Learning, based on the belief that in the age of AI, knowledge must move at the speed of light. It represents KWD's commitment to providing the speed, tools, and confidence to learn alongside AI and lead future changes.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  {/* Light background logo preview */}
                  <div className="p-6 border border-zinc-200/80 dark:border-zinc-800 rounded-[20px] bg-white flex flex-col items-center justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group">
                    <div className="h-32 flex items-center justify-center p-4">
                      <Image src={LOGO_PRIMARY} alt="KWD Logo" width={84} height={84} className="object-contain transition-transform duration-200 group-hover:scale-105" />
                    </div>
                    <div className="text-center mt-3">
                      <span className="text-[10px] font-mono text-zinc-400 block">kwd-black_nobackground.png</span>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-1 block">{t("Light Background", "លើ background ភ្លឺ")}</span>
                    </div>
                  </div>
                  
                  {/* Dark background logo preview */}
                  <div className="p-6 border border-zinc-800 rounded-[20px] bg-zinc-950 flex flex-col items-center justify-between hover:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-all duration-300 group">
                    <div className="h-32 flex items-center justify-center p-4">
                      <Image src={LOGO_PRIMARY} alt="KWD Logo" width={84} height={84} className="object-contain invert transition-transform duration-200 group-hover:scale-105" />
                    </div>
                    <div className="text-center mt-3">
                      <span className="text-[10px] font-mono text-zinc-500 block">kwd-black_nobackground.png (Inverted)</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1 block">{t("Dark Background", "លើ background ងងឹត")}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-[18px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">{t("Logo Format & Recognition Principles", "គោលការណ៍សម្គាល់ និងទម្រង់ឡូហ្គោ")}</p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed">
                    {kh ? (
                      <>ទម្រង់ឡូហ្គោដំណើរការទៅតាមគោលការណ៍សម្គាល់ម៉ាកយីហោ និងកំណត់ពីរបៀបដែលវាត្រូវបានយកទៅប្រើប្រាស់។ ម៉ាកយីហោធម្មតាៗតែងតែពឹងផ្អែកលើអក្សរម៉ាក (wordmark)។ ការប្រើប្រាស់ដដែលៗជួយកសាងអត្ថន័យ រហូតដល់និមិត្តសញ្ញានោះអាចឈរដោយខ្លួនឯងបាន។ ប្រព័ន្ធដែលមានភាពចាស់ទុំប្រើប្រាស់ទម្រង់វ៉ារ្យ៉ង់ច្រើនយ៉ាង អាស្រ័យលើបរិបទ និងករណីប្រើប្រាស់។ នៅពេលដែលការសម្គាល់ម៉ាកយីហោលូតលាស់ឡើង វានឹងកំណត់ថាធាតុណាមួយដែលត្រូវដើរតួឈានមុខគេ។</>
                    ) : (
                      <>A logo format follows brand recognition principles and defines how it is applied. Simple brands often rely on a wordmark. Repetition builds meaning until the symbol can stand alone. Mature systems use multiple variants depending on context and use cases. As recognition grows, it determines which element takes the lead.</>
                    )}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">{t("Official Logo Rules", "ច្បាប់នៃការប្រើប្រាស់ឡូហ្គោ៖")}</h3>
                  <ul className="space-y-3">
                    {RULES.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-semibold">
                        <span className="text-[10px] font-mono font-bold text-yellow-500 bg-yellow-400/10 px-1.5 py-0.5 rounded shrink-0">{(i + 1).toString().padStart(2, "0")}</span>
                        <span className="pt-0.5">{t(r.en, r.kh)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 04 — COLOR PALETTE */}
            <section id={SECTIONS[3].id} className="scroll-mt-24">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3" style={kf}>
                  <span className="font-mono text-sm px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">{SECTIONS[3].num}</span>
                  {t("Color Palette", "៣. ពណ៌ (Color Palette)")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" style={kf}>
                {COLORS.map(({ name, hex, role }) => (
                  <div key={hex} className="rounded-[20px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between">
                    <div className="h-20 w-full relative" style={{ background: hex }}>
                      <span className="absolute bottom-2 right-2 text-[9px] font-mono font-black px-1.5 py-0.5 bg-white/80 dark:bg-black/50 text-zinc-900 dark:text-zinc-100 rounded">{hex}</span>
                    </div>
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-850 grow flex flex-col justify-between">
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 block mb-1">{name}</span>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold leading-normal">{t(role.en, role.kh)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 05 — TYPOGRAPHY */}
            <section id={SECTIONS[4].id} className="scroll-mt-24">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3" style={kf}>
                  <span className="font-mono text-sm px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">{SECTIONS[4].num}</span>
                  {t("Typography", "៤. អក្សរ (Typography)")}
                </h2>
              </div>

              <div className="space-y-6" style={kf}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Google Sans Font Showcase */}
                  <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-[24px] bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-850 pb-1.5 mb-3">Khmer — Google Sans</span>
                      <p className="text-5xl font-black text-zinc-900 dark:text-white mb-2" style={{ fontFamily: khFontFamily }}>ក ខ គ</p>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal font-semibold mt-3">
                      {t("• ហ្វុនត៍ភាសាខ្មែរ៖ ប្រើ Siemreap, Google Sans, Inter, Stack Sans Notch ឬ Battambang សម្រាប់អក្សរខ្មែរទាំងអស់ ដើម្បីធានាការអានងាយស្រួល សោភ័ណភាព និងភាពច្បាស់លាស់ខ្ពស់។", "• Khmer Font: Use Siemreap, Google Sans, Inter, Stack Sans Notch, or Battambang for all Khmer text to ensure easy reading, aesthetics, and high clarity.")}
                    </p>
                  </div>
                  
                  {/* English Inter Font Showcase */}
                  <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-[24px] bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-850 pb-1.5 mb-3">English — Inter / Latin</span>
                      <p className="text-5xl font-black text-zinc-900 dark:text-white mb-2">Aa Bb Cc</p>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal font-semibold mt-3">
                      {t("• ហ្វុនត៍ភាសាអង់គ្លេស៖ ប្រើ Inter សម្រាប់អក្សរឡាតាំងទាំងអស់ ស្លាក UI headings និង body copy។", "• English Font: Use Inter for all Latin text, UI labels, headings, and body copy.")}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] overflow-hidden p-4 shadow-sm">
                  <div className="text-xs font-black text-zinc-400 uppercase tracking-wider pb-2 mb-3 border-b border-zinc-100 dark:border-zinc-850 px-2">{t("Typography scale guidelines", "ច្បាប់ស្លាកសញ្ញានិងទម្រង់អក្សរ")}</div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-[14px] border border-zinc-200/50 dark:border-zinc-850 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-semibold mb-4 leading-relaxed">
                    {t("• ស្លាក (Labels)៖ ប្រើអក្សរធំ (UPPERCASE) ជាមួយ letter-spacing និងទម្ងន់ដិត (Bold/Black) សម្រាប់ headings និងប៊ូតុង។", "• Labels: Use UPPERCASE with letter-spacing and bold/black weight for headings and buttons.")}
                  </div>
                  
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[
                      { label: "Display", size: "36px", sample: "KWD Display Scale", weight: "font-black text-2xl sm:text-3xl" },
                      { label: "Heading", size: "24px", sample: "Heading Typography Scale", weight: "font-bold text-xl sm:text-2xl" },
                      { label: "Subheading", size: "18px", sample: "Subheading Scale Medium", weight: "font-bold text-base sm:text-lg" },
                      { label: "Body", size: "14px", sample: "Body text size for reading paragraphs.", weight: "font-medium text-xs sm:text-sm" },
                      { label: "Label", size: "11px", sample: "LABEL / BUTTON TEXT UPPERCASE", weight: "font-black text-[10px] tracking-wider uppercase" }
                    ].map((spec) => (
                      <div key={spec.label} className="py-4 px-2 flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-zinc-400 uppercase w-20 shrink-0">{spec.label}</span>
                        <p className={`${spec.weight} text-zinc-800 dark:text-zinc-200 grow`} style={{ fontFamily: kh ? khFontFamily : undefined }}>{spec.sample}</p>
                        <span className="text-[9px] font-mono text-zinc-400">{spec.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 06 — DESIGN DNA (BRUTALIST VS SOFTENED) */}
            <section id={SECTIONS[5].id} className="scroll-mt-24">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3" style={kf}>
                  <span className="font-mono text-sm px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">{SECTIONS[5].num}</span>
                  {t("Design DNA", "៥. ប្រព័ន្ធរចនា DNA (Design DNA — Brutalist)")}
                </h2>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6" style={kf}>
                <div className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                  {kh ? (
                    <p>KWD ប្រើប្រព័ន្ធរចនា Brutalist ដែលបង្ហាញពីភាពរឹងមាំ ច្បាស់លាស់ និងត្រឹមត្រូវ៖</p>
                  ) : (
                    <p>KWD uses a Brutalist design system, showcasing strength, clarity, and precision:</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-[14px] bg-zinc-50 dark:bg-zinc-950">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider block mb-2">{t("Core DNA Rules", "លក្ខណៈស្នូលរបស់ Brutalist")}</span>
                    <ul className="space-y-2 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                      {kh ? (
                        <>
                          <li>• គ្មាន border-radius — មុំទាំងអស់ស្រួច (90°)។</li>
                          <li>• គែម (border) 2–3px ពណ៌ខ្មៅ #000 លើ cards ប៊ូតុង និង inputs។</li>
                          <li>• ស្រមោលរឹង (box-shadow) 3px ឬ 4px 0 #000 (offset solid shadow)។</li>
                          <li>• ខ្សែបន្ទាត់ព្រមាន (caution stripe) លឿង/ខ្មៅ ជា accent។</li>
                          <li>• ស្ថានភាព Active៖ ផ្ទៃលឿង #eab308 + អក្សរខ្មៅ។</li>
                          <li>• ចន្លោះ (spacing)៖ 4 · 8 · 12 · 16 · 20 · 24 px</li>
                        </>
                      ) : (
                        <>
                          <li>• No border-radius — all angles are sharp (90°).</li>
                          <li>• Black border (#000) of 2–3px on cards, buttons, and inputs.</li>
                          <li>• Hard shadow (box-shadow) of 3px or 4px offset solid shadow (#000).</li>
                          <li>• Caution stripe (yellow/black) as an accent.</li>
                          <li>• Active State: Yellow background (#eab308) + black text.</li>
                          <li>• Spacing: 4 · 8 · 12 · 16 · 20 · 24 px.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-[20px] bg-amber-500/5 dark:bg-yellow-400/5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 dark:bg-yellow-400/5 rounded-full filter blur-xl" />
                    <div>
                      <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-wider block mb-2">{t("Softened Layout DNA System", "ប្រព័ន្ធរចនា DNA បែបសម្រាល (Softened UI)")}</span>
                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                        {kh ? (
                          <>កាំជ្រុង (Border radius) ប្រហែល ១០-១៤% ជួយសម្រាលភាពរឹងនៃ interface ខណៈពេលដែលនៅតែរក្សាទម្រង់រចនាសម្ព័ន្ធ។ ចំណុចផ្ដោតសំខាន់ចម្បងត្រូវបានបង្កើតឡើងតាមរយៈទំហំ ឬកម្រិតពន្លឺខុសគ្នា (contrast) ដោយតម្រង់ការយកចិត្តទុកដាក់របស់អ្នកប្រើប្រាស់ និងបង្កើតជាចំណុចចាប់ផ្ដើមដ៏ច្បាស់លាស់។ តម្រឹមតម្រង់ (Alignment) រៀបចំ្លង់ប្លង់ជុំវិញចំណុចផ្ដោតសំខាន់នេះ ដើម្បីធានាបាននូវភាពស៊ីសង្វាក់គ្នានៃការមើលឃើញ និងធ្វើឱ្យប្រសើរឡើងនូវលទ្ធភាពអាន និងលំហូរទូទៅ។ នេះក៏ជាប្រព័ន្ធម៉ាកយីហោ DNA ផងដែរ។</>
                        ) : (
                          <>A border radius of around 10–14% helps soften the interface while maintaining structure. A primary focal point is created through size or contrast, guiding the user’s attention and forming a clear entry point. Alignment organizes the layout around this focal point, ensuring visual consistency and improving overall readability and flow. DNA brand system too.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Example of design rules side-by-side */}
                <div className="mt-4 border border-zinc-200 dark:border-zinc-800 rounded-[24px] overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
                    {/* Brutalist Button example */}
                    <div className="p-6 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-4">
                      <span className="text-[9px] font-black text-zinc-400 block">{t("Example 1: Brutalist Box (Sharp, Hard Shadow)", "គំរូទី១៖ ប្រអប់ Brutalist (មុំស្រួច ស្រមោលរឹង)")}</span>
                      <button className="px-6 py-3 bg-yellow-400 border-[3px] border-black text-black font-black uppercase text-sm shadow-[4px_4px_0_#000] cursor-default">
                        BRUTALIST ACTION
                      </button>
                    </div>

                    {/* Softened Button example (10-14% border radius) */}
                    <div className="p-6 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-4">
                      <span className="text-[9px] font-black text-zinc-400 block">{t("Example 2: Softened Box (12% Border Radius, Soft Shadow)", "គំរូទី២៖ ប្រអប់សម្រាល (កាំជ្រុង ១២% ស្រមោលស្រាល)")}</span>
                      <button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 border border-black/10 text-black font-black uppercase text-sm rounded-[24px] shadow-[0_8px_20px_rgba(234,179,8,0.15)] transition-all cursor-default">
                        SOFTENED ACTION
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 07 — APPLICATIONS (MOCKUPS) */}
            <section id={SECTIONS[6].id} className="scroll-mt-24">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3" style={kf}>
                  <span className="font-mono text-sm px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400">{SECTIONS[6].num}</span>
                  {t(SECTIONS[6].title.en, SECTIONS[6].title.kh)}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {MOCKUP_ASSETS.map((m, i) => (
                  <div key={i} className="border border-zinc-200/80 dark:border-zinc-800/85 rounded-[24px] bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                    <div className="aspect-square relative bg-slate-100 dark:bg-zinc-950 overflow-hidden">
                      <Image
                        src={m.src}
                        alt={m.title.en}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-850">
                      <p className="text-[9px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">{t(`BRAND MOCKUP ${i + 1}`, `គំរូម៉ាកយីហោ ${i + 1}`)}</p>
                      <p className="text-xs sm:text-sm font-black text-zinc-800 dark:text-zinc-100 mt-1" style={kf}>{t(m.title.en, m.title.kh)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* ════ FOOTER ═══════════════════════════════════════════════════════ */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 py-10 flex flex-col md:flex-row items-center justify-between gap-6 mt-20 text-xs text-zinc-400 font-semibold">
          <p style={kf}>
            © {new Date().getFullYear()} KWD — Kesararam With Digital. Brand Guideline v1.0
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors" style={kf}>{t("Terms", "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors" style={kf}>{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </div>

      </div>

    </div>
  );
}
