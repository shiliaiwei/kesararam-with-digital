"use client";

import { useState } from "react";
import { Check, Zap, Crown, Building2, Clock, Users, BarChart3, Shield } from "lucide-react";
import { PLAN_DISPLAY } from "@/lib/subscription-plans";

const PLANS = [
  {
    key: "free",
    ...PLAN_DISPLAY.free,
    tagline: "For students & curious learners",
    taglineKh: "សម្រាប់សិស្ស និងអ្នករៀន",
    icon: Zap,
    features: [
      { en: "Join live games as student", kh: "ចូលរួមហ្គេមផ្ទាល់ជាសិស្ស" },
      { en: "Browse 1 question category", kh: "មើលប្រភេទសំណួរ ១" },
      { en: "10 practice questions/day", kh: "១០ សំណួរអនុវត្ត/ថ្ងៃ" },
      { en: "No account required to play", kh: "មិនត្រូវការគណនីដើម្បីលេង" },
    ],
    locked: [
      { en: "Host live sessions", kh: "រៀបចំវគ្គផ្ទាល់" },
      { en: "Analytics & reports", kh: "វិភាគ និងរបាយការណ៍" },
      { en: "All question categories", kh: "ប្រភេទសំណួរទាំងអស់" },
    ],
    cta: { en: "Get Started Free", kh: "ចាប់ផ្ដើមឥតគិតថ្លៃ" },
    ctaStyle: "border border-white/20 text-white hover:bg-white/10",
    highlight: false,
    scarcity: null,
  },
  {
    key: "teacher_pro",
    ...PLAN_DISPLAY.teacher_pro,
    tagline: "For teachers & instructors",
    taglineKh: "សម្រាប់គ្រូ និងអ្នកបង្រៀន",
    icon: Crown,
    features: [
      { en: "Unlimited live game sessions", kh: "វគ្គហ្គេមផ្ទាល់គ្មានដែនកំណត់" },
      { en: "All 8 question categories", kh: "ប្រភេទសំណួរទាំង ៨" },
      { en: "Up to 50 students per session", kh: "រហូតដល់ ៥០ សិស្ស/វគ្គ" },
      { en: "Session analytics & reports", kh: "វិភាគ និងរបាយការណ៍វគ្គ" },
      { en: "Export results (CSV/PDF)", kh: "នាំចេញលទ្ធផល (CSV/PDF)" },
      { en: "Advanced game modes", kh: "របៀបហ្គេមកម្រិតខ្ពស់" },
      { en: "Remove KWD branding", kh: "លុបស្លាក KWD" },
    ],
    locked: [],
    cta: { en: "Try Free for 30 Days", kh: "សាកល្បងឥតគិតថ្លៃ ៣០ ថ្ងៃ" },
    ctaStyle: "bg-amber-400 text-black font-black hover:bg-amber-300",
    highlight: true,
    scarcity: {
      en: "🔥 Limited offer — first month free. Admin-granted only.",
      kh: "🔥 ការផ្ដល់ជូនមានកំណត់ — ខែដំបូងឥតគិតថ្លៃ។",
    },
  },
  {
    key: "school",
    ...PLAN_DISPLAY.school,
    tagline: "For driving schools & institutions",
    taglineKh: "សម្រាប់សាលាបើកបរ និងស្ថាប័ន",
    icon: Building2,
    features: [
      { en: "Everything in Teacher Pro", kh: "អ្វីៗទាំងអស់ក្នុង Teacher Pro" },
      { en: "Up to 10 teacher accounts", kh: "រហូតដល់ ១០ គណនីគ្រូ" },
      { en: "Up to 200 students per session", kh: "រហូតដល់ ២០០ សិស្ស/វគ្គ" },
      { en: "Admin class management", kh: "ការគ្រប់គ្រងថ្នាក់ Admin" },
      { en: "Priority support", kh: "ជំនួយអាទិភាព" },
      { en: "Custom branding options", kh: "ជម្រើសសញ្ញាផ្ទាល់ខ្លួន" },
    ],
    locked: [],
    cta: { en: "Contact Us", kh: "ទំនាក់ទំនងយើង" },
    ctaStyle: "border border-purple-400 text-purple-300 hover:bg-purple-400/10",
    highlight: false,
    scarcity: null,
  },
];

interface PricingCardsProps {
  lang?: "en" | "kh";
}

