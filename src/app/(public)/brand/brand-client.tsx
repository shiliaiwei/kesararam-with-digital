"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";

const LOGO_PRIMARY = "/brand/kwd-black_nobackground.png";

// ─── Color palette ──────────────────────────────────────────────────────────
const COLORS: { name: string; hex: string; role: { en: string; kh: string } }[] = [
  { name: "Yellow", hex: "#eab308", role: { en: "CTA button · warning signs · brand accent", kh: "ប៊ូតុង CTA សញ្ញាព្រមាន និងពណ៌លេចធ្លោរបស់ម៉ាក (brand accent)" } },
  { name: "Black",  hex: "#000000", role: { en: "Text · borders · structure",               kh: "អក្សរ គែម (borders) និងរចនាសម្ព័ន្ធ" } },
  { name: "White",  hex: "#ffffff", role: { en: "Background · negative space",               kh: "ផ្ទៃខាងក្រោយ និងចន្លោះទំនេរ (negative space)" } },
  { name: "Blue",   hex: "#3b82f6", role: { en: "Info signs · links · signals",              kh: "សញ្ញាព័ត៌មាន តំណភ្ជាប់ និងសញ្ញាវិជ្ជមាន" } },
  { name: "Red",    hex: "#ef4444", role: { en: "Prohibitory signs · danger · stop",         kh: "សញ្ញាហាមឃាត់ សញ្ញាឈប់ និងសញ្ញាគ្រោះថ្នាក់" } },
  { name: "Green",  hex: "#22c55e", role: { en: "Success · active states · go",              kh: "សញ្ញាអនុញ្ញាត ស្ថានភាពជោគជ័យ និងសញ្ញាទៅមុខ" } },
  { name: "Orange", hex: "#f97316", role: { en: "Caution · attention · warning",             kh: "ការប្រុងប្រយ័ត្ន និងការផ្ដោតអារម្មណ៍" } },
  { name: "Purple", hex: "#a855f7", role: { en: "Premium features · game modes",             kh: "មុខងារពិសេស (Premium) និងរបៀបលេងហ្គេមផ្សេងៗ" } },
];

// ─── Logo usage rules ────────────────────────────────────────────────────────
const RULES: { en: string; kh: string }[] = [
  { en: "Do not stretch, rotate, or distort the logo.",            kh: "កុំទាញ បង្វិល ឬធ្វើឱ្យ logo ខូចទ្រង់ទ្រាយ។" },
  { en: "Do not apply drop shadows, gradients, or filters.",       kh: "កុំដាក់ស្រមោល (shadow) gradient ឬ filter លើ logo។" },
  { en: "Do not place the logo on low-contrast backgrounds.",      kh: "កុំដាក់ logo លើ background ដែលមាន contrast ទាប។" },
  { en: "Maintain clear space equal to the height of the K.",      kh: "រក្សាចន្លោះទំនេរជុំវិញ logo ស្មើកម្ពស់អក្សរ K។" },
  { en: "Use kwd-black_nobackground on light backgrounds only.",   kh: "ប្រើ kwd-black_nobackground លើ background ភ្លឺ; ប្រើឡូហ្គោពណ៌ស (Inverted) លើ background ងងឹត។" },
  { en: "Minimum logo height is 24 px in any digital context.",    kh: "ឡូហ្គោត្រូវមានកម្ពស់យ៉ាងតិច ២៤ ភីកសែលក្នុងកម្មវិធីឌីជីថល។" },
  { en: "Do not recolor, outline, or alter the logo in any way.",  kh: "កុំផ្លាស់ប្ដូរពណ៌ ឬបន្ថែម outline លើឡូហ្គោតាមចិត្ត។" },
];

