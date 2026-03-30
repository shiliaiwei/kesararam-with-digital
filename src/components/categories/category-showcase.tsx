"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { CATEGORY_COLORS } from "@/lib/utils";
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

interface CategoryShowcaseProps {
  lang?: "en" | "kh";
}

const CATEGORIES = [
  {
    slug: "road-sign",
    titleEn: "Traffic Signs",
    titleKh: "សញ្ញាផ្លូវវិថី",
    Icon: FaExclamationTriangle,
    animation: "rotate-morph",
  },
  {
    slug: "road-traffic",
    titleEn: "Road Traffic Law",
    titleKh: "ច្បាប់ចរាចរ",
    Icon: FaBalanceScale,
    animation: "swing-balance",
  },
  {
    slug: "priority",
    titleEn: "Right of Way",
    titleKh: "សិទ្ធិដំណើរ",
    Icon: FaTrafficLight,
    animation: "traffic-pulse",
  },
  {
    slug: "driving",
    titleEn: "Driving Skills",
    titleKh: "ជំនាញបើកបរ",
    Icon: FaCar,
    animation: "drive-path",
  },
  {
    slug: "technical",
    titleEn: "Vehicle Technology",
    titleKh: "បច្ចេកវិទ្យាយានយន្ត",
    Icon: FaWrench,
    animation: "mechanical-spin",
  },
  {
    slug: "loading-people-goods",
    titleEn: "Loading People & Goods",
    titleKh: "ការដឹកអ្នកដំណើរ",
    Icon: FaTruck,
    animation: "bounce-load",
  },
  {
    slug: "general-knowledge",
    titleEn: "General Knowledge",
    titleKh: "ចំណេះដឹងទូទៅ",
    Icon: FaBook,
    animation: "page-flip",
  },
  {
    slug: "emergency",
    titleEn: "Emergency",
    titleKh: "ជំនួយបន្ទាន់",
    Icon: FaFirstAid,
    animation: "emergency-flash",
  },
];

export function CategoryShowcase({ lang = "en" }: CategoryShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen dot-bg py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-4 py-2 rounded-none mb-4"
            style={khFont}
          >
            {kh ? "ប្រភេទចំណេះដឹង" : "Category Showcase"}
          </div>
          <h1
            className="text-5xl md:text-6xl font-black text-black leading-tight mb-4"
            style={khFont}
          >
            {kh ? "ចំណេះដឹងចរាចរណ៍" : "Animated Category Covers"}
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto" style={khFont}>
            {kh
              ? "រៀនចំណេះដឹងចរាចរណ៍ជាមួយនឹងការរចនាដែលទាក់ទាញ"
              : "Interactive category covers with unique animations for each topic"}
          </p>
        </div>

        {/* Grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {CATEGORIES.map((cat, index) => (
            <ShowcaseCard
              key={cat.slug}
              category={cat}
              index={index}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ShowcaseCardProps {
  category: (typeof CATEGORIES)[0];
  index: number;
  lang: "en" | "kh";
}

function ShowcaseCard({ category, index, lang }: ShowcaseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const color = CATEGORY_COLORS[category.slug];
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  // Initial entrance animation
  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 60,
        rotationX: -15,
        scale: 0.8,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.8,
        delay: index * 0.15,
        ease: "back.out(1.4)",
      }
    );
  }, [index]);

  // Continuous idle animation
  useEffect(() => {
    if (!iconRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });

    switch (category.animation) {
      case "rotate-morph":
        tl.to(iconRef.current, {
          rotation: 360,
          scale: 1.1,
          duration: 4,
          ease: "power1.inOut",
        });
        break;

      case "swing-balance":
        tl.to(iconRef.current, {
          rotaImpact();
      },
      idle: () => {
        gsap.to(iconRef.current, {
          y: -5,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      },
    },
    // General Knowledge - Book flip
    {
      name: "General Knowledge",
      hover: () => {
        gsap.to(iconRef.current, {
        