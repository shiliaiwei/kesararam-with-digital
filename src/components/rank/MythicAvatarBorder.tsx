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

                    {/* ── TOP MAJESTIC GOLD CROWN ── */}
                    <path d="M 68 32 C 80 34, 140 34, 152 32 L 150 14 C 145 19, 142 22, 138 23 L 130 6 C 125 13, 122 17, 118 18 L 110 0 L 102 18 C 98 17, 95 13, 90 6 L 82 23 C 78 22, 75 19, 70 14 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
                    {/* Crown jewels: alternating siren strobes */}
                    <circle cx="110" cy="0" r="4" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.2" />
                    <circle cx="90" cy="6" r="3.2" className="mythic-siren-blue" stroke="#000000" strokeWidth="1" />
                    <circle cx="130" cy="6" r="3.2" className="mythic-siren-red" stroke="#000000" strokeWidth="1" />
                    <circle cx="70" cy="14" r="2.5" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1" />
                    <circle cx="150" cy="14" r="2.5" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1" />
                    {/* Crown Base Shield Insignia */}
                    <path d="M 103 23 L 117 23 L 117 32 Q 110 39 103 32 Z" fill="#000000" stroke="url(#mythic-gold-metal)" strokeWidth="1.5" />
                    <path d="M 107 26 L 110 29 L 113 26 M 107 30 L 110 33 L 113 30" stroke="url(#mythic-gold-metal)" strokeWidth="1.5" fill="none" />

                    {/* ── SYMMETRICAL GOLD LIGHTNING BOLTS ── */}
                    <polygon points="35,75 15,105 28,107 5,135 38,105 25,103" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
                    <polygon points="185,75 205,105 192,107 215,135 182,105 195,103" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />

                    {/* ── SYMMETRICAL TRAFFIC CONES AT THE BOTTOM ── */}
                    {/* Left Cone */}
                    <path d="M 16 205 L 44 205 L 42 201 L 18 201 Z" fill="#18181b" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 20 201 L 40 201 L 34 172 L 26 172 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 22 190 L 38 190 L 36 181 L 24 181 Z" fill="#18181b" stroke="#000000" strokeWidth="1.2" />

                    {/* Right Cone */}
                    <path d="M 176 205 L 204 205 L 202 201 L 178 201 Z" fill="#18181b" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 180 201 L 200 201 L 194 172 L 186 172 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="1.5" />
                    <path d="M 182 190 L 198 190 L 196 181 L 184 181 Z" fill="#18181b" stroke="#000000" strokeWidth="1.2" />

                    {/* ── WARNING CAUTION TRIANGLE (BOTTOM CENTER) ── */}
                    <polygon points="110,185 128,213 92,213" fill="#eab308" stroke="#000000" strokeWidth="2" />
                    <circle cx="110" cy="208" r="1.8" fill="#000000" />
                    <path d="M 110 193 L 110 203" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

                    {/* ── LICENSE NAMEPLATE ── */}
                    <rect x="65" y="156" width="90" height="26" rx="4" fill="#0c0a09" stroke="url(#mythic-gold-metal)" strokeWidth="3" />
                    <text x="110" y="174" fill="#fbbf24" stroke="#000000" strokeWidth="0.5" fontSize="14" fontWeight="950" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1.2">MYTHIC</text>
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
