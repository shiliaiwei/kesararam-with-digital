"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/lang-context";

// ─── Official logo — ONE source of truth ───────────────────────────────────
// Primary: kwd-black_nobackground.png — the ONLY logo used in this product.
// All logo placements across UI must reference this single file.
const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

// ─── Color system (bilingual roles) ────────────────────────────────────────
const COLORS: { name: string; hex: string; role: { en: string; kh: string } }[] = [
  { name: "Yellow", hex: "#eab308", role: { en: "Primary CTA, warning signs, brand accent", kh: "ប៊ូតុងសំខាន់ សញ្ញាព្រមាន និងពណ៌សម្គាល់ម៉ាក" } },
  { name: "Black", hex: "#000000", role: { en: "Text, borders, structural elements", kh: "អក្សរ ស៊ុម និងធាតុរចនាសម្ព័ន្ធ" } },
  { name: "White", hex: "#ffffff", role: { en: "Background, negative space", kh: "ផ្ទៃខាងក្រោយ និងចន្លោះទំនេរ" } },
  { name: "Blue", hex: "#3b82f6", role: { en: "Informational signs, links, signals", kh: "សញ្ញាព័ត៌មាន តំណភ្ជាប់ និងសញ្ញាបង្ហាញ" } },
  { name: "Red", hex: "#ef4444", role: { en: "Prohibitory signs, danger, stop", kh: "សញ្ញាហាមឃាត់ គ្រោះថ្នាក់ និងការឈប់" } },
  { name: "Green", hex: "#22c55e", role: { en: "Success, active states, go", kh: "ភាពជោគជ័យ ស្ថានភាពសកម្ម និងការអនុញ្ញាត" } },
  { name: "Orange", hex: "#f97316", role: { en: "Caution, attention, warning", kh: "ការប្រុងប្រយ័ត្ន ការយកចិត្តទុកដាក់ និងព្រមាន" } },
  { name: "Purple", hex: "#a855f7", role: { en: "Premium features, game modes", kh: "មុខងារពិសេស និងរបៀបលេងហ្គេម" } },
  { name: "Cyan", hex: "#06b6d4", role: { en: "Accent, highlights, info", kh: "ពណ៌រំលេច ការបញ្ជាក់ និងព័ត៌មាន" } },
  { name: "Rose", hex: "#fda4af", role: { en: "Emergency signs, alerts, dynamic indicators", kh: "សញ្ញាអាសន្ន ការព្រមានបន្ទាន់ និងសញ្ញាបង្ហាញឌីណាមិក" } },
  { name: "Gray", hex: "#71717a", role: { en: "System metadata, code blocks, inactive elements", kh: "ទិន្នន័យប្រព័ន្ធ ប្រអប់កូដ និងធាតុមិនសកម្ម" } },
];

// ─── Logo usage rules (bilingual) ──────────────────────────────────────────
const RULES: { en: string; kh: string }[] = [
  { en: "Do not stretch, rotate, or distort the logo.", kh: "កុំទាញ បង្វិល ឬធ្វើឱ្យឡូហ្គូខូចទ្រង់ទ្រាយ។" },
  { en: "Do not apply drop shadows, gradients, or filters.", kh: "កុំដាក់ស្រមោល ពណ៌ជម្រាល ឬហ្វីលទ័រលើឡូហ្គូ។" },
  { en: "Do not place the logo on low-contrast backgrounds.", kh: "កុំដាក់ឡូហ្គូលើផ្ទៃខាងក្រោយដែលមានកម្រិតផ្ទុយពណ៌ខ្សោយ។" },
  { en: "Maintain clear space equal to the height of the K on all sides.", kh: "ទុកចន្លោះទំនេរជុំវិញឡូហ្គូ ស្មើនឹងកម្ពស់នៃអក្សរ K។" },
  { en: "Use kwd-black_nobackground on light backgrounds only.", kh: "ប្រើ kwd-black_nobackground លើផ្ទៃខាងក្រោយភ្លឺតែប៉ុណ្ណោះ។" },
  { en: "Minimum logo height is 24 px in any digital context.", kh: "កម្ពស់អប្បបរមារបស់ឡូហ្គូគឺ ២៤ ភីកសែល ក្នុងបរិបទឌីជីថលណាមួយ។" },
  { en: "Do not recolor, outline, or alter the logo in any way.", kh: "កុំប្ដូរពណ៌ ដាក់បន្ទាត់គែម ឬកែប្រែឡូហ្គូតាមរបៀបណាមួយឡើយ។" },
  { en: "Only kwd-black_nobackground.png is the approved digital logo.", kh: "មានតែ kwd-black_nobackground.png ប៉ុណ្ណោះ ដែលជាឡូហ្គូឌីជីថលផ្លូវការ។" },
];

