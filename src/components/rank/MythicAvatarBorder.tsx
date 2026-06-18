"use client";

import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvatarSize } from "@/lib/ranks";
import { calculateRankAndDivision } from "@/lib/ranks";

const SCALE: Record<AvatarSize, number> = {
    sm: 0.65,
    md: 1,
    lg: 1.33,
    xl: 1.66,
};

export interface MythicAvatarBorderProps {
    src?: string | null;
    alt: string;
    username?: string;
    score?: number;
    size?: AvatarSize | number;
    animated?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function MythicAvatarBorder({
    src,
    alt,
    username,
    score,
    size = "md",
    animated = true,
    className,
    children,
}: MythicAvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);
    const scale = typeof size === "number" ? size / 73.1 : SCALE[size];
    const showCustomAvatar = Boolean(children);
    const showImage = Boolean(src) && !imgFailed && !showCustomAvatar;
    const initial = username?.trim()?.charAt(0)?.toUpperCase() ?? "";

    const clampedScore = score !== undefined ? Math.max(12000, score) : undefined;
    const division = clampedScore !== undefined ? calculateRankAndDivision(clampedScore).division : undefined;

    const vars = {
        "--s": scale,
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "mythic-avatar",
                animated ? "mythic-avatar--animated" : "mythic-avatar--static",
                className,
            )}
            style={vars}
        >
            <div className="mythic-avatar__plate">
                {/* Scalable SVG Frame instead of a static PNG */}
                <svg
                    className="mythic-avatar__frame-img"
                    viewBox="0 0 220 220"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Gold Metallic Sweep Gradient */}
                        <linearGradient id="mythic-gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
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

                        {/* Dark Carbon texture gradient for outer ring */}
                        <radialGradient id="mythic-carbon" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#2c2a29" />
                            <stop offset="85%" stopColor="#1c1917" />
                            <stop offset="100%" stopColor="#0a0a0a" />
                        </radialGradient>

                        {/* Silver metal gradient for nameplate */}
                        <linearGradient id="mythic-silver-metal" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="50%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#64748b" />
                        </linearGradient>
                    </defs>

                    {/* Brutalist zero-blur shadow for the shield frame */}
                    <path d="M 110 25 L 175 35 Q 185 110 110 195 Q 35 110 45 35 Z" fill="#000000" transform="translate(4, 4)"/>

                    {/* Gothic Shield Outer Frame */}
                    <path d="M 110 25 L 175 35 Q 185 110 110 195 Q 35 110 45 35 Z" fill="#a855f7" stroke="#000000" strokeWidth="4" />

                    {/* Gold Inner Border Accent */}
                    <path d="M 110 32 L 167 41 Q 176 110 110 185 Q 44 110 53 41 Z" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="2.5" />

                    {/* Main Outer circle roadway ring */}
                    <circle cx="110" cy="110" r="56" fill="url(#mythic-carbon)" stroke="#000000" strokeWidth="3.5" />

                    {/* Inner Gold Ring border */}
                    <circle cx="110" cy="110" r="46" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="2.5" />

                    {/* Inner Asphalt Ring */}
                    <circle cx="110" cy="110" r="44" fill="#1c1917" stroke="#000000" strokeWidth="2" />

                    {/* White Dashed Lane Markings */}
                    <circle cx="110" cy="110" r="40" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />

                    {/* ── INTEGRATED SIDE LIGHTS & WARNING SIGNS ── */}
                    {/* Integrated Traffic Light (Left Side of Shield Face) */}
                    <rect x="52" y="93" width="12" height="34" rx="2.5" fill="#0f172a" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="58" cy="99" r="3" className="mythic-light-red" stroke="#000000" strokeWidth="1" />
                    <circle cx="58" cy="110" r="3" className="mythic-light-yellow" stroke="#000000" strokeWidth="1" />
                    <circle cx="58" cy="121" r="3" className="mythic-light-green" stroke="#000000" strokeWidth="1" />

                    {/* Integrated Warning Diamond and Sign (Right Side of Shield Face) */}
                    <polygon points="162,93 168,99 162,105 156,99" fill="#eab308" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 162 96 L 162 100 M 162 102 L 162 103" stroke="#000000" strokeWidth="1" strokeLinecap="round" />

                    <rect x="156" y="112" width="12" height="12" rx="1.5" fill="#3b82f6" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 159 118 L 165 118 M 165 118 L 163 116 M 165 118 L 163 120" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    {/* ── TOP SIREN BAR & MOUNT ── */}
                    {/* Mount Bracket */}
                    <path d="M 75 22 L 145 22 L 135 30 L 85 30 Z" fill="#475569" stroke="#000000" strokeWidth="2" />
                    {/* Siren Bar Housing */}
                    <path d="M 55 12 Q 110 8 165 12 L 160 22 L 60 22 Z" fill="#1e293b" stroke="#000000" strokeWidth="2.5" />
                    {/* Blue Left Light */}
                    <rect x="65" y="14" width="40" height="6" rx="1" className="mythic-siren-blue" stroke="#000000" strokeWidth="1" />
                    {/* Red Right Light */}
                    <rect x="115" y="14" width="40" height="6" rx="1" className="mythic-siren-red" stroke="#000000" strokeWidth="1" />
                    {/* Center Green Indicator */}
                    <circle cx="110" cy="17" r="4" fill="#22c55e" stroke="#000000" strokeWidth="1.2" />

                    {/* ── LICENSE NAMEPLATE ── */}
                    {/* Shadow */}
                    <polygon points="72,164 148,164 154,179 148,194 72,194 66,179" fill="#000000" />
                    {/* Metal Outer Plate */}
                    <polygon points="68,160 144,160 150,175 144,190 68,190 62,175" fill="url(#mythic-silver-metal)" stroke="url(#mythic-gold-metal)" strokeWidth="3.5" />
                    {/* Inner Black Border */}
                    <polygon points="70,162 142,162 147,175 142,188 70,188 65,175" fill="none" stroke="#000000" strokeWidth="2" />
                    {/* Corner Rivets */}
                    <circle cx="72" cy="175" r="2.2" fill="#94a3b8" stroke="#000000" strokeWidth="1" />
                    <circle cx="140" cy="175" r="2.2" fill="#94a3b8" stroke="#000000" strokeWidth="1" />
                    {/* Text Inscriptions - No Code Text */}
                    <text x="106" y="179" fill="#000000" fontSize="13" fontWeight="950" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="0.8">MYTHIC</text>
                </svg>

                {/* Sweeping purple/gold luxury shine overlay */}
                <div className="mythic-avatar__shine" aria-hidden="true" />

                {/* HUD Ring Glow around photo cutout */}
                <div className="mythic-avatar__ring-glow" aria-hidden="true" />

                {/* Protected profile photo window in the center (44.4% cutout) */}
                <div className="mythic-avatar__photo">
                    {showCustomAvatar ? (
                        <div className="mythic-avatar__custom-photo" role="img" aria-label={alt}>
                            {children}
                        </div>
                    ) : showImage ? (
                        <img
                            src={src as string}
                            alt={alt}
                            className="mythic-avatar__img"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div className="mythic-avatar__fallback" role="img" aria-label={alt}>
                            {initial || (
                                <User size={Math.round(44 * scale)} strokeWidth={2.5} aria-hidden="true" />
                            )}
                        </div>
                    )}
                </div>

                {/* Division Badge (Top-Left) */}
                {division && (
                    <div className="mythic-avatar__division-badge" aria-label={`Division ${division}`}>
                        <span className="mythic-avatar__division-text">{division}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MythicAvatarBorder;
