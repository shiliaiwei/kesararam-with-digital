"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Award, LayoutGrid, ArrowRight, Shield } from "lucide-react";
import { useLang } from "@/context/lang-context";
import {
  CautionTape,
  SignShape,
  TAPES,
  SHAPES,
  type SignShapeName,
} from "@/components/brand/brand-kit";
import { AvatarBorder } from "@/components/rank/AvatarBorder";
import { RANK_CONFIGS, calculateRankAndDivision, type Division } from "@/lib/ranks";

const LOGO_VARIANTS = [
  { src: "/brand/kwd-black_nobackground.png", filename: "kwd-black_nobackground.png", label: { en: "Black (default)", kh: "ពណ៌ខ្មៅ (លំនាំដើម)" }, bg: "bg-white", invert: false },
  { src: "/brand/kwd-gray.png", filename: "kwd-gray.png", label: { en: "Gray", kh: "ពណ៌ប្រផេះ" }, bg: "bg-white", invert: false },
  { src: "/brand/kwd-green.png", filename: "kwd-green.png", label: { en: "Green", kh: "ពណ៌បៃតង" }, bg: "bg-white", invert: false },
  { src: "/brand/kwd-black_nobackground.png", filename: "kwd-black_nobackground.png (inverted)", label: { en: "White (on dark)", kh: "ពណ៌ស (លើខ្មៅ)" }, bg: "bg-zinc-900", invert: true },
];

const COLORS: { name: string; hex: string; role: { en: string; kh: string } }[] = [
  { name: "Yellow", hex: "#eab308", role: { en: "CTA buttons · warning signs · brand accent", kh: "ប៊ូតុង CTA · សញ្ញាព្រមាន · ពណ៌លេចធ្លោម៉ាក" } },
  { name: "Black", hex: "#000000", role: { en: "Text · borders · structure", kh: "អក្សរ · គែម · រចនាសម្ព័ន្ធ" } },
  { name: "White", hex: "#ffffff", role: { en: "Background · negative space", kh: "ផ្ទៃខាងក្រោយ · ចន្លោះទំនេរ" } },
  { name: "Blue", hex: "#3b82f6", role: { en: "Info · links · positive signals", kh: "ព័ត៌មាន · តំណ · សញ្ញាវិជ្ជមាន" } },
  { name: "Red", hex: "#ef4444", role: { en: "Prohibitory signs · danger · stop", kh: "សញ្ញាហាមឃាត់ · គ្រោះថ្នាក់ · ឈប់" } },
  { name: "Green", hex: "#22c55e", role: { en: "Success · active state · go signals", kh: "ជោគជ័យ · ស្ថានភាព Active · ទៅមុខ" } },
  { name: "Orange", hex: "#f97316", role: { en: "Caution · attention", kh: "ការប្រុងប្រយ័ត្ន · ការផ្ដោតអារម្មណ៍" } },
  { name: "Purple", hex: "#a855f7", role: { en: "Premium features · special game modes", kh: "មុខងារពិសេស · របៀបលេងហ្គេមពិសេស" } },
];

const RULES: { en: string; kh: string }[] = [
  { en: "Do not stretch, rotate, or distort the logo.", kh: "កុំទាញ បង្វិល ឬធ្វើឱ្យ logo ខូចទ្រង់ទ្រាយ។" },
  { en: "Do not apply shadows, gradients, or filters.", kh: "កុំដាក់ស្រមោល gradient ឬ filter លើ logo។" },
  { en: "Do not place the logo on low-contrast backgrounds.", kh: "កុំដាក់ logo លើ background ដែលមាន contrast ទាប។" },
  { en: "Maintain clear space equal to the height of the 'K'.", kh: "រក្សាចន្លោះទំនេរជុំវិញ logo ស្មើកម្ពស់អក្សរ K។" },
  { en: "Use the black logo on light backgrounds only.", kh: "ប្រើ kwd-black_nobackground លើ background ភ្លឺ; ប្រើ Inverted លើ background ងងឹត។" },
  { en: "Minimum height: 24 px in any digital context.", kh: "ឡូហ្គោត្រូវមានកម្ពស់យ៉ាងតិច ២៤ px ក្នុងបរិស្ថានឌីជីថល។" },
  { en: "Do not recolor or add outlines to the logo.", kh: "កុំផ្លាស់ប្ដូរពណ៌ ឬបន្ថែម outline លើឡូហ្គោ។" },
];

