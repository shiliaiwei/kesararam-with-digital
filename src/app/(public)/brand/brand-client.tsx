"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/lang-context";

const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

const COLORS: { name: string; hex: string; role: { en: string; kh: string } }[] = [
  { name: "Yellow", hex: "#eab308", role: { en: "Primary CTA, warning signs, brand accent", kh: "ប៊ូតុងសំខាន់ សញ្ញាព្រមាន និងពណ៌សម្គាល់ម៉ាក" } },
  { name: "Black",  hex: "#000000", role: { en: "Text, borders, structural elements", kh: "អក្សរ ស៊ុម និងធាតុរចនាសម្ព័ន្ធ" } },
  { name: "White",  hex: "#ffffff", role: { en: "Background, negative space", kh: "ផ្ទៃខាងក្រោយ និងចន្លោះទំនេរ" } },
  { name: "Blue",   hex: "#3b82f6", role: { en: "Informational signs, links, signals", kh: "សញ្ញាព័ត៌មាន តំណភ្ជាប់ និងសញ្ញាបង្ហាញ" } },
  { name: "Red",    hex: "#ef4444", role: { en: "Prohibitory signs, danger, stop", kh: "សញ្ញាហាមឃាត់ គ្រោះថ្នាក់ និងការឈប់" } },
  { name: "Green",  hex: "#22c55e", role: { en: "Success, active states, go", kh: "ភាពជោគជ័យ ស្ថានភាពសកម្ម និងការអនុញ្ញាត" } },
  { name: "Orange", hex: "#f97316", role: { en: "Caution, attention, warning", kh: "ការប្រុងប្រយ័ត្ន ការយកចិត្តទុកដាក់ និងព្រមាន" } },
  { name: "Purple", hex: "#a855f7", role: { en: "Premium features, game modes", kh: "មុខងារពិសេស និងរបៀបលេងហ្គេម" } },
  { name: "Cyan",   hex: "#06b6d4", role: { en: "Accent, highlights, info", kh: "ពណ៌រំលេច ការបញ្ជាក់ និងព័ត៌មាន" } },
  { name: "Rose",   hex: "#fda4af", role: { en: "Emergency signs, alerts, dynamic indicators", kh: "សញ្ញាអាសន្ន ការព្រមានបន្ទាន់ និងសញ្ញាបង្ហាញឌីណាមិក" } },
  { name: "Gray",   hex: "#71717a", role: { en: "System metadata, code blocks, inactive elements", kh: "ទិន្នន័យប្រព័ន្ធ ប្រអប់កូដ និងធាតុមិនសកម្ម" } },
];

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

