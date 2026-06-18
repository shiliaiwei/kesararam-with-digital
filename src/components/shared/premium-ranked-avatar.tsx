"use client";

import React from "react";
import { getRank, getDivision, type RankTier } from "@/lib/rank-utils";
import { ShieldCheck } from "lucide-react";

export interface PremiumRankedAvatarProps {
  lifetimePoints: number;
  size?: number; // Size of the circular avatar image in pixels (default: 80)
  avatarUrl?: string | null;
  username?: string;
  rankIdOverride?: string;
  divisionOverride?: "I" | "II" | "III" | "IV";
  showRankBadge?: boolean;
  showDivisionBadge?: boolean;
  showPointsBadge?: boolean;
  showSafetyBadge?: boolean;
  interactive?: boolean;
  children?: React.ReactNode;
}

// Custom animations injected once via a stylesheet.
const PREMIUM_AVATAR_KEYFRAMES = `
  @keyframes kwd-traffic-red {
    0%, 33% { fill: #ef4444; filter: drop-shadow(0 0 2px #ef4444); }
    34%, 100% { fill: #450a0a; filter: none; }
  }
  @keyframes kwd-traffic-yellow {
    0%, 33% { fill: #713f12; filter: none; }
    34%, 66% { fill: #eab308; filter: drop-shadow(0 0 2px #eab308); }
    67%, 100% { fill: #713f12; filter: none; }
  }
  @keyframes kwd-traffic-green {
    0%, 66% { fill: #064e3b; filter: none; }
    67%, 100% { fill: #22c55e; filter: drop-shadow(0 0 2px #22c55e); }
  }
  @keyframes kwd-chevron-scroll {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -20; }
  }
  @keyframes kwd-chevron-scroll-fast {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -40; }
  }
  @keyframes kwd-gold-shine {
    0% { stop-color: #ffd700; }
    50% { stop-color: #ffffff; }
    100% { stop-color: #ffd700; }
  }
  @keyframes kwd-platinum-scan {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 360; }
  }
  @keyframes kwd-diamond-sparkle {
    0%, 100% { opacity: 0.4; transform: scale(0.95) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.1) rotate(180deg); }
  }
  @keyframes kwd-master-pulse {
    0%, 100% { filter: drop-shadow(0 0 2px rgba(37, 99, 235, 0.4)); }
    50% { filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.85)); }
  }
  @keyframes kwd-elite-pulse {
    0%, 100% { filter: drop-shadow(0 0 3px rgba(168, 85, 247, 0.4)); }
    50% { filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.8)); }
  }
  @keyframes kwd-legend-glow {
    0%, 100% { opacity: 0.7; filter: drop-shadow(0 0 3px #ffd700); }
    50% { opacity: 1; filter: drop-shadow(0 0 12px #ffd700); }
  }
  @keyframes kwd-highmaster-sweep {
    0% { stop-color: #78350f; }
    50% { stop-color: #ffffff; }
    100% { stop-color: #78350f; }
  }
  @keyframes kwd-highmaster-glow {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5)); }
    50% { filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.95)); }
  }
  @keyframes kwd-badge-shine {
    0% { left: -100%; }
    20% { left: 100%; }
    100% { left: 100%; }
  }
  @keyframes kwd-road-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .kwd-shine-element {
    position: relative;
    overflow: hidden;
  }
  .kwd-shine-element::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    transform: skewX(-20deg);
    animation: kwd-badge-shine 3s ease-in-out infinite;
  }
`;

