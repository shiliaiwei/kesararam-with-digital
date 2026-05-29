"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/lang-context";

const COLORS = [
  { name: "Yellow",  hex: "#eab308", role: "Primary CTA, warning signs, brand accent" },
  { name: "Black",   hex: "#000000", role: "Text, borders, structural elements" },
  { name: "White",   hex: "#ffffff", role: "Background, negative space" },
  { name: "Blue",    hex: "#3b82f6", role: "Informational signs, links, signals" },
  { name: "Red",     hex: "#ef4444", role: "Prohibitory signs, danger, stop" },
  { name: "Green",   hex: "#22c55e", role: "Success, active states, go" },
  { name: "Orange",  hex: "#f97316", role: "Caution, attention, warning" },
  { name: "Purple",  hex: "#a855f7", role: "Premium features, game modes" },
  { name: "Cyan",    hex: "#06b6d4", role: "Accent, highlights, info" },
];

// ─── Official logo — ONE source of truth ───────────────────────────────────
// Primary: kwd-black_nobackground.png — the ONLY logo used in this product.
// All logo placements across UI must reference this single file.
const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

const RULES = [
  "Do not stretch, rotate, or distort the logo.",
  "Do not apply drop shadows, gradients, or filters.",
  "Do not place the logo on low-contrast backgrounds.",
  "Maintain clear space equal to the height of K on all sides.",
  "Use kwd-black_nobackground on light backgrounds only.",
  "Minimum logo height is 24 px in any digital context.",
  "Do not recolor, outline, or alter the logo in any way.",
  "Only kwd-black_nobackground.png is the approved digital logo — no other variants.",
];

const DESIGN_TOKENS = [
  { token: "Border Radius",  value: "0px — always sharp" },
  { token: "Border Width",   value: "2px standard · 4px emphasis" },
  { token: "Shadow",         value: "4px 4px 0 #000 — hard, no blur" },
  { token: "Hover",          value: "−0.5px translate · shadow 6px" },
  { token: "Active",         value: "+2px translate · shadow removed" },
  { token: "Transition",     value: "100–150ms only" },
  { token: "Gradients",      value: "None — solid colors only" },
  { token: "Motion",         value: "Purposeful only" },
];

