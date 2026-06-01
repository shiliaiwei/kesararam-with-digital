"use client";

import { Suspense, useState, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

const initialState = { error: "", redirectTo: "" };

function GuideMeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg shadow-[8px_8px_0_#000] p-6 space-y-4 animate-fade-in text-left" style={{ borderRadius: "0px" }}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-yellow-500 text-2xl font-black">help</span>
            <h2 className="text-xl font-black uppercase text-black">Guide Me / ណែនាំខ្ញុំ</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center font-black text-lg text-black">×</button>
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
              <li>Go to registration, fill in your details (School, Province, Grade).</li>
              <li>Input the **Teacher Invite Code** provided by your teacher (each code is single-use).</li>
              <li>Click **Register with Google** to link and activate your account instantly.</li>
            </ol>
            <div className="h-0.5 bg-blue-200 my-2.5" />
            <p className="font-bold text-zinc-800 leading-relaxed" style={{ fontFamily: "Siemreap, sans-serif" }}>
              របៀបបង្កើតគណនីសិស្ស៖
            </p>
            <ol className="list-decimal pl-4 mt-1 space-y-1.5 text-zinc-700" style={{ fontFamily: "Siemreap, sans-serif" }}>
              <li>ទៅកាន់ទំព័រចុះឈ្មោះ រួចបំពេញ ឈ្មោះសាលារៀន, ខេត្ត/ក្រុង, ថ្នាក់ទី។</li>
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

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state?.redirectTo]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header card */}
        <div className="bg-yellow-400 text-black border-2 border-black rounded-none px-8 py-6">
          <Link
            href="/home"
            className="text-xs text-black/60 hover:text-black transition-colors"
          >
            ← Back to home
          </Link>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
            <h1 className="text-3xl font-black">Log In</h1>
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
            ចូលគណនី
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-t-0 border-black rounded-none shadow-[6px_6px_0_#000] px-8 py-8">
          <form action={formAction} className="flex flex-col gap-5" autoComplete="off">
            <input type="hidden" name="redirect" value={redirectParam} />
            {/* Email or Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-bold text-black">
                Email or Username
              </label>
              <input
                type="text"
                id="email"
                name="email"
                required
                autoComplete="off"
                className="w-full px-4 py-3 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                placeholder="your@email.com or username"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-bold text-black"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="off"
                className="w-full px-4 py-3 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {displayError && (
              <div className="px-4 py-3 bg-[#fda4af] border-2 border-red-500 rounded-none text-sm font-bold text-black shadow-[4px_4px_0_#000]">
                {displayError}
              </div>
            )}

            {/* Warning at high attempts */}
            {attempts >= 5 && (
              <div className="px-4 py-3 bg-yellow-50 border-2 border-yellow-500 rounded-none text-sm font-bold text-yellow-800 shadow-[2px_2px_0_#ca8a04]">
                Warning: too many failed attempts. Your account will be locked
                after 9 failures.
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !!state?.redirectTo}
              onClick={() => setAttempts((a) => a + 1)}
              className="w-full py-3.5 bg-yellow-400 text-black font-black text-base border-2 border-black rounded-none shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {state?.redirectTo
                ? "Redirecting…"
                : pending
                  ? "Signing in…"
                  : "Sign In"}
            </button>

            {/* Brutalist Divider */}
            <div className="flex items-center gap-2.5 my-1">
              <div className="flex-1 h-0.5 bg-black" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-0.5 bg-black" />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 bg-white text-zinc-950 font-black text-base border-2 border-black rounded-none shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.513 0-6.38-2.87-6.38-6.38s2.87-6.38 6.38-6.38c1.53 0 2.914.544 4.012 1.443l3.117-3.117C19.23 1.942 15.938 1 12.24 1 5.62 1 .25 6.37.25 13s5.37 12 11.99 12c7.61 0 11.94-5.36 11.94-11.99 0-.765-.085-1.5-.235-2.225H12.24z"/>
              </svg>
              Sign In with Google
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Don't have an account? / មិនទាន់មានគណនី?{" "}
          <Link href="/register" className="font-bold text-black hover:underline">
            Register Here / ចុះឈ្មោះទីនេះ
          </Link>
        </p>
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
