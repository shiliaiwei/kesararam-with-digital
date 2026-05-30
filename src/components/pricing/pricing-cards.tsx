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

// ─── KHQR Banks ──────────────────────────────────────────────────────────────
const BANKS = [
  { name: "ABA Bank",      logo: "/brand/banks/aba.png",    color: "#e31837", note: "KHQR · Instant" },
  { name: "ACLEDA Bank",   logo: "/brand/banks/acleda.png", color: "#003087", note: "KHQR · Instant" },
  { name: "FTB Bank",      logo: "/brand/banks/ftb.png",    color: "#00843d", note: "KHQR · Instant" },
  { name: "Wing Bank",     logo: "/brand/banks/wing.png",   color: "#f7941d", note: "KHQR · Instant" },
  { name: "Canadia Bank",  logo: "/brand/banks/canadia.png",color: "#c8102e", note: "KHQR · Instant" },
  { name: "Chip Mong",     logo: "/brand/banks/chipmong.png",color:"#e31837", note: "KHQR · Instant" },
  { name: "Prince Bank",   logo: "/brand/banks/prince.png", color: "#6d1f7e", note: "KHQR · Instant" },
  { name: "Vattanac Bank", logo: "/brand/banks/vattanac.png",color:"#c8102e", note: "KHQR · Instant" },
];

interface PricingCardsProps {
  lang?: "en" | "kh";
}