// ─── Blank product mockup slots (user will drop images in later) ────────────
const MOCKUP_COUNT = 5;

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div
      className="min-h-screen bg-white text-black"
      style={{
        backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-14 md:py-20">

        {/* ── Hero logo ── */}
        <div className="flex justify-center mb-16">
          <Image
            src={LOGO_PRIMARY}
            alt="KWD"
            width={180}
            height={180}
            className="object-contain"
            priority
          />
        </div>

        {/* ── Title ── */}
        <div className="mb-12">
          <span
            className="inline-block text-[10px] font-black uppercase tracking-[0.25em] border border-black/20 px-3 py-1 rounded-full bg-white/80 mb-4"
            style={kf}
          >
            {kh ? "ការណែនាំម៉ាក" : "Brand Guideline"}
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-3 text-black" style={kf}>
            KWD
          </h1>
          <p className="text-sm text-zinc-500 font-medium max-w-md" style={kf}>
            {kh
              ? "ស្តង់ដារអត្តសញ្ញាណ ការរចនា និងការប្រើប្រាស់ម៉ាករបស់ KWD លើគ្រប់ផ្ទៃ"
              : "The visual identity, design standards, and usage rules that define KWD across every surface."}
          </p>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 01 Brand Name ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
            01 — {kh ? "ឈ្មោះ និងន័យ" : "Brand Name & Meaning"}
          </p>
          <div className="space-y-4 text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>
            <p>
              <strong className="text-black font-black">KWD</strong>{" "}
              {kh
                ? "— Kesararam With Digital — ជាឈ្មោះដែលបញ្ចូលគ្នារវាងប្រពៃណីនិងបច្ចេកវិទ្យា។ Kesararam គឺជាវត្ត និងសាលាបឋមសិក្សា — ទីកន្លែងរៀនសូត្រចំណាស់បំផុតក្នុងសហគមន៍។ Digital គឺជាការប្តេជ្ញាចិត្តចំពោះការចូលប្រើ ការឈានដល់ និងភាពអចិន្ត្រៃយ៍។"
                : "stands for Kesararam With Digital — a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school, the oldest seat of learning in its community. The word With is not a conjunction — it is a declaration of partnership between tradition and technology. Digital is not a medium — it is a commitment to access, to reach, to permanence."}
            </p>
            <p style={kf}>
              {kh
                ? "KWD មានស្ថិតឡើង ដោយសារក្មេងស្រីខ្មែរពីកេសរារាមបានសម្រេចថា ចំណេះដឹងសុវត្ថិភាពចរាចរ — ចំណេះដឹងដែលជួយសង្គ្រោះជីវិត — គួរតែឥតគិតថ្លៃ អន្តរកម្ម និងអាចចូលប្រើបានដោយសិស្សគ្រប់រូបក្នុងភាសារបស់ពួកគេ។"
                : "KWD exists because young Cambodian girls from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their language. The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward."}
            </p>
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 02 Logo ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
            02 — {kh ? "ឡូហ្គូ" : "Logo"}
          </p>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {kh
              ? "kwd-black_nobackground.png ជាឡូហ្គូចម្បង — ប្រើលើគ្រប់ផ្ទៃ។ វ៉ារ្យ៉ង់ពណ៌ (Gray, Green, Yellow) ត្រូវបានអនុញ្ញាតតែក្នុងបរិបទជាក់លាក់ប៉ុណ្ណោះ។"
              : "kwd-black_nobackground.png is the primary logo — used across all surfaces. Color variants (Gray, Green, Yellow) are permitted only in specific approved contexts."}
          </p>

          {/* Official logo — single card */}
          <div className="mb-10">
            <div className="rounded-2xl overflow-hidden border-2 border-black/10 inline-block w-full max-w-xs">
              <div className="h-40 flex items-center justify-center p-8 bg-white">
                <Image
                  src={LOGO_PRIMARY}
                  alt="KWD — Official Logo"
                  width={160}
                  height={160}
                  className="object-contain max-h-28"
                  priority
                />
              </div>
              <div className="px-4 py-3 bg-zinc-50 border-t border-black/8">
                <p className="text-[10px] font-black uppercase tracking-wide text-zinc-800 leading-tight">
                  kwd-black_nobackground.png
                </p>
                <p className="text-[9px] text-amber-500 font-black mt-0.5 uppercase tracking-wide">
                  ★ Sole Official Logo — Always Use This
                </p>
              </div>
            </div>
          </div>

          {/* Dark background preview */}
          <div className="mb-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">
              On Dark Background
            </p>
            <div className="rounded-2xl overflow-hidden border-2 border-black/10 inline-block w-full max-w-xs">
              <div className="h-40 flex items-center justify-center p-8 bg-zinc-900">
                <Image
                  src={LOGO_PRIMARY}
                  alt="KWD — Official Logo on dark"
                  width={160}
                  height={160}
                  className="object-contain max-h-28 invert"
                />
              </div>
              <div className="px-4 py-3 bg-zinc-50 border-t border-black/8">
                <p className="text-[10px] font-black uppercase tracking-wide text-zinc-800 leading-tight">
                  kwd-black_nobackground.png <span className="text-zinc-400 font-medium">+ CSS invert</span>
                </p>
                <p className="text-[9px] text-zinc-400 font-medium mt-0.5">
                  For dark surfaces — apply filter: invert(1)
                </p>
              </div>
            </div>
          </div>

          {/* Color variants grid */}
          <div className="mb-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">
              {kh ? "វ៉ារ្យ៉ង់ពណ៌ផ្លូវការ" : "Official Color Variants"}
            </p>
            <div className="grid grid-cols-3 gap-3">

              {/* Gray */}
              <div className="rounded-xl overflow-hidden border border-black/10">
                <div className="h-24 flex items-center justify-center p-4 bg-white">
                  <Image
                    src="/brand/kwd-gray.png"
                    alt="KWD Gray"
                    width={80}
                    height={80}
                    className="object-contain max-h-14"
                  />
                </div>
                <div className="px-2.5 py-2 bg-white border-t border-black/8">
                  <p className="text-[9px] font-black uppercase tracking-wide text-zinc-700 leading-tight">kwd-gray.png</p>
                  <p className="text-[8px] text-zinc-400 font-medium mt-0.5">{kh ? "ប្រើលើផ្ទៃស ឬប្រផេះ" : "On white / light neutral bg"}</p>
                </div>
              </div>

              {/* Green */}
              <div className="rounded-xl overflow-hidden border border-black/10">
                <div className="h-24 flex items-center justify-center p-4 bg-white">
                  <Image
                    src="/brand/kwd-green.png"
                    alt="KWD Green"
                    width={80}
                    height={80}
                    className="object-contain max-h-14"
                  />
                </div>
                <div className="px-2.5 py-2 bg-white border-t border-black/8">
                  <p className="text-[9px] font-black uppercase tracking-wide text-zinc-700 leading-tight">kwd-green.png</p>
                  <p className="text-[8px] text-zinc-400 font-medium mt-0.5">{kh ? "ស្ថានភាពជោគជ័យ · សកម្ម" : "Success state · active"}</p>
                </div>
              </div>

              {/* Yellow */}
              <div className="rounded-xl overflow-hidden border border-black/10">
                <div className="h-24 flex items-center justify-center p-4 bg-white">
                  <Image
                    src="/brand/kwd-yellow.png"
                    alt="KWD Yellow"
                    width={80}
                    height={80}
                    className="object-contain max-h-14"
                  />
                </div>
                <div className="px-2.5 py-2 bg-white border-t border-black/8">
                  <p className="text-[9px] font-black uppercase tracking-wide text-zinc-700 leading-tight">kwd-yellow.png</p>
                  <p className="text-[8px] text-amber-500 font-bold mt-0.5">{kh ? "ម៉ាកសញ្ញា · CTA" : "Brand accent · CTA"}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Usage rules */}
          <div className="space-y-2">
            {RULES.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[10px] font-black text-zinc-300 mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-zinc-600 font-medium leading-snug" style={kf}>{r}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 02.5 Product Mockups ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
            {kh ? "ផលិតផល" : "Product Mockups"}
          </p>
          <p className="text-sm text-zinc-500 font-medium mb-6" style={kf}>
            {kh
              ? "KWD លើផលិតផល និងសម្ភារៈម៉ាក — រូបភាពនឹងត្រូវបន្ថែមនៅពេលក្រោយ។"
              : "KWD applied across physical products and brand materials — images will be added later."}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: MOCKUP_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border-2 border-dashed border-black/15 bg-zinc-50 h-44 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-8 h-8 rounded border-2 border-black/15 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="opacity-25"
                  >
                    <rect x="1" y="1" width="14" height="14" rx="1" stroke="#000" strokeWidth="1.5" />
                    <path d="M1 11l4-4 3 3 3-4 4 5" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="11" cy="5" r="1.5" fill="#000" />
                  </svg>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/20">
                  Image {String(i + 1).padStart(2, "0")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 02.6 Card Print Sign ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
            {kh ? "កាតព្រីនសញ្ញា" : "Card Print Sign"}
          </p>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {kh
              ? "ទម្រង់កាតដែលអាចបោះពុម្ពបាន — ប្រើ Google Sans Khmer សម្រាប់ភាសាខ្មែរ និង Inter សម្រាប់ភាសាអង់គ្លេស។"
              : "Print-ready card format — uses Kantumruy Pro for Khmer text and Inter for English text."}
          </p>

          {/* Card preview grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* Card 1 — Light */}
            <div
              className="relative rounded-[10px] border-[3px] border-black overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ aspectRatio: "85/54", background: "#ffffff" }}
            >
              {/* glossy shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

              <div className="flex h-full px-5 py-4 gap-4 items-center">
                {/* Logo */}
                <div className="w-[68px] h-[68px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-black/5">
                  <Image
                    src={LOGO_PRIMARY}
                    alt="KWD"
                    width={46}
                    height={46}
                    className="object-contain"
                  />
                </div>
                {/* Divider */}
                <div className="w-px self-stretch bg-black/10" />
                {/* Text block */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-black leading-none mb-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    KWD
                  </p>
                  <p
                    className="text-[9px] font-semibold text-zinc-500 leading-snug mb-2"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Kesararam With Digital
                  </p>
                  <p
                    className="text-[10px] font-bold text-black leading-snug"
                    style={{ fontFamily: "var(--font-kh-header)" }}
                  >
                    កេសរារាម ជាមួយ ឌីជីថល
                  </p>
                  <p
                    className="text-[8px] text-zinc-400 mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-kh-body)" }}
                  >
                    ការអប់រំ · សុវត្ថិភាពចរាចរ
                  </p>
                </div>
              </div>
              {/* bottom bar: caution tape */}
              <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
            </div>

            {/* Card 2 — Dark */}
            <div
              className="relative rounded-[10px] border-[3px] border-black overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ aspectRatio: "85/54", background: "#000000" }}
            >
              {/* glossy shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

              <div className="flex h-full px-5 py-4 gap-4 items-center">
                {/* Logo — inverted for dark bg */}
                <div className="w-[68px] h-[68px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-black/5">
                  <Image
                    src={LOGO_PRIMARY}
                    alt="KWD"
                    width={46}
                    height={46}
                    className="object-contain"
                  />
                </div>
                {/* Divider */}
                <div className="w-px self-stretch bg-white/15" />
                {/* Text block */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-white leading-none mb-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    KWD
                  </p>
                  <p
                    className="text-[9px] font-semibold text-white/50 leading-snug mb-2"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Kesararam With Digital
                  </p>
                  <p
                    className="text-[10px] font-bold text-white leading-snug"
                    style={{ fontFamily: "var(--font-kh-header)" }}
                  >
                    កេសរារាម ជាមួយ ឌីជីថល
                  </p>
                  <p
                    className="text-[8px] text-white/40 mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-kh-body)" }}
                  >
                    ការអប់រំ · សុវត្ថិភាពចរាចរ
                  </p>
                </div>
              </div>
              {/* bottom bar: caution tape */}
              <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
            </div>

            {/* Card 3 — Yellow accent */}
            <div
              className="relative rounded-[10px] border-[3px] border-black overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ aspectRatio: "85/54", background: "#eab308" }}
            >
              {/* glossy shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

              <div className="flex h-full px-5 py-4 gap-4 items-center">
                <div className="w-[68px] h-[68px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-black/5">
                  <Image
                    src="/brand/kwd-yellow.png"
                    alt="KWD Yellow"
                    width={46}
                    height={46}
                    className="object-contain"
                  />
                </div>
                <div className="w-px self-stretch bg-black/20" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-black leading-none mb-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    KWD
                  </p>
                  <p
                    className="text-[9px] font-semibold text-black/60 leading-snug mb-2"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Kesararam With Digital
                  </p>
                  <p
                    className="text-[10px] font-bold text-black leading-snug"
                    style={{ fontFamily: "var(--font-kh-header)" }}
                  >
                    កេសរារាម ជាមួយ ឌីជីថល
                  </p>
                  <p
                    className="text-[8px] text-black/50 mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-kh-body)" }}
                  >
                    ការអប់រំ · សុវត្ថិភាពចរាចរ
                  </p>
                </div>
              </div>
              {/* bottom bar: caution tape */}
              <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
            </div>

            {/* Card 4 — Bilingual ID card style */}
            <div
              className="relative rounded-[10px] border-[3px] border-black overflow-hidden flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ aspectRatio: "85/54", background: "#ffffff" }}
            >
              {/* glossy shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              {/* header stripe */}
              <div className="bg-black px-5 py-2 flex items-center justify-between flex-shrink-0">
                <p
                  className="text-[9px] font-black uppercase tracking-[0.25em] text-white"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Official ID Card
                </p>
                <p
                  className="text-[9px] font-bold text-white/60"
                  style={{ fontFamily: "var(--font-kh-header)" }}
                >
                  កាតអត្តសញ្ញាណ
                </p>
              </div>
              <div className="flex flex-1 px-5 py-3 gap-4 items-center min-h-0">
                <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-black/5">
                  <Image
                    src={LOGO_PRIMARY}
                    alt="KWD"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-black text-black leading-none"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    KWD
                  </p>
                  <p
                    className="text-[8px] font-medium text-zinc-500 mt-0.5 leading-snug"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    kesararamwithdigital.tech
                  </p>
                  <p
                    className="text-[9px] font-bold text-black mt-1.5 leading-snug"
                    style={{ fontFamily: "var(--font-kh-header)" }}
                  >
                    វេទិកាអប់រំ — ឥតគិតថ្លៃ
                  </p>
                </div>
                {/* accent dot */}
                <div className="w-2 h-2 rounded-full bg-[#eab308] flex-shrink-0" />
              </div>
              {/* bottom bar: caution tape */}
              <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
            </div>

            {/* Card 5 — Green on dark (sub-logo: kwd-green) */}
            <div
              className="relative rounded-[10px] border-[3px] border-black overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ aspectRatio: "85/54", background: "#111827" }}
            >
              {/* glossy shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              <div className="flex h-full px-5 py-4 gap-4 items-center">
                <div className="w-[68px] h-[68px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-white/5">
                  <Image
                    src="/brand/kwd-green.png"
                    alt="KWD Green"
                    width={46}
                    height={46}
                    className="object-contain"
                  />
                </div>
                <div className="w-px self-stretch bg-white/10" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-white leading-none mb-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    KWD
                  </p>
                  <p
                    className="text-[9px] font-semibold text-white/50 leading-snug mb-2"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Kesararam With Digital
                  </p>
                  <p
                    className="text-[10px] font-bold text-[#22c55e] leading-snug"
                    style={{ fontFamily: "var(--font-kh-header)" }}
                  >
                    កេសរារាម ជាមួយ ឌីជីថល
                  </p>
                  <p
                    className="text-[8px] text-white/30 mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-kh-body)" }}
                  >
                    ការអប់រំ · សុវត្ថិភាពចរាចរ
                  </p>
                </div>
              </div>
              {/* bottom bar: caution tape */}
              <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
            </div>

            {/* Card 6 — Gray / neutral (sub-logo: kwd-gray) */}
            <div
              className="relative rounded-[10px] border-[3px] border-black overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ aspectRatio: "85/54", background: "#f4f4f5" }}
            >
              {/* glossy shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              <div className="flex h-full px-5 py-4 gap-4 items-center">
                <div className="w-[68px] h-[68px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-black/5">
                  <Image
                    src="/brand/kwd-gray.png"
                    alt="KWD Gray"
                    width={46}
                    height={46}
                    className="object-contain"
                  />
                </div>
                <div className="w-px self-stretch bg-black/10" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-none mb-1"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    KWD
                  </p>
                  <p
                    className="text-[9px] font-semibold text-zinc-400 leading-snug mb-2"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Kesararam With Digital
                  </p>
                  <p
                    className="text-[10px] font-bold text-zinc-600 leading-snug"
                    style={{ fontFamily: "var(--font-kh-header)" }}
                  >
                    កេសរារាម ជាមួយ ឌីជីថល
                  </p>
                  <p
                    className="text-[8px] text-zinc-400 mt-1 leading-snug"
                    style={{ fontFamily: "var(--font-kh-body)" }}
                  >
                    ការអប់រំ · សុវត្ថិភាពចរាចរ
                  </p>
                </div>
              </div>
              {/* bottom bar: caution tape */}
              <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
            </div>

          </div>

          {/* Font spec table */}
          <div className="border border-black/8 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-zinc-50 border-b border-black/8">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2">Usage</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2">Font (Google Fonts)</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2">CSS Var</p>
            </div>
            {[
              { usage: "English — All text", font: "Inter", note: "Latin UI font", css: "--font-sans" },
              { usage: "Khmer — Headings", font: "Kantumruy Pro / Google Sans Khmer", note: "Heading style & brand elements", css: "--font-kh-header" },
              { usage: "Khmer — Body copy", font: "Siemreap / Google Sans", note: "Standard text & secondary UI", css: "--font-kh-body" },
            ].map(({ usage, font, note, css }) => (
              <div key={css} className="grid grid-cols-3 border-b border-black/5 last:border-0">
                <p className="text-[10px] font-medium text-zinc-600 px-4 py-2.5" style={kf}>{usage}</p>
                <div className="px-4 py-2.5">
                  <p className="text-[10px] font-bold text-black">{font}</p>
                  <p className="text-[8px] text-zinc-400 font-medium mt-0.5">{note}</p>
                </div>
                <p className="text-[9px] font-mono text-zinc-400 px-4 py-2.5 self-center">{css}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 03 Color Palette ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
            03 — {kh ? "ពណ៌" : "Color Palette"}
          </p>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {kh
              ? "ពណ៌ KWD ត្រូវបានជ្រើសរើសដោយផ្អែកលើប្រព័ន្ធសញ្ញាចរាចរ — ពណ៌នីមួយៗមានន័យ។"
              : "KWD colors are drawn directly from the road sign system — every color carries meaning."}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {COLORS.map(({ name, hex, role }) => (
              <div key={hex} className="group cursor-default">
                <div
                  className="h-12 rounded-lg mb-2 border border-black/8"
                  style={{ background: hex }}
                />
                <p className="text-[10px] font-black text-black uppercase tracking-wide">{name}</p>
                <p className="text-[9px] font-mono text-zinc-400">{hex}</p>
                <p className="text-[9px] text-zinc-400 leading-snug mt-0.5 hidden group-hover:block">{role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 04 Typography ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">
            04 — {kh ? "អក្សរ" : "Typography"}
          </p>

          <div className="space-y-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">Primary — Inter</p>
              <p className="text-5xl font-black text-black leading-none">Aa Bb Cc</p>
              <p className="text-xs text-zinc-400 mt-2">All Latin text, UI labels, headings, body copy.</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">Khmer — Siemreap</p>
              <p className="text-4xl font-black text-black leading-none" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ គ ឃ ង</p>
              <p className="text-xs text-zinc-400 mt-2">All Khmer script content across the platform.</p>
            </div>
            <div className="space-y-3 border-t border-black/8 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-4">Type Scale</p>
              <p className="text-5xl font-black text-black leading-none">Display / 900</p>
              <p className="text-3xl font-black text-black">Heading / 900</p>
              <p className="text-xl font-bold text-black">Subheading / 700</p>
              <p className="text-base font-medium text-zinc-700">Body / 500</p>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Label / 900 Uppercase</p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 05 Design System ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
            05 — {kh ? "ប្រព័ន្ធរចនា" : "Design System"}
          </p>
          <p className="text-sm md:text-base text-zinc-700 leading-relaxed font-medium mb-8" style={kf}>
            {kh
              ? "KWD ប្រើប្រព័ន្ធ Neo-Brutalism — ដែលបង្កើតឡើងលើវេយ្យាករណ៍ដ៏ច្បាស់លាស់នៃហេដ្ឋារចនាសម្ព័ន្ធផ្លូវ។ ស៊ុមមានរចនាសម្ព័ន្ធ មិនមែនតុបតែង។ ស្រមោលមានទិសដៅ ដូចស្រមោលនៃសសរសញ្ញាផ្លូវ។ គ្មានជម្រាល គ្មានភាពទន់ភ្លន់ — ចំណុចប្រទាក់ទំនាក់ទំនងដោយភាពច្បាស់លាស់ដូចសញ្ញាឈប់។"
              : "KWD uses a Neo-Brutalism design language — a system built on the visual grammar of road infrastructure. Borders are structural, not decorative. Shadows are hard and directional, like the shadow cast by a road sign post. There are no gradients, no blur, no softness. The interface communicates with the same clarity that a stop sign communicates."}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {DESIGN_TOKENS.map(({ token, value }) => (
              <div key={token} className="flex flex-col gap-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{token}</p>
                <p className="text-sm font-bold text-black">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 06 Voice & Tone ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
            06 — {kh ? "សំឡេង និងទឹកចិត្ត" : "Voice & Tone"}
          </p>
          <div className="space-y-4 text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>
            <p>
              {kh
                ? "KWD និយាយដោយ ភាពច្បាស់លាស់ និងភាពកក់ក្ដៅ។ វេទិកានេះបង្កើតឡើងដោយក្មេងស្រីសម្រាប់សិស្ស — សំឡេងមិនដែលបង្ហាញការប្រមាថ ឬជាផ្លូវការ។ វាផ្ទាល់ ព្រោះសុវត្ថិភាពចរាចរផ្ទាល់។ វាកក់ក្ដៅ ព្រោះការរៀនសូត្រត្រូវការទំនុកចិត្ត។"
                : "KWD speaks with precision and warmth. The platform is built by young girls for students — the voice is never condescending, never bureaucratic. It is direct because road safety is direct. It is warm because learning requires trust."}
            </p>
            <p style={kf}>
              {kh
                ? "ជាភាសាខ្មែរ វេទិកាប្រើការចុះបញ្ជីដែលគោរព ប៉ុន្តែអាចចូលប្រើបាន — ភាសារបស់មិត្តដែលមានចំណេះដឹង មិនមែនអាជ្ញាធរ។ ជាភាសាអង់គ្លេស ទឹកចិត្តច្បាស់ សកម្ម និងគ្មានពាក្យបច្ចេកទេស។"
                : "In Khmer, the platform uses respectful but accessible register — the language of a knowledgeable peer, not an authority. In English, the tone is clear, active, and free of jargon."}
            </p>
          </div>
          <div className="mt-6 space-y-2">
            {[
              kh ? "សរសេរដើម្បីឱ្យយល់ មិនមែនដើម្បីចាប់អារម្មណ៍។" : "Write to be understood, not to impress.",
              kh ? "ប្រើសំឡេងសកម្ម។ បញ្ជាក់ពីអ្វីដែលអ្នកប្រើអាចធ្វើ។" : "Use active voice. State what the user can do.",
              kh ? "សារកំហុសពន្យល់ពីអ្វីដែលបានកើតឡើង និងអ្វីដែលត្រូវធ្វើបន្ទាប់។" : "Error messages explain what happened and what to do next.",
              kh ? "ស្លាកខ្លី។ ការពិពណ៌នាពេញលេញ។" : "Labels are short. Descriptions are complete.",
              kh ? "ខ្លឹមសារពីរភាសាត្រូវតែមានន័យស្មើ — មិនមែនការបកប្រែពាក្យ ពាក្យ។" : "Bilingual content must carry equal meaning — not literal translation.",
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[10px] font-black text-zinc-300 mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-zinc-600 font-medium leading-snug" style={kf}>{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src={LOGO_PRIMARY}
              alt="KWD"
              width={24}
              height={24}
              className="object-contain opacity-40"
            />
            <p className="text-xs text-zinc-400 font-medium" style={kf}>
              &copy; {new Date().getFullYear()} KWD — Kesararam With Digital. Brand Guideline v1.0
            </p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <Link href="/terms" className="text-zinc-400 hover:text-black transition-colors" style={kf}>Terms</Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-black transition-colors" style={kf}>Privacy</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
