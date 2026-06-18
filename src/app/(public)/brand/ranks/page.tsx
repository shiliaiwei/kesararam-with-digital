"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PremiumRankedAvatar } from "@/components/shared/premium-ranked-avatar";
import { CautionTape } from "@/components/brand/brand-kit";
import { RANK_TIERS, type RankDivision } from "@/lib/rank-utils";
import { ArrowRight, Info, Shield, Trophy, Star, Sparkles, Award } from "lucide-react";

interface MockUser {
  username: string;
  name: string;
  points: number;
  division: RankDivision;
  avatarBg: string;
  avatarText: string;
}

export default function RanksShowcasePage() {
  // Config state
  const [showRank, setShowRank] = useState(true);
  const [showDivision, setShowDivision] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showSafety, setShowSafety] = useState(true);

  // Division progression preview state
  const [selectedPreviewRank, setSelectedPreviewRank] = useState("gold");
  const [previewDivision, setPreviewDivision] = useState<RankDivision>("IV");

  // Ranks details for showcase description cards
  const rankDetails: Record<string, { theme: string; design: string; animation: string; icon: any }> = {
    rookie: {
      theme: "Beginner road learner taking first safety steps.",
      design: "Clean black-and-white asphalt road ring, dashed center lines, flashing traffic light, caution corner stripes.",
      animation: "Traffic light cycle (Red -> Yellow -> Green) & soft dashed road line pulsing.",
      icon: Info,
    },
    rising: {
      theme: "Active road learner improving knowledge fast.",
      design: "Yellow chevron outer border, black safety lining, directional navigation chevrons.",
      animation: "Chevrons scrolling upward in a continuous loop indicating progress.",
      icon: Sparkles,
    },
    gold: {
      theme: "Warning-sign master with solid traffic knowledge.",
      design: "Golden diamond warning-sign container, hazard diagonal lines, traffic cone at the bottom corner.",
      animation: "Luxurious golden sweep gradient shine running across the diamond edges.",
      icon: Star,
    },
    platinum: {
      theme: "Official rules and road navigation champion.",
      design: "Blue informational shield layout, thin map-grid lines, pedestrian crossing sign graphic.",
      animation: "Light blue border beacon scan scanning around the shield border.",
      icon: Trophy,
    },
    diamond: {
      theme: "Expert road-safety player with precise habits.",
      design: "Glistening diamond geometry structures, bright navigation lanes, crystal stars at corners.",
      animation: "Crystal facets sparkling and bright turquoise road-lane energy pulses.",
      icon: Award,
    },
    master: {
      theme: "Highly skilled traffic-rule commander.",
      design: "Strong blue/black tactical shield, command directional arrow sign, bold white lane dashes.",
      animation: "Deep blue shield pulse aura and lane marker highlights.",
      icon: Shield,
    },
    elite: {
      theme: "High speed, fast and accurate safety response.",
      design: "Sharp purple polygon border, speed signal indicators, high-rank speed chevrons.",
      animation: "Double-time speed chevrons scrolling & warning signal pulses.",
      icon: Sparkles,
    },
    legend: {
      theme: "Trusted top guardian of safe travels.",
      design: "Golden road guardian frame, winged side accents, protective road-shield badge.",
      animation: "Golden road-lane glow and trophy shine sweep.",
      icon: CrownIcon,
    },
    highmaster: {
      theme: "Highest KWD champion of road safety.",
      design: "Crowned golden shield shape, dual asphalt curve lanes, hazard caution borders, bottom crest.",
      animation: "Golden shine sweep, crown shine, road-lane energy pulse, and premium edge shimmering.",
      icon: CrownIcon,
    },
  };

  // Mock users mapping to the 9 ranks
  const mockUsers: Record<string, MockUser> = {
    rookie: { username: "anya_l", name: "Anya", points: 25, division: "III", avatarBg: "bg-zinc-800 text-white", avatarText: "AL" },
    rising: { username: "bora_k", name: "Bora", points: 85, division: "II", avatarBg: "bg-amber-500 text-black", avatarText: "BK" },
    gold: { username: "champa_s", name: "Champa", points: 240, division: "I", avatarBg: "bg-yellow-600 text-white", avatarText: "CS" },
    platinum: { username: "dara_v", name: "Dara", points: 520, division: "III", avatarBg: "bg-blue-600 text-white", avatarText: "DV" },
    diamond: { username: "eva_p", name: "Eva", points: 950, division: "I", avatarBg: "bg-cyan-600 text-black", avatarText: "EP" },
    master: { username: "fiona_t", name: "Fiona", points: 1550, division: "II", avatarBg: "bg-indigo-600 text-white", avatarText: "FT" },
    elite: { username: "gabriel_m", name: "Gabriel", points: 2600, division: "IV", avatarBg: "bg-purple-600 text-white", avatarText: "GM" },
    legend: { username: "heng_n", name: "Heng", points: 4200, division: "III", avatarBg: "bg-amber-400 text-black", avatarText: "HN" },
    highmaster: { username: "ida_r", name: "Ida", points: 6800, division: "I", avatarBg: "bg-orange-600 text-white", avatarText: "IR" },
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-system pb-20 selection:bg-yellow-500 selection:text-black">
      {/* Top Caution Tape */}
      <CautionTape variant="chevron" height={16} />

      {/* Header */}
      <header className="border-b-3 border-black bg-white py-12 px-6 shadow-[0_4px_0_#000]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-yellow-500 text-black font-black uppercase text-[10px] tracking-wider px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                DESIGN SYSTEM
              </span>
              <span className="bg-black text-white font-mono text-[10px] tracking-wider px-2 py-0.5">
                v2.0
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Rank-Frames & Badges
            </h1>
            <p className="mt-2 text-sm text-zinc-600 max-w-xl leading-relaxed">
              Design specifications for KWD's premium road-safety reward system. Every rank features an animated avatar border, progress divisions, and status signaling badges.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/brand" 
              className="px-4 py-2 border-2 border-black bg-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all"
            >
              ← Brand Guidelines
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="border-3 border-black bg-white p-5 shadow-[4px_4px_0_#000] rounded-none">
            <h2 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4">
              Toggle Badges
            </h2>
            <div className="space-y-3">
              {[
                { label: "Rank Badge", checked: showRank, set: setShowRank },
                { label: "Division Badge", checked: showDivision, set: setShowDivision },
                { label: "Points Chip", checked: showPoints, set: setShowPoints },
                { label: "Safety Icon", checked: showSafety, set: setShowSafety },
              ].map((ctrl) => (
                <label key={ctrl.label} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={ctrl.checked} 
                    onChange={(e) => ctrl.set(e.target.checked)} 
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-all rounded-none ${
                    ctrl.checked ? "bg-yellow-500 shadow-[1px_1px_0_#000]" : "bg-white"
                  }`}>
                    {ctrl.checked && <span className="text-xs font-black">✓</span>}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider group-hover:text-zinc-600">
                    {ctrl.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-3 border-black bg-white p-5 shadow-[4px_4px_0_#000] rounded-none">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4">
              Division Progression
            </h3>
            <p className="text-xs text-zinc-500 mb-4 leading-normal">
              Players climb divisions (IV to I) inside each tier before achieving a Rank Up.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  Select Rank
                </label>
                <select 
                  value={selectedPreviewRank}
                  onChange={(e) => setSelectedPreviewRank(e.target.value)}
                  className="w-full text-xs font-bold uppercase tracking-wider border-2 border-black p-1.5 bg-white shadow-[2px_2px_0_#000] outline-none"
                >
                  {RANK_TIERS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  Preview Division
                </label>
                <div className="grid grid-cols-4 border-2 border-black shadow-[2px_2px_0_#000]">
                  {(["IV", "III", "II", "I"] as RankDivision[]).map((div) => (
                    <button
                      key={div}
                      onClick={() => setPreviewDivision(div)}
                      className={`py-1.5 text-xs font-mono font-bold transition-all ${
                        previewDivision === div 
                          ? "bg-yellow-500 text-black font-black" 
                          : "bg-white text-zinc-500 hover:bg-zinc-100"
                      }`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center p-6 border-2 border-dashed border-zinc-300 bg-zinc-50 mt-2">
                <PremiumRankedAvatar 
                  lifetimePoints={
                    RANK_TIERS.find((t) => t.id === selectedPreviewRank)?.minPoints ?? 0
                  }
                  rankIdOverride={selectedPreviewRank}
                  divisionOverride={previewDivision}
                  size={76}
                  username={mockUsers[selectedPreviewRank]?.username ?? "user"}
                  showRankBadge={showRank}
                  showDivisionBadge={showDivision}
                  showPointsBadge={showPoints}
                  showSafetyBadge={showSafety}
                  interactive={false}
                >
                  <div className={`w-full h-full ${mockUsers[selectedPreviewRank]?.avatarBg ?? "bg-zinc-300"} flex items-center justify-center text-lg font-black`}>
                    {mockUsers[selectedPreviewRank]?.avatarText ?? "US"}
                  </div>
                </PremiumRankedAvatar>
              </div>
            </div>
          </div>
        </aside>

        {/* 3x3 Grid Showcase */}
        <main className="lg:col-span-3 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RANK_TIERS.map((tier) => {
              const mock = mockUsers[tier.id] || { username: "user", name: "User", points: tier.minPoints, division: "I", avatarBg: "bg-zinc-300", avatarText: "US" };
              const details = rankDetails[tier.id] || { theme: "", design: "", animation: "", icon: Info };
              const IconComp = details.icon;

              return (
                <div 
                  key={tier.id}
                  className="border-3 border-black bg-white flex flex-col shadow-[4px_4px_0_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] transition-all"
                >
                  {/* Card Header (Brutalist style banner) */}
                  <div className="border-b-3 border-black p-3 flex items-center justify-between bg-zinc-50">
                    <div className="flex items-center gap-1.5">
                      <IconComp size={16} className="text-black stroke-[2.5]" />
                      <span className="font-black uppercase tracking-wider text-xs">{tier.label}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5">
                      {tier.minPoints === 0 ? "START" : `${tier.minPoints} PTS`}
                    </span>
                  </div>

                  {/* Avatar Frame Display */}
                  <div className="py-8 flex justify-center items-center bg-zinc-50/50 border-b-2 border-dashed border-zinc-200">
                    <PremiumRankedAvatar 
                      lifetimePoints={tier.minPoints}
                      rankIdOverride={tier.id}
                      divisionOverride={mock.division}
                      size={80}
                      username={mock.username}
                      showRankBadge={showRank}
                      showDivisionBadge={showDivision}
                      showPointsBadge={showPoints}
                      showSafetyBadge={showSafety}
                      interactive={true}
                    >
                      <div className={`w-full h-full ${mock.avatarBg} flex items-center justify-center text-xl font-black`}>
                        {mock.avatarText}
                      </div>
                    </PremiumRankedAvatar>
                  </div>

                  {/* Descriptions */}
                  <div className="p-4 flex-1 flex flex-col gap-3 text-xs leading-normal">
                    <div>
                      <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-wider">Theme & Role</span>
                      <p className="font-semibold text-zinc-800">{details.theme}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-wider">Avatar Border Design</span>
                      <p className="text-zinc-600">{details.design}</p>
                    </div>
                    <div className="border-t border-dashed border-zinc-200 pt-2 mt-auto">
                      <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-wider">Animation Motion</span>
                      <p className="text-zinc-500 font-medium italic">{details.animation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Division progression visual card */}
          <div className="border-3 border-black bg-white p-6 shadow-[4px_4px_0_#000]">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4">
              Division Progression Order
            </h3>
            <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
              Inside each main rank (e.g. Platinum), players progress through four divisions. They start at division IV (lowest) and climb to division I (highest) before unlocking the next rank.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              {[
                { label: "Gold IV", desc: "Starter Division", badge: "IV" },
                { label: "Gold III", desc: "Improving Learner", badge: "III" },
                { label: "Gold II", desc: "Advanced Learner", badge: "II" },
                { label: "Gold I", desc: "Highest Division", badge: "I" },
              ].map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center text-center p-3 border-2 border-black bg-zinc-50 w-36 shadow-[2px_2px_0_#000]">
                    <div className="font-mono font-black text-sm w-8 h-8 rounded-full border-2 border-black bg-yellow-500 text-black flex items-center justify-center mb-2 shadow-[1px_1px_0_#000]">
                      {step.badge}
                    </div>
                    <span className="font-black text-xs uppercase tracking-wide">{step.label}</span>
                    <span className="text-[10px] text-zinc-500 mt-1">{step.desc}</span>
                  </div>
                  {idx < 3 && (
                    <div className="text-zinc-400 rotate-90 md:rotate-0">
                      <ArrowRight size={20} className="stroke-[3]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div className="text-zinc-400 rotate-90 md:rotate-0">
                <ArrowRight size={20} className="stroke-[3]" />
              </div>
              <div className="flex flex-col items-center text-center p-3 border-2 border-black bg-black text-white w-36 shadow-[2px_2px_0_#fff]">
                <div className="font-mono font-black text-sm w-8 h-8 rounded-full border-2 border-white bg-blue-500 text-white flex items-center justify-center mb-2 shadow-[1px_1px_0_#fff]">
                  IV
                </div>
                <span className="font-black text-xs uppercase tracking-wide">Platinum IV</span>
                <span className="text-[10px] text-yellow-500 mt-1 font-bold">RANK UP!</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Premium Road Base Footer Decoration */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="border-3 border-black bg-zinc-900 h-20 relative overflow-hidden shadow-[4px_4px_0_#000] flex items-center justify-center">
          {/* Dashed Road Lanes */}
          <div className="w-full h-1 border-t-2 border-dashed border-white opacity-40 absolute top-1/2 -translate-y-1/2" />
          
          {/* Warning chevrons decoration at road edges */}
          <div className="absolute left-4 top-2 bottom-2 w-8 bg-yellow-500 border border-black rotate-12 flex flex-col justify-between overflow-hidden">
            <div className="h-full bg-repeating-linear-gradient w-full caution-tape" style={{ background: "repeating-linear-gradient(45deg, #eab308, #eab308 6px, #000 6px, #000 12px)" }} />
          </div>
          <div className="absolute right-4 top-2 bottom-2 w-8 bg-yellow-500 border border-black -rotate-12 flex flex-col justify-between overflow-hidden">
            <div className="h-full bg-repeating-linear-gradient w-full caution-tape" style={{ background: "repeating-linear-gradient(45deg, #eab308, #eab308 6px, #000 6px, #000 12px)" }} />
          </div>

          <div className="z-10 text-center text-white">
            <span className="font-black uppercase tracking-widest text-xs text-yellow-400 block mb-1">
              Kesararam With Digital
            </span>
            <span className="font-mono text-[9px] text-zinc-400">
              SAFE ROADS · SMART CHOICES · LEARNING THROUGH QUIZZES
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal placeholder component for CrownIcon
function CrownIcon({ size = 16, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M3 20h18" />
    </svg>
  );
}
