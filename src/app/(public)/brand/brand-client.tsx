"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";

const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

// ─── Color palette ──────────────────────────────────────────────────────────
const COLORS: { name: string; hex: string; role: { en: string; kh: string } }[] = [
  { name: "Yellow", hex: "#eab308", role: { en: "CTA button · warning signs · brand accent", kh: "CTA button · សញ្ញាព្រមាន · brand accent" } },
  { name: "Black",  hex: "#000000", role: { en: "Text · borders · structure",               kh: "អក្សរ · border · structure" } },
  { name: "White",  hex: "#ffffff", role: { en: "Background · negative space",               kh: "Background · ចន្លោះទំនេរ" } },
  { name: "Blue",   hex: "#3b82f6", role: { en: "Info signs · links · signals",              kh: "សញ្ញាព័ត៌មាន · link · signal" } },
  { name: "Red",    hex: "#ef4444", role: { en: "Prohibitory signs · danger · stop",         kh: "សញ្ញាហាមឃាត់ · គ្រោះថ្នាក់ · stop" } },
  { name: "Green",  hex: "#22c55e", role: { en: "Success · active states · go",              kh: "ជោគជ័យ · active state" } },
  { name: "Orange", hex: "#f97316", role: { en: "Caution · attention · warning",             kh: "ព្រមាន · ប្រុងប្រយ័ត្ន" } },
  { name: "Purple", hex: "#a855f7", role: { en: "Premium features · game modes",             kh: "Premium feature · game mode" } },
  { name: "Cyan",   hex: "#06b6d4", role: { en: "Accent · highlights · info",                kh: "Accent · highlight · ព័ត៌មាន" } },
  { name: "Rose",   hex: "#fda4af", role: { en: "Emergency · alerts · dynamic indicators",   kh: "Alert · dynamic indicator" } },
  { name: "Gray",   hex: "#71717a", role: { en: "Metadata · code blocks · inactive",         kh: "Metadata · code block · inactive" } },
];

// ─── Logo usage rules ────────────────────────────────────────────────────────
const RULES: { en: string; kh: string }[] = [
  { en: "Do not stretch, rotate, or distort the logo.",            kh: "កុំទាញ, បង្វិល ឬធ្វើ logo ខូចទ្រង់ទ្រាយ។" },
  { en: "Do not apply drop shadows, gradients, or filters.",       kh: "កុំដាក់ shadow, gradient ឬ filter លើ logo។" },
  { en: "Do not place the logo on low-contrast backgrounds.",      kh: "កុំដាក់ logo លើ background ដែល contrast ទាប។" },
  { en: "Maintain clear space equal to the height of the K.",      kh: "ទុកចន្លោះជុំវិញ logo ស្មើកម្ពស់អក្សរ K ។" },
  { en: "Use kwd-black_nobackground on light backgrounds only.",   kh: "ប្រើ kwd-black_nobackground លើ background ភ្លឺប៉ុណ្ណោះ។" },
  { en: "Minimum logo height is 24 px in any digital context.",    kh: "Logo ត្រូវមានកម្ពស់ minimum 24 px ក្នុង context digital ណាក៏ដោយ។" },
  { en: "Do not recolor, outline, or alter the logo in any way.",  kh: "កុំប្ដូរពណ៌, ដាក់ outline ឬកែ logo តាមមធ្យោបាយណាក៏ដោយ។" },
  { en: "Only kwd-black_nobackground.png is the approved logo.",   kh: "kwd-black_nobackground.png ប៉ុណ្ណោះ ជា logo digital ផ្លូវការ។" },
];

// ─── Product mockups ─────────────────────────────────────────────────────────
const MOCKUP_ASSETS: { src: string; title: { en: string; kh: string } }[] = [
  { src: "/brand/tote_stationery_mockup.png",    title: { en: "Tote & Stationery Set",      kh: "កាបូប & Stationery Set" } },
  { src: "/brand/educational_blocks_mockup.png", title: { en: "Educational Toys & Cards",   kh: "ដុំឈើ & Learning Cards" } },
  { src: "/brand/mug_bottle_mockup.png",         title: { en: "Ceramic Mug & Metal Bottle", kh: "Ceramic Mug & Metal Bottle" } },
  { src: "/brand/apparel_brand_mockup.png",      title: { en: "Premium Brand Apparel",      kh: "Brand Apparel" } },
];

