"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  Check, 
  Zap, 
  Crown, 
  Building2, 
  Clock, 
  Users, 
  BarChart3, 
  Shield, 
  Sparkles,
  ArrowRight,
  Mail,
  MessageCircle,
  Phone
} from "lucide-react";



interface PricingCardsProps {
  lang?: "en" | "kh";
}

export function PricingCards({ lang = "en" }: PricingCardsProps) {
  const [yearly, setYearly] = useState(false);
  const promo = true;
  const [selectedPlan, setSelectedPlan] = useState<"teacher_pro" | "school_public" | "school_private">("teacher_pro");
  
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  // Scroll smoothly to checkout
  const handleSelectPlan = (planKey: string) => {
    if (planKey === "free") {
      window.location.href = "/login";
      return;
    }
    if (planKey === "teacher_pro") {
      setSelectedPlan("teacher_pro");
    } else if (planKey === "school" || planKey === "school_public") {
      setSelectedPlan("school_public");
    } else if (planKey === "institute" || planKey === "school_private") {
      setSelectedPlan("school_private");
    }

    setTimeout(() => {
      const el = document.getElementById("checkout-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Get current active price & currency details
  const getCheckoutDetails = () => {
    const rate = 4100; // Exchange rate 1 USD = 4100 KHR
    let usd = 0;
    let labelEn = "";
    let labelKh = "";

    if (selectedPlan === "teacher_pro") {
      usd = promo ? (yearly ? 40 : 5) : (yearly ? 80 : 10);
      labelEn = yearly 
        ? `Teacher Pro (Annual — ${promo ? "Promo 50% Off / " : ""}4 Mos Free)` 
        : `Teacher Pro (Monthly${promo ? " — Promo 50% Off" : ""})`;
      labelKh = yearly 
        ? `គ្រូ Pro (ប្រចាំឆ្នាំ — ${promo ? "ប្រូម៉ូសិនចុះថ្លៃ ៥០% / " : ""}ឥតគិតថ្លៃ ៤ ខែ)` 
        : `គ្រូ Pro (ប្រចាំខែ${promo ? " — ប្រូម៉ូសិនចុះថ្លៃ ៥០%" : ""})`;
    } else if (selectedPlan === "school_public") {
      usd = promo ? (yearly ? 180 : 19) : (yearly ? 360 : 39);
      labelEn = yearly 
        ? `School Plan (Annual — ${promo ? "Promo / " : ""}3 Mos Free)` 
        : `School Plan (Monthly${promo ? " — Promo" : ""})`;
      labelKh = yearly 
        ? `ផែនការសាលារៀន (ប្រចាំឆ្នាំ — ${promo ? "ប្រូម៉ូសិន / " : ""}ឥតគិតថ្លៃ ៣ ខែ)` 
        : `ផែនការសាលារៀន (ប្រចាំខែ${promo ? " — ប្រូម៉ូសិន" : ""})`;
    } else if (selectedPlan === "school_private") {
      usd = promo ? (yearly ? 225 : 24) : (yearly ? 440 : 49);
      labelEn = yearly 
        ? `Institute Plan (Annual — ${promo ? "Promo / " : ""}3 Mos Free)` 
        : `Institute Plan (Monthly${promo ? " — Promo" : ""})`;
      labelKh = yearly 
        ? `ផែនការវិទ្យាស្ថាន (ប្រចាំឆ្នាំ — ${promo ? "ប្រូម៉ូសិន / " : ""}ឥតគិតថ្លៃ ៣ ខែ)` 
        : `ផែនការវិទ្យាស្ថាន (ប្រចាំខែ${promo ? " — ប្រូម៉ូសិន" : ""})`;
    }

    return {
      usd,
      khr: usd * rate,
      name: kh ? labelKh : labelEn
    };
  };

  const checkout = getCheckoutDetails();

  return (
    <section className="min-h-screen bg-[#0d0d0d] text-white py-16 px-4">
      {/* ── Header & Scarcity Promo ── */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black px-4 py-2 rounded-full mb-6 uppercase tracking-widest animate-pulse">
          <Clock size={14} className="shrink-0" />
          {kh ? "ការផ្ដល់ជូនរហូតដល់ចុងឆ្នាំ ២០២៦ 🔥 បញ្ចុះតម្លៃ ៥០%" : "LIMITED OFFER THROUGH END OF 2026 🔥 50% OFF"}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight" style={khFont}>
          {kh ? "ជ្រើសរើសផែនការរបស់អ្នក" : "Choose Your Plan"}
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-4" style={khFont}>
          {kh
            ? "សិស្សលេងឥតគិតថ្លៃជានិច្ច។ គ្រូបង្រៀន និងសាលាបើកបរទទួលបានឧបករណ៍គ្រប់គ្រងកម្រិតខ្ពស់។"
            : "Students always play free. Teachers & driving schools get advanced coaching tools."}
        </p>

        {/* Urgency Alert Block */}
        {promo && (
          <div className="max-w-xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mt-6 text-sm text-amber-300 font-semibold" style={khFont}>
            {kh 
              ? "🔥 រួសរាន់ឡើង! បញ្ចុះតម្លៃ ៥០% លើការប្រើប្រាស់គេហទំព័រស្តង់ដាររហូតដល់ដាច់ឆ្នាំ ២០២៦។ ចុះឈ្មោះឥឡូវនេះដើម្បីរក្សាតម្លៃពិសេសនេះ!" 
              : "🔥 Act now! 50% OFF standard usage on Web is active through end of 2026. Lock in this pricing now before rates adjust to standard!"}
          </div>
        )}

        {/* Switch for Billing Cycle */}
        <div className="flex items-center justify-center gap-3 mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-sm mx-auto">
          <span className={`text-sm font-bold transition-colors ${!yearly ? "text-white" : "text-white/40"}`} style={khFont}>
            {kh ? "ប្រចាំខែ" : "Monthly"}
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            role="switch"
            aria-checked={yearly}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${yearly ? "bg-amber-400" : "bg-white/20"}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${yearly ? "translate-x-7" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${yearly ? "text-white" : "text-white/40"}`} style={khFont}>
            {kh ? "ប្រចាំឆ្នាំ" : "Yearly"}
            <span className="ml-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-black">
              {kh ? "ឥតគិតថ្លៃ ៣-៤ ខែ" : "3-4 Mos Free"}
            </span>
          </span>
        </div>
      </div>

      {/* ── Three Pricing Cards Grid ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        
        {/* Tier 1: Free */}
        <div className="bg-white/5 border border-white/10 hover:border-white/25 rounded-2xl p-6 flex flex-col transition-all duration-200 group">
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
            className="w-full py-3 rounded-xl text-sm font-black transition-all mb-8 border border-white/20 text-white hover:bg-white/10"
            style={khFont}
          >
            {kh ? "ចាប់ផ្ដើមឥតគិតថ្លៃ" : "Get Started Free"}
          </button>

          <div className="flex flex-col gap-3 flex-1">
            <p className="text-xs text-white/30 uppercase tracking-widest font-black" style={khFont}>
              {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
            </p>
            {[
              { en: "Join live games as student", kh: "ចូលរួមហ្គេមផ្ទាល់ជាសិស្ស" },
              { en: "Browse 1 question category", kh: "មើលប្រភេទសំណួរ ១" },
              { en: "10 practice questions/day", kh: "១០ សំណួរអនុវត្ត/ថ្ងៃ" },
              { en: "No account required to play", kh: "មិនត្រូវការគណនីដើម្បីលេង" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/80" style={khFont}>{f.kh}</span>
              </div>
            ))}

            <div className="border-t border-white/10 my-2" />
            {[
              { en: "Host live sessions", kh: "រៀបចំវគ្គផ្ទាល់" },
              { en: "Analytics & reports", kh: "វិភាគ និងរបាយការណ៍" },
              { en: "All question categories", kh: "ប្រភេទសំណួរទាំងអស់" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2 opacity-35">
                <span className="text-sm mt-0.5 shrink-0">🔒</span>
                <span className="text-sm text-white/50 line-through" style={khFont}>{f.kh}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2: Teacher Pro (Highlighted) */}
        <div className="relative bg-gradient-to-b from-amber-400/15 via-amber-400/5 to-transparent border-2 border-amber-400/70 shadow-[0_0_40px_rgba(251,191,36,0.18)] hover:shadow-[0_0_60px_rgba(251,191,36,0.28)] rounded-2xl p-6 flex flex-col transition-all duration-200 group">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
            {kh ? "ពេញនិយម" : "Most Popular"}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={20} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-400" style={khFont}>
                {kh ? "គ្រូ Pro" : "Teacher Pro"}
              </span>
            </div>
            
            {/* Price section showing standard and promo */}
            <div className="flex flex-col mb-2">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">
                  {promo ? (yearly ? "$40" : "$5") : (yearly ? "$80" : "$10")}
                </span>
                <span className="text-white/50 text-sm mb-1" style={khFont}>
                  {yearly ? (kh ? "USD/ឆ្នាំ" : "USD/year") : (kh ? "USD/ខែ" : "USD/month")}
                </span>
              </div>
              <div className="text-xs font-bold text-zinc-400 mt-1">
                {promo ? (
                  <>
                    {kh ? "តម្លៃធម្មតា: " : "Standard: " }
                    <span className="line-through text-white/40">{yearly ? "$80" : "$10"}</span>
                    <span className="text-green-400 ml-2">({kh ? "ចុះ ៥០%" : "50% Off"})</span>
                  </>
                ) : (
                  <span className="text-zinc-500">{kh ? "តម្លៃស្តង់ដារពេញ" : "Full Standard Rate"}</span>
                )}
              </div>
            </div>

            <p className="text-white/50 text-xs mt-2" style={khFont}>
              {kh ? "សម្រាប់គ្រូបង្រៀន និងអ្នកបង្វឹកឯកជន" : "For teachers & driving instructors"}
            </p>
          </div>

          <button
            onClick={() => handleSelectPlan("teacher_pro")}
            className="w-full py-3 rounded-xl text-sm font-black transition-all mb-8 bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-400/20"
            style={khFont}
          >
            {kh ? "ជ្រើសរើស គ្រូ Pro" : "Select Teacher Pro"}
          </button>

          <div className="flex flex-col gap-3 flex-1">
            <p className="text-xs text-amber-400 uppercase tracking-widest font-black" style={khFont}>
              {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
            </p>
            {[
              { en: "Unlimited live game sessions", kh: "វគ្គហ្គេមផ្ទាល់គ្មានដែនកំណត់" },
              { en: "All 8 question categories", kh: "ប្រភេទសំណួរទាំង ៨" },
              { en: "Up to 50 students per session", kh: "រហូតដល់ ៥០ សិស្ស/វគ្គ" },
              { en: "Session analytics & reports", kh: "វិភាគ និងរបាយការណ៍វគ្គ" },
              { en: "Export results (CSV/PDF)", kh: "នាំចេញលទ្ធផល (CSV/PDF)" },
              { en: "Advanced game modes", kh: "របៀបហ្គេមកម្រិតខ្ពស់" },
              { en: "Remove KWD branding", kh: "លុបស្លាក KWD" },
              { en: "Suar AI — unlimited queries", kh: "Suar AI — សំណួរគ្មានដែនកំណត់" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/80" style={khFont}>{f.kh}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: School & Institute */}
        <div className="bg-white/5 border border-white/10 hover:border-white/25 rounded-2xl p-6 flex flex-col transition-all duration-200 group">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={20} className="text-purple-400" />
              <span className="text-sm font-bold text-purple-400" style={khFont}>
                {kh ? "សាលារៀន & វិទ្យាស្ថាន" : "School & Institute"}
              </span>
            </div>

            {/* Split Price Display */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4 mb-4">
              {/* School Option */}
              <div className="border-r border-white/10 pr-3">
                <p className="text-[10px] font-black text-purple-300/80 uppercase tracking-wider mb-1" style={khFont}>
                  {kh ? "ផែនការសាលារៀន" : "School Plan"}
                </p>
                <div className="flex items-end gap-0.5">
                  <span className="text-2xl font-black text-white">
                    {yearly ? "$180" : "$19"}
                  </span>
                  <span className="text-white/50 text-[9px] mb-0.5" style={khFont}>
                    {yearly ? (kh ? "USD/ឆ្នាំ" : "USD/yr") : (kh ? "USD/ខែ" : "USD/mo")}
                  </span>
                </div>
                <div className="text-[9px] font-bold text-zinc-500 mt-0.5">
                  <span className="line-through text-white/30">{yearly ? "$360" : "$39"}</span>
                  <span className="text-green-400 ml-1">(-50%)</span>
                </div>
              </div>

              {/* Institute Option */}
              <div className="pl-1">
                <p className="text-[10px] font-black text-purple-300/80 uppercase tracking-wider mb-1" style={khFont}>
                  {kh ? "ផែនការវិទ្យាស្ថាន" : "Institute Plan"}
                </p>
                <div className="flex items-end gap-0.5">
                  <span className="text-2xl font-black text-white">
                    {yearly ? "$225" : "$24"}
                  </span>
                  <span className="text-white/50 text-[9px] mb-0.5" style={khFont}>
                    {yearly ? (kh ? "USD/ឆ្នាំ" : "USD/yr") : (kh ? "USD/ខែ" : "USD/mo")}
                  </span>
                </div>
                <div className="text-[9px] font-bold text-zinc-500 mt-0.5">
                  <span className="line-through text-white/30">{yearly ? "$440" : "$49"}</span>
                  <span className="text-green-400 ml-1">(-50%)</span>
                </div>
              </div>
            </div>

            <p className="text-white/50 text-xs" style={khFont}>
              {kh ? "សម្រាប់សាលារៀន និងវិទ្យាស្ថានបណ្តុះបណ្តាលបើកបរ" : "For schools & driving education centers"}
            </p>
          </div>

          {/* Action buttons stacked */}
          <div className="flex flex-col gap-2 mb-6">
            <button
              onClick={() => handleSelectPlan("school_public")}
              className="w-full py-2.5 rounded-xl text-xs font-black transition-all bg-purple-600 text-white hover:bg-purple-550 shadow-md shadow-purple-600/10"
              style={khFont}
            >
              {kh ? "ជ្រើសរើស ផែនការសាលា" : "Select School Plan"}
            </button>
            <button
              onClick={() => handleSelectPlan("school_private")}
              className="w-full py-2.5 rounded-xl text-xs font-black transition-all border border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
              style={khFont}
            >
              {kh ? "ជ្រើសរើស ផែនការវិទ្យាស្ថាន" : "Select Institute Plan"}
            </button>
          </div>

          {/* Combined Features */}
          <div className="flex flex-col gap-3 flex-1">
            <p className="text-xs text-purple-400 uppercase tracking-widest font-black" style={khFont}>
              {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
            </p>
            {[
              { en: "Everything in Teacher Pro", kh: "អ្វីៗទាំងអស់ក្នុង Teacher Pro" },
              { en: "10 to 30 teacher accounts", kh: "ពី ១០ ទៅ ៣០ គណនីគ្រូ" },
              { en: "200 to 500 students per session", kh: "ពី ២០០ ទៅ ៥០០ សិស្ស/វគ្គ" },
              { en: "Admin class management dashboard", kh: "ផ្ទាំងគ្រប់គ្រងថ្នាក់ Admin" },
              { en: "Priority support & onboarding", kh: "ជំនួយអាទិភាព និងការណែនាំ" },
              { en: "White-labeled portal & custom branding", kh: "ជម្រើសផតថល និងសញ្ញាផ្ទាល់ខ្លួន" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check size={14} className="text-purple-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/80" style={khFont}>{f.kh}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Checkout & KHQR Payment Area (Target of scroll) ── */}
      <div id="checkout-section" className="max-w-4xl mx-auto border-2 border-black bg-zinc-950 text-white rounded-2xl overflow-hidden shadow-2xl mb-16 scroll-mt-6">
        
        {/* Checkout Header */}
        <div className="bg-black border-b-2 border-white/10 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center font-black text-black text-sm rounded-lg shadow-[3px_3px_0_rgba(255,255,255,0.15)]">QR</div>
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

        <div className="p-6 md:p-8 grid md:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Selector & Invoice */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div>
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block mb-3" style={khFont}>
                {kh ? "១. ជ្រើសរើសផែនការជាវ" : "1. Choose Your Plan Tier"}
              </label>
              
              <div className="flex flex-col gap-2">
                {[
                  { id: "teacher_pro", label: kh ? "គ្រូ Pro (Teacher Pro)" : "Teacher Pro", color: "border-amber-400/50" },
                  { id: "school_public", label: kh ? "សាលារៀន (School Plan)" : "School Plan", color: "border-purple-400/50" },
                  { id: "school_private", label: kh ? "វិទ្យាស្ថាន (Institute Plan)" : "Institute Plan", color: "border-purple-400/50" }
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id as any)}
                    className={`flex items-center justify-between p-4 border text-left rounded-xl transition-all ${
                      selectedPlan === plan.id 
                        ? "bg-white/10 border-white text-white font-black scale-[1.01]" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/7"
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

            {/* Dynamic Invoice details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest" style={khFont}>
                {kh ? "សេចក្តីលម្អិតនៃការទូទាត់" : "Invoice details"}
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-white/70" style={khFont}>{checkout.name}</span>
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

            {/* Standard Admin Assignment note based on Terms */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
              <Shield size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-black text-white" style={khFont}>
                  {kh ? "ការចាត់តាំងដោយ Admin ផ្អែកលើលក្ខខណ្ឌការជាវ" : "Standard Admin Assignment Based on Terms"}
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed" style={khFont}>
                  {kh 
                    ? "ការតម្លើង និងដំណើរការគណនីទាំងអស់ត្រូវបានចាត់ចែងដោយដៃដោយអភិបាលក្នុងរយៈពេល ២៤ ម៉ោងបន្ទាប់ពីផ្ញើវិក្កយបត្រ ដើម្បីធានាសុវត្ថិភាព និងភាពត្រឹមត្រូវនៃប្រព័ន្ធ។" 
                    : "All upgrades are manually assigned and configured by administrators within 24 hours of payment verification based on the standard subscription terms."}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: QR Code & Activation (No white background!) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div>
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block mb-3" style={khFont}>
                {kh ? "២. ស្កែនទូទាត់ប្រាក់តាម KHQR" : "2. Scan to Pay via KHQR"}
              </label>
              
              {/* KHQR image container - background removed */}
              <div className="bg-transparent border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3">
                <div className="relative w-full aspect-square overflow-hidden rounded-xl border border-white/5 bg-black/40 flex items-center justify-center">
                  <img
                    src="/khqr.png"
                    alt="KWD KHQR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-black text-white leading-tight">KESARARAM WITH DIGITAL</p>
                </div>
              </div>
            </div>

            {/* Verification Telegram / Email block & Stripe notice */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block" style={khFont}>
                {kh ? "៣. ផ្ញើវិក្កយបត្រដើម្បីបើកគណនី" : "3. Send Screenshot to Activate"}
              </label>
              
              <a 
                href="https://t.me/kesararamwithdigital" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 border border-blue-500/30 rounded-xl hover:border-blue-400 transition-colors"
              >
                <MessageCircle size={18} className="text-blue-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-black text-white" style={khFont}>{kh ? "ផ្ញើតាម Telegram (លឿនជាង)" : "Send via Telegram (Recommended)"}</p>
                  <p className="text-[10px] text-blue-300">@kesararamwithdigital</p>
                </div>
              </a>

              <a 
                href="mailto:kesararamwithdigital@gmail.com" 
                className="flex items-center gap-3 px-4 py-3 bg-purple-600/10 border border-purple-500/30 rounded-xl hover:border-purple-400 transition-colors"
              >
                <Mail size={18} className="text-purple-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-black text-white" style={khFont}>{kh ? "ផ្ញើតាម អ៊ីមែល" : "Send via Email"}</p>
                  <p className="text-[10px] text-purple-300">kesararamwithdigital@gmail.com</p>
                </div>
              </a>

              <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
                <span className="text-zinc-400 font-bold flex items-center gap-1.5" style={khFont}>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {kh ? "ទូទាត់តាមកាតអន្តរជាតិ (Stripe)" : "Stripe Credit Card Payments"}
                </span>
                <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md" style={khFont}>
                  {kh ? "ជិតមកដល់ហើយ" : "Coming Soon"}
                </span>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed text-center" style={khFont}>
                {kh 
                  ? "គណនីនឹងត្រូវបានដំណើរការក្នុងរយៈពេល ២៤ ម៉ោងបន្ទាប់ពីទទួលបានការបញ្ជាក់។" 
                  : "Accounts are verified and upgraded within 24 hours of receiving proof."}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ── Present & Future Benefits / Impact Block ── */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-500/10 via-amber-400/5 to-transparent border border-white/10 rounded-2xl p-6 md:p-8 mb-12" style={khFont}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={22} className="text-amber-400 shrink-0" />
          <h3 className="font-black text-white text-lg">
            {kh ? "អត្ថប្រយោជន៍ការជាវសេវាកម្ម និងផែនការអនាគត" : "Subscription Impact & Future Roadmap"}
          </h3>
        </div>
        <p className="text-xs text-white/70 mb-6 leading-relaxed">
          {kh 
            ? "រាល់ការជាវគាំទ្រដោយផ្ទាល់ដល់សាលាបឋមសិក្សាកេសរារាម ក្នុងការផ្តល់រង្វាន់សម្ភារៈសិក្សាដល់សិស្ស ថ្លៃសេវាកម្មម៉ាស៊ីនបម្រើ និងការស្រាវជ្រាវប្រព័ន្ធអប់រំពីរភាសា ដើម្បីជួយសិស្សរៀនច្បាប់ចរាចរណ៍កាន់តែប្រសើរ។" 
            : "Every active subscription directly funds local school deployments (like Kesararam Primary School), student stationery rewards, server infrastructure, and bilingual road safety education research to help students master driving rules."}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Present Value */}
          <div className="bg-black/35 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
              {kh ? "អត្ថប្រយោជន៍បច្ចុប្បន្ន (Present Benefits)" : "Active Benefits (Available Now)"}
            </h4>
            <ul className="flex flex-col gap-2 text-[11px] text-white/80 text-left">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {kh ? "បើកវគ្គហ្គេមផ្ទាល់ និងគ្រប់គ្រងសិស្សគ្មានដែនកំណត់" : "Host unlimited live quiz game sessions"}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {kh ? "វិភាគលទ្ធផល និងទាញយករបាយការណ៍ (CSV/PDF)" : "Student analytics dashboard & CSV/PDF exports"}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {kh ? "Suar AI — ជំនួយការឆ្លាតវៃគ្មានដែនកំណត់" : "Suar AI tutor — unlimited learning queries"}
              </li>
            </ul>
          </div>

          {/* Future Value */}
          <div className="bg-black/35 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
            <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider">
              {kh ? "ផែនការអនាគតជិតមកដល់ (Future Roadmap)" : "Future Additions (Coming Soon)"}
            </h4>
            <ul className="flex flex-col gap-2 text-[11px] text-white/80 text-left">
              <li className="flex items-center gap-2">
                <span className="text-purple-400">⚡</span>
                {kh ? "បង្កើតវិញ្ញាបនបត្រឆ្លងកាត់ការសិក្សាផ្លូវការសម្រាប់សិស្ស" : "Automated pass certificate generation for students"}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">⚡</span>
                {kh ? "ប្រព័ន្ធតាមដានវឌ្ឍនភាពការប្រឡងសាកល្បងស្វ័យប្រវត្ត" : "Automated mock-exam scoring & progress logs"}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">⚡</span>
                {kh ? "ជម្រើសកែសម្រួលប្រភេទសំណួរផ្ទាល់ខ្លួនសម្រាប់គ្រូ" : "Custom quiz editor for localized teacher materials"}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Subscription Terms Detailed Block ── */}
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <h3 className="font-black text-white text-lg mb-4" style={khFont}>
          {kh ? "លក្ខខណ្ឌនៃការជាវសេវាកម្ម" : "Subscription Terms & Conditions"}
        </h3>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {[
            { 
              en: "Pricing Promotion: Standard Teacher Pro rate is $10/month. Under promo (active through end of 2026), rates are discounted by 50% ($5/month). Standard rates for School are $39/mo ($360/yr) and Institute is $49/mo ($440/yr).", 
              kh: "ការផ្សព្វផ្សាយតម្លៃ៖ តម្លៃធម្មតាសម្រាប់គ្រូ Pro គឺ ១០ ដុល្លារ/ខែ។ ក្រោមការបញ្ចុះតម្លៃប្រូម៉ូសិន (មានប្រសិទ្ធភាពរហូតដល់ចុងឆ្នាំ ២០២៦) តម្លៃត្រូវបានបញ្ចុះ ៥០% (៥ ដុល្លារ/ខែ)។ តម្លៃធម្មតាសម្រាប់សាលារៀនគឺ ៣៩ ដុល្លារ/ខែ (៣៦០ ដុល្លារ/ឆ្នាំ) និងវិទ្យាស្ថានគឺ ៤៩ ដុល្លារ/ខែ (៤៤០ ដុល្លារ/ឆ្នាំ)។" 
            },
            { 
              en: "Annual Package (4 Months Free for Teacher Pro): Subscribers to 1-year plans receive 4 months free for Teacher Pro ($40/year promo, $80/year standard) and 3 months free for School plans ($180/year promo, $360/year standard) and Institute plans ($225/year promo, $440/year standard).", 
              kh: "កញ្ចប់ប្រចាំឆ្នាំ៖ ការជាវប្រចាំឆ្នាំទទួលបានការបញ្ចុះតម្លៃ ៤ ខែឥតគិតថ្លៃសម្រាប់គ្រូ Pro (៤០ ដុល្លារ/ឆ្នាំ ប្រូម៉ូសិន, ៨០ ដុល្លារ/ឆ្នាំ ធម្មតា) និង ៣ ខែឥតគិតថ្លៃសម្រាប់សាលារៀន (១៨០ ដុល្លារ/ឆ្នាំ ប្រូម៉ូសិន, ៣៦០ ដុល្លារ/ឆ្នាំ ធម្មតា) និងវិទ្យាស្ថាន (២២៥ ដុល្លារ/ឆ្នាំ ប្រូម៉ូសិន, ៤៤០ ដុល្លារ/ឆ្នាំ ធម្មតា)។" 
            },
            { 
              en: "School & Institute Structure: Pricing covers schools and training institutes. Under promo, School plan is $19/mo ($180/yr) and Institute plan is $24/mo ($225/yr).", 
              kh: "រចនាសម្ព័ន្ធសាលារៀន និងវិទ្យាស្ថាន៖ តម្លៃគ្របដណ្តប់ទាំងសាលារៀន និងវិទ្យាស្ថានបណ្តុះបណ្តាល។ ក្រោមតម្លៃប្រូម៉ូសិន ផែនការសាលារៀនគឺ ១៩ ដុល្លារ/ខែ (១៨០ ដុល្លារ/ឆ្នាំ) និងផែនការវិទ្យាស្ថានគឺ ២៤ ដុល្លារ/ខែ (២២៥ ដុល្លារ/ឆ្នាំ)។" 
            },
            { 
              en: "Billing & Cancellation: Subscriptions are billed monthly or annually. You can cancel at any time. Active access remains until the current cycle expires.", 
              kh: "ការទូទាត់ និងការលុបចោល៖ ការជាវត្រូវបានគិតថ្លៃប្រចាំខែ ឬប្រចាំឆ្នាំ។ អ្នកអាចលុបចោលបានគ្រប់ពេល។ ការចូលប្រើប្រាស់នៅតែមានរហូតដល់ចប់វដ្តបច្ចុប្បន្ន។" 
            },
            { 
              en: "Activation & Upgrades: Upgrades are manually assigned by administrators to ensure security and audit trails. Setup is active within 24 hours of screenshot submission.", 
              kh: "ការធ្វើឱ្យសកម្ម៖ ការតម្លើងគណនីត្រូវបានចាត់ចែងដោយដៃដោយ Admin ដើម្បីធានាសុវត្ថិភាព។ គណនីនឹងសកម្មក្នុងរយៈពេល ២៤ ម៉ោងបន្ទាប់ពីផ្ញើវិក្កយបត្រ។" 
            },
            { 
              en: "Refunds: All fees are non-refundable after platform access is configured, except in cases of technical failure verified by the team.", 
              kh: "គោលការណ៍សងប្រាក់៖ រាល់ការបង់ប្រាក់មិនអាចដកវិញបានទេបន្ទាប់ពីគណនីត្រូវបានតម្លើង លើកលែងតែករណីមានបញ្ហាបច្ចេកទេសដែលបញ្ជាក់ដោយក្រុមការងារ។" 
            },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
              <span className="text-amber-400 font-black text-sm mt-0.5 shrink-0">{i + 1}.</span>
              <p className="text-xs text-white/70 leading-relaxed" style={khFont}>{kh ? t.kh : t.en}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-white/5">
          <Link href="/terms" className="text-xs font-black text-zinc-400 hover:text-white underline" style={khFont}>
            {kh ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Service"}
          </Link>
          <Link href="/privacy" className="text-xs font-black text-zinc-400 hover:text-white underline" style={khFont}>
            {kh ? "គោលការណ៍ភាពឯកជន" : "Privacy Policy"}
          </Link>
        </div>
      </div>
    </section>
  );
}