// ─── Product mockups ─────────────────────────────────────────────────────────
const MOCKUP_ASSETS: { src: string; title: { en: string; kh: string } }[] = [
  { src: "/brand/tote_stationery_mockup.png",    title: { en: "Tote & Stationery Set",      kh: "កាបូប & Stationery Set" } },
  { src: "/brand/educational_blocks_mockup.png", title: { en: "Educational Toys & Cards",   kh: "ដុំឈើ & Learning Cards" } },
  { src: "/brand/mug_bottle_mockup.png",         title: { en: "Ceramic Mug & Metal Bottle", kh: "Ceramic Mug & Metal Bottle" } },
  { src: "/brand/apparel_brand_mockup.png",      title: { en: "Premium Brand Apparel",      kh: "Brand Apparel" } },
  { src: "/brand/kwd-mockup-phone.png",          title: { en: "Mobile App Interface",       kh: "គំរូកម្មវិធីទូរស័ព្ទដៃ" } },
  { src: "/brand/kwd-mockup-stationery.png",     title: { en: "Corporate Stationery set",   kh: "គំរូឧបករណ៍ការិយាល័យ" } },
];

// ─── Section index (Summary and section numbers removed per request) ─────────
const SECTIONS: { id: string; title: { en: string; kh: string } }[] = [
  { id: "name",    title: { en: "Brand Name & Meaning",    kh: "ឈ្មោះ Brand និងអត្ថន័យ" } },
  { id: "logo",    title: { en: "Logo & Meaning",          kh: "និមិត្តសញ្ញា និងអត្ថន័យ" } },
  { id: "color",   title: { en: "Color Palette",           kh: "ពណ៌" } },
  { id: "type",    title: { en: "Typography",              kh: "អក្សរ" } },
  { id: "dna",     title: { en: "Design DNA",              kh: "ប្រព័ន្ធរចនា DNA" } },
  { id: "apply",   title: { en: "Applications",            kh: "ការប្រើប្រាស់ & Mockups" } },
];

