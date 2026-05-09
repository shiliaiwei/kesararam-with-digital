"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dot-bg">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24">
              <Image
                src="/brand/kwd.svg"
                alt="KWD Logo"
                width={96}
                height={96}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-500 border-4 border-black flex items-center justify-center">
              <span className="text-4xl font-black text-white">!</span>
            </div>
            <h2 className="text-2xl font-black text-black mb-2">
              Something Went Wrong
            </h2>
            <p className="text-zinc-600 text-sm mb-4">
              We encountered an unexpected error. Please try again.
            </p>
            {error.digest && (
              <p className="text-xs text-zinc-400 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-yellow-400 text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="w-full px-6 py-3 bg-white text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
