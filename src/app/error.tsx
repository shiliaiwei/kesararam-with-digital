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
    <div className="min-h-screen flex items-center justify-center bg-white dot-bg px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000]">
          {/* Caution stripe */}
          <div
            className="h-[6px] w-full"
            style={{ background: "repeating-linear-gradient(90deg,#eab308 0,#eab308 18px,#000 18px,#000 36px)" }}
          />

          <div className="p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/brand/kwd-black_nobackground.png"
                alt="KWD"
                width={120}
                height={48}
                className="object-contain h-12 w-auto"
                unoptimized
                priority
              />
            </div>

            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-5 bg-red-500 border-4 border-black shadow-[4px_4px_0_#000] flex items-center justify-center">
              <span className="text-4xl font-black text-white">!</span>
            </div>

            <h2 className="text-2xl font-black text-black mb-1">
              Something Went Wrong
            </h2>
            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest font-mono mb-3">
              មានបញ្ហាបច្ចេកទេស
            </p>
            <p className="text-zinc-600 text-sm font-medium mb-4 font-google-sans">
              យើងជួបបញ្ហាមិនបានរំពឹងទុក។ សូមព្យាយាមម្ដងទៀត។
              <span className="block text-xs text-zinc-400 mt-1 font-english">
                We encountered an unexpected error. Please try again.
              </span>
            </p>
            {error.digest && (
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Error ID: {error.digest}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={reset}
                className="w-full px-6 py-3 bg-yellow-400 text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                ព្យាយាមម្ដងទៀត · Try Again
              </button>
              <Link
                href="/"
                className="w-full px-6 py-3 bg-white text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-center"
              >
                ទំព័រដើម · Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
