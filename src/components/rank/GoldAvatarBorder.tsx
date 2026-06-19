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

                        {/* Flash Yellow/Gold Gradient */}
                        <linearGradient id="flash-yellow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="40%" stopColor="#fef08a" />
                            <stop offset="70%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#ca8a04" />
                        </linearGradient>

                        {/* Dark Asphalt radial gradient */}
                        <radialGradient id="gold-road-asphalt" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#1c1917" />
                            <stop offset="75%" stopColor="#0c0a09" />
                            <stop offset="100%" stopColor="#020202" />
                        </radialGradient>
                    </defs>

                    {/* Brutalist zero-blur shadow for the main frame */}
                    <polygon
                        points="64,22 144,22 186,64 186,144 144,186 64,186 22,144 22,64"
                        fill="#000000"
                    />

                    {/* Main Beveled Octagon Frame Body */}
                    <polygon
                        points="60,18 140,18 182,60 182,140 140,182 60,182 18,140 18,60"
                        fill="url(#gold-metallic-primary)"
                        stroke="#000000"
                        strokeWidth="4"
                    />

                    {/* Inner Asphalt Road Surface of the Octagon */}
                    <polygon
                        points="63,23 137,23 177,63 177,137 137,177 63,177 23,137 23,63"
                        fill="#1c1917"
                        stroke="#000000"
                        strokeWidth="2.5"
                    />

                    {/* Gold Corner Plates with Rivets */}
                    {/* Top-Left Corner */}
                    <polygon points="26,60 60,26 60,60" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="45" cy="45" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* Top-Right Corner */}
                    <polygon points="140,26 174,60 140,60" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="155" cy="45" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* Bottom-Left Corner */}
                    <polygon points="26,140 60,174 60,140" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="45" cy="155" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* Bottom-Right Corner */}
                    <polygon points="140,174 174,140 140,140" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="155" cy="155" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* ── LEFT PREMIUM GOLDEN LIGHTNING BOLT (FLASH) ── */}
                    <path
                        d="M 27,55 L 12,98 L 22,98 L 15,145 L 35,93 L 24,93 Z"
                        fill="url(#flash-yellow-gradient)"
                        stroke="#000000"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        className="gold-flash-left"
                    />

                    {/* ── RIGHT PREMIUM GOLDEN LIGHTNING BOLT (FLASH) ── */}
                    <path
                        d="M 173,55 L 188,98 L 178,98 L 185,145 L 165,93 L 176,93 Z"
                        fill="url(#flash-yellow-gradient)"
                        stroke="#000000"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        className="gold-flash-right"
                    />

                    {/* ── TOP PREMIUM FLASH CREST (NO ROAD SIGN) ── */}
                    <polygon points="100,5 120,25 100,45 80,25" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="3" />
                    <polygon points="100,8 117,25 100,42 83,25" fill="#000000" stroke="url(#gold-metallic-secondary)" strokeWidth="1" />
                    {/* Golden lightning bolt inside top crest */}
                    <path
                        d="M 101,12 L 93,25 L 99,25 L 96,37 L 107,24 L 100,24 Z"
                        fill="url(#flash-yellow-gradient)"
                        stroke="#000000"
                        strokeWidth="0.8"
                    />

                    {/* ── BOTTOM ACCENT DIAMOND BADGE ── */}
                    <polygon points="100,155 120,175 100,195 80,175" fill="#0c0a09" stroke="#000000" strokeWidth="3" />
                    <polygon points="100,158 117,175 100,192 83,175" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="1.5" />
                    {/* Gold Safety Shield inside bottom badge */}
                    <path
                        d="M 94 168 L 106 168 C 106 168 106 176 100 182 C 94 176 94 168 94 168 Z"
                        fill="url(#gold-metallic-secondary)"
                        stroke="#000000"
                        strokeWidth="1"
                    />
                    {/* Tiny lightning bolt inside shield */}
                    <path
                        d="M 100 170 L 98 174 L 100 174 L 99 178 L 102 173 L 100 173 Z"
                        fill="#000000"
                        stroke="none"
                    />

                    {/* ── CIRCULAR PHOTO CUTOUT FRAME (Rookie sized r=64) ── */}
                    {/* Outer Gold Ring */}
                    <circle cx="100" cy="100" r="78" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="3" />
                    {/* Inner Gold Ring */}
                    <circle cx="100" cy="100" r="74" fill="none" stroke="url(#gold-metallic-secondary)" strokeWidth="1" />
                    {/* Roadway Surface Ring */}
                    <circle cx="100" cy="100" r="72" fill="url(#gold-road-asphalt)" stroke="#000000" strokeWidth="2.5" />
                    {/* White Lanes */}
                    <circle cx="100" cy="100" r="68" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.85" />
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
