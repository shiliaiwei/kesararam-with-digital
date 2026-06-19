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

                    {/* ── Outer Plate: Zero-blur Shadow ── */}
                    <polygon points="50,15 150,15 185,50 185,150 150,185 50,185 15,150 15,50" fill="#000000" transform="translate(4, 4)" />

                    {/* ── Main Outer Beveled Gold Frame ── */}
                    <polygon points="50,15 150,15 185,50 185,150 150,185 50,185 15,150 15,50" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="5.5" strokeLinejoin="miter" />

                    {/* ── Inner Dark Plate Backing ── */}
                    <polygon points="52,19 148,19 181,52 181,148 148,181 52,181 19,148 19,52" fill="#121212" stroke="url(#gold-metallic-secondary)" strokeWidth="2.5" strokeLinejoin="miter" />

                    {/* ── Symmetrical Beveled Corner Plates ── */}
                    {/* Top-Left Corner Bracket */}
                    <polygon points="20,53 53,20 48,20 20,48" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                    <circle cx="35" cy="35" r="3" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1" />

                    {/* Top-Right Corner Bracket */}
                    <polygon points="180,53 147,20 152,20 180,48" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                    <circle cx="165" cy="35" r="3" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1" />

                    {/* Bottom-Left Corner Bracket */}
                    <polygon points="20,147 53,180 48,180 20,152" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                    <circle cx="35" cy="165" r="3" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1" />

                    {/* Bottom-Right Corner Bracket */}
                    <polygon points="180,147 147,180 152,180 180,152" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.2" />
                    <circle cx="165" cy="165" r="3" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="1" />

                    {/* ── Left Traffic Light Capsule ── */}
                    <rect x="8" y="70" width="16" height="60" rx="8" fill="#121212" stroke="#000000" strokeWidth="3" />
                    <rect x="9" y="71" width="14" height="58" rx="7" fill="#000000" stroke="url(#gold-metallic-secondary)" strokeWidth="1.5" />
                    <circle cx="16" cy="80" r="4.5" fill="#ef4444" className="gold-light-red" stroke="#000000" strokeWidth="1" />
                    <circle cx="16" cy="100" r="4.5" fill="#facc15" className="gold-light-yellow" stroke="#000000" strokeWidth="1" />
                    <circle cx="16" cy="120" r="4.5" fill="#22c55e" className="gold-light-green" stroke="#000000" strokeWidth="1" />

                    {/* ── Right Traffic Light Capsule ── */}
                    <rect x="176" y="70" width="16" height="60" rx="8" fill="#121212" stroke="#000000" strokeWidth="3" />
                    <rect x="177" y="71" width="14" height="58" rx="7" fill="#000000" stroke="url(#gold-metallic-secondary)" strokeWidth="1.5" />
                    <circle cx="184" cy="80" r="4.5" fill="#ef4444" className="gold-light-red" stroke="#000000" strokeWidth="1" />
                    <circle cx="184" cy="100" r="4.5" fill="#facc15" className="gold-light-yellow" stroke="#000000" strokeWidth="1" />
                    <circle cx="184" cy="120" r="4.5" fill="#22c55e" className="gold-light-green" stroke="#000000" strokeWidth="1" />

                    {/* ── Top Warning Sign: Straight Up Arrow ── */}
                    <polygon points="100,3 123,26 100,49 77,26" fill="#000000" />
                    <polygon points="100,6 120,26 100,46 80,26" fill="url(#flash-yellow-gradient)" stroke="#000000" strokeWidth="2.5" />
                    <path d="M 100,35 L 100,17 M 94,23 L 100,17 L 106,23" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* ── Bottom Badge: Diamond Shape with Gemstone ── */}
                    <polygon points="100,151 123,174 100,197 77,174" fill="#000000" />
                    <polygon points="100,154 120,174 100,194 80,174" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="2.5" />
                    <polygon points="100,162 108,174 100,186 92,174" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <polygon points="100,162 108,174 100,174" fill="#ffffff" opacity="0.65" stroke="#000000" strokeWidth="0.8" />

                    {/* ── CIRCULAR PHOTO CUTOUT FRAME (Rookie sized r=64) ── */}
                    {/* Outer Gold Ring */}
                    <circle cx="100" cy="100" r="74" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="2" />
                    {/* Roadway Surface Ring */}
                    <circle cx="100" cy="100" r="73" fill="url(#gold-road-asphalt)" stroke="#000000" strokeWidth="2" />
                    {/* Yellow Dashed Lanes */}
                    <circle cx="100" cy="100" r="62" fill="none" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.9" />
                    {/* Inner Gold Ring */}
                    <circle cx="100" cy="100" r="51" fill="none" stroke="url(#gold-metallic-secondary)" strokeWidth="2.5" />
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
