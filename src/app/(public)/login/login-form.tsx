"use client";

import { Suspense, useState, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { useLang } from "@/context/lang-context";
import { SignShape, CautionTape } from "@/components/brand/brand-kit";
import {
  User,
  Lock,
  Check,
  X,
  ShieldAlert,
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Milestone,
  ShieldCheck,
  School
} from "lucide-react";

const initialState = { error: "", redirectTo: "" };

function GuideMeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang } = useLang();
  const kh = lang === "kh";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white border-[3px] border-black w-full max-w-lg shadow-[6px_6px_0_#000] p-6 space-y-4 text-left rounded-[15px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-[#eab308] size-6 shrink-0" />
            <h2 className="text-lg font-black uppercase text-black font-system">
              {kh ? "ណែនាំខ្ញុំ" : "Guide Me"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border-2 border-black bg-white hover:bg-[#ef4444] hover:text-white flex items-center justify-center font-black text-lg text-black transition-colors rounded-md shadow-[2px_2px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-sm font-system">
          {/* For Students */}
          <div className="border-2 border-black p-4 bg-blue-50 rounded-lg text-zinc-800">
            <h3 className="font-black text-blue-900 uppercase flex items-center gap-1.5 border-b border-blue-200 pb-1 mb-2 text-xs">
              <School className="size-4 shrink-0" />
              {kh ? "សម្រាប់សិស្ស" : "For Students"}
            </h3>
            <p className="font-bold leading-relaxed">
              {kh ? "របៀបបង្កើតគណនីសិស្ស៖" : "To create a student account:"}
            </p>
            <ol className="list-decimal pl-4 mt-1.5 space-y-1.5 font-semibold text-zinc-700">
              <li>
                {kh 
                  ? "ទៅកាន់ទំព័រចុះឈ្មោះ រួចបំពេញ ឈ្មោះសាលារៀន, ខេត្ត/ក្រុង, ថ្នាក់ទី។" 
                  : "Go to registration, fill in your details (School, Province, Grade)."}
              </li>
              <li>
                {kh 
                  ? "បញ្ចូល «លេខកូដអញ្ជើញពីគ្រូ» ដែលគ្រូបានផ្តល់ជូន (កូដនីមួយៗប្រើបានតែម្តងប៉ុណ្ណោះ)។" 
                  : "Input the Teacher Invite Code provided by your teacher (each code is single-use)."}
              </li>
              <li>
                {kh 
                  ? "ចុចលើប៊ូតុង «Register with Google» ដើម្បីភ្ជាប់គណនីរួចជាស្រេច។" 
                  : "Click Register with Google to link and activate your account instantly."}
              </li>
            </ol>
          </div>

          {/* For Teachers */}
          <div className="border-2 border-black p-4 bg-green-50 rounded-lg text-zinc-800">
            <h3 className="font-black text-green-900 uppercase flex items-center gap-1.5 border-b border-green-200 pb-1 mb-2 text-xs">
              <User className="size-4 shrink-0" />
              {kh ? "សម្រាប់គ្រូបង្រៀន" : "For Teachers"}
            </h3>
            <p className="font-bold leading-relaxed">
              {kh ? "គណនីគ្រូបង្រៀន៖" : "Teacher Accounts Gating:"}
            </p>
            <p className="text-zinc-700 font-semibold leading-relaxed mt-1">
              {kh
                ? "ដើម្បីការពារឯកជនភាពសិស្ស និងសុវត្ថិភាព គណនីគ្រូបង្រៀនមិនអាចចុះឈ្មោះជាសាធារណៈបានទេ៖ គណនីគ្រូទាំងអស់ត្រូវតែបង្កើតឡើងដោយផ្ទាល់ពីសំណាក់ «អ្នកគ្រប់គ្រងប្រព័ន្ធសាលា (School Administrator)»។"
                : "To protect student privacy and ensure a safe learning environment, teacher accounts cannot be registered publicly. All teacher accounts must be created exclusively by the School Administrator."}
            </p>
            <p className="text-zinc-800 font-bold leading-relaxed mt-1.5 bg-green-100/60 p-2.5 border border-green-200 rounded">
              {kh
                ? "* បន្ទាប់ពីអ្នកគ្រប់គ្រងប្រព័ន្ធចុះឈ្មោះអ៊ីមែលរបស់អ្នករួចរាល់ អ្នកអាចចូលគណនីបានភ្លាមៗតាមរយៈ Sign In with Google។"
                : "* Once the Administrator registers your school email in the Admin Dashboard, you can sign in instantly using Sign In with Google."}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-[#eab308] border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all text-black rounded-lg font-system"
        >
          {kh ? "យល់ព្រម" : "Got It"}
        </button>
      </div>
    </div>
  );
}

function LoginFormInner() {
  const [attempts, setAttempts] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? "";
  const errorParam = searchParams.get("error") ?? "";

  const displayError = state?.error || errorParam;
  const { lang } = useLang();
  const kh = lang === "kh";

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state?.redirectTo]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl animate-fade-in">
        {/* Split pane for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Brand kit showcase */}
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 bg-[#0f1015] border-[3px] border-black rounded-[15px] shadow-[6px_6px_0_#000] relative overflow-hidden text-white">
            <div className="absolute inset-0 hero-dot-bg opacity-35 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* Header area */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#eab308] rounded-lg border-2 border-black inline-flex">
                    <img src="/brand/logo.webp" alt="KWD Logo" className="h-7 w-auto object-contain" />
                  </div>
                  <span className="font-google-sans text-lg font-bold tracking-tight text-white">
                    KESARARAM WITH DIGITAL
                  </span>
                </div>
                
                {/* Large sign representation */}
                <div className="flex justify-center my-8">
                  <SignShape shape="diamond" body="#eab308" size={120}>
                    <div className="p-1 border-[3px] border-black rounded-full bg-white animate-sparkle-float">
                      <img src="/brand/logo.webp" alt="KWD Logo" className="h-10 w-auto object-contain" />
                    </div>
                  </SignShape>
                </div>
                
                <div className="space-y-3 mt-4 text-center">
                  <h2 className="text-xl font-black font-google-sans tracking-tight text-[#ffd700] uppercase leading-snug">
                    {kh ? "រៀនរហ័សអំពីសុវត្ថិភាពចរាចរណ៍" : "Flash Learning for Road Safety"}
                  </h2>
                  <p className="text-xs text-zinc-400 font-bold max-w-xs mx-auto leading-relaxed font-system">
                    {kh
                      ? "ចូលរៀនទ្រឹស្ដីច្បាប់ចរាចរណ៍កម្ពុជា ហ្វឹកហាត់សំណួរចម្លើយ និងចូលរួមប្រកួតប្រជែងផ្ទាល់ ដើម្បីបើកបរដោយទំនុកចិត្ត។"
                      : "Explore driving theory, practice mock exams, and join real-time dashboard challenges to drive safely."}
                  </p>
                </div>
              </div>

              {/* Bullet list area */}
              <div className="space-y-3.5 my-8">
                {[
                  {
                    icon: BookOpen,
                    titleEn: "8 Subject Areas",
                    titleKh: "៨ ប្រភេទប្រធានបទមេរៀន",
                    descEn: "Bilingual lessons, definitions, and official road signs.",
                    descKh: "មេរៀន សេចក្តីពន្យល់ និងសញ្ញាចរាចរណ៍ផ្លូវការទ្វិភាសា។",
                    color: "text-blue-400"
                  },
                  {
                    icon: Milestone,
                    titleEn: "Bilingual Platform",
                    titleKh: "ប្រព័ន្ធសិក្សាទ្វិភាសា (EN / KH)",
                    descEn: "Switch layout and learning contents instantly.",
                    descKh: "ផ្លាស់ប្តូរភាសានិងរបៀបសិក្សាភ្លាមៗនៅគ្រប់ទំព័រ។",
                    color: "text-green-400"
                  },
                  {
                    icon: ShieldCheck,
                    titleEn: "Interactive Classrooms",
                    titleKh: "ថ្នាក់រៀនឌីជីថលអន្តរកម្ម",
                    descEn: "Join live class games with teachers and unlock milestones.",
                    descKh: "លេងល្បែងតេស្តចម្លើយផ្ទាល់ជាមួយគ្រូនិងសន្សំពិន្ទុរង្វាន់។",
                    color: "text-yellow-400"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-3.5 items-start p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-[#ffd700]/30 transition-all duration-200">
                    <div className="p-2 bg-zinc-800 rounded-lg shrink-0">
                      <item.icon className={`size-4.5 ${item.color}`} />
                    </div>
                    <div className="space-y-0.5 text-left font-system">
                      <h4 className="text-xs font-black text-zinc-200 uppercase tracking-wide">
                        {kh ? item.titleKh : item.titleEn}
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-normal font-bold">
                        {kh ? item.descKh : item.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer tape */}
              <div className="mt-auto pt-4 border-t border-zinc-800">
                <CautionTape variant="chevron" height={16} className="opacity-80 rounded-md" />
                <p className="text-[9px] text-zinc-500 font-bold text-center mt-2.5 uppercase tracking-widest">
                  Technovation Girls Siem Reap · 2026
                </p>
              </div>
            </div>
          </div>
          
          {/* Right panel: Login form */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Header logo visible only on mobile */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="p-1 bg-[#eab308] rounded-lg border-2 border-black inline-flex">
                <img src="/brand/logo.webp" alt="KWD Logo" className="h-6 w-auto object-contain" />
              </div>
              <span className="font-google-sans text-lg font-bold tracking-tight text-black">
                KESARARAM WITH DIGITAL
              </span>
            </div>

            <div className="bg-white border-[3px] border-black rounded-[15px] shadow-[6px_6px_0_#000] overflow-hidden">
              {/* Header card */}
              <div className="bg-[#eab308] text-black border-b-[3px] border-black px-6 py-5 flex items-center justify-between">
                <div>
                  <Link
                    href="/home"
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black/70 hover:text-black transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    {kh ? "ត្រឡប់ទៅទំព័រដើម" : "Back to home"}
                  </Link>
                  <h1 className="text-2xl font-black mt-1 font-system">
                    {kh ? "ចូលគណនី" : "Log In"}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="nb-btn bg-white hover:bg-zinc-50 text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                >
                  <HelpCircle className="size-3.5" />
                  {kh ? "ណែនាំខ្ញុំ" : "Guide Me"}
                </button>
              </div>

              {/* Form Card Body */}
              <form action={formAction} className="p-6 lg:p-8 flex flex-col gap-5 bg-white" autoComplete="off">
                <input type="hidden" name="redirect" value={redirectParam} />
                
                {/* Email or Username */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-black font-system flex items-center gap-1.5">
                    <User className="size-3.5 text-zinc-500" />
                    {kh ? "អ៊ីមែល ឬ ឈ្មោះគណនី" : "Email or Username"}
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    required
                    autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all font-system"
                    placeholder={kh ? "បញ្ចូលអ៊ីមែល ឬ ឈ្មោះគណនីរបស់អ្នក" : "your@email.com or username"}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-black font-system flex items-center gap-1.5">
                    <Lock className="size-3.5 text-zinc-500" />
                    {kh ? "លេខសម្ងាត់" : "Password"}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all font-system"
                    placeholder="••••••••"
                  />
                </div>

                {/* Error Display */}
                {displayError && (
                  <div className="p-4 bg-[#fda4af] border-2 border-red-500 rounded-lg text-sm font-bold text-black shadow-[3px_3px_0_#000] flex items-start gap-2.5 text-left">
                    <ShieldAlert className="size-5 text-[#ef4444] shrink-0 mt-0.5" />
                    <div className="font-system">
                      <p className="font-black text-xs uppercase tracking-wider text-red-950">
                        {kh ? "កំហុស" : "Error"}
                      </p>
                      <p className="text-xs font-bold text-zinc-800 leading-normal mt-0.5">
                        {displayError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Warning at high attempts */}
                {attempts >= 5 && (
                  <div className="p-4 bg-orange-50 border-2 border-[#f97316] rounded-lg text-sm font-bold text-black shadow-[3px_3px_0_#000] flex items-start gap-2.5 text-left animate-shake">
                    <ShieldAlert className="size-5 text-[#f97316] shrink-0 mt-0.5" />
                    <div className="font-system">
                      <p className="font-black text-xs uppercase tracking-wider text-orange-950">
                        {kh ? "ការព្រមាន" : "Warning"}
                      </p>
                      <p className="text-xs font-bold text-zinc-850 leading-normal mt-0.5">
                        {kh 
                          ? "ការព្យាយាមចូលច្រើនដងពេក។ គណនីរបស់អ្នកនឹងត្រូវចាក់សោរបន្ទាប់ពីបរាជ័យ ៩ ដង។"
                          : "Too many failed attempts. Your account will be locked after 9 failures."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={pending || !!state?.redirectTo}
                  onClick={() => setAttempts((a) => a + 1)}
                  className="w-full py-3.5 bg-[#eab308] hover:bg-[#d9a307] text-black font-black text-base border-2 border-black rounded-lg shadow-[4px_4px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 font-system uppercase tracking-wide"
                >
                  {state?.redirectTo
                    ? (kh ? "កំពុងបញ្ជូនបន្ត..." : "Redirecting…")
                    : pending
                      ? (kh ? "កំពុងចូល..." : "Signing in…")
                      : (kh ? "ចូលគណនី" : "Sign In")}
                </button>

                {/* Brutalist Divider */}
                <div className="flex items-center gap-2.5 my-1">
                  <div className="flex-1 h-0.5 bg-black" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{kh ? "ឬ" : "or"}</span>
                  <div className="flex-1 h-0.5 bg-black" />
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 bg-white hover:bg-zinc-50 text-zinc-950 font-black text-base border-2 border-black rounded-lg shadow-[4px_4px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 active:translate-x-0 active:translate-y-0 active:shadow-none font-system"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  {kh ? "ចូលជាមួយ Google" : "Sign In with Google"}
                </button>


              </form>
            </div>
            
            <p className="text-center text-xs text-zinc-500 mt-5 font-system font-bold">
              {kh ? "មិនទាន់មានគណនីមែនទេ? " : "Don't have an account? "}
              <Link href="/register" className="font-black text-black hover:underline uppercase tracking-wide">
                {kh ? "ចុះឈ្មោះទីនេះ" : "Register Here"}
              </Link>
            </p>

          </div>
        </div>
      </div>

      {/* Guide Me Modal */}
      <GuideMeModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