export function BrandGuidelineClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFontFamily = '"GoogleSans", "Google Sans Khmer", "Google Sans", sans-serif';
  const kf = kh ? { fontFamily: khFontFamily } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  const [active, setActive] = useState<string>(SECTIONS[0].id);

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
      
      {/* Minimal Top Header - Plain Text, No Background Shapes */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-10 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white" style={kf}>
              {t("KWD Brand Guidelines", "គោលការណ៍ណែនាំម៉ាកយីហោ KWD")}
            </h1>
            <span className="text-[10px] text-zinc-400 font-mono font-semibold">v1.0</span>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl" style={kf}>
            {t(
              "Visual identity, design standards, and usage rules that define KWD — Kesararam With Digital.",
              "អត្តសញ្ញាណដែលមើលឃើញ ស្តង់ដាររចនា និងច្បាប់ប្រើប្រាស់ដែលកំណត់ KWD — Kesararam With Digital"
            )}
          </p>

          <p className="text-[10px] text-zinc-400 font-mono">
            {t(
              "Last updated: June 2026 — Technovation Girls 2026 · Team #50777 · Siem Reap, Cambodia",
              "ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: មិថុនា ២០២៦ — Technovation Girls 2026 · ក្រុម #50777 · សៀមរាប, កម្ពុជា"
            )}
          </p>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[200px_1fr] items-start">
          
          {/* Simple Typographic Navigation (No shapes or numbers, just plain text) */}
          <aside className="hidden lg:block sticky top-24 space-y-3">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block text-xs font-semibold transition-all duration-150 ${
                    on
                      ? "text-yellow-600 dark:text-yellow-500 pl-2 border-l-2 border-yellow-500"
                      : "text-zinc-450 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white pl-2 border-l-2 border-transparent"
                  }`}
                  style={kf}
                >
                  {t(s.title.en, s.title.kh)}
                </a>
              );
            })}
          </aside>

          {/* Minimalist Typographic Content Stack */}
          <div className="space-y-16">

            {/* BRAND NAME & MEANING */}
            <section id="name" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-2 mb-4" style={kf}>
                {t("Brand Name & Meaning", "ឈ្មោះ Brand និងអត្ថន័យ (Brand Name & Meaning)")}
              </h2>
              
              <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal" style={kf}>
                {kh ? (
                  <>
                    <p>
                      KWD មានន័យថា Kesararam With Digital — ឈ្មោះដែលផ្ទុកន័យនៃទីកន្លែង គោលដៅ និងការផ្លាស់ប្ដូរ។ កេសរារាម ជាឈ្មោះវត្ត អារាម និងសាលាបឋមសិក្សា — ជាកន្លែងរៀនចំណាស់បំផុតក្នុងសហគមន៍របស់យើង។
                    </p>
                    <p>
                      ពាក្យ With ប្រកាសពីភាពជាដៃគូរវាងប្រពៃណី និងបច្ចេកវិទ្យា។ ឌីជីថល (Digital) ជាការប្ដេជ្ញាផ្ដល់នូវឱកាសចូលរៀន (Access) ការពង្រីកវិសាលភាព (Reach) និងនិរន្តរភាព (Permanence)។
                    </p>
                    <p>
                      KWD ត្រូវបានបង្កើតឡើងដោយយុវនារីខ្មែរនៃសាលាបឋមសិក្សាកេសរារាម ក្រោមទស្សនវិស័យថា៖ ការអប់រំអំពីសុវត្ថិភាពចរាចរណ៍គួរតែផ្ដល់ជូនដោយឥតគិតថ្លៃ មានអន្តរកម្ម និងងាយស្រួលចូលប្រើជាភាសាកំណើតរបស់សិស្ស។ ឈ្មោះនេះបញ្ជាក់ថា ការអប់រំមិនបោះបង់ឫសគល់វប្បធម៌ក្នុងយុគឌីជីថលនោះទេ ប៉ុន្តែជំរុញឱ្យឫសគល់នោះរីកចម្រើនទៅមុខតាមបច្ចេកវិទ្យា។
                    </p>
                    <p className="text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                      <strong>ការណែនាំ៖</strong> ប្រើឈ្មោះពេញ «Kesararam With Digital» សម្រាប់ការណែនាំលើកដំបូងក្នុងសារព័ត៌មាន បទបង្ហាញ ឯកសារផ្លូវការ និងដៃគូសហការ។ បន្ទាប់មកអាចប្រើពាក្យកាត់ «KWD» បាន។
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      KWD stands for Kesararam With Digital — a name that carries the weight of place, purpose, and transformation. Kesararam is the name of the monastery (wat) and the primary school — the oldest seat of learning in our community.
                    </p>
                    <p>
                      The word 'With' declares a partnership between tradition and technology. 'Digital' is a commitment to access, reach, and permanence.
                    </p>
                    <p>
                      KWD was created by young Cambodian women from Kesararam Primary School under the vision that: life-saving road safety education should be free, interactive, and easily accessible in the students' native language. The name asserts that education does not abandon its cultural roots in the digital age, but rather drives those roots forward with technology.
                    </p>
                    <p className="text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                      <strong>Recommendation:</strong> Always use the full name "Kesararam With Digital" when introducing the brand for the first time in press, presentations, official documents, and partnerships. Afterwards, the abbreviation "KWD" may be used.
                    </p>
                  </>
                )}
              </div>
            </section>

            {/* LOGO & MEANING */}
            <section id="logo" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-2 mb-4" style={kf}>
                {t("Logo & Meaning", "និមិត្តសញ្ញា (Logo) និងអត្ថន័យ (Logo & Meaning)")}
              </h2>

              <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal" style={kf}>
                {kh ? (
                  <p>
                    និមិត្តសញ្ញាផ្លេកបន្ទោរលើឡូហ្គោ KWD មិនមែនជាការតុបតែងលម្អឡើយ តែជាទស្សនវិជ្ជាស្នូលរបស់ម៉ាក。 វាផ្ដល់អត្ថន័យដល់ Flash Learning ដោយឈរលើជំនឿថា ក្នុងយុគ AI ចំណេះដឹងត្រូវដើរក្នុងល្បឿននៃពន្លឺ។ វាជាការប្ដេជ្ញារបស់ KWD ក្នុងការផ្ដល់ល្បឿន ឧបករណ៍ និងទំនុកចិត្ត ដើម្បីសិក្សារួមជាមួយ AI និងដឹកនាំការផ្លាស់ប្ដូរនាពេលអនាគត។
                  </p>
                ) : (
                  <p>
                    The lightning bolt on the KWD logo is not ornamental; it is the core philosophy of the brand. It gives meaning to Flash Learning, based on the belief that in the age of AI, knowledge must move at the speed of light. It represents KWD's commitment to providing the speed, tools, and confidence to learn alongside AI and lead future changes.
                  </p>
                )}

                {/* Minimal Logo Display (All colors shown side-by-side, no border boxes or backgrounds) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="flex flex-col items-center">
                    <Image src="/brand/kwd-black_nobackground.png" alt="KWD Black Logo" width={80} height={80} className="object-contain dark:invert" />
                    <span className="text-[10px] text-zinc-400 mt-2 font-mono text-center">kwd-black_nobackground.png</span>
                    <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 mt-1">{t("Black Logo", "ឡូហ្គោពណ៌ខ្មៅ")}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image src="/brand/kwd-gray.png" alt="KWD Gray Logo" width={80} height={80} className="object-contain" />
                    <span className="text-[10px] text-zinc-400 mt-2 font-mono text-center">kwd-gray.png</span>
                    <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 mt-1">{t("Gray Logo", "ឡូហ្គោពណ៌ប្រផេះ")}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image src="/brand/kwd-green.png" alt="KWD Green Logo" width={80} height={80} className="object-contain" />
                    <span className="text-[10px] text-zinc-400 mt-2 font-mono text-center">kwd-green.png</span>
                    <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 mt-1">{t("Green Logo", "ឡូហ្គោពណ៌បៃតង")}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-zinc-950 p-2 rounded flex items-center justify-center w-[80px] h-[80px]">
                      <Image src="/brand/kwd-black_nobackground.png" alt="KWD White Logo" width={72} height={72} className="object-contain invert" />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-2 font-mono text-center">kwd-black_nobackground.png (Inverted)</span>
                    <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 mt-1">{t("White Logo", "ឡូហ្គោពណ៌ស")}</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 pt-2 leading-relaxed">
                  {kh ? (
                    <>
                      <strong>ទម្រង់ឡូហ្គោ៖</strong> ទម្រង់ឡូហ្គោដំណើរការទៅតាមគោលការណ៍សម្គាល់ម៉ាកយីហោ និងកំណត់ពីរបៀបដែលវាត្រូវបានយកទៅប្រើប្រាស់។ ម៉ាកយីហោធម្មតាៗតែងតែពឹងផ្អែកលើអក្សរម៉ាក (wordmark)។ ការប្រើប្រាស់ដដែលៗជួយកសាងអត្ថន័យ រហូតដល់និមិត្តសញ្ញានោះអាចឈរដោយខ្លួនឯងបាន។ ប្រព័ន្ធដែលមានភាពចាស់ទុំប្រើប្រាស់ទម្រង់វ៉ារ្យ៉ង់ច្រើនយ៉ាង អាស្រ័យលើបរិបទ និងករណីប្រើប្រាស់។ នៅពេលដែលការសម្គាល់ម៉ាកយីហោលូតលាស់ឡើង វានឹងកំណត់ថាធាតុណាមួយដែលត្រូវដើរតួឈានមុខគេ។
                    </>
                  ) : (
                    <>
                      <strong>Logo Format:</strong> A logo format follows brand recognition principles and defines how it is applied. Simple brands often rely on a wordmark. Repetition builds meaning until the symbol can stand alone. Mature systems use multiple variants depending on context and use cases. As recognition grows, it determines which element takes the lead.
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">{t("Official Logo Rules", "ច្បាប់នៃការប្រើប្រាស់ឡូហ្គោ៖")}</h3>
                  <ul className="space-y-1 text-xs text-zinc-650 dark:text-zinc-400">
                    {RULES.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-500 shrink-0">•</span>
                        <span>{t(r.en, r.kh)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* COLOR PALETTE */}
            <section id="color" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-2 mb-4" style={kf}>
                {t("Color Palette", "ពណ៌ (Color Palette)")}
              </h2>

              {/* Simple Typographic Color Swatches (Dots/Small squares + text, no card shapes) */}
              <div className="space-y-3" style={kf}>
                {COLORS.map(({ name, hex, role }) => (
                  <div key={hex} className="flex items-center gap-4 text-xs sm:text-sm">
                    {/* Small Color Dot */}
                    <div className="w-5 h-5 rounded shrink-0 border border-zinc-200 dark:border-zinc-800" style={{ background: hex }} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="font-bold text-zinc-900 dark:text-white w-20 shrink-0">{name} ({hex})</span>
                      <span className="text-zinc-500 dark:text-zinc-400 font-normal">{t(role.en, role.kh)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TYPOGRAPHY */}
            <section id="type" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-2 mb-4" style={kf}>
                {t("Typography", "អក្សរ (Typography)")}
              </h2>

              <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal" style={kf}>
                <div className="space-y-3">
                  <p>
                    <strong>{t("Khmer Font:", "ហ្វុនត៍ភាសាខ្មែរ៖")}</strong> {t("Use Siemreap, Google Sans, Inter, Stack Sans Notch, or Battambang for all Khmer text.", "ប្រើ Siemreap, Google Sans, Inter, Stack Sans Notch ឬ Battambang សម្រាប់អក្សរខ្មែរទាំងអស់ ដើម្បីធានាការអានងាយស្រួល សោភ័ណភាព និងភាពច្បាស់លាស់ខ្ពស់។")}
                  </p>
                  <p>
                    <strong>{t("English Font:", "ហ្វុនត៍ភាសាអង់គ្លេស៖")}</strong> {t("Use Inter for all Latin text, UI labels, headings, and body copy.", "ប្រើ Inter សម្រាប់អក្សរឡាតាំងទាំងអស់ ស្លាក UI headings និង body copy។")}
                  </p>
                  <p>
                    <strong>{t("Labels:", "ស្លាក (Labels)៖")}</strong> {t("Use UPPERCASE with letter-spacing and bold/black weight for headings and buttons.", "ប្រើអក្សរធំ (UPPERCASE) ជាមួយ letter-spacing និងទម្ងន់ដិត (Bold/Black) សម្រាប់ headings និងប៊ូតុង។")}
                  </p>
                </div>

                {/* Plain Specimen Grid */}
                <div className="mt-4 border-t border-zinc-100 dark:border-zinc-900 pt-4 space-y-4">
                  {[
                    { label: "Display", size: "36px", sample: "KWD Display Scale", weight: "font-black text-2xl sm:text-3xl" },
                    { label: "Heading", size: "24px", sample: "Heading Scale Bold", weight: "font-bold text-xl" },
                    { label: "Body", size: "14px", sample: "Body text size for reading paragraphs.", weight: "text-sm" }
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-baseline justify-between gap-4 py-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase w-16 shrink-0">{spec.label}</span>
                      <p className={`${spec.weight} text-zinc-800 dark:text-zinc-200 grow`} style={{ fontFamily: kh ? khFontFamily : undefined }}>{spec.sample}</p>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">{spec.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* DESIGN DNA */}
            <section id="dna" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-2 mb-4" style={kf}>
                {t("Design DNA", "ប្រព័ន្ធរចនា DNA (Design DNA — Brutalist)")}
              </h2>

              <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal" style={kf}>
                <div>
                  <p className="mb-2"><strong>{t("Core Brutalist System:", "លក្ខណៈស្នូលរបស់ Brutalist៖")}</strong></p>
                  <ul className="space-y-1 text-zinc-650 dark:text-zinc-400">
                    {kh ? (
                      <>
                        <li>• គ្មាន border-radius — មុំទាំងអស់ស្រួច (90°)。</li>
                        <li>• គែម (border) 2–3px ពណ៌ខ្មៅ #000 លើ cards ប៊ូតុង និង inputs។</li>
                        <li>• ស្រមោលរឹង (box-shadow) 3px ឬ 4px 0 #000 (offset solid shadow)។</li>
                        <li>• ខ្សែបន្ទាត់ព្រមាន (caution stripe) លឿង/ខ្មៅ ជា accent។</li>
                        <li>• ស្ថានភាព Active៖ ផ្ទៃលឿង #eab308 + អក្សរខ្មៅ។</li>
                        <li>• ចន្លោះ (spacing)៖ 4 · 8 · 12 · 16 · 20 · 24 px</li>
                      </>
                    ) : (
                      <>
                        <li>• No border-radius — all angles are sharp (90°).</li>
                        <li>• Black border (#000) of 2–3px on cards, buttons, and inputs.</li>
                        <li>• Hard shadow (box-shadow) of 3px or 4px offset solid shadow (#000).</li>
                        <li>• Caution stripe (yellow/black) as an accent.</li>
                        <li>• Active State: Yellow background (#eab308) + black text.</li>
                        <li>• Spacing: 4 · 8 · 12 · 16 · 20 · 24 px.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <p className="mb-2"><strong>{t("Softened Layout System:", "ប្រព័ន្ធរចនា DNA បែបសម្រាល (Softened UI)៖")}</strong></p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {kh ? (
                      <>កាំជ្រុង (Border radius) ប្រហែល ១០-១៤% ជួយសម្រាលភាពរឹងនៃ interface ខណៈពេលដែលនៅតែរក្សាទម្រង់រចនាសម្ព័ន្ធ។ ចំណុចផ្ដោតសំខាន់ចម្បងត្រូវបានបង្កើតឡើងតាមរយៈទំហំ ឬកម្រិតពន្លឺខុសគ្នា (contrast) ដោយតម្រង់ការយកចិត្តទុកដាក់របស់អ្នកប្រើប្រាស់ និងបង្កើតជាចំណុចចាប់ផ្ដើមដ៏ច្បាស់លាស់។ តម្រឹមតម្រង់ (Alignment) រៀបចំ្លង់ប្លង់ជុំវិញចំណុចផ្ដោតសំខាន់នេះ ដើម្បីធានាបាននូវភាពស៊ីសង្វាក់គ្នានៃការមើលឃើញ និងធ្វើឱ្យប្រសើរឡើងនូវលទ្ធភាពអាន និងលំហូរទូទៅ។ នេះក៏ជាប្រព័ន្ធម៉ាកយីហោ DNA ផងដែរ។</>
                    ) : (
                      <>A border radius of around 10–14% helps soften the interface while maintaining structure. A primary focal point is created through size or contrast, guiding the user’s attention and forming a clear entry point. Alignment organizes the layout around this focal point, ensuring visual consistency and improving overall readability and flow. DNA brand system too.</>
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* APPLICATIONS (MOCKUPS) */}
            <section id="apply" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-2 mb-4" style={kf}>
                {t("Applications", "ការប្រើប្រាស់ & Mockups")}
              </h2>

              {/* Minimal Mockup Gallery (Clean grids, no border cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {MOCKUP_ASSETS.map((m, i) => (
                  <div key={i} className="flex flex-col gap-2 group">
                    <div className="aspect-[4/3] relative bg-zinc-50 dark:bg-zinc-900 overflow-hidden rounded-md border border-zinc-100 dark:border-zinc-900">
                      <Image
                        src={m.src}
                        alt={m.title.en}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">{t(`Mockup ${i + 1}`, `គំរូ ${i + 1}`)}</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block" style={kf}>{t(m.title.en, m.title.kh)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="border-t border-zinc-100 dark:border-zinc-900 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 mt-20 text-xs text-zinc-400 font-medium">
          <p style={kf}>
            © {new Date().getFullYear()} KWD — Kesararam With Digital.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-zinc-650 dark:hover:text-white transition-colors" style={kf}>{t("Terms", "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="hover:text-zinc-650 dark:hover:text-white transition-colors" style={kf}>{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </footer>

      </div>

    </div>
  );
}
