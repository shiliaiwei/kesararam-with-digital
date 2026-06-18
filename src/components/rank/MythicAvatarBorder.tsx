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

                        {/* Purple Gradient for Crown Crystals */}
                        <linearGradient id="mythic-crystal-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#7e22ce" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#d8b4fe" />
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

                    {/* Brutalist zero-blur shadow for the main wheel base */}
                    <circle cx="114" cy="114" r="56" fill="#000000" />

                    {/* Main Outer tire/carbon wheel base */}
                    <circle cx="110" cy="110" r="56" fill="url(#mythic-carbon)" stroke="#000000" strokeWidth="4" />

                    {/* Inner Gold Ring border */}
                    <circle cx="110" cy="110" r="46" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="3" />

                    {/* Inner Asphalt Ring */}
                    <circle cx="110" cy="110" r="44" fill="#1c1917" stroke="#000000" strokeWidth="2.5" />

                    {/* White Dashed Lane Markings */}
                    <circle cx="110" cy="110" r="40" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />

                    {/* ── LEFT MECHANICAL ARM & TRAFFIC LIGHT ── */}
                    {/* Shadow */}
                    <path d="M 62 106 L 32 101 L 32 127 L 62 122 Z" fill="#000" />
                    {/* Arm Sleeve */}
                    <path d="M 58 102 L 28 97 L 28 123 L 58 118 Z" fill="#334155" stroke="#000000" strokeWidth="2" />
                    {/* Arm Piston */}
                    <rect x="24" y="106" width="10" height="8" fill="#cbd5e1" stroke="#000000" strokeWidth="2" />
                    {/* Traffic Light Container Shadow */}
                    <rect x="12" y="84" width="18" height="50" rx="4" fill="#000" />
                    {/* Traffic Light Container */}
                    <rect x="8" y="80" width="18" height="50" rx="4" fill="#0f172a" stroke="#000000" strokeWidth="2.5" />
                    {/* Bulbs */}
                    <circle cx="17" cy="88" r="4.5" className="mythic-light-red" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="17" cy="105" r="4.5" className="mythic-light-yellow" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="17" cy="122" r="4.5" className="mythic-light-green" stroke="#000000" strokeWidth="1.5" />

                    {/* ── RIGHT MECHANICAL ARM & ROAD SIGNS ── */}
                    {/* Shadow */}
                    <path d="M 162 106 L 192 101 L 192 127 L 162 122 Z" fill="#000" />
                    {/* Arm Sleeve */}
                    <path d="M 162 102 L 192 97 L 192 123 L 162 118 Z" fill="#334155" stroke="#000000" strokeWidth="2" />
                    {/* Arm Piston */}
                    <rect x="186" y="106" width="10" height="8" fill="#cbd5e1" stroke="#000000" strokeWidth="2" />
                    {/* Sign Container Shadow */}
                    <rect x="198" y="84" width="18" height="50" rx="4" fill="#000" />
                    {/* Sign Container */}
                    <rect x="194" y="80" width="18" height="50" rx="4" fill="#0f172a" stroke="#000000" strokeWidth="2.5" />
                    {/* Pedestrian Sign */}
                    <rect x="196" y="85" width="14" height="14" rx="1" fill="#3b82f6" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 203 87 A 1 1 0 1 0 203 89 A 1 1 0 1 0 203 87 Z M 201 93 L 203 90 L 205 93 M 203 90 L 203 92" stroke="#ffffff" strokeWidth="1" fill="none" />
                    {/* Arrow Turn Sign */}
                    <rect x="196" y="108" width="14" height="14" rx="1" fill="#1e293b" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 200 115 L 206 115 M 206 115 L 204 113 M 206 115 L 204 117" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                    {/* ── TOP SIREN BAR & MOUNT ── */}
                    {/* Mount Shadow */}
                    <path d="M 79 56 L 149 56 L 139 64 L 89 64 Z" fill="#000" />
                    {/* Mount Bracket */}
                    <path d="M 75 52 L 145 52 L 135 60 L 85 60 Z" fill="#475569" stroke="#000000" strokeWidth="2" />
                    {/* Siren Bar Shadow */}
                    <path d="M 59 46 Q 114 42 169 46 L 164 56 L 64 56 Z" fill="#000" />
                    {/* Siren Bar Housing */}
                    <path d="M 55 42 Q 110 38 165 42 L 160 52 L 60 52 Z" fill="#1e293b" stroke="#000000" strokeWidth="2.5" />
                    {/* Blue Left Light */}
                    <rect x="65" y="44" width="40" height="6" rx="1" className="mythic-siren-blue" stroke="#000000" strokeWidth="1" />
                    {/* Red Right Light */}
                    <rect x="115" y="44" width="40" height="6" rx="1" className="mythic-siren-red" stroke="#000000" strokeWidth="1" />
                    {/* Green Center Indicator */}
                    <circle cx="110" cy="47" r="4.5" fill="#22c55e" stroke="#000000" strokeWidth="1.5" />

                    {/* ── TOP CROWN WITH CRYSTALS ── */}
                    {/* Crown Base */}
                    <rect x="85" y="30" width="50" height="6" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="2" />
                    {/* Crown Spikes */}
                    <polygon points="105,30 110,12 115,30" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <polygon points="95,30 98,18 103,30" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <polygon points="117,30 122,18 125,30" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <polygon points="85,30 87,24 92,30" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <polygon points="128,30 133,24 135,30" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    {/* Purple Crystals */}
                    <polygon points="110,6 113,12 110,18 107,12" fill="url(#mythic-crystal-grad)" stroke="#000000" strokeWidth="1" />
                    <polygon points="98,13 100.5,18 98,23 95.5,18" fill="url(#mythic-crystal-grad)" stroke="#000000" strokeWidth="1" />
                    <polygon points="122,13 124.5,18 122,23 119.5,18" fill="url(#mythic-crystal-grad)" stroke="#000000" strokeWidth="1" />
                    <polygon points="87,19 89,24 87,29 85,24" fill="url(#mythic-crystal-grad)" stroke="#000000" strokeWidth="1" />
                    <polygon points="133,19 135,24 133,29 131,24" fill="url(#mythic-crystal-grad)" stroke="#000000" strokeWidth="1" />

                    {/* ── WHEEL SUPPORTS & WHEELS ── */}
                    {/* Left Wheel Support Shadow */}
                    <path d="M 54 164 L 38 189 L 60 189 Z" fill="#000" />
                    {/* Left Wheel Support */}
                    <path d="M 50 160 L 34 185 L 56 185 Z" fill="#475569" stroke="#000000" strokeWidth="2" />
                    {/* Right Wheel Support Shadow */}
                    <path d="M 174 164 L 168 189 L 190 189 Z" fill="#000" />
                    {/* Right Wheel Support */}
                    <path d="M 170 160 L 164 185 L 186 185 Z" fill="#475569" stroke="#000000" strokeWidth="2" />

                    {/* Left Wheel Group */}
                    <g className="mythic-wheel-left">
                        <circle cx="45" cy="188" r="16" fill="#1e293b" stroke="#000000" strokeWidth="2.5" />
                        <circle cx="45" cy="188" r="8" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                        <line x1="45" y1="172" x2="45" y2="204" stroke="#000000" strokeWidth="1.5" />
                        <line x1="29" y1="188" x2="61" y2="188" stroke="#000000" strokeWidth="1.5" />
                        <line x1="34" y1="177" x2="56" y2="199" stroke="#000000" strokeWidth="1" />
                        <line x1="34" y1="199" x2="56" y2="177" stroke="#000000" strokeWidth="1" />
                        <circle cx="45" cy="188" r="3" fill="#cbd5e1" stroke="#000000" strokeWidth="1" />
                    </g>

                    {/* Right Wheel Group */}
                    <g className="mythic-wheel-right">
                        <circle cx="175" cy="188" r="16" fill="#1e293b" stroke="#000000" strokeWidth="2.5" />
                        <circle cx="175" cy="188" r="8" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                        <line x1="175" y1="172" x2="175" y2="204" stroke="#000000" strokeWidth="1.5" />
                        <line x1="159" y1="188" x2="191" y2="188" stroke="#000000" strokeWidth="1.5" />
                        <line x1="164" y1="177" x2="186" y2="199" stroke="#000000" strokeWidth="1" />
                        <line x1="164" y1="199" x2="186" y2="177" stroke="#000000" strokeWidth="1" />
                        <circle cx="175" cy="188" r="3" fill="#cbd5e1" stroke="#000000" strokeWidth="1" />
                    </g>

                    {/* ── LICENSE NAMEPLATE ── */}
                    {/* Shadow */}
                    <polygon points="72,172 156,172 162,187 156,202 72,202 66,187" fill="#000000" />
                    {/* Metal Outer Plate */}
                    <polygon points="68,168 152,168 158,183 152,198 68,198 62,183" fill="url(#mythic-silver-metal)" stroke="url(#mythic-gold-metal)" strokeWidth="3" />
                    {/* Inner Black Border */}
                    <polygon points="70,170 150,170 155,183 150,196 70,196 65,183" fill="none" stroke="#000000" strokeWidth="2" />
                    {/* Corner Rivets */}
                    <circle cx="72" cy="183" r="1.8" fill="#94a3b8" stroke="#000000" strokeWidth="1" />
                    <circle cx="148" cy="183" r="1.8" fill="#94a3b8" stroke="#000000" strokeWidth="1" />
                    {/* Text Inscriptions */}
                    <text x="110" y="182" fill="#000000" fontSize="11" fontWeight="900" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="0.5">MYTHIC</text>
                    <text x="110" y="191" fill="#334155" fontSize="5.5" fontWeight="800" fontFamily="monospace" textAnchor="middle" letterSpacing="0.2">KWD-MD-ENF-01</text>
                </svg>

                {/* Sweeping purple/gold luxury shine overlay */}
                <div className="mythic-avatar__shine" aria-hidden="true" />

                {/* Crown jewels beacon glow */}
                <div className="mythic-avatar__crown-glow" aria-hidden="true" />

                {/* Flashing lightning bolt glows */}
                <div className="mythic-avatar__lightning-glow mythic-avatar__lightning-glow--left" aria-hidden="true" />
                <div className="mythic-avatar__lightning-glow mythic-avatar__lightning-glow--right" aria-hidden="true" />

                {/* Blinking caution warning sign (bottom-left) */}
                <div className="mythic-avatar__caution-glow" aria-hidden="true" />

                {/* Shimmering trophy glow (bottom-right) */}
                <div className="mythic-avatar__trophy-glow" aria-hidden="true" />

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
