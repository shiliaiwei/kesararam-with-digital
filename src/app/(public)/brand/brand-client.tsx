"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";
import {
  Bolt,
  Palette,
  Type,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  FileText,
  Sparkles,
  Download,
  LayoutGrid,
  Maximize2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Search,
  BookOpen
} from "lucide-react";

const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

// ─── Color palette (Identical to original) ──────────────────────────────────
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

// ─── Logo usage rules (Identical to original) ───────────────────────────────
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

// ─── Product mockups (Identical to original) ────────────────────────────────
const MOCKUP_ASSETS: { src: string; title: { en: string; kh: string } }[] = [
  { src: "/brand/tote_stationery_mockup.png",    title: { en: "Tote & Stationery Set",      kh: "កាបូប & Stationery Set" } },
  { src: "/brand/educational_blocks_mockup.png", title: { en: "Educational Toys & Cards",   kh: "ដុំឈើ & Learning Cards" } },
  { src: "/brand/mug_bottle_mockup.png",         title: { en: "Ceramic Mug & Metal Bottle", kh: "Ceramic Mug & Metal Bottle" } },
  { src: "/brand/apparel_brand_mockup.png",      title: { en: "Premium Brand Apparel",      kh: "Brand Apparel" } },
];

// ─── Section index (Identical to original) ──────────────────────────────────
const SECTIONS: { id: string; num: string; icon: any; accent: string; title: { en: string; kh: string } }[] = [
  { id: "name",  num: "01", icon: FileText,   accent: "#eab308", title: { en: "Brand Name & Meaning", kh: "ឈ្មោះ Brand និងន័យ" } },
  { id: "logo",  num: "02", icon: Bolt,       accent: "#3b82f6", title: { en: "Logo",          kh: "Logo" } },
  { id: "color", num: "03", icon: Palette,    accent: "#a855f7", title: { en: "Color Palette", kh: "Color Palette" } },
  { id: "type",  num: "04", icon: Type,       accent: "#22c55e", title: { en: "Typography",    kh: "Typography" } },
  { id: "apply", num: "05", icon: ImageIcon,  accent: "#f97316", title: { en: "Applications",  kh: "ការប្រើប្រាស់" } },
];

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  // States
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  const [logoBg, setLogoBg] = useState<string>("white");
  const [logoInvert, setLogoInvert] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCodeText, setCopiedCodeText] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>("");
  const [selectedMockup, setSelectedMockup] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Clipboard helper
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(kh ? `បានចម្លង ${label} ទៅ Clipboard! ⚡` : `Copied ${label} to clipboard! ⚡`);
  };

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300">
      
      {/* ════ HERO — Spec Cover ═══════════════════════════════════════════ */}
      <header className="relative overflow-hidden bg-zinc-900 text-white border-b-4 border-black dark:border-zinc-800">
        
        {/* Caution Tape Strip */}
        <div className="absolute top-0 inset-x-0 h-3 caution-tape z-20 shadow-md" />

        {/* Blueprint Grid Overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "clamp(24px, 5vw, 44px) clamp(24px, 5vw, 44px)",
          }}
        />

        {/* Large Decorative Aura Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Decorative corner registration crosshairs */}
        <CornerCrosshairs containerClass="absolute inset-0 p-4 sm:p-6" color="border-yellow-400/40" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14 flex flex-col items-center text-center">
          
          {/* Logo Tile with custom hover rotate */}
          <div className="group relative mb-8 rounded-3xl border-4 border-black dark:border-zinc-700 bg-white p-6 shadow-[8px_8px_0_#000] hover:shadow-[12px_12px_0_#eab308] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <Image
              src={LOGO_PRIMARY}
              alt="KWD Logo"
              width={112}
              height={112}
              className="object-contain w-20 h-20 sm:w-28 sm:h-28 group-hover:scale-105 transition-transform duration-300"
              priority
            />
            {/* Embedded caution ribbon */}
            <div className="absolute bottom-0 inset-x-0 h-2 caution-tape" />
          </div>

          {/* Eyebrow badge pills */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-yellow-400" style={kf}>
                {t("Brand Guideline", "Brand Guideline")}
              </span>
            </span>
            <span className="rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white/60">
              v1.0
            </span>
            <span className="rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white/60">
              EN · ខ្មែរ
            </span>
          </div>

          {/* Main wordmark title */}
          <h1
            className="max-w-full font-black tracking-tighter leading-[0.85] text-white select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            style={{ fontSize: "clamp(4rem, 16vw, 9.5rem)" }}
          >
            K<span className="text-yellow-400 relative">W<span className="absolute -top-4 -right-4 text-xs font-mono text-yellow-400/40 select-none hidden sm:inline">[DNA]</span></span>D
          </h1>

          {/* Interactive decorative indicator */}
          <div className="mt-6 mb-6 flex items-center justify-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-yellow-400" />
            <Bolt className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="h-1.5 w-16 rounded-full bg-yellow-400" />
          </div>

          {/* Description */}
          <p className="max-w-md sm:max-w-xl text-sm sm:text-base text-zinc-300 font-medium leading-relaxed" style={kf}>
            {t(
              "Visual identity, design standards, and usage rules that define KWD across every surface.",
              "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ KWD ។"
            )}
          </p>
        </div>

        {/* Dual Marquee strip (moving in opposite directions) */}
        <div className="relative z-10 border-t border-b-2 border-black dark:border-zinc-800 bg-black/60 backdrop-blur-sm divide-y divide-white/5 overflow-hidden">
          
          {/* Marquee Row 1 (Leftwards) */}
          <div className="flex py-3.5 select-none overflow-hidden">
            {[0, 1].map((track) => (
              <div
                key={track}
                aria-hidden={track === 1}
                className="flex shrink-0 items-center animate-marquee"
                style={{ ["--duration" as any]: "24s", ["--gap" as any]: "0px" }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="flex items-center">
                    <Bolt className="text-yellow-400 w-4 h-4 mx-5" />
                    {kh ? (
                      <span
                        className="text-xs sm:text-sm text-white font-google-sans whitespace-nowrap"
                      >
                        រៀនដើម្បីដឹង · ប្រកួតដើម្បីពូកែ · ការពារដើម្បីជីវិត
                      </span>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-white whitespace-nowrap">
                        Learn to know · Compete to excel · Protect for life
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Marquee Row 2 (Rightwards) */}
          <div className="flex py-3.5 select-none overflow-hidden" style={{ direction: 'rtl' }}>
            {[0, 1].map((track) => (
              <div
                key={track}
                aria-hidden={track === 1}
                className="flex shrink-0 items-center animate-marquee"
                style={{ ["--duration" as any]: "24s", ["--gap" as any]: "0px" }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="flex items-center" style={{ direction: 'ltr' }}>
                    <Bolt className="text-cyan-400 w-4 h-4 mx-5" />
                    {kh ? (
                      <span
                        className="text-xs sm:text-sm text-white font-google-sans whitespace-nowrap"
                      >
                        រៀនដើម្បីដឹង · ប្រកួតដើម្បីពូកែ · ការពារដើម្បីជីវិត
                      </span>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-white whitespace-nowrap">
                        Learn to know · Compete to excel · Protect for life
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ════ MAIN CONTAINER ═══════════════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Mobile Sticky Navigation (Frosted glass bubble navigation) */}
        <nav className="lg:hidden sticky top-14 z-30 -mx-4 px-4 py-3 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b-2 border-black dark:border-zinc-800">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              const IconComp = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-xl border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    on ? "bg-black text-white dark:bg-white dark:text-black shadow-[3px_3px_0_#000]" : "bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800"
                  }`}
                  style={kf}
                >
                  <IconComp className="w-3.5 h-3.5" style={{ color: on ? s.accent : "#9ca3af" }} />
                  <span>{t(s.title.en, s.title.kh)}</span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* Split sidebar layout */}
        <div className="grid gap-8 py-12 md:py-16 lg:grid-cols-[260px_1fr] lg:gap-12 items-start">
          
          {/* Desktop Frosted Glass Left TOC */}
          <aside className="hidden lg:block sticky top-24 z-20">
            <div className="rounded-2xl border-2 border-black dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md p-4 shadow-[4px_4px_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_rgba(255,255,255,0.1)] space-y-2">
              <div className="px-2 py-1 mb-2">
                <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">{t("GUIDE INDEX", "មាតិកាណែនាំ")}</span>
              </div>
              {SECTIONS.map((s) => {
                const on = active === s.id;
                const IconComp = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`group flex items-center justify-between rounded-xl border-2 px-3 py-3 transition-all duration-200 ${
                      on
                        ? "border-black bg-black text-white dark:bg-white dark:text-black shadow-[3px_3px_0_#000]"
                        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black text-[10px] font-black"
                        style={{ background: on ? s.accent : "#fff", color: on ? "#fff" : "#000" }}
                      >
                        {s.num}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wider leading-tight" style={kf}>
                        {t(s.title.en, s.title.kh)}
                      </span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${on ? "translate-x-0.5" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"}`} />
                  </a>
                );
              })}
            </div>
          </aside>

          {/* Content sections stack */}
          <div className="min-w-0 space-y-12 sm:space-y-16">

            {/* ════ 01 — BRAND NAME ════════════════════════════════════════ */}
            <SectionShell s={SECTIONS[0]} title={t(SECTIONS[0].title.en, SECTIONS[0].title.kh)} kf={kf}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
                
                {/* Visual narrative panel */}
                <div className="md:col-span-8 space-y-5 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-medium" style={kf}>
                  {kh ? (
                    <>
                      <p>
                        <strong className="text-black dark:text-white font-black">KWD</strong>{" "}
                        មានន័យថា <strong className="text-black dark:text-white font-black">Kesararam With Digital</strong> — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍។ ពាក្យ With មិនមែនជាឈ្នាប់ វាប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និង technology។ ឌីជីថល (Digital) មិនមែនត្រឹមតែជាឧបករណ៍សម្រាប់ផ្សព្វផ្សាយនោះទេ — ប៉ុន្តែវាគឺជាការប្តេជ្ញាចិត្តក្នុងការផ្តល់ជូននូវ ឱកាសខិតជិត (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។
                      </p>
                      <p>
                        KWD ត្រូវបានបង្កើតឡើងដោយយុវនារីខ្មែរនៃសាលាបឋមសិក្សា កេសរារាម ក្រោមទស្សនវិស័យមួយថា៖ ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍ដែលសង្គ្រោះជីវិតមនុស្ស បានគួរតែផ្តល់ជូនដោយឥតគិតថ្លៃ មានលក្ខណៈអន្តរកម្ម និងងាយស្រួលចូលប្រើប្រាស់ជាភាសាកំណើតរបស់សិស្សគ្រប់រូប។ ឈ្មោះនេះបញ្ជាក់ឱ្យឃើញថា ការអប់រំមិនបានបោះបង់ចោលអត្តសញ្ញាណ និងឫសគល់វប្បធម៌នៅក្នុងយុគសម័យឌីជីថលនោះទេ — ប៉ុន្តែវាគឺជាការជំរុញឱ្យឫសគល់ទាំងនោះ កាន់តែរីកចម្រើនទៅមុខតាមបច្ចេកវិទ្យា។
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong className="text-black dark:text-white font-black">KWD</strong>{" "}
                        stands for{" "}
                        <strong className="text-black dark:text-white font-black">Kesararam With Digital</strong>
                        {" "}— a name that carries the weight of place, purpose, and transformation. Kesararam is a monastery and primary school — the oldest seat of learning in its community. The word With is not a conjunction — it declares partnership between tradition and technology. Digital is not a medium — it is a commitment to access, reach, and permanence.
                      </p>
                      <p>
                        KWD exists because young Cambodian women from Kesararam decided that road safety knowledge — knowledge that saves lives — should be free, interactive, and available to every student in their own language. The name asserts that education does not abandon its roots when it enters the digital age. It carries them forward.
                      </p>
                    </>
                  )}
                </div>

                {/* Pill pillar cards */}
                <div className="md:col-span-4 flex flex-col gap-3">
                  <div className="rounded-2xl border-2 border-black dark:border-zinc-800 bg-yellow-50 dark:bg-yellow-950/20 p-4 flex gap-3">
                    <span className="text-2xl font-black text-yellow-600">K</span>
                    <div>
                      <p className="text-xs font-black uppercase text-yellow-600">Kesararam</p>
                      <p className="text-[11px] text-zinc-500 font-bold leading-tight" style={kf}>
                        {t("Heritage & local roots", "កេរ្តិ៍ដំណែល និងឫសគល់ក្នុងតំបន់")}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-black dark:border-zinc-800 bg-cyan-50 dark:bg-cyan-950/20 p-4 flex gap-3">
                    <span className="text-2xl font-black text-cyan-600">W</span>
                    <div>
                      <p className="text-xs font-black uppercase text-cyan-600">With</p>
                      <p className="text-[11px] text-zinc-500 font-bold leading-tight" style={kf}>
                        {t("Partnership & connection", "ភាពជាដៃគូ និងការតភ្ជាប់")}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-black dark:border-zinc-800 bg-purple-50 dark:bg-purple-950/20 p-4 flex gap-3">
                    <span className="text-2xl font-black text-purple-600">D</span>
                    <div>
                      <p className="text-xs font-black uppercase text-purple-600">Digital</p>
                      <p className="text-[11px] text-zinc-500 font-bold leading-tight" style={kf}>
                        {t("AI access & permanence", "លទ្ធភាពទទួលបាន AI & និរន្តរភាព")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Usage Block with DNA Banner */}
              <div className="mt-8 relative overflow-hidden rounded-2xl border-2 border-black dark:border-zinc-800 bg-amber-50 dark:bg-zinc-900/60 p-6 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_rgba(255,255,255,0.1)]">
                <CornerCrosshairs containerClass="absolute inset-0 p-3" color="border-amber-400/30" />
                <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-zinc-300 dark:text-zinc-700 tracking-widest hidden sm:block">
                  [SPEC_01]
                </div>
                
                <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 dark:text-yellow-500" style={kf}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("Recommended Usage", "ការប្រើប្រាស់និងការណែនាំ")}
                </p>
                <p className="text-sm sm:text-base font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed relative z-10" style={kf}>
                  {kh ? (
                    <>
                      ត្រូវប្រើឈ្មោះពេញ <strong className="text-black dark:text-white font-black">«Kesararam With Digital»</strong> សម្រាប់ការណែនាំម៉ាកយីហោ (Brand) លើកដំបូង ក្នុងកម្មវិធីសារព័ត៌មាន បទបង្ហាញ ឯកសារផ្លូវការ និងដៃគូសហការ។ លោកអ្នកអាចប្រើពាក្យកាត់ <strong className="text-black dark:text-white font-black">«KWD»</strong> នៅផ្នែកបន្ទាប់ ក្រោយពេលដែលបានបង្ហាញឈ្មោះពេញរួច។
                    </>
                  ) : (
                    <>
                      Always use the full name{" "}
                      <strong className="text-black dark:text-white font-black">Kesararam With Digital</strong>
                      {" "}when introducing the brand for the first time — in press, presentations, official documents, and partnerships. The abbreviation{" "}
                      <strong className="text-black dark:text-white font-black">KWD</strong>
                      {" "}may be used in subsequent references once the full name has been established.
                    </>
                  )}
                </p>
              </div>
            </SectionShell>

            {/* ════ 02 — LOGO ══════════════════════════════════════════════ */}
            <SectionShell s={SECTIONS[1]} title={t(SECTIONS[1].title.en, SECTIONS[1].title.kh)} kf={kf}>
              
              {/* Logo Philosophy meaning banner */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-black dark:border-zinc-800 bg-blue-50/60 dark:bg-zinc-900/40 p-6">
                <CornerCrosshairs containerClass="absolute inset-0 p-3" color="border-blue-400/20" />
                <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400" style={kf}>
                  <Bolt className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  {t("Logo Meaning", "ន័យ Logo")}
                </p>
                {kh ? (
                  <div className="space-y-3 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium" style={kf}>
                    <p>
                      និមិត្តសញ្ញាផ្លេកបន្ទោរនៅលើឡូហ្គោ KWD មិនមែនជាការតុបតែងលម្អឡើយ តែវាជាទស្សនវិជ្ជាស្នូលរបស់ Brand។ វាផ្ដល់អត្ថន័យដល់{" "}
                      <strong className="text-black dark:text-white font-black">Flash Learning</strong>{" "}
                      ដោយឈរលើជំនឿថា ក្នុងយុគសម័យ AI ចំណេះដឹងត្រូវតែដើរក្នុងល្បឿននៃពន្លឺ។
                    </p>
                    <p>
                      ស្របពេលដែល Automation កំពុងផ្លាស់ប្ដូររាល់ឧស្សាកម្ម បច្ចេកវិទ្យានៃអនាគតជារបស់អ្នកដែលរៀនសូត្រនៅថ្ងៃនេះ។ និមិត្តសញ្ញានេះជាការប្ដេជ្ញាចិត្តរបស់{" "}
                      <strong className="text-black dark:text-white font-black">Kesararam With Digital</strong>{" "}
                      ក្នុងការផ្ដល់នូវល្បឿន ឧបករណ៍ និងទំនុកចិត្ត ដើម្បីសិក្សារួមគ្នាជាមួយ AI និងដឹកនាំការផ្លាស់ប្ដូរនាពេលខាងមុខ។
                    </p>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    The lightning bolt at the heart of the KWD mark is not ornamental — it is the brand&apos;s core belief made visible. It stands for{" "}
                    <strong className="text-black dark:text-white font-black">Flash Learning</strong>
                    {" "}— the conviction that in the age of AI, knowledge moves at the speed of light. Automation is rewriting every industry. The tools of the future belong to those who learn now. The bolt is our promise:{" "}
                    <strong className="text-black dark:text-white font-black">Kesararam With Digital</strong>
                    {" "}will always give every Cambodian student the speed, the tools, and the confidence to learn with AI — and lead what comes next.
                  </p>
                )}
              </div>

              {/* ─── Logo Visualizer Playground ─── */}
              <div className="mt-8 border-2 border-black dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_rgba(255,255,255,0.05)]">
                
                {/* Visualizer header */}
                <div className="px-5 py-4 border-b-2 border-black dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300" style={kf}>
                      {t("Interactive Logo Playground", "សាកល្បងឡូហ្គោអន្តរកម្ម")}
                    </span>
                  </div>
                  
                  {/* Selector swatches */}
                  <div className="flex items-center gap-1.5 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl">
                    {[
                      { id: "white", bg: "bg-white", border: "border-zinc-300" },
                      { id: "dark", bg: "bg-zinc-900", border: "border-zinc-800" },
                      { id: "yellow", bg: "bg-yellow-400", border: "border-yellow-500" },
                      { id: "cyan", bg: "bg-cyan-400", border: "border-cyan-500" },
                      { id: "green", bg: "bg-green-500", border: "border-green-600" },
                      { id: "red", bg: "bg-red-500", border: "border-red-600" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setLogoBg(btn.id)}
                        className={`w-5 h-5 rounded-full ${btn.bg} ${btn.border} border cursor-pointer transition-all duration-150 ${logoBg === btn.id ? "scale-125 ring-2 ring-black dark:ring-white" : "hover:scale-115 opacity-80"}`}
                        title={btn.id}
                      />
                    ))}
                  </div>
                </div>

                {/* Sandbox Frame */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black dark:divide-zinc-800">
                  
                  {/* Logo container */}
                  <div className={`h-64 flex flex-col items-center justify-center p-6 relative transition-colors duration-300 ${
                    logoBg === "white" ? "bg-white" :
                    logoBg === "dark" ? "bg-zinc-950" :
                    logoBg === "yellow" ? "bg-yellow-400" :
                    logoBg === "cyan" ? "bg-cyan-400" :
                    logoBg === "green" ? "bg-green-500" : "bg-red-500"
                  }`}>
                    <Image
                      src={LOGO_PRIMARY}
                      alt="KWD Brand Logo"
                      width={160}
                      height={160}
                      className={`object-contain max-h-36 transition-all duration-300 ${logoInvert ? "invert" : ""}`}
                    />
                    
                    {/* Contrast badge indicator */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/80 rounded-lg text-[9px] text-white font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span>{logoBg.toUpperCase()} SURFACE</span>
                    </div>
                  </div>

                  {/* Dev resource side panel */}
                  <div className="p-5 flex flex-col justify-between bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t("ASSET FILENAME", "ឈ្មោះឯកសារ Asset")}</span>
                        <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">kwd-black_nobackground.png</p>
                      </div>
                      
                      {/* Interactive CSS toggle */}
                      <div className="flex items-center justify-between border border-black/10 dark:border-white/10 rounded-xl p-3 bg-white dark:bg-zinc-900">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-black dark:text-white" style={kf}>
                            {t("Invert Contrast (CSS)", "ប្ដូរ Contrast ឡូហ្គោ (CSS)")}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-medium" style={kf}>
                            {t("Apply filter: invert(1)", "អនុវត្ត filter: invert(1)")}
                          </p>
                        </div>
                        <button
                          onClick={() => setLogoInvert(!logoInvert)}
                          className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${logoInvert ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                        >
                          <span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${logoInvert ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </div>

                      {/* Code Snippet Box */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t("HTML CODE", "កូដ HTML")}</span>
                          <button
                            onClick={() => {
                              const code = `<img src="${LOGO_PRIMARY}" alt="KWD Logo" style="${logoInvert ? 'filter: invert(1);' : ''}" />`;
                              copyToClipboard(code, "HTML snippet");
                              setCopiedCodeText("html");
                              setTimeout(() => setCopiedCodeText(null), 2000);
                            }}
                            className="text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1"
                          >
                            {copiedCodeText === "html" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCodeText === "html" ? t("Copied", "បានចម្លង") : t("Copy", "ចម្លង")}</span>
                          </button>
                        </div>
                        <div className="rounded-xl border border-black/10 dark:border-white/10 p-2.5 bg-zinc-950 font-mono text-[10px] sm:text-xs text-green-400 overflow-x-auto select-all">
                          {`&lt;img src="${LOGO_PRIMARY}" alt="KWD Logo" ${logoInvert ? 'style="filter: invert(1);"' : ''} /&gt;`}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                      <span>{t("Primary asset format: PNG (Lossless)", "Format ឡូហ្គោផ្លូវការ: PNG (Lossless)")}</span>
                      <span>256 x 256 px</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Color variants ─── */}
              <div className="mt-8">
                <SubLabel kf={kf}>{t("Color Variants", "Logo Variants")}</SubLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { src: "/brand/kwd-gray.png",   file: "kwd-gray.png",   note: t("On white / light neutral", "លើ background ស ឬ neutral"), accent: "hover:shadow-zinc-500" },
                    { src: "/brand/kwd-green.png",  file: "kwd-green.png",  note: t("Success · active",          "Success state · active"), accent: "hover:shadow-green-500" },
                    { src: "/brand/kwd-yellow.png", file: "kwd-yellow.png", note: t("Brand accent · CTA",        "Brand accent · CTA"), accent: "hover:shadow-yellow-500" },
                  ].map(({ src, file, note, accent }) => (
                    <div key={file} className={`group overflow-hidden rounded-2xl border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_rgba(255,255,255,0.05)] transition-all duration-200 ${accent} hover:-translate-y-0.5`}>
                      <div className="h-28 flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900/80 border-b-2 border-black dark:border-zinc-800">
                        <Image src={src} alt={file} width={80} height={80} className="object-contain max-h-16 group-hover:scale-105 transition-transform duration-200" />
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{file}</p>
                          <span className="text-[8px] font-mono text-zinc-400">PNG</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed" style={kf}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Usage rules ─── */}
              <div className="mt-8">
                <SubLabel kf={kf}>{t("Usage Rules", "ច្បាប់ប្រើ")}</SubLabel>
                <div className="grid gap-3 sm:grid-cols-2">
                  {RULES.map((r, i) => {
                    const ok = i >= 3 && i !== 6; // Custom highlights for rules to make them visual
                    return (
                      <div key={i} className={`flex items-start gap-4 rounded-2xl border-2 p-4 transition-all duration-150 hover:-translate-y-0.5 ${
                        ok 
                          ? "border-green-600 bg-green-50/50 dark:bg-green-950/10 text-green-900 dark:text-green-300"
                          : "border-black dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      }`}>
                        {ok ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">
                            {ok ? t("DO THIS", "ត្រូវធ្វើ") : t("DON'T DO THIS", "កុំធ្វើ")}
                          </p>
                          <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={kf}>{t(r.en, r.kh)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionShell>

            {/* ════ 03 — COLOR PALETTE ═════════════════════════════════════ */}
            <SectionShell s={SECTIONS[2]} title={t(SECTIONS[2].title.en, SECTIONS[2].title.kh)} kf={kf}>
              <p className="text-sm sm:text-base text-zinc-500 font-semibold mb-6" style={kf}>
                {t(
                  "KWD colors are drawn directly from the road sign system — every color carries meaning.",
                  "ពណ៌ KWD ត្រូវបានយកចេញពីប្រឡាយប្រព័ន្ធសញ្ញាចរាចរ — ពណ៌គ្រប់ពណ៌មានន័យ។"
                )}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {COLORS.map(({ name, hex, role }, idx) => (
                  <div
                    key={hex}
                    className="group relative overflow-hidden rounded-2xl border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_rgba(255,255,255,0.05)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Swatch color cap */}
                    <div className="h-20 w-full relative transition-all duration-300 group-hover:h-24" style={{ background: hex }}>
                      {/* Copy hover block */}
                      <button
                        onClick={() => {
                          copyToClipboard(hex, `Color ${name}`);
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="absolute inset-0 bg-black/35 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-black uppercase tracking-widest cursor-pointer transition-opacity duration-200"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-yellow-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedIndex === idx ? t("Copied!", "បានចម្លង!") : t("Copy Hex", "ចម្លង Hex")}</span>
                      </button>
                    </div>

                    {/* Meta info panel */}
                    <div className="px-4 py-3.5 border-t-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-widest">{name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold">{hex}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-semibold" style={kf}>
                        {t(role.en, role.kh)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>

            {/* ════ 04 — TYPOGRAPHY ════════════════════════════════════════ */}
            <SectionShell s={SECTIONS[3]} title={t(SECTIONS[3].title.en, SECTIONS[3].title.kh)} kf={kf}>
              
              {/* Dual Language Font Specimen Sheets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                
                {/* Inter Sheet */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-black dark:border-zinc-800 p-6 shadow-[5px_5px_0_#000] dark:shadow-[5px_5px_0_rgba(255,255,255,0.05)] bg-white dark:bg-zinc-900">
                  <CornerCrosshairs containerClass="absolute inset-0 p-3" color="border-zinc-200 dark:border-zinc-800" />
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">English Typeface</span>
                    <span className="px-2 py-0.5 bg-black text-[9px] text-white font-black rounded uppercase">Inter</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-6xl font-black text-black dark:text-white leading-none tracking-tighter mb-2">Aa</p>
                    <p className="text-lg font-black text-black dark:text-white mb-0.5">ABCDEFGHIJKLM</p>
                    <p className="text-lg font-semibold text-zinc-400 mb-4">abcdefghijklm</p>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3" style={kf}>
                    {t("All Latin text, UI labels, headings, body copy.", "Latin text ទាំងអស់ · label · heading · body")}
                  </p>
                </div>

                {/* Siemreap Sheet */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-black dark:border-zinc-800 p-6 shadow-[5px_5px_0_#000] dark:shadow-[5px_5px_0_rgba(255,255,255,0.05)] bg-white dark:bg-zinc-900">
                  <CornerCrosshairs containerClass="absolute inset-0 p-3" color="border-zinc-200 dark:border-zinc-800" />
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Khmer Typeface</span>
                    <span className="px-2 py-0.5 bg-black text-[9px] text-white font-black rounded uppercase" style={{ fontFamily: "Siemreap, sans-serif" }}>សៀមរាប</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-6xl font-black text-black dark:text-white leading-none tracking-tighter mb-2" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ</p>
                    <p className="text-lg font-black text-black dark:text-white mb-0.5" style={{ fontFamily: "Siemreap, sans-serif" }}>គ ឃ ង ច ឆ ជ</p>
                    <p className="text-lg font-semibold text-zinc-400 mb-4" style={{ fontFamily: "Siemreap, sans-serif" }}>ក ខ គ ឃ ង</p>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3" style={kf}>
                    {t("All Khmer script content across the platform.", "Khmer text ទាំងអស់នៅក្នុង platform")}
                  </p>
                </div>
              </div>

              {/* ─── Typography Laboratory Playground ─── */}
              <div className="border-2 border-black dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_rgba(255,255,255,0.05)] mb-8">
                
                {/* Lab Header */}
                <div className="px-5 py-4 border-b-2 border-black dark:border-zinc-800 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300" style={kf}>
                    {t("Typography Laboratory (Interactive)", "ពិសោធន៍ពុម្ពអក្សរ (អន្តរកម្ម)")}
                  </span>
                </div>

                {/* Lab Input Box */}
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-b-2 border-black dark:border-zinc-800">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      placeholder={kh ? "សរសេរអក្សរទីនេះ ដើម្បីសាកល្បង..." : "Type custom text here to preview scales..."}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 rounded-2xl text-sm font-semibold placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      style={kf}
                    />
                  </div>
                </div>

                {/* Dynamic specimens list */}
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {[
                    { label: "Display",    size: "text-4xl md:text-5xl", weight: "font-black",  sample: "900 — Display", khSample: "ការសាកល្បង Display" },
                    { label: "Heading",    size: "text-2xl md:text-3xl", weight: "font-black",  sample: "900 — Heading", khSample: "ការសាកល្បង Heading" },
                    { label: "Subheading", size: "text-xl",   weight: "font-bold",   sample: "700 — Subheading", khSample: "ការសាកល្បង Subheading" },
                    { label: "Body",       size: "text-base", weight: "font-medium", sample: "500 — Body text", khSample: "ការសាកល្បង Body" },
                    { label: "Label",      size: "text-[10px] tracking-widest", weight: "font-black uppercase",  sample: "900 — Label", khSample: "ការសាកល្បង Label" },
                  ].map(({ label, size, weight, sample, khSample }) => {
                    const textToRender = previewText.trim() || (kh ? khSample : sample);
                    return (
                      <div key={label} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                        <div className="w-24 shrink-0 flex items-center justify-between border-b md:border-b-0 border-black/5 pb-1 md:pb-0">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
                          <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[8px] font-mono text-zinc-500 rounded uppercase">{size.replace('text-', '')}</span>
                        </div>
                        <p className={`${size} ${weight} text-black dark:text-white leading-tight break-all`} style={kf}>
                          {textToRender}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionShell>

            {/* ════ 05 — APPLICATIONS ══════════════════════════════════════ */}
            <SectionShell s={SECTIONS[4]} title={t(SECTIONS[4].title.en, SECTIONS[4].title.kh)} kf={kf}>
              <p className="text-sm sm:text-base text-zinc-500 font-semibold mb-6" style={kf}>
                {t(
                  "Studio-quality mockups showing KWD brand applied across merchandise and digital platforms.",
                  "Studio-quality mockup ដែលបង្ហាញ KWD brand លើ merchandise និង digital platform ផ្សេងៗ។"
                )}
              </p>
              
              {/* Responsive showcase grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {MOCKUP_ASSETS.map((m, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedMockup(i)}
                    className="group relative cursor-pointer rounded-3xl border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_rgba(255,255,255,0.05)] hover:shadow-[10px_10px_0_#eab308] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                  >
                    {/* Corner Registration marks on each mockup block */}
                    <CornerCrosshairs containerClass="absolute inset-0 p-3 z-10 pointer-events-none opacity-40" color="border-zinc-400/40" />

                    {/* Spec badge overlay */}
                    <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/80 rounded-lg text-[8px] text-white font-mono flex items-center gap-1">
                      <Maximize2 className="w-2.5 h-2.5 text-yellow-400" />
                      <span>{t("VIEW SPEC", "ពិនិត្យគំរូ")}</span>
                    </span>

                    {/* Mockup Image wrapper */}
                    <div className="aspect-square relative overflow-hidden border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                      <Image
                        src={m.src}
                        alt={m.title.en}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>

                    {/* Mockup Info Footer */}
                    <div className="px-5 py-4 bg-white dark:bg-zinc-900">
                      <p className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-1">
                        {t(`MOCKUP ${String(i + 1).padStart(2, "0")}`, `គំរូ ${String(i + 1).padStart(2, "0")}`)}
                      </p>
                      <p className="text-sm sm:text-base font-black text-black dark:text-white" style={kf}>{t(m.title.en, m.title.kh)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionShell>
          </div>
        </div>

        {/* ════ IMMERSIVE MERCHANDISE LIGHTBOX ══════════════════════════════ */}
        {selectedMockup !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            {/* Absolute close tap anchor */}
            <div className="absolute inset-0" onClick={() => setSelectedMockup(null)} />
            
            <div className="relative w-full max-w-4xl bg-zinc-950 border-4 border-yellow-400 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col md:grid md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-yellow-400/20 z-10">
              
              {/* Corner crosshairs inside lightbox frame */}
              <CornerCrosshairs containerClass="absolute inset-0 p-4" color="border-yellow-400/30" />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedMockup(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black border-2 border-yellow-400 flex items-center justify-center text-yellow-400 cursor-pointer hover:bg-yellow-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Lightbox image content */}
              <div className="h-64 sm:h-96 md:h-full relative bg-zinc-900 flex items-center justify-center overflow-hidden">
                <Image
                  src={MOCKUP_ASSETS[selectedMockup].src}
                  alt={MOCKUP_ASSETS[selectedMockup].title.en}
                  fill
                  className="object-contain p-6"
                  priority
                />
                
                {/* Left/Right navigation hooks */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
                  <button
                    onClick={() => setSelectedMockup((prev) => (prev! === 0 ? MOCKUP_ASSETS.length - 1 : prev! - 1))}
                    className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-black pointer-events-auto transition-transform active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedMockup((prev) => (prev! === MOCKUP_ASSETS.length - 1 ? 0 : prev! + 1))}
                    className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-black pointer-events-auto transition-transform active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lightbox Specifications details */}
              <div className="p-6 md:p-8 flex flex-col justify-between text-white relative">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 leading-none">
                      {t(`MOCKUP SPECIFICATION ${selectedMockup + 1}`, `គំនូសគំរូនៃរចនាសម្ព័ន្ធទី ${selectedMockup + 1}`)}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-2 leading-tight" style={kf}>
                      {t(MOCKUP_ASSETS[selectedMockup].title.en, MOCKUP_ASSETS[selectedMockup].title.kh)}
                    </h3>
                  </div>

                  <div className="space-y-3.5 border-t border-b border-white/10 py-5 text-sm text-zinc-400 font-semibold" style={kf}>
                    <div className="flex justify-between">
                      <span>{t("Production Standard", "ស្តង់ដារផលិតកម្ម")}</span>
                      <span className="text-white">Global Brand Tier-1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("Print Space Contrast", "សមាមាត្រផ្ទៃបោះពុម្ព")}</span>
                      <span className="text-yellow-400">High Contrast Match</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("Visual DNA Elements", "ធាតុផ្សំម៉ាកសញ្ញា")}</span>
                      <span className="text-white">{t("Official Logo + Swatch", "ឡូហ្គោផ្លូវការ + ពណ៌")}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 p-4 bg-zinc-900/60 flex items-start gap-3">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold" style={kf}>
                      {kh 
                        ? "គំរូទាំងនេះត្រូវបានរចនាឡើង ដើម្បីធានាឱ្យបាននូវការអនុវត្តរចនាសម្ព័ន្ធម៉ាកសញ្ញា KWD ប្រកបដោយភាពស៊ីសង្វាក់គ្នាលើគ្រប់ប្រព័ន្ធចែកចាយរូបវ័ន្ត និងឌីជីថល។"
                        : "These mockups demonstrate official brand application constraints, ensuring consistent visual alignments across print, fabric, ceramic, and modular substrates."
                      }
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-white/10 mt-6">
                  <button
                    onClick={() => copyToClipboard(MOCKUP_ASSETS[selectedMockup].src, "mockup asset link")}
                    className="px-4 py-2 border-2 border-white/10 bg-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider text-white hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5"
                    style={kf}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t("Copy Asset Link", "ចម្លងតំណភ្ជាប់")}</span>
                  </button>
                  <button
                    onClick={() => setSelectedMockup(null)}
                    className="px-5 py-2 bg-yellow-400 text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-300 cursor-pointer"
                    style={kf}
                  >
                    {t("Close spec", "បិទផ្ទាំង")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ FOOTER ═══════════════════════════════════════════════════════ */}
        <div className="border-t-2 border-black dark:border-zinc-800 py-10 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
          <div className="flex items-center gap-3">
            <Image src={LOGO_PRIMARY} alt="KWD Logo" width={24} height={24} className="object-contain opacity-40 dark:opacity-30" />
            <p className="text-xs text-zinc-500 font-semibold" style={kf}>
              © {new Date().getFullYear()} KWD — Kesararam With Digital. Brand Guideline v1.0
            </p>
          </div>
          <div className="flex gap-6 text-xs font-black uppercase tracking-widest">
            <Link href="/terms"   className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors" style={kf}>{t("Terms",   "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors" style={kf}>{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </div>

      </div>

      {/* ════ FLOATING TOAST NOTIFICATION ═══════════════════════════════════ */}
      <div className={`fixed bottom-5 right-5 z-50 pointer-events-none transform transition-all duration-300 ${showToast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <div className="pointer-events-auto bg-black text-white dark:bg-white dark:text-black border-2 border-yellow-400 rounded-2xl px-5 py-4 shadow-[5px_5px_0_#000] flex items-center gap-3.5 max-w-sm overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 caution-tape" />
          <Bolt className="w-5 h-5 text-yellow-400 shrink-0 animate-bounce" />
          <p className="text-xs sm:text-sm font-black tracking-wide leading-snug" style={kf}>
            {toastMessage}
          </p>
          <button
            onClick={() => setShowToast(false)}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 dark:hover:bg-black/10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

// ─── Section Shell Wrapper (Crisp border, crosshairs, brutalist badge) ──────
function SectionShell({
  s, title, kf, children,
}: {
  s: { id: string; num: string; icon: any; accent: string };
  title: string;
  kf: React.CSSProperties;
  children: React.ReactNode;
}) {
  const IconComp = s.icon;
  return (
    <section id={s.id} className="scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 md:p-10 shadow-[0_12px_45px_-18px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_45px_-18px_rgba(255,255,255,0.03)]">
        
        {/* Dynamic corner registration crosshairs */}
        <CornerCrosshairs containerClass="absolute inset-0 p-4 sm:p-5" color="border-zinc-300 dark:border-zinc-800" />
        
        {/* Section header block */}
        <div className="mb-8 flex items-center gap-4 border-b-2 border-black dark:border-zinc-800 pb-5 relative z-10">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black text-white shadow-[3px_3px_0_#000]"
            style={{ background: s.accent }}
          >
            <IconComp className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-0.5" style={{ color: s.accent }}>{s.num}</p>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wide text-black dark:text-white leading-tight" style={kf}>
              {title}
            </h2>
          </div>
        </div>
        
        {/* Children content wrapper */}
        <div className="relative z-10">
          {children}
        </div>

      </div>
    </section>
  );
}

// ─── Sub-section label ──────────────────────────────────────────────────────
function SubLabel({ children, kf }: { children: React.ReactNode; kf: React.CSSProperties }) {
  return (
    <p className="mb-4 mt-6 flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500" style={kf}>
      <span className="h-2 w-2 border-2 border-black bg-yellow-400 dark:border-zinc-800" />
      {children}
    </p>
  );
}

// ─── Corner Registration Crosshairs SVG ──────────────────────────────────────
function CornerCrosshairs({ containerClass, color }: { containerClass: string; color: string }) {
  return (
    <div className={`${containerClass} pointer-events-none select-none`} aria-hidden>
      {/* Top Left */}
      <div className={`absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 ${color}`} />
      <div className={`absolute top-4 left-7 h-0 w-2 border-t-2 ${color}`} />
      <div className={`absolute top-7 left-4 h-2 w-0 border-l-2 ${color}`} />

      {/* Top Right */}
      <div className={`absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 ${color}`} />
      <div className={`absolute top-4 right-7 h-0 w-2 border-t-2 ${color}`} />
      <div className={`absolute top-7 right-4 h-2 w-0 border-r-2 ${color}`} />

      {/* Bottom Left */}
      <div className={`absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 ${color}`} />
      <div className={`absolute bottom-4 left-7 h-0 w-2 border-b-2 ${color}`} />
      <div className={`absolute bottom-7 left-4 h-2 w-0 border-l-2 ${color}`} />

      {/* Bottom Right */}
      <div className={`absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 ${color}`} />
      <div className={`absolute bottom-4 right-7 h-0 w-2 border-b-2 ${color}`} />
      <div className={`absolute bottom-7 right-4 h-2 w-0 border-r-2 ${color}`} />
    </div>
  );
}
