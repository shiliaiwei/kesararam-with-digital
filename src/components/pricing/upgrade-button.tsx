"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { UpgradeModal } from "./upgrade-modal";

interface UpgradeButtonProps {
  /** Which locked feature triggered this */
  trigger?: string;
  lang?: "en" | "kh";
  /** Custom label */
  label?: string;
  className?: string;
  /** Variant: banner shows inline, button shows a CTA button */
  variant?: "button" | "banner" | "inline";
}

export function UpgradeButton({
  trigger,
  lang = "en",
  label,
  className = "",
  variant = "button",
}: UpgradeButtonProps) {
  const [open, setOpen] = useState(false);
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const defaultLabel = kh ? "ធ្វើឱ្យប្រសើរឡើង" : "Upgrade Plan";

  if (variant === "banner") {
    return (
      <>
        <div
          className={`flex items-center justify-between gap-3 bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-400/15 transition-colors ${className}`}
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-amber-400 shrink-0" />
            <span className="text-sm font-bold text-amber-300" style={khFont}>
              {label ?? (kh ? "ធ្វើឱ្យប្រសើរឡើងដើម្បីបើកដោះស្រាយមុខងារនេះ" : "Upgrade to unlock this feature")}
            </span>
          </div>
          <span className="text-xs bg-amber-400 text-black font-black px-2.5 py-1 rounded-full whitespace-nowrap" style={khFont}>
            {kh ? "មើលផែនការ" : "See Plans"}
          </span>
        </div>
        <UpgradeModal open={open} onClose={() => setOpen(false)} trigger={trigger} lang={lang} />
      </>
    );
  }

  if (variant === "inline") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs font-bold underline underline-offset-2 transition-colors ${className}`}
          style={khFont}
        >
          <Crown size={12} />
          {label ?? defaultLabel}
        </button>
        <UpgradeModal open={open} onClose={() => setOpen(false)} trigger={trigger} lang={lang} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 bg-amber-400 text-black font-black px-4 py-2.5 rounded-xl hover:bg-amber-300 transition-all text-sm ${className}`}
        style={khFont}
      >
        <Crown size={15} />
        {label ?? defaultLabel}
      </button>
      <UpgradeModal open={open} onClose={() => setOpen(false)} trigger={trigger} lang={lang} />
    </>
  );
}
