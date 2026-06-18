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
    const scale = typeof size === "number" ? size / 96 : SCALE[size];
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
                    viewBox="0 0 200 200"
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
                    <polygon points="45,20 155,20 190,55 190,145 155,180 45,180 10,145 10,55" fill="#000000" transform="translate(4, 4)" />

                    {/* Multi-layered Premium Gold/White Octagonal Shield (Transparent Background) */}
                    <polygon points="45,20 155,20 190,55 190,145 155,180 45,180 10,145 10,55" fill="rgba(15, 23, 42, 0.6)" stroke="url(#mythic-gold-metal)" strokeWidth="4.5" strokeLinejoin="round" />
                    <polygon points="48,24 152,24 186,58 186,142 152,176 48,176 14,142 14,58" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                    <polygon points="50,26 150,26 183,59 183,141 150,174 50,174 17,141 17,59" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="1" strokeLinejoin="round" />

                    {/* Main Outer circle roadway ring */}
                    <circle cx="100" cy="100" r="51" fill="none" stroke="#ffffff" strokeWidth="3" />

                    {/* Inner Gold Ring border */}
                    <circle cx="100" cy="100" r="43" fill="none" stroke="#ffffff" strokeWidth="1.5" />

                    {/* White Dashed Lane Markings */}
                    <circle cx="100" cy="100" r="39" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />

                    {/* ── INTEGRATED SIDE LIGHTS & WARNING SIGNS ── */}
                    {/* Left Traffic Light Stack */}
                    <rect x="39" y="85" width="11" height="31" rx="2" fill="#0f172a" stroke="#ffffff" strokeWidth="1.2" />
                    <circle cx="44.5" cy="90.5" r="2.9" className="mythic-light-red" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="44.5" cy="100.5" r="2.9" className="mythic-light-yellow" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="44.5" cy="110.5" r="2.9" className="mythic-light-green" stroke="#000000" strokeWidth="0.8" />

                    {/* Right Traffic Light Stack */}
                    <rect x="150" y="85" width="11" height="31" rx="2" fill="#0f172a" stroke="#ffffff" strokeWidth="1.2" />
                    <circle cx="155.5" cy="90.5" r="2.9" className="mythic-light-red" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="155.5" cy="100.5" r="2.9" className="mythic-light-yellow" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="155.5" cy="110.5" r="2.9" className="mythic-light-green" stroke="#000000" strokeWidth="0.8" />

                    {/* Upper Left warning sign: Pedestrian crossing */}
                    <polygon points="29,45 38,54 29,63 20,54" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="29" cy="49.5" r="1.2" fill="#ffffff" />
                    <path d="M 29 50.8 L 29 55.8 L 26 59.4 M 29 55.8 L 32 59.4 M 26.5 53.2 L 31.5 53.2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

                    {/* Upper Right warning sign: Car symbol */}
                    <polygon points="171,45 180,54 171,63 162,54" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    <path d="M 166.5 56.5 L 168 53.8 Q 171 52 174 53.8 L 175.5 56.5 Z" fill="#ffffff" />
                    <rect x="164.5" y="56.5" width="13" height="3" rx="0.7" fill="#ffffff" />
                    <circle cx="167.5" cy="60" r="1" fill="#ffffff" />
                    <circle cx="174.5" cy="60" r="1" fill="#ffffff" />

                    {/* ── TOP POLICE CHIEF PEAKED CAP ── */}
                    {/* Cap back structure & shadow */}
                    <ellipse cx="100" cy="22" rx="38" ry="15" fill="#121212" stroke="#000000" strokeWidth="2" />
                    {/* Gold cap crown top */}
                    <path d="M 62 21 C 66 2, 134 2, 138 21 C 129 26, 71 26, 62 21 Z" fill="#1c1917" stroke="url(#mythic-gold-metal)" strokeWidth="2.5" />
                    {/* Gold trim band */}
                    <path d="M 68 23 C 77 25.5, 123 25.5, 132 23 L 132 25.5 C 123 28, 77 28, 68 25.5 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="0.8" />
                    {/* Visor (bill) with white accent */}
                    <path d="M 69 25.5 C 74 37, 126 37, 131 25.5 C 128 29.5, 72 29.5, 69 25.5 Z" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Golden Officer Badge Wreath */}
                    <polygon points="95,10 105,10 108,17 100,23 92,17" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="0.8" />
                    <polygon points="100,12 101.5,14.5 104.5,14.5 102,16 103,19.5 100,17.5 97,19.5 98,16 95.5,14.5 98.5,14.5" fill="#1c1917" />
                    <path d="M 88 21 Q 93 24 100 24 Q 107 24 112 21" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="1.2" />
                    {/* Eagle topper in white */}
                    <path d="M 94 9 Q 100 4 106 9 Q 100 11 94 9" fill="#ffffff" stroke="#000000" strokeWidth="0.8" />

                    {/* ── SYMMETRICAL GOLD/WHITE LAUREL WREATHS (SIDES) ── */}
                    {/* Left Wreath Leaves */}
                    <path d="M 23 130 Q 17 124 20 118 Q 26 124 23 130 Z M 20 117 Q 13 110 16 104 Q 23 110 20 117 Z M 17 101 Q 10 94 13 88 Q 20 94 17 101 Z M 15 85 Q 8 78 11 72 Q 18 78 15 85 Z M 17 69 Q 10 62 13 56 Q 20 62 17 69 Z M 20 53 Q 14 46 17 40 Q 23 46 20 53 Z M 25 39 Q 20 32 24 26 Q 29 32 25 39 Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                    {/* Right Wreath Leaves (Reflected) */}
                    <path d="M 177 130 Q 183 124 180 118 Q 174 124 177 130 Z M 180 117 Q 187 110 184 104 Q 177 110 180 117 Z M 183 101 Q 190 94 187 88 Q 180 94 183 101 Z M 185 85 Q 192 78 189 72 Q 182 78 185 85 Z M 183 69 Q 190 62 187 56 Q 180 62 183 69 Z M 180 53 Q 186 46 183 40 Q 177 46 180 53 Z M 175 39 Q 180 32 176 26 Q 171 32 175 39 Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />

                    {/* ── SYMMETRICAL EMERGENCY SIREN FLASHERS (BOTTOM SIDES) ── */}
                    {/* Left Siren: Red Dome & Bracket */}
                    <path d="M 21 156 L 43 156 L 39 165 L 25 165 Z" fill="#2d2d30" stroke="#000000" strokeWidth="1" />
                    <rect x="17" y="145" width="30" height="11" rx="3.5" className="mythic-siren-red" stroke="#ffffff" strokeWidth="1.2" />
                    {/* Left Spotlight under Siren */}
                    <circle cx="32" cy="172" r="9" fill="#18181b" stroke="#ffffff" strokeWidth="1.2" />
                    <circle cx="32" cy="172" r="6.5" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="0.8" />

                    {/* Right Siren: Blue Dome & Bracket */}
                    <path d="M 157 156 L 179 156 L 175 165 L 161 165 Z" fill="#2d2d30" stroke="#000000" strokeWidth="1" />
                    <rect x="153" y="145" width="30" height="11" rx="3.5" className="mythic-siren-blue" stroke="#ffffff" strokeWidth="1.2" />
                    {/* Right Spotlight under Siren */}
                    <circle cx="168" cy="172" r="9" fill="#18181b" stroke="#ffffff" strokeWidth="1.2" />
                    <circle cx="168" cy="172" r="6.5" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="0.8" />

                    {/* ── OFFICER SHIELD BADGE (CENTER BOTTOM) ── */}
                    <path d="M 91 129 L 109 129 L 109 138 Q 100 147 91 138 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    <polygon points="100,132 101.2,135 104,135 101.8,136.5 102.8,139.5 100,137.8 97.2,139.5 98.2,136.5 96,135 98.8,135" fill="#ffffff" />
                    <circle cx="96" cy="131" r="0.7" fill="#ffffff" />
                    <circle cx="100" cy="130" r="0.7" fill="#ffffff" />
                    <circle cx="104" cy="131" r="0.7" fill="#ffffff" />

                    {/* ── LICENSE NAMEPLATE ── */}
                    <rect x="60" y="152" width="80" height="22" rx="4" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                    <text x="100" y="167" fill="#ffffff" fontSize="12" fontWeight="950" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1">MYTHIC</text>

                    {/* ── WARNING CAUTION TRIANGLE (BOTTOM CENTER) ── */}
                    <polygon points="100,177 115,198 85,198" fill="none" stroke="#ffffff" strokeWidth="1.8" />
                    <circle cx="100" cy="194" r="1.3" fill="#ffffff" />
                    <path d="M 100 183 L 100 190" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
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
