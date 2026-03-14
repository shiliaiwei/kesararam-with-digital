"use client";

import { useLang } from "@/context/lang-context";
import { cn } from "@/lib/utils";

export function LangSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={cn(
        "flex items-center border-2 border-[#a8a8a8] rounded-xl overflow-hidden shadow-[2px_2px_0_#000]",
        className,
      )}
    >
      <button
        onClick={() => setLang("en")}
        className={cn(
          "px-2.5 py-1 text-xs font-black transition-all duration-100",
          lang === "en"
            ? "bg-yellow-400 text-black"
            : "bg-white text-zinc-500 hover:bg-zinc-100",
        )}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <div className="w-px h-5 bg-black" />
      <button
        onClick={() => setLang("kh")}
        className={cn(
          "px-2.5 py-1 text-xs font-black transition-all duration-100",
          lang === "kh"
            ? "bg-yellow-400 text-black"
            : "bg-white text-zinc-500 hover:bg-zinc-100",
        )}
        aria-pressed={lang === "kh"}
        style={{ fontFamily: "Siemreap, sans-serif" }}
      >
        ខ្មែរ
      </button>
    </div>
  );
}
