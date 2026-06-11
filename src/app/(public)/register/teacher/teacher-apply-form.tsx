"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/lang-context";
import {
  submitTeacherApplication,
  type SubmitResult,
} from "@/app/actions/teacher-applications";
import {
  User,
  Mail,
  Phone,
  School,
  MapPin,
  Users,
  Car,
  Crown,
  Check,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Loader2,
  CreditCard,
} from "lucide-react";

type Plan = "teacher_pro" | "school" | "driving_school";
type Cycle = "monthly" | "yearly";

const PRICES: Record<Plan, { promoM: number; promoY: number; stdM: number; stdY: number }> = {
  teacher_pro: { promoM: 3, promoY: 24, stdM: 10, stdY: 80 },
  school: { promoM: 6, promoY: 54, stdM: 20, stdY: 180 },
  driving_school: { promoM: 11, promoY: 110, stdM: 35, stdY: 350 },
};

const PLAN_META: Record<Plan, { en: string; kh: string; Icon: typeof Crown }> = {
  teacher_pro: { en: "Teacher Pro", kh: "គ្រូ Pro", Icon: Crown },
  school: { en: "School Plan", kh: "ផែនការសាលា", Icon: Users },
  driving_school: { en: "Academy Plan", kh: "ផែនការសាលាបណ្តុះបណ្តាល", Icon: Car },
};

const PLAN_ORDER: Plan[] = ["teacher_pro", "school", "driving_school"];

