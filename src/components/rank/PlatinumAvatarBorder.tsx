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

export interface PlatinumAvatarBorderProps {
    src?: string | null;
    alt: string;
    username?: string;
    score?: number;
    size?: AvatarSize | number;
    animated?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function PlatinumAvatarBorder({
    src,
    alt,
    username,
    score,
    size = "md",
    animated = true,
    className,
    children,
}: PlatinumAvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);
    const scale = typeof size === "number" ? size / 96 : SCALE[size];
    const showCustomAvatar = Boolean(children);
    const showImage = Boolean(src) && !imgFailed && !showCustomAvatar;
    const initial = username?.trim()?.charAt(0)?.toUpperCase() ?? "";

    const clampedScore = score !== undefined ? Math.max(3500, Math.min(6999, score)) : undefined;
    const division = clampedScore !== undefined ? calculateRankAndDivision(clampedScore).division : undefined;

    const vars = {
        "--s": scale,
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "platinum-avatar",
                animated ? "platinum-avatar--animated" : "platinum-avatar--static",
                className,
            )}
            style={vars}
        >
            <div className="platinum-avatar__plate">
                {/* Premium brushed-silver squircle frame (scalable SVG, no PNG). */}
                <svg
                    className="platinum-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Brushed silver/platinum with an animated highlight sweep. */}
                        <linearGradient id="platinum-silver-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="35%" stopColor="#cbd5e1" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate attributeName="offset" values="0;1;0" dur="3.2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="65%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                        {/* Vertical silver bevel for raised plates. */}
                        <linearGradient id="platinum-silver-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f8fafc" />
                            <stop offset="48%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#64748b" />
                        </linearGradient>
                        {/* Blue metallic accent with animated sweep. */}
                        <linearGradient id="platinum-blue-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="40%" stopColor="#60a5fa" />
                            <stop offset="50%" stopColor="#dbeafe">
                                <animate attributeName="offset" values="0;1;0" dur="3.2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="60%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        {/* Dark slate body + asphalt ring. */}
                        <radialGradient id="platinum-carbon" cx="50%" cy="38%" r="78%">
                            <stop offset="0%" stopColor="#243244" />
                            <stop offset="70%" stopColor="#0f172a" />
                            <stop offset="100%" stopColor="#020617" />
                        </radialGradient>
                        <radialGradient id="platinum-asphalt" cx="50%" cy="44%" r="58%">
                            <stop offset="0%" stopColor="#1f2937" />
                            <stop offset="100%" stopColor="#070b12" />
                        </radialGradient>
                        {/* Glossy gem lenses. */}
                        <radialGradient id="platinum-lens-red" cx="36%" cy="30%" r="72%">
                            <stop offset="0%" stopColor="#ffe2e2" /><stop offset="42%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" />
                        </radialGradient>
                        <radialGradient id="platinum-lens-yellow" cx="36%" cy="30%" r="72%">
                            <stop offset="0%" stopColor="#fff3c4" /><stop offset="42%" stopColor="#eab308" /><stop offset="100%" stopColor="#713f12" />
                        </radialGradient>
                        <radialGradient id="platinum-lens-green" cx="36%" cy="30%" r="72%">
                            <stop offset="0%" stopColor="#d9ffe6" /><stop offset="42%" stopColor="#22c55e" /><stop offset="100%" stopColor="#14532d" />
                        </radialGradient>
                    </defs>

                    {/* Hard offset shadow (brutalist, zero blur). */}
                    <rect x="14" y="14" width="172" height="172" rx="30" fill="#000000" transform="translate(3.5,4)" />

                    {/* ── SILVER SQUIRCLE FRAME + DARK BODY ── */}
                    <rect x="14" y="14" width="172" height="172" rx="30" fill="url(#platinum-silver-metal)" stroke="#1e293b" strokeWidth="2" />
                    <rect x="18.5" y="18.5" width="163" height="163" rx="26" fill="none" stroke="#f8fafc" strokeWidth="1" opacity="0.7" />
                    <rect x="24" y="24" width="152" height="152" rx="21" fill="url(#platinum-carbon)" stroke="#0b1220" strokeWidth="1.5" />
                    <rect x="28" y="28" width="144" height="144" rx="18" fill="none" stroke="url(#platinum-blue-metal)" strokeWidth="2" />

                    {/* Corner rivets */}
                    {[[34, 34], [166, 34], [34, 166], [166, 166]].map(([cx, cy]) => (
                        <g key={`${cx}-${cy}`}>
                            <circle cx={cx} cy={cy} r="3.4" fill="url(#platinum-silver-bevel)" stroke="#1e293b" strokeWidth="0.9" />
                            <circle cx={cx} cy={cy} r="1.1" fill="#334155" />
                        </g>
                    ))}

                    {/* ── ASPHALT ROADWAY RING (around the photo window) ── */}
                    <circle cx="100" cy="100" r="53" fill="url(#platinum-asphalt)" />
                    <circle cx="100" cy="100" r="53" fill="none" stroke="url(#platinum-silver-metal)" strokeWidth="3.2" />
                    <circle cx="100" cy="100" r="49" fill="none" stroke="#f8fafc" strokeWidth="1" opacity="0.8" />
                    <circle cx="100" cy="100" r="46" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeDasharray="5 5" opacity="0.95" />
                    <circle cx="100" cy="100" r="43" fill="none" stroke="url(#platinum-blue-metal)" strokeWidth="1.6" />

                    {/* ── RIGHT TRAFFIC-LIGHT CAPSULE (red / yellow / green) ── */}
                    <rect x="148" y="66" width="28" height="72" rx="13" fill="#0b1220" stroke="url(#platinum-silver-metal)" strokeWidth="2" />
                    <rect x="151" y="69" width="22" height="66" rx="10" fill="none" stroke="#1d4ed8" strokeWidth="1" opacity="0.7" />
                    {[
                        { cy: 85, cls: "platinum-light-red", lens: "url(#platinum-lens-red)" },
                        { cy: 102, cls: "platinum-light-yellow", lens: "url(#platinum-lens-yellow)" },
                        { cy: 119, cls: "platinum-light-green", lens: "url(#platinum-lens-green)" },
                    ].map((l) => (
                        <g key={l.cls}>
                            <circle cx="162" cy={l.cy} r="6.3" className={l.cls} style={{ fill: animated ? undefined : l.lens }} stroke="#000000" strokeWidth="0.9" />
                            <circle cx="159.6" cy={l.cy - 2.2} r="1.8" fill="#ffffff" opacity="0.6" />
                        </g>
                    ))}

                    {/* ── LEFT BLUE CHEVRON PLATE ── */}
                    <rect x="20" y="86" width="24" height="28" rx="5" fill="url(#platinum-silver-bevel)" stroke="#1e293b" strokeWidth="1.4" />
                    <path d="M 25 92 L 31 100 L 25 108" fill="none" stroke="url(#platinum-blue-metal)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 32 92 L 38 100 L 32 108" fill="none" stroke="url(#platinum-blue-metal)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />

                    {/* ── TOP-LEFT DIVISION CORNER PLATE (the HTML badge sits on this) ── */}
                    <path d="M 18 30 Q 18 18 30 18 L 60 18 L 18 60 Z" fill="url(#platinum-silver-bevel)" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M 22 28 Q 22 22 28 22 L 50 22" fill="none" stroke="#f8fafc" strokeWidth="1" opacity="0.7" strokeLinecap="round" />

                    {/* ── BOTTOM-RIGHT METAL TAB ── */}
                    <path d="M 152 178 L 178 178 Q 182 178 182 174 L 182 152 Z" fill="url(#platinum-silver-bevel)" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
                    <circle cx="171" cy="171" r="2" fill="#334155" stroke="#1e293b" strokeWidth="0.7" />

                    {/* ── PLATINUM NAMEPLATE ── */}
                    <rect x="52" y="150" width="96" height="22" rx="6" fill="#0b1220" transform="translate(1.5,2)" />
                    <rect x="52" y="150" width="96" height="22" rx="6" fill="url(#platinum-silver-bevel)" stroke="#1e293b" strokeWidth="2" />
                    <rect x="55" y="153" width="90" height="16" rx="4" fill="none" stroke="#f8fafc" strokeWidth="0.7" opacity="0.7" />
                    <text x="100" y="165" fill="#1e293b" fontSize="11" fontWeight="900" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1.5">PLATINUM</text>
                </svg>

                {/* Sweeping silver shine overlay */}
                <div className="platinum-avatar__shine" aria-hidden="true" />

                {/* Glowing chevrons overlay on left */}
                <div className="platinum-avatar__chevron-glow" aria-hidden="true" />

                {/* Soft blue ring light breathing around the inner circular ring */}
                <div className="platinum-avatar__ring-glow" aria-hidden="true" />

                {/* Protected profile photo window in the center */}
                <div className="platinum-avatar__photo">
                    {showCustomAvatar ? (
                        <div className="platinum-avatar__custom-photo" role="img" aria-label={alt}>
                            {children}
                        </div>
                    ) : showImage ? (
                        <img
                            src={src as string}
                            alt={alt}
                            className="platinum-avatar__img"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div className="platinum-avatar__fallback" role="img" aria-label={alt}>
                            {initial || (
                                <User size={Math.round(44 * scale)} strokeWidth={2.5} aria-hidden="true" />
                            )}
                        </div>
                    )}
                </div>

                {/* Division Badge (Top-Left) */}
                {division && (
                    <div className="platinum-avatar__division-badge" aria-label={`Division ${division}`}>
                        <span className="platinum-avatar__division-text">{division}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlatinumAvatarBorder;
