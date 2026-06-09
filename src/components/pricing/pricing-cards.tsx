"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Crown,
  Car,
  Users,
  Clock,
  Shield,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mail,
  MessageCircle,
  Star,
  TrendingDown,
  Lock,
  CreditCard,
} from "lucide-react";

interface PricingCardsProps {
  lang?: "en" | "kh";
}

/** Plans a user can pick. "driving_school" is shown as "Academy Plan" in copy. */
type PlanKey = "family" | "teacher_pro" | "school" | "driving_school";

/**
 * Single source of truth for prices (USD). Promo runs through end of 2026.
 * promoM/stdM = monthly · promoY/stdY = yearly.
 */
const PRICES: Record<PlanKey, { promoM: number; stdM: number; promoY: number; stdY: number }> = {
  family: { promoM: 2, stdM: 5, promoY: 20, stdY: 60 },
  teacher_pro: { promoM: 3, stdM: 10, promoY: 24, stdY: 80 },
  school: { promoM: 6, stdM: 20, promoY: 54, stdY: 180 },
  driving_school: { promoM: 11, stdM: 35, promoY: 110, stdY: 350 },
};

const PLAN_LABELS: Record<PlanKey, { en: string; kh: string }> = {
  family: { en: "Family Plan", kh: "ផែនការគ្រួសារ" },
  teacher_pro: { en: "Teacher Pro", kh: "គ្រូ Pro" },
  school: { en: "School Plan", kh: "ផែនការសាលា" },
  driving_school: { en: "Academy Plan", kh: "ផែនការសាលាបណ្តុះបណ្តាល" },
};

/**
 * PSYCHOLOGY — Price anchoring + loss aversion via step-up warning.
 * Shows how much of the promo window has elapsed as a filling bar.
 */
function usePriceStepUp(start: string, end: string) {
  const [pct, setPct] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      const elapsed = Math.max(0, now - s);
      const total = e - s;
      setPct(Math.min(100, Math.round((elapsed / total) * 100)));
      setDaysLeft(Math.max(0, Math.ceil((e - now) / 86400000)));
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [start, end]);

  return { pct, daysLeft };
}

