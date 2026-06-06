"use client";

import { Suspense, useState, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
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
  School,
  Mail,
  GraduationCap,
  Phone,
  MapPin,
  Layers,
  Key
} from "lucide-react";

import { SECTIONS } from "../terms/page";

const initialState = { error: "", success: false };

const CAMBODIA_PROVINCES = [
  { en: "Siem Reap", kh: "សៀមរាប" },
  { en: "Phnom Penh", kh: "ភ្នំពេញ" },
  { en: "Battambang", kh: "បាត់ដំបង" },
  { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  { en: "Kampong Cham", kh: "កំពង់ចាម" },
  { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  { en: "Kampong Thom", kh: "កំពង់ធំ" },
  { en: "Kampot", kh: "កំពត" },
  { en: "Kandal", kh: "កណ្តាល" },
  { en: "Kep", kh: "កែប" },
  { en: "Koh Kong", kh: "កោះកុង" },
  { en: "Kratie", kh: "ក្រចេះ" },
  { en: "Mondulkiri", kh: "មណ្ឌលគីរី" },
  { en: "Oudar Meanchey", kh: "ឧត្តរមានជ័យ" },
  { en: "Pailin", kh: "ប៉ៃលិន" },
  { en: "Preah Sihanouk", kh: "ព្រះសីហនុ" },
  { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  { en: "Prey Veng", kh: "ព្រៃវែង" },
  { en: "Pursat", kh: "ពោធិ៍សាត់" },
  { en: "Ratanakiri", kh: "រតនគីរី" },
  { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  { en: "Takeo", kh: "តាកែវ" },
  { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
];

const GRADES = [
  { en: "Grade 6", kh: "ថ្នាក់ទី ៦" },
  { en: "Grade 7", kh: "ថ្នាក់ទី ៧" },
  { en: "Grade 8", kh: "ថ្នាក់ទី ៨" },
  { en: "Grade 9", kh: "ថ្នាក់ទី ៩" },
  { en: "Grade 10", kh: "ថ្នាក់ទី ១០" },
  { en: "Grade 11", kh: "ថ្នាក់ទី ១១" },
  { en: "Grade 12", kh: "ថ្នាក់ទី ១២" },
];

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

function PrivacyConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { lang } = useLang();
  const kh = lang === "kh";
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 15;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      const timer = setTimeout(() => {
        const el = scrollContainerRef.current;
        if (el) {
          if (el.scrollHeight <= el.clientHeight) {
            setHasScrolledToBottom(true);
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white border-[3px] border-black w-full max-w-xl shadow-[6px_6px_0_#000] p-6 space-y-4 text-left rounded-[15px] font-system max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-[3px] border-black pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-850 text-2xl font-black text-blue-800">privacy_tip</span>
            <h2 className="text-lg font-black uppercase text-black">
              {kh ? "ការយល់ព្រមលើឯកជនភាព និងលក្ខខណ្ឌ" : "Privacy & Terms Confirmation"}
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

        {/* Modal Scrollable Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm font-semibold text-zinc-700">
          <p className="leading-relaxed">
            {kh
              ? "មុនពេលចុះឈ្មោះគណនី សូមអាន និងយល់ព្រមលើលក្ខខណ្ឌប្រើប្រាស់របស់ KWD៖"
              : "Before creating an account, please read and accept the KWD Terms of Use:"}
          </p>

          {/* KWD Terms of Use scroll section */}
          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-xs font-black uppercase text-black tracking-wide">
              {kh ? "លក្ខខណ្ឌប្រើប្រាស់ KWD" : "KWD Terms of Use"}
            </span>
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="border-2 border-black rounded-lg p-3 bg-zinc-50 max-h-48 overflow-y-auto font-system text-xs leading-relaxed space-y-3 shadow-[inner_2px_2px_4px_rgba(0,0,0,0.05)]"
            >
              {SECTIONS.map((sec) => (
                <div key={sec.id} className="space-y-1 border-b border-zinc-200/50 pb-2 last:border-0 last:pb-0">
                  <h4 className="font-black text-black">
                    {sec.num}. {kh ? sec.heading.kh : sec.heading.en}
                  </h4>
                  <p className="font-semibold text-zinc-600">
                    {kh ? sec.kh : sec.en}
                  </p>
                </div>
              ))}
            </div>
            {!hasScrolledToBottom && (
              <p className="text-[10px] font-black text-red-500 animate-pulse mt-1">
                {kh 
                  ? "* សូមអូសចុះក្រោមទៅចុងបញ្ចប់នៃលក្ខខណ្ឌប្រើប្រាស់ដើម្បីយល់ព្រម" 
                  : "* Please scroll to the bottom of the Terms of Use to enable acceptance."}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-200 shrink-0">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!hasScrolledToBottom}
            className="flex-1 py-3 bg-[#eab308] hover:bg-[#d9a307] disabled:bg-zinc-300 disabled:text-zinc-500 disabled:border-zinc-400 disabled:cursor-not-allowed border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all text-black rounded-lg"
          >
            {kh ? "ខ្ញុំយល់ព្រម និងចុះឈ្មោះ" : "I Accept & Register"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-6 bg-white hover:bg-zinc-50 border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all text-black rounded-lg"
          >
            {kh ? "បោះបង់" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterFormInner() {
  const role = "student";
  const { lang } = useLang();
  const kh = lang === "kh";

  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );
  
  const [googleError, setGoogleError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showEmailReg, setShowEmailReg] = useState(false);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  const [pendingRegistrationType, setPendingRegistrationType] = useState<"google" | "email" | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error") ?? "";

  const displayError = state?.error || googleError || urlError;

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/profile/student";
    }
  }, [state?.success]);

  const handleGoogleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setGoogleError("");

    if (showEmailReg) {
      const inviteCodeEl = document.getElementById("inviteCode") as HTMLInputElement;
      const code = inviteCodeEl?.value?.trim() || "";

      if (!code) {
        setGoogleError(kh ? "សូមបញ្ចូលលេខកូដអញ្ជើញពីគ្រូ *" : "A teacher invite code is required for Google registration.");
        return;
      }

      const schoolNameEl = document.getElementById("schoolName") as HTMLInputElement;
      const provinceEl = document.getElementById("province") as HTMLSelectElement;
      const gradeLevelEl = document.getElementById("gradeLevel") as HTMLSelectElement;

      if (!schoolNameEl?.value?.trim() || !provinceEl?.value || !gradeLevelEl?.value) {
        setGoogleError(kh ? "សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់ *" : "Please fill in all required fields.");
        return;
      }
    }

    setPendingRegistrationType("google");
    setShowPrivacyConfirm(true);
  };

  const handleEmailRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setGoogleError("");

    if (formRef.current) {
      if (formRef.current.reportValidity()) {
        setPendingRegistrationType("email");
        setShowPrivacyConfirm(true);
      }
    }
  };

  const handleConfirmPrivacy = () => {
    setShowPrivacyConfirm(false);
    if (pendingRegistrationType === "google") {
      executeGoogleRegister();
    } else if (pendingRegistrationType === "email") {
      formRef.current?.requestSubmit();
    }
    setPendingRegistrationType(null);
  };

  const executeGoogleRegister = async () => {
    if (!showEmailReg) {
      window.location.href = "/api/auth/google";
      return;
    }

    const inviteCodeEl = document.getElementById("inviteCode") as HTMLInputElement;
    const code = inviteCodeEl?.value?.trim() || "";

    // Validate invite code
    const { validateInviteCodeAction } = await import("@/app/actions/invites");
    const validateRes = await validateInviteCodeAction(code);
    if (validateRes.error) {
      setGoogleError(validateRes.error);
      return;
    }

    const params = new URLSearchParams({
      inviteCode: code,
    });
    
    const schoolNameEl = document.getElementById("schoolName") as HTMLInputElement;
    const provinceEl = document.getElementById("province") as HTMLSelectElement;
    const gradeLevelEl = document.getElementById("gradeLevel") as HTMLSelectElement;
    const sectionEl = document.getElementById("section") as HTMLInputElement;

    const schoolName = schoolNameEl?.value?.trim() || "";
    const province = provinceEl?.value || "";
    const gradeLevel = gradeLevelEl?.value || "";
    const section = sectionEl?.value?.trim() || "";

    if (schoolName) params.set("schoolName", schoolName);
    if (province) params.set("province", province);
    if (gradeLevel) params.set("gradeLevel", gradeLevel);
    if (section) params.set("section", section);

    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  return (
    <div className="min-h-screen dot-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl animate-fade-in space-y-6">
        
        {/* Header logo */}
        <div className="flex flex-col items-center justify-center gap-3">
          <img src="/brand/logo.png" alt="KWD Logo" className="h-20 w-auto object-contain" />
          <span className="font-google-sans text-lg lg:text-xl font-black tracking-tight text-black uppercase text-center">
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
                {kh ? "បង្កើតគណនី" : "Register"}
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
          <form ref={formRef} action={formAction} className="p-6 lg:p-8 flex flex-col gap-5 bg-white" autoComplete="off">
            {/* hidden role input */}
            <input type="hidden" name="role" value="student" />

            {!showEmailReg ? (
              // Simplified Google Flow
              <div className="flex flex-col gap-5 py-2">
                <p className="text-zinc-650 font-bold text-sm text-center leading-relaxed font-system">
                  {kh
                    ? "ចុះឈ្មោះជាមួយ Google ដើម្បីចូលរួមជាមួយ Kesararam with Digital។"
                    : "Sign up with Google to join Kesararam with Digital."}
                </p>
                <p className="text-xs text-zinc-400 font-bold text-center leading-relaxed font-system">
                  {kh
                    ? "* អ្នកនឹងត្រូវបំពេញព័ត៌មានគណនី និងបញ្ចូលលេខកូដអញ្ជើញបន្ទាប់ពីចុះឈ្មោះរួច។"
                    : "* You will complete your profile details and invite code after signing up."}
                </p>

                {/* Error message */}
                {displayError && (
                  <div className="p-4 bg-[#fda4af] border-2 border-red-500 rounded-lg text-sm font-bold text-black shadow-[3px_3px_0_#000] flex items-start gap-2.5 text-left font-system">
                    <ShieldAlert className="size-5 text-[#ef4444] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-xs uppercase tracking-wider text-red-950">
                        {kh ? "កំហុស" : "Error"}
                      </p>
                      <p className="text-xs font-bold text-zinc-800 leading-normal mt-0.5">
                        {displayError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Google Register Button */}
                <button
                  type="button"
                  onClick={handleGoogleRegisterClick}
                  className="w-full py-3.5 bg-[#eab308] hover:bg-[#d9a307] text-black font-black text-base border-2 border-black rounded-lg shadow-[4px_4px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 active:translate-x-0 active:translate-y-0 active:shadow-none font-system uppercase tracking-wide"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  {kh ? "ចុះឈ្មោះជាមួយ Google" : "Register with Google"}
                </button>

                {/* Toggle Link */}
                <button
                  type="button"
                  onClick={() => setShowEmailReg(true)}
                  className="text-xs font-black text-zinc-500 hover:text-black transition-all underline mt-2 block self-center animate-fade-in font-system uppercase tracking-wider"
                >
                  {kh ? "ឬ ចុះឈ្មោះដោយប្រើប្រាស់ អ៊ីមែល និង លេខសម្ងាត់" : "Or Register with Email and Password"}
                </button>
              </div>
            ) : (
              // Standard Email Registration Flow
              <div className="flex flex-col gap-6 animate-fade-in font-system">
                {/* Section 1: Personal Account Info */}
                <div className="border-2 border-black rounded-xl p-5 bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10 transition-colors shadow-[3px_3px_0_#000] space-y-4 text-left">
                  <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-2">
                    <User className="size-5 text-[#3b82f6] shrink-0" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-black">
                      {kh ? "ព័ត៌មានគណនីផ្ទាល់ខ្លួន" : "Personal Account Info"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="username" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "ឈ្មោះគណនី *" : "Username *"}
                      </label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <input
                          type="text"
                          id="username"
                          name="username"
                          required
                          placeholder="sopheak01"
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="email" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "អ៊ីមែល *" : "Email *"}
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          placeholder="sopheak@kwd.tech"
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="displayName" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "ឈ្មោះពេញ" : "Full Name"}
                      </label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <input
                          type="text"
                          id="displayName"
                          name="displayName"
                          placeholder="Sopheak Chan / ចាន់ សុភ័ក្ត្រ"
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="password" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "លេខសម្ងាត់ *" : "Password *"}
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <input
                          type="password"
                          id="password"
                          name="password"
                          required
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: School & Academic Details */}
                <div className="border-2 border-black rounded-xl p-5 bg-[#22c55e]/5 hover:bg-[#22c55e]/10 transition-colors shadow-[3px_3px_0_#000] space-y-4 text-left">
                  <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-2">
                    <School className="size-5 text-[#22c55e] shrink-0" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-black">
                      {kh ? "ព័ត៌មានសិក្សា និងសាលារៀន" : "School & Academic Details"}
                    </h3>
                  </div>

                  {/* School Name */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="schoolName" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                      {kh ? "ឈ្មោះសាលារៀន *" : "School Name *"}
                    </label>
                    <div className="relative flex items-center">
                      <School className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                      <input
                        type="text"
                        id="schoolName"
                        name="schoolName"
                        required
                        placeholder="e.g. Wat Bo Primary School / សាលាបឋមសិក្សាវត្តបូ"
                        className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Province Dropdown */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="province" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "ខេត្ត-ក្រុង *" : "Province *"}
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <select
                          id="province"
                          name="province"
                          required
                          defaultValue=""
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-black bg-white focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        >
                          <option value="" disabled>{kh ? "ជ្រើសរើសខេត្ត" : "Select Province"}</option>
                          {CAMBODIA_PROVINCES.map((prov) => (
                            <option key={prov.en} value={prov.en}>
                              {kh ? prov.kh : prov.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Grade Dropdown (Student only) */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="gradeLevel" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "ថ្នាក់ទី *" : "Grade *"}
                      </label>
                      <div className="relative flex items-center">
                        <GraduationCap className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <select
                          id="gradeLevel"
                          name="gradeLevel"
                          required
                          defaultValue=""
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-black bg-white focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        >
                          <option value="" disabled>{kh ? "ជ្រើសរើសថ្នាក់" : "Select Grade"}</option>
                          {GRADES.map((gr) => (
                            <option key={gr.en} value={gr.en}>
                              {kh ? gr.kh : gr.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Invite Code (Student only) */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="inviteCode" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                      {kh ? "លេខកូដអញ្ជើញពីគ្រូ *" : "Teacher Invite Code *"}
                    </label>
                    <div className="relative flex items-center">
                      <Key className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                      <input
                        type="text"
                        id="inviteCode"
                        name="inviteCode"
                        required
                        placeholder="KWD-XXXX-YYYY"
                        className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-black focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all placeholder:font-bold placeholder:text-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Section */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="section" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "វេន (ស្រេចចិត្ត)" : "Section (Optional)"}
                      </label>
                      <div className="relative flex items-center">
                        <Layers className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <input
                          type="text"
                          id="section"
                          name="section"
                          placeholder="e.g. Morning A / ព្រឹក A"
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        />
                      </div>
                    </div>

                    {/* Parent Contact (Student only) */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label htmlFor="parentContact" className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                        {kh ? "លេខទូរស័ព្ទអាណាព្យាបាល (ស្រេចចិត្ត)" : "Parent Phone (Optional)"}
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 text-zinc-400 size-4 pointer-events-none" />
                        <input
                          type="text"
                          id="parentContact"
                          name="parentContact"
                          placeholder="e.g. 012 345 678"
                          className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg text-sm font-medium focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#3b82f6] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {displayError && (
                  <div className="p-4 bg-[#fda4af] border-2 border-red-500 rounded-lg text-sm font-bold text-black shadow-[3px_3px_0_#000] flex items-start gap-2.5 text-left">
                    <ShieldAlert className="size-5 text-[#ef4444] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-xs uppercase tracking-wider text-red-950">
                        {kh ? "កំហុស" : "Error"}
                      </p>
                      <p className="text-xs font-bold text-zinc-800 leading-normal mt-0.5">
                        {displayError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleEmailRegisterClick}
                  disabled={pending}
                  className="w-full py-3.5 mt-2 bg-[#eab308] hover:bg-[#d9a307] text-black font-black text-base border-2 border-black rounded-lg shadow-[4px_4px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 uppercase tracking-wide font-system"
                >
                  {pending ? (kh ? "កំពុងចុះឈ្មោះ…" : "Registering…") : (kh ? "បង្កើតគណនី" : "Create Account")}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2.5 my-1">
                  <div className="flex-1 h-0.5 bg-black" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{kh ? "ឬ" : "or"}</span>
                  <div className="flex-1 h-0.5 bg-black" />
                </div>

                {/* Google Register Button */}
                <button
                  type="button"
                  onClick={handleGoogleRegisterClick}
                  className="w-full py-3.5 bg-white hover:bg-zinc-50 text-zinc-950 font-black text-base border-2 border-black rounded-lg shadow-[4px_4px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 active:translate-x-0 active:translate-y-0 active:shadow-none"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  {kh ? "ចុះឈ្មោះជាមួយ Google" : "Register with Google"}
                </button>

                {/* Toggle Link */}
                <button
                  type="button"
                  onClick={() => setShowEmailReg(false)}
                  className="text-xs font-black text-zinc-500 hover:text-black transition-all underline mt-2 block self-center animate-fade-in uppercase tracking-wider font-system"
                >
                  {kh ? "ប្រើប្រាស់ការចុះឈ្មោះរហ័សតាម Google" : "Use simplified Google Registration"}
                </button>
              </div>
            )}
          </form>
        </div>
        
        <p className="text-center text-xs text-zinc-500 mt-5 font-system font-bold">
          {kh ? "មានគណនីរួចហើយ? " : "Already have an account? "}
          <Link href="/login" className="font-black text-black hover:underline uppercase tracking-wide">
            {kh ? "ចូលគណនី" : "Log In"}
          </Link>
        </p>

      </div>

      {/* Guide Me Modal */}
      <GuideMeModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* Privacy Standards Confirmation Modal */}
      <PrivacyConfirmModal
        isOpen={showPrivacyConfirm}
        onClose={() => {
          setShowPrivacyConfirm(false);
          setPendingRegistrationType(null);
        }}
        onConfirm={handleConfirmPrivacy}
      />
    </div>
  );
}

export function RegisterForm() {
  return (
    <Suspense>
      <RegisterFormInner />
    </Suspense>
  );
}
