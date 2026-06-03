"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";

type Item = { name: string; note?: { en: string; kh: string } };

const DEV_TOOLS: Item[] = [
  { name: "Next.js 15",        note: { en: "React framework — App Router", kh: "React framework — App Router" } },
  { name: "React 19 + TypeScript", note: { en: "UI and application logic",  kh: "UI និងកូដ" } },
  { name: "Tailwind CSS 4",    note: { en: "Styling",                       kh: "Styling" } },
  { name: "Drizzle ORM",       note: { en: "Database ORM",                  kh: "Database ORM" } },
  { name: "Neon",              note: { en: "Serverless PostgreSQL",          kh: "Serverless PostgreSQL (ទិន្នន័យ)" } },
  { name: "Vercel",            note: { en: "Hosting & deployment",           kh: "Hosting និង deployment" } },
  { name: "Cloudinary",        note: { en: "Image hosting & management",     kh: "Image hosting និងគ្រប់គ្រងរូបភាព" } },
  { name: "jose",              note: { en: "JWT authentication",             kh: "JWT authentication" } },
  { name: "Zod",               note: { en: "Data validation",                kh: "Data validation" } },
  { name: "Git & GitHub",      note: { en: "Version control",                kh: "Version control" } },
];

const DESIGN_TOOLS: Item[] = [
  { name: "Tailwind CSS + shadcn/ui", note: { en: "Component system",      kh: "Component system" } },
  { name: "lucide-react",             note: { en: "Icon set",               kh: "Icon set" } },
  { name: "Recharts",                 note: { en: "Data visualization",     kh: "Data visualization (charts)" } },
  { name: "Figma",                    note: { en: "UI/UX design",           kh: "UI/UX design" } },
  { name: "Affinity Designer",        note: { en: "Vector & brand assets",  kh: "Vector & brand assets" } },
  { name: "Adobe Creative Suite",     note: { en: "Graphic production",     kh: "Graphic production" } },
  { name: "Banana Pro",               note: { en: "Design tool",            kh: "Design tool" } },
];

const AI_TOOLS: Item[] = [
  { name: "Claude (Anthropic)" },
  { name: "Google Gemini" },
  { name: "OpenAI ChatGPT" },
  { name: "GitHub Copilot" },
  { name: "Kimi AI" },
  { name: "Grok" },
  { name: "Google AI Studio" },
  { name: "NotebookLM" },
  { name: "Qwen" },
  { name: "DeepSeek" },
];

const RESEARCH_TOOLS: Item[] = [
  { name: "Google Search" },
  { name: "MoEYS Cambodia",          note: { en: "Ministry of Education, Youth and Sport", kh: "ក្រសួងអប់រំ យុវជន និងកីឡា" } },
  { name: "Ministry of Public Works and Transport" },
  { name: "Royal Government of Cambodia — Official Documents" },
  { name: "Official Cambodian Driving Theory App", note: { en: "Google Play Store", kh: "Google Play Store" } },
  { name: "YouTube" },
  { name: "Kahoot" },
  { name: "MOTET Cambodia" },
  { name: "UN — Road Traffic Law Articles" },
];

const MEDIA_ASSETS: Item[] = [
  { name: "Cloudinary",              note: { en: "Image hosting & management",             kh: "Image hosting និងគ្រប់គ្រងរូបភាព" } },
  { name: "Google Sans, Inter, Stack Sans Notch", note: { en: "Latin fonts",               kh: "ហ្វុនត៍ឡាតាំង" } },
  { name: "Siemreap, Battambang, KhmerOS",        note: { en: "Khmer fonts",               kh: "ហ្វុនត៍ខ្មែរ" } },
];

const REFERENCES: { name: string; url?: string; note?: { en: string; kh: string } }[] = [
  {
    name: "Ministry of Education, Youth and Sport (MoEYS)",
    url:  "https://cdp.moeys.gov.kh",
    note: { en: "Cambodia Education Portal", kh: "គេហទំព័រអប់រំកម្ពុជា" },
  },
  {
    name: "Cambodia Road Traffic Law",
    note: { en: "Official road signs handbook", kh: "សៀវភៅណែនាំសញ្ញាចរាចរណ៍ផ្លូវការ" },
  },
  {
    name: "Technovation Girls — Curriculum & Safety Standards",
    url:  "https://technovationchallenge.org",
  },
  {
    name: "United Nations — Sustainable Development Goals (SDG 4 & 11)",
    url:  "https://sdgs.un.org/goals",
  },
  {
    name: "Kesararam Primary School Community",
    note: { en: "Local partners & mentors", kh: "ដៃគូ និងអ្នកណែនាំក្នុងតំបន់" },
  },
];

