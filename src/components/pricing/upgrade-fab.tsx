"use client";
import { useState, useEffect } from "react";
import { Crown, X, Check, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import type { JWTPayload } from "@/lib/auth";

const MINI = { en: ["Unlimited sessions","All 8 categories","Suar AI unlimited","Analytics & export"], kh: ["វគ្គគ្មានដែនកំណត់","ប្រភេទទាំង ៨","Suar AI គ្មានដែនកំណត់","វិភាគ និងនាំចេញ"] };

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
  const price = yearly ? 3.75 : 5;
  const stdPrice = yearly ? 7.5 : 10;
  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2">
      {expanded && (
        <div className="w-72 sm:w-80 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/15 flex items-center justify-center"><Crown size={14} className="text-amber-400" /></div>
              <div><p className="text-sm font-black text-white" style={kf}>Teacher Pro</p><p className="text-[10px] text-white/35" style={kf}>{kh?"ការផ្ដល់ជូនមានកំណត់":"Limited offer"}</p></div>
            </div>
            <button onClick={() => setExpanded(false)} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/40 hover:text-white transition-colors"><X size={12} /></button>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">${price}</span>
                <span className="text-white/35 text-xs mb-1" style={kf}>{kh?"USD/ខែ":"USD/mo"}</span>
                <span className="line-through text-white/20 text-xs ml-1 mb-0.5">${stdPrice}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/40" style={kf}>{kh?"ប្រចាំឆ្នាំ":"Yearly"}</span>
                <button onClick={() => setYearly(v => !v)} role="switch" aria-checked={yearly} className={`relative w-9 h-5 rounded-full transition-all duration-300 ${yearly?"bg-amber-400":"bg-white/20"}`}><span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${yearly?"translate-x-4":"translate-x-0"}`} /></button>
                {yearly && <span className="text-[10px] text-green-400 font-bold">{kh ? "-២៥%" : "-25%"}</span>}
              </div>
            </div>
            <div className="text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2.5 py-1.5 mb-3 font-semibold" style={kf}>🔥 {kh?"បញ្ចុះតម្លៃ ៥០% — ការផ្ដល់ជូនរហូតដល់ចុងឆ្នាំ ២០២៦":"50% Off — Limited Offer through 2026"}</div>
            <div className="flex flex-col gap-1.5 mb-4">
              {(kh?MINI.kh:MINI.en).map((f,i) => (
                <div key={i} className="flex items-center gap-2">
                  {i===2?<Bot size={11} className="text-amber-400 shrink-0"/>:<Check size={11} className="text-green-400 shrink-0"/>}
                  <span className="text-xs text-white/65" style={kf}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setExpanded(false); router.push("/pricing"); }} className="w-full py-2.5 bg-amber-400 text-black font-black rounded-xl text-sm hover:bg-amber-300 transition-all" style={kf}>{kh?"មើលផែនការទាំងអស់":"See All Plans"}</button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button onClick={() => setDismissed(true)} className="w-7 h-7 rounded-full bg-black/70 border border-white/10 text-white/40 hover:text-white flex items-center justify-center transition-colors" aria-label="Dismiss"><X size={12} /></button>
        <button onClick={() => setExpanded(v => !v)} className={`flex items-center gap-2 font-black px-4 py-2.5 rounded-full border-2 border-black text-sm transition-all shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 ${expanded?"bg-amber-300":"bg-amber-400"}`} style={kf}>
          <Crown size={15} className="text-black" />
          <span className="text-black">{kh?"ធ្វើឱ្យប្រសើរ":"Upgrade"}</span>
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"/></span>
        </button>
      </div>
    </div>
  );
}
