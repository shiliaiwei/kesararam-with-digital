"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/lang-context";
import { Check, Building2, Crown, Phone, Mail, MessageCircle } from "lucide-react";

// ── KH QR Banks ──────────────────────────────────────────────────────────────
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

const PLANS = [
  {
    key: "teacher_pro",
    nameEn: "Teacher Pro",
    nameKh: "គ្រូ Pro",
    priceUSD: 10,
    priceKHR: 41000,
    period: { en: "/ month", kh: "/ ខែ" },
    color: "#eab308",
    icon: Crown,
    tagEn: "Most Popular",
    tagKh: "ពេញនិយម",
    featuresEn: [
      "Unlimited live game sessions",
      "All 8 question categories",
      "Up to 50 students per session",
      "Session analytics & reports",
      "Export results (CSV / PDF)",
      "Advanced game modes",
      "Suar AI — unlimited queries",
    ],
    featuresKh: [
      "វគ្គហ្គេមផ្ទាល់គ្មានដែនកំណត់",
      "ប្រភេទសំណួរទាំង ៨",
      "រហូតដល់ ៥០ សិស្ស/វគ្គ",
      "វិភាគ និងរបាយការណ៍វគ្គ",
      "នាំចេញលទ្ធផល (CSV / PDF)",
      "របៀបហ្គេមកម្រិតខ្ពស់",
      "Suar AI — សំណួរគ្មានដែនកំណត់",
    ],
  },
  {
    key: "school",
    nameEn: "School / Institution",
    nameKh: "សាលា / ស្ថាប័ន",
    priceUSD: null,
    priceKHR: null,
    period: { en: "negotiable", kh: "អាចចរចា" },
    color: "#a855f7",
    icon: Building2,
    tagEn: "Custom Pricing",
    tagKh: "តម្លៃតាមការចរចា",
    featuresEn: [
      "Everything in Teacher Pro",
      "Up to 10 teacher accounts",
      "Up to 200 students per session",
      "Admin class management dashboard",
      "Priority support & onboarding",
      "Custom branding options",
      "Bulk pricing for driving schools",
      "Dedicated account manager",
    ],
    featuresKh: [
      "អ្វីៗទាំងអស់ក្នុង Teacher Pro",
      "រហូតដល់ ១០ គណនីគ្រូ",
      "រហូតដល់ ២០០ សិស្ស/វគ្គ",
      "ផ្ទាំងគ្រប់គ្រងថ្នាក់ Admin",
      "ជំនួយអាទិភាព និងការណែនាំ",
      "ជម្រើសសញ្ញាផ្ទាល់ខ្លួន",
      "តម្លៃពិសេសសម្រាប់សាលាបើកបរ",
      "អ្នកគ្រប់គ្រងគណនីឧទ្ទិស",
    ],
  },
];

