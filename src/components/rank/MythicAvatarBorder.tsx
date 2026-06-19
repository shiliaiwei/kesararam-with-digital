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
                {/* Purple + gold road-safety crest frame (scalable SVG, no PNG). */}
                <svg
                    className="mythic-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Animated purple sweep — sanctioned tier gradient. */}
                        <linearGradient id="mythic-purple-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7e22ce" />
                            <stop offset="32%" stopColor="#a855f7" />
                            <stop offset="50%" stopColor="#f3e8ff">
                                <animate attributeName="offset" values="0;1;0" dur="3.4s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="68%" stopColor="#9333ea" />
                            <stop offset="100%" stopColor="#4c1d95" />
                        </linearGradient>
                        <linearGradient id="mythic-purple-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="48%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#5b21b6" />
                        </linearGradient>
                        {/* Animated gold sweep for crown / banner / bolts. */}
                        <linearGradient id="mythic-gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#eab308" />
                            <stop offset="35%" stopColor="#fde047" />
                            <stop offset="50%" stopColor="#fffbe6">
                                <animate attributeName="offset" values="0;1;0" dur="3.4s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="65%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#a16207" />
                        </linearGradient>
                        <linearGradient id="mythic-gold-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="48%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#a16207" />
                        </linearGradient>
                        <radialGradient id="mythic-asphalt" cx="50%" cy="44%" r="58%">
                            <stop offset="0%" stopColor="#1a1625" />
                            <stop offset="100%" stopColor="#050208" />
                        </radialGradient>
                    </defs>

                    {/* Hard offset shadow (brutalist, zero blur). */}
                    <polygon points="54,12 146,12 188,54 188,146 146,188 54,188 12,146 12,54" fill="#000000" transform="translate(3.5,4)" />

                    {/* ── YELLOW LIGHTNING BOLTS (behind, flanking the sides) ── */}
                    <g stroke="#000000" strokeWidth="2" strokeLinejoin="round">
                        <path d="M 48 64 L 30 100 L 45 100 L 22 150 L 54 104 L 39 104 L 56 72 Z" fill="url(#mythic-gold-bevel)" />
                        <path d="M 152 64 L 170 100 L 155 100 L 178 150 L 146 104 L 161 104 L 144 72 Z" fill="url(#mythic-gold-bevel)" />
                    </g>

                    {/* ── OCTAGON BODY (dark) ── */}
                    <polygon points="54,12 146,12 188,54 188,146 146,188 54,188 12,146 12,54" fill="#0c0a14" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
                    <polygon points="58,18 142,18 182,58 182,142 142,182 58,182 18,142 18,58" fill="none" stroke="#7e22ce" strokeWidth="1.4" strokeLinejoin="round" opacity="0.8" />

                    {/* ── PURPLE ARMOUR PANELS (slanted, with white hairline) ── */}
                    {[
                        "24,56 48,46 54,150 30,160",      // left
                        "176,56 152,46 146,150 170,160",  // right
                        "50,40 56,18 92,18 88,38",        // top-left
                        "150,40 144,18 108,18 112,38",    // top-right
                    ].map((pts, i) => (
                        <g key={`panel-${i}`}>
                            <polygon points={pts} fill="url(#mythic-purple-bevel)" stroke="#000000" strokeWidth="1.6" strokeLinejoin="round" />
                            <polygon points={pts} fill="none" stroke="#e9d5ff" strokeWidth="0.7" strokeLinejoin="round" opacity="0.5" />
                        </g>
                    ))}
                    {/* traffic-light stacks on the side panels (strobing) */}
                    {[38, 162].map((cx) => (
                        <g key={`mtl-${cx}`}>
                            <rect x={cx - 6.5} y="82" width="13" height="38" rx="6" fill="#0c0a14" stroke="url(#mythic-purple-metal)" strokeWidth="1.4" />
                            <circle cx={cx} cy="90" r="3.5" className="mythic-light-red" stroke="#000000" strokeWidth="0.7" />
                            <circle cx={cx} cy="101" r="3.5" className="mythic-light-yellow" stroke="#000000" strokeWidth="0.7" />
                            <circle cx={cx} cy="112" r="3.5" className="mythic-light-green" stroke="#000000" strokeWidth="0.7" />
                        </g>
                    ))}

                    {/* ── ASPHALT ROAD RING with white dashed lane (around the photo) ── */}
                    <circle cx="100" cy="100" r="54" fill="url(#mythic-asphalt)" />
                    <circle cx="100" cy="100" r="54" fill="none" stroke="url(#mythic-purple-metal)" strokeWidth="3.4" />
                    <circle cx="100" cy="100" r="50" fill="none" stroke="#1c1917" strokeWidth="4" />
                    <circle cx="100" cy="100" r="46.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeDasharray="6 6" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="41" fill="none" stroke="url(#mythic-gold-metal)" strokeWidth="1.6" />

                    {/* ── GOLD CROWN (top centre; the division medallion is its jewel) ── */}
                    <path d="M 64 40 L 61 14 L 80 30 L 100 5 L 120 30 L 139 14 L 136 40 Z" fill="url(#mythic-gold-bevel)" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M 66 39 L 134 39" stroke="#a16207" strokeWidth="1" opacity="0.7" />
                    {[[61, 14], [100, 5], [139, 14]].map(([cx, cy]) => (
                        <circle key={`tip-${cx}`} cx={cx} cy={cy} r="3" fill="url(#mythic-gold-metal)" stroke="#000000" strokeWidth="0.8" />
                    ))}
                    {/* police strobe lights on the crown band (red + blue) */}
                    <rect x="74" y="33" width="8" height="4.4" rx="1.2" className="mythic-siren-red" stroke="#000000" strokeWidth="0.5" />
                    <rect x="118" y="33" width="8" height="4.4" rx="1.2" className="mythic-siren-blue" stroke="#000000" strokeWidth="0.5" />

                    {/* ── MYTHIC NAMEPLATE BANNER (purple + gold) ── */}
                    <polygon points="54,150 146,150 152,162 146,174 54,174 48,162" fill="#000000" transform="translate(1.5,2)" />
                    <polygon points="54,150 146,150 152,162 146,174 54,174 48,162" fill="url(#mythic-purple-bevel)" stroke="url(#mythic-gold-metal)" strokeWidth="2.4" strokeLinejoin="round" />
                    <polygon points="57,153 143,153 148,162 143,171 57,171 52,162" fill="none" stroke="#e9d5ff" strokeWidth="0.7" strokeLinejoin="round" opacity="0.6" />
                    <text x="100" y="166.5" fill="#ffffff" stroke="#3b0764" strokeWidth="0.3" fontSize="12.5" fontWeight="900" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1.5">MYTHIC</text>

                    {/* Bottom road hint: gold edge lines fanning to the corners. */}
                    <g stroke="url(#mythic-gold-metal)" strokeWidth="2" strokeLinecap="round">
                        <path d="M 50 176 L 34 186" />
                        <path d="M 150 176 L 166 186" />
                    </g>
                    <path d="M 100 176 L 100 186" stroke="#ffffff" strokeWidth="1.6" strokeDasharray="3 3" />
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

                {/* Division Badge (top-centre, on the crown) */}
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
