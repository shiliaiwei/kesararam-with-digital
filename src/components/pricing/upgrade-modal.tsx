"use client";

import { useState, useEffect } from "react";
import { X, Check, Crown, Building2, Zap, Clock, Shield, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** Which feature triggered the modal — shown as context */
  trigger?: string;
  lang?: "en" | "kh";
}

const PLANS = [
  {
    key: "teacher_pro",
    name: "Teacher Pro",
    nameKh: "គ្រូ Pro",
    price: 10,
    icon: Crown,
    highlight: true,
    tagline: "For teachers & instructors",
    taglineKh: "សម្រាប់គ្រូ និងអ្នកបង្រៀន",
    cta: { en: "Try Free for 30 Days", kh: "សាកល្បងឥតគិតថ្លៃ ៣០ ថ្ងៃ" },
    scarcity: { en: "🔥 First month free — limited offer", kh: "🔥 ខែដំបូងឥតគិតថ្លៃ — ការផ្ដល់ជូនមានកំណត់" },
    features: [
      { en: "Unlimited live game sessions", kh: "វគ្គហ្គេមផ្ទាល់គ្មានដែនកំណត់" },
      { en: "All 8 question categories", kh: "ប្រភេទសំណួរទាំង ៨" },
      { en: "Up to 50 students per session", kh: "រហូតដល់ ៥០ សិស្ស/វគ្គ" },
      { en: "Session analytics & reports", kh: "វិភាគ និងរបាយការណ៍" },
      { en: "Advanced game modes", kh: "របៀបហ្គេមកម្រិតខ្ពស់" },
      { en: "Export results (CSV/PDF)", kh: "នាំចេញលទ្ធផល" },
    ],
  },
  {
    key: "school",
    name: "School",
    nameKh: "សាលា",
    price: 49,
    icon: Building2,
    highlight: false,
    tagline: "For driving schools",
    taglineKh: "សម្រាប់សាលាបើកបរ",
    cta: { en: "Contact Us", kh: "ទំនាក់ទំនងយើង" },
    scarcity: null,
    features: [
      { en: "Everything in Teacher Pro", kh: "អ្វីៗទាំងអស់ក្នុង Teacher Pro" },
      { en: "Up to 10 teacher accounts", kh: "រហូតដល់ ១០ គណនីគ្រូ" },
      { en: "Up to 200 students/session", kh: "រហូតដល់ ២០០ សិស្ស/វគ្គ" },
      { en: "Admin class management", kh: "ការគ្រប់គ្រងថ្នាក់" },
      { en: "Priority support", kh: "ជំនួយអាទិភាព" },
      { en: "Custom branding", kh: "ស្លាកផ្ទាល់ខ្លួន" },
    ],
  },
];

const TRIGGER_MESSAGES: Record<string, { en: string; kh: string }> = {
  session_limit: {
    en: "You've reached your free plan session limit (1/month).",
    kh: "អ្នកបានដល់ដែនកំណត់វគ្គផែនការឥតគិតថ្លៃ (១/ខែ)។",
  },
  player_limit: {
    en: "Your free plan supports up to 10 players per session.",
    kh: "ផែនការឥតគិតថ្លៃរបស់អ្នកគាំទ្ររហូតដល់ ១០ អ្នកលេង/វគ្គ។",
  },
  category_limit: {
    en: "Unlock all 8 question categories with a paid plan.",
    kh: "បើកដោះស្រាយប្រភេទសំណួរទាំង ៨ ជាមួយផែនការបង់ប្រាក់។",
  },
  analytics: {
    en: "Session analytics are available on Teacher Pro and above.",
    kh: "វិភាគវគ្គមានសម្រាប់ Teacher Pro និងខ្ពស់ជាងនេះ។",
  },
  advanced_modes: {
    en: "Advanced game modes (Marathon, Team Battle) require Teacher Pro.",
    kh: "របៀបហ្គេមកម្រិតខ្ពស់ (Marathon, Team Battle) ត្រូវការ Teacher Pro។",
  },
  export: {
    en: "Export results to CSV/PDF with Teacher Pro.",
    kh: "នាំចេញលទ្ធផលទៅ CSV/PDF ជាមួយ Teacher Pro។",
  },
};

