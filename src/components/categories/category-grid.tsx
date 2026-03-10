"use client";

import Link from "next/link";
import { CATEGORY_COLORS, CATEGORY_SHADOW } from "@/lib/utils";
import {
  FaExclamationTriangle,
  FaBalanceScale,
  FaTrafficLight,
  FaCar,
  FaWrench,
  FaTruck,
  FaBook,
  FaFirstAid,
} from "react-icons/fa";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

const CATEGORIES = [
  {
    slug: "road-sign",
    titleEn: "Traffic Signs",
    titleKh: "ស្ញ្ញាផ្លូវវិថី",
    descEn: "Identify and understand all official road signs used in Cambodia.",
    Icon: FaExclamationTriangle,
  },
  {
    slug: "road-traffic",
    titleEn: "Road Traffic Law",
    titleKh: "ច្បាប់ចរាចរណ៍",
    descEn:
      "Study the legal framework governing road use and user responsibilities.",
    Icon: FaBalanceScale,
  },
  {
    slug: "priority",
    titleEn: "Right of Way",
    titleKh: "សិទ្ធិដំណើរ",
    descEn:
      "Understand priority rules and how to handle intersections correctly.",
    Icon: FaTrafficLight,
  },
  {
    slug: "driving",
    titleEn: "Driving Skills",
    titleKh: "ជំនាញបើកបរ",
    descEn:
      "Learn proper driving techniques and best practices for road safety.",
    Icon: FaCar,
  },
  {
    slug: "technical",
    titleEn: "Vehicle Technology",
    titleKh: "បច្ចេកវិទ្យាយានយន្ត",
    descEn: "How vehicles work, safety systems, and maintenance essentials.",
    Icon: FaWrench,
  },
  {
    slug: "loading-people-goods",
    titleEn: "Loading People & Goods",
    titleKh: "ការដឹកអ្នកដំណើរ",
    descEn:
      "Rules for safe transport of passengers and cargo within legal limits.",
    Icon: FaTruck,
  },
  {
    slug: "general-knowledge",
    titleEn: "General Knowledge",
    titleKh: "ចំណេះដឹងទូទៅ",
    descEn: "Essential road safety topics and broad driving knowledge.",
    Icon: FaBook,
  },
  {
    slug: "emergency",
    titleEn: "Emergency",
    titleKh: "ជំនួយបន្ទាន់",
    descEn: "Emergency procedures, contacts, and protocols for road incidents.",
    Icon: FaFirstAid,
  },
] as const;

export function CategoryGrid() {
  const { lang } = useLang();
  const tr = t[lang].categories;
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="dot-bg py-20 border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div
              className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-lg mb-3"
              style={khFont}
            >
              {tr.sectionBadge}
            </div>
            <h2
              className="text-4xl md:text-5xl font-black text-black leading-tight"
              style={khFont}
            >
              {tr.sectionTitle1}
              <br />
              <span className="underline decoration-yellow-400 decoration-4">
                {tr.sectionTitle2}
              </span>
            </h2>
          </div>
          <p
            className="text-zinc-600 max-w-sm text-base leading-relaxed"
            style={khFont}
          >
            {tr.sectionDesc}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => {
            const color = CATEGORY_COLORS[cat.slug];
            const shadow = CATEGORY_SHADOW[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group flex flex-col bg-white border-2 border-black rounded-3xl overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1"
                style={{ boxShadow: "4px 4px 0 #000" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = shadow;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "4px 4px 0 #000";
                }}
              >
                {/* Color header */}
                <div
                  className="flex items-center justify-center py-8 border-b-2 border-black"
                  style={{ backgroundColor: color }}
                >
                  <div className="w-16 h-16 bg-white border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0_#000]">
                    <cat.Icon size={28} className="text-black" />
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 gap-2">
                  <h3
                    className="font-black text-lg text-black leading-tight"
                    style={khFont}
                  >
                    {kh ? cat.titleKh : cat.titleEn}
                  </h3>
                  <p
                    className="text-xs text-zinc-500"
                    style={{ fontFamily: "Siemreap, sans-serif" }}
                  >
                    {cat.titleKh}
                  </p>
                  <p
                    className="text-sm text-zinc-600 leading-relaxed mt-1 flex-1"
                    style={khFont}
                  >
                    {cat.descEn}
                  </p>

                  {/* Bottom indicator */}
                  <div className="mt-3 pt-3 border-t-2 border-black flex items-center justify-between">
                    <span
                      className="text-xs font-black px-2 py-0.5 border border-black rounded-lg"
                      style={{ backgroundColor: color, ...khFont }}
                    >
                      {tr.studyNow}
                    </span>
                    <div
                      className="w-7 h-7 border-2 border-black rounded-lg flex items-center justify-center group-hover:translate-x-0.5 transition-transform"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-base font-black leading-none">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
