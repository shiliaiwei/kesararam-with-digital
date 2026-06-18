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
    const scale = typeof size === "number" ? size / 73.1 : SCALE[size];
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
                {/* Scalable SVG Frame instead of a static PNG */}
                <svg
                    className="mythic-avatar__frame-img"
                    viewBox="0 0 170 170"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Gold Metallic Sweep Gradient */}
                        <linearGradient id="mythic-gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffd700" />
                            <stop offset="35%" stopColor="#f59e0b" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate
                                    attributeName="offset"
                                    values="0;1;0"
                                    dur="3s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="65%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                    </defs>

                    {/* Shield Shadow */}
                    <path
                        d="M 85 15 L 140 25 L 145 105 Q 120 150 85 160 Q 50 150 25 105 L 30 25 Z"
                        fill="#000000"
                        transform="translate(4, 4)"
                    />
                    
                    {/* Main Purple Shield Frame */}
                    <path
                        d="M 85 15 L 140 25 L 145 105 Q 120 150 85 160 Q 50 150 25 105 L 30 25 Z"
                        fill="#a855f7"
                        stroke="#000000"
                        strokeWidth="3.5"
                    />

                    {/* Gold Inner Border Accent */}
                    <path
                        d="M 85 22 L 132 30 L 136 100 Q 115 140 85 149 Q 55 140 34 100 L 38 30 Z"
                        fill="none"
                        stroke="url(#mythic-gold-metal)"
                        strokeWidth="2.5"
                    />

                    {/* Asphalt Roadway Ring */}
                    <circle
                        cx="85"
                        cy="85"
                        r="42"
                        fill="#1c1917"
                        stroke="#000000"
                        strokeWidth="3.5"
                    />

                    {/* White Dashed Lane Markings */}
                    <circle
                        cx="85"
                        cy="85"
                        r="42"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                    />

                    {/* Crown Top Center */}
                    <g transform="translate(75, 4)">
                        <polygon
                            points="0,12 0,4 5,6.4 10,1.6 15,6.4 20,4 20,12"
                            fill="url(#mythic-gold-metal)"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                        <circle cx="0" cy="3.2" r="1" fill="#ffd700" stroke="#000" strokeWidth="0.5" />
                        <circle cx="10" cy="1.2" r="1" fill="#ffd700" stroke="#000" strokeWidth="0.5" />
                        <circle cx="20" cy="3.2" r="1" fill="#ffd700" stroke="#000" strokeWidth="0.5" />
                    </g>
                </svg>

                {/* Sweeping purple/gold luxury shine overlay */}
                <div className="mythic-avatar__shine" aria-hidden="true" />

                {/* Crown jewels beacon glow */}
                <div className="mythic-avatar__crown-glow" aria-hidden="true" />

                {/* Flashing lightning bolt glows */}
                <div className="mythic-avatar__lightning-glow mythic-avatar__lightning-glow--left" aria-hidden="true" />
                <div className="mythic-avatar__lightning-glow mythic-avatar__lightning-glow--right" aria-hidden="true" />

                {/* Blinking caution warning sign (bottom-left) */}
                <div className="mythic-avatar__caution-glow" aria-hidden="true" />

                {/* Shimmering trophy glow (bottom-right) */}
                <div className="mythic-avatar__trophy-glow" aria-hidden="true" />

                {/* HUD Ring Glow around photo cutout */}
                <div className="mythic-avatar__ring-glow" aria-hidden="true" />

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

                {/* Division Badge (Top-Left) */}
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
