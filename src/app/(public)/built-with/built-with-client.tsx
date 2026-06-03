"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";
import type { IconType } from "react-icons";
import {
  SiNextdotjs, SiReact, SiTypescript, SiTailwindcss, SiDrizzle,
  SiVercel, SiCloudinary, SiGit, SiGithub, SiZod,
  SiPostgresql, SiShadcnui, SiLucide, SiFigma,
  SiAffinitydesigner, SiAnthropic, SiGooglegemini, SiOpenai,
  SiGithubcopilot, SiNotebooklm, SiKahoot, SiYoutube, SiGoogle,
  SiGoogleplay, SiAffinity,
} from "react-icons/si";
import {
  BarChart2, ShieldCheck, PenTool, Layers, Cpu, Zap,
  BrainCircuit, Building2, Landmark, Globe, Type, Smartphone,
  BookOpen,
} from "lucide-react";

type Item = {
  name: string;
  icon?: IconType | React.ComponentType<{ size?: number; className?: string }>;
  note?: { en: string; kh: string };
};

const ICON_CLASS = "text-zinc-600 dark:text-zinc-400";

const DEV_TOOLS: Item[] = [
  { name: "Next.js 15",              icon: SiNextdotjs,    note: { en: "React framework — App Router",   kh: "React framework — App Router" } },
  { name: "React 19",                icon: SiReact,        note: { en: "UI library",                      kh: "UI library" } },
  { name: "TypeScript",              icon: SiTypescript,   note: { en: "Type-safe application logic",     kh: "Type-safe application logic" } },
  { name: "Tailwind CSS 4",          icon: SiTailwindcss,  note: { en: "Styling",                         kh: "Styling" } },
  { name: "Drizzle ORM",             icon: SiDrizzle,      note: { en: "Database ORM",                    kh: "Database ORM" } },
  { name: "Neon",                    icon: SiPostgresql,   note: { en: "Serverless PostgreSQL",           kh: "Serverless PostgreSQL" } },
  { name: "Vercel",                  icon: SiVercel,       note: { en: "Hosting & deployment",            kh: "Hosting & deployment" } },
  { name: "Cloudinary",              icon: SiCloudinary,   note: { en: "Image hosting & management",      kh: "Image hosting & management" } },
  { name: "jose",                    icon: ShieldCheck,    note: { en: "JWT authentication",              kh: "JWT authentication" } },
  { name: "Zod",                     icon: SiZod,          note: { en: "Data validation",                 kh: "Data validation" } },
  { name: "Git & GitHub",            icon: SiGithub,       note: { en: "Version control",                 kh: "Version control" } },
];

const DESIGN_TOOLS: Item[] = [
  { name: "Tailwind CSS + shadcn/ui",icon: SiShadcnui,        note: { en: "Component system",  kh: "Component system" } },
  { name: "lucide-react",            icon: SiLucide,           note: { en: "Icon set",          kh: "Icon set" } },
  { name: "Recharts",                icon: BarChart2,          note: { en: "Data visualization",kh: "Data visualization" } },
  { name: "Figma",                   icon: SiFigma,            note: { en: "UI/UX design",      kh: "UI/UX design" } },
  { name: "Affinity Designer",       icon: SiAffinitydesigner, note: { en: "Vector & brand",   kh: "Vector & brand" } },
  { name: "Adobe Creative Suite",    icon: Layers,             note: { en: "Graphic production",kh: "Graphic production" } },
  { name: "Banana Pro",              icon: PenTool,            note: { en: "Design tool",       kh: "Design tool" } },
];

const AI_TOOLS: Item[] = [
  { name: "Claude (Anthropic)",   icon: SiAnthropic,     },
  { name: "Google Gemini",        icon: SiGooglegemini,  },
  { name: "OpenAI ChatGPT",       icon: SiOpenai,        },
  { name: "GitHub Copilot",       icon: SiGithubcopilot, },
  { name: "Google NotebookLM",    icon: SiNotebooklm,    },
  { name: "Kimi AI",              icon: Cpu,             },
  { name: "Grok",                 icon: Zap,             },
  { name: "Google AI Studio",     icon: SiGoogle,        },
  { name: "Qwen",                 icon: BrainCircuit,    },
  { name: "DeepSeek",             icon: BrainCircuit,    },
];

const RESEARCH_TOOLS: Item[] = [
  { name: "Google Search",                         icon: SiGoogle,     },
  { name: "MoEYS Cambodia",                        icon: Building2,    note: { en: "Ministry of Education, Youth and Sport", kh: "ក្រសួងអប់រំ យុវជន និងកីឡា" } },
  { name: "Ministry of Public Works and Transport",icon: Building2,    },
  { name: "Royal Government of Cambodia",          icon: Landmark,     note: { en: "Official documents", kh: "ឯកសារផ្លូវការ" } },
  { name: "Official Cambodian Driving Theory App", icon: SiGoogleplay, note: { en: "Google Play Store",  kh: "Google Play Store" } },
  { name: "YouTube",                               icon: SiYoutube,    },
  { name: "Kahoot",                                icon: SiKahoot,     },
  { name: "MOTET Cambodia",                        icon: Globe,        },
  { name: "UN — Road Traffic Law Articles",        icon: Globe,        },
];