const SECTIONS = [
  { id: "dev",      title: { en: "Development Tools",      kh: "ឧបករណ៍អភិវឌ្ឍន៍" } },
  { id: "design",   title: { en: "Design Tools",           kh: "ឧបករណ៍រចនា" } },
  { id: "ai",       title: { en: "AI Tools",               kh: "បញ្ញាសិប្បនិមិត្ត" } },
  { id: "research", title: { en: "Research Tools",         kh: "ឧបករណ៍ស្រាវជ្រាវ" } },
  { id: "media",    title: { en: "Media & Assets",         kh: "មេឌៀ និងធនធាន" } },
  { id: "refs",     title: { en: "Bibliography",           kh: "គន្ថនិទ្ទេស" } },
];

export function BuiltWithClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: '"GoogleSans", "Google Sans Khmer", sans-serif' } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" style={kf}>

      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("Built With & Bibliography", "ឧបករណ៍ និងឯកសារយោង")}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            {t(
              "Tools, technologies, AI systems, and references used to build KWD — Kesararam With Digital.",
              "ឧបករណ៍ បច្ចេកវិទ្យា AI និងឯកសារយោងដែលប្រើដើម្បីសាងសង់ KWD — Kesararam With Digital"
            )}
          </p>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            {t(
              "Technovation Girls 2026 · Team #50777 · Siem Reap, Cambodia · Last updated June 2026",
              "Technovation Girls 2026 · ក្រុម #50777 · សៀមរាប, កម្ពុជា · ធ្វើបច្ចុប្បន្នភាព មិថុនា ២០២៦"
            )}
          </p>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-16">

        {/* Sidebar */}
        <aside className="hidden lg:block w-44 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`block text-sm py-1 transition-colors ${
                  active === s.id
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

          {/* Development Tools */}
          <section id="dev" className="scroll-mt-24">
            <SectionHeading>{t("Development Tools", "ឧបករណ៍អភិវឌ្ឍន៍")}</SectionHeading>
            <ItemTable items={DEV_TOOLS} kh={kh} />
          </section>

          {/* Design Tools */}
          <section id="design" className="scroll-mt-24">
            <SectionHeading>{t("Design Tools", "ឧបករណ៍រចនា")}</SectionHeading>
            <ItemTable items={DESIGN_TOOLS} kh={kh} />
          </section>

          {/* AI Tools */}
          <section id="ai" className="scroll-mt-24">
            <SectionHeading>{t("AI Tools", "បញ្ញាសិប្បនិមិត្ត (AI Tools)")}</SectionHeading>
            <ItemTable items={AI_TOOLS} kh={kh} />
            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              {t(
                "All AI-generated content was reviewed and approved by the team before publication.",
                "លទ្ធផល AI ទាំងអស់ត្រូវបានត្រួតពិនិត្យ និងអនុម័តដោយក្រុមមុនការផ្សព្វផ្សាយ។"
              )}
            </p>
          </section>

          {/* Research Tools */}
          <section id="research" className="scroll-mt-24">
            <SectionHeading>{t("Research Tools", "ឧបករណ៍ស្រាវជ្រាវ")}</SectionHeading>
            <ItemTable items={RESEARCH_TOOLS} kh={kh} />
          </section>

          {/* Media & Assets */}
          <section id="media" className="scroll-mt-24">
            <SectionHeading>{t("Media & Assets", "មេឌៀ និងធនធាន")}</SectionHeading>
            <ItemTable items={MEDIA_ASSETS} kh={kh} />
          </section>

          {/* Bibliography */}
          <section id="refs" className="scroll-mt-24">
            <SectionHeading>{t("Bibliography", "គន្ថនិទ្ទេស")}</SectionHeading>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800">
              {REFERENCES.map((ref, i) => (
                <div key={i} className="py-3 flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {ref.name}
                  </span>
                  {ref.note && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {kh ? ref.note.kh : ref.note.en}
                    </span>
                  )}
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      {ref.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <span>© {new Date().getFullYear()} Kesararam With Digital · kesararamwithdigital.tech</span>
          <div className="flex gap-4">
            <Link href="/brand"   className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t("Brand Guidelines", "គោលការណ៍ម៉ាក")}</Link>
            <Link href="/terms"   className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t("Terms", "លក្ខខណ្ឌ")}</Link>
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

function ItemTable({ items, kh }: { items: Item[]; kh: boolean }) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800">
      {items.map((item, i) => (
        <div key={i} className="flex gap-6 py-3 items-baseline">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 min-w-0 shrink-0 w-56">
            {item.name}
          </span>
          {item.note && (
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              {kh ? item.note.kh : item.note.en}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