export function PricingCards({ lang = "en" }: PricingCardsProps) {
  const [yearly, setYearly] = useState(true); // Default nudge to yearly

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const billingParam = searchParams.get("billing") || searchParams.get("yearly");
    if (billingParam === "yearly" || billingParam === "true") {
      setYearly(true);
      localStorage.setItem("kwd-billing-cycle", "yearly");
    } else if (billingParam === "monthly" || billingParam === "false") {
      setYearly(false);
      localStorage.setItem("kwd-billing-cycle", "monthly");
    } else {
      const saved = localStorage.getItem("kwd-billing-cycle");
      if (saved === "yearly") setYearly(true);
      else if (saved === "monthly") setYearly(false);
    }
  }, []);

  const promo = true;
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("teacher_pro");

  const kh = lang === "kh";
  // Google Sans (EN) / Kantumruy Pro (KH) — never fall back to system font.
  const pf = { fontFamily: '"GoogleSans", "Google Sans", sans-serif' };
  const khFont = pf;

  const { pct, daysLeft } = usePriceStepUp("2026-01-01T00:00:00", "2026-12-31T23:59:59");

  /** Current charge for a plan given the billing cycle + promo flag. */
  const planUsd = (plan: PlanKey, yr: boolean) => {
    const p = PRICES[plan];
    return promo ? (yr ? p.promoY : p.promoM) : yr ? p.stdY : p.stdM;
  };
  /** Standard (non-promo) price — shown struck-through. */
  const stdUsd = (plan: PlanKey, yr: boolean) => (yr ? PRICES[plan].stdY : PRICES[plan].stdM);

  const cycleSuffix = yearly
    ? kh
      ? "USD/ឆ្នាំ"
      : "USD/year"
    : kh
      ? "USD/ខែ"
      : "USD/month";

  // Free → sign in. Teacher/School/Academy → plan-aware application form.
  // Family → scroll to the KHQR checkout below.
  const handleSelectPlan = (planKey: PlanKey | "free") => {
    if (planKey === "free") {
      window.location.href = "/login";
      return;
    }
    if (planKey === "teacher_pro" || planKey === "school" || planKey === "driving_school") {
      const cycle = yearly ? "yearly" : "monthly";
      window.location.href = `/register/teacher?plan=${planKey}&cycle=${cycle}`;
      return;
    }
    // Family (B2C self-serve) → KHQR checkout
    setSelectedPlan(planKey);
    setTimeout(() => {
      const el = document.getElementById("checkout-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const getCheckoutDetails = () => {
    const rate = 4100; // 1 USD = 4100 KHR
    const usd = planUsd(selectedPlan, yearly);
    const base = PLAN_LABELS[selectedPlan];
    const cyc = yearly ? (kh ? "ប្រចាំឆ្នាំ" : "Annual") : kh ? "ប្រចាំខែ" : "Monthly";
    const tag = promo ? (kh ? " — ប្រូម៉ូ" : " — Promo") : "";
    return {
      usd,
      khr: usd * rate,
      name: `${kh ? base.kh : base.en} (${cyc}${tag})`,
    };
  };

  const checkout = getCheckoutDetails();

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#080808] text-white py-8 md:py-16 px-4" style={pf}>
      {/* ── Ambient premium background glows ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* ── Header & Scarcity Promo ── */}
        <div className="text-center mb-8 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-5 md:mb-7 uppercase tracking-widest">
            <Sparkles size={13} className="shrink-0" />
            {kh
              ? "ដោះសោសក្ដានុពលពេញលេញរបស់អ្នក"
              : "Unlock your full teaching potential"}
          </div>

          <h1
            className="text-2xl xs:text-3xl md:text-7xl font-black mb-3 md:mb-4 tracking-tight leading-[1.1] md:leading-[1.05]"
            style={khFont}
          >
            {kh ? (
              "ជ្រើសរើសផែនការរបស់អ្នក"
            ) : (
              <>
                Choose the plan that{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  grows your class
                </span>
              </>
            )}
          </h1>
          <p className="text-white/55 text-sm md:text-xl max-w-2xl mx-auto mb-5 md:mb-6" style={khFont}>
            {kh
              ? "សិស្សលេងឥតគិតថ្លៃជានិច្ច។ ឪពុកម្ដាយ គ្រូបង្រៀន និងសាលាបណ្តុះបណ្តាលទទួលបានឧបករណ៍កម្រិតខ្ពស់។"
              : "Students always play free. Parents, teachers & academies get advanced coaching tools."}
          </p>

          {/* PSYCHOLOGY — Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6 text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white/80">4.9/5</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60" style={khFont}>
              <Users size={15} className="text-amber-400" />
              <span className="font-semibold">
                {kh ? "គ្រូ និងសាលាជាង ១២០+ កំពុងប្រើ" : "Trusted by 120+ teachers & schools"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60" style={khFont}>
              <ShieldCheck size={15} className="text-green-400" />
              <span className="font-semibold">
                {kh ? "បើកគណនីក្នុង ២៤ម៉ោង" : "Activated within 24h"}
              </span>
            </div>
          </div>

          {/* PSYCHOLOGY — Value proposition banner (replaces price step-up) */}
          {promo && (
            <div className="max-w-sm mx-auto mb-7 px-1">
              <div className="bg-amber-400/8 border border-amber-400/25 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest" style={khFont}>
                    {kh ? "ប្រូម៉ូពិសេស" : "Special launch offer"}
                  </span>
                </div>
                <p className="text-white/50 text-xs font-bold leading-relaxed" style={khFont}>
                  {kh
                    ? "ធ្វើឱ្យប្រសើរឡើងថ្ងៃនេះ ហើយទទួលបានឧបករណ៍គ្រប់គ្រងថ្នាក់ របាយការណ៍ និងហ្គេមផ្ទាល់ គ្មានដែនកំណត់ សម្រាប់សិស្សរបស់អ្នក។"
                    : "Upgrade today and give your students unlimited live games, full analytics, and every question category."}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  {kh ? `នៅសល់ ${daysLeft} ថ្ងៃក្នុងរយៈពេលប្រូម៉ូ` : `${daysLeft} days left at this price`}
                </span>
              </div>
            </div>
          )}

          {/* Billing Cycle switch */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mt-2 bg-white/5 border border-white/10 rounded-2xl p-2.5 md:p-4 max-w-[280px] xs:max-w-xs md:max-w-sm mx-auto backdrop-blur-sm">
            <span className={`text-sm font-bold transition-colors ${!yearly ? "text-white" : "text-white/40"}`} style={khFont}>
              {kh ? "ប្រចាំខែ" : "Monthly"}
            </span>
            <button
              onClick={() => {
                const nextVal = !yearly;
                setYearly(nextVal);
                localStorage.setItem("kwd-billing-cycle", nextVal ? "yearly" : "monthly");
              }}
              role="switch"
              aria-checked={yearly}
              className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${yearly ? "bg-amber-400" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${yearly ? "translate-x-6 md:translate-x-7" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${yearly ? "text-white" : "text-white/40"}`} style={khFont}>
              {kh ? "ប្រចាំឆ្នាំ" : "Yearly"}
              <span className="ml-1 text-[9px] md:text-xs bg-green-500/20 text-green-400 px-1.5 md:px-2 py-0.5 rounded-full font-black whitespace-nowrap">
                {kh ? "ឥតគិតថ្លៃ ៣-៤ ខែ" : "3-4 mo free"}
              </span>
            </span>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden text-center text-xs text-white/40 mb-4 animate-pulse flex items-center justify-center gap-1.5">
          <span>{kh ? "អូសទៅឆ្វេង ឬស្ដាំ ដើម្បីមើលផែនការទាំងអស់" : "Swipe left or right to view all plans"}</span>
          <ArrowRight size={12} className="text-amber-400" />
        </div>

        {/* ── Four Pricing Cards Grid ── */}
        <div className="max-w-7xl mx-auto flex md:grid md:grid-cols-4 gap-5 md:items-stretch overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-8 md:pb-0 mb-16 px-4 -mx-4 md:mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Tier 1: Free (Student) */}
          <div className="w-[88vw] xs:w-[80vw] md:w-auto shrink-0 snap-center bg-white/[0.03] border border-white/10 hover:border-white/25 rounded-3xl p-4 xs:p-5 md:p-6 flex flex-col transition-all duration-200 group backdrop-blur-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-zinc-400" />
                <span className="text-sm font-bold text-white/50" style={khFont}>
                  {kh ? "ឥតគិតថ្លៃ" : "Free"}
                </span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black">$0</span>
              </div>
              <p className="text-white/40 text-xs" style={khFont}>
                {kh ? "សម្រាប់សិស្ស និងអ្នករៀនទូទៅ" : "For students & curious learners"}
              </p>
            </div>

            <button
              onClick={() => handleSelectPlan("free")}
              className="w-full py-3 rounded-xl text-sm font-black transition-all mb-3 border border-white/20 text-white hover:bg-white/10"
              style={khFont}
            >
              {kh ? "ចាប់ផ្ដើមឥតគិតថ្លៃ" : "Get Started Free"}
            </button>
            <p className="text-[10px] text-white/30 text-center mb-6" style={khFont}>
              {kh ? "មិនត្រូវការកាតឥណទាន" : "No credit card required"}
            </p>

            <div className="flex flex-col gap-3 flex-1">
              <p className="text-xs text-white/30 uppercase tracking-widest font-black" style={khFont}>
                {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
              </p>
              {[
                { en: "Join live games as student", kh: "ចូលរួមសកម្មភាពផ្ទាល់ជាសិស្ស" },
                { en: "Browse 1 question category", kh: "មើលប្រភេទសំណួរ ១" },
                { en: "10 practice questions/day", kh: "១០ សំណួរអនុវត្ត/ថ្ងៃ" },
                { en: "No account required to play", kh: "មិនត្រូវការគណនីដើម្បីលេង" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/80" style={khFont}>
                    {kh ? f.kh : f.en}
                  </span>
                </div>
              ))}

              <div className="border-t border-white/10 my-2" />
              {[
                { en: "Host live sessions", kh: "រៀបចំវគ្គផ្ទាល់" },
                { en: "Analytics & reports", kh: "វិភាគ និងរបាយការណ៍" },
                { en: "All question categories", kh: "ប្រភេទសំណួរទាំងអស់" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 opacity-35">
                  <Lock size={13} className="mt-0.5 shrink-0" />
                  <span className="text-sm text-white/50 line-through" style={khFont}>
                    {kh ? f.kh : f.en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2: Family Plan */}
          <div className="w-[88vw] xs:w-[80vw] md:w-auto shrink-0 snap-center bg-white/[0.03] border border-white/10 hover:border-green-400/40 rounded-3xl p-4 xs:p-5 md:p-6 flex flex-col transition-all duration-200 group backdrop-blur-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-green-400" />
                <span className="text-sm font-bold text-green-400" style={khFont}>
                  {kh ? "ផែនការគ្រួសារ" : "Family Plan"}
                </span>
              </div>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-white leading-none">${planUsd("family", yearly)}</span>
                <div className="flex flex-col mb-1">
                  {promo && (
                    <span className="text-sm font-black text-white/30 line-through leading-none">
                      ${stdUsd("family", yearly)}
                    </span>
                  )}
                  <span className="text-white/50 text-xs leading-tight" style={khFont}>
                    {cycleSuffix}
                  </span>
                </div>
              </div>
              {promo && (
                <div className="flex items-center gap-1.5 text-[11px] font-black text-green-400 mt-2 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-lg w-fit">
                  <TrendingDown size={12} />
                  {kh ? "បញ្ចុះ ៦០%" : "Save 60%"}
                </div>
              )}

              <p className="text-white/50 text-xs mt-3" style={khFont}>
                {kh ? "សម្រាប់ឪពុកម្ដាយ — ការពារកូនអ្នក" : "For parents — protect your child"}
              </p>
            </div>

            <button
              onClick={() => handleSelectPlan("family")}
              className="w-full py-3 rounded-xl text-sm font-black transition-all mb-1 bg-green-600 text-white hover:bg-green-500 shadow-md shadow-green-600/20 hover:scale-[1.02]"
              style={khFont}
            >
              {kh ? "ជ្រើសរើសផែនការគ្រួសារ" : "Get Family Plan"}
            </button>
            <p className="text-[10px] text-white/30 text-center mb-5" style={khFont}>
              {kh ? "បោះបង់បានគ្រប់ពេល" : "Cancel anytime"}
            </p>

            <div className="flex flex-col gap-3 flex-1">
              <p className="text-xs text-green-400/80 uppercase tracking-widest font-black" style={khFont}>
                {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
              </p>
              {[
                { en: "Child progress dashboard", kh: "ផ្ទាំងតាមដានកូន" },
                { en: "Parental alerts", kh: "ការជូនដំណឹងដល់ឪពុកម្ដាយ" },
                { en: "Full curriculum access", kh: "ចូលដំណើរការ Curriculum ពេញលេញ" },
                { en: "3,300 practice questions", kh: "៣,៣០០ សំណួរអនុវត្ត" },
                { en: "Up to 9 children", kh: "កូនរហូតដល់ ៩ នាក់" },
                { en: "Achievement certificates", kh: "វិញ្ញាបនបត្រ Achievement" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-green-400/20 flex items-center justify-center mt-0.5">
                    <Check size={9} className="text-green-400" />
                  </span>
                  <span className="text-sm text-white/85" style={khFont}>
                    {kh ? f.kh : f.en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 3: School & Teacher (Hero / Center-stage) */}
          <div className="w-[90vw] xs:w-[84vw] md:w-auto shrink-0 snap-center relative md:scale-[1.04] md:-my-1 bg-gradient-to-b from-amber-400/20 via-amber-400/[0.06] to-transparent border-2 border-amber-400/70 shadow-[0_0_60px_rgba(251,191,36,0.22)] hover:shadow-[0_0_90px_rgba(251,191,36,0.35)] rounded-3xl p-4 xs:p-4 md:p-6 flex flex-col transition-all duration-300 group">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-amber-300/40 to-transparent opacity-60 blur-[1px]"
              style={{ maskImage: "linear-gradient(black, transparent)" }}
            />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/30 whitespace-nowrap">
              <Star size={12} className="fill-black" />
              {kh ? "ពេញនិយមបំផុត" : "Most Popular"}
            </div>

            <div className="relative mb-3 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Crown size={18} className="text-amber-400" />
                <span className="text-sm font-bold text-amber-400" style={khFont}>
                  {kh ? "សាលា & គ្រូបង្រៀន" : "School & Teacher"}
                </span>
              </div>

              {/* Split price: Teacher | School */}
              <div className="grid grid-cols-2 gap-3 border-b border-amber-400/20 pb-4 mb-3">
                <div className="border-r border-white/10 pr-3">
                  <p className="text-[10px] font-black text-amber-300/80 uppercase tracking-wider mb-1" style={khFont}>
                    {kh ? "គ្រូ" : "Teacher"}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white leading-none">${planUsd("teacher_pro", yearly)}</span>
                    <span className="text-white/50 text-[9px] mb-0.5" style={khFont}>
                      {yearly ? (kh ? "/ឆ្នាំ" : "/yr") : kh ? "/ខែ" : "/mo"}
                    </span>
                  </div>
                  {promo && (
                    <div className="text-[9px] font-bold text-zinc-500 mt-0.5">
                      <span className="line-through text-white/30">${stdUsd("teacher_pro", yearly)}</span>
                      <span className="text-green-400 ml-1">-70%</span>
                    </div>
                  )}
                </div>

                <div className="pl-1">
                  <p className="text-[10px] font-black text-amber-300/80 uppercase tracking-wider mb-1" style={khFont}>
                    {kh ? "សាលា" : "School"}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white leading-none">${planUsd("school", yearly)}</span>
                    <span className="text-white/50 text-[9px] mb-0.5" style={khFont}>
                      {yearly ? (kh ? "/ឆ្នាំ" : "/yr") : kh ? "/ខែ" : "/mo"}
                    </span>
                  </div>
                  {promo && (
                    <div className="text-[9px] font-bold text-zinc-500 mt-0.5">
                      <span className="line-through text-white/30">${stdUsd("school", yearly)}</span>
                      <span className="text-green-400 ml-1">-70%</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-white/50 text-xs" style={khFont}>
                {kh ? "សម្រាប់គ្រូបង្រៀន សាលា និង NGO" : "For teachers, schools & NGOs"}
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              <button
                onClick={() => handleSelectPlan("teacher_pro")}
                className="relative w-full py-3 rounded-xl text-sm font-black transition-all bg-gradient-to-r from-amber-400 to-yellow-400 text-black hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 hover:scale-[1.02] flex items-center justify-center gap-2"
                style={khFont}
              >
                {kh ? "ជ្រើសរើស - គ្រូ" : "Get Teacher"}
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => handleSelectPlan("school")}
                className="w-full py-2.5 rounded-xl text-xs font-black transition-all border border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
                style={khFont}
              >
                {kh ? "ជ្រើសរើស - សាលា" : "Get School"}
              </button>
            </div>
            <p className="text-[10px] text-white/50 text-center mb-3 flex items-center justify-center gap-1.5" style={khFont}>
              <ShieldCheck size={12} className="text-green-400" />
              {kh ? "បោះបង់បានគ្រប់ពេល · គ្មានកិច្ចសន្យា" : "Cancel anytime · No contract"}
            </p>

            <div className="relative flex-1">
              {/* Teacher Pro benefits */}
              <p className="text-[10px] text-amber-400 uppercase tracking-widest font-black mb-2 flex items-center gap-1.5" style={khFont}>
                <Crown size={11} className="text-amber-400" />
                {kh ? "គ្រូ Pro ទទួលបាន" : "Every Teacher gets"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-2 gap-y-1.5 md:gap-y-2">
                {[
                  { en: "Unlimited live sessions", kh: "វគ្គផ្ទាល់គ្មានដែនកំណត់" },
                  { en: "All 8 question categories", kh: "ប្រភេទសំណួរទាំង ៨" },
                  { en: "Up to 50 students/session", kh: "៥០ សិស្ស/វគ្គ" },
                  { en: "Per-student analytics & reports", kh: "វិភាគ & របាយការណ៍តាមសិស្ស" },
                  { en: "Mistake tracking & weak spots", kh: "តាមដានកំហុស និងចំណុចខ្សោយ" },
                  { en: "Export CSV / PDF", kh: "នាំចេញ CSV/PDF" },
                  { en: "Advanced game modes", kh: "ហ្គេមកម្រិតខ្ពស់" },
                  { en: "Remove KWD branding", kh: "លុបស្លាក KWD" },
                  { en: "Suar AI tutor unlimited", kh: "Suar AI គ្មានដែនកំណត់" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-amber-400/20 flex items-center justify-center">
                      <Check size={9} className="text-amber-400" />
                    </span>
                    <span className="text-[11px] md:text-sm text-white/90 leading-tight truncate" style={khFont}>
                      {kh ? f.kh : f.en}
                    </span>
                  </div>
                ))}
              </div>

              {/* School adds */}
              <div className="caution-tape h-2 my-3 rounded-sm opacity-80" aria-hidden />
              <p className="text-[10px] text-amber-400 uppercase tracking-widest font-black mb-2 flex items-center gap-1.5" style={khFont}>
                <Users size={11} className="text-amber-400" />
                {kh ? "សាលា បន្ថែមលើនេះ" : "School adds on top"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-2 gap-y-1.5 md:gap-y-2">
                {[
                  { en: "10–30 teacher accounts", kh: "គណនីគ្រូ ១០–៣០" },
                  { en: "200–500 students/session", kh: "សិស្ស ២០០–៥០០/វគ្គ" },
                  { en: "Admin dashboard & roles", kh: "ផ្ទាំង Admin និងតួនាទី" },
                  { en: "School-wide leaderboards", kh: "តារាងពិន្ទុទូទាំងសាលា" },
                  { en: "Custom branding portal", kh: "ផតថលផ្ទាល់ខ្លួន" },
                  { en: "Priority support & onboarding", kh: "ជំនួយអាទិភាព និងការណែនាំ" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-amber-400/20 flex items-center justify-center">
                      <Check size={9} className="text-amber-400" />
                    </span>
                    <span className="text-[11px] md:text-sm text-white/90 leading-tight truncate" style={khFont}>
                      {kh ? f.kh : f.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier 4: Academy Plan (road-safety training schools) */}
          <div className="w-[88vw] xs:w-[80vw] md:w-auto shrink-0 snap-center bg-white/[0.03] border border-white/10 hover:border-blue-400/40 rounded-3xl p-4 xs:p-5 md:p-6 flex flex-col transition-all duration-200 group backdrop-blur-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Car size={20} className="text-blue-400" />
                <span className="text-sm font-bold text-blue-400" style={khFont}>
                  {kh ? "ផែនការសាលាបណ្តុះបណ្តាល" : "Academy Plan"}
                </span>
              </div>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-white leading-none">${planUsd("driving_school", yearly)}</span>
                <div className="flex flex-col mb-1">
                  {promo && (
                    <span className="text-sm font-black text-white/30 line-through leading-none">
                      ${stdUsd("driving_school", yearly)}
                    </span>
                  )}
                  <span className="text-white/50 text-xs leading-tight" style={khFont}>
                    {cycleSuffix}
                  </span>
                </div>
              </div>
              {promo && (
                <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-400 mt-2 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg w-fit">
                  <TrendingDown size={12} />
                  {kh ? "បញ្ចុះ ៧០%" : "Save 70%"}
                </div>
              )}

              <p className="text-white/50 text-xs mt-3" style={khFont}>
                {kh ? "សម្រាប់សាលាបណ្តុះបណ្តាលចរាចរណ៍" : "For road-safety training academies"}
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-1">
              <button
                onClick={() => handleSelectPlan("driving_school")}
                className="w-full py-3 rounded-xl text-sm font-black transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 hover:scale-[1.02]"
                style={khFont}
              >
                {kh ? "ជ្រើសរើសផែនការសាលា" : "Get Academy Plan"}
              </button>
              <a
                href="https://t.me/kesararamwithdigital"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-black transition-all border border-dashed border-white/20 text-white/50 hover:border-blue-400/50 hover:text-blue-300 flex items-center justify-center gap-1.5"
                style={khFont}
              >
                <MessageCircle size={13} />
                {kh ? "សុំចរចាតម្លៃ — សាលាធំ" : "Negotiate price — large academies"}
              </a>
            </div>
            <p className="text-[10px] text-white/30 text-center mb-5 mt-1" style={khFont}>
              {kh ? "សិស្សគ្មានដែនកំណត់" : "Unlimited learners included"}
            </p>

            <div className="flex flex-col gap-3 flex-1">
              <p className="text-xs text-blue-400/80 uppercase tracking-widest font-black" style={khFont}>
                {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
              </p>
              {[
                { en: "Full quiz bank (3,300+)", kh: "Quiz Bank ពេញ (៣,៣០០+)" },
                { en: "AI mock tests", kh: "Mock Test ដោយ AI" },
                { en: "Instructor panel", kh: "ផ្ទាំងគ្រូបង្វឹក" },
                { en: "Unlimited learners", kh: "សិស្សគ្មានដែនកំណត់" },
                { en: "Certificate issuing", kh: "ចេញវិញ្ញាបនបត្រ" },
                { en: "Progress tracking", kh: "តាមដានវឌ្ឍនភាព" },
                { en: "Priority support", kh: "ជំនួយអាទិភាព" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-blue-400/20 flex items-center justify-center mt-0.5">
                    <Check size={9} className="text-blue-400" />
                  </span>
                  <span className="text-sm text-white/85" style={khFont}>
                    {kh ? f.kh : f.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PSYCHOLOGY — Authority/trust strip */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-10 text-[11px] md:text-xs text-white/50 font-semibold">
          <span className="flex items-center gap-1.5" style={khFont}>
            <ShieldCheck size={15} className="text-green-400" />
            {kh ? "ទូទាត់សុវត្ថិភាពតាម KHQR" : "Secure KHQR payment"}
          </span>
          <span className="flex items-center gap-1.5" style={khFont}>
            <Clock size={15} className="text-amber-400" />
            {kh ? "បើកគណនីក្នុង ២៤ម៉ោង" : "Activated within 24 hours"}
          </span>
          <span className="flex items-center gap-1.5" style={khFont}>
            <Sparkles size={15} className="text-purple-400" />
            {kh ? "គាំទ្រសាលាក្នុងស្រុក" : "Funds local schools"}
          </span>
        </div>

        {/* ── Checkout & KHQR Payment Area ── */}
        <div
          id="checkout-section"
          className="max-w-4xl mx-auto border border-white/10 bg-zinc-950/80 backdrop-blur-md text-white rounded-3xl overflow-hidden shadow-2xl mb-12 scroll-mt-6"
        >
          <div className="bg-black/60 border-b border-white/10 px-4 py-4 md:px-6 md:py-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center font-black text-black text-sm rounded-lg shadow-[3px_3px_0_rgba(255,255,255,0.15)]">
                QR
              </div>
              <div>
                <h2 className="font-black text-white text-xl leading-tight" style={khFont}>
                  {kh ? "ទូទាត់ការជាវតាម KHQR" : "Secure Payment via KHQR"}
                </h2>
                <p className="text-white/50 text-xs" style={khFont}>
                  {kh ? "ផ្ទេរប្រាក់ភ្លាមៗពីធនាគារក្នុងស្រុកទាំងអស់" : "Instant activation · All Cambodian banks accepted"}
                </p>
              </div>
            </div>

            {promo && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-black px-3.5 py-1.5 rounded-full" style={khFont}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                {kh ? "ប្រូម៉ូសិនចុះថ្លៃត្រូវបានអនុវត្ត" : "Promo Discount Applied"}
              </div>
            )}
          </div>

          <div className="p-4 md:p-8 grid md:grid-cols-12 gap-6 md:gap-8">
            {/* Left: Selector & Invoice */}
            <div className="md:col-span-7 flex flex-col gap-5 md:gap-6">
              <div>
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block mb-3" style={khFont}>
                  {kh ? "១. ជ្រើសរើសផែនការជាវ" : "1. Choose Your Plan Tier"}
                </label>

                <div className="flex flex-col gap-2">
                  {([
                    { id: "family", label: kh ? "គ្រួសារ (Family Plan)" : "Family Plan" },
                    { id: "teacher_pro", label: kh ? "គ្រូ (Teacher Pro)" : "Teacher Pro" },
                    { id: "school", label: kh ? "សាលា (School Plan)" : "School Plan" },
                    { id: "driving_school", label: kh ? "សាលាបណ្តុះបណ្តាល (Academy)" : "Academy Plan" },
                  ] as { id: PlanKey; label: string }[]).map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`flex items-center justify-between p-3 md:p-4 border text-left rounded-xl transition-all ${selectedPlan === plan.id
                        ? "bg-white/10 border-white text-white font-black scale-[1.01]"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.07]"
                        }`}
                      style={khFont}
                    >
                      <span>{plan.label}</span>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? "border-amber-400" : "border-white/20"}`}>
                        {selectedPlan === plan.id && <span className="w-2 h-2 bg-amber-400 rounded-full" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoice */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col gap-2 md:gap-3">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest" style={khFont}>
                  {kh ? "សេចក្តីលម្អិតនៃការទូទាត់" : "Invoice details"}
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-white/70" style={khFont}>
                    {checkout.name}
                  </span>
                  <span className="font-bold text-white text-lg">${checkout.usd} USD</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-black text-amber-400" style={khFont}>
                    {kh ? "ប្រាក់ត្រូវទូទាត់សរុប (KHR):" : "Total to Pay (KHR):"}
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-amber-400">~ {checkout.khr.toLocaleString()} ៛</p>
                    <p className="text-[10px] text-zinc-500 font-bold">@ 1 USD = 4,100 KHR</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 md:p-4 flex items-start gap-2.5">
                <Shield size={18} className="text-amber-400 mt-0.5 shrink-0" />
                <div className="text-left">
                  <p className="text-[11px] md:text-xs font-black text-white" style={khFont}>
                    {kh ? "ការចាត់តាំងដោយ Admin ផ្អែកលើលក្ខខណ្ឌការជាវ" : "Standard Admin Assignment Based on Terms"}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-zinc-400 mt-1 leading-relaxed" style={khFont}>
                    {kh
                      ? "ការតម្លើង និងដំណើរការគណនីទាំងអស់ត្រូវបានចាត់ចែងដោយដៃដោយអភិបាលក្នុងរយៈពេល ២៤ ម៉ោងបន្ទាប់ពីផ្ញើវិក្កយបត្រ ដើម្បីធានាសុវត្ថិភាព និងភាពត្រឹមត្រូវនៃប្រព័ន្ធ។"
                      : "All upgrades are manually assigned and configured by administrators within 24 hours of payment verification based on the standard subscription terms."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: QR & Activation */}
            <div className="md:col-span-5 flex flex-col gap-5 md:gap-6">
              <div>
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block mb-3" style={khFont}>
                  {kh ? "២. ស្កែនទូទាត់ប្រាក់តាម KHQR" : "2. Scan to Pay via KHQR"}
                </label>

                <div className="bg-transparent border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <div className="relative w-full max-w-[200px] aspect-square overflow-hidden rounded-xl border border-white/5 bg-black/40 flex items-center justify-center">
                    <img src="/khqr.png" alt="KWD KHQR Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-white leading-tight">KESARARAM WITH DIGITAL</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block" style={khFont}>
                  {kh ? "៣. ផ្ញើវិក្កយបត្រដើម្បីបើកគណនី" : "3. Send Screenshot to Activate"}
                </label>

                <a
                  href="https://t.me/kesararamwithdigital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 bg-blue-600/10 border border-blue-500/30 rounded-xl hover:border-blue-400 transition-colors"
                >
                  <MessageCircle size={18} className="text-blue-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-black text-white" style={khFont}>
                      {kh ? "ផ្ញើតាម Telegram (លឿនជាង)" : "Send via Telegram (Recommended)"}
                    </p>
                    <p className="text-[10px] text-blue-300">@kesararamwithdigital</p>
                  </div>
                </a>

                <a
                  href="mailto:kesararamwithdigital@gmail.com"
                  className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 bg-purple-600/10 border border-purple-500/30 rounded-xl hover:border-purple-400 transition-colors"
                >
                  <Mail size={18} className="text-purple-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-black text-white" style={khFont}>
                      {kh ? "ផ្ញើតាម អ៊ីមែល" : "Send via Email"}
                    </p>
                    <p className="text-[10px] text-purple-300">kesararamwithdigital@gmail.com</p>
                  </div>
                </a>

                {/* Stripe card payment — beta, launching after next month (Aug 2026) */}
                <div className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-2" style={khFont}>
                    <CreditCard size={16} className="text-blue-400 shrink-0" />
                    {kh ? "ទូទាត់តាមកាត (Stripe) — សាកល្បង Beta" : "Pay by card (Stripe) — Beta"}
                  </span>
                  <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md whitespace-nowrap" style={khFont}>
                    {kh ? "សីហា ២០២៦" : "Aug 2026"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed text-center" style={khFont}>
                  {kh
                    ? "ការទូទាត់តាមកាតនឹងបើកដំណើរការក្នុងខែសីហា ២០២៦។ ឥឡូវនេះសូមប្រើ KHQR — គណនីបើកក្នុង ២៤ម៉ោងបន្ទាប់ពីបញ្ជាក់។"
                    : "Card payment opens in August 2026. For now use KHQR — accounts are verified and upgraded within 24 hours of receiving proof."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Impact / Roadmap Block ── */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-500/10 via-amber-400/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 mb-12" style={khFont}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={22} className="text-amber-400 shrink-0" />
            <h3 className="font-black text-white text-lg">
              {kh ? "អត្ថប្រយោជន៍ការជាវសេវាកម្ម និងផែនការអនាគត" : "Subscription Impact & Future Roadmap"}
            </h3>
          </div>
          <p className="text-xs text-white/70 mb-6 leading-relaxed">
            {kh
              ? "រាល់ការជាវគាំទ្រដោយផ្ទាល់ដល់សាលាបឋមសិក្សាកេសរារាម ក្នុងការផ្តល់រង្វាន់សម្ភារៈសិក្សាដល់សិស្ស ថ្លៃសេវាកម្មម៉ាស៊ីនបម្រើ និងការស្រាវជ្រាវប្រព័ន្ធអប់រំពីរភាសា ដើម្បីជួយសិស្សរៀនច្បាប់ចរាចរណ៍កាន់តែប្រសើរ។"
              : "Every active subscription directly funds local school deployments (like Kesararam Primary School), student stationery rewards, server infrastructure, and bilingual road safety education research to help students master traffic rules."}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/35 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                {kh ? "អត្ថប្រយោជន៍បច្ចុប្បន្ន" : "Active Benefits (Available Now)"}
              </h4>
              <ul className="flex flex-col gap-2 text-[11px] text-white/80 text-left">
                {[
                  { en: "Host unlimited live quiz game sessions", kh: "បើកវគ្គសកម្មភាពផ្ទាល់គ្មានដែនកំណត់" },
                  { en: "Student analytics dashboard & CSV/PDF exports", kh: "វិភាគលទ្ធផល និងទាញយករបាយការណ៍ (CSV/PDF)" },
                  { en: "Suar AI tutor — unlimited learning queries", kh: "Suar AI — ជំនួយការឆ្លាតវៃគ្មានដែនកំណត់" },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={13} className="text-green-400 shrink-0" />
                    {kh ? f.kh : f.en}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/35 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
              <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider">
                {kh ? "ផែនការអនាគតជិតមកដល់" : "Future Additions (Coming Soon)"}
              </h4>
              <ul className="flex flex-col gap-2 text-[11px] text-white/80 text-left">
                {[
                  { en: "Automated pass certificate generation for students", kh: "បង្កើតវិញ្ញាបនបត្រស្វ័យប្រវត្តសម្រាប់សិស្ស" },
                  { en: "Automated mock-test scoring & progress logs", kh: "ប្រព័ន្ធតាមដានវឌ្ឍនភាពតេស្តសាកល្បងស្វ័យប្រវត្ត" },
                  { en: "Custom quiz editor for localized teacher materials", kh: "ជម្រើសកែសម្រួលប្រភេទសំណួរផ្ទាល់ខ្លួនសម្រាប់គ្រូ" },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Zap size={13} className="text-purple-400 shrink-0" />
                    {kh ? f.kh : f.en}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Subscription Terms ── */}
        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-4 md:p-8">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none select-none">
              <h3 className="font-black text-white text-base md:text-lg" style={khFont}>
                {kh ? "លក្ខខណ្ឌនៃការជាវសេវាកម្ម" : "Subscription Terms & Conditions"}
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-black text-zinc-400 bg-white/10 px-2.5 py-1 rounded-xl shrink-0 ml-3">
                {kh ? "លម្អិត" : "Details"}
                <span className="inline-block transition-transform duration-200 group-open:rotate-180">▼</span>
              </span>
            </summary>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 mt-5 pt-5 border-t border-white/10">
              {[
                {
                  en: "Pricing Promotion: Standard Teacher Pro rate is $10/month; under promo (through end of 2026) it is 70% off at $3/month. Standard rates: Family $5/mo ($60/yr), School $20/mo ($180/yr), Academy $35/mo ($350/yr).",
                  kh: "ការផ្សព្វផ្សាយតម្លៃ៖ តម្លៃធម្មតាគ្រូ Pro គឺ ១០ដុល្លារ/ខែ។ ក្រោមប្រូម៉ូ (រហូតចុងឆ្នាំ ២០២៦) បញ្ចុះ ៧០% ($៣/ខែ)។ តម្លៃធម្មតា៖ គ្រួសារ $៥/ខែ ($៦០/ឆ្នាំ), សាលា $២០/ខែ ($១៨០/ឆ្នាំ), សាលាបណ្តុះបណ្តាល $៣៥/ខែ ($៣៥០/ឆ្នាំ)។",
                },
                {
                  en: "Annual Package (free months): Yearly plans include free months — Teacher Pro 4 months ($24/yr promo, $80/yr standard), School 3 months ($54/$180), Family ($20/$60), Academy ($110/$350).",
                  kh: "កញ្ចប់ប្រចាំឆ្នាំ៖ ការជាវប្រចាំឆ្នាំទទួលបានខែឥតគិតថ្លៃ — គ្រូ Pro ៤ខែ ($២៤ ប្រូម៉ូ / $៨០ ធម្មតា), សាលា ៣ខែ ($៥៤/$១៨០), គ្រួសារ ($២០/$៦០), សាលាបណ្តុះបណ្តាល ($១១០/$៣៥០)។",
                },
                {
                  en: "Who each plan is for: Free — students; Family — parents (up to 9 children); Teacher Pro — individual teachers; School — schools & NGOs; Academy — road-safety training academies.",
                  kh: "ផែនការសម្រាប់នរណា៖ ឥតគិតថ្លៃ — សិស្ស; គ្រួសារ — ឪពុកម្ដាយ (កូនរហូត ៩នាក់); គ្រូ Pro — គ្រូបង្រៀន; សាលា — សាលា និង NGO; សាលាបណ្តុះបណ្តាល — សាលាបណ្តុះបណ្តាលចរាចរណ៍។",
                },
                {
                  en: "Billing & Cancellation: Subscriptions are billed monthly or annually. You can cancel at any time. Active access remains until the current cycle expires.",
                  kh: "ការទូទាត់ និងការលុបចោល៖ ការជាវត្រូវបានគិតថ្លៃប្រចាំខែ ឬប្រចាំឆ្នាំ។ អ្នកអាចលុបចោលបានគ្រប់ពេល។ ការចូលប្រើនៅតែមានរហូតដល់ចប់វដ្តបច្ចុប្បន្ន។",
                },
                {
                  en: "Activation & Upgrades: Upgrades are manually assigned by administrators to ensure security and audit trails. Setup is active within 24 hours of screenshot submission.",
                  kh: "ការធ្វើឱ្យសកម្ម៖ ការតម្លើងគណនីត្រូវបានចាត់ចែងដោយដៃដោយ Admin ដើម្បីធានាសុវត្ថិភាព។ គណនីនឹងសកម្មក្នុងរយៈពេល ២៤ ម៉ោងបន្ទាប់ពីផ្ញើវិក្កយបត្រ។",
                },
                {
                  en: "Refunds: All fees are non-refundable after platform access is configured, except in cases of technical failure verified by the team.",
                  kh: "គោលការណ៍សងប្រាក់៖ រាល់ការបង់ប្រាក់មិនអាចដកវិញបានទេបន្ទាប់ពីគណនីត្រូវបានតម្លើង លើកលែងតែករណីមានបញ្ហាបច្ចេកទេសដែលបញ្ជាក់ដោយក្រុមការងារ។",
                },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-amber-400 font-black text-sm mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-xs text-white/70 leading-relaxed" style={khFont}>
                    {kh ? t.kh : t.en}
                  </p>
                </div>
              ))}
            </div>
          </details>

          <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-white/10">
            <Link href="/terms" className="text-xs font-black text-zinc-400 hover:text-white underline" style={khFont}>
              {kh ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Use"}
            </Link>
            <Link href="/privacy" className="text-xs font-black text-zinc-400 hover:text-white underline" style={khFont}>
              {kh ? "គោលការណ៍ភាពឯកជន" : "Privacy Policy"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
