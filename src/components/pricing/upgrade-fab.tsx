"use client";

import { useState } from "react";
import { Crown, X } from "lucide-react";
import { UpgradeModal } from "./upgrade-modal";
import { useLang } from "@/context/lang-context";

/**
 * Floating Action Button — shows upgrade modal.
 * Drop this in any layout to give users a persistent upgrade entry point.
 */
export function UpgradeFab() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  if (dismissed) return null;

  return (
    <>
      <UpgradeModal open={open} onClose={() => setOpen(false)} lang={lang} />

      {/* Floating pill */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 rounded-full bg-black/60 text-white/60 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>

        {/* Main FAB */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-amber-400 text-black font-black px-4 py-3 rounded-full border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 text-sm"
          style={khFont}
        >
          <Crown size={16} />
          <span>{kh ? "ធ្វើឱ្យប្រសើរឡើង" : "Upgrade"}</span>
          {/* Scarcity pulse dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </button>
      </div>
    </>
  );
}
