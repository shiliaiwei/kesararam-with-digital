"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/lang-context";


const COLORS = [
  { name: "Yellow",  hex: "#eab308", usage: "Primary CTA, road warning signs, brand accent" },
  { name: "Black",   hex: "#000000", usage: "Borders, text, structural elements" },
  { name: "White",   hex: "#ffffff", usage: "Background, negative space" },
  { name: "Blue",    hex: "#3b82f6", usage: "Informational signs, links, signals" },
  { name: "Red",     hex: "#ef4444", usage: "Prohibitory signs, danger, stop" },
  { name: "Green",   hex: "#22c55e", usage: "Success, active states, go" },
  { name: "Orange",  hex: "#f97316", usage: "Caution, attention, warning" },
  { name: "Purple",  hex: "#a855f7", usage: "Premium features, game modes" },
  { name: "Cyan",    hex: "#06b6d4", usage: "Accent, highlights, info" },
];

const LOGOS = [
  { file: "/brand/kwd-black.png",      label: "Primary — Black",      bg: "#ffffff", border: "#000" },
  { file: "/brand/kwd.svg",            label: "SVG Variant",          bg: "#ffffff", border: "#000" },
  { file: "/brand/KWD.png",            label: "PNG Variant",          bg: "#ffffff", border: "#000" },
  { file: "/brand/kwd-black-text.png", label: "Black with Text",      bg: "#ffffff", border: "#000" },
  { file: "/brand/kwd-yellow.png",     label: "Yellow Variant",       bg: "#000000", border: "#eab308" },
  { file: "/brand/kwd-green.png",      label: "Green Variant",        bg: "#000000", border: "#22c55e" },
  { file: "/brand/kwd-gray.png",       label: "Gray Variant",         bg: "#ffffff", border: "#000" },
  { file: "/brand/kwd-nbg.png",        label: "No Background",        bg: "#f4f4f5", border: "#000" },
  { file: "/brand/KWD-bl.png",         label: "Blue Variant",         bg: "#000000", border: "#3b82f6" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16">
      <div className="flex items-stretch gap-0 mb-6">
        <div className="w-1.5 bg-black" />
        <div className="bg-black px-4 py-2 flex items-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400">{id}</span>
        </div>
        <div className="flex-1 border-b-2 border-black flex items-end pb-1 pl-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-black text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-black uppercase tracking-widest text-yellow-400 mb-2">KWD — Kesararam With Digital</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3" style={kf}>
            {kh ? "ការណែនាំម៉ាក" : "Brand Guideline"}
          </h1>
          <p className="text-sm text-zinc-400 font-medium max-w-xl" style={kf}>
            {kh
              ? "ស្តង់ដារអត្តសញ្ញាណ ការរចនា និងការប្រើប្រាស់ម៉ាករបស់ KWD"
              : "The visual identity, design standards, and usage rules that define KWD across every surface."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">

        <Section id="01" title="Brand Name and Meaning">
          <div className="space-y-4 text-sm text-zinc-700 leading-relaxed font-medium" style={kf}>
            <p>
              <strong className="text-black font-black">KWD</strong> stands for{" "}
              <strong className="text-black font-black">Kesararam With Digital</strong> — a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school, the oldest seat of learning in its community. The word With is not a conjunction — it is a declaration of partnership between tradition and technology. Digital is not a medium — it is a commitment to access, to reach, to permanence.
            </p>
            <p>
              The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward. KWD exists because young Cambodian girls from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their language.
            </p>
            <p style={{ fontFamily: "Siemreap, sans-serif" }}>
              KWD — Kesararam With Digital — ជាឈ្មោះដែលបញ្ចូលគ្នារវាងប្រពៃណីនិងបច្ចេកវិទ្យា។ Kesararam គឺជាវត្ត និងសាលាបឋមសិក្សា — ទីកន្លែងរៀនសូត្រចំណាស់បំផុតក្នុងសហគមន៍។ Digital គឺជាការប្តេជ្ញាចិត្តចំពោះការចូលប្រើ ការឈានដល់ និងភាពអចិន្ត្រៃយ៍។
            </p>
          </div>
        </Section>

        <Section id="02" title="Logo">
          <p className="text-sm text-zinc-600 font-medium mb-6" style={kf}>
            {kh
              ? "ឡូហ្គូ KWD មានទម្រង់ច្រើន ដើម្បីប្រើប្រាស់លើផ្ទៃខ្នងផ្សេងៗ។ ប្រើ kwd-black ជាចម្បង។"
              : "The KWD logo exists in multiple forms. kwd-black is the primary logo — use it on all surfaces without background or border."}
          </p>
          {/* Primary logo hero — no bg, no border, full size */}
          <div className="flex flex-col items-center mb-10 py-12">
            <Image src="/brand/kwd-black.png" alt="KWD Primary Logo" width={240} height={240} className="object-contain" unoptimized />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-4">Primary Logo — kwd-black</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {LOGOS.map(({ file, label, bg, border }) => (
              <div key={file} className="border-2 border-black overflow-hidden shadow-[3px_3px_0_#000]">
                <div className="h-28 flex items-center justify-center p-4" style={{ background: bg, borderBottom: `2px solid ${border}` }}>
                  <Image src={file} alt={label} width={80} height={80} className="object-contain max-h-20" unoptimized />
                </div>
                <div className="px-3 py-2 bg-white">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black">{label}</p>
                  <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{file}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-2 border-black p-4 bg-zinc-50">
            <p className="text-xs font-black uppercase tracking-widest text-black mb-3">Usage Rules</p>
            <ul className="text-sm text-zinc-700 space-y-2 font-medium" style={kf}>
              <li>— Do not stretch, rotate, or distort the logo in any direction.</li>
              <li>— Do not apply drop shadows, gradients, or filters to the logo.</li>
              <li>— Do not place the logo on backgrounds that reduce contrast below readable threshold.</li>
              <li>— Maintain a minimum clear space equal to the height of the letter K on all sides.</li>
              <li>— Use the kwd-black variant as the primary logo on all light backgrounds. Use the yellow or white variant on dark backgrounds.</li>
              <li>— The logo must never appear smaller than 24px in height in digital contexts.</li>
            </ul>
          </div>
        </Section>

        <Section id="03" title="Color Palette">
          <p className="text-sm text-zinc-600 font-medium mb-6" style={kf}>
            {kh
              ? "ពណ៌ KWD ត្រូវបានជ្រើសរើសដោយផ្អែកលើប្រព័ន្ធសញ្ញាចរាចរ — ពណ៌នីមួយៗមានន័យ។"
              : "KWD colors are drawn directly from the road sign system — every color carries meaning."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLORS.map(({ name, hex, usage }) => (
              <div key={hex} className="border-2 border-black overflow-hidden shadow-[2px_2px_0_#000]">
                <div className="h-14" style={{ background: hex, borderBottom: "2px solid #000" }} />
                <div className="p-3 bg-white">
                  <p className="text-xs font-black uppercase text-black">{name}</p>
                  <p className="text-[10px] font-mono text-zinc-500 mb-1">{hex}</p>
                  <p className="text-[10px] text-zinc-600 leading-snug">{usage}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="04" title="Typography">
          <div className="space-y-4 text-sm text-zinc-700 font-medium" style={kf}>
            <div className="border-2 border-black p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Primary — Inter</p>
              <p className="text-4xl font-black text-black">Aa Bb Cc</p>
              <p className="text-sm text-zinc-500 mt-1">Used for all Latin text, UI labels, headings, and body copy.</p>
            </div>
            <div className="border-2 border-black p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Khmer — Siemreap</p>
              <p className="text-3xl font-black text-black" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ គ ឃ ង</p>
              <p className="text-sm text-zinc-500 mt-1">Used for all Khmer script content across the platform.</p>
            </div>
            <div className="border-2 border-black p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Type Scale</p>
              <p className="text-4xl font-black text-black leading-none">Display — Black 900</p>
              <p className="text-2xl font-black text-black">Heading — Black 900</p>
              <p className="text-base font-bold text-black">Subheading — Bold 700</p>
              <p className="text-sm font-medium text-zinc-700">Body — Medium 500</p>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Label — Black 900 Uppercase</p>
            </div>
          </div>
        </Section>

        <Section id="05" title="Design System">
          <div className="space-y-4 text-sm text-zinc-700 font-medium" style={kf}>
            <p>
              KWD uses a <strong className="text-black font-black">Neo-Brutalism</strong> design language — a system built on the visual grammar of road infrastructure. Every element is deliberate. Borders are structural, not decorative. Shadows are hard and directional, like the shadow cast by a road sign post. There are no gradients, no blur, no softness. The interface communicates with the same clarity that a stop sign communicates.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { rule: "Border Radius", value: "0px — always sharp corners" },
                { rule: "Border Width", value: "2px standard, 4px for emphasis" },
                { rule: "Shadow", value: "4px 4px 0 #000 — hard offset, no blur" },
                { rule: "Hover State", value: "-0.5px -0.5px translate, shadow 6px 6px" },
                { rule: "Active State", value: "+2px +2px translate, shadow removed" },
                { rule: "Transition", value: "100–150ms duration only" },
                { rule: "Gradients", value: "None — solid colors only" },
                { rule: "Animations", value: "Purposeful only — no decorative motion" },
              ].map(({ rule, value }) => (
                <div key={rule} className="border-2 border-black p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{rule}</p>
                  <p className="text-sm font-bold text-black mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="06" title="Voice and Tone">
          <div className="space-y-3 text-sm text-zinc-700 font-medium" style={kf}>
            <p>
              KWD speaks with <strong className="text-black font-black">precision and warmth</strong>. The platform is built by young girls for students — the voice is never condescending, never bureaucratic. It is direct because road safety is direct. It is warm because learning requires trust.
            </p>
            <p>
              In Khmer, the platform uses respectful but accessible register — the language of a knowledgeable peer, not an authority. In English, the tone is clear, active, and free of jargon.
            </p>
            <div className="border-2 border-black p-4 bg-zinc-50 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-black mb-2">Principles</p>
              <p>— Write to be understood, not to impress.</p>
              <p>— Use active voice. State what the user can do, not what the system does.</p>
              <p>— Error messages explain what happened and what to do next.</p>
              <p>— Labels are short. Descriptions are complete.</p>
              <p>— Bilingual content must carry equal meaning — not literal translation.</p>
            </div>
          </div>
        </Section>

        <div className="border-t-2 border-black pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-zinc-500 font-medium" style={kf}>
            &copy; {new Date().getFullYear()} KWD — Kesararam With Digital. Brand Guideline v1.0
          </p>
          <div className="flex gap-4 text-xs font-bold">
            <Link href="/terms" className="text-zinc-500 hover:text-black transition-colors" style={kf}>Terms</Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-black transition-colors" style={kf}>Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
