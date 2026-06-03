"use client";
import { useState, useEffect } from "react";
import { Crown, X, Check, Bot, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import type { JWTPayload } from "@/lib/auth";

const MINI = {
  en: ["Unlimited sessions", "All 8 categories", "Suar AI unlimited", "Analytics & export"],
  kh: ["វគ្គគ្មានដែនកំណត់", "ប្រភេទទាំង ៨", "Suar AI គ្មានដែនកំណត់", "វិភាគ និងនាំចេញ"],
};

interface UpgradeFabProps {
  session?: JWTPayload | null;
}

export function UpgradeFab({ session }: UpgradeFabProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [subPlan, setSubPlan] = useState<string | null>(null);
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session || session.role !== "teacher") return;

    fetch("/api/subscriptions/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.subscription) {
          setSubPlan(d.subscription.plan);
        } else {
          setSubPlan("free");
        }
      })
      .catch(() => {
        setSubPlan("free");
      });
  }, [session]);

  const showFab = !session || (session.role === "teacher" && subPlan === "free");

  if (!mounted || dismissed || !showFab) return null;
  const price = yearly ? 2 : 3;
  const stdPrice = yearly ? 6.67 : 10;
  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">
      {expanded && (
        <div className="group relative w-72 sm:w-80 animate-[fabIn_0.28s_cubic-bezier(0.16,1,0.3,1)]">
          {/* Glow halo behind the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-[28px] bg-amber-400/20 blur-2xl opacity-70"
          />
          {/* Gradient border wrapper */}
          <div className="relative rounded-3xl p-px bg-gradient-to-b from-amber-300/60 via-amber-400/20 to-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]">
            <div className="rounded-[23px] bg-[#0b0b0b]/95 backdrop-blur-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/30 to-amber-400/5 border border-amber-400/20 flex items-center justify-center">
                    <Crown size={15} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-tight" style={kf}>
                      Teacher Pro
                    </p>
                    <p className="text-[10px] text-amber-300/70 font-semibold" style={kf}>
                      {kh ? "ការផ្ដល់ជូនមានកំណត់" : "Limited offer"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="px-4 py-3.5">
                {/* Price + billing toggle */}
                <div className="flex items-end justify-between mb-3">
                  <div className="flex flex-col">
                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-black bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
                        ${price}
                      </span>
                      <div className="flex flex-col mb-0.5">
                        <span className="line-through text-white/25 text-[11px] leading-none">
                          ${stdPrice}
                        </span>
                        <span className="text-white/40 text-[11px] leading-tight" style={kf}>
                          {kh ? "USD/ខែ" : "USD/mo"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40" style={kf}>
                      {kh ? "ប្រចាំឆ្នាំ" : "Yearly"}
                    </span>
                    <button
                      onClick={() => setYearly((v) => !v)}
                      role="switch"
                      aria-checked={yearly}
                      className={`relative w-9 h-5 rounded-full transition-all duration-300 ${
                        yearly ? "bg-amber-400" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                          yearly ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    {yearly && (
                      <span className="text-[10px] text-green-400 font-black">
                        {kh ? "-៧០%" : "-70%"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Scarcity strip */}
                <div
                  className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-gradient-to-r from-amber-400/15 to-amber-400/5 border border-amber-400/20 rounded-lg px-2.5 py-1.5 mb-3 font-semibold"
                  style={kf}
                >
                  <Sparkles size={12} className="shrink-0" />
                  {kh
                    ? "បញ្ចុះតម្លៃ ៧០% — រហូតដល់ចុងឆ្នាំ ២០២៦"
                    : "70% Off — through end of 2026"}
                </div>

                {/* Features */}
                <div className="flex flex-col gap-1.5 mb-4">
                  {(kh ? MINI.kh : MINI.en).map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        {i === 2 ? (
                          <Bot size={10} className="text-amber-400" />
                        ) : (
                          <Check size={10} className="text-green-400" />
                        )}
                      </span>
                      <span className="text-xs text-white/70" style={kf}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setExpanded(false);
                    router.push("/pricing");
                  }}
                  className="group/btn w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black rounded-xl text-sm hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transition-all flex items-center justify-center gap-1.5"
                  style={kf}
                >
                  {kh ? "មើលផែនការទាំងអស់" : "See All Plans"}
                  <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating pill trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 rounded-full bg-black/70 backdrop-blur border border-white/10 text-white/40 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="group relative flex items-center gap-2 font-black px-5 py-3 rounded-full text-sm text-black transition-all hover:scale-[1.04] active:scale-95"
          style={kf}
        >
          {/* Pulsing glow ring */}
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full bg-amber-400/40 blur-md opacity-70 group-hover:opacity-100 animate-pulse"
          />
          <span
            aria-hidden
            className={`absolute inset-0 rounded-full bg-gradient-to-r transition-all ${
              expanded
                ? "from-amber-300 to-yellow-300"
                : "from-amber-400 to-yellow-400"
            } shadow-[0_8px_30px_-4px_rgba(251,191,36,0.6)]`}
          />
          <Crown size={16} className="relative text-black" />
          <span className="relative">{kh ? "ធ្វើឱ្យប្រសើរ" : "Upgrade"}</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fabIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