export function UpgradeModal({ open, onClose, trigger, lang = "en" }: UpgradeModalProps) {
  const [yearly, setYearly] = useState(false);
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const triggerMsg = trigger ? TRIGGER_MESSAGES[trigger] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0d0d0d] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="p-6 pb-0">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
              <Sparkles size={11} />
              {kh ? "ធ្វើឱ្យប្រសើរឡើង" : "Upgrade"}
            </div>
            <h2 className="text-2xl font-black text-white mb-1" style={khFont}>
              {kh ? "បើកដោះស្រាយសក្ដានុពលពេញលេញ" : "Unlock Full Power"}
            </h2>
            {triggerMsg && (
              <p className="text-sm text-amber-300/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2 mt-2" style={khFont}>
                {kh ? triggerMsg.kh : triggerMsg.en}
              </p>
            )}
          </div>

          {/* Yearly toggle */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className={`text-xs ${!yearly ? "text-white" : "text-white/40"}`} style={khFont}>
              {kh ? "ប្រចាំខែ" : "Monthly"}
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${yearly ? "bg-amber-400" : "bg-white/20"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${yearly ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className={`text-xs ${yearly ? "text-white" : "text-white/40"}`} style={khFont}>
              {kh ? "ប្រចាំឆ្នាំ" : "Yearly"}
              <span className="ml-1 bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-[10px]">
                {kh ? "សន្សំ ២០%" : "Save 20%"}
              </span>
            </span>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = yearly ? Math.round(plan.price * 0.8) : plan.price;

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl p-4 flex flex-col ${
                  plan.highlight
                    ? "bg-gradient-to-b from-amber-400/10 to-transparent border-2 border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.1)]"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    {kh ? "ពេញនិយមបំផុត" : "Most Popular"}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={plan.highlight ? "text-amber-400" : "text-purple-400"} />
                  <span className="text-sm font-black text-white" style={khFont}>
                    {kh ? plan.nameKh : plan.name}
                  </span>
                </div>

                <div className="flex items-end gap-1 mb-0.5">
                  <span className="text-3xl font-black text-white">${price}</span>
                  <span className="text-white/40 text-xs mb-1" style={khFont}>
                    {kh ? "USD/ខែ" : "USD/mo"}
                  </span>
                </div>
                <p className="text-white/40 text-xs mb-3" style={khFont}>
                  {kh ? plan.taglineKh : plan.tagline}
                </p>

                {/* Scarcity */}
                {plan.scarcity && (
                  <div className="text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2.5 py-1.5 mb-3 font-semibold" style={khFont}>
                    {kh ? plan.scarcity.kh : plan.scarcity.en}
                  </div>
                )}

                {/* CTA */}
                <button
                  className={`w-full py-2.5 rounded-xl text-sm font-black transition-all mb-4 ${
                    plan.highlight
                      ? "bg-amber-400 text-black hover:bg-amber-300"
                      : "border border-white/20 text-white hover:bg-white/10"
                  }`}
                  style={khFont}
                  onClick={() => window.location.href = "/pricing"}
                >
                  {kh ? plan.cta.kh : plan.cta.en}
                </button>

                {/* Features */}
                <div className="flex flex-col gap-2">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={12} className="text-green-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-white/70" style={khFont}>
                        {kh ? f.kh : f.en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Shield size={12} />
            <span style={khFont}>{kh ? "Admin ចាត់តាំងតែប៉ុណ្ណោះ" : "Admin-assigned only — no self-checkout"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Clock size={12} />
            <span style={khFont}>{kh ? "ការផ្ដល់ជូនមានកំណត់" : "Limited offer"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
