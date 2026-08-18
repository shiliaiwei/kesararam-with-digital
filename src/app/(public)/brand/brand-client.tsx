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
  { id: "scoring", title: { en: "Game Scoring Engine", kh: "ប្រព័ន្ធគណនាពិន្ទុនៃសកម្មភាព" } },
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
  const [centerStyle, setCenterStyle] = useState<"photo" | "initials">("initials");

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
            {t("Kesararam With Digital Brand Guidelines", "អំពីម៉ាកយីហោ Kesararam With Digital")}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            {t(
              "Visual identity, design standards, and usage rules that define Kesararam With Digital — Kesararam With Digital.",
              "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ Kesararam With Digital — Kesararam With Digital"
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
                  <p>Kesararam With Digital មានន័យថា Kesararam With Digital — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍របស់យើង។</p>
                  <p>ពាក្យ With ប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និងបច្ចេកវិទ្យា។ ឌីជីថល (Digital) ជាការប្ដេជ្ញាផ្ដល់នូវឱកាសចូលរៀន (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។</p>
                  <p>Kesararam With Digital ត្រូវបានបង្កើតឡើងដោយយុវតីខ្មែរ ក្រោមទស្សនវិស័យថា ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍គួរតែផ្ដល់ជូនដោយឥតគិតថ្លៃ មានអន្តរកម្ម និងងាយស្រួលចូលប្រើជាភាសាកំណើតរបស់សិស្ស។</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <strong className="text-zinc-700 dark:text-zinc-200">ការណែនាំ:</strong> ប្រើឈ្មោះពេញ «Kesararam With Digital» សម្រាប់ការណែនាំលើកដំបូង។ បន្ទាប់មកអាចប្រើ «Kesararam With Digital» បាន។
                  </p>
                </>
              ) : (
                <>
                  <p>Kesararam With Digital stands for <strong className="text-zinc-800 dark:text-zinc-100">Kesararam With Digital</strong> — a name carrying the weight of place, purpose, and transformation. Kesararam is the name of the monastery and primary school — the oldest seat of learning in our community.</p>
                  <p>The word "With" declares a partnership between tradition and technology. "Digital" is a commitment to access, reach, and permanence.</p>
                  <p>Kesararam With Digital was created by young Cambodian women from Kesararam Primary School with the vision that road safety education should be free, interactive, and accessible in students' native language.</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <strong className="text-zinc-700 dark:text-zinc-200">Recommendation:</strong> Use the full name "Kesararam With Digital" on first reference in press, presentations, and official documents. "Kesararam With Digital" may be used after.
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
                  ? "និមិត្តសញ្ញាផ្លេកបន្ទោរលើឡូហ្គោ Kesararam With Digital មិនមែនជាការតុបតែង តែជាទស្សនវិជ្ជាស្នូលរបស់ម៉ាក — Flash Learning ឈរលើជំនឿថា ក្នុងយុគ AI ចំណេះដឹងត្រូវដើរក្នុងល្បឿននៃពន្លឺ។"
                  : "The lightning bolt on the Kesararam With Digital logo is not ornamental — it is the core philosophy of the brand. It represents Flash Learning: in the age of AI, knowledge must move at the speed of light."}
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
                  <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Kesararam With Digital</p>
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
                "Kesararam With Digital uses score-derived rank frames for learner profiles and leaderboard highlights. Players climb 6 avatar-border tiers and collect Roman numeral progress divisions (IV to I) from lifetime points. Select a tier below to view its design and details.",
                "Kesararam With Digital ប្រើស៊ុមកម្រិតដែលគណនាពីពិន្ទុសម្រាប់ប្រវត្តិរូបសិស្ស និងការបង្ហាញលំដាប់។ អ្នកលេងអាចឡើងតាមកម្រិតស៊ុមរូបតំណាង ៦ និងប្រមូលផ្នែករ៉ូម៉ាំង (IV ដល់ I) ពីពិន្ទុសរុប។ ជ្រើសរើសកម្រិតខាងក្រោមដើម្បីមើលរូបរាង និងព័ត៌មានលម្អិត។"
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
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 border-2 border-black dark:border-zinc-800 p-5 bg-zinc-50 dark:bg-zinc-900 shadow-[4px_4px_0_#000] dark:shadow-none">
                    {/* Centered Preview container */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-full min-h-[280px] aspect-square max-w-[280px] border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-950 p-4 mb-4">
                        {/* Grid decorative lines in background */}
                        <div className="absolute inset-0 opacity-15" style={{
                          backgroundImage: "linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)",
                          backgroundSize: "20px 20px"
                        }} />
                        <AvatarBorder
                          score={previewScore}
                          username={selectedRankConfig.name}
                          src={centerStyle === "photo" ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" : null}
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
                      <div className="flex border-2 border-black dark:border-zinc-700 w-full max-w-[200px] overflow-hidden shadow-[2px_2px_0_#000] dark:shadow-none mb-3">
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

                      {/* Center Option Toggle */}
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                        {t("Center Option", "ជម្រើសកណ្តាល")}
                      </label>
                      <div className="flex border-2 border-black dark:border-zinc-700 w-full max-w-[200px] overflow-hidden shadow-[2px_2px_0_#000] dark:shadow-none">
                        <button
                          onClick={() => setCenterStyle("photo")}
                          className={`flex-1 py-1.5 font-mono text-xs font-black transition-colors border-r border-black dark:border-zinc-700 last:border-r-0 ${
                            centerStyle === "photo"
                              ? "bg-yellow-500 text-black"
                              : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {t("Photo", "រូបថត")}
                        </button>
                        <button
                          onClick={() => setCenterStyle("initials")}
                          className={`flex-1 py-1.5 font-mono text-xs font-black transition-colors border-r border-black dark:border-zinc-700 last:border-r-0 ${
                            centerStyle === "initials"
                              ? "bg-yellow-500 text-black"
                              : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {t("Initials", "អក្សរ")}
                        </button>
                      </div>
                    </div>

                    {/* Right side Detail Panel */}
                    <div className="flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                            {selectedRankConfig.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 border border-black dark:border-zinc-700 text-[10px] font-black uppercase tracking-wider text-black bg-yellow-500 shadow-[1px_1px_0_#000] dark:shadow-none"
                          >
                            {(() => {
                              switch (selectedRankConfig.id) {
                                case "rookie": return "0 - 999 PTS";
                                case "rising": return "1,000 - 2,499 PTS";
                                case "gold": return "2,500 - 3,499 PTS";
                                case "platinum": return "3,500 - 6,999 PTS";
                                case "diamond": return "7,000 - 11,999 PTS";
                                case "mythic": return "12,000+ PTS";
                                default: return "";
                              }
                            })()}
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

                  {/* Point thresholds & division ranges table */}
                  <div className="mt-8 border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-6">
                    <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                      {t("Point Thresholds & Division Ranges", "ដែនកំណត់ពិន្ទុ និងជួរផ្នែក")}
                    </h4>
                    <div className="overflow-x-auto border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0_#000] dark:shadow-none bg-white dark:bg-zinc-900">
                      <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                        <thead>
                          <tr className="bg-zinc-100 dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-800">
                            <th className="p-2.5 font-black uppercase tracking-wider border-r-2 border-black dark:border-zinc-800">{t("Rank", "កម្រិត")}</th>
                            <th className="p-2.5 font-black uppercase tracking-wider border-r-2 border-black dark:border-zinc-800">{t("Tier Min", "ពិន្ទុអប្បបរមា")}</th>
                            <th className="p-2.5 font-black uppercase tracking-wider border-r border-black dark:border-zinc-800">{t("Division", "ផ្នែក")}</th>
                            <th className="p-2.5 font-black uppercase tracking-wider">{t("Points Range", "ចន្លោះពិន្ទុ")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Rookie */}
                          <tr>
                            <td rowSpan={4} className="p-2.5 font-black border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">ROOKIE</td>
                            <td rowSpan={4} className="p-2.5 font-mono border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">0</td>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">IV</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">0 – 249</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">III</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">250 – 499</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">II</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">500 – 749</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b-2 border-black dark:border-zinc-800 font-mono font-bold">I</td>
                            <td className="p-2 border-b-2 border-black dark:border-zinc-800 font-mono">750 – 999</td>
                          </tr>

                          {/* Rising */}
                          <tr>
                            <td rowSpan={4} className="p-2.5 font-black border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">RISING</td>
                            <td rowSpan={4} className="p-2.5 font-mono border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">1,000</td>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">IV</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">1,000 – 1,374</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">III</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">1,375 – 1,749</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">II</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">1,750 – 2,124</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b-2 border-black dark:border-zinc-800 font-mono font-bold">I</td>
                            <td className="p-2 border-b-2 border-black dark:border-zinc-800 font-mono">2,125 – 2,499</td>
                          </tr>

                          {/* Gold */}
                          <tr>
                            <td rowSpan={4} className="p-2.5 font-black border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">GOLD</td>
                            <td rowSpan={4} className="p-2.5 font-mono border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">2,500</td>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">IV</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">2,500 – 2,749</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">III</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">2,750 – 2,999</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">II</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">3,000 – 3,249</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b-2 border-black dark:border-zinc-800 font-mono font-bold">I</td>
                            <td className="p-2 border-b-2 border-black dark:border-zinc-800 font-mono">3,250 – 3,499</td>
                          </tr>

                          {/* Platinum */}
                          <tr>
                            <td rowSpan={4} className="p-2.5 font-black border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">PLATINUM</td>
                            <td rowSpan={4} className="p-2.5 font-mono border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">3,500</td>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">IV</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">3,500 – 4,374</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">III</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">4,375 – 5,249</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">II</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">5,250 – 6,124</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b-2 border-black dark:border-zinc-800 font-mono font-bold">I</td>
                            <td className="p-2 border-b-2 border-black dark:border-zinc-800 font-mono">6,125 – 6,999</td>
                          </tr>

                          {/* Diamond */}
                          <tr>
                            <td rowSpan={4} className="p-2.5 font-black border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">DIAMOND</td>
                            <td rowSpan={4} className="p-2.5 font-mono border-r-2 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">7,000</td>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">IV</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">7,000 – 8,249</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">III</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">8,250 – 9,499</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">II</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">9,500 – 10,749</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b-2 border-black dark:border-zinc-800 font-mono font-bold">I</td>
                            <td className="p-2 border-b-2 border-black dark:border-zinc-800 font-mono">10,750 – 11,999</td>
                          </tr>

                          {/* Mythic */}
                          <tr>
                            <td rowSpan={4} className="p-2.5 font-black border-r-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">MYTHIC</td>
                            <td rowSpan={4} className="p-2.5 font-mono border-r-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">12,000</td>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">IV</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">12,000 – 14,999</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">III</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">15,000 – 19,999</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-b border-black dark:border-zinc-800 font-mono font-bold">II</td>
                            <td className="p-2 border-b border-black dark:border-zinc-800 font-mono">20,000 – 29,999</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-black dark:border-zinc-800 font-mono font-bold">I</td>
                            <td className="p-2 font-mono">30,000+</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Notes & Frame Styles Info */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="border-2 border-black dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/20 shadow-[2px_2px_0_#000] dark:shadow-none">
                        <span className="font-black block text-zinc-800 dark:text-zinc-200 mb-1.5 uppercase tracking-wide">
                          {t("Notes", "ចំណាំ")}
                        </span>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>{t("Rookie to Diamond divisions are even quarters of each tier's range.", "កម្រិត Rookie ដល់ Diamond ត្រូវបានបែងចែកជា ៤ ផ្នែកស្មើៗគ្នា នៃចន្លោះពិន្ទុនីមួយៗ។")}</li>
                          <li>{t("Mythic divisions are open-ended and uneven (Mythic I caps at 30,000+ points).", "ផ្នែកសម្រាប់កម្រិត Mythic មិនស្មើគ្នាទេ (Mythic I កំណត់ចាប់ពី ៣០,០០០ ឡើងទៅ)។")}</li>
                          <li>{t("Score Migration: A multiplier of ×10 is applied from legacy scores.", "ការផ្ទេរពិន្ទុ៖ ពិន្ទុចាស់នឹងត្រូវគុណនឹង ១០ ដើម្បីផ្ទេរមកពិន្ទុបច្ចុប្បន្ន។")}</li>
                        </ul>
                      </div>

                      <div className="border-2 border-black dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/20 shadow-[2px_2px_0_#000] dark:shadow-none">
                        <span className="font-black block text-zinc-800 dark:text-zinc-200 mb-1.5 uppercase tracking-wide">
                          {t("Frame Style (Per-Rank Brutalist Road-Sign)", "រចនាប័ទ្មស៊ុម (ផ្លាកសញ្ញាចរាចរណ៍តាមកម្រិត)")}
                        </span>
                        <ul className="space-y-1">
                          <li><strong>{t("ROOKIE", "ROOKIE")}:</strong> {t("Black/white road-marker square", "ស៊ុមការ៉េខ្មៅសញ្ញាផ្លូវ")}</li>
                          <li><strong>{t("RISING", "RISING")}:</strong> {t("Green speed chevrons road-marker square", "ស៊ុមការ៉េបៃតងសញ្ញាព្រួញល្បឿន")}</li>
                          <li><strong>{t("GOLD", "GOLD")}:</strong> {t("Yellow warning diamond sign", "ស៊ុមរាងការ៉េទ្រេតពណ៌លឿងព្រមាន")}</li>
                          <li><strong>{t("PLATINUM", "PLATINUM")}:</strong> {t("Blue info shield/capsule sign", "ស៊ុមរាងដបពណ៌ខៀវព័ត៌មាន")}</li>
                          <li><strong>{t("DIAMOND", "DIAMOND")}:</strong> {t("Blue diamond crystal beacon", "ស៊ុមរាងកញ្ចក់ពេជ្រពណ៌ខៀវលេចធ្លោ")}</li>
                          <li><strong>{t("MYTHIC", "MYTHIC")}:</strong> {t("Purple elite crown crest with gold accents & sirens", "ស៊ុមមកុដពណ៌ស្វាយអភិជន អមដោយផ្លេកបន្ទោរមាស និងស៊ីរ៉ែន")}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Game Scoring Engine */}
          <section id="scoring" className="scroll-mt-24 space-y-6">
            <SectionHeading>{t("Game Scoring Engine", "ប្រព័ន្ធគណនាពិន្ទុនៃសកម្មភាព")}</SectionHeading>
            <div className="bg-white dark:bg-zinc-950 border-2 border-black p-6 shadow-[4px_4px_0_#000]" style={{ borderRadius: 0 }}>
              <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 font-medium">
                {t(
                  "Kesararam With Digital uses a unified, low-point scoring engine across all games and challenges to maintain progression scarcity and reward consistency. Speed bonuses are fully disabled; points are purely derived from accuracy and consecutive streaks.",
                  "Kesararam With Digital ប្រើប្រាស់ប្រព័ន្ធគណនាពិន្ទុរួមមួយដែលមានតម្លៃពិន្ទុទាបសម្រាប់គ្រប់សកម្មភាព និងការប្រកួត ដើម្បីរក្សាភាពកម្រនៃពិន្ទុ និងភាពស៊ីសង្វាក់គ្នានៃរង្វាន់។ ពិន្ទុបន្ថែមផ្អែកលើល្បឿនត្រូវបានបិទទាំងស្រុង ដោយពិន្ទុត្រូវបានគណនាផ្អែកលើភាពត្រឹមត្រូវ និងការលេងត្រូវជាប់ៗគ្នា (Streak)។"
                )}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
                {/* Core Scorer Formulas */}
                <div className="space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-yellow-400 border border-black inline-block" />
                    {t("Core Scorer Formula", "រូបមន្តគណនាពិន្ទុស្នូល")}
                  </h3>
                  
                  <div className="border-2 border-black bg-zinc-50 dark:bg-zinc-900/50 p-4 font-mono text-xs space-y-3 text-black dark:text-zinc-300">
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">baseScore</span> = isCorrect ? 1 : 0
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {t("+1 point for every correct answer.", "+១ ពិន្ទុរាល់ពេលឆ្លើយត្រូវ។")}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-purple-600 dark:text-purple-400">streakBonus</span> = isCorrect && currentCorrectStreak &gt;= 2 ? 1 : 0
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {t("+1 point for runs starting from the 3rd consecutive correct answer.", "+១ ពិន្ទុបន្ថែមសម្រាប់ការឆ្លើយត្រូវជាប់គ្នាចាប់ពីលើកទី៣ ឡើងទៅ។")}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-green-600 dark:text-green-400">questionScore</span> = baseScore + streakBonus
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {t("Each question yields exactly 0, 1, or 2 points.", "រាល់សំណួរទទួលបានពិន្ទុយ៉ាងពិតប្រាកដ ០, ១, ឬ ២ ពិន្ទុ។")}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <span className="font-bold text-red-600">wrongAnswer</span> = streak resets to 0
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {t("A wrong answer immediately cuts the streak.", "ឆ្លើយខុសនឹងកំណត់ Streak ឡើងវិញមកសូន្យភ្លាមៗ។")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clean Run Sequence */}
                <div className="space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-400 border border-black inline-block" />
                    {t("Clean Run Sequence", "លំដាប់ពិន្ទុនៃការឆ្លើយត្រូវជាប់គ្នា")}
                  </h3>

                  <div className="border-2 border-black overflow-hidden bg-white dark:bg-zinc-900">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="bg-black text-white border-b-2 border-black">
                          <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("Correct In A Row", "ឆ្លើយត្រូវជាប់គ្នា")}</th>
                          <th className="p-2.5 font-black uppercase tracking-wider">{t("Points Awarded", "ពិន្ទុទទួលបាន")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-mono">
                        <tr className="divide-x divide-black">
                          <td className="p-2">1</td>
                          <td className="p-2 font-bold">1</td>
                        </tr>
                        <tr className="divide-x divide-black">
                          <td className="p-2">2</td>
                          <td className="p-2 font-bold">1</td>
                        </tr>
                        <tr className="divide-x divide-black">
                          <td className="p-2">3</td>
                          <td className="p-2 font-bold text-green-600 dark:text-green-400">2 (1 + 1 streak)</td>
                        </tr>
                        <tr className="divide-x divide-black">
                          <td className="p-2">4</td>
                          <td className="p-2 font-bold text-green-600 dark:text-green-400">2 (1 + 1 streak)</td>
                        </tr>
                        <tr className="divide-x divide-black">
                          <td className="p-2">5+</td>
                          <td className="p-2 font-bold text-green-600 dark:text-green-400">2 (1 + 1 streak)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-zinc-500 font-medium">
                    {t(
                      "An all-correct run of N questions (for N >= 2) yields a max score of 2N - 2. For example, a 40-question session has a maximum possible score of 78 points.",
                      "ការឆ្លើយត្រូវទាំងអស់ចំនួន N សំណួរ (សម្រាប់ N >= ២) ទទួលបានពិន្ទុអតិបរមា ២N - ២។ ឧទាហរណ៍៖ ការឆ្លើយត្រូវទាំង ៤០ សំណួរ ទទួលបានពិន្ទុអតិបរមា ៧៨ ពិន្ទុ។"
                    )}
                  </p>
                </div>
              </div>

              {/* Game Applicability */}
              <div className="mt-6 pt-6 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                <h3 className="font-black text-sm uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue-400 border border-black inline-block" />
                  {t("Applies to All Game Types", "អនុវត្តចំពោះគ្រប់សកម្មភាព")}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {t(
                    "This exact scoring algorithm is used across all play activities. Multi-item games evaluate pairs or actions as the unit of scoring, threading the streak across the entire play session:",
                    "រូបមន្តគណនាពិន្ទុនេះត្រូវបានប្រើប្រាស់ចំពោះគ្រប់ប្រភេទសកម្មភាព។ ហ្គេមដែលមានការផ្គូផ្គងច្រើន ឬសកម្មភាពច្រើន ត្រូវបានរាប់គូ ឬសកម្មភាពជានិមួយៗនៃការពិន្ទុ ដោយ Streak ត្រូវបានតភ្ជាប់ទូទាំងការលេងរបស់សកម្មភាពទាំងមូល៖"
                  )}
                </p>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {[
                    { en: "Live Class Games", kh: "សកម្មភាពថ្នាក់រៀនផ្ទាល់" },
                    { en: "Solo Practice", kh: "ការហាត់លេងម្នាក់ឯង" },
                    { en: "Daily Challenge", kh: "ការប្រកួតប្រចាំថ្ងៃ" },
                    { en: "Sign Match", kh: "សកម្មភាពផ្គូផ្គងសញ្ញា" },
                    { en: "Catch the Sign", kh: "សកម្មភាពចាប់សញ្ញា" },
                    { en: "Traffic Light Hero", kh: "បញ្ញាបរភ្លើងចរាចរណ៍" },
                    { en: "Road Safety Adventure", kh: "ដំណើរស្វែងយល់សុវត្ថិភាពចរាចរណ៍" },
                    { en: "Connect the Signs", kh: "សកម្មភាពភ្ជាប់សញ្ញា" },
                    { en: "Word Bank", kh: "ឃ្លាំងពាក្យ" },
                    { en: "Tick the Sign", kh: "សកម្មភាពជ្រើសរើសសញ្ញា" },
                    { en: "Traffic Commander", kh: "បញ្ជាចរាចរណ៍" }
                  ].map((game, idx) => (
                    <span key={idx} className="border border-black dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-300">
                      {t(game.en, game.kh)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Example Play Scenario */}
              <div className="mt-6 pt-6 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-purple-400 border border-black inline-block" />
                  {t("Step-by-Step Example Scenario", "ឧទាហរណ៍ស្ថានភាពជាក់ស្តែងមួយជំហានម្តងៗ")}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {t(
                    "Here is a step-by-step 10-question sequence showing how the streak threads through a play session, demonstrating when the streak bonus activates and resets:",
                    "ខាងក្រោមនេះជាលំដាប់លំដោយនៃសំណួរទាំង ១០ ជំហានម្តងៗ ដែលបង្ហាញពីរបៀបដែល Streak ត្រូវបានតភ្ជាប់ក្នុងវគ្គលេង ដោយបង្ហាញពីពេលដែលពិន្ទុបន្ថែម Streak ត្រូវបានផ្តល់ឱ្យ ឬកំណត់ឡើងវិញ៖"
                  )}
                </p>

                <div className="border-2 border-black overflow-hidden bg-white dark:bg-zinc-900 overflow-x-auto">
                  <table className="w-full text-[11px] md:text-xs text-center border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-black text-white border-b-2 border-black">
                        <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("Q#", "សំណួរ #")}</th>
                        <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("Outcome", "លទ្ធផល")}</th>
                        <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("Prior Streak", "Streak មុន")}</th>
                        <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("Base Score", "ពិន្ទុមូលដ្ឋាន")}</th>
                        <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("Streak Bonus", "ពិន្ទុបន្ថែម Streak")}</th>
                        <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("Points Awarded", "ពិន្ទុទទួលបាន")}</th>
                        <th className="p-2.5 font-black uppercase tracking-wider border-r border-black">{t("New Streak", "Streak ថ្មី")}</th>
                        <th className="p-2.5 font-black uppercase tracking-wider">{t("Session Score", "ពិន្ទុសរុប")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-mono text-black dark:text-zinc-300">
                      {/* Q1 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                        <td className="p-2">Q1</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">0</td>
                        <td className="p-2">1</td>
                        <td className="p-2">0</td>
                        <td className="p-2 font-bold">1</td>
                        <td className="p-2">1</td>
                        <td className="p-2 font-black bg-zinc-50 dark:bg-zinc-800/20">1</td>
                      </tr>
                      {/* Q2 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                        <td className="p-2">Q2</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">1</td>
                        <td className="p-2">1</td>
                        <td className="p-2">0</td>
                        <td className="p-2 font-bold">1</td>
                        <td className="p-2">2</td>
                        <td className="p-2 font-black bg-zinc-50 dark:bg-zinc-800/20">2</td>
                      </tr>
                      {/* Q3 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-purple-50/20 dark:bg-purple-950/10">
                        <td className="p-2">Q3</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">2</td>
                        <td className="p-2">1</td>
                        <td className="p-2 text-purple-600 dark:text-purple-400 font-bold">+1</td>
                        <td className="p-2 font-black text-purple-700 dark:text-purple-300">2</td>
                        <td className="p-2">3</td>
                        <td className="p-2 font-black bg-purple-50/40 dark:bg-purple-900/30">4</td>
                      </tr>
                      {/* Q4 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-red-50/20 dark:bg-red-950/10">
                        <td className="p-2">Q4</td>
                        <td className="p-2 font-bold text-red-600 dark:text-red-400">{t("Incorrect", "មិនត្រឹមត្រូវ")}</td>
                        <td className="p-2">3</td>
                        <td className="p-2">0</td>
                        <td className="p-2">0</td>
                        <td className="p-2 font-bold">0</td>
                        <td className="p-2 text-red-600 dark:text-red-400 font-bold">0</td>
                        <td className="p-2 font-black bg-zinc-50 dark:bg-zinc-800/20">4</td>
                      </tr>
                      {/* Q5 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                        <td className="p-2">Q5</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">0</td>
                        <td className="p-2">1</td>
                        <td className="p-2">0</td>
                        <td className="p-2 font-bold">1</td>
                        <td className="p-2">1</td>
                        <td className="p-2 font-black bg-zinc-50 dark:bg-zinc-800/20">5</td>
                      </tr>
                      {/* Q6 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                        <td className="p-2">Q6</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">1</td>
                        <td className="p-2">1</td>
                        <td className="p-2">0</td>
                        <td className="p-2 font-bold">1</td>
                        <td className="p-2">2</td>
                        <td className="p-2 font-black bg-zinc-50 dark:bg-zinc-800/20">6</td>
                      </tr>
                      {/* Q7 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-purple-50/20 dark:bg-purple-950/10">
                        <td className="p-2">Q7</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">2</td>
                        <td className="p-2">1</td>
                        <td className="p-2 text-purple-600 dark:text-purple-400 font-bold">+1</td>
                        <td className="p-2 font-black text-purple-700 dark:text-purple-300">2</td>
                        <td className="p-2">3</td>
                        <td className="p-2 font-black bg-purple-50/40 dark:bg-purple-900/30">8</td>
                      </tr>
                      {/* Q8 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-purple-50/20 dark:bg-purple-950/10">
                        <td className="p-2">Q8</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">3</td>
                        <td className="p-2">1</td>
                        <td className="p-2 text-purple-600 dark:text-purple-400 font-bold">+1</td>
                        <td className="p-2 font-black text-purple-700 dark:text-purple-300">2</td>
                        <td className="p-2">4</td>
                        <td className="p-2 font-black bg-purple-50/40 dark:bg-purple-900/30">10</td>
                      </tr>
                      {/* Q9 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-red-50/20 dark:bg-red-950/10">
                        <td className="p-2">Q9</td>
                        <td className="p-2 font-bold text-red-600 dark:text-red-400">{t("Incorrect", "មិនត្រឹមត្រូវ")}</td>
                        <td className="p-2">4</td>
                        <td className="p-2">0</td>
                        <td className="p-2">0</td>
                        <td className="p-2 font-bold">0</td>
                        <td className="p-2 text-red-600 dark:text-red-400 font-bold">0</td>
                        <td className="p-2 font-black bg-zinc-50 dark:bg-zinc-800/20">10</td>
                      </tr>
                      {/* Q10 */}
                      <tr className="divide-x divide-black hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                        <td className="p-2">Q10</td>
                        <td className="p-2 font-bold text-green-600 dark:text-green-400">{t("Correct", "ត្រឹមត្រូវ")}</td>
                        <td className="p-2">0</td>
                        <td className="p-2">1</td>
                        <td className="p-2">0</td>
                        <td className="p-2 font-bold">1</td>
                        <td className="p-2">1</td>
                        <td className="p-2 font-black bg-zinc-50 dark:bg-zinc-800/20">11</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