export function TeacherApplyForm({
  initialPlan,
  initialCycle,
}: {
  initialPlan: Plan;
  initialCycle: Cycle;
}) {
  const { lang } = useLang();
  const kh = lang === "kh";
  const t = (en: string, km: string) => (kh ? km : en);

  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [cycle, setCycle] = useState<Cycle>(initialCycle);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    schoolName: "",
    province: "",
    seats: "",
    academyName: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const price = PRICES[plan];
  const promoUsd = cycle === "yearly" ? price.promoY : price.promoM;
  const stdUsd = cycle === "yearly" ? price.stdY : price.stdM;
  const khr = (promoUsd * 4100).toLocaleString();

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls =
    "w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-bold focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all placeholder:font-semibold placeholder:text-zinc-400 bg-white text-zinc-900";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const res = await submitTeacherApplication({
      ...form,
      plan,
      billingCycle: cycle,
      seats: plan === "school" ? form.seats : null,
    });
    setResult(res);
    setSubmitting(false);
    if (res.ok) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── SUCCESS STATE ──────────────────────────────────────────────
  if (result?.ok) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="border-2 border-black rounded-xl bg-white shadow-[5px_5px_0_#000] overflow-hidden">
          <div className="caution-tape h-3" aria-hidden />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-full bg-green-500 border-2 border-black flex items-center justify-center shrink-0">
                <Check size={22} className="text-white" strokeWidth={3} />
              </span>
              <div>
                <h1 className="text-xl font-black text-zinc-900 leading-tight">
                  {t("Application received", "បានទទួលពាក្យសុំ")}
                </h1>
                <p className="text-xs font-bold text-zinc-500">
                  {t(`Reference #${result.id}`, `លេខយោង #${result.id}`)}
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-zinc-700 leading-relaxed mb-5">
              {t(
                "One more step — pay via KHQR below and send the screenshot to us on Telegram. An administrator verifies it and activates your account within 24 hours.",
                "នៅសល់ជំហានមួយ — សូមទូទាត់តាម KHQR ខាងក្រោម ហើយផ្ញើរូបថតមកយើងតាម Telegram។ អ្នកគ្រប់គ្រងនឹងផ្ទៀងផ្ទាត់ និងបើកគណនីក្នុង ២៤ម៉ោង។",
              )}
            </p>

            {/* Invoice */}
            <div className="border-2 border-black rounded-lg p-4 bg-amber-50 mb-5">
              <div className="flex items-center justify-between text-sm font-bold text-zinc-800">
                <span>
                  {kh ? PLAN_META[plan].kh : PLAN_META[plan].en} ·{" "}
                  {cycle === "yearly" ? t("Yearly", "ប្រចាំឆ្នាំ") : t("Monthly", "ប្រចាំខែ")}
                </span>
                <span className="font-black">${promoUsd} USD</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/20">
                <span className="text-sm font-black text-zinc-900">{t("Pay (KHR)", "ត្រូវបង់ (KHR)")}</span>
                <span className="text-lg font-black text-zinc-900">~ {khr} ៛</span>
              </div>
            </div>

            {/* KHQR */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-44 h-44 border-2 border-black rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-[3px_3px_0_#000]">
                <img src="/khqr.png" alt="KWD KHQR" className="w-full h-full object-contain" />
              </div>
              <p className="text-xs font-black text-zinc-900">KESARARAM WITH DIGITAL</p>
            </div>

            <a
              href="https://t.me/kesararamwithdigital"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-black rounded-lg bg-blue-500 text-white font-black text-sm shadow-[3px_3px_0_#000] hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-all"
            >
              <MessageCircle size={18} />
              {t("Send proof on Telegram", "ផ្ញើភស្តុតាងតាម Telegram")}
              <ArrowRight size={16} />
            </a>
            <p className="text-[11px] text-center font-bold text-zinc-500 mt-3">
              <CreditCard size={12} className="inline -mt-0.5 mr-1 text-blue-500" />
              {t("Card payment (Stripe) — Beta, Aug 2026", "ទូទាត់តាមកាត (Stripe) — Beta សីហា ២០២៦")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ─────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">
          {t("Apply for a Teacher plan", "ដាក់ពាក្យសុំផែនការគ្រូបង្រៀន")}
        </h1>
        <p className="text-sm font-semibold text-zinc-600 mt-2 max-w-md mx-auto">
          {t(
            "Choose your plan and tell us about your school. An admin activates your account after payment — to keep students safe.",
            "ជ្រើសរើសផែនការ និងប្រាប់យើងអំពីសាលារបស់អ្នក។ អ្នកគ្រប់គ្រងបើកគណនីបន្ទាប់ពីទូទាត់ ដើម្បីសុវត្ថិភាពសិស្ស។",
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border-2 border-black rounded-xl bg-white shadow-[5px_5px_0_#000] overflow-hidden">
        <div className="caution-tape h-3" aria-hidden />
        <div className="p-5 md:p-7 flex flex-col gap-5">
          {/* Plan picker */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 block mb-2">
              {t("1. Choose your plan", "១. ជ្រើសរើសផែនការ")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLAN_ORDER.map((p) => {
                const { Icon } = PLAN_META[p];
                const active = plan === p;
                const pm = cycle === "yearly" ? PRICES[p].promoY : PRICES[p].promoM;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPlan(p)}
                    className={`border-2 border-black rounded-lg p-2.5 text-left transition-all ${
                      active
                        ? "bg-amber-400 shadow-[3px_3px_0_#000]"
                        : "bg-white hover:bg-amber-50 shadow-[2px_2px_0_#000]"
                    }`}
                  >
                    <Icon size={18} className="text-zinc-900 mb-1" />
                    <p className="text-[11px] font-black text-zinc-900 leading-tight">
                      {kh ? PLAN_META[p].kh : PLAN_META[p].en}
                    </p>
                    <p className="text-[11px] font-bold text-zinc-700 mt-0.5">
                      ${pm}/{cycle === "yearly" ? t("yr", "ឆ្នាំ") : t("mo", "ខែ")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing cycle */}
          <div className="flex items-center gap-2">
            {(["monthly", "yearly"] as Cycle[]).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCycle(c)}
                className={`flex-1 py-2 border-2 border-black rounded-lg text-xs font-black transition-all ${
                  cycle === c ? "bg-zinc-900 text-white" : "bg-white text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {c === "monthly" ? t("Monthly", "ប្រចាំខែ") : t("Yearly · save more", "ប្រចាំឆ្នាំ · សន្សំ")}
              </button>
            ))}
          </div>

          {/* Price summary */}
          <div className="flex items-center justify-between border-2 border-black rounded-lg px-4 py-2.5 bg-amber-50">
            <span className="text-xs font-bold text-zinc-700">{t("You'll pay", "អ្នកនឹងបង់")}</span>
            <span className="text-sm font-black text-zinc-900">
              ${promoUsd}{" "}
              <span className="text-xs font-bold text-zinc-400 line-through">${stdUsd}</span>{" "}
              <span className="text-[11px] font-bold text-zinc-600">
                /{cycle === "yearly" ? t("yr", "ឆ្នាំ") : t("mo", "ខែ")}
              </span>
            </span>
          </div>

          <div className="h-px bg-zinc-200" />

          {/* Applicant fields */}
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-500 -mb-2">
            {t("2. Your details", "២. ព័ត៌មានរបស់អ្នក")}
          </label>

          <Field icon={<User size={16} />} label={t("Full name", "ឈ្មោះពេញ")}>
            <input className={inputCls} required value={form.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder={t("Sopheak Chan / ចាន់ សុភ័ក្ត្រ", "ចាន់ សុភ័ក្ត្រ")} />
          </Field>

          <Field icon={<Mail size={16} />} label={t("Email (used to sign in with Google)", "អ៊ីមែល (សម្រាប់ចូលតាម Google)")}>
            <input className={inputCls} required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="sopheak@school.edu.kh" />
          </Field>

          <Field icon={<Phone size={16} />} label={t("Phone or Telegram", "ទូរស័ព្ទ ឬ Telegram")}>
            <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="012 345 678 / @username" />
          </Field>

          <Field icon={<School size={16} />} label={t("School / organization name", "ឈ្មោះសាលា / អង្គភាព")}>
            <input className={inputCls} value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} placeholder={t("e.g. Wat Bo Primary School", "ឧ. សាលាបឋមសិក្សាវត្តបូ")} />
          </Field>

          <Field icon={<MapPin size={16} />} label={t("Province", "ខេត្ត/ក្រុង")}>
            <input className={inputCls} value={form.province} onChange={(e) => set("province", e.target.value)} placeholder={t("e.g. Siem Reap", "ឧ. សៀមរាប")} />
          </Field>

          {/* Conditional: School seats */}
          {plan === "school" && (
            <Field icon={<Users size={16} />} label={t("How many teacher seats?", "ត្រូវការគណនីគ្រូប៉ុន្មាន?")}>
              <input className={inputCls} type="number" min={1} value={form.seats} onChange={(e) => set("seats", e.target.value)} placeholder={t("e.g. 10", "ឧ. ១០")} />
            </Field>
          )}

          {/* Conditional: Academy name */}
          {plan === "driving_school" && (
            <Field icon={<Car size={16} />} label={t("Academy name", "ឈ្មោះសាលាបណ្តុះបណ្តាល")}>
              <input className={inputCls} value={form.academyName} onChange={(e) => set("academyName", e.target.value)} placeholder={t("e.g. Angkor Road Safety Academy", "ឧ. សាលាបណ្តុះបណ្តាលចរាចរណ៍")} />
            </Field>
          )}

          <Field icon={<MessageCircle size={16} />} label={t("Anything else? (optional)", "មានអ្វីបន្ថែម? (ស្រេចចិត្ត)")}>
            <textarea className={`${inputCls} min-h-[72px] resize-y`} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder={t("Tell us about your school or needs…", "ប្រាប់យើងអំពីសាលា ឬតម្រូវការ…")} />
          </Field>

          {result && !result.ok && (
            <p className="text-xs font-bold text-red-600 border-2 border-red-500 bg-red-50 rounded-lg px-3 py-2">
              {result.error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-black rounded-lg bg-amber-400 text-zinc-900 font-black text-sm shadow-[4px_4px_0_#000] hover:translate-y-0.5 hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("Submitting…", "កំពុងផ្ញើ…")}
              </>
            ) : (
              <>
                {t("Submit application", "ដាក់ពាក្យសុំ")}
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-500 text-center">
            <ShieldCheck size={13} className="text-green-600" />
            {t(
              "No account is created until an admin verifies your payment.",
              "គណនីមិនត្រូវបានបង្កើតទេ រហូតដល់អ្នកគ្រប់គ្រងផ្ទៀងផ្ទាត់ការទូទាត់។",
            )}
          </p>

          <p className="text-center text-[11px] font-bold text-zinc-400">
            {t("Looking for the Family plan?", "ស្វែងរកផែនការគ្រួសារ?")}{" "}
            <Link href="/pricing" className="text-blue-600 underline">
              {t("See all plans", "មើលផែនការទាំងអស់")}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-black text-zinc-800 block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</span>
        {children}
      </div>
    </div>
  );
}

export type { Plan, Cycle };
