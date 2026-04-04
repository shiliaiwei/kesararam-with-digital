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

const LOGOS = [
  { file: "/brand/kwd-black-text.png",      label: "Primary — Black",   bg: "#ffffff" },
  { file: "/brand/kwd.svg",            label: "SVG",               bg: "#ffffff" },
  { file: "/brand/KWD.png",            label: "PNG",               bg: "#ffffff" },
  { file: "/brand/kwd-black-text.png", label: "Black + Text",      bg: "#ffffff" },
  { file: "/brand/kwd-gray.png",       label: "Gray",              bg: "#ffffff" },
];

const RULES = [
  "Do not stretch, rotate, or distort the logo.",
  "Do not apply drop shadows, gradients, or filters.",
  "Do not place the logo on low-contrast backgrounds.",
  "Maintain clear space equal to the height of K on all sides.",
  "Use kwd-black on light backgrounds. Use yellow or white on dark.",
  "Minimum logo height is 24px in any digital context.",
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
            src="/brand/kwd-black-text.png"
            alt="KWD"
            width={160}
            height={160}
            className="object-contain"
            unoptimized
          />
        </div>

        {/* ── Title ── */}
        <div className="mb-12">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] border border-black/20 px-3 py-1 rounded-full bg-white/80 mb-4" style={kf}>
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">01 — {kh ? "ឈ្មោះ និងន័យ" : "Brand Name & Meaning"}</p>
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">02 — {kh ? "ឡូហ្គូ" : "Logo"}</p>
          <p className="text-sm text-zinc-500 font-medium mb-8" style={kf}>
            {kh
              ? "kwd-black ជាឡូហ្គូចម្បង — ប្រើលើគ្រប់ផ្ទៃដោយគ្មានផ្ទៃខ្នង ឬស៊ុម។"
              : "kwd-black is the primary logo — use it on all surfaces without background or border."}
          </p>

          {/* Logo grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {LOGOS.map(({ file, label, bg }) => (
              <div key={file} className="rounded-xl overflow-hidden border border-black/8">
                <div
                  className="h-20 flex items-center justify-center p-3"
                  style={{ background: bg }}
                >
                  <Image src={file} alt={label} width={64} height={64} className="object-contain max-h-14" unoptimized />
                </div>
                <div className="px-2 py-1.5 bg-white">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">{label}</p>
                  <p className="text-[8px] text-zinc-300 font-mono truncate">{file}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Usage rules */}
          <div className="space-y-2">
            {RULES.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[10px] font-black text-zinc-300 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
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
              ? "KWD លើផលិតផល និងសម្ភារៈម៉ាក។"
              : "KWD applied across physical products and brand materials."}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775223638/wer_sbvdou.jpg",
              "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775223635/sdf_huxoqr.jpg",
              "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775223632/mu_pf6ixs.jpg",
              "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775223590/fhg_goo6bj.jpg",
              "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775223589/3sdse_u4gxe8.jpg",
            ].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-black/8 bg-zinc-50">
                <Image
                  src={src}
                  alt={`KWD product mockup ${i + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-44 object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/10 mb-12" />

        {/* ── 03 Color Palette ── */}
        <div className="mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">03 — {kh ? "ពណ៌" : "Color Palette"}</p>
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">04 — {kh ? "អក្សរ" : "Typography"}</p>

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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">05 — {kh ? "ប្រព័ន្ធរចនា" : "Design System"}</p>
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">06 — {kh ? "សំឡេង និងទឹកចិត្ត" : "Voice & Tone"}</p>
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
                <span className="text-[10px] font-black text-zinc-300 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm text-zinc-600 font-medium leading-snug" style={kf}>{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/kwd-black-text.png" alt="KWD" width={24} height={24} className="object-contain opacity-40" unoptimized />
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
