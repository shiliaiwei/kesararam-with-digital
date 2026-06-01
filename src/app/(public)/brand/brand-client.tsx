"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";

const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

// ─── Color palette ─────────────────────────────────────────────────────────
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

// ─── Logo usage rules ──────────────────────────────────────────────────────
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

// ─── Product mockups ───────────────────────────────────────────────────────
const MOCKUP_ASSETS: { src: string; title: { en: string; kh: string } }[] = [
  { src: "/brand/tote_stationery_mockup.png",    title: { en: "Tote & Stationery Set",      kh: "កាបូប & Stationery Set" } },
  { src: "/brand/educational_blocks_mockup.png", title: { en: "Educational Toys & Cards",   kh: "ដុំឈើ & Learning Cards" } },
  { src: "/brand/mug_bottle_mockup.png",         title: { en: "Ceramic Mug & Metal Bottle", kh: "Ceramic Mug & Metal Bottle" } },
  { src: "/brand/apparel_brand_mockup.png",      title: { en: "Premium Brand Apparel",      kh: "Brand Apparel" } },
];

// ─── Section index (drives sticky nav + scroll-spy) ────────────────────────
const SECTIONS: { id: string; num: string; icon: string; accent: string; title: { en: string; kh: string } }[] = [
  { id: "name",  num: "01", icon: "badge",       accent: "#eab308", title: { en: "Brand Name & Meaning", kh: "ឈ្មោះ Brand និងន័យ" } },
  { id: "logo",  num: "02", icon: "bolt",        accent: "#3b82f6", title: { en: "Logo",          kh: "Logo" } },
  { id: "color", num: "03", icon: "palette",     accent: "#a855f7", title: { en: "Color Palette", kh: "Color Palette" } },
  { id: "type",  num: "04", icon: "text_fields", accent: "#22c55e", title: { en: "Typography",    kh: "Typography" } },
  { id: "apply", num: "05", icon: "category",    accent: "#f97316", title: { en: "Applications",  kh: "ការប្រើប្រាស់" } },
];