const MOCKUP_ASSETS: { src: string; title: { en: string; kh: string } }[] = [
  { src: "/api/brand-mockups?file=tote_stationery.webp", title: { en: "Tote & Stationery", kh: "កាបូប & Stationery" } },
  { src: "/api/brand-mockups?file=educational_blocks.webp", title: { en: "Educational Toys & Cards", kh: "ដុំឈើ & Learning Cards" } },
  { src: "/api/brand-mockups?file=mug_bottle.webp", title: { en: "Mug & Bottle", kh: "Mug & Bottle" } },
  { src: "/api/brand-mockups?file=apparel_brand.webp", title: { en: "Brand Apparel", kh: "Brand Apparel" } },
  { src: "/api/brand-mockups?file=desktop_app.webp", title: { en: "Web & Desktop App", kh: "កម្មវិធីវិប & កុំព្យូទ័រ" } },
  { src: "/api/brand-mockups?file=corporate_stationery.webp", title: { en: "Corporate Stationery", kh: "ឧបករណ៍ការិយាល័យ" } },
];

const SECTIONS = [
  { id: "name", title: { en: "Brand Name", kh: "ឈ្មោះ Brand" } },
  { id: "logo", title: { en: "Logo", kh: "និមិត្តសញ្ញា" } },
  { id: "color", title: { en: "Color Palette", kh: "ពណ៌" } },
  { id: "type", title: { en: "Typography", kh: "អក្សរ" } },
  { id: "dna", title: { en: "Design DNA", kh: "Design DNA" } },
  { id: "kit", title: { en: "Design Kit", kh: "ឧបករណ៍រចនា" } },
  { id: "ranks", title: { en: "Player Ranks & Badges", kh: "កម្រិត និងផ្លាកសញ្ញា" } },
  { id: "apply", title: { en: "Applications", kh: "ការប្រើប្រាស់" } },
  { id: "sitemap", title: { en: "Site Architecture", kh: "រចនាសម្ព័ន្ធគេហទំព័រ" } },
];

