"use client";

import { useState, useEffect } from "react";
import { X, Check, Crown, Building2, Shield, Sparkles, Bot, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger?: string;
  lang?: "en" | "kh";
}

const TRIGGER_MESSAGES: Record<string, { en: string; kh: string }> = {
  session_limit:  { en: "You've hit the free plan session limit (1/month).", kh: "អ្នកបានដល់ដែនកំណត់វគ្គ (១/ខែ)។" },
  player_limit:   { en: "Free plan supports up to 10 players per session.", kh: "ផែនការឥតគិតថ្លៃគាំទ្រ ១០ អ្នកលេង/វគ្គ។" },
  category_limit: { en: "Unlock all 8 question categories.", kh: "បើកប្រភេទសំណួរទាំង ៨។" },
  analytics:      { en: "Analytics available on Teacher Pro and above.", kh: "វិភាគមានសម្រាប់ Teacher Pro ។" },
  advanced_modes: { en: "Advanced game modes require Teacher Pro.", kh: "របៀបហ្គេមកម្រិតខ្ពស់ត្រូវការ Teacher Pro។" },
  export:         { en: "Export results to CSV/PDF with Teacher Pro.", kh: "នាំចេញលទ្ធផលជាមួយ Teacher Pro។" },
};

const PLANS = [
  {
    key: "teacher_pro",
    name: "Teacher Pro",
    nameKh: "គ្រូ Pro",
    icon: Crown,
    color: "#f59e0b",
    highlight: true,
    badge: { en: "Most Popular", kh: "ពេញនិយមបំផុត" },
    tagline: { en: "For teachers & instructors", kh: "សម្រាប់គ្រូ និងអ្នកបង្រៀន" },
    cta: { en: "Select Teacher Pro", kh: "ជ្រើសរើស គ្រូ Pro" },
    scarcity: { en: "🔥 50% Off Promo active!", kh: "🔥 ប្រូម៉ូសិនបញ្ចុះតម្លៃ ៥០%!" },
    features: [
      { en: "Unlimited live game sessions", kh: "វគ្គហ្គេមផ្ទាល់គ្មានដែនកំណត់", icon: Zap },
      { en: "All 8 question categories", kh: "ប្រភេទសំណួរទាំង ៨", icon: Check },
      { en: "Up to 50 students/session", kh: "រហូតដល់ ៥០ សិស្ស/វគ្គ", icon: Check },
      { en: "Session analytics & reports", kh: "វិភាគ និងរបាយការណ៍", icon: Check },
      { en: "Advanced game modes", kh: "របៀបហ្គេមកម្រិតខ្ពស់", icon: Check },
      { en: "Suar AI — unlimited queries", kh: "Suar AI — សំណួរគ្មានដែនកំណត់", icon: Bot },
      { en: "Export results (CSV/PDF)", kh: "នាំចេញលទ្ធផល (CSV/PDF)", icon: Check },
    ],
  },
  {
    key: "school_public",
    name: "School Plan",
    nameKh: "ផែនការសាលារៀន",
    icon: Building2,
    color: "#a855f7",
    highlight: false,
    badge: null,
    tagline: { en: "For primary & secondary schools", kh: "សម្រាប់សាលារៀន និងការអប់រំទូទៅ" },
    cta: { en: "Select School Plan", kh: "ជ្រើសរើស ផែនការសាលា" },
    scarcity: { en: "🔥 Promo: $19/mo (Standard: $39/mo)", kh: "🔥 តម្លៃពិសេស៖ $19/ខែ (ធម្មតា៖ $39/ខែ)" },
    features: [
      { en: "Everything in Teacher Pro", kh: "អ្វីៗទាំងអស់ក្នុង Teacher Pro", icon: Check },
      { en: "Up to 10 teacher accounts", kh: "រហូតដល់ ១០ គណនីគ្រូ", icon: Check },
      { en: "Up to 200 students/session", kh: "រហូតដល់ ២០០ សិស្ស/វគ្គ", icon: Check },
      { en: "Admin class management", kh: "ការគ្រប់គ្រងថ្នាក់", icon: Check },
      { en: "Priority support", kh: "ជំនួយអាទិភាព", icon: Check },
      { en: "Custom branding", kh: "ស្លាកផ្ទាល់ខ្លួន", icon: Check },
    ],
  },
  {
    key: "school_private",
    name: "Institute Plan",
    nameKh: "ផែនការវិទ្យាស្ថាន",
    icon: Building2,
    color: "#c084fc",
    highlight: false,
    badge: null,
    tagline: { en: "For driving schools & centers", kh: "សម្រាប់វិទ្យាស្ថាន និងសាលាបើកបរ" },
    cta: { en: "Select Institute Plan", kh: "ជ្រើសរើស ផែនការវិទ្យាស្ថាន" },
    scarcity: { en: "🔥 Promo: $24/mo (Standard: $49/mo)", kh: "🔥 តម្លៃពិសេស៖ $24/ខែ (ធម្មតា៖ $49/ខែ)" },
    features: [
      { en: "Everything in School Plan", kh: "អ្វីៗទាំងអស់ក្នុងផែនការសាលារៀន", icon: Check },
      { en: "Up to 30 teacher accounts", kh: "រហូតដល់ ៣០ គណនីគ្រូ", icon: Check },
      { en: "Up to 500 students/session", kh: "រហូតដល់ ៥០០ សិស្ស/វគ្គ", icon: Check },
      { en: "Advanced analytics & insights", kh: "ការវិភាគ និងទិន្នន័យកម្រិតខ្ពស់", icon: Check },
      { en: "Dedicated account manager", kh: "អ្នកគ្រប់គ្រងគណនីផ្ទាល់ខ្លួន", icon: Check },
      { en: "White-labeled portal options", kh: "ជម្រើសផតថលគ្មានស្លាក KWD", icon: Check },
    ],
  },
];

