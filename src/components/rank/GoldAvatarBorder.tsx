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
    const computedDivision = division ?? "I"; // Default to Division I for premium default styling

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

                    {/* ── DIVISION IV ── */}
                    {computedDivision === "IV" && (
                        <>
                            {/* Zero-blur shadow */}
                            <rect x="24" y="24" width="152" height="152" rx="20" fill="#000000" />
                            {/* Outer Rounded Square Frame */}
                            <rect x="20" y="20" width="160" height="160" rx="24" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="4" />
                            {/* Inner Backing */}
                            <rect x="25" y="25" width="150" height="150" rx="20" fill="#1c1917" stroke="#000000" strokeWidth="2.5" />

                            {/* Side slashes */}
                            <rect x="24" y="70" width="14" height="5" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" transform="rotate(-15, 24, 70)" />
                            <rect x="24" y="90" width="14" height="5" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" transform="rotate(-15, 24, 90)" />
                            <rect x="24" y="110" width="14" height="5" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" transform="rotate(-15, 24, 110)" />

                            <rect x="162" y="70" width="14" height="5" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" transform="rotate(15, 162, 70)" />
                            <rect x="162" y="90" width="14" height="5" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" transform="rotate(15, 162, 90)" />
                            <rect x="162" y="110" width="14" height="5" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" transform="rotate(15, 162, 110)" />

                            {/* Top Warning Sign: Turn Left Curve */}
                            <polygon points="100,5 120,25 100,45 80,25" fill="url(#flash-yellow-gradient)" stroke="#000000" strokeWidth="3" />
                            <path d="M 106,30 L 100,30 A 6,6 0 0,1 94,24 L 94,18" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M 91,22 L 94,17 L 97,22" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Bottom Badge: Small Shield with crown */}
                            <polygon points="100,165 115,177 100,189 85,177" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="2.5" />
                            <circle cx="100" cy="177" r="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                        </>
                    )}

                    {/* ── DIVISION III ── */}
                    {computedDivision === "III" && (
                        <>
                            {/* Zero-blur shadow */}
                            <polygon points="44,24 156,24 176,44 176,156 156,176 44,176 24,156 24,44" fill="#000000" />
                            {/* Outer Beveled Square Frame */}
                            <polygon points="40,20 160,20 180,40 180,160 160,180 40,180 20,160 20,40" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="4" />
                            {/* Inner Backing */}
                            <polygon points="43,23 157,23 177,43 177,157 157,177 43,177 23,157 23,43" fill="#1c1917" stroke="#000000" strokeWidth="2.5" />

                            {/* Corner rivets */}
                            <circle cx="45" cy="45" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="155" cy="45" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="45" cy="155" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="155" cy="155" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                            {/* Side chevrons pointing down */}
                            <polygon points="21,70 31,77 41,70 41,75 31,82 21,75" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" />
                            <polygon points="21,90 31,97 41,90 41,95 31,102 21,95" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" />
                            <polygon points="21,110 31,117 41,110 41,115 31,122 21,115" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" />

                            <polygon points="179,70 169,77 159,70 159,75 169,82 179,75" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" />
                            <polygon points="179,90 169,97 159,90 159,95 169,102 179,95" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" />
                            <polygon points="179,110 169,117 159,110 159,115 169,122 179,115" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" />

                            {/* Top Warning Sign: Fork Y-junction */}
                            <polygon points="100,5 120,25 100,45 80,25" fill="url(#flash-yellow-gradient)" stroke="#000000" strokeWidth="3" />
                            <path d="M 100,32 L 100,25" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M 100,25 L 94,18 M 100,25 L 106,18" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M 91,22 L 94,17 L 97,20" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M 109,22 L 106,17 L 103,20" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Bottom Badge: Tilted square with crown */}
                            <polygon points="100,160 115,175 100,190 85,175" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="2.5" />
                            <polygon points="100,163 112,175 100,187 88,175" fill="#000000" stroke="url(#gold-metallic-secondary)" strokeWidth="1" />
                            <path d="M 94,180 L 106,180 L 104,171 L 100,175 L 96,171 Z" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="0.8" />
                        </>
                    )}

                    {/* ── DIVISION II ── */}
                    {computedDivision === "II" && (
                        <>
                            {/* Zero-blur shadow */}
                            <polygon points="64,22 144,22 186,64 186,144 144,186 64,186 22,144 22,64" fill="#000000" />
                            {/* Outer Octagon Frame */}
                            <polygon points="60,18 140,18 182,60 182,140 140,182 60,182 18,140 18,60" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="4" />
                            {/* Inner Backing */}
                            <polygon points="63,23 137,23 177,63 177,137 137,177 63,177 23,137 23,63" fill="#1c1917" stroke="#000000" strokeWidth="2.5" />

                            {/* Corner rivets */}
                            <circle cx="45" cy="45" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="155" cy="45" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="45" cy="155" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="155" cy="155" r="2.5" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                            {/* Side Traffic Lights */}
                            <rect x="23" y="66" width="14" height="42" rx="7" fill="#000000" stroke="url(#gold-metallic-secondary)" strokeWidth="1.5" />
                            <circle cx="30" cy="73" r="4" fill="#ef4444" className="gold-light-red" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="30" cy="87" r="4" fill="#facc15" className="gold-light-yellow" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="30" cy="101" r="4" fill="#22c55e" className="gold-light-green" stroke="#000000" strokeWidth="0.8" />

                            <rect x="163" y="66" width="14" height="42" rx="7" fill="#000000" stroke="url(#gold-metallic-secondary)" strokeWidth="1.5" />
                            <circle cx="170" cy="73" r="4" fill="#ef4444" className="gold-light-red" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="170" cy="87" r="4" fill="#facc15" className="gold-light-yellow" stroke="#000000" strokeWidth="0.8" />
                            <circle cx="170" cy="101" r="4" fill="#22c55e" className="gold-light-green" stroke="#000000" strokeWidth="0.8" />

                            {/* Top Warning Sign: Straight Up Arrow */}
                            <polygon points="100,5 120,25 100,45 80,25" fill="url(#flash-yellow-gradient)" stroke="#000000" strokeWidth="3" />
                            <path d="M 100,33 L 100,16 M 96,21 L 100,16 L 104,21" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Bottom Badge: Diamond shape with diamond-shaped gemstone */}
                            <polygon points="100,155 120,175 100,195 80,175" fill="#0c0a09" stroke="#000000" strokeWidth="3" />
                            <polygon points="100,158 117,175 100,192 83,175" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="1.5" />
                            <polygon points="100,162 108,175 100,188 92,175" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1" />
                            <polygon points="100,162 108,175 100,175" fill="#ffffff" opacity="0.6" stroke="#000000" strokeWidth="0.5" />
                        </>
                    )}

                    {/* ── DIVISION I ── */}
                    {computedDivision === "I" && (
                        <>
                            {/* Zero-blur shadow */}
                            <polygon points="64,22 144,22 186,64 186,144 144,186 64,186 22,144 22,64" fill="#000000" />
                            {/* Outer Winged Frame */}
                            <polygon points="60,18 140,18 182,60 182,140 140,182 60,182 18,140 18,60" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="4" />
                            {/* Inner Backing */}
                            <polygon points="63,23 137,23 177,63 177,137 137,177 63,177 23,137 23,63" fill="#1c1917" stroke="#000000" strokeWidth="2.5" />

                            {/* Symmetrical feathered wings at top corners */}
                            <g transform="translate(20, 20)">
                                <polygon points="-8,-8 -20,-16 -12,-32 12,-16" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                                <polygon points="-12,-32 -28,-36 -20,-48 0,-32" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1.5" />
                                <polygon points="-20,-48 -36,-44 -28,-56 -10,-42" fill="url(#flash-yellow-gradient)" stroke="#000000" strokeWidth="1.5" />
                            </g>
                            <g transform="translate(180, 20)">
                                <polygon points="8,-8 20,-16 12,-32 -12,-16" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                                <polygon points="12,-32 28,-36 20,-48 0,-32" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1.5" />
                                <polygon points="20,-48 36,-44 28,-56 10,-42" fill="url(#flash-yellow-gradient)" stroke="#000000" strokeWidth="1.5" />
                            </g>

                            {/* Side chevrons pointing up */}
                            <polygon points="22,76 34,68 46,76 46,84 34,76 22,84" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                            <polygon points="22,96 34,88 46,96 46,104 34,96 22,104" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                            <polygon points="22,116 34,108 46,116 46,124 34,116 22,124" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />

                            <polygon points="178,76 166,68 154,76 154,84 166,76 178,84" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                            <polygon points="178,96 166,88 154,96 154,104 166,96 178,104" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                            <polygon points="178,116 166,108 154,116 154,124 166,116 178,124" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />

                            {/* Top Warning Sign: Gold Crown inside diamond */}
                            <polygon points="100,5 120,25 100,45 80,25" fill="url(#flash-yellow-gradient)" stroke="#000000" strokeWidth="3" />
                            <path d="M 91,28 L 109,28 L 106,18 L 100,24 L 94,18 Z" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1.2" />

                            {/* Bottom Badge: Large multi-faceted gold diamond badge */}
                            <polygon points="100,150 125,170 100,195 75,170" fill="#000000" />
                            <polygon points="100,147 122,170 100,192 78,170" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1.5" />
                            <polygon points="100,147 122,170 100,170" fill="#ffffff" opacity="0.5" stroke="#000000" strokeWidth="0.8" />
                            <polygon points="100,147 78,170 100,170" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="0.8" />
                            <polygon points="100,192 122,170 100,170" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="0.8" />
                            <polygon points="100,192 78,170 100,170" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="0.8" />
                        </>
                    )}

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