const MEDIA_ASSETS: Item[] = [
  { name: "Cloudinary",                             icon: SiCloudinary, note: { en: "Image hosting & management",    kh: "Image hosting & management" } },
  { name: "Google Sans · Inter · Stack Sans Notch", icon: Type,         note: { en: "Latin typefaces",               kh: "ហ្វុនត៍ឡាតាំង" } },
  { name: "Siemreap · Battambang · KhmerOS",        icon: Type,         note: { en: "Khmer typefaces",               kh: "ហ្វុនត៍ខ្មែរ" } },
];

const REFERENCES: { name: string; url?: string; icon?: Item["icon"]; note?: { en: string; kh: string } }[] = [
  { name: "Ministry of Education, Youth and Sport (MoEYS)",    icon: Building2, url: "https://cdp.moeys.gov.kh",         note: { en: "Cambodia Education Portal", kh: "គេហទំព័រអប់រំកម្ពុជា" } },
  { name: "Cambodia Road Traffic Law",                          icon: BookOpen,                                           note: { en: "Official road signs handbook", kh: "សៀវភៅណែនាំសញ្ញាចរាចរណ៍ផ្លូវការ" } },
  { name: "Technovation Girls — Curriculum & Safety Standards", icon: Globe,     url: "https://technovationchallenge.org" },
  { name: "United Nations — SDG 4 & SDG 11",                   icon: Globe,     url: "https://sdgs.un.org/goals" },
  { name: "Kesararam Primary School Community",                 icon: Building2,                                          note: { en: "Local partners & mentors", kh: "ដៃគូ និងអ្នកណែនាំ" } },
];

const SECTIONS = [
  { id: "dev",      title: { en: "Development",  kh: "ឧបករណ៍អភិវឌ្ឍន៍" } },
  { id: "design",   title: { en: "Design",       kh: "ឧបករណ៍រចនា" } },
  { id: "ai",       title: { en: "AI Tools",     kh: "AI Tools" } },
  { id: "research", title: { en: "Research",     kh: "ស្រាវជ្រាវ" } },
  { id: "media",    title: { en: "Media",        kh: "មេឌៀ" } },
  { id: "refs",     title: { en: "Bibliography", kh: "ឯកសារយោង" } },
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
            {t("Bibliography", "ឯកសារយោង")}
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
              "Technovation Girls 2026 · ក្រុម #50777 · សៀមរាប, កម្ពុជា · មិថុនា ២០២៦"
            )}
          </p>
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-16">

        {/* Sidebar */}
        <aside className="hidden lg:block w-40 shrink-0">
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

          <section id="dev" className="scroll-mt-24">
            <SectionHeading>{t("Development Tools", "ឧបករណ៍អភិវឌ្ឍន៍")}</SectionHeading>
            <IconGrid items={DEV_TOOLS} kh={kh} />
          </section>

          <section id="design" className="scroll-mt-24">
            <SectionHeading>{t("Design Tools", "ឧបករណ៍រចនា")}</SectionHeading>
            <IconGrid items={DESIGN_TOOLS} kh={kh} />
          </section>

          <section id="ai" className="scroll-mt-24">
            <SectionHeading>{t("AI Tools", "បញ្ញាសិប្បនិមិត្ត (AI Tools)")}</SectionHeading>
            <IconGrid items={AI_TOOLS} kh={kh} />
            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              {t(
                "All AI-generated content was reviewed and approved by the team before publication.",
                "លទ្ធផល AI ទាំងអស់ត្រូវបានត្រួតពិនិត្យ និងអនុម័តដោយក្រុមមុនការផ្សព្វផ្សាយ។"
              )}
            </p>
          </section>

          <section id="research" className="scroll-mt-24">
            <SectionHeading>{t("Research Tools", "ឧបករណ៍ស្រាវជ្រាវ")}</SectionHeading>
            <IconGrid items={RESEARCH_TOOLS} kh={kh} />
          </section>

          <section id="media" className="scroll-mt-24">
            <SectionHeading>{t("Media & Assets", "មេឌៀ និងធនធាន")}</SectionHeading>
            <IconGrid items={MEDIA_ASSETS} kh={kh} />
          </section>

          <section id="refs" className="scroll-mt-24">
            <SectionHeading>{t("Bibliography", "ឯកសារយោង")}</SectionHeading>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800">
              {REFERENCES.map((ref, i) => {
                const Icon = ref.icon;
                return (
                  <div key={i} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 shrink-0">
                      {Icon && <Icon size={16} className={ICON_CLASS} />}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{ref.name}</span>
                      {ref.note && (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">{kh ? ref.note.kh : ref.note.en}</span>
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
                  </div>
                );
              })}
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

function IconGrid({ items, kh }: { items: Item[]; kh: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-b border-zinc-100 dark:border-zinc-800 sm:divide-y-0 sm:border-0">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className={`flex items-center gap-3 py-3 ${
              i < items.length - 1 || items.length % 2 === 0
                ? "sm:border-b sm:border-zinc-100 sm:dark:border-zinc-800"
                : ""
            }`}
          >
            <span className="w-5 shrink-0 flex items-center justify-center">
              {Icon ? <Icon size={17} className={ICON_CLASS} /> : <span className="w-4" />}
            </span>
            <div className="min-w-0">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.name}</span>
              {item.note && (
                <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                  — {kh ? item.note.kh : item.note.en}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