export function UpgradeModal({ open, onClose, trigger, lang = "en" }: UpgradeModalProps) {
  const [yearly, setYearly] = useState(false);
  const router = useRouter();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const triggerMsg = trigger ? TRIGGER_MESSAGES[trigger] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" onClick={onClose} />

      {/* Sheet — slides up on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-4xl bg-[#0c0c0c] sm:rounded-2xl rounded-t-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[95dvh] flex flex-col">

        {/* Ambient top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-amber-400/8 blur-3xl pointer-events-none" />

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 transition-colors text-white/50 hover:text-white">
          <X size={15} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="text-center px-6 pt-5 pb-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/25 text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
              <Sparkles size={10} />
              {kh ? "ធ្វើឱ្យប្រសើរឡើង" : "Upgrade"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-1" style={khFont}>
              {kh ? "បើកដោះស្រាយសក្ដានុពលពេញលេញ" : "Unlock Full Power"}
            </h2>
            <p className="text-white/40 text-sm mb-4" style={khFont}>
              {kh ? "សិស្សចូលរួមឥតគិតថ្លៃជានិច្ច" : "Students always join free — teachers unlock everything"}
            </p>

            {/* Toggle switch */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`text-xs font-semibold transition-colors ${!yearly ? "text-white" : "text-white/35"}`} style={khFont}>
                {kh ? "ប្រចាំខែ" : "Monthly"}
              </span>
              <button
                onClick={() => setYearly(v => !v)}
                role="switch"
                aria-checked={yearly}
                className={`relative w-9 h-5 rounded-full transition-all duration-300 ${yearly ? "bg-amber-400" : "bg-white/20"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${yearly ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-semibold transition-colors flex items-center gap-1.5 ${yearly ? "text-white" : "text-white/35"}`} style={khFont}>
                {kh ? "ប្រចាំឆ្នាំ" : "Yearly"}
                <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {kh ? "សន្សំរហូតដល់ ៣៣%" : "Save up to 33%"}
                </span>
              </span>
            </div>
          </div>
 
          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-4 sm:px-6 pb-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              
              // Define prices based on promo
              const getPrice = (key: string, isYearly: boolean) => {
                if (key === "teacher_pro") return isYearly ? 3.33 : 5;
                if (key === "school_public") return isYearly ? 15 : 19;
                return isYearly ? 18.75 : 24; // school_private
              };
              const getStandardPrice = (key: string, isYearly: boolean) => {
                if (key === "teacher_pro") return isYearly ? 6.67 : 10;
                if (key === "school_public") return isYearly ? 30 : 39;
                return isYearly ? 36.67 : 49; // school_private
              };

              const price = getPrice(plan.key, yearly);
              const stdPrice = getStandardPrice(plan.key, yearly);

              return (
                <div key={plan.key}
                  className={`relative rounded-2xl p-5 flex flex-col transition-all duration-200 group ${
                    plan.highlight
                      ? "bg-gradient-to-b from-amber-400/12 via-amber-400/5 to-transparent border-2 border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.12)]"
                      : "bg-white/4 border border-white/10 hover:border-white/20 hover:bg-white/6"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-lg">
                      {kh ? plan.badge.kh : plan.badge.en}
                    </div>
                  )}

                  {/* Plan name + icon */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.highlight ? "bg-amber-400/15" : "bg-white/8"}`}>
                      <Icon size={16} style={{ color: plan.color }} />
                    </div>
                    <span className="font-black text-white text-base" style={khFont}>
                      {kh ? plan.nameKh : plan.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-4xl font-black text-white leading-none">${price}</span>
                    <span className="text-white/35 text-xs mb-1" style={khFont}>{kh ? "USD/ខែ" : "USD/mo"}</span>
                    <span className="line-through text-white/20 text-xs ml-1.5 mb-1">${stdPrice}</span>
                  </div>
                  <p className="text-white/35 text-xs mb-3" style={khFont}>
                    {kh ? plan.tagline.kh : plan.tagline.en}
                  </p>

                  {/* Scarcity */}
                  {plan.scarcity && (
                    <div className="text-[11px] text-amber-300 bg-amber-400/8 border border-amber-400/20 rounded-lg px-3 py-2 mb-3 font-semibold" style={khFont}>
                      {kh ? plan.scarcity.kh : plan.scarcity.en}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => { onClose(); router.push("/pricing"); }}
                    className={`w-full py-3 rounded-xl text-sm font-black transition-all duration-200 mb-4 ${
                      plan.highlight
                        ? "bg-amber-400 text-black hover:bg-amber-300 shadow-[0_4px_20px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_28px_rgba(251,191,36,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                        : "border border-white/15 text-white hover:bg-white/8 hover:border-white/30"
                    }`}
                    style={khFont}
                  >
                    {kh ? plan.cta.kh : plan.cta.en}
                  </button>

                  {/* Features */}
                  <div className="flex flex-col gap-2">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check size={13} className="text-green-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-white/65 leading-relaxed" style={khFont}>
                          {kh ? f.kh : f.en}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 px-6 py-3 flex items-center justify-between shrink-0 bg-black/20">
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <Shield size={11} />
            <span style={khFont}>{kh ? "Admin ចាត់តាំងតែប៉ុណ្ណោះ" : "Admin-assigned only"}</span>
          </div>
          <button onClick={() => { onClose(); router.push("/pricing"); }}
            className="text-[11px] text-amber-400/70 hover:text-amber-400 transition-colors font-semibold" style={khFont}>
            {kh ? "មើលផែនការទាំងអស់ →" : "View all plans →"}
          </button>
        </div>
      </div>
    </div>
  );
}