// Semantic body color + label text color for each road-sign shape.
const SHAPE_STYLE: Record<SignShapeName, { body: string; fg: string }> = {
  diamond: { body: "#eab308", fg: "text-black" },
  octagon: { body: "#ef4444", fg: "text-white" },
  circle: { body: "#3b82f6", fg: "text-white" },
  sign: { body: "#22c55e", fg: "text-black" },
  triangle: { body: "#f97316", fg: "text-black" },
  banner: { body: "#22c55e", fg: "text-white" },
};

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const [selectedRankId, setSelectedRankId] = useState<string>("gold");
  const [selectedDivision, setSelectedDivision] = useState<Division>("II");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" style={kf}>

      {/* Page Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("KWD Brand Guidelines", "អំពីម៉ាកយីហោ KWD")}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            {t(
              "Visual identity, design standards, and usage rules that define KWD — Kesararam With Digital.",
              "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ KWD — Kesararam With Digital"
            )}
          </p>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            {t(
              "v1.0 · Last updated June 2026 · Technovation Girls 2026 · Team #50777 · Siem Reap, Cambodia",
              "v1.0 · ធ្វើបច្ចុប្បន្នភាព មិថុនា ២០២៦ · Technovation Girls 2026 · ក្រុម #50777 · សៀមរាប"
            )}
          </p>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-16">

        {/* Sidebar Nav */}
        <aside className="hidden lg:block w-44 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`block text-sm py-1 transition-colors ${active === s.id
                  ? "text-zinc-900 dark:text-white font-semibold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
              >
                {t(s.title.en, s.title.kh)}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* Brand Name */}
          <section id="name" className="scroll-mt-24">
            <SectionHeading>{t("Brand Name & Meaning", "ឈ្មោះ Brand និងអត្ថន័យ")}</SectionHeading>
            <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {kh ? (
                <>
                  <p>KWD មានន័យថា Kesararam With Digital — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍របស់យើង។</p>
                  <p>ពាក្យ With ប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និងបច្ចេកវិទ្យា។ ឌីជីថល (Digital) ជាការប្ដេជ្ញាផ្ដល់នូវឱកាសចូលរៀន (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។</p>
                  <p>KWD ត្រូវបានបង្កើតឡើងដោយយុវតីខ្មែរ ក្រោមទស្សនវិស័យថា ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍គួរតែផ្ដល់ជូនដោយឥតគិតថ្លៃ មានអន្តរកម្ម និងងាយស្រួលចូលប្រើជាភាសាកំណើតរបស់សិស្ស។</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <strong className="text-zinc-700 dark:text-zinc-200">ការណែនាំ:</strong> ប្រើឈ្មោះពេញ «Kesararam With Digital» សម្រាប់ការណែនាំលើកដំបូង។ បន្ទាប់មកអាចប្រើ «KWD» បាន។
                  </p>
                </>
              ) : (
                <>
                  <p>KWD stands for <strong className="text-zinc-800 dark:text-zinc-100">Kesararam With Digital</strong> — a name carrying the weight of place, purpose, and transformation. Kesararam is the name of the monastery and primary school — the oldest seat of learning in our community.</p>
                  <p>The word "With" declares a partnership between tradition and technology. "Digital" is a commitment to access, reach, and permanence.</p>
                  <p>KWD was created by young Cambodian women from Kesararam Primary School with the vision that road safety education should be free, interactive, and accessible in students' native language.</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <strong className="text-zinc-700 dark:text-zinc-200">Recommendation:</strong> Use the full name "Kesararam With Digital" on first reference in press, presentations, and official documents. "KWD" may be used after.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* Logo */}
          <section id="logo" className="scroll-mt-24">
            <SectionHeading>{t("Logo & Meaning", "និមិត្តសញ្ញា និងអត្ថន័យ")}</SectionHeading>
            <div className="space-y-8 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>
                {kh
                  ? "និមិត្តសញ្ញាផ្លេកបន្ទោរលើឡូហ្គោ KWD មិនមែនជាការតុបតែង តែជាទស្សនវិជ្ជាស្នូលរបស់ម៉ាក — Flash Learning ឈរលើជំនឿថា ក្នុងយុគ AI ចំណេះដឹងត្រូវដើរក្នុងល្បឿននៃពន្លឺ។"
                  : "The lightning bolt on the KWD logo is not ornamental — it is the core philosophy of the brand. It represents Flash Learning: in the age of AI, knowledge must move at the speed of light."}
              </p>

              {/* Logo Variants */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {LOGO_VARIANTS.map((v, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className={`${v.bg} border border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-4 aspect-square`}>
                      <Image
                        src={v.src}
                        alt={v.label.en}
                        width={72}
                        height={72}
                        className={`object-contain ${v.invert ? "invert" : ""}`}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 break-all">{v.filename}</p>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t(v.label.en, v.label.kh)}</p>
                  </div>
                ))}
              </div>

              {/* Rules */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  {t("Usage Rules", "ច្បាប់ប្រើប្រាស់")}
                </p>
                <ul className="space-y-2">
                  {RULES.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="shrink-0 text-zinc-300 dark:text-zinc-600 select-none">—</span>
                      <span>{t(r.en, r.kh)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Color Palette */}
          <section id="color" className="scroll-mt-24">
            <SectionHeading>{t("Color Palette", "ពណ៌")}</SectionHeading>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800">
              {COLORS.map(({ name, hex, role }) => (
                <div key={hex} className="flex items-center gap-4 py-3">
                  <div
                    className="w-8 h-8 shrink-0 border border-zinc-200 dark:border-zinc-700"
                    style={{ background: hex }}
                  />
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 w-28 shrink-0">{name}</span>
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 w-20 shrink-0">{hex}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug">{t(role.en, role.kh)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section id="type" className="scroll-mt-24">
            <SectionHeading>{t("Typography", "អក្សរ")}</SectionHeading>
            <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800">
                {[
                  { label: t("Khmer", "ខ្មែរ"), value: "Google Sans Khmer" },
                  { label: t("English", "អង់គ្លេស"), value: "Roboto" },
                  { label: t("Labels", "ស្លាក"), value: t("UPPERCASE · letter-spacing · Bold/Black weight", "UPPERCASE · letter-spacing · Bold/Black") },
                ].map((row) => (
                  <div key={row.label} className="flex gap-6 py-3">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 w-20 shrink-0 pt-0.5">{row.label}</span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Type Specimen */}
              <div className="space-y-4 pt-2">
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 mb-1">Display · 36px · Black</p>
                  <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">KWD</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 mb-1">Heading · 20px · Bold</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">Brand Guidelines</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-zinc-400 mb-1">Body · 14px · Regular</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Education should be free, interactive, and accessible.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Design DNA */}
          <section id="dna" className="scroll-mt-24">
            <SectionHeading>{t("Design DNA — Brutalist", "ប្រព័ន្ធរចនា DNA — Brutalist")}</SectionHeading>
            <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800">
                {(kh ? [
                  ["Border radius", "0 — មុំទាំងអស់ស្រួច (90°)"],
                  ["Border", "2–3px ខ្មៅ #000 លើ cards ប៊ូតុង inputs"],
                  ["Box shadow", "3–4px offset solid #000"],
                  ["Accent stripe", "លឿង #eab308 / ខ្មៅ"],
                  ["Active state", "ផ្ទៃលឿង #eab308 · អក្សរខ្មៅ #000"],
                  ["Spacing scale", "4 · 8 · 12 · 16 · 20 · 24 px"],
                ] : [
                  ["Border radius", "0 — all corners sharp (90°)"],
                  ["Border", "2–3px solid #000 on cards, buttons, inputs"],
                  ["Box shadow", "3–4px offset solid shadow (#000)"],
                  ["Accent stripe", "Yellow #eab308 / black caution pattern"],
                  ["Active state", "Yellow background #eab308 · black text #000"],
                  ["Spacing scale", "4 · 8 · 12 · 16 · 20 · 24 px"],
                ]).map(([prop, val]) => (
                  <div key={prop} className="flex gap-6 py-3">
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 w-28 shrink-0 pt-0.5">{prop}</span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Design Kit — Shapes, Tape & Icons */}
          <section id="kit" className="scroll-mt-24">
            <SectionHeading>{t("Design Kit — Shapes, Tape & Icons", "ឧបករណ៍រចនា — រូបរាង, ខ្សែបូ និងរូបតំណាង")}</SectionHeading>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-2xl">
              {t(
                "Reusable road-sign shapes and caution-tape patterns. All pure vector (SVG) — they stay crisp at any size, from a 16px icon to a 4K slide. Flat brutalist: solid black border, no shadow, no gradients, no neon. Khmer text everywhere uses Google Sans.",
                "រូបរាងផ្លាកសញ្ញាចរាចរណ៍ និងខ្សែបូព្រមាន ដែលអាចប្រើឡើងវិញ។ ទាំងអស់ជា Vector (SVG) — ច្បាស់គ្រប់ទំហំ ចាប់ពីរូបតំណាង 16px ដល់ស្លាយ 4K។ រចនាបែបរាបស្មើ៖ គែមខ្មៅ គ្មានស្រមោល គ្មាន gradient គ្មាន neon។ អក្សរខ្មែរគ្រប់ទីកន្លែងប្រើប្រាស់ Google Sans។"
              )}
            </p>

            {/* Shapes */}
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              {t("Shapes", "រូបរាង")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-12">
              {SHAPES.map((s) => {
                const st = SHAPE_STYLE[s.shape];
                return (
                  <div
                    key={s.shape}
                    className="flex flex-col items-center text-center gap-3 border border-zinc-100 dark:border-zinc-800 p-5"
                  >
                    <SignShape shape={s.shape} body={st.body} size={84} shadow={false}>
                      <span className={`font-learning font-bold leading-tight text-center px-1 ${st.fg} ${s.shape === "triangle" ? "text-[11px]" : "text-sm"}`}>
                        {s.meaningKh}
                      </span>
                    </SignShape>
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                        {t(s.en, s.kh)}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        {t(s.meaningEn, s.meaningKh)}
                      </p>
                      <code className="mt-1 inline-block text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                        shape=&quot;{s.shape}&quot;
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Caution tape */}
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              {t("Caution Tape", "ខ្សែបូព្រមាន")}
            </p>
            <div className="space-y-5">
              {TAPES.map((tp) => (
                <div key={tp.variant} className="flex items-center gap-4">
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {t(tp.en, tp.kh)}
                    </p>
                    <code className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      variant=&quot;{tp.variant}&quot;
                    </code>
                  </div>
                  <div className="flex-1 border-2 border-black dark:border-zinc-700">
                    <CautionTape variant={tp.variant} height={28} />
                  </div>
                </div>
              ))}
            </div>

            {/* Usage note */}
            <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500 font-mono leading-relaxed">
              {t(
                'import { CautionTape, SignShape } from "@/components/brand/brand-kit"',
                'import { CautionTape, SignShape } from "@/components/brand/brand-kit"'
              )}
            </p>
          </section>

          {/* Ranks & Badges */}
          <section id="ranks" className="scroll-mt-24">
            <SectionHeading>{t("Player Ranks & Badges", "កម្រិត និងផ្លាកសញ្ញា")}</SectionHeading>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-2xl">
              {t(
                "KWD uses score-derived rank frames for learner profiles and leaderboard highlights. Players climb 6 avatar-border tiers and collect Roman numeral progress divisions (IV to I) from lifetime points. Select a tier below to view its design and details.",
                "KWD ប្រើស៊ុមកម្រិតដែលគណនាពីពិន្ទុសម្រាប់ប្រវត្តិរូបសិស្ស និងការបង្ហាញលំដាប់។ អ្នកលេងអាចឡើងតាមកម្រិតស៊ុមរូបតំណាង ៦ និងប្រមូលផ្នែករ៉ូម៉ាំង (IV ដល់ I) ពីពិន្ទុសរុប។ ជ្រើសរើសកម្រិតខាងក្រោមដើម្បីមើលរូបរាង និងព័ត៌មានលម្អិត។"
              )}
            </p>

            {/* Interactive Showcase Filter */}
            {(() => {
              const DIVISION_ORDER: Division[] = ["IV", "III", "II", "I"];
              const selectedRankConfig = RANK_CONFIGS.find((r) => r.id === selectedRankId) || RANK_CONFIGS[2];

              // Calculate preview score
              const index = DIVISION_ORDER.indexOf(selectedDivision);
              let previewScore = selectedRankConfig.minPoints;
              if (selectedRankConfig.divisionThresholds) {
                previewScore = selectedRankConfig.divisionThresholds[index];
              } else {
                const nextTier = RANK_CONFIGS[RANK_CONFIGS.findIndex((item) => item.id === selectedRankConfig.id) + 1];
                if (!nextTier) {
                  previewScore = selectedRankConfig.minPoints + (index * 500); // mythic step fallback
                } else {
                  const step = (nextTier.minPoints - selectedRankConfig.minPoints) / DIVISION_ORDER.length;
                  previewScore = Math.floor(selectedRankConfig.minPoints + step * index);
                }
              }

              return (
                <div className="space-y-6 max-w-3xl">
                  {/* Horizontal Tabs selector */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0_#000] dark:shadow-none mb-6 overflow-hidden">
                    {RANK_CONFIGS.map((tier) => {
                      const isActive = selectedRankId === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={() => {
                            setSelectedRankId(tier.id);
                          }}
                          className={`py-3 text-xs font-black uppercase tracking-wider text-center border-b border-r border-black dark:border-zinc-800 sm:border-b-0 last:border-r-0 transition-colors ${
                            isActive
                              ? "bg-yellow-500 text-black font-black"
                              : "bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {tier.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Showcase Details + Preview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 border-2 border-black dark:border-zinc-800 p-5 bg-zinc-50 dark:bg-zinc-900 shadow-[4px_4px_0_#000] dark:shadow-none">
                    {/* Centered Preview container */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-full aspect-square max-w-[200px] border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-950 p-6 mb-4 overflow-hidden">
                        {/* Grid decorative lines in background */}
                        <div className="absolute inset-0 opacity-15" style={{
                          backgroundImage: "linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)",
                          backgroundSize: "20px 20px"
                        }} />
                        <AvatarBorder
                          score={previewScore}
                          username="brand_preview"
                          alt={`${selectedRankConfig.name} Showcase Preview`}
                          size="lg"
                          animated={true}
                          showPoints={false}
                        />
                      </div>

                      {/* Division buttons */}
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        {t("Division", "ផ្នែក")}
                      </label>
                      <div className="flex border-2 border-black dark:border-zinc-700 w-full max-w-[200px] overflow-hidden shadow-[2px_2px_0_#000] dark:shadow-none">
                        {DIVISION_ORDER.map((div) => (
                          <button
                            key={div}
                            onClick={() => setSelectedDivision(div)}
                            className={`flex-1 py-1.5 font-mono text-xs font-black transition-colors border-r border-black dark:border-zinc-700 last:border-r-0 ${
                              selectedDivision === div
                                ? "bg-yellow-500 text-black"
                                : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {div}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right side Detail Panel */}
                    <div className="flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                            {selectedRankConfig.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 border border-black dark:border-zinc-700 text-[10px] font-black uppercase tracking-wider text-black bg-yellow-500 shadow-[1px_1px_0_#000] dark:shadow-none"
                          >
                            {selectedRankConfig.minPoints === 0 ? t("Start Tier", "កម្រិតចាប់ផ្តើម") : `${selectedRankConfig.minPoints.toLocaleString()} PTS`}
                          </span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wide mt-1.5" style={{ color: selectedRankConfig.accentColor }}>
                          {selectedRankConfig.safetyTheme}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">
                          {selectedRankConfig.description}
                        </p>
                      </div>

                      {/* Detail Table */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-xs">
                        <div className="border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-800/50 p-2.5">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t("Accents & Theme", "លក្ខណៈពិសេស")}</p>
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-1 uppercase">
                            {selectedRankConfig.id === "rookie" && t("Caution Cone / Start", "កោណចរាចរណ៍ / ចាប់ផ្តើម")}
                            {selectedRankConfig.id === "rising" && t("Go Green / Speed Chevrons", "សញ្ញាព្រួញល្បឿន / ពណ៌បៃតង")}
                            {selectedRankConfig.id === "gold" && t("Road Warning Diamonds", "សញ្ញាព្រមានជ្រុង / មាស")}
                            {selectedRankConfig.id === "platinum" && t("Official Blue / Traffic Capsule", "សញ្ញាព័ត៌មាន / ប្លាទីន")}
                            {selectedRankConfig.id === "diamond" && t("Strobe Beacon / Diamond Gems", "កញ្ចក់ពេជ្រ / ភ្លើងប៉ូលីស")}
                            {selectedRankConfig.id === "mythic" && t("Elite Crown / Lightning Bolts", "មកុដ / ផ្លេកបន្ទោរពណ៌មាស")}
                          </p>
                        </div>
                        <div className="border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-800/50 p-2.5">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t("Border Style", "ម៉ូដគែម")}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="w-3.5 h-3.5 border border-black dark:border-zinc-700 inline-block" style={{ backgroundColor: selectedRankConfig.primaryColor }} title="Primary" />
                            <span className="w-3.5 h-3.5 border border-black dark:border-zinc-700 inline-block" style={{ backgroundColor: selectedRankConfig.secondaryColor }} title="Secondary" />
                            <span className="w-3.5 h-3.5 border border-black dark:border-zinc-700 inline-block" style={{ backgroundColor: selectedRankConfig.accentColor }} title="Accent" />
                            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 ml-1">{selectedRankConfig.primaryColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Applications */}
          <section id="apply" className="scroll-mt-24">
            <SectionHeading>{t("Applications & Mockups", "ការប្រើប្រាស់ & Mockups")}</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {MOCKUP_ASSETS.map((m, i) => (
                <div key={i}>
                  <div className="aspect-[4/3] relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <Image
                      src={m.src}
                      alt={m.title.en}
                      fill
                      unoptimized
                      className="object-cover select-none pointer-events-none"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider">
                    {t(`Mockup ${i + 1}`, `គំរូ ${i + 1}`)}
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {t(m.title.en, m.title.kh)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Sitemap */}
          <section id="sitemap" className="scroll-mt-24">
            <SectionHeading>{t("Site Architecture", "រចនាសម្ព័ន្ធគេហទំព័រ")}</SectionHeading>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-2xl">
              {t(
                "Explore the full public page structure in the interactive HUD-style sitemap.",
                "ស្វែងយល់ពីរចនាសម្ព័ន្ធទំព័រសាធារណៈទាំងមូលនៅក្នុងផែនទីគេហទំព័របែប HUD អន្តរកម្ម។"
              )}
            </p>
            <Link
              href="/sitemap"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 border-black dark:border-white px-4 py-2.5 bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              <LayoutGrid size={16} strokeWidth={2.5} aria-hidden="true" />
              {t("View Sitemap", "មើលផែនទីគេហទំព័រ")}
            </Link>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <span>© {new Date().getFullYear()} Kesararam With Digital · kesararamwithdigital.tech</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t("Terms", "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
      {children}
    </h2>
  );
}
