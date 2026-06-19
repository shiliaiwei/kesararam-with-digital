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

export interface DiamondAvatarBorderProps {
    src?: string | null;
    alt: string;
    username?: string;
    score?: number;
    size?: AvatarSize | number;
    animated?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function DiamondAvatarBorder({
    src,
    alt,
    username,
    score,
    size = "md",
    animated = true,
    className,
    children,
}: DiamondAvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);
    const scale = typeof size === "number" ? size / 96 : SCALE[size];
    const showCustomAvatar = Boolean(children);
    const showImage = Boolean(src) && !imgFailed && !showCustomAvatar;
    const initial = username?.trim()?.charAt(0)?.toUpperCase() ?? "";

    const clampedScore = score !== undefined ? Math.max(7000, Math.min(11999, score)) : undefined;
    const division = clampedScore !== undefined ? calculateRankAndDivision(clampedScore).division : undefined;

    const vars = {
        "--s": scale,
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "diamond-avatar",
                animated ? "diamond-avatar--animated" : "diamond-avatar--static",
                className,
            )}
            style={vars}
        >
            <div className="diamond-avatar__plate">
                {/* Scalable SVG Frame instead of a static PNG */}
                <svg
                    className="diamond-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Cyan/Blue Metallic Gradient */}
                        <linearGradient id="diamond-cyan-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="40%" stopColor="#22d3ee" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate
                                    attributeName="offset"
                                    values="0;1;0"
                                    dur="3s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="60%" stopColor="#e0f7fa" />
                            <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>

                        {/* Silver Metallic Gradient for the Outer frame structure */}
                        <linearGradient id="silver-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#475569" />
                            <stop offset="25%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate
                                    attributeName="offset"
                                    values="0;1;0"
                                    dur="4.5s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="75%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#1e293b" />
                        </linearGradient>

                        {/* Gem Blue Gradient for Crystal facets */}
                        <linearGradient id="diamond-blue-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>

                        {/* Dark blue background for outer ring */}
                        <radialGradient id="dark-blue-bg" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#0c1524" />
                            <stop offset="85%" stopColor="#050a12" />
                            <stop offset="100%" stopColor="#020408" />
                        </radialGradient>

                        {/* Dark Asphalt radial gradient */}
                        <radialGradient id="diamond-road-asphalt" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="75%" stopColor="#0f172a" />
                            <stop offset="100%" stopColor="#020617" />
                        </radialGradient>
                    </defs>

                    {/* Brutalist zero-blur shadow for the main frame */}
                    <rect x="26" y="26" width="152" height="152" rx="4" fill="#000000" />

                    {/* Main Beveled Silver Outer Frame Body */}
                    <rect x="22" y="22" width="156" height="156" rx="4" fill="url(#silver-metallic)" stroke="#000000" strokeWidth="4.5" />

                    {/* Inner Dark Blue Pavement plate */}
                    <rect x="26" y="26" width="148" height="148" rx="2" fill="url(#dark-blue-bg)" stroke="#000000" strokeWidth="2.5" />

                    {/* ── SYMMETRICAL CORNER CRYSTALS (FACETED 3D GEMS) ── */}
                    {/* Top-Left Gem */}
                    <g transform="translate(24, 24)">
                        <polygon points="-8,-8 16,-16 28,28 -16,16" fill="#000000" />
                        <polygon points="-8,-8 12,-12 24,24 -12,12" fill="url(#diamond-blue-primary)" stroke="#000000" strokeWidth="1.5" />
                        <polygon points="-8,-8 12,-12 2,-2" fill="#ffffff" opacity="0.6" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="-8,-8 -12,12 -2,2" fill="#06b6d4" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="12,-12 24,24 2,-2" fill="#0284c7" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="-12,12 24,24 -2,2" fill="#0891b2" stroke="#000000" strokeWidth="0.8" />
                    </g>

                    {/* Top-Right Gem */}
                    <g transform="translate(176, 24)">
                        <polygon points="8,-8 -16,-16 -28,28 16,16" fill="#000000" />
                        <polygon points="8,-8 -12,-12 -24,24 12,12" fill="url(#diamond-blue-primary)" stroke="#000000" strokeWidth="1.5" />
                        <polygon points="8,-8 -12,-12 -2,-2" fill="#ffffff" opacity="0.6" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="8,-8 12,12 2,2" fill="#06b6d4" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="-12,-12 -24,24 -2,-2" fill="#0284c7" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="12,12 -24,24 2,2" fill="#0891b2" stroke="#000000" strokeWidth="0.8" />
                    </g>

                    {/* Bottom-Left Gem */}
                    <g transform="translate(24, 176)">
                        <polygon points="-8,8 16,16 28,-28 -16,-16" fill="#000000" />
                        <polygon points="-8,8 12,12 24,-24 -12,-12" fill="url(#diamond-blue-primary)" stroke="#000000" strokeWidth="1.5" />
                        <polygon points="-8,8 12,12 2,2" fill="#ffffff" opacity="0.6" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="-8,8 -12,-12 -2,-2" fill="#06b6d4" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="12,12 24,-24 2,2" fill="#0284c7" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="-12,-12 24,-24 -2,-2" fill="#0891b2" stroke="#000000" strokeWidth="0.8" />
                    </g>

                    {/* Bottom-Right Gem */}
                    <g transform="translate(176, 176)">
                        <polygon points="8,8 -16,16 -28,-28 16,-16" fill="#000000" />
                        <polygon points="8,8 -12,12 -24,-24 12,-12" fill="url(#diamond-blue-primary)" stroke="#000000" strokeWidth="1.5" />
                        <polygon points="8,8 -12,12 -2,2" fill="#ffffff" opacity="0.6" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="8,8 12,-12 2,-2" fill="#06b6d4" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="-12,12 -24,-24 -2,2" fill="#0284c7" stroke="#000000" strokeWidth="0.8" />
                        <polygon points="12,-12 -24,-24 2,-2" fill="#0891b2" stroke="#000000" strokeWidth="0.8" />
                    </g>

                    {/* ── SIDE TRAFFIC-LIGHT CAPSULES (strobing red/yellow/green) ── */}
                    {[35, 165].map((cx) => (
                        <g key={`tl-${cx}`}>
                            <rect x={cx - 8} y="74" width="16" height="52" rx="7" fill="#06121f" stroke="url(#silver-metallic)" strokeWidth="1.8" />
                            <circle cx={cx} cy="84" r="4.6" className="diamond-light-red" stroke="#000000" strokeWidth="0.9" />
                            <circle cx={cx} cy="100" r="4.6" className="diamond-light-yellow" stroke="#000000" strokeWidth="0.9" />
                            <circle cx={cx} cy="116" r="4.6" className="diamond-light-green" stroke="#000000" strokeWidth="0.9" />
                            <circle cx={cx - 1.6} cy="82.4" r="1.4" fill="#ffffff" opacity="0.6" />
                        </g>
                    ))}

                    {/* Police strobe bar flanking the top crest (red + blue) */}
                    <rect x="64" y="18" width="11" height="6" rx="1.6" className="diamond-police-red" stroke="#000000" strokeWidth="0.7" />
                    <rect x="125" y="18" width="11" height="6" rx="1.6" className="diamond-police-blue" stroke="#000000" strokeWidth="0.7" />

                    {/* ── TOP PREMIUM DIAMOND EMBLEM (WITH ROUNDABOUT ARROWS) ── */}
                    <polygon points="100,4 120,24 100,44 80,24" fill="url(#silver-metallic)" stroke="#000000" strokeWidth="3" />
                    <polygon points="100,7 117,24 100,41 83,24" fill="#0b1329" stroke="url(#diamond-cyan-metal)" strokeWidth="1.5" />
                    {/* Interlocking roundabout arrows inside top crest */}
                    <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(100, 24)">
                        <path d="M -6,0 A 6,6 0 0,1 3,-5" />
                        <path d="M 3,-5 A 6,6 0 0,1 3,5" />
                        <path d="M 3,5 A 6,6 0 0,1 -6,0" />
                        <path d="M 0,-7 L 3,-5 L 0,-3" fill="#ffffff" strokeWidth="0.8" />
                        <path d="M 5,2 L 3,5 L 1,2" fill="#ffffff" strokeWidth="0.8" />
                        <path d="M -5,3 L -6,0 L -8,3" fill="#ffffff" strokeWidth="0.8" />
                    </g>

                    {/* ── BOTTOM ACCENT LICENSE NAMEPLATE ── */}
                    <rect x="52" y="162" width="96" height="22" rx="4" fill="#0b1329" stroke="url(#silver-metallic)" strokeWidth="2.5" />
                    <text x="100" y="177" fill="url(#silver-metallic)" fontSize="10.5" fontWeight="950" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1.2">DIAMOND</text>
                    {/* Tiny gemstone on top of nameplate */}
                    <polygon points="100,154 106,162 100,170 94,162" fill="url(#diamond-blue-primary)" stroke="#000000" strokeWidth="1" />

                    {/* ── CIRCULAR PHOTO CUTOUT FRAME (Rookie sized r=64) ── */}
                    {/* Outer Silver Ring */}
                    <circle cx="100" cy="100" r="78" fill="none" stroke="url(#silver-metallic)" strokeWidth="3" />
                    {/* Inner Silver Ring */}
                    <circle cx="100" cy="100" r="74" fill="none" stroke="url(#diamond-cyan-metal)" strokeWidth="1" />
                    {/* Roadway Surface Ring */}
                    <circle cx="100" cy="100" r="72" fill="url(#diamond-road-asphalt)" stroke="#000000" strokeWidth="2.5" />
                    {/* White Lanes */}
                    <circle cx="100" cy="100" r="68" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.85" />
                </svg>

                {/* Sweeping crystal cyan/blue shine overlay */}
                <div className="diamond-avatar__shine" aria-hidden="true" />

                {/* Top diamond jewel beacon glow */}
                <div className="diamond-avatar__top-glow" aria-hidden="true" />

                {/* Side crystal shards shimmer/glow */}
                <div className="diamond-avatar__crystal-shimmer" aria-hidden="true" />

                {/* Side glowing accents */}
                <div className="diamond-avatar__arrow-glow diamond-avatar__arrow-glow--left" aria-hidden="true" />
                <div className="diamond-avatar__arrow-glow diamond-avatar__arrow-glow--right" aria-hidden="true" />

                {/* Protected profile photo window in the center */}
                <div className="diamond-avatar__photo">
                    {showCustomAvatar ? (
                        <div className="diamond-avatar__custom-photo" role="img" aria-label={alt}>
                            {children}
                        </div>
                    ) : showImage ? (
                        <img
                            src={src as string}
                            alt={alt}
                            className="diamond-avatar__img"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div className="diamond-avatar__fallback" role="img" aria-label={alt}>
                            {initial || (
                                <User size={Math.round(44 * scale)} strokeWidth={2.5} aria-hidden="true" />
                            )}
                        </div>
                    )}
                </div>

                {/* Division Badge (Top-Left) */}
                {division && (
                    <div className="diamond-avatar__division-badge" aria-label={`Division ${division}`}>
                        <span className="diamond-avatar__division-text">{division}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DiamondAvatarBorder;
