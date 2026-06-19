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

                        {/* Top Sign Yellow Gradient */}
                        <linearGradient id="sign-yellow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="50%" stopColor="#eab308" />
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
                        points="44,24 164,24 184,44 184,164 164,184 44,184 24,164 24,44"
                        fill="#000000"
                    />

                    {/* Main Beveled Frame Body */}
                    <polygon
                        points="40,20 160,20 180,40 180,160 160,180 40,180 20,160 20,40"
                        fill="url(#gold-metallic-primary)"
                        stroke="#000000"
                        strokeWidth="4"
                    />

                    {/* Inner Asphalt Road Surface of the square */}
                    <polygon
                        points="46,26 154,26 174,46 174,154 154,174 46,174 26,154 26,46"
                        fill="#1c1917"
                        stroke="#000000"
                        strokeWidth="2.5"
                    />

                    {/* Gold Corner Plates with Rivets */}
                    {/* Top-Left Corner */}
                    <polygon points="26,46 46,26 46,46" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="35" cy="35" r="2" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* Top-Right Corner */}
                    <polygon points="154,26 174,46 154,46" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="165" cy="35" r="2" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* Bottom-Left Corner */}
                    <polygon points="26,154 46,174 46,154" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="35" cy="165" r="2" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* Bottom-Right Corner */}
                    <polygon points="154,174 174,154 154,154" fill="url(#gold-metallic-secondary)" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="165" cy="165" r="2" fill="#cbd5e1" stroke="#000000" strokeWidth="0.8" />

                    {/* ── LEFT TRAFFIC LIGHT CAPSULE ── */}
                    <rect x="6" y="60" width="18" height="80" rx="9" fill="#000000" stroke="#000000" strokeWidth="4.5" />
                    <rect x="6" y="60" width="18" height="80" rx="9" fill="#000000" stroke="url(#gold-metallic-primary)" strokeWidth="1.5" />
                    {/* Left Lights */}
                    <circle cx="15" cy="73" r="4.2" className="gold-light-red" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="15" cy="100" r="4.2" className="gold-light-yellow" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="15" cy="127" r="4.2" className="gold-light-green" stroke="#000000" strokeWidth="0.8" />

                    {/* ── RIGHT TRAFFIC LIGHT CAPSULE ── */}
                    <rect x="176" y="60" width="18" height="80" rx="9" fill="#000000" stroke="#000000" strokeWidth="4.5" />
                    <rect x="176" y="60" width="18" height="80" rx="9" fill="#000000" stroke="url(#gold-metallic-primary)" strokeWidth="1.5" />
                    {/* Right Lights */}
                    <circle cx="185" cy="73" r="4.2" className="gold-light-red" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="185" cy="100" r="4.2" className="gold-light-yellow" stroke="#000000" strokeWidth="0.8" />
                    <circle cx="185" cy="127" r="4.2" className="gold-light-green" stroke="#000000" strokeWidth="0.8" />

                    {/* ── TOP WARNING DIAMOND SIGN ── */}
                    <polygon points="100,4 118,22 100,40 82,22" fill="url(#sign-yellow-gradient)" stroke="#000000" strokeWidth="3" />
                    <polygon points="100,7 115,22 100,37 85,22" fill="none" stroke="#000000" strokeWidth="1.2" />
                    {/* UP Arrow inside top sign */}
                    <path
                        d="M 100 30 L 100 16 M 94 21 L 100 14 L 106 21"
                        stroke="#000000"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    {/* ── BOTTOM ACCENT DIAMOND BADGE ── */}
                    <polygon points="100,158 120,178 100,198 80,178" fill="#0c0a09" stroke="#000000" strokeWidth="3" />
                    <polygon points="100,161 117,178 100,195 83,178" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="1.5" />
                    {/* Gold Safety Shield inside bottom badge */}
                    <path
                        d="M 94 171 L 106 171 C 106 171 106 179 100 185 C 94 179 94 171 94 171 Z"
                        fill="url(#gold-metallic-secondary)"
                        stroke="#000000"
                        strokeWidth="1"
                    />
                    {/* Tiny lightning bolt inside shield */}
                    <path
                        d="M 100 173 L 98 177 L 100 177 L 99 181 L 102 176 L 100 176 Z"
                        fill="#000000"
                        stroke="none"
                    />

                    {/* ── CIRCULAR PHOTO CUTOUT FRAME ── */}
                    {/* Outer Gold Ring */}
                    <circle cx="100" cy="100" r="48" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="3" />
                    {/* Inner Gold Ring */}
                    <circle cx="100" cy="100" r="44" fill="none" stroke="url(#gold-metallic-secondary)" strokeWidth="1" />
                    {/* Roadway Surface Ring */}
                    <circle cx="100" cy="100" r="42" fill="url(#gold-road-asphalt)" stroke="#000000" strokeWidth="2" />
                    {/* White Lanes */}
                    <circle cx="100" cy="100" r="38" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
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
