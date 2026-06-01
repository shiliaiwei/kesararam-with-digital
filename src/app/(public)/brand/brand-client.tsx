"use client";

import Image from "next/image";
import Link from "next/link";
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
  { src: "/brand/tote_stationery_mockup.png",    title: { en: "Tote & Stationery Set",        kh: "កាបូប & Stationery Set" } },
  { src: "/brand/devices_brand_mockup.png",      title: { en: "Digital Devices Dashboard",    kh: "Dashboard លើ Digital Devices" } },
  { src: "/brand/educational_blocks_mockup.png", title: { en: "Educational Toys & Cards",     kh: "ដុំឈើ & Learning Cards" } },
  { src: "/brand/mug_bottle_mockup.png",         title: { en: "Ceramic Mug & Metal Bottle",   kh: "Ceramic Mug & Metal Bottle" } },
  { src: "/brand/apparel_brand_mockup.png",      title: { en: "Premium Brand Apparel",        kh: "Brand Apparel" } },
];

// ─── Component ────────────────────────────────────────────────────────────
export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  return (
    <div className="min-h-screen bg-white text-black"
      style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">

        {/* ════ HERO ════════════════════════════════════════════════════════ */}
        <div className="mb-20">
          {/* Logo box */}
          <div className="flex justify-center mb-8">
            <div className="relative border-2 border-black p-8 bg-white shadow-[6px_6px_0_#000]">
              <Image src={LOGO_PRIMARY} alt="KWD" width={140} height={140} className="object-contain" priority />
              {/* caution stripe at bottom of logo box */}
              <div className="absolute bottom-0 left-0 right-0 h-[5px] caution-tape" />
            </div>
          </div>

          {/* Text block */}
          <div className="text-center">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] border-2 border-black px-3 py-1 bg-white mb-5" style={kf}>
              {t("Brand Guideline", "Brand Guideline")}
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 text-black">
              KWD
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 font-medium max-w-lg mx-auto mb-6" style={kf}>
              {t(
                "Visual identity, design standards, and usage rules that define KWD across every surface.",
                "Visual identity, design standard និងច្បាប់ប្រើ ដែលកំណត់ KWD លើគ្រប់ surface។"
              )}
            </p>
            {/* Motto */}
            <div className="inline-block border-2 border-black px-5 py-3 bg-amber-400 shadow-[4px_4px_0_#000]">
              <p className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-black" style={kf}>
                {t(
                  "Learn to know · Compete to excel · Protect for life",
                  "រៀនដើម្បីដឹង · ប្រកួតដើម្បីពូកែ · ការពារដើម្បីជីវិត"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ════ 01 — BRAND NAME ════════════════════════════════════════════ */}
        <Section id="name" num="01" title={t("Brand Name & Meaning", "ឈ្មោះ Brand និងន័យ")} kf={kf}>
          <div className="space-y-5 text-sm md:text-base text-zinc-700 leading-relaxed font-medium" style={kf}>
            <p>
              <strong className="text-black font-black">KWD</strong>{" "}
              {t("stands for ", "មានន័យថា ")}
              <strong className="text-black font-black">Kesararam With Digital</strong>
              {t(
                " — a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school — the oldest seat of learning in its community. The word With is not a conjunction — it declares partnership between tradition and technology. Digital is not a medium — it is a commitment to access, reach, and permanence.",
                " — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាវត្ត និងសាលាបឋម — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍។ ពាក្យ With មិនមែនជាតែឈ្នាប់ — វាប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និង technology។ Digital មិនមែនជាតែ medium — វាជាការប្ដេជ្ញាចំពោះការចូលប្រើ ការឈានដល់ និងស្ថិរភាព។"
              )}
            </p>
            <p>
              {t(
                "KWD exists because young Cambodian women from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their own language. The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward.",
                "KWD កើតឡើង ដោយយុវនារីខ្មែរពីសាលាបឋម Kesararam បានសម្រេចថា ចំណេះដឹងសុវត្ថិភាពចរាចរ — ចំណេះដឹងដែលសង្គ្រោះជីវិត — គួរឥតគិតថ្លៃ, interactive និងចូលប្រើបានជាភាសារបស់សិស្សគ្រប់រូប។ ឈ្មោះនេះបញ្ជាក់ថា ការអប់រំមិនបោះបង់ roots ពេលចូល digital age — ផ្ទុយទៅវិញ វានាំ roots ទៅមុខ។"
              )}
            </p>
          </div>

          {/* Recommended usage */}
          <div className="mt-6 border-2 border-black p-5 bg-amber-50 shadow-[4px_4px_0_#000]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 mb-3" style={kf}>
              ★ {t("Recommended Usage", "ការប្រើប្រាស់ដែលណែនាំ")}
            </p>
            <p className="text-sm font-medium text-zinc-700 leading-relaxed" style={kf}>
              {t("Always use the full name ", "ប្រើឈ្មោះពេញ ")}
              <strong className="text-black font-black">Kesararam With Digital</strong>
              {t(
                " when introducing the brand for the first time — in press, presentations, official documents, and partnerships. The abbreviation ",
                " នៅពេលណែនាំ brand លើកដំបូង — ក្នុង press, presentation, ឯកសារផ្លូវការ និង partnership។ "
              )}
              <strong className="text-black font-black">KWD</strong>
              {t(
                " may be used in subsequent references once the full name has been established.",
                " អាចប្រើបន្ទាប់ ក្រោយពី full name ត្រូវបានបញ្ជាក់ហើយ។"
              )}
            </p>
          </div>
        </Section>

        {/* ════ 02 — LOGO ══════════════════════════════════════════════════ */}
        <Section id="logo" num="02" title={t("Logo", "Logo")} kf={kf}>

          {/* Logo meaning */}
          <div className="mb-8 border-l-4 border-amber-400 pl-5 py-1">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2" style={kf}>
              {t("Logo Meaning", "ន័យ Logo")}
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed font-medium" style={kf}>
              {t(
                "The lightning bolt at the heart of the KWD mark is not ornamental — it is the brand's core belief made visible. It stands for ",
                "ផ្លេករបស់ logo KWD មិនមែនតុបតែង — វាជាជំនឿស្នូលរបស់ brand ។ វាតំណាងឱ្យ "
              )}
              <strong className="text-black font-black">
                {t("Flash Learning", "Flash Learning")}
              </strong>
              {t(
                " — the conviction that in the age of AI, knowledge moves at the speed of light. Automation is rewriting every industry. The tools of the future belong to those who learn now. The bolt is our promise: ",
                " — ការជឿថា ក្នុងយុគ AI ចំណេះដឹងដំណើរក្នុងល្បឿនពន្លឺ។ Automation កំពុងផ្លាស់ប្ដូររាល់ industry។ Tool នៃអនាគតជារបស់អ្នករៀននៅពេលនេះ។ ផ្លេកនេះជាការប្ដេជ្ញា៖ "
              )}
              <strong className="text-black font-black">Kesararam With Digital</strong>
              {t(
                " will always give every Cambodian student the speed, the tools, and the confidence to learn with AI — and lead what comes next.",
                " នឹងផ្ដល់ល្បឿន, tool និងទំនុកចិត្ត ដើម្បីរៀនជាមួយ AI — និងដឹកនាំអ្វីដែលមកបន្ទាប់។"
              )}
            </p>
          </div>

          {/* Primary + Dark */}
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
            {t("Official Logo", "Logo ផ្លូវការ")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <LogoCard
              bg="bg-white"
              border="border-black/15"
              imgSrc={LOGO_PRIMARY}
              filename="kwd-black_nobackground.png"
              badge={t("★ Primary — Always Use This", "★ Primary — ប្រើនេះជានិច្ច")}
              badgeColor="text-amber-500"
              note={t("On light backgrounds", "លើ background ភ្លឺ")}
              kf={kf}
            />
            <LogoCard
              bg="bg-zinc-900"
              border="border-black/10"
              imgSrc={LOGO_PRIMARY}
              filename="kwd-black_nobackground.png"
              badge="+ CSS filter: invert(1)"
              badgeColor="text-zinc-400"
              note={t("On dark backgrounds", "លើ background ងងឹត")}
              invert
              kf={kf}
            />
          </div>

          {/* Color variants */}
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
            {t("Color Variants", "Logo Variants")}
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { src: "/brand/kwd-gray.png",   file: "kwd-gray.png",   note: t("On white / light neutral", "លើ background ស ឬ neutral") },
              { src: "/brand/kwd-green.png",  file: "kwd-green.png",  note: t("Success · active",          "Success state · active") },
              { src: "/brand/kwd-yellow.png", file: "kwd-yellow.png", note: t("Brand accent · CTA",        "Brand accent · CTA") },
            ].map(({ src, file, note }) => (
              <div key={file} className="border-2 border-black/10 overflow-hidden">
                <div className="h-24 flex items-center justify-center p-4 bg-white">
                  <Image src={src} alt={file} width={72} height={72} className="object-contain max-h-14" />
                </div>
                <div className="px-3 py-2 bg-zinc-50 border-t border-black/8">
                  <p className="text-[9px] font-black uppercase tracking-wide text-zinc-700">{file}</p>
                  <p className="text-[8px] text-zinc-400 font-medium mt-0.5" style={kf}>{note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Usage rules */}
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-3" style={kf}>
            {t("Usage Rules", "ច្បាប់ប្រើ")}
          </p>
          <div className="border-2 border-black/8 divide-y divide-black/5">
            {RULES.map((r, i) => (
              <div key={i} className="flex items-start gap-4 px-4 py-2.5">
                <span className="text-[9px] font-black text-amber-500 mt-0.5 flex-shrink-0 w-5">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm text-zinc-600 font-medium leading-snug" style={kf}>{t(r.en, r.kh)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════ 03 — COLOR PALETTE ═════════════════════════════════════════ */}
        <Section id="color" num="03" title={t("Color Palette", "Color Palette")} kf={kf}>
          <p className="text-sm text-zinc-500 font-medium mb-6" style={kf}>
            {t(
              "KWD colors are drawn directly from the road sign system — every color carries meaning.",
              "ពណ៌ KWD ត្រូវបានយកចេញពីប្រព័ន្ធសញ្ញាចរាចរ — ពណ៌គ្រប់ពណ៌មានន័យ។"
            )}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {COLORS.map(({ name, hex, role }) => (
              <div key={hex} className="group cursor-default">
                <div
                  className="h-14 mb-2 border-[3px] border-black shadow-[3px_3px_0_#000] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[5px_5px_0_#000] transition-all duration-100"
                  style={{ background: hex }}
                />
                <p className="text-[10px] font-black text-black uppercase tracking-wide">{name}</p>
                <p className="text-[9px] font-mono text-zinc-400">{hex}</p>
                <p className="text-[8px] text-zinc-400 leading-snug mt-0.5 hidden group-hover:block" style={kf}>
                  {t(role.en, role.kh)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════ 04 — TYPOGRAPHY ════════════════════════════════════════════ */}
        <Section id="type" num="04" title={t("Typography", "Typography")} kf={kf}>
          {/* Two font specimens side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="border-2 border-black p-5 shadow-[4px_4px_0_#000]">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-3">English — Inter</p>
              <p className="text-5xl font-black text-black leading-none mb-2">Aa</p>
              <p className="text-base font-black text-black mb-0.5">ABCDEFGHIJKLM</p>
              <p className="text-base font-medium text-zinc-500 mb-3">abcdefghijklm</p>
              <p className="text-[10px] text-zinc-400 leading-relaxed" style={kf}>
                {t("All Latin text, UI labels, headings, body copy.", "Latin text ទាំងអស់ · label · heading · body")}
              </p>
            </div>
            <div className="border-2 border-black p-5 shadow-[4px_4px_0_#000]">
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
          <div className="border-2 border-black/8 divide-y divide-black/5">
            {[
              { label: "Display",    size: "text-5xl",  weight: "font-black",  sample: "900 — Display" },
              { label: "Heading",    size: "text-3xl",  weight: "font-black",  sample: "900 — Heading" },
              { label: "Subheading", size: "text-xl",   weight: "font-bold",   sample: "700 — Subheading" },
              { label: "Body",       size: "text-base", weight: "font-medium", sample: "500 — Body text" },
              { label: "Label",      size: "text-xs",   weight: "font-black",  sample: "900 — LABEL UPPERCASE" },
            ].map(({ label, size, weight, sample }) => (
              <div key={label} className="flex items-center gap-6 px-4 py-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 w-20 flex-shrink-0">{label}</span>
                <p className={`${size} ${weight} text-black leading-none ${label === "Label" ? "uppercase tracking-widest" : ""}`}>{sample}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════ 05 — APPLICATIONS ══════════════════════════════════════════ */}
        <Section id="apply" num="05" title={t("Applications", "ការប្រើប្រាស់")} kf={kf} last>
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
                className="group border-[3px] border-black bg-white shadow-[4px_4px_0_#000] hover:shadow-[7px_7px_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden"
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
                <div className="px-4 py-3">
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">
                    {t(`MOCKUP ${String(i + 1).padStart(2, "0")}`, `គំរូ ${String(i + 1).padStart(2, "0")}`)}
                  </p>
                  <p className="text-sm font-black text-black" style={kf}>{t(m.title.en, m.title.kh)}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>


        {/* ════ FOOTER ═════════════════════════════════════════════════════ */}
        <div className="border-t-2 border-black pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

// ─── Section wrapper ───────────────────────────────────────────────────────
function Section({
  id, num, title, kf, last, children,
}: {
  id: string; num: string; title: string;
  kf: React.CSSProperties; last?: boolean; children: React.ReactNode;
}) {
  return (
    <>
      <section id={id} className="scroll-mt-6 mb-16">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-7 pb-4 border-b-2 border-black">
          <span className="bg-amber-400 border-2 border-black text-black text-[10px] font-black px-2.5 py-1 shadow-[2px_2px_0_#000]">
            {num}
          </span>
          <h2 className="text-base md:text-lg font-black uppercase tracking-wide text-black" style={kf}>
            {title}
          </h2>
        </div>
        {children}
      </section>
      {!last && <div className="caution-tape mb-16" />}
    </>
  );
}

// ─── Logo display card ─────────────────────────────────────────────────────
function LogoCard({
  bg, border, imgSrc, filename, badge, badgeColor, note, invert, kf,
}: {
  bg: string; border: string; imgSrc: string; filename: string;
  badge: string; badgeColor: string; note: string; invert?: boolean;
  kf: React.CSSProperties;
}) {
  return (
    <div className={`border-2 ${border} overflow-hidden`}>
      <div className={`h-44 flex items-center justify-center p-8 ${bg}`}>
        <Image
          src={imgSrc} alt="KWD" width={160} height={160}
          className={`object-contain max-h-28 ${invert ? "invert" : ""}`}
        />
      </div>
      <div className="px-4 py-3 bg-zinc-50 border-t border-black/8">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-wide leading-tight">{filename}</p>
        <p className={`text-[9px] font-bold mt-0.5 ${badgeColor}`}>{badge}</p>
        <p className="text-[8px] text-zinc-400 font-medium mt-0.5" style={kf}>{note}</p>
      </div>
    </div>
  );
}
