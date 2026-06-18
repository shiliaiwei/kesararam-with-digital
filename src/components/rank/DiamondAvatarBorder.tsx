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
                    </defs>

                    {/* Brutalist zero-blur shadow for the diamond frame */}
                    <polygon points="100,15 185,100 100,185 15,100" fill="#000000" transform="translate(4, 4)" />

                    {/* Diamond Outer Frame (Transparent Background) */}
                    <polygon points="100,15 185,100 100,185 15,100" fill="rgba(15, 23, 42, 0.6)" stroke="url(#diamond-cyan-metal)" strokeWidth="4.5" strokeLinejoin="round" />
                    <polygon points="100,19 181,100 100,181 19,100" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                    <polygon points="100,22 178,100 100,178 22,100" fill="none" stroke="url(#diamond-cyan-metal)" strokeWidth="1" strokeLinejoin="round" />

                    {/* Main Outer circle roadway ring */}
                    <circle cx="100" cy="100" r="51" fill="none" stroke="#ffffff" strokeWidth="3" />

                    {/* Inner Ring border */}
                    <circle cx="100" cy="100" r="43" fill="none" stroke="#ffffff" strokeWidth="1.5" />

                    {/* White Dashed Lane Markings */}
                    <circle cx="100" cy="100" r="39" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />

                    {/* ── INTEGRATED SIDE LIGHTS & WARNING SIGNS ── */}
                    {/* Left Traffic Light Stack */}
                    <rect x="36" y="85" width="10" height="30" rx="2" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="41" cy="90" r="2.5" className="diamond-light-red" stroke="#000000" strokeWidth="0.5" />
                    <circle cx="41" cy="100" r="2.5" className="diamond-light-yellow" stroke="#000000" strokeWidth="0.5" />
                    <circle cx="41" cy="110" r="2.5" className="diamond-light-green" stroke="#000000" strokeWidth="0.5" />

                    {/* Right Traffic Light Stack */}
                    <rect x="154" y="85" width="10" height="30" rx="2" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="159" cy="90" r="2.5" className="diamond-light-red" stroke="#000000" strokeWidth="0.5" />
                    <circle cx="159" cy="100" r="2.5" className="diamond-light-yellow" stroke="#000000" strokeWidth="0.5" />
                    <circle cx="159" cy="110" r="2.5" className="diamond-light-green" stroke="#000000" strokeWidth="0.5" />

                    {/* Left Warning/Diamond Sign with Exclamation Point */}
                    <polygon points="25,75 33,83 25,91 17,83" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    <path d="M 25,79 L 25,85 M 25,88 L 25,89" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Right Warning/Diamond Sign with Exclamation Point */}
                    <polygon points="175,75 183,83 175,91 167,83" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                    <path d="M 175,79 L 175,85 M 175,88 L 175,89" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

                    {/* ── TOP VERTEX JEWEL ── */}
                    <polygon points="100,8 110,20 100,32 90,20" fill="url(#diamond-cyan-metal)" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M 100,12 L 100,28 M 94,20 L 106,20" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />

                    {/* ── SYMMETRICAL LAUREL LEAVES (BOTTOM SIDES) ── */}
                    {/* Left Leaves */}
                    <path d="M 23 130 Q 17 124 20 118 Q 26 124 23 130 Z M 20 117 Q 13 110 16 104 Q 23 110 20 117 Z M 17 101 Q 10 94 13 88 Q 20 94 17 101 Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                    {/* Right Leaves (Reflected) */}
                    <path d="M 177 130 Q 183 124 180 118 Q 174 124 177 130 Z M 180 117 Q 187 110 184 104 Q 177 110 180 117 Z M 183 101 Q 190 94 187 88 Q 180 94 183 101 Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />

                    {/* ── LICENSE NAMEPLATE ── */}
                    <rect x="55" y="148" width="90" height="22" rx="4" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                    <text x="100" y="163" fill="#ffffff" fontSize="11" fontWeight="950" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1">DIAMOND</text>
                </svg>

                {/* Sweeping crystal cyan/blue shine overlay */}
                <div className="diamond-avatar__shine" aria-hidden="true" />

                {/* Top diamond jewel beacon glow */}
                <div className="diamond-avatar__top-glow" aria-hidden="true" />

                {/* Side crystal shards shimmer/glow */}
                <div className="diamond-avatar__crystal-shimmer" aria-hidden="true" />

                {/* Side glowing chevrons sliding up */}
                <div className="diamond-avatar__arrow-glow diamond-avatar__arrow-glow--left" aria-hidden="true" />
                <div className="diamond-avatar__arrow-glow diamond-avatar__arrow-glow--right" aria-hidden="true" />

                {/* Bottom-left and bottom-right warning sign hazard glows */}
                <div className="diamond-avatar__left-sign-glow" aria-hidden="true" />
                <div className="diamond-avatar__right-sign-glow" aria-hidden="true" />

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
