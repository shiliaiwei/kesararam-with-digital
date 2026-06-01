"use client";

import { Suspense, useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { useLang } from "@/context/lang-context";

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
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg shadow-[8px_8px_0_#000] p-6 space-y-4 animate-fade-in" style={{ borderRadius: "0px" }}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-yellow-500 text-2xl font-black">help</span>
            <h2 className="text-xl font-black uppercase">Guide Me / ណែនាំខ្ញុំ</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center font-black text-lg">×</button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-sm">
          {/* For Students */}
          <div className="border-2 border-black p-4 bg-blue-50" style={{ borderRadius: "0px" }}>
            <h3 className="font-black text-blue-900 uppercase flex items-center gap-1.5 border-b border-blue-200 pb-1 mb-2 text-xs">
              <span className="material-symbols-rounded text-base">school</span>
              For Students / សម្រាប់សិស្ស
            </h3>
            <p className="font-bold text-zinc-800 leading-relaxed">
              To create a student account:
            </p>
            <ol className="list-decimal pl-4 mt-1 space-y-1.5 font-medium text-zinc-700">
              <li>Fill in your School details, Province, Grade level, and Section.</li>
              <li>Input the **Teacher Invite Code** provided by your teacher (each code is single-use).</li>
              <li>Click **Register with Google** to link and activate your account instantly.</li>
            </ol>
            <div className="h-0.5 bg-blue-200 my-2.5" />
            <p className="font-bold text-zinc-800 leading-relaxed" style={{ fontFamily: "Siemreap, sans-serif" }}>
              របៀបបង្កើតគណនីសិស្ស៖
            </p>
            <ol className="list-decimal pl-4 mt-1 space-y-1.5 text-zinc-700" style={{ fontFamily: "Siemreap, sans-serif" }}>
              <li>បំពេញ ឈ្មោះសាលារៀន, ខេត្ត/ក្រុង, ថ្នាក់ទី និង វេនសិក្សា។</li>
              <li>បញ្ចូល **លេខកូដអញ្ជើញពីគ្រូ** ដែលគ្រូបានផ្តល់ជូន (កូដនីមួយៗប្រើបានតែម្តងប៉ុណ្ណោះ)។</li>
              <li>ចុចលើប៊ូតុង **Register with Google** ដើម្បីភ្ជាប់គណនីរួចជាស្រេច។</li>
            </ol>
          </div>

          {/* For Teachers */}
          <div className="border-2 border-black p-4 bg-green-50" style={{ borderRadius: "0px" }}>
            <h3 className="font-black text-green-900 uppercase flex items-center gap-1.5 border-b border-green-200 pb-1 mb-2 text-xs">
              <span className="material-symbols-rounded text-base">person_search</span>
              For Teachers / សម្រាប់គ្រូបង្រៀន
            </h3>
            <p className="font-bold text-zinc-800 leading-relaxed">
              Teacher Accounts Gating:
            </p>
            <p className="text-zinc-700 font-medium leading-relaxed mt-1">
              To protect student privacy and ensure a safe learning environment, **teacher accounts cannot be registered publicly**. 
              All teacher accounts must be created exclusively by the School Administrator.
            </p>
            <p className="text-zinc-700 font-bold leading-relaxed mt-1.5">
              *Once the Administrator registers your school email in the Admin Dashboard, you can sign in instantly using Sign In with Google.*
            </p>
            <div className="h-0.5 bg-green-200 my-2.5" />
            <p className="font-bold text-zinc-800 leading-relaxed" style={{ fontFamily: "Siemreap, sans-serif" }}>
              គណនីគ្រូបង្រៀន៖
            </p>
            <p className="text-zinc-700 leading-relaxed mt-1" style={{ fontFamily: "Siemreap, sans-serif" }}>
              ដើម្បីការពារឯកជនភាពសិស្ស និងសុវត្ថិភាព **គណនីគ្រូបង្រៀនមិនអាចចុះឈ្មោះជាសាធារណៈបានទេ**។ គណនីគ្រូទាំងអស់ត្រូវតែបង្កើតឡើងដោយផ្ទាល់ពីសំណាក់ «អ្នកគ្រប់គ្រងប្រព័ន្ធសាលា (School Administrator)»។
            </p>
            <p className="text-zinc-700 font-bold leading-relaxed mt-1.5" style={{ fontFamily: "Siemreap, sans-serif" }}>
              *បន្ទាប់ពីអ្នកគ្រប់គ្រងប្រព័ន្ធចុះឈ្មោះអ៊ីមែលរបស់អ្នករួចរាល់ អ្នកអាចចូលគណនីបានភ្លាមៗតាមរយៈ Sign In with Google។*
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-yellow-400 border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all text-black"
          style={{ borderRadius: "0px" }}
        >
          Got It / យល់ព្រម
        </button>
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
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error") ?? "";

  const displayError = state?.error || googleError || urlError;

  useEffect(() => {
    if (state?.success) {
      // Redirect to home dashboard
      window.location.href = "/profile/student";
    }
  }, [state?.success]);

  const handleGoogleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    setGoogleError("");

    if (!showEmailReg) {
      // Instant Google Redirect
      window.location.href = "/api/auth/google";
      return;
    }

    const inviteCodeEl = document.getElementById("inviteCode") as HTMLInputElement;
    const code = inviteCodeEl?.value?.trim() || "";

    if (!code) {
      setGoogleError(kh ? "សូមបញ្ចូលលេខកូដអញ្ជើញពីគ្រូ *" : "A teacher invite code is required for Google registration.");
      return;
    }

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
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl animate-fade-in">
        {/* Header card */}
        <div className="bg-yellow-400 text-black border-2 border-black rounded-none px-8 py-6">
          <Link
            href="/home"
            className="text-xs text-black/60 hover:text-black transition-colors"
          >
            ← Back to home / ត្រឡប់ទៅទំព័រដើម
          </Link>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
            <h1 className="text-3xl font-black">Register / បង្កើតគណនី</h1>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-yellow-100 border-2 border-black shadow-[2.5px_2.5px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 text-[10px] font-black uppercase tracking-wider text-black transition-all"
              style={{ borderRadius: "0px" }}
            >
              <span className="material-symbols-rounded text-xs font-black">help</span>
              Guide Me / ណែនាំខ្ញុំ
            </button>
          </div>
          <p
            className="text-sm text-black/70 mt-1"
            style={{ fontFamily: "Siemreap, sans-serif" }}
          >
            Fill in your details below to join Kesararam Digital Classroom.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-t-0 border-black rounded-none shadow-[6px_6px_0_#000] px-8 py-8">
          <form action={formAction} className="flex flex-col gap-5" autoComplete="off">
            {/* hidden role input */}
            <input type="hidden" name="role" value="student" />

            {!showEmailReg ? (
              // Clean Instant Google Flow
              <div className="flex flex-col gap-5 py-4">
                <p className="text-zinc-650 font-bold text-sm text-center leading-relaxed">
                  {kh
                    ? "ចូលរួមជាមួយ Kesararam Digital Classroom ភ្លាមៗដោយចុះឈ្មោះជាមួយគណនី Google របស់អ្នក។"
                    : "Join Kesararam Digital Classroom instantly by signing up with your Google account."}
                </p>
                <p className="text-xs text-zinc-400 font-bold text-center leading-relaxed">
                  {kh
                    ? "* បន្ទាប់ពីការចុះឈ្មោះគណនីបានជោគជ័យ អ្នកនឹងត្រូវបំពេញព័ត៌មានលម្អិត និងលេខកូដអញ្ជើញពីគ្រូ ដើម្បីចាប់ផ្តើមប្រើប្រាស់។"
                    : "* After successful signup, you will complete your profile details and provide your invite code to get started."}
                </p>

                {/* Error message */}
                {displayError && (
                  <div className="px-4 py-3 bg-[#fda4af] border-2 border-red-500 rounded-none text-sm font-bold text-black shadow-[4px_4px_0_#000]">
                    {displayError}
                  </div>
                )}

                {/* Google Register Button */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  className="w-full py-4 bg-yellow-400 text-black font-black text-base border-2 border-black rounded-none shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 active:translate-x-0 active:translate-y-0 active:shadow-none animate-fade-in"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#000" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.513 0-6.38-2.87-6.38-6.38s2.87-6.38 6.38-6.38c1.53 0 2.914.544 4.012 1.443l3.117-3.117C19.23 1.942 15.938 1 12.24 1 5.62 1 .25 6.37.25 13s5.37 12 11.99 12c7.61 0 11.94-5.36 11.94-11.99 0-.765-.085-1.5-.235-2.225H12.24z"/>
                  </svg>
                  {kh ? "ចុះឈ្មោះដោយប្រើប្រាស់ Google" : "Register with Google"}
                </button>

                {/* Toggle Link */}
                <button
                  type="button"
                  onClick={() => setShowEmailReg(true)}
                  className="text-xs font-black text-zinc-500 hover:text-black transition-all underline mt-2 block self-center animate-fade-in"
                >
                  {kh ? "ឬ ចុះឈ្មោះដោយប្រើប្រាស់ អ៊ីមែល និង លេខសម្ងាត់" : "Or Register with Email and Password"}
                </button>
              </div>
            ) : (
              // Standard Email Registration Flow
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="username" className="text-sm font-bold text-black">
                      Username / ឈ្មោះគណនី *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      placeholder="sopheak01"
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-bold text-black">
                      Email / អ៊ីមែល *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="sopheak@kwd.tech"
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Display Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="displayName" className="text-sm font-bold text-black">
                      Full Name / ឈ្មោះពេញ
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      placeholder="Sopheak Chan / ចាន់ សុភ័ក្ត្រ"
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-sm font-bold text-black">
                      Password / លេខសម្ងាត់ *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    />
                  </div>
                </div>

                {/* School Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="schoolName" className="text-sm font-bold text-black">
                    School Name / ឈ្មោះសាលារៀន *
                  </label>
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    required
                    placeholder="e.g. Wat Bo Primary School / សាលាបឋមសិក្សាវត្តបូ"
                    className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Province Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="province" className="text-sm font-bold text-black">
                      Province / ខេត្ត-ក្រុង *
                    </label>
                    <select
                      id="province"
                      name="province"
                      required
                      defaultValue=""
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    >
                      <option value="" disabled>Select Province / ជ្រើសរើសខេត្ត</option>
                      {CAMBODIA_PROVINCES.map((prov) => (
                        <option key={prov.en} value={prov.en}>
                          {prov.en} / {prov.kh}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grade Dropdown (Student only) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gradeLevel" className="text-sm font-bold text-black">
                      Grade / ថ្នាក់ទី *
                    </label>
                    <select
                      id="gradeLevel"
                      name="gradeLevel"
                      required
                      defaultValue=""
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    >
                      <option value="">Select Grade / ជ្រើសរើសថ្នាក់</option>
                      {GRADES.map((gr) => (
                        <option key={gr.en} value={gr.en}>
                          {gr.en} / {gr.kh}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Teacher Invite Code (Student only) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="inviteCode" className="text-sm font-bold text-black flex items-center gap-1">
                    Teacher Invite Code / លេខកូដអញ្ជើញពីគ្រូ *
                  </label>
                  <input
                    type="text"
                    id="inviteCode"
                    name="inviteCode"
                    required
                    placeholder="KWD-XXXX-YYYY"
                    className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-black focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all placeholder:font-bold placeholder:text-zinc-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Section */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="section" className="text-sm font-bold text-black">
                      Section / វេន (Optional)
                    </label>
                    <input
                      type="text"
                      id="section"
                      name="section"
                      placeholder="e.g. Morning A / ព្រឹក A"
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    />
                  </div>

                  {/* Parent Contact (Student only) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="parentContact" className="text-sm font-bold text-black">
                      Parent Phone / លេខទូរស័ព្ទអាណាព្យាបាល (Optional)
                    </label>
                    <input
                      type="text"
                      id="parentContact"
                      name="parentContact"
                      placeholder="e.g. 012 345 678"
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                    />
                  </div>
                </div>

                {/* Error message */}
                {displayError && (
                  <div className="px-4 py-3 bg-[#fda4af] border-2 border-red-500 rounded-none text-sm font-bold text-black shadow-[4px_4px_0_#000]">
                    {displayError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3.5 mt-2 bg-yellow-400 text-black font-black text-base border-2 border-black rounded-none shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? "Registering / កំពុងចុះឈ្មោះ…" : "Create Account / បង្កើតគណនី"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2.5 my-1">
                  <div className="flex-1 h-0.5 bg-black" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-0.5 bg-black" />
                </div>

                {/* Google Register Button */}
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  className="w-full py-3.5 bg-white text-zinc-950 font-black text-base border-2 border-black rounded-none shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 active:translate-x-0 active:translate-y-0 active:shadow-none animate-fade-in"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.513 0-6.38-2.87-6.38-6.38s2.87-6.38 6.38-6.38c1.53 0 2.914.544 4.012 1.443l3.117-3.117C19.23 1.942 15.938 1 12.24 1 5.62 1 .25 6.37.25 13s5.37 12 11.99 12c7.61 0 11.94-5.36 11.94-11.99 0-.765-.085-1.5-.235-2.225H12.24z"/>
                  </svg>
                  Register with Google
                </button>

                {/* Toggle Link */}
                <button
                  type="button"
                  onClick={() => setShowEmailReg(false)}
                  className="text-xs font-black text-zinc-500 hover:text-black transition-all underline mt-2 block self-center animate-fade-in"
                >
                  {kh ? "ប្រើប្រាស់ការចុះឈ្មោះរហ័សតាម Google" : "Use simplified Google Registration"}
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Already have an account? / មានគណនីរួចហើយ?{" "}
          <Link href="/login" className="font-bold text-black hover:underline">
            Log In / ចូលគណនី
          </Link>
        </p>
      </div>

      {/* Guide Me Modal */}
      <GuideMeModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
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
