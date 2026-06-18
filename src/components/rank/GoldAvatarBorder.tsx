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

export interface GoldAvatarBorderProps {
    src?: string | null;
    alt: string;
    username?: string;
    score?: number;
    size?: AvatarSize | number;
    animated?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function GoldAvatarBorder({
    src,
    alt,
    username,
    score,
    size = "md",
    animated = true,
    className,
    children,
}: GoldAvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);
    const scale = typeof size === "number" ? size / 96 : SCALE[size];
    const showCustomAvatar = Boolean(children);
    const showImage = Boolean(src) && !imgFailed && !showCustomAvatar;
    const initial = username?.trim()?.charAt(0)?.toUpperCase() ?? "";

    const clampedScore = score !== undefined ? Math.max(2500, Math.min(3499, score)) : undefined;
    const division = clampedScore !== undefined ? calculateRankAndDivision(clampedScore).division : undefined;

    const vars = {
        "--s": scale,
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "gold-avatar",
                animated ? "gold-avatar--animated" : "gold-avatar--static",
                className,
            )}
            style={vars}
        >
            <div className="gold-avatar__plate">
                {/* Scalable SVG Frame instead of a static PNG */}
                <svg
                    className="gold-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Gold Metallic Sweep Gradient */}
                        <linearGradient id="gold-metallic-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ca8a04" />
                            <stop offset="25%" stopColor="#ffd700" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate
                                    attributeName="offset"
                                    values="0;1;0"
                                    dur="4s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="75%" stopColor="#ffd700" />
                            <stop offset="100%" stopColor="#854d0e" />
                        </linearGradient>

                        {/* Secondary Gold Gradient */}
                        <linearGradient id="gold-metallic-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ca8a04" />
                            <stop offset="50%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>

                        {/* Dark Carbon texture gradient for outer ring */}
                        <radialGradient id="dark-metal-bg" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#2c2518" />
                            <stop offset="85%" stopColor="#18140e" />
                            <stop offset="100%" stopColor="#080705" />
                        </radialGradient>
                    </defs>

                    {/* Brutalist zero-blur shadow for the main frame */}
                    <rect x="28" y="28" width="148" height="148" rx="16" fill="#000000" />

                    {/* Outer Square Handles (Left & Right) */}
                    {/* Left Handle */}
                    <path d="M 24 75 L 16 80 L 16 120 L 24 125" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 24 75 L 16 80 L 16 120 L 24 125" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Right Handle */}
                    <path d="M 176 75 L 184 80 L 184 120 L 176 125" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 176 75 L 184 80 L 184 120 L 176 125" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Main Frame Body (Rounded Square) */}
                    <rect x="24" y="24" width="152" height="152" rx="16" fill="url(#dark-metal-bg)" stroke="#000000" strokeWidth="4" />

                    {/* Outer Gold Trim */}
                    <rect x="28" y="28" width="144" height="144" rx="12" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="3.5" />

                    {/* Inner Gold Trim */}
                    <rect x="34" y="34" width="132" height="132" rx="8" fill="none" stroke="url(#gold-metallic-secondary)" strokeWidth="1.5" />

                    {/* ── VERTICAL DANGER CHEVRON BANDS (Left & Right) ── */}
                    {/* Left Band Background */}
                    <rect x="37" y="37" width="14" height="126" fill="#080705" stroke="#000000" strokeWidth="1" />
                    {/* Left Chevrons */}
                    <path d="M 37 45 L 44 38 L 51 45 L 51 51 L 44 44 L 37 51 Z M 37 65 L 44 58 L 51 65 L 51 71 L 44 64 L 37 71 Z M 37 85 L 44 78 L 51 85 L 51 91 L 44 84 L 37 91 Z M 37 105 L 44 98 L 51 105 L 51 111 L 44 104 L 37 111 Z M 37 125 L 44 118 L 51 125 L 51 131 L 44 124 L 37 131 Z M 37 145 L 44 138 L 51 145 L 51 151 L 44 144 L 37 151 Z" fill="url(#gold-metallic-primary)" className="gold-chevron-left" />

                    {/* Right Band Background */}
                    <rect x="149" y="37" width="14" height="126" fill="#080705" stroke="#000000" strokeWidth="1" />
                    {/* Right Chevrons */}
                    <path d="M 149 45 L 156 38 L 163 45 L 163 51 L 156 44 L 149 51 Z M 149 65 L 156 58 L 163 65 L 163 71 L 156 64 L 149 71 Z M 149 85 L 156 78 L 163 85 L 163 91 L 156 84 L 149 91 Z M 149 105 L 156 98 L 163 105 L 163 111 L 156 104 L 149 111 Z M 149 125 L 156 118 L 163 125 L 163 131 L 156 124 L 149 131 Z M 149 145 L 156 138 L 163 145 L 163 151 L 156 144 L 149 151 Z" fill="url(#gold-metallic-primary)" className="gold-chevron-right" />

                    {/* ── TOP PENTAGON RANK BADGE ── */}
                    {/* Shadow */}
                    <polygon points="82,18 122,18 122,36 102,46 82,36" fill="#000000" />
                    {/* Pentagon Body */}
                    <polygon points="80,16 120,16 120,34 100,44 80,34" fill="url(#dark-metal-bg)" stroke="#000000" strokeWidth="2.5" />
                    {/* Gold Outline */}
                    <polygon points="82,18 118,18 118,33 100,41 82,33" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="2" />
                    {/* 3 Rising Chevrons */}
                    <path d="M 92 24 L 100 18 L 108 24 L 108 28 L 100 22 L 92 28 Z" fill="url(#gold-metallic-primary)" />
                    <path d="M 92 30 L 100 24 L 108 30 L 108 34 L 100 28 L 92 34 Z" fill="url(#gold-metallic-primary)" />
                    <path d="M 92 36 L 100 30 L 108 36 L 108 40 L 100 34 L 92 40 Z" fill="url(#gold-metallic-primary)" />

                    {/* ── BOTTOM ACCENT BRACKET ── */}
                    <path d="M 80 176 L 120 176 L 125 182 L 115 186 L 85 186 L 75 182 Z" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1.5" />

                    {/* ── CIRCULAR PHOTO CUTOUT FRAME ── */}
                    {/* Outer Gold Ring */}
                    <circle cx="100" cy="100" r="48" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="3.5" />
                    {/* Inner Gold Ring */}
                    <circle cx="100" cy="100" r="44" fill="none" stroke="url(#gold-metallic-secondary)" strokeWidth="1.5" />
                    {/* Roadway Surface Ring */}
                    <circle cx="100" cy="100" r="42" fill="#1c1917" stroke="#000000" strokeWidth="2.5" />
                    {/* White Lanes */}
                    <circle cx="100" cy="100" r="38" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.75" />
                </svg>

                {/* Sweeping gold shine overlay */}
                <div className="gold-avatar__shine" aria-hidden="true" />

                {/* Soft edge light around the inner circular ring */}
                <div className="gold-avatar__ring-glow" aria-hidden="true" />

                {/* Protected profile photo window in the center */}
                <div className="gold-avatar__photo">
                    {showCustomAvatar ? (
                        <div className="gold-avatar__custom-photo" role="img" aria-label={alt}>
                            {children}
                        </div>
                    ) : showImage ? (
                        <img
                            src={src as string}
                            alt={alt}
                            className="gold-avatar__img"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div className="gold-avatar__fallback" role="img" aria-label={alt}>
                            {initial || (
                                <User size={Math.round(44 * scale)} strokeWidth={2.5} aria-hidden="true" />
                            )}
                        </div>
                    )}
                </div>

                {/* Division Badge (Top-Left) */}
                {division && (
                    <div className="gold-avatar__division-badge" aria-label={`Division ${division}`}>
                        <span className="gold-avatar__division-text">{division}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GoldAvatarBorder;