// ─── Design tokens (bilingual values) ──────────────────────────────────────
const DESIGN_TOKENS: { token: { en: string; kh: string }; value: { en: string; kh: string } }[] = [
  { token: { en: "Border Radius", kh: "កាំជ្រុងស៊ុម" }, value: { en: "0px — always sharp", kh: "0px — មុតស្រួចជានិច្ច" } },
  { token: { en: "Border Width", kh: "កម្រាស់ស៊ុម" }, value: { en: "2px standard · 4px emphasis", kh: "2px ស្តង់ដារ · 4px រំលេច" } },
  { token: { en: "Shadow", kh: "ស្រមោល" }, value: { en: "4px 4px 0 #000 — hard, no blur", kh: "4px 4px 0 #000 — រឹង គ្មានព្រិល" } },
  { token: { en: "Hover", kh: "ពេលដាក់កណ្ដុរ" }, value: { en: "−0.5px translate · shadow 6px", kh: "ផ្លាស់ −0.5px · ស្រមោល 6px" } },
  { token: { en: "Active", kh: "ពេលចុច" }, value: { en: "+2px translate · shadow removed", kh: "ផ្លាស់ +2px · ដកស្រមោល" } },
  { token: { en: "Transition", kh: "ការផ្លាស់ប្ដូរ" }, value: { en: "100–150ms only", kh: "តែ 100–150ms ប៉ុណ្ណោះ" } },
  { token: { en: "Gradients", kh: "ពណ៌ជម្រាល" }, value: { en: "None — solid colors only", kh: "គ្មាន — តែពណ៌ដិតប៉ុណ្ណោះ" } },
  { token: { en: "Motion", kh: "ចលនា" }, value: { en: "Purposeful only", kh: "មានគោលបំណងតែប៉ុណ្ណោះ" } },
];

const VOICE_PRINCIPLES: { en: string; kh: string }[] = [
  { en: "Write to be understood, not to impress.", kh: "សរសេរដើម្បីឱ្យគេយល់ មិនមែនដើម្បីបង្ហាញខ្លួនទេ។" },
  { en: "Use active voice. State what the user can do.", kh: "ប្រើទម្រង់សកម្ម។ បញ្ជាក់ឱ្យច្បាស់ពីអ្វីដែលអ្នកប្រើអាចធ្វើបាន។" },
  { en: "Error messages explain what happened and what to do next.", kh: "សារកំហុសត្រូវពន្យល់ពីអ្វីដែលបានកើតឡើង និងជំហានបន្ទាប់ដែលត្រូវធ្វើ។" },
  { en: "Labels are short. Descriptions are complete.", kh: "ស្លាកត្រូវខ្លី។ ការពិពណ៌នាត្រូវពេញលេញ។" },
  { en: "Bilingual content must carry equal meaning — not literal translation.", kh: "ខ្លឹមសារពីរភាសាត្រូវមានអត្ថន័យស្មើគ្នា — មិនមែនជាការបកប្រែតាមព្យញ្ជនៈឡើយ។" },
];