const MOCKUP_ASSETS: { src: string; title: { en: string; kh: string } }[] = [
  {
    src: "/brand/tote_stationery_mockup.png",
    title: { en: "Tote & Stationery Set", kh: "កាបូបយួរ & សម្ភារៈការិយាល័យ" }
  },
  {
    src: "/brand/devices_brand_mockup.png",
    title: { en: "Digital Devices Dashboard", kh: "ផ្ទាំងព័ត៌មានលើឧបករណ៍ឌីជីថល" }
  },
  {
    src: "/brand/educational_blocks_mockup.png",
    title: { en: "Educational Toys & Cards", kh: "ដុំឈើល្បែងអប់រំ & កាតសិក្សា" }
  },
  {
    src: "/brand/mug_bottle_mockup.png",
    title: { en: "Ceramic Mug & Metal Bottle", kh: "កែវសេរ៉ាមិច & ដបទឹកលោហៈធាតុ" }
  },
  {
    src: "/brand/apparel_brand_mockup.png",
    title: { en: "Premium Brand Apparel", kh: "សម្លៀកបំពាក់យីហោលំដាប់ខ្ពស់" }
  }
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
          <Image src={LOGO_PRIMARY} alt="KWD" width={180} height={180} className="object-contain" priority />
        </div>

        <div className="text-center mb-10">
          <span
            className="inline-block text-[10px] font-black uppercase tracking-[0.25em] border border-black/20 px-3 py-1 rounded-full bg-white/80 mb-4"
            style={kf}
          >
            {t("Brand Guideline", "ការណែនាំអំពីម៉ាក")}
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-3 text-black">KWD</h1>
          <p className="text-sm text-zinc-500 font-medium max-w-md mx-auto" style={kf}>
            {t(
              "The visual identity, design standards, and usage rules that define KWD across every surface.",
              "អត្តសញ្ញាណរូបភាព ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ ដែលកំណត់អត្តសញ្ញាណ KWD លើគ្រប់ផ្ទៃ។"
            )}
          </p>
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
                "stands for ",
                "តំណាងឱ្យ "
              )}
              <strong className="text-black font-black">Kesararam With Digital</strong>
              {t(
                " — a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school, the oldest seat of learning in its community. The word With is not a conjunction — it is a declaration of partnership between tradition and technology. Digital is not merely a medium — it is a commitment to access, reach, and permanence.",
                " — ឈ្មោះមួយដែលផ្ទុកទម្ងន់នៃទីកន្លែង គោលបំណង និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាអារាម និងសាលាបឋមសិក្សា ដែលជាមូលដ្ឋានសិក្សាចំណាស់បំផុតក្នុងសហគមន៍។ ពាក្យ With មិនមែនជាគ្រាន់តែឈ្នាប់ទេ — វាជាការប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និងបច្ចេកវិទ្យា។ Digital មិនមែនគ្រាន់តែជាមធ្យោបាយទេ — វាជាការប្ដេជ្ញាចិត្តចំពោះការចូលប្រើ ការឈានទៅដល់ និងភាពយូរអង្វែង។"
              )}
            </p>
            <p>
              {t(
                "KWD exists because young Cambodian women from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their own language. The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward.",
                "KWD កើតមានឡើង ដោយសារយុវនារីខ្មែរមកពីបឋមសិក្សាកេសរារាម បានសម្រេចចិត្តថា ចំណេះដឹងសុវត្ថិភាពចរាចរ — ចំណេះដឹងដែលជួយសង្គ្រោះជីវិត — គួរតែឥតគិតថ្លៃ មានលក្ខណៈអន្តរកម្ម និងអាចចូលប្រើបានសម្រាប់សិស្សគ្រប់រូបជាភាសារបស់ខ្លួន។ ឈ្មោះនេះបញ្ជាក់ថា ការអប់រំមិនបោះបង់ឫសគល់របស់ខ្លួននៅពេលឈានចូលយុគឌីជីថលឡើយ — ផ្ទុយទៅវិញ វានាំយកវាបន្តទៅមុខ។"
              )}
            </p>

            {/* Full name recommendation */}
            <div className="border-2 border-black rounded-xl p-4 bg-amber-50 mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-2">
                {t("★ Recommended Usage", "★ ការប្រើប្រាស់ដែលណែនាំ")}
              </p>
              <p className="text-sm font-medium text-zinc-700 leading-relaxed" style={kf}>
                {t(
                  "Always use the full name ",
                  "តែងតែប្រើឈ្មោះពេញ "
                )}
                <strong className="text-black font-black">Kesararam With Digital</strong>
                {t(
                  " when introducing the brand for the first time — in press, presentations, official documents, and partnerships. The abbreviation ",
                  " នៅពេលណែនាំម៉ាកជាលើកដំបូង — ក្នុងការផ្សព្វផ្សាយ បទបង្ហាញ ឯកសារផ្លូវការ និងភាពជាដៃគូ។ ការកាត់ "
                )}
                <strong className="text-black font-black">KWD</strong>
                {t(
                  " may be used in subsequent references once the full name has been established.",
                  " អាចប្រើបានក្នុងការយោងបន្ទាប់ក្រោយ ពេលឈ្មោះពេញត្រូវបានបញ្ជាក់ហើយ។"
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* ── 02 Logo ── */}
        <Section id="logo" num="02" title={t("Logo", "ឡូហ្គូ")} kf={kf}>

          {/* Logo meaning */}
          <div className="mb-8 p-4 border-l-4 border-amber-400 bg-zinc-50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2" style={kf}>
              {t("Logo Meaning", "អត្ថន័យឡូហ្គូ")}
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed font-medium" style={kf}>
              {t(
                "The lightning bolt at the heart of the KWD mark is not ornamental — it is the brand's core belief made visible. It stands for ",
                "ផ្លេកបន្ទោរនៅចំកណ្ដាលនៃឡូហ្គូ KWD មិនមែនជាការតុបតែងឡើយ — វាជាជំនឿស្នូលរបស់ម៉ាកដែលបង្ហាញជារូបធាតុ។ វាតំណាងឱ្យ "
              )}
              <strong className="text-black font-black">
                {t("Flash Learning", "ការរៀនសូត្ររហ័ស (Flash Learning)")}
              </strong>
              {t(
                " — the conviction that in the age of AI, knowledge moves at the speed of light. Automation is rewriting every industry. The tools of the future belong to those who learn now. The bolt is our promise: ",
                " — ការជឿជាក់ថា ក្នុងយុគ AI ចំណេះដឹងដំណើរការក្នុងល្បឿននៃពន្លឺ។ ស្វ័យប្រវត្តិកម្មកំពុងសរសេរឡើងវិញរាល់ឧស្សាហកម្ម។ ឧបករណ៍នៃអនាគតជារបស់អ្នកដែលរៀននៅថ្ងៃនេះ។ ផ្លេកនេះគឺជាការប្ដេជ្ញារបស់យើង៖ "
              )}
              <strong className="text-black font-black">Kesararam With Digital</strong>
              {t(
                " will always give every Cambodian student the speed, the tools, and the confidence to learn with AI — and lead what comes next.",
                " នឹងផ្ដល់ឱ្យសិស្សខ្មែររាល់រូបនូវល្បឿន ឧបករណ៍ និងទំនុកចិត្ត ដើម្បីរៀនជាមួយ AI — និងដឹកនាំអ្វីដែលនឹងមកបន្ទាប់។"
              )}
            </p>
          </div>

          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {t(
              "kwd-black_nobackground.png is the primary logo — used across all surfaces.",
              "kwd-black_nobackground.png គឺជាឡូហ្គូចម្បងសម្រាប់ប្រើប្រាស់លើគ្រប់ផ្ទៃការងារ។"
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
              {t("Color Variants", "វ៉ារ្យ៉ង់ពណ៌")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { src: "/brand/kwd-gray.png",   file: "kwd-gray.png",   note: t("On white / light neutral bg", "លើផ្ទៃស ឬប្រផេះស្រាល") },
                { src: "/brand/kwd-green.png",  file: "kwd-green.png",  note: t("Success state · active", "ស្ថានភាពជោគជ័យ · សកម្ម") },
                { src: "/brand/kwd-yellow.png", file: "kwd-yellow.png", note: t("Brand accent · CTA", "ពណ៌សម្គាល់ម៉ាក · CTA") },
              ].map(({ src, file, note }) => (
                <div key={file} className="rounded-xl overflow-hidden border border-black/10">
                  <div className="h-24 flex items-center justify-center p-4 bg-white">
                    <Image src={src} alt={file} width={80} height={80} className="object-contain max-h-14" />
                  </div>
                  <div className="px-2.5 py-2 bg-zinc-50 border-t border-black/8">
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

        {/* ── 05 Applications ── */}
        <Section id="apply" num="05" title={t("Applications", "ការអនុវត្ត")} kf={kf} last>
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
            {t("Product Mockups", "ផលិតផលគំរូ")}
          </p>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {t(
              "Premium studio-quality physical mockups demonstrating the KWD branding applied consistently across diverse brand merchandise and digital platforms.",
              "គំរូបោះពុម្ពរូបរាងជាក់ស្ដែងកម្រិតស្ទូឌីយោលំដាប់ខ្ពស់ ដែលបង្ហាញពីការប្រើប្រាស់និមិត្តសញ្ញា KWD នៅលើផលិតផលម៉ាកចម្រុះ និងឧបករណ៍បច្គេកវិទ្យាឌីជីថលផ្សេងៗ។"
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {MOCKUP_ASSETS.map((m, i) => (
              <div 
                key={i} 
                className="group relative rounded-none border-[3px] border-black bg-white overflow-hidden shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                <div className="aspect-square relative overflow-hidden border-b-[3px] border-black bg-zinc-50">
                  <Image 
                    src={m.src} 
                    alt={m.title.en} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-4" style={kf}>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">
                    {t(`MOCKUP ${String(i + 1).padStart(2, "0")}`, `គំរូផលិតផល ${String(i + 1).padStart(2, "0")}`)}
                  </p>
                  <h3 className="text-sm font-black text-black mb-0.5">
                    {t(m.title.en, m.title.kh)}
                  </h3>
                </div>
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