export function PricingCards({ lang = "en" }: PricingCardsProps) {
  const [yearly, setYearly] = useState(false);
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="min-h-screen bg-[#0d0d0d] text-white py-20 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
          <Clock size={12} />
          {kh ? "ការផ្ដល់ជូនពេលវេលាកំណត់" : "Limited Time Offer"}
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3" style={khFont}>
          {kh ? "ជ្រើសរើសផែនការរបស់អ្នក" : "Choose Your Plan"}
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto" style={khFont}>
          {kh
            ? "សិស្សចូលរួមឥតគិតថ្លៃជានិច្ច។ គ្រូទទួលបានឧបករណ៍ដ៏មានឥទ្ធិពល។"
            : "Students always join free. Teachers get powerful tools."}
        </p>

        {/* Yearly toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm ${!yearly ? "text-white" : "text-white/40"}`} style={khFont}>
            {kh ? "ប្រចាំខែ" : "Monthly"}
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? "bg-amber-400" : "bg-white/20"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${yearly ? "translate-x-7" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm ${yearly ? "text-white" : "text-white/40"}`} style={khFont}>
            {kh ? "ប្រចាំឆ្នាំ" : "Yearly"}
            <span className="ml-1.5 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
              {kh ? "សន្សំ ២០%" : "Save 20%"}
            </span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = yearly && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price;

          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl p-6 flex flex-col transition-transform hover:-translate-y-1 ${
                plan.highlight
                  ? "bg-gradient-to-b from-amber-400/10 to-amber-900/5 border-2 border-amber-400/60 shadow-[0_0_40px_rgba(251,191,36,0.15)]"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={18} style={{ color: plan.color }} />
                  <span className="text-sm font-bold text-white/60" style={khFont}>
                    {kh ? (plan as any).nameKh ?? plan.name : plan.name}
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black">
                    {price === 0 ? "$0" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-white/40 text-sm mb-1.5" style={khFont}>
                      {kh ? "USD/ខែ" : "USD/month"}
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs" style={khFont}>
                  {kh ? plan.taglineKh : plan.tagline}
                </p>
              </div>

              {/* Scarcity banner */}
              {plan.scarcity && (
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2 mb-4 text-xs text-amber-300 font-semibold" style={khFont}>
                  {kh ? plan.scarcity.kh : plan.scarcity.en}
                </div>
              )}

              {/* CTA */}
              <button className={`w-full py-3 rounded-xl text-sm font-black transition-all mb-6 ${plan.ctaStyle}`} style={khFont}>
                {kh ? plan.cta.kh : plan.cta.en}
              </button>

              {/* Features */}
              <div className="flex flex-col gap-2.5 flex-1">
                <p className="text-xs text-white/30 uppercase tracking-widest font-bold" style={khFont}>
                  {kh ? "អ្វីដែលរួមបញ្ចូល" : "What's included"}
                </p>
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-white/80" style={khFont}>
                      {kh ? f.kh : f.en}
                    </span>
                  </div>
                ))}
                {plan.locked.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-1" />
                    {plan.locked.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 opacity-35">
                        <span className="text-sm mt-0.5 shrink-0">🔒</span>
                        <span className="text-sm text-white/50 line-through" style={khFont}>
                          {kh ? f.kh : f.en}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust signals */}
      <div className="max-w-3xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {[
          { icon: Shield, en: "Admin-assigned only", kh: "Admin ចាត់តាំងតែប៉ុណ្ណោះ", sub: { en: "No self-upgrade exploits", kh: "គ្មានការបន្លំ" } },
          { icon: Users, en: "Students always free", kh: "សិស្សឥតគិតថ្លៃជានិច្ច", sub: { en: "Viral growth engine", kh: "ម៉ាស៊ីនកំណើន" } },
          { icon: BarChart3, en: "Full audit trail", kh: "កំណត់ត្រាពេញលេញ", sub: { en: "Every change logged", kh: "ការផ្លាស់ប្ដូរទាំងអស់ត្រូវបានកត់ត្រា" } },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Icon size={20} className="mx-auto mb-2 text-white/40" />
              <p className="text-sm font-bold text-white" style={khFont}>{kh ? item.kh : item.en}</p>
              <p className="text-xs text-white/40 mt-0.5" style={khFont}>{kh ? item.sub.kh : item.sub.en}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
