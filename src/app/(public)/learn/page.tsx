"use client";

import { AnimatedCategoryCard } from "@/components/categories/animated-category-card";

const CATEGORIES = [
  {
    slug: "road-sign",
    titleEn: "Traffic Signs",
    titleKh: "សញ្ញាចរាចរណ៍",
    descEn: "Identify and understand all official road signs used in Cambodia.",
  },
  {
    slug: "road-traffic",
    titleEn: "Road Traffic Law",
    titleKh: "ច្បាប់ចរាចរណ៍ផ្លូវ",
    descEn: "Study the legal framework governing road use and user responsibilities.",
  },
  {
    slug: "priority",
    titleEn: "Right of Way",
    titleKh: "សិទ្ធិអាទិភាព",
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
    titleKh: "ផ្ទុកមនុស្ស និងទំនិញ",
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
    titleKh: "ពេលអាសន្ន",
    descEn: "Emergency procedures, contacts, and protocols for road incidents.",
  },
] as const;

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-black text-white border-b-4 border-black" style={{ boxShadow: "0 4px 0 #000" }}>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4">LEARN</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Master Cambodia&apos;s driving theory across 8 comprehensive knowledge categories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">EIGHT CATEGORIES</h2>
          <p className="text-zinc-600">Choose a category to start learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, index) => (
            <AnimatedCategoryCard
              key={cat.slug}
              slug={cat.slug}
              titleEn={cat.titleEn}
              titleKh={cat.titleKh}
              descEn={cat.descEn}
              index={index}
              lang="en"
              studyNowText="Study now"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
