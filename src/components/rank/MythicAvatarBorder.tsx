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
                    </defs>

                    {/* Brutalist zero-blur shadow for the shield frame */}
                    <polygon points="48,23 172,23 207,58 207,162 172,197 48,197 13,162 13,58" fill="#000000" transform="translate(5, 5)" />

                    {/* Multi-layered Premium Gold Octagonal Shield */}
                    <polygon points="48,23 172,23 207,58 207,162 172,197 48,197 13,162 13,58" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="4.5" strokeLinejoin="round" />
                    <polygon points="52,27 168,27 203,62 203,158 168,193 52,193 17,158 17,62" fill="#121212" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
                    <polygon points="55,30 165,30 200,65 200,155 165,190 55,190 20,155 20,65" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="2" strokeLinejoin="round" />

                    {/* Main Outer circle roadway ring */}
                    <circle cx="110" cy="110" r="56" fill="url(#mythic-carbon)" stroke="#000000" strokeWidth="3.5" />

                    {/* Inner Gold Ring border */}
                    <circle cx="110" cy="110" r="46" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="2.5" />

                    {/* Inner Asphalt Ring */}
                    <circle cx="110" cy="110" r="44" fill="#1c1917" stroke="#000000" strokeWidth="2" />

                    {/* White Dashed Lane Markings */}
                    <circle cx="110" cy="110" r="40" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />

                    {/* ── INTEGRATED SIDE LIGHTS & WARNING SIGNS ── */}
                    {/* Left Traffic Light Stack */}
                    <rect x="44" y="93" width="12" height="34" rx="2.5" fill="#0f172a" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="50" cy="99" r="3.2" className="mythic-light-red" stroke="#000000" strokeWidth="1" />
                    <circle cx="50" cy="110" r="3.2" className="mythic-light-yellow" stroke="#000000" strokeWidth="1" />
                    <circle cx="50" cy="121" r="3.2" className="mythic-light-green" stroke="#000000" strokeWidth="1" />

                    {/* Right Traffic Light Stack */}
                    <rect x="164" y="93" width="12" height="34" rx="2.5" fill="#0f172a" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="170" cy="99" r="3.2" className="mythic-light-red" stroke="#000000" strokeWidth="1" />
                    <circle cx="170" cy="110" r="3.2" className="mythic-light-yellow" stroke="#000000" strokeWidth="1" />
                    <circle cx="170" cy="121" r="3.2" className="mythic-light-green" stroke="#000000" strokeWidth="1" />

                    {/* Upper Left warning sign: Pedestrian crossing */}
                    <polygon points="32,50 42,60 32,70 22,60" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="32" cy="55.2" r="1.3" fill="#000000" />
                    <path d="M 32 56.5 L 32 62 L 29 66 M 32 62 L 35 66 M 29.5 59 L 34.5 59" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />

                    {/* Upper Right warning sign: Car symbol */}
                    <polygon points="188,50 198,60 188,70 178,60" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 183.5 62.5 L 185 59.5 Q 188 57.5 191 59.5 L 192.5 62.5 Z" fill="#000000" />
                    <rect x="181.5" y="62.5" width="13" height="3.5" rx="0.8" fill="#000000" />
                    <circle cx="184.5" cy="66.5" r="1.2" fill="#000000" />
                    <circle cx="191.5" cy="66.5" r="1.2" fill="#000000" />

                    {/* ── TOP POLICE CHIEF PEAKED CAP ── */}
                    {/* Cap back structure & shadow */}
                    <ellipse cx="110" cy="23" rx="43" ry="17" fill="#121212" stroke="#000000" strokeWidth="2.5" />
                    {/* Gold cap crown top */}
                    <path d="M 67 21 C 72 0, 148 0, 153 21 C 143 27, 77 27, 67 21 Z" fill="#1c1917" stroke="url(#mythic-gold-metal)" strokeWidth="3" />
                    {/* Gold trim band */}
                    <path d="M 74 23 C 84 26, 136 26, 146 23 L 146 26 C 136 29, 84 29, 74 26 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1" />
                    {/* Polished black visor (bill) */}
                    <path d="M 75 26 C 81 39, 139 39, 145 26 C 142 30, 78 30, 75 26 Z" fill="#000000" stroke="url(#mythic-gold-metal)" strokeWidth="1.5" />
                    {/* Golden Officer Badge Wreath */}
                    <polygon points="104,10 116,10 119,18 110,25 101,18" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1" />
                    <polygon points="110,12 111.5,15 115,15 112,17 113,21 110,19 107,21 108,17 105,15 108.5,15" fill="#1c1917" />
                    <path d="M 97 22 Q 102 25 110 25 Q 118 25 123 22" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="1.5" />
                    {/* Eagle topper */}
                    <path d="M 103 9 Q 110 4 117 9 Q 110 11 103 9" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1" />

                    {/* ── SYMMETRICAL GOLD LAUREL WREATHS (SIDES) ── */}
                    {/* Left Wreath Leaves */}
                    <path d="M 25 145 Q 18 138 22 132 Q 28 138 25 145 Z M 22 130 Q 14 122 18 116 Q 25 122 22 130 Z M 18 112 Q 10 104 14 98 Q 21 104 18 112 Z M 16 94 Q 8 86 12 80 Q 19 86 16 94 Z M 18 76 Q 10 68 14 62 Q 21 68 18 76 Z M 22 58 Q 15 50 19 44 Q 26 50 22 58 Z M 27 42 Q 22 34 26 28 Q 32 34 27 42 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.2" />
                    {/* Right Wreath Leaves (Reflected) */}
                    <path d="M 195 145 Q 202 138 198 132 Q 192 138 195 145 Z M 198 130 Q 206 122 202 116 Q 195 122 198 130 Z M 202 112 Q 210 104 206 98 Q 199 104 202 112 Z M 204 94 Q 212 86 208 80 Q 201 86 204 94 Z M 202 76 Q 210 68 206 62 Q 199 68 202 76 Z M 198 58 Q 205 50 201 44 Q 194 50 198 58 Z M 193 42 Q 198 34 194 28 Q 188 34 193 42 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.2" />

                    {/* ── SYMMETRICAL EMERGENCY SIREN FLASHERS (BOTTOM SIDES) ── */}
                    {/* Left Siren: Red Dome & Bracket */}
                    <path d="M 23 172 L 47 172 L 43 182 L 27 182 Z" fill="#2d2d30" stroke="#000000" strokeWidth="1.5" />
                    <rect x="18" y="160" width="34" height="12" rx="4" className="mythic-siren-red" stroke="#000000" strokeWidth="1.5" />
                    {/* Left Spotlight under Siren */}
                    <circle cx="35" cy="189" r="11" fill="#18181b" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="35" cy="189" r="8" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1" />

                    {/* Right Siren: Blue Dome & Bracket */}
                    <path d="M 173 172 L 197 172 L 193 182 L 177 182 Z" fill="#2d2d30" stroke="#000000" strokeWidth="1.5" />
                    <rect x="168" y="160" width="34" height="12" rx="4" className="mythic-siren-blue" stroke="#000000" strokeWidth="1.5" />
                    {/* Right Spotlight under Siren */}
                    <circle cx="185" cy="189" r="11" fill="#18181b" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="185" cy="189" r="8" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1" />

                    {/* ── OFFICER SHIELD BADGE (CENTER BOTTOM) ── */}
                    <path d="M 100 142 L 120 142 L 120 152 Q 110 162 100 152 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <polygon points="110,146 111.5,150 115,150 112,152 113.5,155.5 110,153.5 106.5,155.5 108,152 105,150 108.5,150" fill="#121212" />
                    <circle cx="106" cy="144" r="0.8" fill="#121212" />
                    <circle cx="110" cy="143" r="0.8" fill="#121212" />
                    <circle cx="114" cy="144" r="0.8" fill="#121212" />

                    {/* ── LICENSE NAMEPLATE ── */}
                    <rect x="65" y="168" width="90" height="24" rx="4" fill="#0c0a09" stroke="url(#mythic-gold-metal)" strokeWidth="3" />
                    <text x="110" y="184" fill="#fbbf24" stroke="#000000" strokeWidth="0.5" fontSize="13" fontWeight="950" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1.2">MYTHIC</text>

                    {/* ── WARNING CAUTION TRIANGLE (BOTTOM CENTER) ── */}
                    <polygon points="110,195 126,218 94,218" fill="#eab308" stroke="#000000" strokeWidth="2" />
                    <circle cx="110" cy="214" r="1.5" fill="#000000" />
                    <path d="M 110 201 L 110 209" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                </svg>

                {/* Sweeping purple/gold luxury shine overlay */}
                <div className="mythic-avatar__shine" aria-hidden="true" />

                {/* HUD Ring Glow around photo cutout */}
                <div className="mythic-avatar__ring-glow" aria-hidden="true" />

                {/* Crown jewels beacon glow */}
                <div className="mythic-avatar__crown-glow" aria-hidden="true" />

                {/* Flashing yellow lightning bolts (left & right) */}
                <div className="mythic-avatar__lightning-glow mythic-avatar__lightning-glow--left" aria-hidden="true" />
                <div className="mythic-avatar__lightning-glow mythic-avatar__lightning-glow--right" aria-hidden="true" />

                {/* Blinking caution warning sign (bottom-left) - hazard blink */}
                <div className="mythic-avatar__caution-glow" aria-hidden="true" />

                {/* Shimmering trophy glow (bottom-right) */}
                <div className="mythic-avatar__trophy-glow" aria-hidden="true" />

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
