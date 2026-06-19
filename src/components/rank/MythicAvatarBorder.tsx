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
                {/* Premium gold + carbon road-command frame (scalable SVG, no PNG). */}
                <svg
                    className="mythic-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Animated metallic gold sweep — sanctioned tier gradient. */}
                        <linearGradient id="mythic-gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffe9a8" />
                            <stop offset="30%" stopColor="#f3b021" />
                            <stop offset="50%" stopColor="#fff7d6">
                                <animate attributeName="offset" values="0;1;0" dur="3.2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="64%" stopColor="#e3941a" />
                            <stop offset="100%" stopColor="#8f520a" />
                        </linearGradient>
                        {/* Vertical gold bevel for raised edges. */}
                        <linearGradient id="mythic-gold-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffe9a8" />
                            <stop offset="46%" stopColor="#efa61d" />
                            <stop offset="100%" stopColor="#7c4a08" />
                        </linearGradient>
                        {/* Dark carbon body. */}
                        <radialGradient id="mythic-carbon" cx="50%" cy="36%" r="78%">
                            <stop offset="0%" stopColor="#3a3733" />
                            <stop offset="68%" stopColor="#17130f" />
                            <stop offset="100%" stopColor="#070707" />
                        </radialGradient>
                        {/* Asphalt roadway ring. */}
                        <radialGradient id="mythic-asphalt" cx="50%" cy="44%" r="58%">
                            <stop offset="0%" stopColor="#26292e" />
                            <stop offset="100%" stopColor="#0a0b0d" />
                        </radialGradient>
                        {/* Glossy traffic-light lenses. */}
                        <radialGradient id="mythic-lens-red" cx="36%" cy="30%" r="72%">
                            <stop offset="0%" stopColor="#ffe2e2" /><stop offset="42%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" />
                        </radialGradient>
                        <radialGradient id="mythic-lens-yellow" cx="36%" cy="30%" r="72%">
                            <stop offset="0%" stopColor="#fff3c4" /><stop offset="42%" stopColor="#eab308" /><stop offset="100%" stopColor="#713f12" />
                        </radialGradient>
                        <radialGradient id="mythic-lens-green" cx="36%" cy="30%" r="72%">
                            <stop offset="0%" stopColor="#d9ffe6" /><stop offset="42%" stopColor="#22c55e" /><stop offset="100%" stopColor="#14532d" />
                        </radialGradient>
                        {/* Caution-tape stripe (brand). */}
                        <pattern id="mythic-tape" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                            <rect width="9" height="9" fill="#eab308" />
                            <rect width="4.5" height="9" fill="#0a0a0a" />
                        </pattern>
                    </defs>

                    {/* Hard offset shadow (brutalist, zero blur). */}
                    <polygon points="54,14 146,14 186,54 186,146 146,186 54,186 14,146 14,54" fill="#000000" transform="translate(3.5,4)" />

                    {/* ── GOLD SIDE WINGS (behind the body) ── */}
                    <g stroke="#000000" strokeWidth="0.8" strokeLinejoin="round">
                        <path d="M 30 70 L 6 64 L 24 78 L 4 76 L 22 88 L 6 90 L 30 96 Z" fill="url(#mythic-gold-bevel)" />
                        <path d="M 170 70 L 194 64 L 176 78 L 196 76 L 178 88 L 194 90 L 170 96 Z" fill="url(#mythic-gold-bevel)" />
                    </g>

                    {/* ── OUTER GOLD FRAME + CARBON BODY ── */}
                    <polygon points="54,14 146,14 186,54 186,146 146,186 54,186 14,146 14,54" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
                    <polygon points="58,20 142,20 180,58 180,142 142,180 58,180 20,142 20,58" fill="none" stroke="#fff7d6" strokeWidth="1" strokeLinejoin="round" opacity="0.8" />
                    <polygon points="60,23 140,23 177,60 177,140 140,177 60,177 23,140 23,60" fill="url(#mythic-carbon)" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />

                    {/* Caution tape across the two bottom cut corners. */}
                    <polygon points="23,140 60,177 40,177 23,160" fill="url(#mythic-tape)" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round" />
                    <polygon points="177,140 140,177 160,177 177,160" fill="url(#mythic-tape)" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round" />

                    {/* Gold rib accents flanking the top. */}
                    <g fill="url(#mythic-gold-bevel)" stroke="#000000" strokeWidth="0.7">
                        <rect x="34" y="40" width="6" height="30" rx="1.5" />
                        <rect x="43" y="44" width="5" height="24" rx="1.5" />
                        <rect x="160" y="40" width="6" height="30" rx="1.5" />
                        <rect x="152" y="44" width="5" height="24" rx="1.5" />
                    </g>

                    {/* ── ASPHALT ROADWAY RING (around the photo window) ── */}
                    <circle cx="100" cy="100" r="55" fill="url(#mythic-asphalt)" />
                    <circle cx="100" cy="100" r="55" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="3.5" />
                    <circle cx="100" cy="100" r="50.5" fill="none" stroke="#fff7d6" strokeWidth="1" opacity="0.85" />
                    <circle cx="100" cy="100" r="46" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeDasharray="5 5" opacity="0.85" />
                    {/* Blue road glints. */}
                    <path d="M 66 64 A 48 48 0 0 1 78 56" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
                    <path d="M 134 64 A 48 48 0 0 0 122 56" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
                    <circle cx="100" cy="100" r="40" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="2" />

                    {/* ── TWIN TRAFFIC-LIGHT STACKS — red + yellow only (left & right) ── */}
                    {[26, 174].map((cx) => (
                        <g key={cx}>
                            <rect x={cx - 7} y="87" width="14" height="27" rx="3" fill="#0f1115" stroke="url(#mythic-gold-metal)" strokeWidth="1.6" />
                            <circle cx={cx} cy="95" r="3.8" className="mythic-light-red" style={{ fill: animated ? undefined : "url(#mythic-lens-red)" }} stroke="#000000" strokeWidth="0.8" />
                            <circle cx={cx} cy="106" r="3.8" className="mythic-light-yellow" style={{ fill: animated ? undefined : "url(#mythic-lens-yellow)" }} stroke="#000000" strokeWidth="0.8" />
                            {/* gloss highlights */}
                            <circle cx={cx - 1.3} cy="93.5" r="1.2" fill="#ffffff" opacity="0.65" />
                            <circle cx={cx - 1.3} cy="104.5" r="1.2" fill="#ffffff" opacity="0.5" />
                        </g>
                    ))}

                    {/* ── TOP POLICE PEAKED CAP ── */}
                    <ellipse cx="100" cy="26" rx="40" ry="15" fill="#101010" stroke="#000000" strokeWidth="2" />
                    <path d="M 61 25 C 66 4, 134 4, 139 25 C 129 30, 71 30, 61 25 Z" fill="url(#mythic-carbon)" stroke="url(#mythic-gold-metal)" strokeWidth="2.4" />
                    <path d="M 66 26 C 76 29, 124 29, 134 26 L 134 29.5 C 124 33, 76 33, 66 29.5 Z" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="0.8" />
                    <path d="M 67 29.5 C 73 41, 127 41, 133 29.5 C 129 34, 71 34, 67 29.5 Z" fill="#050505" stroke="url(#mythic-gold-metal)" strokeWidth="1.4" />
                    {/* red + blue light strip on the cap band */}
                    <rect x="84" y="27.2" width="7" height="3.4" rx="1" className="mythic-siren-red" stroke="#000000" strokeWidth="0.5" />
                    <rect x="109" y="27.2" width="7" height="3.4" rx="1" className="mythic-siren-blue" stroke="#000000" strokeWidth="0.5" />
                    {/* gold star shield emblem on the crown */}
                    <path d="M 92 9 L 108 9 L 108 17 Q 100 23 92 17 Z" fill="url(#mythic-gold-bevel)" stroke="#000000" strokeWidth="0.9" />
                    <polygon points="100,11 101.6,14.4 105.3,14.4 102.3,16.6 103.4,20 100,17.9 96.6,20 97.7,16.6 94.7,14.4 98.4,14.4" fill="#1c1917" />
                    {/* laurel sprigs */}
                    <path d="M 66 22 Q 74 26 80 24 M 70 19 Q 76 22 81 21 M 64 25 Q 71 29 77 28" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 134 22 Q 126 26 120 24 M 130 19 Q 124 22 119 21 M 136 25 Q 129 29 123 28" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="1.5" strokeLinecap="round" />

                    {/* ── EMERGENCY SIREN FLASHERS (bottom corners) ── */}
                    {/* Left red siren */}
                    <path d="M 24 158 L 48 158 L 44 167 L 28 167 Z" fill="#2a2a2d" stroke="#000000" strokeWidth="1" />
                    <rect x="20" y="147" width="32" height="11" rx="3.5" className="mythic-siren-red" stroke="url(#mythic-gold-metal)" strokeWidth="1.3" />
                    <rect x="23" y="149" width="9" height="3" rx="1.5" fill="#ffffff" opacity="0.55" />
                    {/* Right blue siren */}
                    <path d="M 152 158 L 176 158 L 172 167 L 156 167 Z" fill="#2a2a2d" stroke="#000000" strokeWidth="1" />
                    <rect x="148" y="147" width="32" height="11" rx="3.5" className="mythic-siren-blue" stroke="url(#mythic-gold-metal)" strokeWidth="1.3" />
                    <rect x="151" y="149" width="9" height="3" rx="1.5" fill="#ffffff" opacity="0.55" />

                    {/* ── MYTHIC NAMEPLATE BANNER ── */}
                    <polygon points="58,150 142,150 148,162 142,174 58,174 52,162" fill="#000000" transform="translate(1.5,2)" />
                    <polygon points="58,150 142,150 148,162 142,174 58,174 52,162" fill="#0c0a09" stroke="url(#mythic-gold-metal)" strokeWidth="2.4" strokeLinejoin="round" />
                    <polygon points="61,153 139,153 144,162 139,171 61,171 56,162" fill="none" stroke="#fff7d6" strokeWidth="0.7" strokeLinejoin="round" opacity="0.7" />
                    <polygon points="66,160 69,158 69,166 66,164" fill="url(#mythic-gold-metal)" />
                    <polygon points="134,160 131,158 131,166 134,164" fill="url(#mythic-gold-metal)" />
                    <text x="100" y="166.5" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="0.4" fontSize="13" fontWeight="900" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1.5">MYTHIC</text>

                    {/* ── BOTTOM GOLD STAR SHIELD ── */}
                    <path d="M 88 176 L 112 176 L 112 188 Q 100 198 88 188 Z" fill="url(#mythic-gold-bevel)" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round" />
                    <polygon points="100,179 102,183.4 106.8,183.6 103,186.6 104.4,191.2 100,188.6 95.6,191.2 97,186.6 93.2,183.6 98,183.4" fill="#1c1917" />
                </svg>

                {/* Sweeping purple/gold luxury shine overlay */}
                <div className="mythic-avatar__shine" aria-hidden="true" />

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