// ─── Component ────────────────────────────────────────────────────────────
export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  // Scroll-spy — highlight the section currently in view
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-black">

      {/* ════ HERO — "Spec Cover" ═══════════════════════════════════════════ */}
      <header className="relative overflow-hidden hero-dot-bg text-white border-b-4 border-black">
        {/* caution tape top strip */}
        <div className="absolute top-0 inset-x-0 h-2 caution-tape z-20" />

        {/* blueprint grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "clamp(28px, 6vw, 48px) clamp(28px, 6vw, 48px)",
          }}
        />

        {/* oversized bolt watermark */}
        <span
          aria-hidden
          className="material-symbols-rounded pointer-events-none absolute right-[-8%] top-1/2 -translate-y-1/2 select-none leading-none text-yellow-400/[0.07] -rotate-12"
          style={{ fontSize: "clamp(18rem, 52vw, 44rem)" }}
        >
          bolt
        </span>

        {/* corner registration marks */}
        {[
          "top-4 left-4 border-t-2 border-l-2 sm:top-6 sm:left-6",
          "top-4 right-4 border-t-2 border-r-2 sm:top-6 sm:right-6",
          "bottom-4 left-4 border-b-2 border-l-2 sm:bottom-6 sm:left-6",
          "bottom-4 right-4 border-b-2 border-r-2 sm:bottom-6 sm:right-6",
        ].map((c) => (
          <span key={c} aria-hidden className={`pointer-events-none absolute ${c} h-5 w-5 sm:h-7 sm:w-7 border-yellow-400/50`} />
        ))}

        {/* content */}
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-16 sm:pt-20 md:pt-24 pb-9 sm:pb-12 flex flex-col items-center text-center">
          {/* Logo tile */}
          <div className="relative mb-6 sm:mb-8 rounded-[1.75rem] border-2 border-black bg-white p-5 sm:p-6 shadow-[6px_6px_0_#eab308] overflow-hidden">
            <Image
              src={LOGO_PRIMARY}
              alt="KWD"
              width={104}
              height={104}
              className="object-contain w-[72px] h-[72px] sm:w-24 sm:h-24"
              priority
            />
            <div className="absolute bottom-0 inset-x-0 h-1.5 caution-tape" />
          </div>

          {/* Eyebrow pills row */}
          <div className="mb-5 sm:mb-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400" style={kf}>
                {t("Brand Guideline", "Brand Guideline")}
              </span>
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              v1.0
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              EN · ខ្មែរ
            </span>
          </div>

          {/* Wordmark */}
          <h1
            className="max-w-full font-black tracking-tighter leading-[0.9] text-white"
            style={{ fontSize: "clamp(3.5rem, 16vw, 9.5rem)" }}
          >
            K<span className="text-yellow-400">W</span>D
          </h1>

          {/* accent underline */}
          <div className="mt-5 sm:mt-7 mb-5 h-1.5 w-20 sm:w-24 rounded-full bg-yellow-400" />

          {/* description */}
          <p className="max-w-md sm:max-w-xl text-sm sm:text-base text-white/55 font-medium leading-relaxed" style={kf}>
            {t(
              "Visual identity, design standards, and usage rules that define KWD across every surface.",
              "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ KWD ។"
            )}
          </p>
        </div>

        {/* motto marquee */}
        <div className="relative z-10 flex overflow-hidden border-t-2 border-yellow-400/25 bg-black/40 py-2.5 sm:py-3">
          {[0, 1].map((track) => (
            <div
              key={track}
              aria-hidden={track === 1}
              className="flex shrink-0 items-center animate-marquee motion-reduce:animate-none"
              style={{ ["--duration" as string]: "24s", ["--gap" as string]: "0px" }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="flex items-center">
                  <span className="material-symbols-rounded text-yellow-400 text-sm sm:text-base mx-4 sm:mx-6">bolt</span>
                  {kh ? (
                    <span
                      className="text-xs sm:text-sm text-white/80 whitespace-nowrap"
                      style={{ fontFamily: '"GoogleSans", "Google Sans", sans-serif', fontWeight: 700 }}
                    >
                      រៀនដើម្បីដឹង·ប្រកួតដើម្បីពូកែ·ការពារដើម្បីជីវិត
                    </span>
                  ) : (
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-white/80 whitespace-nowrap">
                      Learn to know · Compete to excel · Protect for life
                    </span>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      </header>

      {/* ════ BODY ══════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">

        {/* Mobile sticky pill nav */}
        <nav className="lg:hidden sticky top-14 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2.5 bg-white/95 backdrop-blur-sm border-b-2 border-black">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border-2 border-black px-3 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors ${on ? "bg-black text-white" : "bg-white text-zinc-600"}`}
                  style={kf}
                >
                  <span style={{ color: on ? s.accent : "#9ca3af" }}>{s.num}</span>
                  <span>{t(s.title.en, s.title.kh)}</span>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="grid gap-8 py-10 md:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">

          {/* ─── Sticky table of contents (desktop) ─── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1.5">
              {SECTIONS.map((s) => {
                const on = active === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`group flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all ${on ? "border-black bg-black text-white shadow-[3px_3px_0_#000]" : "border-transparent text-zinc-500 hover:bg-white hover:text-black hover:border-black/10"}`}
                  >
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 border-black text-[10px] font-black"
                      style={{ background: on ? s.accent : "#fff", color: on ? "#fff" : "#000" }}
                    >
                      {s.num}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide leading-tight" style={kf}>
                      {t(s.title.en, s.title.kh)}
                    </span>
                  </a>
                );
              })}
            </div>
          </aside>

          {/* ─── Sections ─── */}
          <div className="min-w-0 space-y-8 md:space-y-10">

            {/* ════ 01 — BRAND NAME ════════════════════════════════════════ */}
            <SectionShell s={SECTIONS[0]} title={t(SECTIONS[0].title.en, SECTIONS[0].title.kh)} kf={kf}>
              <div className="space-y-5 text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>
                {kh ? (
                  <>
                    <p>
                      <strong className="text-black font-black">KWD</strong>{" "}
                      មានន័យថា <strong className="text-black font-black">Kesararam With Digital</strong> — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍។ ពាក្យ With មិនមែនជាឈ្នាប់ វាប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និង technology។ ឌីជីថល (Digital) មិនមែនត្រឹមតែជាឧបករណ៍សម្រាប់ផ្សព្វផ្សាយនោះទេ — ប៉ុន្តែវាគឺជាការប្តេជ្ញាចិត្តក្នុងការផ្តល់ជូននូវ ឱកាសខិតជិត (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។
                    </p>
                    <p>
                      KWD ត្រូវបានបង្កើតឡើងដោយយុវនារីខ្មែរនៃសាលាបឋមសិក្សា កេសរារាម ក្រោមទស្សនវិស័យមួយថា៖ ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍ដែលសង្គ្រោះជីវិតមនុស្ស បានគួរតែផ្តល់ជូនដោយឥតគិតថ្លៃ មានលក្ខណៈអន្តរកម្ម និងងាយស្រួលចូលប្រើប្រាស់ជាភាសាកំណើតរបស់សិស្សគ្រប់រូប។ ឈ្មោះនេះបញ្ជាក់ឱ្យឃើញថា ការអប់រំមិនបានបោះបង់ចោលអត្តសញ្ញាណ និងឫសគល់វប្បធម៌នៅក្នុងយុគសម័យឌីជីថលនោះទេ — ប៉ុន្តែវាគឺជាការជំរុញឱ្យឫសគល់ទាំងនោះ កាន់តែរីកចម្រើនទៅមុខតាមបច្ចេកវិទ្យា។
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-black font-black">KWD</strong>{" "}
                      stands for{" "}
                      <strong className="text-black font-black">Kesararam With Digital</strong>
                      {" "}— a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school — the oldest seat of learning in its community. The word With is not a conjunction — it declares partnership between tradition and technology. Digital is not a medium — it is a commitment to access, reach, and permanence.
                    </p>
                    <p>
                      KWD exists because young Cambodian women from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their own language. The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward.
                    </p>
                  </>
                )}
              </div>

              {/* Recommended usage */}
              <div className="mt-6 rounded-2xl border-2 border-black bg-amber-50 p-5 shadow-[4px_4px_0_#000]">
                <p className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-amber-600" style={kf}>
                  <span className="material-symbols-rounded text-sm">star</span>
                  {t("Recommended Usage", "ការប្រើប្រាស់និងការណែនាំ")}
                </p>
                <p className="text-sm font-medium text-zinc-700 leading-relaxed" style={kf}>
                  {kh ? (
                    <>
                      ត្រូវប្រើឈ្មោះពេញ <strong className="text-black font-black">«Kesararam With Digital»</strong> សម្រាប់ការណែនាំម៉ាកយីហោ (Brand) លើកដំបូង ក្នុងកម្មវិធីសារព័ត៌មាន បទបង្ហាញ ឯកសារផ្លូវការ និងដៃគូសហការ។ លោកអ្នកអាចប្រើពាក្យកាត់ <strong className="text-black font-black">«KWD»</strong> នៅផ្នែកបន្ទាប់ ក្រោយពេលដែលបានបង្ហាញឈ្មោះពេញរួច។
                    </>
                  ) : (
                    <>
                      Always use the full name{" "}
                      <strong className="text-black font-black">Kesararam With Digital</strong>
                      {" "}when introducing the brand for the first time — in press, presentations, official documents, and partnerships. The abbreviation{" "}
                      <strong className="text-black font-black">KWD</strong>
                      {" "}may be used in subsequent references once the full name has been established.
                    </>
                  )}
                </p>
              </div>
            </SectionShell>

            {/* ════ 02 — LOGO ══════════════════════════════════════════════ */}
            <SectionShell s={SECTIONS[1]} title={t(SECTIONS[1].title.en, SECTIONS[1].title.kh)} kf={kf}>

              {/* Logo meaning */}
              <div className="rounded-2xl border-2 border-black bg-blue-50/60 p-5">
                <p className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500" style={kf}>
                  <span className="material-symbols-rounded text-sm text-blue-500">bolt</span>
                  {t("Logo Meaning", "ន័យ Logo")}
                </p>
                {kh ? (
                  <div className="space-y-3 text-sm text-zinc-700 leading-relaxed font-medium" style={kf}>
                    <p>
                      និមិត្តសញ្ញាផ្លេកបន្ទោរនៅលើឡូហ្គោ KWD មិនមែនជាការតុបតែងលម្អឡើយ តែវាជាទស្សនវិជ្ជាស្នូលរបស់ Brand។ វាផ្ដល់អត្ថន័យដល់{" "}
                      <strong className="text-black font-black">Flash Learning</strong>{" "}
                      ដោយឈរលើជំនឿថា ក្នុងយុគសម័យ AI ចំណេះដឹងត្រូវតែដើរក្នុងល្បឿននៃពន្លឺ។
                    </p>
                    <p>
                      ស្របពេលដែល Automation កំពុងផ្លាស់ប្ដូររាល់ឧស្សាហកម្ម បច្ចេកវិទ្យានៃអនាគតជារបស់អ្នកដែលរៀនសូត្រនៅថ្ងៃនេះ។ និមិត្តសញ្ញានេះជាការប្ដេជ្ញាចិត្តរបស់{" "}
                      <strong className="text-black font-black">Kesararam With Digital</strong>{" "}
                      ក្នុងការផ្ដល់នូវល្បឿន ឧបករណ៍ និងទំនុកចិត្ត ដើម្បីសិក្សារួមគ្នាជាមួយ AI និងដឹកនាំការផ្លាស់ប្ដូរនាពេលខាងមុខ។
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                    The lightning bolt at the heart of the KWD mark is not ornamental — it is the brand&apos;s core belief made visible. It stands for{" "}
                    <strong className="text-black font-black">Flash Learning</strong>
                    {" "}— the conviction that in the age of AI, knowledge moves at the speed of light. Automation is rewriting every industry. The tools of the future belong to those who learn now. The bolt is our promise:{" "}
                    <strong className="text-black font-black">Kesararam With Digital</strong>
                    {" "}will always give every Cambodian student the speed, the tools, and the confidence to learn with AI — and lead what comes next.
                  </p>
                )}
              </div>

              {/* Primary + Dark */}
              <div className="mt-8">
                <SubLabel kf={kf}>{t("Official Logo", "Logo ផ្លូវការ")}</SubLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LogoCard
                    bg="bg-white"
                    imgSrc={LOGO_PRIMARY}
                    filename="kwd-black_nobackground.png"
                    badge={t("★ Primary — Always Use This", "★ Primary — ប្រើនេះជានិច្ច")}
                    badgeColor="text-amber-500"
                    note={t("On light backgrounds", "លើ background ភ្លឺ")}
                    kf={kf}
                  />
                  <LogoCard
                    bg="bg-zinc-900"
                    imgSrc={LOGO_PRIMARY}
                    filename="kwd-black_nobackground.png"
                    badge="+ CSS filter: invert(1)"
                    badgeColor="text-zinc-400"
                    note={t("On dark backgrounds", "លើ background ងងឹត")}
                    invert
                    kf={kf}
                  />
                </div>
              </div>

              {/* Color variants */}
              <div className="mt-8">
                <SubLabel kf={kf}>{t("Color Variants", "Logo Variants")}</SubLabel>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { src: "/brand/kwd-gray.png",   file: "kwd-gray.png",   note: t("On white / light neutral", "លើ background ស ឬ neutral") },
                    { src: "/brand/kwd-green.png",  file: "kwd-green.png",  note: t("Success · active",          "Success state · active") },
                    { src: "/brand/kwd-yellow.png", file: "kwd-yellow.png", note: t("Brand accent · CTA",        "Brand accent · CTA") },
                  ].map(({ src, file, note }) => (
                    <div key={file} className="overflow-hidden rounded-xl border-2 border-black shadow-[3px_3px_0_#000]">
                      <div className="h-24 flex items-center justify-center p-4 bg-white">
                        <Image src={src} alt={file} width={72} height={72} className="object-contain max-h-14" />
                      </div>
                      <div className="px-3 py-2 bg-zinc-50 border-t-2 border-black">
                        <p className="text-[9px] font-black uppercase tracking-wide text-zinc-700">{file}</p>
                        <p className="text-[8px] text-zinc-400 font-medium mt-0.5" style={kf}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage rules */}
              <div className="mt-8">
                <SubLabel kf={kf}>{t("Usage Rules", "ច្បាប់ប្រើ")}</SubLabel>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {RULES.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border-2 border-black/10 bg-white p-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 border-black bg-yellow-400 text-[9px] font-black text-black">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[13px] text-zinc-600 font-medium leading-snug" style={kf}>{t(r.en, r.kh)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionShell>

            {/* ════ 03 — COLOR PALETTE ═════════════════════════════════════ */}
            <SectionShell s={SECTIONS[2]} title={t(SECTIONS[2].title.en, SECTIONS[2].title.kh)} kf={kf}>
              <p className="text-sm text-zinc-500 font-medium mb-6" style={kf}>
                {t(
                  "KWD colors are drawn directly from the road sign system — every color carries meaning.",
                  "ពណ៌ KWD ត្រូវបានយកចេញពីប្រព័ន្ធសញ្ញាចរាចរ — ពណ៌គ្រប់ពណ៌មានន័យ។"
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {COLORS.map(({ name, hex, role }) => (
                  <div key={hex} className="overflow-hidden rounded-2xl border-2 border-black shadow-[3px_3px_0_#000]">
                    <div className="h-16" style={{ background: hex }} />
                    <div className="px-3 py-2.5 bg-white border-t-2 border-black">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] font-black text-black uppercase tracking-wide">{name}</p>
                        <p className="text-[9px] font-mono text-zinc-400">{hex}</p>
                      </div>
                      <p className="mt-1 text-[9px] leading-snug text-zinc-400 font-medium" style={kf}>{t(role.en, role.kh)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>

            {/* ════ 04 — TYPOGRAPHY ════════════════════════════════════════ */}
            <SectionShell s={SECTIONS[3]} title={t(SECTIONS[3].title.en, SECTIONS[3].title.kh)} kf={kf}>
              {/* Two font specimens side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0_#000]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">English — Inter</p>
                  <p className="text-5xl font-black text-black leading-none mb-2">Aa</p>
                  <p className="text-base font-black text-black mb-0.5">ABCDEFGHIJKLM</p>
                  <p className="text-base font-medium text-zinc-500 mb-3">abcdefghijklm</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed" style={kf}>
                    {t("All Latin text, UI labels, headings, body copy.", "Latin text ទាំងអស់ · label · heading · body")}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-black p-5 shadow-[4px_4px_0_#000]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">Khmer — Siemreap</p>
                  <p className="text-5xl font-black text-black leading-none mb-2" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ</p>
                  <p className="text-base font-black text-black mb-0.5" style={{ fontFamily: "Siemreap, sans-serif" }}>គ ឃ ង ច ឆ ជ</p>
                  <p className="text-base font-medium text-zinc-500 mb-3" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ គ ឃ ង</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed" style={kf}>
                    {t("All Khmer script content across the platform.", "Khmer text ទាំងអស់នៅក្នុង platform")}
                  </p>
                </div>
              </div>

              {/* Type scale */}
              <div className="overflow-hidden rounded-2xl border-2 border-black divide-y-2 divide-black/5">
                {[
                  { label: "Display",    size: "text-4xl md:text-5xl", weight: "font-black",  sample: "900 — Display" },
                  { label: "Heading",    size: "text-2xl md:text-3xl", weight: "font-black",  sample: "900 — Heading" },
                  { label: "Subheading", size: "text-xl",   weight: "font-bold",   sample: "700 — Subheading" },
                  { label: "Body",       size: "text-base", weight: "font-medium", sample: "500 — Body text" },
                  { label: "Label",      size: "text-xs",   weight: "font-black",  sample: "900 — LABEL UPPERCASE" },
                ].map(({ label, size, weight, sample }) => (
                  <div key={label} className="flex items-center gap-4 md:gap-6 px-4 py-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 w-16 md:w-20 flex-shrink-0">{label}</span>
                    <p className={`${size} ${weight} text-black leading-none ${label === "Label" ? "uppercase tracking-widest" : ""}`}>{sample}</p>
                  </div>
                ))}
              </div>
            </SectionShell>

            {/* ════ 05 — APPLICATIONS ══════════════════════════════════════ */}
            <SectionShell s={SECTIONS[4]} title={t(SECTIONS[4].title.en, SECTIONS[4].title.kh)} kf={kf}>
              <p className="text-sm text-zinc-500 font-medium mb-6" style={kf}>
                {t(
                  "Studio-quality mockups showing KWD brand applied across merchandise and digital platforms.",
                  "Studio-quality mockup ដែលបង្ហាញ KWD brand លើ merchandise និង digital platform ផ្សេងៗ។"
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {MOCKUP_ASSETS.map((m, i) => (
                  <div
                    key={i}
                    className="group rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0_#000] hover:shadow-[7px_7px_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden"
                  >
                    <div className="aspect-square relative overflow-hidden border-b-2 border-black bg-zinc-50">
                      <Image
                        src={m.src}
                        alt={m.title.en}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-0.5">
                        {t(`MOCKUP ${String(i + 1).padStart(2, "0")}`, `គំរូ ${String(i + 1).padStart(2, "0")}`)}
                      </p>
                      <p className="text-sm font-black text-black" style={kf}>{t(m.title.en, m.title.kh)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>
          </div>
        </div>

        {/* ════ FOOTER ═══════════════════════════════════════════════════════ */}
        <div className="border-t-2 border-black py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src={LOGO_PRIMARY} alt="KWD" width={20} height={20} className="object-contain opacity-30" />
            <p className="text-xs text-zinc-400 font-medium" style={kf}>
              © {new Date().getFullYear()} KWD — Kesararam With Digital. Brand Guideline v1.0
            </p>
          </div>
          <div className="flex gap-5 text-xs font-bold">
            <Link href="/terms"   className="text-zinc-400 hover:text-black transition-colors" style={kf}>{t("Terms",   "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-black transition-colors" style={kf}>{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Section wrapper (soft-framed card + brutalist icon chip header) ────────
function SectionShell({
  s, title, kf, children,
}: {
  s: { id: string; num: string; icon: string; accent: string };
  title: string;
  kf: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section id={s.id} className="scroll-mt-28">
      <div className="rounded-3xl border-2 border-black bg-white p-5 md:p-8 shadow-[0_14px_40px_-20px_rgba(0,0,0,0.4)]">
        {/* Section header */}
        <div className="mb-7 flex items-center gap-4 border-b-2 border-black pb-5">
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-black text-white shadow-[3px_3px_0_#000]"
            style={{ background: s.accent }}
          >
            <span className="material-symbols-rounded text-xl">{s.icon}</span>
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: s.accent }}>{s.num}</p>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wide text-black leading-tight" style={kf}>
              {title}
            </h2>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

// ─── Sub-section label ──────────────────────────────────────────────────────
function SubLabel({ children, kf }: { children: React.ReactNode; kf: React.CSSProperties }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400" style={kf}>
      <span className="h-2 w-2 border-2 border-black bg-yellow-400" />
      {children}
    </p>
  );
}

// ─── Logo display card ─────────────────────────────────────────────────────
function LogoCard({
  bg, imgSrc, filename, badge, badgeColor, note, invert, kf,
}: {
  bg: string; imgSrc: string; filename: string;
  badge: string; badgeColor: string; note: string; invert?: boolean;
  kf: React.CSSProperties;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-black shadow-[4px_4px_0_#000]">
      <div className={`h-44 flex items-center justify-center p-8 ${bg}`}>
        <Image
          src={imgSrc} alt="KWD" width={160} height={160}
          className={`object-contain max-h-28 ${invert ? "invert" : ""}`}
        />
      </div>
      <div className="px-4 py-3 bg-zinc-50 border-t-2 border-black">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-wide leading-tight">{filename}</p>
        <p className={`text-[9px] font-bold mt-0.5 ${badgeColor}`}>{badge}</p>
        <p className="text-[8px] text-zinc-400 font-medium mt-0.5" style={kf}>{note}</p>
      </div>
    </div>
  );
}
