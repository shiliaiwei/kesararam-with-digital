"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedCategoryCard } from "@/components/categories/animated-category-card";
import { useLang } from "@/context/lang-context";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  { slug: "road-sign", titleEn: "Traffic Signs", titleKh: "សញ្ញាចរាចរណ៍", descEn: "Identify and understand all official road signs used in Cambodia." },
  { slug: "road-traffic", titleEn: "Road Traffic Law", titleKh: "ច្បាប់ចរាចរណ៍ផ្លូវ", descEn: "Study the legal framework governing road use and user responsibilities." },
  { slug: "priority", titleEn: "Right of Way", titleKh: "សិទ្ធិអាទិភាព", descEn: "Understand priority rules and how to handle intersections correctly." },
  { slug: "driving", titleEn: "Driving Skills", titleKh: "ជំនាញបើកបរ", descEn: "Learn proper driving techniques and best practices for road safety." },
  { slug: "technical", titleEn: "Vehicle Technology", titleKh: "បច្ចេកវិទ្យាយានយន្ត", descEn: "How vehicles work, safety systems, and maintenance essentials." },
  { slug: "loading-people-goods", titleEn: "Loading People & Goods", titleKh: "ផ្ទុកមនុស្ស និងទំនិញ", descEn: "Rules for safe transport of passengers and cargo within legal limits." },
  { slug: "general-knowledge", titleEn: "General Knowledge", titleKh: "ចំណេះដឹងទូទៅ", descEn: "Essential road safety topics and broad driving knowledge." },
  { slug: "emergency", titleEn: "Emergency", titleKh: "ពេលអាសន្ន", descEn: "Emergency procedures, contacts, and protocols for road incidents." },
] as const;

const STATS = [
  { value: "500+", labelEn: "Questions", labelKh: "សំណួរ", color: "#eab308" },
  { value: "8", labelEn: "Categories", labelKh: "ប្រភេទ", color: "#3b82f6" },
  { value: "3", labelEn: "Study Modes", labelKh: "របៀបរៀន", color: "#22c55e" },
  { value: "KH/EN", labelEn: "Bilingual", labelKh: "ពីរភាសា", color: "#a855f7" },
];

export default function LearnPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(headingRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
      .fromTo(subRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3")
      .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, "-=0.2");

    // Stats count-up on scroll
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll(".stat-card"),
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.5, stagger: 0.1, ease: "back.out(1.4)",
          scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden border-b-4 border-black"
        style={{ background: "linear-gradient(135deg, #000 0%, #1a1a2e 100%)" }}
      >
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            animation: "slide 8s linear infinite",
          }}
        />
        {/* Yellow accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex flex-col gap-5 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-3 py-1.5 w-fit border-2 border-yellow-400">
                <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                {kh ? "មជ្ឈមណ្ឌលចំណេះដឹង" : "Knowledge Hub"}
              </div>
              <h1
                ref={headingRef}
                className="text-5xl md:text-6xl font-black leading-tight"
                style={{ color: "#eab308", ...khFont }}
              >
                {kh ? "រៀន" : "LEARN"}
                <span className="text-white">.</span>
              </h1>
              <p
                ref={subRef}
                className="text-lg md:text-xl text-white/60 max-w-lg leading-relaxed"
                style={khFont}
              >
                {kh
                  ? "រៀនបើកបរ និងស្គាល់សញ្ញាចរាចរ — ៨ ប្រភេទ ២ ភាសា"
                  : "Master Cambodia's driving theory across 8 categories — in Khmer & English."}
              </p>
              <div ref={ctaRef} className="flex flex-wrap gap-3">
                <Link
                  href="/play"
                  className="px-6 py-3 bg-yellow-400 text-black font-black border-2 border-yellow-400 transition-all duration-100 hover:-translate-y-1"
                  style={{ boxShadow: "4px 4px 0 #ca8a04", ...khFont }}
                >
                  {kh ? "លេងឥឡូវ →" : "Play Now →"}
                </Link>
                <Link
                  href="/leaderboard"
                  className="px-6 py-3 bg-transparent text-white font-black border-2 border-white/40 hover:border-white transition-all duration-100"
                  style={khFont}
                >
                  {kh ? "ចំណាត់ថ្នាក់" : "Leaderboard"}
                </Link>
              </div>
            </div>

            {/* Floating category count */}
            <div className="hidden md:flex flex-col items-center justify-center w-40 h-40 border-4 border-yellow-400 bg-yellow-400/10 flex-shrink-0"
              style={{ boxShadow: "8px 8px 0 #ca8a04" }}>
              <span className="text-6xl font-black text-yellow-400">8</span>
              <span className="text-xs font-black text-white/60 tracking-widest uppercase mt-1">
                {kh ? "ប្រភេទ" : "Categories"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div ref={statsRef} className="border-b-2 border-black bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, labelEn, labelKh, color }) => (
              <div
                key={labelEn}
                className="stat-card border-2 border-black p-5 flex flex-col gap-1"
                style={{ boxShadow: `4px 4px 0 ${color}` }}
              >
                <span className="text-3xl font-black" style={{ color }}>{value}</span>
                <span className="text-sm font-bold text-zinc-500" style={khFont}>{kh ? labelKh : labelEn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div id="categories" className="dot-bg py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
                {kh ? "ប្រភេទចំណេះដឹង" : "Knowledge Categories"}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black leading-tight" style={khFont}>
                {kh ? "ប្រភេទ" : "Eight"}{" "}
                <span className="underline decoration-yellow-400 decoration-4">
                  {kh ? "ទាំង ៨" : "Categories"}
                </span>
              </h2>
            </div>
            <p className="text-zinc-500 max-w-xs text-sm leading-relaxed" style={khFont}>
              {kh ? "ជ្រើសរើសប្រភេទ ហើយចាប់ផ្តើមរៀន" : "Pick a category and start studying at your own pace."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat, index) => (
              <AnimatedCategoryCard
                key={cat.slug}
                slug={cat.slug}
                titleEn={cat.titleEn}
                titleKh={cat.titleKh}
                descEn={cat.descEn}
                index={index}
                lang={lang}
                studyNowText={kh ? "រៀនឥឡូវ" : "Study now"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="bg-black border-t-4 border-yellow-400 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl md:text-5xl font-black text-white" style={khFont}>
            {kh ? "ត្រៀមខ្លួនហើយ?" : "Ready to test yourself?"}
          </h2>
          <p className="text-white/50 text-lg" style={khFont}>
            {kh ? "រៀន — ប្រកួត — ការពារជីវិត" : "Study the theory, play the games, pass the exam."}
          </p>
          <Link
            href="/play"
            className="px-10 py-4 bg-yellow-400 text-black font-black border-2 border-yellow-400 text-lg transition-all hover:-translate-y-1"
            style={{ boxShadow: "6px 6px 0 #ca8a04", ...khFont }}
          >
            {kh ? "លេងឥឡូវ →" : "Start Playing →"}
          </Link>
        </div>
      </section>
    </div>
  );
}