export function PremiumRankedAvatar({
  lifetimePoints,
  size = 80,
  avatarUrl,
  username = "User",
  rankIdOverride,
  divisionOverride,
  showRankBadge = true,
  showDivisionBadge = true,
  showPointsBadge = true,
  showSafetyBadge = true,
  interactive = true,
  children,
}: PremiumRankedAvatarProps) {
  // 1. Resolve Rank and Division
  const calculatedRank = getRank(lifetimePoints);
  const rank = rankIdOverride 
    ? (calculatedRank.id === rankIdOverride ? calculatedRank : { 
        id: rankIdOverride,
        label: rankIdOverride.toUpperCase(),
        labelKh: rankIdOverride,
        emoji: "⭐",
        minPoints: rankIdOverride === "rookie" ? 0 : rankIdOverride === "rising" || rankIdOverride === "debut" ? 50 : rankIdOverride === "gold" ? 150 : rankIdOverride === "platinum" ? 350 : rankIdOverride === "diamond" ? 700 : rankIdOverride === "master" ? 1200 : rankIdOverride === "elite" ? 2000 : rankIdOverride === "legend" ? 3000 : 5000,
        labelGradient: "",
        borderGradient: "",
        accent: rankIdOverride === "rookie" ? "#71717a" : rankIdOverride === "rising" || rankIdOverride === "debut" || rankIdOverride === "gold" ? "#eab308" : rankIdOverride === "platinum" ? "#3b82f6" : rankIdOverride === "diamond" ? "#06b6d4" : rankIdOverride === "master" ? "#2563eb" : rankIdOverride === "elite" ? "#a855f7" : "#ffd700",
        glow: "#fff",
        animated: true,
        textColor: "#000",
        textDark: "#000"
      } as RankTier)
    : calculatedRank;

  const division = divisionOverride || getDivision(lifetimePoints);

  // Map display labels and points per tier
  const tierConfigs: Record<string, { label: string; pointsLabel: string; color: string; badgeBg: string }> = {
    rookie: { label: "ROOKIE", pointsLabel: "START NOW", color: "#71717a", badgeBg: "bg-zinc-100 text-zinc-800" },
    rising: { label: "RISING", pointsLabel: "50 PTS", color: "#eab308", badgeBg: "bg-yellow-500 text-black" },
    debut: { label: "RISING", pointsLabel: "50 PTS", color: "#eab308", badgeBg: "bg-yellow-500 text-black" }, // alias
    gold: { label: "GOLD", pointsLabel: "150 PTS", color: "#eab308", badgeBg: "bg-yellow-500 text-black" },
    platinum: { label: "PLATINUM", pointsLabel: "350 PTS", color: "#3b82f6", badgeBg: "bg-blue-600 text-white" },
    diamond: { label: "DIAMOND", pointsLabel: "700 PTS", color: "#06b6d4", badgeBg: "bg-cyan-500 text-black" },
    master: { label: "MASTER", pointsLabel: "1200 PTS", color: "#2563eb", badgeBg: "bg-blue-700 text-white" },
    elite: { label: "ELITE", pointsLabel: "2000 PTS", color: "#a855f7", badgeBg: "bg-purple-600 text-white" },
    legend: { label: "LEGEND", pointsLabel: "3000 PTS", color: "#ffd700", badgeBg: "bg-amber-400 text-black" },
    highmaster: { label: "HIGHMASTER", pointsLabel: "5000 PTS", color: "#fbbf24", badgeBg: "bg-yellow-600 text-white" },
    mythic: { label: "HIGHMASTER", pointsLabel: "5000 PTS", color: "#fbbf24", badgeBg: "bg-yellow-600 text-white" }, // alias
  };

  const currentConfig = tierConfigs[rank.id] || tierConfigs.rookie;

  // Sizing Calculations
  const avatarRadius = size / 2;
  const framePadding = 24; // spacing around the avatar for the frames/decorations
  const outerSize = size + framePadding * 2;
  const center = outerSize / 2;

  // SVG Clip ID to keep image completely circular and clean
  const clipId = `avatar-clip-${rank.id}-${lifetimePoints}`;

  return (
    <>
      <style>{PREMIUM_AVATAR_KEYFRAMES}</style>
      <div 
        className={`relative inline-flex items-center justify-center font-system select-none ${
          interactive ? "hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 cursor-pointer" : ""
        }`}
        style={{ width: outerSize, height: outerSize }}
      >
        
        {/* ================= BACKGROUND EFFECT / GLOWS ================= */}
        {rank.id === "highmaster" && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size + 20,
              height: size + 20,
              background: "rgba(251, 191, 36, 0.25)",
              filter: "blur(8px)",
              animation: "kwd-highmaster-glow 3s ease-in-out infinite",
            }}
          />
        )}
        {rank.id === "legend" && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size + 16,
              height: size + 16,
              background: "rgba(255, 215, 0, 0.2)",
              filter: "blur(6px)",
              animation: "kwd-legend-glow 3s ease-in-out infinite",
            }}
          />
        )}
        {rank.id === "elite" && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size + 14,
              height: size + 14,
              background: "rgba(168, 85, 247, 0.15)",
              filter: "blur(6px)",
              animation: "kwd-elite-pulse 2.5s ease-in-out infinite",
            }}
          />
        )}
        {rank.id === "master" && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size + 12,
              height: size + 12,
              background: "rgba(37, 99, 235, 0.15)",
              filter: "blur(4px)",
              animation: "kwd-master-pulse 2.5s ease-in-out infinite",
            }}
          />
        )}
        {rank.id === "diamond" && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size + 10,
              height: size + 10,
              background: "rgba(6, 182, 212, 0.15)",
              filter: "blur(4px)",
            }}
          />
        )}

        {/* ================= CORE SVG FRAME OVERLAY ================= */}
        <svg 
          width={outerSize} 
          height={outerSize} 
          viewBox={`0 0 ${outerSize} ${outerSize}`}
          className="absolute inset-0 pointer-events-none z-10"
        >
          {/* Defined assets */}
          <defs>
            <clipPath id={clipId}>
              <circle cx={center} cy={center} r={avatarRadius} />
            </clipPath>

            {/* Gold Metallic Sweep Gradient */}
            <linearGradient id={`gold-metal-${lifetimePoints}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ffffff">
                <animate 
                  attributeName="offset" 
                  values="0;1;0" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
              </stop>
              <stop offset="65%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Diamond Crystal Gradient */}
            <linearGradient id={`diamond-crystal-${lifetimePoints}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            
            {/* Highmaster Gradient */}
            <linearGradient id={`highmaster-gold-${lifetimePoints}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* ----------------- 1. ROOKIE FRAME ----------------- */}
          {rank.id === "rookie" && (
            <g>
              {/* Asphalt Road Ring */}
              <circle 
                cx={center} 
                cy={center} 
                r={avatarRadius + 5} 
                fill="none" 
                stroke="#27272a" 
                strokeWidth={7} 
              />
              {/* White Dashed Road Lines */}
              <circle 
                cx={center} 
                cy={center} 
                r={avatarRadius + 5} 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth={1.2} 
                strokeDasharray="4 5" 
                style={{ animation: "kwd-road-pulse 2s infinite" }}
              />
              {/* Thin Black outer border */}
              <circle 
                cx={center} 
                cy={center} 
                r={avatarRadius + 8.5} 
                fill="none" 
                stroke="#000000" 
                strokeWidth={2} 
              />
              {/* Caution stripe corner accents */}
              <path 
                d={`M ${center - avatarRadius - 10} ${center - avatarRadius} L ${center - avatarRadius} ${center - avatarRadius - 10}`} 
                stroke="#eab308" 
                strokeWidth={3} 
              />
              <path 
                d={`M ${center - avatarRadius - 13} ${center - avatarRadius - 3} L ${center - avatarRadius - 3} ${center - avatarRadius - 13}`} 
                stroke="#000000" 
                strokeWidth={2} 
              />
              
              {/* Traffic Light decoration */}
              <g transform={`translate(${center + avatarRadius - 8}, ${center - avatarRadius - 14})`}>
                <rect x={0} y={0} width={12} height={28} rx={4} fill="#000000" stroke="#ffffff" strokeWidth={1.5} />
                <circle cx={6} cy={6} r={2.5} style={{ animation: "kwd-traffic-red 3s infinite" }} />
                <circle cx={6} cy={14} r={2.5} style={{ animation: "kwd-traffic-yellow 3s infinite" }} />
                <circle cx={6} cy={22} r={2.5} style={{ animation: "kwd-traffic-green 3s infinite" }} />
              </g>
            </g>
          )}

          {/* ----------------- 2. RISING FRAME ----------------- */}
          {(rank.id === "rising" || rank.id === "debut") && (
            <g>
              {/* Yellow Frame Outer Base */}
              <rect 
                x={center - avatarRadius - 7} 
                y={center - avatarRadius - 7} 
                width={size + 14} 
                height={size + 14} 
                rx={6} 
                fill="none" 
                stroke="#eab308" 
                strokeWidth={8} 
              />
              {/* Animated Black Scrolling Lane Markers / Chevrons */}
              <rect 
                x={center - avatarRadius - 7} 
                y={center - avatarRadius - 7} 
                width={size + 14} 
                height={size + 14} 
                rx={6} 
                fill="none" 
                stroke="#000000" 
                strokeWidth={8} 
                strokeDasharray="10 12" 
                style={{ animation: "kwd-chevron-scroll 1.2s linear infinite" }}
              />
              {/* Hard outer black border */}
              <rect 
                x={center - avatarRadius - 11.5} 
                y={center - avatarRadius - 11.5} 
                width={size + 23} 
                height={size + 23} 
                rx={8} 
                fill="none" 
                stroke="#000000" 
                strokeWidth={2.5} 
              />
            </g>
          )}

          {/* ----------------- 3. GOLD FRAME ----------------- */}
          {rank.id === "gold" && (
            <g>
              {/* Golden diamond shape rotated 45deg */}
              <polygon 
                points={`
                  ${center},${center - avatarRadius - 15} 
                  ${center + avatarRadius + 15},${center} 
                  ${center},${center + avatarRadius + 15} 
                  ${center - avatarRadius - 15},${center}
                `} 
                fill="none" 
                stroke="#000000" 
                strokeWidth={9} 
                strokeLinejoin="miter" 
              />
              <polygon 
                points={`
                  ${center},${center - avatarRadius - 11} 
                  ${center + avatarRadius + 11},${center} 
                  ${center},${center + avatarRadius + 11} 
                  ${center - avatarRadius - 11},${center}
                `} 
                fill="none" 
                stroke={`url(#gold-metal-${lifetimePoints})`} 
                strokeWidth={5} 
                strokeLinejoin="miter" 
              />
              
              {/* Diamond Corner Stripes */}
              <line x1={center - 8} y1={center - avatarRadius - 7} x2={center + 8} y2={center - avatarRadius - 7} stroke="#000" strokeWidth={2} />
              <line x1={center - avatarRadius - 7} y1={center - 8} x2={center - avatarRadius - 7} y2={center + 8} stroke="#000" strokeWidth={2} />
              <line x1={center + avatarRadius + 7} y1={center - 8} x2={center + avatarRadius + 7} y2={center + 8} stroke="#000" strokeWidth={2} />

              {/* Traffic Cone at bottom right corner */}
              <g transform={`translate(${center + avatarRadius - 10}, ${center + avatarRadius - 10})`}>
                <rect x={-2} y={12} width={16} height={3} fill="#000" stroke="#000" strokeWidth={1} />
                <polygon points="6,0 -1,12 13,12" fill="#f97316" stroke="#000" strokeWidth={1.5} />
                <polygon points="6,4 2,9 10,9" fill="#ffffff" />
                <polygon points="6,4 4,7 8,7" fill="#f97316" />
              </g>
            </g>
          )}

          {/* ----------------- 4. PLATINUM FRAME ----------------- */}
          {rank.id === "platinum" && (
            <g>
              {/* Blue Shield outline */}
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 12} 
                  Q ${center + avatarRadius + 10} ${center - avatarRadius - 12} ${center + avatarRadius + 12} ${center - 8} 
                  Q ${center + avatarRadius + 12} ${center + 24} ${center} ${center + avatarRadius + 14} 
                  Q ${center - avatarRadius - 12} ${center + 24} ${center - avatarRadius - 12} ${center - 8} 
                  Q ${center - avatarRadius - 10} ${center - avatarRadius - 12} ${center} ${center - avatarRadius - 12} 
                  Z
                `}
                fill="none" 
                stroke="#000000" 
                strokeWidth={9} 
                strokeLinejoin="round" 
              />
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 12} 
                  Q ${center + avatarRadius + 10} ${center - avatarRadius - 12} ${center + avatarRadius + 12} ${center - 8} 
                  Q ${center + avatarRadius + 12} ${center + 24} ${center} ${center + avatarRadius + 14} 
                  Q ${center - avatarRadius - 12} ${center + 24} ${center - avatarRadius - 12} ${center - 8} 
                  Q ${center - avatarRadius - 10} ${center - avatarRadius - 12} ${center} ${center - avatarRadius - 12} 
                  Z
                `}
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth={5} 
                strokeLinejoin="round" 
              />
              
              {/* Map grid lines */}
              <path 
                d={`M ${center - avatarRadius - 10} ${center} L ${center + avatarRadius + 10} ${center}`} 
                stroke="#ffffff" 
                strokeWidth={1} 
                strokeDasharray="2 3" 
                opacity={0.5} 
              />
              <path 
                d={`M ${center} ${center - avatarRadius - 10} L ${center} ${center + avatarRadius + 10}`} 
                stroke="#ffffff" 
                strokeWidth={1} 
                strokeDasharray="2 3" 
                opacity={0.5} 
              />

              {/* Scanning light animation around border */}
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 12} 
                  Q ${center + avatarRadius + 10} ${center - avatarRadius - 12} ${center + avatarRadius + 12} ${center - 8} 
                  Q ${center + avatarRadius + 12} ${center + 24} ${center} ${center + avatarRadius + 14} 
                  Q ${center - avatarRadius - 12} ${center + 24} ${center - avatarRadius - 12} ${center - 8} 
                  Q ${center - avatarRadius - 10} ${center - avatarRadius - 12} ${center} ${center - avatarRadius - 12} 
                  Z
                `}
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth={2} 
                strokeDasharray="30 150" 
                strokeLinecap="round"
                style={{ animation: "kwd-platinum-scan 2.5s linear infinite" }}
              />

              {/* Pedestrian icon detail (top left) */}
              <g transform={`translate(${center - avatarRadius - 15}, ${center - avatarRadius - 12})`}>
                <rect x={0} y={0} width={12} height={12} fill="#3b82f6" stroke="#000" strokeWidth={1} />
                <path d="M 6 2.5 L 6 9.5 M 3.5 5 L 8.5 5 M 4 9 L 6 6.5 L 8 9" stroke="#fff" strokeWidth={1} />
              </g>
            </g>
          )}

          {/* ----------------- 5. DIAMOND FRAME ----------------- */}
          {rank.id === "diamond" && (
            <g>
              {/* Sharp geometric diamond outer structure */}
              <polygon 
                points={`
                  ${center},${center - avatarRadius - 14} 
                  ${center + avatarRadius + 14},${center} 
                  ${center},${center + avatarRadius + 14} 
                  ${center - avatarRadius - 14},${center}
                `} 
                fill="none" 
                stroke="#000000" 
                strokeWidth={9} 
              />
              <polygon 
                points={`
                  ${center},${center - avatarRadius - 14} 
                  ${center + avatarRadius + 14},${center} 
                  ${center},${center + avatarRadius + 14} 
                  ${center - avatarRadius - 14},${center}
                `} 
                fill="none" 
                stroke={`url(#diamond-crystal-${lifetimePoints})`} 
                strokeWidth={5} 
              />

              {/* Crystal shards at top, bottom, left, right corners */}
              <polygon points={`${center},${center - avatarRadius - 22} ${center + 8},${center - avatarRadius - 12} ${center - 8},${center - avatarRadius - 12}`} fill={`url(#diamond-crystal-${lifetimePoints})`} stroke="#000" strokeWidth={1.5} />
              <polygon points={`${center},${center + avatarRadius + 22} ${center + 8},${center + avatarRadius + 12} ${center - 8},${center + avatarRadius + 12}`} fill={`url(#diamond-crystal-${lifetimePoints})`} stroke="#000" strokeWidth={1.5} />
              <polygon points={`${center - avatarRadius - 22},${center} ${center - avatarRadius - 12},${center - 8} ${center - avatarRadius - 12},${center + 8}`} fill={`url(#diamond-crystal-${lifetimePoints})`} stroke="#000" strokeWidth={1.5} />
              <polygon points={`${center + avatarRadius + 22},${center} ${center + avatarRadius + 12},${center - 8} ${center + avatarRadius + 12},${center + 8}`} fill={`url(#diamond-crystal-${lifetimePoints})`} stroke="#000" strokeWidth={1.5} />

              {/* Sparkling diamond elements */}
              <g style={{ animation: "kwd-diamond-sparkle 3s ease-in-out infinite" }}>
                <path d={`M ${center + avatarRadius - 4} ${center - avatarRadius + 4} L ${center + avatarRadius} ${center - avatarRadius} L ${center + avatarRadius + 4} ${center - avatarRadius + 4} L ${center + avatarRadius} ${center - avatarRadius + 8} Z`} fill="#fff" stroke="#06b6d4" strokeWidth={1} />
                <path d={`M ${center - avatarRadius - 4} ${center + avatarRadius - 4} L ${center - avatarRadius} ${center + avatarRadius - 8} L ${center - avatarRadius + 4} ${center + avatarRadius - 4} L ${center - avatarRadius} ${center + avatarRadius} Z`} fill="#fff" stroke="#06b6d4" strokeWidth={1} />
              </g>
            </g>
          )}

          {/* ----------------- 6. MASTER FRAME ----------------- */}
          {rank.id === "master" && (
            <g>
              {/* Heavy shield outline with dark blue / black stripes */}
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 15} 
                  L ${center + avatarRadius + 13} ${center - avatarRadius - 10} 
                  L ${center + avatarRadius + 15} ${center + 8} 
                  Q ${center + avatarRadius + 10} ${center + avatarRadius + 10} ${center} ${center + avatarRadius + 17} 
                  Q ${center - avatarRadius - 10} ${center + avatarRadius + 10} ${center - avatarRadius - 15} ${center + 8} 
                  L ${center - avatarRadius - 13} ${center - avatarRadius - 10} 
                  Z
                `}
                fill="none" 
                stroke="#000000" 
                strokeWidth={10} 
                strokeLinejoin="round" 
              />
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 15} 
                  L ${center + avatarRadius + 13} ${center - avatarRadius - 10} 
                  L ${center + avatarRadius + 15} ${center + 8} 
                  Q ${center + avatarRadius + 10} ${center + avatarRadius + 10} ${center} ${center + avatarRadius + 17} 
                  Q ${center - avatarRadius - 10} ${center + avatarRadius + 10} ${center - avatarRadius - 15} ${center + 8} 
                  L ${center - avatarRadius - 13} ${center - avatarRadius - 10} 
                  Z
                `}
                fill="none" 
                stroke="#2563eb" 
                strokeWidth={6} 
                strokeLinejoin="round" 
              />

              {/* Bold lane marker accents inside the frame */}
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 15} 
                  L ${center + avatarRadius + 13} ${center - avatarRadius - 10} 
                  L ${center + avatarRadius + 15} ${center + 8} 
                  Q ${center + avatarRadius + 10} ${center + avatarRadius + 10} ${center} ${center + avatarRadius + 17} 
                  Q ${center - avatarRadius - 10} ${center + avatarRadius + 10} ${center - avatarRadius - 15} ${center + 8} 
                  L ${center - avatarRadius - 13} ${center - avatarRadius - 10} 
                  Z
                `}
                fill="none" 
                stroke="#ffffff" 
                strokeWidth={1.5} 
                strokeDasharray="8 8" 
                strokeLinejoin="round" 
              />

              {/* Command circle arrow sign (top left corner detail) */}
              <g transform={`translate(${center - avatarRadius - 18}, ${center - avatarRadius - 16})`}>
                <circle cx={7} cy={7} r={7} fill="#2563eb" stroke="#000" strokeWidth={1.5} />
                <path d="M 4 7 L 10 7 M 7 4 L 10 7 L 7 10" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          )}

          {/* ----------------- 7. ELITE FRAME ----------------- */}
          {rank.id === "elite" && (
            <g>
              {/* Sharp premium polygon frame */}
              <polygon 
                points={`
                  ${center},${center - avatarRadius - 16}
                  ${center + avatarRadius + 10},${center - avatarRadius - 10}
                  ${center + avatarRadius + 16},${center + 2}
                  ${center + avatarRadius + 8},${center + avatarRadius + 12}
                  ${center},${center + avatarRadius + 17}
                  ${center - avatarRadius - 8},${center + avatarRadius + 12}
                  ${center - avatarRadius - 16},${center + 2}
                  ${center - avatarRadius - 10},${center - avatarRadius - 10}
                `}
                fill="none"
                stroke="#000000"
                strokeWidth={10}
                strokeLinejoin="miter"
              />
              <polygon 
                points={`
                  ${center},${center - avatarRadius - 16}
                  ${center + avatarRadius + 10},${center - avatarRadius - 10}
                  ${center + avatarRadius + 16},${center + 2}
                  ${center + avatarRadius + 8},${center + avatarRadius + 12}
                  ${center},${center + avatarRadius + 17}
                  ${center - avatarRadius - 8},${center + avatarRadius + 12}
                  ${center - avatarRadius - 16},${center + 2}
                  ${center - avatarRadius - 10},${center - avatarRadius - 10}
                `}
                fill="none"
                stroke="#a855f7"
                strokeWidth={6}
                strokeLinejoin="miter"
              />

              {/* High speed motion chevrons along borders */}
              <polygon 
                points={`
                  ${center},${center - avatarRadius - 16}
                  ${center + avatarRadius + 10},${center - avatarRadius - 10}
                  ${center + avatarRadius + 16},${center + 2}
                  ${center + avatarRadius + 8},${center + avatarRadius + 12}
                  ${center},${center + avatarRadius + 17}
                  ${center - avatarRadius - 8},${center + avatarRadius + 12}
                  ${center - avatarRadius - 16},${center + 2}
                  ${center - avatarRadius - 10},${center - avatarRadius - 10}
                `}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.5}
                strokeDasharray="12 24"
                style={{ animation: "kwd-elite-speed 1s linear infinite" }}
              />

              {/* Mini speed signal lights on top corners */}
              <circle cx={center - avatarRadius - 6} cy={center - avatarRadius - 6} r={2.5} fill="#a855f7" stroke="#000" strokeWidth={1} />
              <circle cx={center + avatarRadius + 6} cy={center - avatarRadius - 6} r={2.5} fill="#a855f7" stroke="#000" strokeWidth={1} />
            </g>
          )}

          {/* ----------------- 8. LEGEND FRAME ----------------- */}
          {rank.id === "legend" && (
            <g>
              {/* Heroic road guardian golden frame with trophy motif */}
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 18} 
                  Q ${center + avatarRadius + 5} ${center - avatarRadius - 22} ${center + avatarRadius + 15} ${center - 10} 
                  L ${center + avatarRadius + 13} ${center + 12} 
                  Q ${center + avatarRadius} ${center + avatarRadius + 15} ${center} ${center + avatarRadius + 20} 
                  Q ${center - avatarRadius} ${center + avatarRadius + 15} ${center - avatarRadius - 13} ${center + 12} 
                  L ${center - avatarRadius - 15} ${center - 10} 
                  Q ${center - avatarRadius - 5} ${center - avatarRadius - 22} ${center} ${center - avatarRadius - 18} 
                  Z
                `}
                fill="none" 
                stroke="#000000" 
                strokeWidth={10} 
                strokeLinejoin="round" 
              />
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 18} 
                  Q ${center + avatarRadius + 5} ${center - avatarRadius - 22} ${center + avatarRadius + 15} ${center - 10} 
                  L ${center + avatarRadius + 13} ${center + 12} 
                  Q ${center + avatarRadius} ${center + avatarRadius + 15} ${center} ${center + avatarRadius + 20} 
                  Q ${center - avatarRadius} ${center + avatarRadius + 15} ${center - avatarRadius - 13} ${center + 12} 
                  L ${center - avatarRadius - 15} ${center - 10} 
                  Q ${center - avatarRadius - 5} ${center - avatarRadius - 22} ${center} ${center - avatarRadius - 18} 
                  Z
                `}
                fill="none" 
                stroke={`url(#gold-metal-${lifetimePoints})`} 
                strokeWidth={6} 
                strokeLinejoin="round" 
              />

              {/* Glowing road light accents (small circles) */}
              <circle cx={center} cy={center - avatarRadius - 11} r={3} fill="#ffffff" stroke="#000" strokeWidth={1} />
              <circle cx={center - avatarRadius - 9} cy={center + 8} r={3} fill="#ffd700" stroke="#000" strokeWidth={1} />
              <circle cx={center + avatarRadius + 9} cy={center + 8} r={3} fill="#ffd700" stroke="#000" strokeWidth={1} />

              {/* Mini safe road shield top left */}
              <g transform={`translate(${center - avatarRadius - 16}, ${center - avatarRadius - 18})`}>
                <polygon points="5,0 10,2 10,7 5,10 0,7 0,2" fill="#ffd700" stroke="#000" strokeWidth={1} />
                <path d="M 2.5 5 L 4.5 7 L 7.5 3.5" fill="none" stroke="#fff" strokeWidth={1} />
              </g>
            </g>
          )}

          {/* ----------------- 9. HIGHMASTER FRAME ----------------- */}
          {(rank.id === "highmaster" || rank.id === "mythic") && (
            <g>
              {/* Crown-like highmaster shield shape */}
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 21}
                  L ${center + 14} ${center - avatarRadius - 15}
                  L ${center + avatarRadius + 14} ${center - avatarRadius - 15}
                  L ${center + avatarRadius + 18} ${center + 4}
                  Q ${center + avatarRadius + 10} ${center + avatarRadius + 14} ${center} ${center + avatarRadius + 22}
                  Q ${center - avatarRadius - 10} ${center + avatarRadius + 14} ${center - avatarRadius - 18} ${center + 4}
                  L ${center - avatarRadius - 14} ${center - avatarRadius - 15}
                  L ${center - 14} ${center - avatarRadius - 15}
                  Z
                `}
                fill="none" 
                stroke="#000000" 
                strokeWidth={11} 
                strokeLinejoin="round" 
              />
              <path 
                d={`
                  M ${center} ${center - avatarRadius - 21}
                  L ${center + 14} ${center - avatarRadius - 15}
                  L ${center + avatarRadius + 14} ${center - avatarRadius - 15}
                  L ${center + avatarRadius + 18} ${center + 4}
                  Q ${center + avatarRadius + 10} ${center + avatarRadius + 14} ${center} ${center + avatarRadius + 22}
                  Q ${center - avatarRadius - 10} ${center + avatarRadius + 14} ${center - avatarRadius - 18} ${center + 4}
                  L ${center - avatarRadius - 14} ${center - avatarRadius - 15}
                  L ${center - 14} ${center - avatarRadius - 15}
                  Z
                `}
                fill="none" 
                stroke={`url(#gold-metal-${lifetimePoints})`} 
                strokeWidth={7} 
                strokeLinejoin="round" 
              />

              {/* Dashed Road Line pattern along the bottom curve */}
              <path 
                d={`
                  M ${center - avatarRadius - 10} ${center + 12}
                  Q ${center - avatarRadius + 4} ${center + avatarRadius + 6} ${center} ${center + avatarRadius + 13}
                  Q ${center + avatarRadius - 4} ${center + avatarRadius + 6} ${center + avatarRadius + 10} ${center + 12}
                `}
                fill="none"
                stroke="#000000"
                strokeWidth={2.5}
                strokeDasharray="4 4"
              />

              {/* Crown details at the top center */}
              <g transform={`translate(${center - 10}, ${center - avatarRadius - 32})`}>
                <polygon 
                  points="0,15 0,5 5,8 10,2 15,8 20,5 20,15" 
                  fill={`url(#highmaster-gold-${lifetimePoints})`} 
                  stroke="#000000" 
                  strokeWidth={1.8} 
                  strokeLinejoin="round"
                />
                <circle cx={0} cy={4} r={1.2} fill="#ffd700" stroke="#000" strokeWidth={0.5} />
                <circle cx={10} cy={1.5} r={1.2} fill="#ffd700" stroke="#000" strokeWidth={0.5} />
                <circle cx={20} cy={4} r={1.2} fill="#ffd700" stroke="#000" strokeWidth={0.5} />
              </g>

              {/* Bottom Shield details */}
              <g transform={`translate(${center - 6}, ${center + avatarRadius + 10})`}>
                <polygon points="6,0 12,2 12,8 6,12 0,8 0,2" fill="#ffd700" stroke="#000" strokeWidth={1} />
                <line x1={6} y1={2} x2={6} y2={10} stroke="#000" strokeWidth={1} />
              </g>
            </g>
          )}

          {/* User profile image border - thick solid black to enforce Brutalist DNA */}
          <circle 
            cx={center} 
            cy={center} 
            r={avatarRadius} 
            fill="none" 
            stroke="#000000" 
            strokeWidth={3} 
          />

          {/* ================= SVG USER PHOTO CENTER ================= */}
          <g clipPath={`url(#${clipId})`}>
            {/* The actual photo or avatar content is rendered here */}
            {avatarUrl ? (
              <foreignObject 
                x={center - avatarRadius} 
                y={center - avatarRadius} 
                width={size} 
                height={size}
              >
                <img 
                  src={avatarUrl} 
                  alt={username} 
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </foreignObject>
            ) : children ? (
              <foreignObject 
                x={center - avatarRadius} 
                y={center - avatarRadius} 
                width={size} 
                height={size}
              >
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
                  {children}
                </div>
              </foreignObject>
            ) : (
              // Fallback default avatar drawing if no children/avatarUrl passed
              <rect 
                x={center - avatarRadius} 
                y={center - avatarRadius} 
                width={size} 
                height={size} 
                fill="#f4f4f5" 
              />
            )}
          </g>

        </svg>

        {/* ================= OVERLAY PROFILE BADGES (HTML) ================= */}

        {/* 1. Main Rank Text Badge (Bottom Center) */}
        {showRankBadge && (
          <div 
            className="absolute bottom-1 z-20 font-black uppercase tracking-wider text-[9px] px-2 py-0.5 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_#000] rounded-none kwd-shine-element"
            style={{ 
              borderColor: "#000",
              color: currentConfig.color === "#eab308" ? "#854d0e" : currentConfig.color,
            }}
          >
            {currentConfig.label}
          </div>
        )}

        {/* 2. Roman Numeral Division Badge (Top Right Corner) */}
        {showDivisionBadge && (
          <div 
            className="absolute top-1.5 right-1.5 z-20 font-mono font-black text-xs w-6 h-6 flex items-center justify-center border-2 border-black bg-yellow-500 text-black shadow-[1.5px_1.5px_0px_#000] rotate-12 rounded-none"
            style={{
              animation: "kwd-road-pulse 2s infinite"
            }}
            title={`${currentConfig.label} Division ${division}`}
          >
            {division}
          </div>
        )}

        {/* 3. Special Role / Safety Shield Icon Badge (Middle Left Edge) */}
        {showSafetyBadge && (
          <div 
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 flex items-center justify-center border-2 border-black bg-green-500 text-white shadow-[1.5px_1.5px_0px_#000] -rotate-12 rounded-none"
            title="Safe Travel Champion"
          >
            <ShieldCheck size={14} strokeWidth={2.5} />
          </div>
        )}

        {/* 4. Points Label Badge (Under Rank Badge) */}
        {showPointsBadge && (
          <div 
            className="absolute -bottom-4.5 z-20 font-mono font-bold text-[8px] px-1.5 py-0.25 border border-black bg-black text-white rounded-none"
            style={{
              animation: "kwd-road-pulse 3s infinite"
            }}
          >
            {currentConfig.pointsLabel}
          </div>
        )}

      </div>
    </>
  );
}
