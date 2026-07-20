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
  const khFont = kh ? { fontFamily: "var(--font-learning)" } : {};

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
          className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-6"
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
  const khFont = kh ? { fontFamily: "var(--font-learning)" } : {};

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
          rotation: 15,
          duration: 1.2,
          ease: "power1.inOut",
        }).to(iconRef.current, {
          rotation: -15,
          duration: 1.2,
          ease: "power1.inOut",
        }).to(iconRef.current, {
          rotation: 0,
          duration: 0.8,
          ease: "power1.inOut",
        });
        break;

      case "traffic-pulse":
        tl.to(iconRef.current, {
          scale: 1.2,
          duration: 0.5,
          ease: "power2.out",
        }).to(iconRef.current, {
          scale: 1,
          duration: 0.5,
          ease: "power2.in",
        }).to(iconRef.current, {
          scale: 1,
          duration: 1,
        });
        break;

      case "drive-path":
        tl.to(iconRef.current, {
          x: 8,
          duration: 0.6,
          ease: "power1.inOut",
        }).to(iconRef.current, {
          x: -8,
          duration: 0.6,
          ease: "power1.inOut",
        }).to(iconRef.current, {
          x: 0,
          duration: 0.4,
          ease: "power1.inOut",
        });
        break;

      case "mechanical-spin":
        tl.to(iconRef.current, {
          rotation: 180,
          duration: 2,
          ease: "none",
        }).to(iconRef.current, {
          rotation: 360,
          duration: 2,
          ease: "none",
        });
        break;

      case "bounce-load":
        tl.to(iconRef.current, {
          y: -10,
          duration: 0.4,
          ease: "power2.out",
        }).to(iconRef.current, {
          y: 0,
          duration: 0.4,
          ease: "bounce.out",
        }).to(iconRef.current, {
          y: 0,
          duration: 0.8,
        });
        break;

      case "page-flip":
        tl.to(iconRef.current, {
          rotationY: 180,
          duration: 1,
          ease: "power1.inOut",
        }).to(iconRef.current, {
          rotationY: 360,
          duration: 1,
          ease: "power1.inOut",
        }).to(iconRef.current, {
          rotationY: 0,
          duration: 0,
        });
        break;

      case "emergency-flash":
        tl.to(iconRef.current, {
          scale: 1.3,
          opacity: 0.6,
          duration: 0.3,
          ease: "power2.out",
        }).to(iconRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "power2.in",
        }).to(iconRef.current, {
          scale: 1,
          duration: 0.8,
        });
        break;

      default:
        tl.to(iconRef.current, {
          y: -6,
          duration: 1,
          ease: "power1.inOut",
        }).to(iconRef.current, {
          y: 0,
          duration: 1,
          ease: "power1.inOut",
        });
    }

    return () => { tl.kill(); };
  }, [category.animation]);

  // Hover animation
  useEffect(() => {
    if (!iconRef.current) return;
    if (isHovered) {
      gsap.to(iconRef.current, { scale: 1.3, duration: 0.3, ease: "back.out(1.7)" });
    } else {
      gsap.to(iconRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
    }
  }, [isHovered]);

  const Icon = category.Icon;

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col overflow-hidden border-2 border-black cursor-pointer"
      style={{
        boxShadow: isHovered ? `6px 6px 0 ${color ?? "#000"}` : "4px 4px 0 #000",
        transform: isHovered ? "translate(-2px,-2px)" : "translate(0,0)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        background: "#fff",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: 160,
          backgroundColor: isHovered ? (color ?? "#eab308") : `${color ?? "#eab308"}22`,
          transition: "background-color 0.3s ease",
        }}
      >
        <div ref={bgRef} className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${color ?? "#000"}33 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            opacity: isHovered ? 0.8 : 0.3,
            transition: "opacity 0.3s ease",
          }} />
        <div ref={iconRef} className="relative z-10 text-5xl"
          style={{ color: isHovered ? "#fff" : (color ?? "#000") }}>
          <category.Icon />
        </div>
        <div ref={particlesRef} />
      </div>

      {/* Content */}
      <div className="p-4 border-t-2 border-black">
        <h3 className="font-black text-base text-black" style={khFont}>
          {kh ? category.titleKh : category.titleEn}
        </h3>
      </div>
    </div>
  );
}
