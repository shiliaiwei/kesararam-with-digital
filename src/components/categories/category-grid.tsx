"use client";

import { AnimatedCategoryCard } from "./animated-category-card";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

const CATEGORIES = [
  {
    slug: "road-sign",
    titleEn: "Traffic Signs",
    titleKh: "សញ្ញាផ្លូវវិថី",
    descEn: "Identify and understand all official road signs used in Cambodia.",
  },
  {
    slug: "road-traffic",
    titleEn: "Road Traffic Law",
    titleKh: "ច្បាប់ចរាចរ",
    descEn: "Study the legal framework governing road use and user responsibilities.",
  },
  {
    slug: "priority",
    titleEn: "Right of Way",
    titleKh: "សិទ្ធិដំណើរ",
    descEn: "Understand priority rules and how to handle intersections correctly.",
  },
  {
    slug: "driving",
    titleEn: "Driving Skills",
    titleKh: "ជំនាញបើកបរ",
    descEn: "Learn proper driving techniques and best practices for road safety.",
  },
  {
    slug: "technical",
    titleEn: "Vehicle Technology",
    titleKh: "បច្ចេកវិទ្យាយានយន្ត",
    descEn: "How vehicles work, safety systems, and maintenance essentials.",
  },
  {
    slug: "loading-people-goods",
    titleEn: "Loading People & Goods",
    titleKh: "ការដឹកអ្នកដំណើរ",
    descEn: "Rules for safe transport of passengers and cargo within legal limits.",
  },
  {
    slug: "general-knowledge",
    titleEn: "General Knowledge",
    titleKh: "ចំណេះដឹងទូទៅ",
    descEn: "Essential road safety topics and broad driving knowledge.",
  },
  {
    slug: "emergency",
    titleEn: "Emergency",
    titleKh: "ជំនួយបន្ទាន់",
    descEn: "Emergency procedures, contacts, and protocols for road incidents.",
  },
] as const;

export function CategoryGrid() {
  const { lang } = useLang();
  const tr = t[lang].categories;
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-learning)" } : {};

  return (
    <section className="dot-bg py-20 border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div
              className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-none mb-3"
              style={khFont}
            >
              {tr.sectionBadge}
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-black leading-tight"
              style={khFont}
            >
              {tr.sectionTitle1}{" "}
              <span className="underline decoration-yellow-400 decoration-4">
                {tr.sectionTitle2}
              </span>
            </h2>
          </div>
          <p className="text-zinc-600 max-w-sm text-base leading-relaxed" style={khFont}>
            {tr.sectionDesc}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
          {CATEGORIES.map((cat, index) => (
            <AnimatedCategoryCard
              key={cat.slug}
              slug={cat.slug}
              titleEn={cat.titleEn}
              titleKh={cat.titleKh}
              descEn={cat.descEn}
              index={index}
              lang={lang}
              studyNowText={tr.studyNow}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
