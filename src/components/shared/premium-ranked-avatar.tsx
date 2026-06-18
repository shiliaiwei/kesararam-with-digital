"use client";

import React from "react";
import { getRank, getDivision, type RankTier } from "@/lib/rank-utils";
import { ShieldCheck } from "lucide-react";

export interface PremiumRankedAvatarProps {
  lifetimePoints: number;
  size?: number; // Size of the circular avatar image in pixels (default: 80)
  framePadding?: number; // Spacing around the avatar for the frames/decorations
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
  @keyframes kwd-highmaster-glow {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4)); }
    50% { filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.9)); }
  }
  @keyframes kwd-legend-glow {
    0%, 100% { filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.35)); }
    50% { filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8)); }
  }
  @keyframes kwd-elite-pulse {
    0%, 100% { filter: drop-shadow(0 0 3px rgba(168, 85, 247, 0.3)); }
    50% { filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.7)); }
  }
  @keyframes kwd-master-pulse {
    0%, 100% { filter: drop-shadow(0 0 2px rgba(37, 99, 235, 0.3)); }
    50% { filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.7)); }
  }
`;

export function PremiumRankedAvatar({
  lifetimePoints,
  size = 80,
  framePadding = 24,
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
        emoji: "",
        minPoints: rankIdOverride === "rookie" ? 0 : rankIdOverride === "rising" || rankIdOverride === "debut" ? 1000 : rankIdOverride === "gold" ? 2500 : rankIdOverride === "platinum" ? 3500 : rankIdOverride === "diamond" ? 7000 : 12000,
        labelGradient: "",
        borderGradient: "",
        accent: rankIdOverride === "rookie" || rankIdOverride === "gold" ? "#eab308" : rankIdOverride === "rising" || rankIdOverride === "debut" ? "#22c55e" : rankIdOverride === "platinum" ? "#3b82f6" : rankIdOverride === "diamond" ? "#06b6d4" : "#a855f7",
        glow: "#fff",
        animated: true,
        textColor: "#000",
        textDark: "#000"
      } as RankTier)
    : calculatedRank;

  const division = divisionOverride || getDivision(lifetimePoints);

  // Map display labels and points per tier
  const tierConfigs: Record<string, { label: string; pointsLabel: string; color: string; badgeBg: string }> = {
    rookie: { label: "ROOKIE", pointsLabel: "0 PTS", color: "#eab308", badgeBg: "bg-yellow-500 text-black" },
    rising: { label: "RISING", pointsLabel: "1,000 PTS", color: "#22c55e", badgeBg: "bg-green-500 text-black" },
    debut: { label: "RISING", pointsLabel: "1,000 PTS", color: "#22c55e", badgeBg: "bg-green-500 text-black" }, // legacy alias
    gold: { label: "GOLD", pointsLabel: "2,500 PTS", color: "#eab308", badgeBg: "bg-yellow-500 text-black" },
    platinum: { label: "PLATINUM", pointsLabel: "3,500 PTS", color: "#3b82f6", badgeBg: "bg-blue-600 text-white" },
    diamond: { label: "DIAMOND", pointsLabel: "7,000 PTS", color: "#06b6d4", badgeBg: "bg-cyan-500 text-black" },
    master: { label: "MYTHIC", pointsLabel: "12,000 PTS", color: "#a855f7", badgeBg: "bg-purple-600 text-white" }, // legacy alias
    elite: { label: "MYTHIC", pointsLabel: "12,000 PTS", color: "#a855f7", badgeBg: "bg-purple-600 text-white" }, // legacy alias
    legend: { label: "MYTHIC", pointsLabel: "12,000 PTS", color: "#a855f7", badgeBg: "bg-purple-600 text-white" }, // legacy alias
    highmaster: { label: "MYTHIC", pointsLabel: "12,000 PTS", color: "#a855f7", badgeBg: "bg-purple-600 text-white" }, // legacy alias
    mythic: { label: "MYTHIC", pointsLabel: "12,000 PTS", color: "#a855f7", badgeBg: "bg-purple-600 text-white" },
  };

  const currentConfig = tierConfigs[rank.id] || tierConfigs.rookie;

  // Sizing Calculations
  const avatarRadius = size / 2;
  const outerSize = size + framePadding * 2;
  const center = outerSize / 2;

  // Scale factor: aligns all offsets and stroke weights to the selected size
  const scale = size / 80;

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
        {(rank.id === "highmaster" || rank.id === "mythic") && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size + 22 * scale,
              height: size + 22 * scale,
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
              width: size + 18 * scale,
              height: size + 18 * scale,
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
              width: size + 16 * scale,
              height: size + 16 * scale,
              background: "rgba(168, 85, 247, 0.15)",
              filter: "blur(5px)",
              animation: "kwd-elite-pulse 2.5s ease-in-out infinite",
            }}
          />
        )}
        {rank.id === "master" && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size + 14 * scale,
              height: size + 14 * scale,
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
              width: size + 12 * scale,
              height: size + 12 * scale,
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

            {/* Rookie Card clipping to prevent diagonal stripes bleed */}
            <clipPath id={`rookie-clip-${lifetimePoints}`}>
              <rect
                x={center - avatarRadius - 10 * scale}
                y={center - avatarRadius - 10 * scale}
                width={size + 20 * scale}
                height={size + 20 * scale}
                rx={8 * scale}
              />
            </clipPath>

            {/* Rising Card clipping */}
            <clipPath id={`rising-clip-${lifetimePoints}`}>
              <rect
                x={center - avatarRadius - 10 * scale}
                y={center - avatarRadius - 10 * scale}
                width={size + 20 * scale}
                height={size + 20 * scale}
                rx={6 * scale}
              />
            </clipPath>

            {/* Repeating stripes pattern for caution borders */}
            <pattern 
              id={`caution-stripes-${lifetimePoints}`} 
              width={16 * scale} 
              height={16 * scale} 
              patternUnits="userSpaceOnUse" 
              patternTransform="rotate(45)"
            >
              <rect width={8 * scale} height={16 * scale} fill="#eab308" />
              <rect x={8 * scale} width={8 * scale} height={16 * scale} fill="#000000" />
              <animate attributeName="x" from={0} to={16 * scale} dur="1.5s" repeatCount="indefinite" />
            </pattern>

            {/* Gold Metallic Sweep Gradient */}
            <linearGradient id={`gold-metal-${lifetimePoints}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ffffff">
                <animate 
                  attributeName="offset" 
                  values="0;1;0" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </stop>
              <stop offset="65%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Platinum Scan Gradient */}
            <linearGradient id={`platinum-scan-${lifetimePoints}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#ffffff">
                <animate 
                  attributeName="offset" 
                  values="0;1;0" 
                  dur="2.5s" 
                  repeatCount="indefinite" 
                />
              </stop>
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Diamond Crystal Gradient */}
            <linearGradient id={`diamond-crystal-${lifetimePoints}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>

          {/* ----------------- 1. ROOKIE FRAME ----------------- */}
          {rank.id === "rookie" && (
            <g>
              {/* Hard Offset Shadow */}
              <rect
                x={center - avatarRadius - 10 * scale + 4 * scale}
                y={center - avatarRadius - 10 * scale + 4 * scale}
                width={size + 20 * scale}
                height={size + 20 * scale}
                rx={8 * scale}
                fill="#000000"
              />
              {/* Main Card */}
              <rect
                x={center - avatarRadius - 10 * scale}
                y={center - avatarRadius - 10 * scale}
                width={size + 20 * scale}
                height={size + 20 * scale}
                rx={8 * scale}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Bottom-right diagonal stripes */}
              <g clipPath={`url(#rookie-clip-${lifetimePoints})`}>
                <polygon
                  points={`
                    ${center + avatarRadius + 10 * scale - 22 * scale},${center + avatarRadius + 10 * scale}
                    ${center + avatarRadius + 10 * scale},${center + avatarRadius + 10 * scale - 22 * scale}
                    ${center + avatarRadius + 10 * scale},${center + avatarRadius + 10 * scale}
                  `}
                  fill={`url(#caution-stripes-${lifetimePoints})`}
                  stroke="#000000"
                  strokeWidth={1.5 * scale}
                />
              </g>
              {/* Top-left flag */}
              {showRankBadge && (
                <g>
                  {/* Flag shadow */}
                  <rect
                    x={center - avatarRadius - 15 * scale + 2 * scale}
                    y={center - avatarRadius - 18 * scale + 2 * scale}
                    width={48 * scale}
                    height={16 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  {/* Flag body */}
                  <rect
                    x={center - avatarRadius - 15 * scale}
                    y={center - avatarRadius - 18 * scale}
                    width={48 * scale}
                    height={16 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#ffffff"
                    strokeWidth={1 * scale}
                  />
                  <text
                    x={center - avatarRadius - 15 * scale + 24 * scale}
                    y={center - avatarRadius - 18 * scale + 6 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    ROOKIE
                  </text>
                  <text
                    x={center - avatarRadius - 15 * scale + 24 * scale}
                    y={center - avatarRadius - 18 * scale + 12 * scale}
                    fill="#eab308"
                    fontSize={4.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    START NOW
                  </text>
                </g>
              )}
              {/* Bottom badge */}
              {showPointsBadge && (
                <g>
                  <rect
                    x={center - 24 * scale + 2 * scale}
                    y={center + avatarRadius + 4 * scale + 2 * scale}
                    width={48 * scale}
                    height={11 * scale}
                    rx={3 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 24 * scale}
                    y={center + avatarRadius + 4 * scale}
                    width={48 * scale}
                    height={11 * scale}
                    rx={3 * scale}
                    fill="#000000"
                    stroke="#ffffff"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 4 * scale + 6.5 * scale}
                    fill="#ffffff"
                    fontSize={6.5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 2. RISING FRAME ----------------- */}
          {(rank.id === "rising" || rank.id === "debut") && (
            <g>
              {/* Shadow */}
              <rect
                x={center - avatarRadius - 10 * scale + 4 * scale}
                y={center - avatarRadius - 10 * scale + 4 * scale}
                width={size + 20 * scale}
                height={size + 20 * scale}
                rx={6 * scale}
                fill="#000000"
              />
              {/* Card Base */}
              <rect
                x={center - avatarRadius - 10 * scale}
                y={center - avatarRadius - 10 * scale}
                width={size + 20 * scale}
                height={size + 20 * scale}
                rx={6 * scale}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Caution chevron borders */}
              <g clipPath={`url(#rising-clip-${lifetimePoints})`}>
                <rect
                  x={center - avatarRadius - 10 * scale}
                  y={center - avatarRadius - 10 * scale}
                  width={size + 20 * scale}
                  height={size + 20 * scale}
                  fill="none"
                  stroke={`url(#caution-stripes-${lifetimePoints})`}
                  strokeWidth={8 * scale}
                />
                <rect
                  x={center - avatarRadius - 6 * scale}
                  y={center - avatarRadius - 6 * scale}
                  width={size + 12 * scale}
                  height={size + 12 * scale}
                  fill="none"
                  stroke="#000000"
                  strokeWidth={2 * scale}
                />
              </g>
              {/* Double up-arrow top */}
              <g transform={`translate(${center - 8 * scale}, ${center - avatarRadius - 18 * scale})`}>
                <polygon
                  points={`0,12 8,4 16,12`}
                  fill="none"
                  stroke="#000000"
                  strokeWidth={3 * scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`0,6 8,-2 16,6`}
                  fill="none"
                  stroke="#000000"
                  strokeWidth={3 * scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`0,12 8,4 16,12`}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth={1.5 * scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points={`0,6 8,-2 16,6`}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth={1.5 * scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              {/* Bottom Badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 26 * scale + 2 * scale}
                    y={center + avatarRadius + 4 * scale + 2 * scale}
                    width={52 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 26 * scale}
                    y={center + avatarRadius + 4 * scale}
                    width={52 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#eab308"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 4 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    RISING
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 4 * scale + 10 * scale}
                    fill="#eab308"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 3. GOLD FRAME ----------------- */}
          {rank.id === "gold" && (
            <g>
              {/* Shadow */}
              <polygon
                points={`
                  ${center},${center - avatarRadius - 16 * scale + 4 * scale} 
                  ${center + avatarRadius + 16 * scale + 4 * scale},${center} 
                  ${center},${center + avatarRadius + 16 * scale + 4 * scale} 
                  ${center - avatarRadius - 16 * scale + 4 * scale},${center}
                `}
                fill="#000000"
              />
              {/* Main Diamond */}
              <polygon
                points={`
                  ${center},${center - avatarRadius - 16 * scale} 
                  ${center + avatarRadius + 16 * scale},${center} 
                  ${center},${center + avatarRadius + 16 * scale} 
                  ${center - avatarRadius - 16 * scale},${center}
                `}
                fill="#eab308"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Caution stripes on bottom edges */}
              <polygon
                points={`
                  ${center - avatarRadius - 16 * scale},${center}
                  ${center},${center + avatarRadius + 16 * scale}
                  ${center + avatarRadius + 16 * scale},${center}
                  ${center},${center + avatarRadius + 10 * scale}
                `}
                fill={`url(#caution-stripes-${lifetimePoints})`}
                stroke="#000000"
                strokeWidth={1.5 * scale}
              />
              {/* Hanger hole */}
              <circle
                cx={center}
                cy={center - avatarRadius - 10 * scale}
                r={3 * scale}
                fill="#000000"
              />
              {/* Bottom badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 24 * scale + 2 * scale}
                    y={center + avatarRadius + 6 * scale + 2 * scale}
                    width={48 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 24 * scale}
                    y={center + avatarRadius + 6 * scale}
                    width={48 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#eab308"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 6 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    GOLD
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 6 * scale + 10 * scale}
                    fill="#eab308"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 4. PLATINUM FRAME ----------------- */}
          {rank.id === "platinum" && (
            <g>
              {/* Shadow */}
              <path
                d={platinumShieldPath(center, avatarRadius, scale, 4 * scale, 4 * scale)}
                fill="#000000"
              />
              {/* Blue Shield */}
              <path
                d={platinumShieldPath(center, avatarRadius, scale, 0, 0)}
                fill="#3b82f6"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Inner dashed road ring */}
              <circle
                cx={center}
                cy={center}
                r={avatarRadius + 5 * scale}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2 * scale}
                strokeDasharray={`${4 * scale} ${4 * scale}`}
                opacity={0.85}
              />
              {/* Top info badge shield */}
              <g transform={`translate(${center - 8 * scale}, ${center - avatarRadius - 22 * scale})`}>
                {/* Info shield shadow */}
                <path
                  d={infoShieldPath(8 * scale, 8 * scale, scale, 1.5 * scale, 1.5 * scale)}
                  fill="#000"
                />
                {/* Info shield body */}
                <path
                  d={infoShieldPath(8 * scale, 8 * scale, scale, 0, 0)}
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth={1.5 * scale}
                />
                <text
                  x={8 * scale}
                  y={8 * scale + 2.5 * scale}
                  fill="#ffffff"
                  fontSize={7 * scale}
                  fontWeight="black"
                  fontFamily="monospace"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  i
                </text>
              </g>
              {/* Bottom badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 28 * scale + 2 * scale}
                    y={center + avatarRadius + 8 * scale + 2 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 28 * scale}
                    y={center + avatarRadius + 8 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#3b82f6"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    PLATINUM
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 10 * scale}
                    fill="#3b82f6"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 5. DIAMOND FRAME ----------------- */}
          {rank.id === "diamond" && (
            <g>
              {/* Shadow */}
              <polygon
                points={diamondHexPoints(center, avatarRadius, scale, 4 * scale, 4 * scale)}
                fill="#000000"
              />
              {/* Cyan Hexagon */}
              <polygon
                points={diamondHexPoints(center, avatarRadius, scale, 0, 0)}
                fill="#06b6d4"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Chevron wings */}
              <polygon
                points={`
                  ${center - avatarRadius - 14 * scale},${center + avatarRadius / 2}
                  ${center - avatarRadius - 8 * scale},${center + avatarRadius / 2 + 10 * scale}
                  ${center - 6 * scale},${center + avatarRadius + 14 * scale}
                  ${center},${center + avatarRadius + 18 * scale}
                  ${center + 6 * scale},${center + avatarRadius + 14 * scale}
                  ${center + avatarRadius + 8 * scale},${center + avatarRadius / 2 + 10 * scale}
                  ${center + avatarRadius + 14 * scale},${center + avatarRadius / 2}
                  ${center},${center + avatarRadius + 8 * scale}
                `}
                fill={`url(#caution-stripes-${lifetimePoints})`}
                stroke="#000000"
                strokeWidth={1.5 * scale}
              />
              {/* Top diamond emblem */}
              <g transform={`translate(${center}, ${center - avatarRadius - 18 * scale})`}>
                <circle cx={0} cy={0} r={8 * scale} fill="#000000" transform={`translate(${1.5 * scale}, ${1.5 * scale})`} />
                <circle cx={0} cy={0} r={8 * scale} fill="#06b6d4" stroke="#ffffff" strokeWidth={1.5 * scale} />
                <polygon
                  points={`
                    0,${-5 * scale}
                    ${4 * scale},${-1 * scale}
                    0,${4 * scale}
                    ${-4 * scale},${-1 * scale}
                  `}
                  fill="#ffffff"
                >
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                </polygon>
                <line x1={-4 * scale} y1={-1 * scale} x2={4 * scale} y2={-1 * scale} stroke="#06b6d4" strokeWidth={1 * scale} />
              </g>
              {/* Inner road ring */}
              <circle
                cx={center}
                cy={center}
                r={avatarRadius + 5 * scale}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2 * scale}
                strokeDasharray={`${5 * scale} ${3 * scale}`}
                opacity={0.8}
              />
              {/* Bottom badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 28 * scale + 2 * scale}
                    y={center + avatarRadius + 8 * scale + 2 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 28 * scale}
                    y={center + avatarRadius + 8 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#06b6d4"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    DIAMOND
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 10 * scale}
                    fill="#06b6d4"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 6. MASTER FRAME ----------------- */}
          {rank.id === "master" && (
            <g>
              {/* Shadow */}
              <path
                d={masterShieldPath(center, avatarRadius, scale, 4 * scale, 4 * scale)}
                fill="#000000"
              />
              {/* Dark Blue Tactical Shield */}
              <path
                d={masterShieldPath(center, avatarRadius, scale, 0, 0)}
                fill="#2563eb"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Top direction arrow emblem */}
              <g transform={`translate(${center}, ${center - avatarRadius - 16 * scale})`}>
                <circle cx={0} cy={0} r={8 * scale} fill="#000000" transform={`translate(${1.5 * scale}, ${1.5 * scale})`} />
                <circle cx={0} cy={0} r={8 * scale} fill="#2563eb" stroke="#ffffff" strokeWidth={1.5 * scale} />
                <path
                  d={`
                    M 0 ${-4 * scale}
                    L ${3 * scale} ${-1 * scale}
                    L ${1 * scale} ${-1 * scale}
                    L ${1 * scale} ${4 * scale}
                    L ${-1 * scale} ${4 * scale}
                    L ${-1 * scale} ${-1 * scale}
                    L ${-3 * scale} ${-1 * scale}
                    Z
                  `}
                  fill="#ffffff"
                />
              </g>
              {/* Double line lane ring */}
              <circle
                cx={center}
                cy={center}
                r={avatarRadius + 5 * scale}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2 * scale}
                strokeDasharray={`${6 * scale} ${4 * scale}`}
              />
              {/* Bottom badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 28 * scale + 2 * scale}
                    y={center + avatarRadius + 8 * scale + 2 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 28 * scale}
                    y={center + avatarRadius + 8 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#2563eb"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    MASTER
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 10 * scale}
                    fill="#2563eb"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 7. ELITE FRAME ----------------- */}
          {rank.id === "elite" && (
            <g>
              {/* Shadow */}
              <polygon
                points={elitePoints(center, avatarRadius, scale, 4 * scale, 4 * scale)}
                fill="#000000"
              />
              {/* Purple Speed Polygon */}
              <polygon
                points={elitePoints(center, avatarRadius, scale, 0, 0)}
                fill="#a855f7"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Speed chevrons */}
              <g transform={`translate(${center - 8 * scale}, ${center - avatarRadius - 24 * scale})`} fill="none" stroke="#ffffff" strokeWidth={2 * scale} strokeLinecap="round" strokeLinejoin="round">
                <path d={`M 0 4 L 8 0 L 16 4`} />
                <path d={`M 0 8 L 8 4 L 16 8`} />
              </g>
              {/* Side speed lightning trails */}
              <g fill="#ffd700" stroke="#000000" strokeWidth={1 * scale} strokeLinejoin="round">
                <polygon points={`
                  ${center - avatarRadius - 12 * scale},${center - 6 * scale}
                  ${center - avatarRadius - 20 * scale},${center}
                  ${center - avatarRadius - 14 * scale},${center}
                  ${center - avatarRadius - 18 * scale},${center + 6 * scale}
                  ${center - avatarRadius - 8 * scale},${center}
                  ${center - avatarRadius - 12 * scale},${center}
                `} />
                <polygon points={`
                  ${center + avatarRadius + 12 * scale},${center - 6 * scale}
                  ${center + avatarRadius + 20 * scale},${center}
                  ${center + avatarRadius + 14 * scale},${center}
                  ${center + avatarRadius + 18 * scale},${center + 6 * scale}
                  ${center + avatarRadius + 8 * scale},${center}
                  ${center + avatarRadius + 12 * scale},${center}
                `} />
              </g>
              {/* Bottom badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 28 * scale + 2 * scale}
                    y={center + avatarRadius + 8 * scale + 2 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 28 * scale}
                    y={center + avatarRadius + 8 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#a855f7"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    ELITE
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 10 * scale}
                    fill="#a855f7"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 8. LEGEND FRAME ----------------- */}
          {rank.id === "legend" && (
            <g>
              {/* Shadow */}
              <path
                d={legendShieldPath(center, avatarRadius, scale, 4 * scale, 4 * scale)}
                fill="#000000"
              />
              {/* Gold Shield */}
              <path
                d={legendShieldPath(center, avatarRadius, scale, 0, 0)}
                fill={`url(#gold-metal-${lifetimePoints})`}
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Crown top center */}
              <g transform={`translate(${center - 8 * scale}, ${center - avatarRadius - 24 * scale})`}>
                <polygon
                  points={`0,10 0,3 4,5 8,1 12,5 16,3 16,10`}
                  fill={`url(#gold-metal-${lifetimePoints})`}
                  stroke="#000000"
                  strokeWidth={1.5 * scale}
                  strokeLinejoin="round"
                />
              </g>
              {/* Side winged accents */}
              <g fill="#ffffff" stroke="#000000" strokeWidth={1.5 * scale} strokeLinejoin="round">
                <polygon points={`
                  ${center - avatarRadius - 10 * scale},${center - 6 * scale}
                  ${center - avatarRadius - 20 * scale},${center - 12 * scale}
                  ${center - avatarRadius - 16 * scale},${center}
                  ${center - avatarRadius - 22 * scale},${center + 4 * scale}
                  ${center - avatarRadius - 10 * scale},${center + 4 * scale}
                `} />
                <polygon points={`
                  ${center + avatarRadius + 10 * scale},${center - 6 * scale}
                  ${center + avatarRadius + 20 * scale},${center - 12 * scale}
                  ${center + avatarRadius + 16 * scale},${center}
                  ${center + avatarRadius + 22 * scale},${center + 4 * scale}
                  ${center + avatarRadius + 10 * scale},${center + 4 * scale}
                `} />
              </g>
              {/* Bottom badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 28 * scale + 2 * scale}
                    y={center + avatarRadius + 8 * scale + 2 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 28 * scale}
                    y={center + avatarRadius + 8 * scale}
                    width={56 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#ffd700"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    LEGEND
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 10 * scale}
                    fill="#ffd700"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ----------------- 9. HIGHMASTER FRAME ----------------- */}
          {(rank.id === "highmaster" || rank.id === "mythic") && (
            <g>
              {/* Shadow */}
              <path
                d={highmasterShieldPath(center, avatarRadius, scale, 4 * scale, 4 * scale)}
                fill="#000000"
              />
              {/* Purple/Yellow Shield */}
              <path
                d={highmasterShieldPath(center, avatarRadius, scale, 0, 0)}
                fill="#a855f7"
                stroke="#000000"
                strokeWidth={3 * scale}
              />
              {/* Asphalt road ring */}
              <circle
                cx={center}
                cy={center}
                r={avatarRadius + 5 * scale}
                fill="none"
                stroke="#1c1917"
                strokeWidth={5 * scale}
              />
              <circle
                cx={center}
                cy={center}
                r={avatarRadius + 5 * scale}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.5 * scale}
                strokeDasharray={`${4 * scale} ${4 * scale}`}
              />
              {/* Crown top center */}
              <g transform={`translate(${center - 10 * scale}, ${center - avatarRadius - 32 * scale})`}>
                <polygon
                  points={`0,12 0,4 5,6.4 10,1.6 15,6.4 20,4 20,12`}
                  fill={`url(#gold-metal-${lifetimePoints})`}
                  stroke="#000000"
                  strokeWidth={1.5 * scale}
                  strokeLinejoin="round"
                />
                <circle cx={0} cy={3.2 * scale} r={1 * scale} fill="#ffd700" stroke="#000" strokeWidth={0.5 * scale} />
                <circle cx={10 * scale} cy={1.2 * scale} r={1 * scale} fill="#ffd700" stroke="#000" strokeWidth={0.5 * scale} />
                <circle cx={20 * scale} cy={3.2 * scale} r={1 * scale} fill="#ffd700" stroke="#000" strokeWidth={0.5 * scale} />
              </g>
              {/* Side lightning bolts */}
              <g fill="#fbbf24" stroke="#000000" strokeWidth={1.5 * scale} strokeLinejoin="round">
                <polygon points={`
                  ${center - avatarRadius - 14 * scale},${center - 8 * scale} 
                  ${center - avatarRadius - 24 * scale},${center + 4 * scale} 
                  ${center - avatarRadius - 16 * scale},${center + 4 * scale} 
                  ${center - avatarRadius - 22 * scale},${center + 16 * scale} 
                  ${center - avatarRadius - 9 * scale},${center + 6 * scale} 
                  ${center - avatarRadius - 14 * scale},${center + 6 * scale}
                `}>
                  <animate attributeName="fill" values="#fbbf24;#ffffff;#fbbf24" dur="1.2s" repeatCount="indefinite" />
                </polygon>
                <polygon points={`
                  ${center + avatarRadius + 14 * scale},${center - 8 * scale} 
                  ${center + avatarRadius + 24 * scale},${center + 4 * scale} 
                  ${center + avatarRadius + 16 * scale},${center + 4 * scale} 
                  ${center + avatarRadius + 22 * scale},${center + 16 * scale} 
                  ${center + avatarRadius + 9 * scale},${center + 6 * scale} 
                  ${center + avatarRadius + 14 * scale},${center + 6 * scale}
                `}>
                  <animate attributeName="fill" values="#fbbf24;#ffffff;#fbbf24" dur="1.2s" repeatCount="indefinite" />
                </polygon>
              </g>
              {/* Bottom badge */}
              {showRankBadge && (
                <g>
                  <rect
                    x={center - 32 * scale + 2 * scale}
                    y={center + avatarRadius + 8 * scale + 2 * scale}
                    width={64 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                  />
                  <rect
                    x={center - 32 * scale}
                    y={center + avatarRadius + 8 * scale}
                    width={64 * scale}
                    height={13 * scale}
                    rx={2 * scale}
                    fill="#000000"
                    stroke="#fbbf24"
                    strokeWidth={1.5 * scale}
                  />
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 5 * scale}
                    fill="#ffffff"
                    fontSize={5.5 * scale}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.label}
                  </text>
                  <text
                    x={center}
                    y={center + avatarRadius + 8 * scale + 10 * scale}
                    fill="#fbbf24"
                    fontSize={5 * scale}
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {currentConfig.pointsLabel}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* User profile image border - thick solid black to enforce Brutalist DNA */}
          <circle 
            cx={center} 
            cy={center} 
            r={avatarRadius} 
            fill="none" 
            stroke="#000000" 
            strokeWidth={3 * scale} 
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

          {/* ================= OVERLAY PROFILE BADGES (SVG) ================= */}

          {/* 2. Roman Numeral Division Badge (Top Right Corner) */}
          {showDivisionBadge && (
            <g transform={`translate(${center + avatarRadius * 0.78}, ${center - avatarRadius * 0.78})`}>
              {/* Shadow */}
              <rect
                x={-5 * scale + 1.5 * scale}
                y={-5 * scale + 1.5 * scale}
                width={10 * scale}
                height={10 * scale}
                fill="#000000"
                transform="rotate(12)"
              />
              {/* Body */}
              <rect
                x={-5 * scale}
                y={-5 * scale}
                width={10 * scale}
                height={10 * scale}
                fill="#fbbf24"
                stroke="#000000"
                strokeWidth={1.5 * scale}
                transform="rotate(12)"
              />
              <text
                fill="#000000"
                fontSize={6.5 * scale}
                fontWeight="black"
                fontFamily="monospace"
                textAnchor="middle"
                alignmentBaseline="middle"
                transform="rotate(12)"
              >
                {division}
              </text>
            </g>
          )}

          {/* 3. Special Role / Safety Shield Icon Badge (Middle Left Edge) */}
          {showSafetyBadge && (
            <g transform={`translate(${center - avatarRadius * 0.95}, ${center})`}>
              {/* Shadow */}
              <path
                d={infoShieldPath(0, 0, scale, 1.5 * scale, 1.5 * scale)}
                fill="#000000"
              />
              {/* Body */}
              <path
                d={infoShieldPath(0, 0, scale, 0, 0)}
                fill="#22c55e"
                stroke="#000000"
                strokeWidth={1.5 * scale}
              />
              {/* Checkmark */}
              <path
                d={`
                  M ${-2 * scale} ${0}
                  L ${-0.5 * scale} ${1.8 * scale}
                  L ${2.2 * scale} ${-1.8 * scale}
                `}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </svg>

      </div>
    </>
  );
}

// ── SVG PATH & SHAPE HELPER FUNCTIONS ───────────────────────────────────────

function platinumShieldPath(center: number, r: number, scale: number, dx = 0, dy = 0) {
  const cx = center + dx;
  const cy = center + dy;
  return `
    M ${cx} ${cy - r - 12 * scale}
    Q ${cx + r + 10 * scale} ${cy - r - 12 * scale} ${cx + r + 10 * scale} ${cy}
    Q ${cx + r + 10 * scale} ${cy + r + 6 * scale} ${cx} ${cy + r + 16 * scale}
    Q ${cx - r - 10 * scale} ${cy + r + 6 * scale} ${cx - r - 10 * scale} ${cy}
    Q ${cx - r - 10 * scale} ${cy - r - 12 * scale} ${cx} ${cy - r - 12 * scale}
    Z
  `;
}

function infoShieldPath(cx: number, cy: number, scale: number, dx = 0, dy = 0) {
  const x = cx + dx;
  const y = cy + dy;
  return `
    M ${x} ${y - 8 * scale}
    L ${x + 6 * scale} ${y - 6 * scale}
    L ${x + 6 * scale} ${y + 2 * scale}
    Q ${x + 4 * scale} ${y + 7 * scale} ${x} ${y + 9 * scale}
    Q ${x - 4 * scale} ${y + 7 * scale} ${x - 6 * scale} ${y + 2 * scale}
    L ${x - 6 * scale} ${y - 6 * scale}
    Z
  `;
}

function diamondHexPoints(center: number, r: number, scale: number, dx = 0, dy = 0) {
  const cx = center + dx;
  const cy = center + dy;
  return `
    ${cx},${cy - r - 18 * scale}
    ${cx + r + 14 * scale},${cy - r / 2}
    ${cx + r + 14 * scale},${cy + r / 2}
    ${cx},${cy + r + 18 * scale}
    ${cx - r - 14 * scale},${cy + r / 2}
    ${cx - r - 14 * scale},${cy - r / 2}
  `;
}

function masterShieldPath(center: number, r: number, scale: number, dx = 0, dy = 0) {
  const cx = center + dx;
  const cy = center + dy;
  return `
    M ${cx} ${cy - r - 15 * scale}
    L ${cx + r + 13 * scale} ${cy - r - 10 * scale}
    L ${cx + r + 15 * scale} ${cy + 8 * scale}
    Q ${cx + r + 10 * scale} ${cy + r + 10 * scale} ${cx} ${cy + r + 18 * scale}
    Q ${cx - r - 10 * scale} ${cy + r + 10 * scale} ${cx - r - 15 * scale} ${cy + 8 * scale}
    L ${cx - r - 13 * scale} ${cy - r - 10 * scale}
    Z
  `;
}

function elitePoints(center: number, r: number, scale: number, dx = 0, dy = 0) {
  const cx = center + dx;
  const cy = center + dy;
  return `
    ${cx},${cy - r - 16 * scale}
    ${cx + r + 10 * scale},${cy - r - 10 * scale}
    ${cx + r + 16 * scale},${cy + 2 * scale}
    ${cx + r + 8 * scale},${cy + r + 12 * scale}
    ${cx},${cy + r + 17 * scale}
    ${cx - r - 8 * scale},${cy + r + 12 * scale}
    ${cx - r - 16 * scale},${cy + 2 * scale}
    ${cx - r - 10 * scale},${cy - r - 10 * scale}
  `;
}

// ── LEGEND & HIGHMASTER SHIELD PATHS ────────────────────────────────────────

function legendShieldPath(center: number, r: number, scale: number, dx = 0, dy = 0) {
  const cx = center + dx;
  const cy = center + dy;
  return `
    M ${cx} ${cy - r - 18 * scale}
    Q ${cx + r + 5 * scale} ${cy - r - 22 * scale} ${cx + r + 15 * scale} ${cy - 10 * scale}
    L ${cx + r + 13 * scale} ${cy + 12 * scale}
    Q ${cx + r} ${cy + r + 15 * scale} ${cx} ${cy + r + 20 * scale}
    Q ${cx - r} ${cy + r + 15 * scale} ${cx - r - 13 * scale} ${cy + 12 * scale}
    L ${cx - r - 15 * scale} ${cy - 10 * scale}
    Q ${cx - r - 5 * scale} ${cy - r - 22 * scale} ${cx} ${cy - r - 18 * scale}
    Z
  `;
}

function highmasterShieldPath(center: number, r: number, scale: number, dx = 0, dy = 0) {
  const cx = center + dx;
  const cy = center + dy;
  return `
    M ${cx} ${cy - r - 21 * scale}
    L ${cx + 14 * scale} ${cy - r - 15 * scale}
    L ${cx + r + 14 * scale} ${cy - r - 15 * scale}
    L ${cx + r + 18 * scale} ${cy + 4 * scale}
    Q ${cx + r + 10 * scale} ${cy + r + 14 * scale} ${cx} ${cy + r + 22 * scale}
    Q ${cx - r - 10 * scale} ${cy + r + 14 * scale} ${cx - r - 18 * scale} ${cy + 4 * scale}
    L ${cx - r - 14 * scale} ${cy - r - 15 * scale}
    L ${cx - 14 * scale} ${cy - r - 15 * scale}
    Z
  `;
}
