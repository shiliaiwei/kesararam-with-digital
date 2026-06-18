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
                {/* Scalable SVG Frame instead of a static PNG */}
                <svg
                    className="platinum-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Blue Metallic Gradient */}
                        <linearGradient id="platinum-blue-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="40%" stopColor="#60a5fa" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate
                                    attributeName="offset"
                                    values="0;1;0"
                                    dur="3s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="60%" stopColor="#93c5fd" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>

                        {/* Dark Carbon texture gradient for outer ring */}
                        <radialGradient id="platinum-carbon" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="85%" stopColor="#0f172a" />
                            <stop offset="100%" stopColor="#020617" />
                        </radialGradient>
                    </defs>

                    {/* Brutalist zero-blur shadow for the shield frame */}
                    <path d="M 40 20 L 160 20 L 165 110 C 165 155, 110 182, 100 185 C 90 182, 35 155, 35 110 Z" fill="#000000" transform="translate(4, 4)"/>

                    {/* Shield Outer Frame (Transparent Background) */}
                    <path d="M 40 20 L 160 20 L 165 110 C 165 155, 110 182, 100 185 C 90 182, 35 155, 35 110 Z" fill="rgba(15, 23, 42, 0.6)" stroke="url(#platinum-blue-metal)" strokeWidth="4.5" strokeLinejoin="round" />
                    <path d="M 43 23 L 157 23 L 162 109 C 162 151, 109 177, 100 180 C 91 177, 38 151, 38 109 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M 46 26 L 154 26 L 158 107 C 158 147, 108 172, 100 175 C 92 172, 42 147, 42 107 Z" fill="none" stroke="url(#platinum-blue-metal)" strokeWidth="1" strokeLinejoin="round" />

                    {/* Main Outer circle roadway ring */}
                    <circle cx="100" cy="100" r="51" fill="none" stroke="#ffffff" strokeWidth="3" />

                    {/* Inner Ring border */}
                    <circle cx="100" cy="100" r="43" fill="none" stroke="#ffffff" strokeWidth="1.5" />

                    {/* White Dashed Lane Markings */}
                    <circle cx="100" cy="100" r="39" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />

                    {/* ── INTEGRATED SIDE LIGHTS & WARNING SIGNS ── */}
                    {/* Left Traffic Light Stack */}
                    <rect x="39" y="85" width="11" height="31" rx="2" fill="#0f172a" stroke="#ffffff" strokeWidth="1.2" />
                    <circle cx="44.5" cy="90.5" r="2.9" className="platinum-light-red" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="44.5" cy="100.5" r="2.9" className="platinum-light-yellow" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="44.5" cy="110.5" r="2.9" className="platinum-light-green" stroke="#000000" strokeWidth="0.8" />

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

                    {/* ── TOP INFORMATION SHIELD CREST ── */}
                    <path d="M 90 15 L 110 15 L 115 25 L 100 35 L 85 25 Z" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M 100 23 L 100 29" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="100" cy="20" r="1" fill="#ffffff" />

                    {/* ── SYMMETRICAL LAUREL LEAVES (BOTTOM SIDES) ── */}
                    {/* Left Leaves */}
                    <path d="M 23 130 Q 17 124 20 118 Q 26 124 23 130 Z M 20 117 Q 13 110 16 104 Q 23 110 20 117 Z M 17 101 Q 10 94 13 88 Q 20 94 17 101 Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                    {/* Right Leaves (Reflected) */}
                    <path d="M 177 130 Q 183 124 180 118 Q 174 124 177 130 Z M 180 117 Q 187 110 184 104 Q 177 110 180 117 Z M 183 101 Q 190 94 187 88 Q 180 94 183 101 Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />

                    {/* ── LICENSE NAMEPLATE ── */}
                    <rect x="55" y="148" width="90" height="22" rx="4" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                    <text x="100" y="163" fill="#ffffff" fontSize="11" fontWeight="950" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1">PLATINUM</text>

                    {/* ── WARNING CAUTION TRIANGLE (BOTTOM CENTER) ── */}
                    <polygon points="100,175 114,195 86,195" fill="none" stroke="#ffffff" strokeWidth="1.8" />
                    <circle cx="100" cy="191" r="1.2" fill="#ffffff" />
                    <path d="M 100 181 L 100 188" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
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
