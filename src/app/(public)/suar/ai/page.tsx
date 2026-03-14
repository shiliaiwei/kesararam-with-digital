"use client";

import { FaTools, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { useLang } from "@/context/lang-context";

export default function SuarAIPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-10 flex flex-col items-center gap-6 text-center">
          {/* Top caution strip */}
          <div className="w-full h-3 caution-tape border-2 border-black -mt-10 mb-2" />

          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-400 border-4 border-black shadow-[4px_4px_0_#000] flex items-center justify-center">
            <FaTools size={36} className="text-black" />
          </div>

          {/* Title */}
          <div>
            <span className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1 mb-3">
              Under Construction
            </span>
            <h1 className="text-3xl font-black text-black leading-tight">
              {lang === "kh" ? "Suar AI (សួរ)" : "Suar AI"}
            </h1>
            <p
              className="mt-3 text-zinc-600 text-base leading-relaxed"
              style={
                lang === "kh" ? { fontFamily: "Siemreap, sans-serif" } : {}
              }
            >
              {lang === "kh"
                ? "មុខងារនេះកំពុងស្ថិតនៅក្នុងដំណើរការអភិវឌ្ឍន៍។ សូមមកទស្សនាម្តងទៀតនៅពេលក្រោយ។"
                : "This feature is currently under construction. Please check back soon."}
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 border-2 border-black shadow-[2px_2px_0_#000]">
            <span className="w-2 h-2 bg-yellow-400 border border-black animate-pulse" />
            <span className="text-xs font-black text-black uppercase tracking-widest">
              {lang === "kh" ? "កំពុងអភិវឌ្ឍ" : "Coming Soon"}
            </span>
          </div>

          {/* Back link */}
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] font-black text-sm text-black hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] transition-all"
          >
            <FaArrowLeft size={12} />
            {lang === "kh" ? "ត្រឡប់ទៅទំព័រដើម" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