export function PricingCards({ lang = "en" }: PricingCardsProps) {
  const [yearly, setYearly] = useState(false);
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
    } else if (planKey === "school") {
      setSelectedPlan("school_public");
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
      usd = yearly ? 45 : 5;
      labelEn = yearly ? "Teacher Pro (Annual — 3 Mos Free)" : "Teacher Pro (Monthly)";
      labelKh = yearly ? "គ្រូ Pro (ប្រចាំឆ្នាំ — ឥតគិតថ្លៃ ៣ ខែ)" : "គ្រូ Pro (ប្រចាំខែ)";
    } else if (selectedPlan === "school_public") {
      usd = yearly ? 180 : 19;
      labelEn = yearly ? "School Public (Annual — 3 Mos Free)" : "School Public (Monthly)";
      labelKh = yearly ? "សាលារដ្ឋ / វិទ្យាស្ថាន (ប្រចាំឆ្នាំ — ឥតគិតថ្លៃ ៣ ខែ)" : "សាលារដ្ឋ / វិទ្យាស្ថាន (ប្រចាំខែ)";
    } else if (selectedPlan === "school_private") {
      usd = yearly ? 225 : 24;
      labelEn = yearly ? "School Private (Annual — 3 Mos Free)" : "School Private (Monthly)";
      labelKh = yearly ? "សាលាឯកជន / វិទ្យាស្ថាន (ប្រចាំឆ្នាំ — ឥតគិតថ្លៃ ៣ ខែ)" : "សាលាឯកជន / វិទ្យាស្ថាន (ប្រចាំខែ)";
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
        <div className="max-w-xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mt-6 text-sm text-amber-300 font-semibold" style={khFont}>
          {kh 
            ? "🔥 រួសរាន់ឡើង! បញ្ចុះតម្លៃ ៥០% លើការប្រើប្រាស់គេហទំព័រស្តង់ដាររហូតដល់ដាច់ឆ្នាំ ២០២៦។ ចុះឈ្មោះឥឡូវនេះដើម្បីរក្សាតម្លៃពិសេសនេះ!" 
            : "🔥 Act now! 50% OFF standard usage on Web is active through end of 2026. Lock in this pricing now before rates adjust to standard!"}
        </div>

        {/* Yearly / Monthly toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
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
            {kh ? "ប្រចាំឆ្នាំ (ឥតគិតថ្លៃ ៣ ខែ)" : "Yearly (3 Months Free!)"}
            <span className="ml-1.5 text-xs bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full font-black">
              {kh ? "សន្សំ ២៥%" : "Save 25%"}
            </span>
          </span>
        </div>
      </div>

      {/* ── Three Pricing Cards ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        
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
                  {yearly ? "$45" : "$5"}
                </span>
                <span className="text-white/50 text-sm mb-1" style={khFont}>
                  {yearly ? (kh ? "USD/ឆ្នាំ" : "USD/year") : (kh ? "USD/ខែ" : "USD/month")}
                </span>
              </div>
              <div className="text-xs font-bold text-zinc-400 mt-1">
                {kh ? "តម្លៃធម្មតា: " : "Standard: " }
                <span className="line-through text-white/40">{yearly ? "$90" : "$10"}</span>
                <span className="text-green-400 ml-2">({kh ? "ចុះ ៥០%" : "50% Off"})</span>
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
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={20} className="text-purple-400" />
              <span className="text-sm font-bold text-purple-400" style={khFont}>
                {kh ? "សាលា & វិទ្យាស្ថាន" : "School & Institute"}
              </span>
            </div>

            {/* Price list for Public/Private schools */}
            <div className="flex flex-col gap-2.5 my-2">
              <div className="flex flex-col bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5">
                <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider mb-1" style={khFont}>
                  {kh ? "សាលារដ្ឋ & វិទ្យាស្ថាន (Public)" : "Public School & Institute"}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">${yearly ? 180 : 19}</span>
                  <span className="text-white/40 text-[10px]">{yearly ? (kh ? "USD/ឆ្នាំ" : "USD/yr") : (kh ? "USD/ខែ" : "USD/mo")}</span>
                  <span className="line-through text-white/20 text-xs ml-1.5">${yearly ? 440 : 49}</span>
                </div>
              </div>

              <div className="flex flex-col bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5">
                <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider mb-1" style={khFont}>
                  {kh ? "សាលាឯកជន (Private)" : "Private School & Institute"}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">${yearly ? 225 : 24}</span>
                  <span className="text-white/40 text-[10px]">{yearly ? (kh ? "USD/ឆ្នាំ" : "USD/yr") : (kh ? "USD/ខែ" : "USD/mo")}</span>
                  <span className="line-through text-white/20 text-xs ml-1.5">${yearly ? 440 : 49}</span>
                </div>
              </div>
            </div>

            <p className="text-white/40 text-xs mt-3" style={khFont}>
              {kh ? "សម្រាប់សាលារៀន ស្ថាប័នអប់រំ និងសាលាបើកបរ" : "For schools, educational boards & driving schools"}
            </p>
          </div>

          <button
            onClick={() => handleSelectPlan("school")}
            className="w-full py-3 rounded-xl text-sm font-black transition-all mb-8 border border-purple-400 text-purple-300 hover:bg-purple-400/10"
            style={khFont}
          >
            {kh ? "ជ្រើសរើស ផែនការសាលា" : "Select School Plan"}
          </button>

          <div className="flex flex-col gap-3 flex-1">
            <p className="text-xs text-purple-400 uppercase tracking-widest font-black" style={khFont}>
              {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
            </p>
            {[
              { en: "Everything in Teacher Pro", kh: "អ្វីៗទាំងអស់ក្នុង Teacher Pro" },
              { en: "Up to 10 teacher accounts", kh: "រហូតដល់ ១០ គណនីគ្រូ" },
              { en: "Up to 200 students per session", kh: "រហូតដល់ ២០០ សិស្ស/វគ្គ" },
              { en: "Admin class management dashboard", kh: "ផ្ទាំងគ្រប់គ្រងថ្នាក់ Admin" },
              { en: "Priority support & onboarding", kh: "ជំនួយអាទិភាព និងការណែនាំ" },
              { en: "Custom branding options", kh: "ជម្រើសសញ្ញាផ្ទាល់ខ្លួន" },
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
          
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-black px-3.5 py-1.5 rounded-full" style={khFont}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            {kh ? "បញ្ចុះតម្លៃ ៥០% រួចរាល់" : "50% Discount Applied"}
          </div>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Selector & Invoice */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div>
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block mb-2" style={khFont}>
                {kh ? "១. ជ្រើសរើសផែនការជាវ" : "1. Choose Your Plan Tier"}
              </label>
              
              <div className="flex flex-col gap-2">
                {[
                  { id: "teacher_pro", label: kh ? "គ្រូ Pro" : "Teacher Pro", color: "border-amber-400/50" },
                  { id: "school_public", label: kh ? "សាលារដ្ឋ & វិទ្យាស្ថាន" : "Public School & Institute", color: "border-purple-400/50" },
                  { id: "school_private", label: kh ? "សាលាឯកជន & វិទ្យាស្ថាន" : "Private School & Institute", color: "border-purple-400/50" }
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

            {/* Invoice box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest" style={khFont}>
                {kh ? "សេចក្តីលម្អិតនៃការទូទាត់" : "Invoice details"}
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-white/70" style={khFont}>{checkout.name}</span>
                <span className="font-bold text-white">${checkout.usd} USD</span>
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
          </div>

          {/* Right Column: KHQR instructions & banks */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div>
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider block mb-2" style={khFont}>
                {kh ? "២. ស្កែនទូទាត់តាម KHQR" : "2. Scan to Pay"}
              </label>
              
              {/* Actual KHQR image from public folder */}
              <div className="bg-white p-4 rounded-2xl border-2 border-zinc-200 flex flex-col items-center gap-3">
                <div className="relative w-full aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center">
                  <img
                    src="/khqr.jpg"
                    alt="KWD KHQR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-black text-zinc-900 leading-tight">KESARARAM WITH DIGITAL</p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">ABA Bank: 005 777 507</p>
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

        {/* Accepted banks bar */}
        <div className="bg-zinc-900 border-t border-white/5 px-6 py-5">
          <p className="text-xs text-zinc-400 font-bold mb-3 text-center" style={khFont}>
            {kh ? "គាំទ្រការទូទាត់ប្រាក់ពីធនាគារក្នុងស្រុកទាំងអស់តាម KHQR" : "Accepted Local Banks via NBC KHQR"}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BANKS.map((b) => (
              <div key={b.name} className="flex flex-col items-center justify-center p-2 bg-black/30 border border-white/5 rounded-lg text-center" style={{ borderColor: `${b.color}25` }}>
                <span className="text-[9px] font-black text-white/55 leading-none mb-1">{b.name.split(" ")[0]}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
              </div>
            ))}
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
              en: "Pricing Promotion: Standard Teacher Pro rate is $10/month. The 50% discount ($5/month) is active on Web through December 31, 2026.", 
              kh: "ការផ្សព្វផ្សាយតម្លៃ៖ តម្លៃធម្មតាសម្រាប់គ្រូ Pro គឺ ១០ ដុល្លារ/ខែ។ ការបញ្ចុះតម្លៃ ៥០% (៥ ដុល្លារ/ខែ) មានប្រសិទ្ធភាពរហូតដល់ថ្ងៃទី ៣១ ខែធ្នូ ឆ្នាំ ២០២៦។" 
            },
            { 
              en: "Annual Package (3 Months Free): Subscribers to 1-year plans receive a 3-month free discount (pay for 9 months): $45/year (Promo) or $90/year (Standard).", 
              kh: "កញ្ចប់ប្រចាំឆ្នាំ (ឥតគិតថ្លៃ ៣ ខែ)៖ ការជាវប្រចាំឆ្នាំទទួលបានការបញ្ចុះតម្លៃ ៣ ខែឥតគិតថ្លៃ៖ ៤៥ ដុល្លារ/ឆ្នាំ (តម្លៃប្រូម៉ូសិន) ឬ ៩០ ដុល្លារ/ឆ្នាំ (តម្លៃធម្មតា)។" 
            },
            { 
              en: "School & Institution Structure: Pricing covers public schools, private schools, and training institutes. Public tier is $19/mo ($180/yr), Private tier is $24/mo ($225/yr) under promo.", 
              kh: "រចនាសម្ព័ន្ធសាលា និងស្ថាប័ន៖ តម្លៃគ្របដណ្តប់ទាំងសាលារដ្ឋ សាលាឯកជន និងវិទ្យាស្ថានបណ្តុះបណ្តាល។ ផ្នែកសាលារដ្ឋគឺ ១៩ ដុល្លារ/ខែ (១៨០ ដុល្លារ/ឆ្នាំ) និងសាលាឯកជនគឺ ២៤ ដុល្លារ/ខែ (២២៥ ដុល្លារ/ឆ្នាំ)។" 
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