const MOCKUP_COUNT = 5;

const CARD_FONTS: { usage: { en: string; kh: string }; font: string; note: { en: string; kh: string }; css: string }[] = [
  { usage: { en: "English — All text", kh: "អង់គ្លេស — អក្សរទាំងអស់" }, font: "Inter", note: { en: "Latin UI font", kh: "ពុម្ពអក្សរឡាតាំងសម្រាប់ចំណុចប្រទាក់" }, css: "--font-sans" },
  { usage: { en: "Khmer — Headings", kh: "ខ្មែរ — ចំណងជើង" }, font: "Kantumruy Pro / Google Sans Khmer", note: { en: "Headings & brand elements", kh: "ចំណងជើង និងធាតុម៉ាក" }, css: "--font-kh-header" },
  { usage: { en: "Khmer — Body copy", kh: "ខ្មែរ — អត្ថបទ" }, font: "Siemreap / Google Sans", note: { en: "Standard text & secondary UI", kh: "អត្ថបទស្តង់ដារ និងចំណុចប្រទាក់រង" }, css: "--font-kh-body" },
];

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  return (
    <div
      className="min-h-screen bg-white text-black"
      style={{
        backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-14 md:py-20">

        {/* ── Hero ── */}
        <div className="flex justify-center mb-10">
          <Image
            src={LOGO_PRIMARY}
            alt="KWD"
            width={180}
            height={180}
            className="object-contain"
            priority
          />
        </div>

        <div className="text-center mb-10">
          <span
            className="inline-block text-[10px] font-black uppercase tracking-[0.25em] border border-black/20 px-3 py-1 rounded-full bg-white/80 mb-4"
            style={kf}
          >
            {t("Brand Guideline", "ការណែនាំអំពីម៉ាក")}
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-3 text-black">
            KWD
          </h1>
          <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto" style={kf}>
            {t(
              "The visual identity, design standards, and usage rules that define KWD across every surface.",
              "អត្តសញ្ញាណរូបភាព ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ ដែលកំណត់អត្តសញ្ញាណ KWD លើគ្រប់ផ្ទៃ។"
            )}
          </p>

          {/* Motto / tagline */}
          <div className="mt-6 inline-flex flex-col items-center gap-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black" style={kf}>
              {t("Learn to know · Compete to excel · Protect for life", "រៀនដើម្បីដឹង · ប្រកួតដើម្បីពូកែ · ការពារដើម្បីជីវិត")}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium max-w-sm" style={kf}>
              {t(
                "Master Cambodia's road rules. Ace the theory exam. Drive with confidence.",
                "ស្ទាត់ជំនាញច្បាប់ចរាចរកម្ពុជា។ ប្រឡងទ្រឹស្ដីជាប់ដោយជោគជ័យ។ បើកបរដោយទំនុកចិត្ត។"
              )}
            </p>
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 01 Brand Name & Meaning ── */}
        <Section id="name" num="01" title={t("Brand Name & Meaning", "ឈ្មោះ និងអត្ថន័យ")} kf={kf}>
          <div className="space-y-4 text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>
            <p>
              <strong className="text-black font-black">KWD</strong>{" "}
              {t(
                "stands for Kesararam With Digital — a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school, the oldest seat of learning in its community. The word With is not a conjunction — it is a declaration of partnership between tradition and technology. Digital is not merely a medium — it is a commitment to access, reach, and permanence.",
                "តំណាងឱ្យ Kesararam With Digital — ឈ្មោះមួយនៃទីកន្លែង គោលបំណង និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះ អារាមមួយ និងសាលាបឋមសិក្សាផងដែរ ដែលជាមូលដ្ឋានសិក្សាចំណាស់បំផុតក្នុងសហគមន៍។ ពាក្យ With មិនមែនជាគ្រាន់តែឈ្នាប់ទេ — វាជាការប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និងបច្ចេកវិទ្យា។ Digital មិនមែនគ្រាន់តែជាមធ្យោបាយទេ — វាជាការប្ដេជ្ញាចិត្តចំពោះការចូលប្រើ ការឈានទៅដល់ និងភាពយូរអង្វែង។"
              )}
            </p>
            <p>
              {t(
                "KWD exists because young Cambodian girls from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their own language. The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward.",
                "KWD កើតមានឡើង ដោយសារយុវនារីខ្មែរមកពីបឋមសិក្សាកេសរារាម បានសម្រេចចិត្តថា ចំណេះដឹងសុវត្ថិភាពចរាចរ — ចំណេះដឹងដែលជួយសង្គ្រោះជីវិត — គួរតែឥតគិតថ្លៃ មានលក្ខណៈអន្តរកម្ម និងអាចចូលប្រើបានសម្រាប់សិស្សគ្រប់រូបជាភាសារបស់ខ្លួន។ ឈ្មោះនេះបញ្ជាក់ថា ការអប់រំមិនបោះបង់ឫសគល់របស់ខ្លួននៅពេលឈានចូលយុគឌីជីថលឡើយ — ផ្ទុយទៅវិញ វានាំយកវាបន្តទៅមុខ។"
              )}
            </p>
          </div>
        </Section>

        {/* ── 02 Logo ── */}
        <Section id="logo" num="02" title={t("Logo", "ឡូហ្គូ")} kf={kf}>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {t(
              "kwd-black_nobackground.png is the primary logo — used across all surfaces. Color variants (Gray, Green, Yellow) are permitted only in specific approved contexts.",
              "kwd-black_nobackground.png គឺជាឡូហ្គូចម្បងសម្រាប់ប្រើប្រាស់លើគ្រប់ផ្ទៃការងារ។ រាល់បម្រែបម្រួលពណ៌ផ្សេងទៀត (ពណ៌ប្រផេះ បៃតង និងលឿង) ត្រូវបានអនុញ្ញាតឱ្យប្រើប្រាស់តែក្នុងករណីជាក់លាក់ដែលបានកំណត់។"
            )}
          </p>

          {/* Primary + Dark side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="rounded-2xl overflow-hidden border-2 border-black/10">
              <div className="h-40 flex items-center justify-center p-8 bg-white">
                <Image src={LOGO_PRIMARY} alt="KWD — Official Logo" width={160} height={160} className="object-contain max-h-28" priority />
              </div>
              <div className="px-4 py-3 bg-zinc-50 border-t border-black/8">
                <p className="text-[10px] font-black uppercase tracking-wide text-zinc-800 leading-tight">kwd-black_nobackground.png</p>
                <p className="text-[9px] text-amber-500 font-black mt-0.5 uppercase tracking-wide">
                  ★ {t("Sole Official Logo — Always Use This", "ឡូហ្គូផ្លូវការតែមួយគត់ — ប្រើនេះជានិច្ច")}
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-black/10">
              <div className="h-40 flex items-center justify-center p-8 bg-zinc-900">
                <Image src={LOGO_PRIMARY} alt="KWD — Official Logo on dark" width={160} height={160} className="object-contain max-h-28 invert" />
              </div>
              <div className="px-4 py-3 bg-zinc-50 border-t border-black/8">
                <p className="text-[10px] font-black uppercase tracking-wide text-zinc-800 leading-tight">
                  kwd-black_nobackground.png <span className="text-zinc-400 font-medium">+ CSS invert</span>
                </p>
                <p className="text-[9px] text-zinc-400 font-medium mt-0.5" style={kf}>
                  {t("For dark surfaces — apply filter: invert(1)", "សម្រាប់ផ្ទៃងងឹត — ប្រើ filter: invert(1)")}
                </p>
              </div>
            </div>
          </div>

          {/* Color variants */}
          <div className="mb-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
              {t("Official Color Variants", "វ៉ារ្យ៉ង់ពណ៌ផ្លូវការ")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { src: "/brand/kwd-gray.png", file: "kwd-gray.png", note: t("On white / light neutral bg", "លើផ្ទៃស ឬប្រផេះ") },
                { src: "/brand/kwd-green.png", file: "kwd-green.png", note: t("Success state · active", "ស្ថានភាពជោគជ័យ · សកម្ម") },
                { src: "/brand/kwd-yellow.png", file: "kwd-yellow.png", note: t("Brand accent · CTA", "ពណ៌សម្គាល់ម៉ាក · CTA") },
              ].map(({ src, file, note }) => (
                <div key={file} className="rounded-xl overflow-hidden border border-black/10">
                  <div className="h-24 flex items-center justify-center p-4 bg-white">
                    <Image src={src} alt={file} width={80} height={80} className="object-contain max-h-14" />
                  </div>
                  <div className="px-2.5 py-2 bg-white border-t border-black/8">
                    <p className="text-[9px] font-black uppercase tracking-wide text-zinc-700 leading-tight">{file}</p>
                    <p className="text-[8px] text-zinc-400 font-medium mt-0.5" style={kf}>{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage rules */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
              {t("Usage Rules", "ច្បាប់ប្រើប្រាស់")}
            </p>
            <div className="space-y-2">
              {RULES.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[10px] font-black text-zinc-300 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm text-zinc-600 font-medium leading-snug" style={kf}>{t(r.en, r.kh)}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 03 Color Palette ── */}
        <Section id="color" num="03" title={t("Color Palette", "ក្រុមពណ៌")} kf={kf}>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {t(
              "KWD colors are drawn directly from the road sign system — every color carries meaning.",
              "ពណ៌របស់ KWD ត្រូវបានយកមកដោយផ្ទាល់ពីប្រព័ន្ធសញ្ញាចរាចរ — ពណ៌នីមួយៗសុទ្ធតែមានអត្ថន័យ។"
            )}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {COLORS.map(({ name, hex, role }) => (
              <div key={hex} className="group cursor-default">
                <div 
                  className="h-16 rounded-none mb-3 border-[3px] border-black shadow-[3px_3px_0_#000] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[5px_5px_0_#000] transition-all duration-150" 
                  style={{ background: hex }} 
                />
                <p className="text-[10px] font-black text-black uppercase tracking-wide">{name}</p>
                <p className="text-[9px] font-mono text-zinc-400">{hex}</p>
                <p className="text-[9px] text-zinc-400 leading-snug mt-0.5 hidden group-hover:block" style={kf}>{t(role.en, role.kh)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 04 Typography ── */}
        <Section id="type" num="04" title={t("Typography", "ពុម្ពអក្សរ")} kf={kf}>
          <div className="space-y-8">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">Primary — Inter</p>
              <p className="text-5xl font-black text-black leading-none">Aa Bb Cc</p>
              <p className="text-xs text-zinc-400 mt-2" style={kf}>{t("All Latin text, UI labels, headings, body copy.", "អក្សរឡាតាំងទាំងអស់ ស្លាកចំណុចប្រទាក់ ចំណងជើង និងអត្ថបទ។")}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">Khmer — Siemreap</p>
              <p className="text-4xl font-black text-black leading-none" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ គ ឃ ង</p>
              <p className="text-xs text-zinc-400 mt-2" style={kf}>{t("All Khmer script content across the platform.", "ខ្លឹមសារអក្សរខ្មែរទាំងអស់នៅទូទាំងវេទិកា។")}</p>
            </div>
            <div className="space-y-3 border-t border-black/8 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-4" style={kf}>{t("Type Scale", "មាត្រដ្ឋានអក្សរ")}</p>
              <p className="text-5xl font-black text-black leading-none">Display / 900</p>
              <p className="text-3xl font-black text-black">Heading / 900</p>
              <p className="text-xl font-bold text-black">Subheading / 700</p>
              <p className="text-base font-medium text-zinc-700">Body / 500</p>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Label / 900 Uppercase</p>
            </div>
          </div>
        </Section>

        {/* ── 05 Design System ── */}
        <Section id="design" num="05" title={t("Design System", "ប្រព័ន្ធរចនា")} kf={kf}>
          <p className="text-sm md:text-base text-zinc-700 leading-relaxed font-medium mb-8" style={kf}>
            {t(
              "KWD uses a Neo-Brutalism design language — a system built on the visual grammar of road infrastructure. Borders are structural, not decorative. Shadows are hard and directional, like the shadow cast by a road sign post. There are no gradients, no blur, no softness. The interface communicates with the same clarity that a stop sign communicates.",
              "KWD ប្រើភាសារចនាបែប Neo-Brutalism — ប្រព័ន្ធមួយដែលបង្កើតឡើងលើវេយ្យាករណ៍រូបភាពនៃហេដ្ឋារចនាសម្ព័ន្ធផ្លូវ។ ស៊ុមមានតួនាទីជារចនាសម្ព័ន្ធ មិនមែនជាការតុបតែងទេ។ ស្រមោលរឹង និងមានទិសដៅ ប្រៀបដូចស្រមោលនៃសសរសញ្ញាចរាចរ។ គ្មានពណ៌ជម្រាល គ្មានភាពព្រិល គ្មានភាពទន់ភ្លន់ឡើយ។ ចំណុចប្រទាក់ប្រាស្រ័យទាក់ទងដោយភាពច្បាស់លាស់ ដូចជាសញ្ញាឈប់ដែរ។"
            )}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {DESIGN_TOKENS.map(({ token, value }) => (
              <div key={token.en} className="flex flex-col gap-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300" style={kf}>{t(token.en, token.kh)}</p>
                <p className="text-sm font-bold text-black" style={kf}>{t(value.en, value.kh)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 06 Voice & Tone ── */}
        <Section id="voice" num="06" title={t("Voice & Tone", "សំឡេង និងលក្ខណៈនិយាយ")} kf={kf}>
          <div className="space-y-4 text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>
            <p>
              {t(
                "KWD speaks with precision and warmth. The platform is built by young girls for students — the voice is never condescending, never bureaucratic. It is direct because road safety is direct. It is warm because learning requires trust.",
                "KWD និយាយដោយភាពច្បាស់លាស់ និងភាពកក់ក្ដៅ។ វេទិកានេះត្រូវបានបង្កើតឡើងដោយយុវនារីខ្មែរ សម្រាប់សិស្ស — សំឡេងមិនដែលមើលងាយ ឬមានលក្ខណៈការិយាធិបតេយ្យឡើយ។ វាផ្ទាល់ ព្រោះសុវត្ថិភាពចរាចរជារឿងផ្ទាល់។ វាកក់ក្ដៅ ព្រោះការរៀនសូត្រត្រូវការទំនុកចិត្ត។"
              )}
            </p>
            <p>
              {t(
                "In Khmer, the platform uses a respectful but accessible register — the language of a knowledgeable peer, not an authority. In English, the tone is clear, active, and free of jargon.",
                "ជាភាសាខ្មែរ វេទិកាប្រើសម្តីដែលគួរសម ប៉ុន្តែងាយយល់ — ភាសារបស់មិត្តភក្ដិដែលមានចំណេះដឹង មិនមែនជាអាជ្ញាធរទេ។ ជាភាសាអង់គ្លេស សម្លេងនិយាយច្បាស់លាស់ សកម្ម និងគ្មានពាក្យបច្ចេកទេសស្មុគស្មាញ។"
              )}
            </p>
          </div>
          <div className="mt-6 space-y-2">
            {VOICE_PRINCIPLES.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[10px] font-black text-zinc-300 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm text-zinc-600 font-medium leading-snug" style={kf}>{t(p.en, p.kh)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 07 Applications ── */}
        <Section id="apply" num="07" title={t("Applications", "ការអនុវត្ត")} kf={kf} last>
          {/* Product mockups */}
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
            {t("Product Mockups", "ផលិតផលគំរូ")}
          </p>
          <p className="text-sm text-zinc-500 font-medium mb-6" style={kf}>
            {t(
              "KWD applied across physical products and brand materials — images will be added later.",
              "KWD ដាក់លើផលិតផលជាក់ស្តែង និងសម្ភារៈម៉ាក — រូបភាពនឹងបន្ថែមនៅពេលក្រោយ។"
            )}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
            {Array.from({ length: MOCKUP_COUNT }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border-2 border-dashed border-black/15 bg-zinc-50 h-44 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-black/15 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-25">
                    <rect x="1" y="1" width="14" height="14" rx="1" stroke="#000" strokeWidth="1.5" />
                    <path d="M1 11l4-4 3 3 3-4 4 5" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="11" cy="5" r="1.5" fill="#000" />
                  </svg>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/20">Image {String(i + 1).padStart(2, "0")}</p>
              </div>
            ))}
          </div>

          {/* Card print sign */}
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
            {t("Card Print Sign", "កាតបោះពុម្ព")}
          </p>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {t(
              "Print-ready card format — uses Kantumruy Pro for Khmer headings and Inter for English text.",
              "ទម្រង់កាតរួចរាល់សម្រាប់បោះពុម្ព — ប្រើ Kantumruy Pro សម្រាប់ចំណងជើងខ្មែរ និង Inter សម្រាប់អក្សរអង់គ្លេស។"
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <BrandCard variant="light" />
            <BrandCard variant="dark" />
            <BrandCard variant="yellow" />
            <IdCard />
            <BrandCard variant="green-dark" />
            <BrandCard variant="gray" />
          </div>

          {/* Font spec table */}
          <div className="border border-black/8 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-zinc-50 border-b border-black/8">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2" style={kf}>{t("Usage", "ការប្រើ")}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2" style={kf}>{t("Font (Google Fonts)", "ពុម្ពអក្សរ (Google Fonts)")}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2">CSS Var</p>
            </div>
            {CARD_FONTS.map(({ usage, font, note, css }) => (
              <div key={css} className="grid grid-cols-3 border-b border-black/5 last:border-0">
                <p className="text-[10px] font-medium text-zinc-600 px-4 py-2.5" style={kf}>{t(usage.en, usage.kh)}</p>
                <div className="px-4 py-2.5">
                  <p className="text-[10px] font-bold text-black">{font}</p>
                  <p className="text-[8px] text-zinc-400 font-medium mt-0.5" style={kf}>{t(note.en, note.kh)}</p>
                </div>
                <p className="text-[9px] font-mono text-zinc-400 px-4 py-2.5 self-center">{css}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Footer ── */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src={LOGO_PRIMARY} alt="KWD" width={24} height={24} className="object-contain opacity-40" />
            <p className="text-xs text-zinc-400 font-medium" style={kf}>
              &copy; {new Date().getFullYear()} KWD — Kesararam With Digital. Brand Guideline v1.0
            </p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <Link href="/terms" className="text-zinc-400 hover:text-black transition-colors" style={kf}>{t("Terms", "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-black transition-colors" style={kf}>{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────
function Section({
  id,
  num,
  title,
  kf,
  last,
  children,
}: {
  id: string;
  num: string;
  title: string;
  kf: React.CSSProperties;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <section id={id} className="scroll-mt-8 mb-14">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{num}</span>
          <h2 className="text-lg font-black uppercase tracking-wide text-black" style={kf}>{title}</h2>
        </div>
        {children}
      </section>
      {!last && <div className="border-t border-black/10 mb-12" />}
    </>
  );
}

// ─── Brand card previews ───────────────────────────────────────────────────
function BrandCard({ variant }: { variant: "light" | "dark" | "yellow" | "green-dark" | "gray" }) {
  const cfg = {
    light: { bg: "#ffffff", logo: LOGO_PRIMARY, label: "text-black", sub: "text-zinc-500", kh: "text-black", khSub: "text-zinc-400", divider: "bg-black/10" },
    dark: { bg: "#000000", logo: LOGO_PRIMARY, label: "text-white", sub: "text-white/50", kh: "text-white", khSub: "text-white/40", divider: "bg-white/15" },
    yellow: { bg: "#eab308", logo: "/brand/kwd-yellow.png", label: "text-black", sub: "text-black/60", kh: "text-black", khSub: "text-black/50", divider: "bg-black/20" },
    "green-dark": { bg: "#111827", logo: "/brand/kwd-green.png", label: "text-white", sub: "text-white/50", kh: "text-[#22c55e]", khSub: "text-white/30", divider: "bg-white/10" },
    gray: { bg: "#f4f4f5", logo: "/brand/kwd-gray.png", label: "text-zinc-500", sub: "text-zinc-400", kh: "text-zinc-600", khSub: "text-zinc-400", divider: "bg-black/10" },
  }[variant];

  return (
    <div
      className="relative rounded-[10px] border-[3px] border-black overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      style={{ aspectRatio: "85/54", background: cfg.bg }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      <div className="flex h-full px-5 py-4 gap-4 items-center">
        <div className="w-[68px] h-[68px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-black/5">
          <Image src={cfg.logo} alt="KWD" width={46} height={46} className="object-contain" />
        </div>
        <div className={`w-px self-stretch ${cfg.divider}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${cfg.label} leading-none mb-1`} style={{ fontFamily: "var(--font-sans)" }}>KWD</p>
          <p className={`text-[9px] font-semibold ${cfg.sub} leading-snug mb-2`} style={{ fontFamily: "var(--font-sans)" }}>Kesararam With Digital</p>
          <p className={`text-[10px] font-bold ${cfg.kh} leading-snug`} style={{ fontFamily: "var(--font-kh-header)" }}>កេសរារាម ជាមួយ ឌីជីថល</p>
          <p className={`text-[8px] ${cfg.khSub} mt-1 leading-snug`} style={{ fontFamily: "var(--font-kh-body)" }}>ការអប់រំ · សុវត្ថិភាពចរាចរ</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
    </div>
  );
}

function IdCard() {
  return (
    <div
      className="relative rounded-[10px] border-[3px] border-black overflow-hidden flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      style={{ aspectRatio: "85/54", background: "#ffffff" }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      <div className="bg-black px-5 py-2 flex items-center justify-between flex-shrink-0">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white" style={{ fontFamily: "var(--font-sans)" }}>Official ID Card</p>
        <p className="text-[9px] font-bold text-white/60" style={{ fontFamily: "var(--font-kh-header)" }}>កាតអត្តសញ្ញាណ</p>
      </div>
      <div className="flex flex-1 px-5 py-3 gap-4 items-center min-h-0">
        <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-black/5">
          <Image src={LOGO_PRIMARY} alt="KWD" width={40} height={40} className="object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-black leading-none" style={{ fontFamily: "var(--font-sans)" }}>KWD</p>
          <p className="text-[8px] font-medium text-zinc-500 mt-0.5 leading-snug" style={{ fontFamily: "var(--font-sans)" }}>kesararamwithdigital.tech</p>
          <p className="text-[9px] font-bold text-black mt-1.5 leading-snug" style={{ fontFamily: "var(--font-kh-header)" }}>វេទិកាអប់រំ — ឥតគិតថ្លៃ</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#eab308] flex-shrink-0" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[4px] caution-tape" />
    </div>
  );
}