export default function SubscribePage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b-4 border-black"
        style={{ background: "linear-gradient(135deg,#09090b 0%,#18181b 100%)" }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-4 border-2 border-yellow-400">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
            {kh ? "ការជាវ" : "Subscribe"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3" style={kf}>
            {kh ? "ជ្រើសរើសផែនការ" : "Choose Your Plan"}
          </h1>
          <p className="text-white/50 text-base max-w-xl mx-auto" style={kf}>
            {kh
              ? "ទូទាត់ដោយ KHQR — ABA, ACLEDA, FTB និងធនាគារក្នុងស្រុកទាំងអស់ — ឬចរចាតម្លៃពិសេសសម្រាប់ស្ថាប័ន"
              : "Pay via KHQR — ABA, ACLEDA, FTB and all local banks — or negotiate custom pricing for your institution."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-14">

        {/* ── Plans ── */}
        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.key} className="flex flex-col border-2 border-black overflow-hidden"
                style={{ boxShadow: `6px 6px 0 ${plan.color}` }}>
                {/* Header */}
                <div className="px-6 py-5 border-b-2 border-black" style={{ backgroundColor: plan.color }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon size={20} className="text-black" />
                      <span className="font-black text-black text-lg" style={kf}>
                        {kh ? plan.nameKh : plan.nameEn}
                      </span>
                    </div>
                    <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 uppercase tracking-widest" style={kf}>
                      {kh ? plan.tagKh : plan.tagEn}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 mt-2">
                    {plan.priceUSD ? (
                      <>
                        <span className="text-3xl font-black text-black">${plan.priceUSD}</span>
                        <span className="text-black/60 text-sm mb-0.5" style={kf}>{kh ? plan.period.kh : plan.period.en}</span>
                        <span className="text-black/50 text-xs mb-0.5 ml-1" style={kf}>
                          (~{plan.priceKHR?.toLocaleString()} ៛)
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-black" style={kf}>
                        {kh ? "ទំនាក់ទំនងសម្រាប់តម្លៃ" : "Contact for pricing"}
                      </span>
                    )}
                  </div>
                </div>
                {/* Features */}
                <div className="flex flex-col gap-2.5 p-6 bg-white flex-1">
                  {(kh ? plan.featuresKh : plan.featuresEn).map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span className="text-sm text-zinc-700" style={kf}>{f}</span>
                    </div>
                  ))}
                </div>
                {/* CTA */}
                <div className="px-6 pb-6 bg-white">
                  {plan.priceUSD ? (
                    <Link href="/login"
                      className="w-full flex items-center justify-center py-3 font-black text-sm border-2 border-black transition-all hover:-translate-y-0.5"
                      style={{ backgroundColor: plan.color, color: "#000", boxShadow: "3px 3px 0 #000", ...kf }}>
                      {kh ? "ចាប់ផ្ដើម — ទូទាត់ KHQR →" : "Get Started — Pay via KHQR →"}
                    </Link>
                  ) : (
                    <a href="mailto:kesararamwithdigital@gmail.com"
                      className="w-full flex items-center justify-center py-3 font-black text-sm border-2 border-black transition-all hover:-translate-y-0.5"
                      style={{ backgroundColor: plan.color, color: "#fff", boxShadow: "3px 3px 0 #000", ...kf }}>
                      {kh ? "ទំនាក់ទំនងចរចា →" : "Contact to Negotiate →"}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── KHQR Payment Section ── */}
        <div className="border-2 border-black" style={{ boxShadow: "6px 6px 0 #000" }}>
          <div className="bg-black px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 border-2 border-yellow-400 flex items-center justify-center font-black text-black text-xs">QR</div>
            <div>
              <h2 className="font-black text-white text-lg" style={kf}>
                {kh ? "ទូទាត់ដោយ KHQR" : "Pay with KHQR"}
              </h2>
              <p className="text-white/50 text-xs" style={kf}>
                {kh ? "ធនាគារក្នុងស្រុកទាំងអស់ — ភ្លាមៗ — ជាប្រាក់ USD ឬ KHR" : "All local banks · Instant · USD or KHR"}
              </p>
            </div>
          </div>
          <div className="p-6 bg-white">
            <p className="text-sm text-zinc-600 mb-5 leading-relaxed" style={kf}>
              {kh
                ? "KWD ទទួលយកការទូទាត់តាម KHQR ពីធនាគារ និងស្ថាប័នហិរញ្ញវត្ថុក្នុងស្រុកទាំងអស់ដែលចូលរួមក្នុងប្រព័ន្ធ KHQR របស់ NBC។ បន្ទាប់ពីការទូទាត់ ការចូលប្រើប្រាស់ត្រូវបានបើកដំណើរការក្នុងរយៈពេល ២៤ ម៉ោង។"
                : "KWD accepts KHQR payments from all local banks and financial institutions participating in the NBC KHQR system. After payment, access is activated within 24 hours."}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BANKS.map((bank) => (
                <div key={bank.name}
                  className="flex flex-col items-center gap-2 p-3 border-2 border-black text-center"
                  style={{ boxShadow: `3px 3px 0 ${bank.color}` }}>
                  <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-black text-white text-[10px]"
                    style={{ backgroundColor: bank.color }}>
                    {bank.name.slice(0, 3).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-black leading-tight">{bank.name}</span>
                  <span className="text-[9px] text-zinc-400 font-bold">{bank.note}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-4 text-center" style={kf}>
              {kh
                ? "ធនាគារ និងស្ថាប័នហិរញ្ញវត្ថុផ្សេងទៀតដែលចូលរួមក្នុង KHQR ក៏ត្រូវបានទទួលយកផងដែរ"
                : "All other banks and financial institutions participating in KHQR are also accepted"}
            </p>
          </div>
        </div>

        {/* ── School / Institution Negotiation ── */}
        <div className="border-2 border-black bg-zinc-950 text-white" style={{ boxShadow: "6px 6px 0 #a855f7" }}>
          <div className="px-6 py-5 border-b-2 border-white/10">
            <div className="inline-block bg-purple-500 text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 mb-2" style={kf}>
              {kh ? "ស្ថាប័ន / សាលាបើកបរ" : "Institution / Driving School"}
            </div>
            <h2 className="text-xl font-black" style={kf}>
              {kh ? "ចរចាតម្លៃពិសេសសម្រាប់ស្ថាប័ន" : "Custom Pricing for Institutions"}
            </h2>
            <p className="text-white/50 text-sm mt-1" style={kf}>
              {kh
                ? "យើងផ្ដល់ជូនតម្លៃពិសេសសម្រាប់សាលាបើកបរ ស្ថាប័នអប់រំ និងអង្គការក្នុងកម្ពុជា"
                : "We offer special pricing for driving schools, educational institutions, and organizations in Cambodia."}
            </p>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="font-black text-yellow-400 text-sm uppercase tracking-widest" style={kf}>
                {kh ? "អ្វីដែលអ្នកទទួលបាន" : "What you get"}
              </h3>
              {[
                { en: "Volume discount for 5+ teacher accounts", kh: "បញ្ចុះតម្លៃសម្រាប់ ៥+ គណនីគ្រូ" },
                { en: "Dedicated onboarding & training session", kh: "វគ្គណែនាំ និងបណ្ដុះបណ្ដាលឧទ្ទិស" },
                { en: "Custom branding with your school logo", kh: "ស្លាកផ្ទាល់ខ្លួនជាមួយនឹងស្លាកសាលា" },
                { en: "Priority support via Telegram / phone", kh: "ជំនួយអាទិភាពតាម Telegram / ទូរស័ព្ទ" },
                { en: "Flexible payment — monthly or annual", kh: "ការទូទាត់បត់បែន — ប្រចាំខែ ឬប្រចាំឆ្នាំ" },
                { en: "KHQR or bank transfer accepted", kh: "ទទួលយក KHQR ឬការផ្ទេរប្រាក់ធនាគារ" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={13} className="text-purple-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/80" style={kf}>{kh ? f.kh : f.en}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-black text-yellow-400 text-sm uppercase tracking-widest" style={kf}>
                {kh ? "ទំនាក់ទំនងយើង" : "Contact us"}
              </h3>
              <div className="flex flex-col gap-3">
                <a href="mailto:kesararamwithdigital@gmail.com"
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 hover:border-purple-400 transition-colors">
                  <Mail size={16} className="text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white" style={kf}>{kh ? "អ៊ីមែល" : "Email"}</p>
                    <p className="text-xs text-white/50">kesararamwithdigital@gmail.com</p>
                  </div>
                </a>
                <a href="https://t.me/kesararamwithdigital" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 hover:border-blue-400 transition-colors">
                  <MessageCircle size={16} className="text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white" style={kf}>{kh ? "Telegram" : "Telegram"}</p>
                    <p className="text-xs text-white/50">@kesararamwithdigital</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10">
                  <Phone size={16} className="text-green-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white" style={kf}>{kh ? "ទូរស័ព្ទ" : "Phone"}</p>
                    <p className="text-xs text-white/50">{kh ? "ទំនាក់ទំនងតាមអ៊ីមែលដើម្បីទទួលលេខ" : "Contact via email for number"}</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed" style={kf}>
                {kh
                  ? "យើងឆ្លើយតបក្នុងរយៈពេល ២៤ ម៉ោង។ ការចរចាតម្លៃអាចធ្វើបានជាភាសាខ្មែរ ឬអង់គ្លេស។"
                  : "We respond within 24 hours. Price negotiation available in Khmer or English."}
              </p>
            </div>
          </div>
        </div>

        {/* ── Terms summary ── */}
        <div className="border-2 border-black p-6 bg-zinc-50">
          <h3 className="font-black text-black text-base mb-4" style={kf}>
            {kh ? "លក្ខខណ្ឌការជាវ" : "Subscription Terms"}
          </h3>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
            {[
              { en: "Subscriptions are monthly or annual — cancel anytime.", kh: "ការជាវប្រចាំខែ ឬប្រចាំឆ្នាំ — អាចបោះបង់បានគ្រប់ពេល។" },
              { en: "Payment via KHQR (all NBC-participating banks) or USD bank transfer.", kh: "ទូទាត់តាម KHQR (ធនាគារទាំងអស់ក្នុង NBC) ឬការផ្ទេរប្រាក់ USD។" },
              { en: "Access activated within 24 hours of confirmed payment.", kh: "ការចូលប្រើប្រាស់ត្រូវបានបើកក្នុង ២៤ ម៉ោងបន្ទាប់ពីការទូទាត់ត្រូវបានបញ្ជាក់។" },
              { en: "No refunds after access is granted, except in cases of technical failure.", kh: "គ្មានការសងប្រាក់វិញបន្ទាប់ពីការចូលប្រើប្រាស់ត្រូវបានផ្ដល់ លើកលែងតែករណីបច្ចេកទេស។" },
              { en: "School plans are negotiated directly — pricing varies by size.", kh: "ផែនការសាលាត្រូវបានចរចាដោយផ្ទាល់ — តម្លៃប្រែប្រួលតាមទំហំ។" },
              { en: "KWD reserves the right to update pricing with 30 days notice.", kh: "KWD រក្សាសិទ្ធិក្នុងការធ្វើបច្ចុប្បន្នភាពតម្លៃជាមួយការជូនដំណឹង ៣០ ថ្ងៃ។" },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-zinc-200 last:border-0">
                <span className="text-yellow-500 font-black text-xs mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-xs text-zinc-600 leading-relaxed" style={kf}>{kh ? t.kh : t.en}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/terms" className="text-xs font-black text-zinc-500 hover:text-black underline" style={kf}>
              {kh ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Service"}
            </Link>
            <Link href="/privacy" className="text-xs font-black text-zinc-500 hover:text-black underline" style={kf}>
              {kh ? "គោលការណ៍ភាពឯកជន" : "Privacy Policy"}
            </Link>
            <Link href="/pricing" className="text-xs font-black text-zinc-500 hover:text-black underline" style={kf}>
              {kh ? "ផែនការទាំងអស់" : "All Plans"}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