// ─── Section index ──────────────────────────────────────────────────────────
const SECTIONS: { id: string; num: string; title: { en: string; kh: string } }[] = [
  { id: "name",  num: "01", title: { en: "Brand Name & Meaning", kh: "ឈ្មោះ Brand និងន័យ" } },
  { id: "logo",  num: "02", title: { en: "Logo",          kh: "Logo" } },
  { id: "color", num: "03", title: { en: "Color Palette", kh: "Color Palette" } },
  { id: "type",  num: "04", title: { en: "Typography",    kh: "Typography" } },
  { id: "apply", num: "05", title: { en: "Applications",  kh: "ការប្រើប្រាស់" } },
];

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* Floating Sticky Circular Logo wrapper (Pure CSS Zero-Height alignment) */}
      <div className="max-w-5xl mx-auto px-6 relative h-0 pointer-events-none">
        <div className="sticky top-6 z-50 w-20 h-20 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white p-3 shadow-md hover:scale-105 transition-all duration-200 group mt-20 pointer-events-auto">
          {/* Inner static border */}
          <div className="absolute inset-1 rounded-full border border-zinc-100 dark:border-zinc-800/40 pointer-events-none" />
          
          <Image
            src={LOGO_PRIMARY}
            alt="KWD Logo"
            width={52}
            height={52}
            className="object-contain relative z-10 transition-transform duration-200 group-hover:scale-110"
            priority
          />
        </div>
      </div>

      {/* ════ HERO ════════════════════════════════════════════════════════ */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-12 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col items-start gap-5">
          {/* Spacer matching floating logo height */}
          <div className="h-20 w-20 shrink-0" />
          
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">KWD</h1>
            <span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 rounded-full font-mono uppercase">v1.0</span>
          </div>

          <p className="max-w-xl text-base text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed" style={kf}>
            {t(
              "Visual identity, design standards, and usage rules that define KWD across every surface.",
              "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ KWD ។"
            )}
          </p>
        </div>
      </header>

      {/* ════ MAIN CONTAINER ═══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[200px_1fr] items-start">
          
          {/* Sidebar Nav */}
          <aside className="hidden lg:block sticky top-24 space-y-1">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    on
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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

            {/* 01 — BRAND NAME */}
            <section id={SECTIONS[0].id} className="scroll-mt-24">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">{SECTIONS[0].num}</span>
                <h2 className="text-xl font-bold uppercase text-zinc-900 dark:text-white" style={kf}>
                  {t(SECTIONS[0].title.en, SECTIONS[0].title.kh)}
                </h2>
              </div>
              
              <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed" style={kf}>
                {kh ? (
                  <>
                    <p>
                      <strong>KWD</strong> មានន័យថា <strong>Kesararam With Digital</strong> — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍។ ពាក្យ With មិនមែនជាឈ្នាប់ វាប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និង technology។ ឌីជីថល (Digital) មិនមែនត្រឹមតែជាឧបករណ៍សម្រាប់ផ្សព្វផ្សាយនោះទេ — ប៉ុន្តែវាគឺជាការប្តេជ្ញាចិត្តក្នុងការផ្តល់ជូននូវ ឱកាសខិតជិត (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។
                    </p>
                    <p>
                      KWD ត្រូវបានបង្កើតឡើងដោយយុវនារីខ្មែរនៃសាលាបឋមសិក្សា កេសរារាម ក្រោមទស្សនវិស័យមួយថា៖ ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍ដែលសង្គ្រោះជីវិតមនុស្ស បានគួរតែផ្តល់ជូនដោយឥតគិតថ្លៃ មានលក្ខណៈអន្តរកម្ម និងងាយស្រួលចូលប្រើប្រាស់ជាភាសាកំណើតរបស់សិស្សគ្រប់រូប។ ឈ្មោះនេះបញ្ជាក់ឱ្យឃើញថា ការអប់រំមិនបានបោះបង់ចោលអត្តសញ្ញាណ និងឫសគល់វប្បធម៌នៅក្នុងយុគសម័យឌីជីថលនោះទេ — ប៉ុន្តែវាគឺជាការជំរុញឱ្យឫសគល់ទាំងនោះ កាន់តែរីកចម្រើនទៅមុខតាមបច្ចេកវិទ្យា។
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>KWD</strong> stands for <strong>Kesararam With Digital</strong> — a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school — the oldest seat of learning in its community. The word With is not a conjunction — it declares partnership between tradition and technology. Digital is not a medium — it is a commitment to access, reach, and permanence.
                    </p>
                    <p>
                      KWD exists because young Cambodian women from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their own language. The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1" style={kf}>{t("Recommended Usage", "ការប្រើប្រាស់និងការណែនាំ")}</p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed" style={kf}>
                  {kh ? (
                    <>ត្រូវប្រើឈ្មោះពេញ <strong>«Kesararam With Digital»</strong> សម្រាប់ការណែនាំម៉ាកយីហោ (Brand) លើកដំបូង ក្នុងកម្មវិធីសារព័ត៌មាន បទបង្ហាញ ឯកសារផ្លូវការ និងដៃគូសហការ។ លោកអ្នកអាចប្រើពាក្យកាត់ <strong>«KWD»</strong> នៅផ្នែកបន្ទាប់ ក្រោយពេលដែលបានបង្ហាញឈ្មោះពេញរួច។</>
                  ) : (
                    <>Always use the full name <strong>Kesararam With Digital</strong> when introducing the brand for the first time — in press, presentations, official documents, and partnerships. The abbreviation <strong>KWD</strong> may be used in subsequent references once the full name has been established.</>
                  )}
                </p>
              </div>
            </section>

            {/* 02 — LOGO */}
            <section id={SECTIONS[1].id} className="scroll-mt-24">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">{SECTIONS[1].num}</span>
                <h2 className="text-xl font-bold uppercase text-zinc-900 dark:text-white" style={kf}>
                  {t(SECTIONS[1].title.en, SECTIONS[1].title.kh)}
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 mb-6 text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed" style={kf}>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t("Logo Meaning", "ន័យ Logo")}</p>
                {kh ? (
                  <>
                    និមិត្តសញ្ញាផ្លេកបន្ទោរនៅលើឡូហ្គោ KWD មិនមែនជាការតុបតែងលម្អឡើយ តែវាជាទស្សនវិជ្ជាស្នូលរបស់ Brand។ វាផ្ដល់អត្ថន័យដល់ <strong>Flash Learning</strong> ដោយឈរលើជំនឿថា ក្នុងយុគសម័យ AI ចំណេះដឹងត្រូវតែដើរក្នុងល្បឿននៃពន្លឺ។ ស្របពេលដែល Automation កំពុងផ្លាស់ប្ដូររាល់ឧស្សាហកម្ម បច្ចេកវិទ្យានៃអនាគតជារបស់អ្នកដែលរៀនសូត្រនៅថ្ងៃនេះ។ និមិត្តសញ្ញានេះជាការប្ដេជ្ញាចិត្តរបស់ <strong>Kesararam With Digital</strong> ក្នុងការផ្ដល់នូវល្បឿន ឧបករណ៍ និងទំនុកចិត្ត ដើម្បីសិក្សារួមគ្នាជាមួយ AI និងដឹកនាំការផ្លាស់ប្ដូរនាពេលខាងមុខ។
                  </>
                ) : (
                  <>
                    The lightning bolt at the heart of the KWD mark is not ornamental — it is the brand&apos;s core belief made visible. It stands for <strong>Flash Learning</strong> — the conviction that in the age of AI, knowledge moves at the speed of light. Automation is rewriting every industry. The tools of the future belong to those who learn now. The bolt is our promise: <strong>Kesararam With Digital</strong> will always give every Cambodian student the speed, the tools, and the confidence to learn with AI — and lead what comes next.
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 flex flex-col items-center">
                  <div className="h-28 flex items-center justify-center p-4">
                    <Image src={LOGO_PRIMARY} alt="KWD Logo" width={80} height={80} className="object-contain" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 mt-2">kwd-black_nobackground.png</span>
                  <span className="text-[9px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">{t("On Light Backgrounds", "លើ background ភ្លឺ")}</span>
                </div>
                
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-950 flex flex-col items-center">
                  <div className="h-28 flex items-center justify-center p-4">
                    <Image src={LOGO_PRIMARY} alt="KWD Logo" width={80} height={80} className="object-contain invert" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 mt-2">kwd-black_nobackground.png (Inverted)</span>
                  <span className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{t("On Dark Backgrounds", "លើ background ងងឹត")}</span>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3" style={kf}>{t("Usage Rules", "ច្បាប់ប្រើ")}</h3>
                <ul className="space-y-2.5">
                  {RULES.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-semibold" style={kf}>
                      <span className="text-[10px] font-mono text-zinc-400 mt-0.5 shrink-0">{(i + 1).toString().padStart(2, "0")}.</span>
                      <span>{t(r.en, r.kh)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 03 — COLOR PALETTE */}
            <section id={SECTIONS[2].id} className="scroll-mt-24">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">{SECTIONS[2].num}</span>
                <h2 className="text-xl font-bold uppercase text-zinc-900 dark:text-white" style={kf}>
                  {t(SECTIONS[2].title.en, SECTIONS[2].title.kh)}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {COLORS.map(({ name, hex, role }) => (
                  <div key={hex} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                    <div className="h-14 w-full" style={{ background: hex }} />
                    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{hex}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-semibold leading-normal" style={kf}>{t(role.en, role.kh)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 04 — TYPOGRAPHY */}
            <section id={SECTIONS[3].id} className="scroll-mt-24">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">{SECTIONS[3].num}</span>
                <h2 className="text-xl font-bold uppercase text-zinc-900 dark:text-white" style={kf}>
                  {t(SECTIONS[3].title.en, SECTIONS[3].title.kh)}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-850 pb-1 mb-3">English — Inter</span>
                  <p className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Aa</p>
                  <p className="text-xs text-zinc-500 leading-normal" style={kf}>
                    {t("All Latin text, UI labels, headings, body copy.", "Latin text ទាំងអស់ · label · heading · body")}
                  </p>
                </div>
                
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-850 pb-1 mb-3">Khmer — Siemreap</span>
                  <p className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ</p>
                  <p className="text-xs text-zinc-500 leading-normal" style={kf}>
                    {t("All Khmer script content across the platform.", "Khmer text ទាំងអស់នៅក្នុង platform")}
                  </p>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {[
                  { label: "Display", size: "36px", sample: "Display Scale", weight: "font-extrabold text-2xl sm:text-3xl" },
                  { label: "Heading", size: "24px", sample: "Heading Scale", weight: "font-extrabold text-xl sm:text-2xl" },
                  { label: "Subheading", size: "18px", sample: "Subheading Scale", weight: "font-bold text-base sm:text-lg" },
                  { label: "Body", size: "14px", sample: "Body Text Scale", weight: "font-medium text-xs sm:text-sm" },
                  { label: "Label", size: "11px", sample: "LABEL SPECIMEN", weight: "font-bold text-[10px] tracking-wider uppercase" }
                ].map((spec) => (
                  <div key={spec.label} className="p-3 flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase w-20 shrink-0">{spec.label}</span>
                    <p className={`${spec.weight} text-zinc-800 dark:text-zinc-200 grow`} style={kf}>{spec.sample}</p>
                    <span className="text-[9px] font-mono text-zinc-400">{spec.size}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 05 — APPLICATIONS */}
            <section id={SECTIONS[4].id} className="scroll-mt-24">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">{SECTIONS[4].num}</span>
                <h2 className="text-xl font-bold uppercase text-zinc-900 dark:text-white" style={kf}>
                  {t(SECTIONS[4].title.en, SECTIONS[4].title.kh)}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCKUP_ASSETS.map((m, i) => (
                  <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                    <div className="aspect-square relative bg-zinc-50 dark:bg-zinc-900/30">
                      <Image
                        src={m.src}
                        alt={m.title.en}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">{t(`MOCKUP ${i + 1}`, `គំរូ ${i + 1}`)}</p>
                      <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-0.5" style={kf}>{t(m.title.en, m.title.kh)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* ════ FOOTER ═══════════════════════════════════════════════════════ */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 py-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-16 text-xs text-zinc-400">
          <p style={kf}>
            © {new Date().getFullYear()} KWD — Kesararam With Digital. Brand Guideline v1.0
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-zinc-800 dark:hover:text-white transition-colors" style={kf}>{t("Terms", "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="hover:text-zinc-800 dark:hover:text-white transition-colors" style={kf}>{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </div>

      </div>

    </div>
  );
}
