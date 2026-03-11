"use client";

import { Suspense, useState, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

const initialState = { error: "", redirectTo: "" };

function LoginFormInner() {
  const [attempts, setAttempts] = useState(0);
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? "";

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state?.redirectTo]);

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Header card */}
        <div className="bg-yellow-400 text-black border-2 border-black rounded-t-3xl px-8 py-6">
          <Link
            href="/home"
            className="text-xs text-black/60 hover:text-black transition-colors"
          >
            ← Back to home
          </Link>
          <h1 className="text-3xl font-black mt-3">Log In</h1>
          <p
            className="text-sm text-black/70 mt-1"
            style={{ fontFamily: "Siemreap, sans-serif" }}
          >
            ចូលគណនី
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-t-0 border-black rounded-b-3xl shadow-[6px_6px_0_#000] px-8 py-8">
          <form action={formAction} className="flex flex-col gap-5">
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
                autoComplete="username"
                className="w-full px-4 py-3 border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                placeholder="your@email.com or username"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-bold text-black">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {state?.error && (
              <div className="px-4 py-3 bg-red-50 border-2 border-red-500 rounded-xl text-sm font-bold text-red-700 shadow-[2px_2px_0_#ef4444]">
                {state.error}
              </div>
            )}

            {/* Warning at high attempts */}
            {attempts >= 5 && (
              <div className="px-4 py-3 bg-yellow-50 border-2 border-yellow-500 rounded-xl text-sm font-bold text-yellow-800 shadow-[2px_2px_0_#ca8a04]">
                Warning: too many failed attempts. Your account will be locked
                after 9 failures.
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !!state?.redirectTo}
              onClick={() => setAttempts((a) => a + 1)}
              className="w-full py-3.5 bg-yellow-400 text-black font-black text-base border-2 border-black rounded-xl shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {state?.redirectTo
                ? "Redirecting…"
                : pending
                  ? "Signing in…"
                  : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-4">
          All accounts are provided by your teacher or administrator.
        </p>
      </div>
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
