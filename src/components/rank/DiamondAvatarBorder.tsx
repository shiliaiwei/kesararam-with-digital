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
                {/* Clean premium cyan squircle frame (scalable SVG, no PNG). */}
                <svg
                    className="diamond-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="diamond-cyan-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="40%" stopColor="#22d3ee" />
                            <stop offset="50%" stopColor="#ecfeff">
                                <animate attributeName="offset" values="0;1;0" dur="3.2s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="60%" stopColor="#67e8f9" />
                            <stop offset="100%" stopColor="#0e7490" />
                        </linearGradient>
                        <linearGradient id="diamond-cyan-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#cffafe" />
                            <stop offset="48%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#0e7490" />
                        </linearGradient>
                        <linearGradient id="diamond-silver-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e2e8f0" />
                            <stop offset="35%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate attributeName="offset" values="0;1;0" dur="3.6s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="65%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                        <radialGradient id="diamond-bg" cx="50%" cy="38%" r="78%">
                            <stop offset="0%" stopColor="#0c2230" />
                            <stop offset="70%" stopColor="#06141f" />
                            <stop offset="100%" stopColor="#020a10" />
                        </radialGradient>
                        <radialGradient id="diamond-asphalt" cx="50%" cy="44%" r="58%">
                            <stop offset="0%" stopColor="#102733" />
                            <stop offset="100%" stopColor="#040c12" />
                        </radialGradient>
                    </defs>

                    {/* Hard offset shadow. */}
                    <rect x="14" y="14" width="172" height="172" rx="28" fill="#000000" transform="translate(3.5,4)" />

                    {/* ── SILVER SQUIRCLE FRAME + DARK BODY ── */}
                    <rect x="14" y="14" width="172" height="172" rx="28" fill="url(#diamond-silver-metal)" stroke="#0f172a" strokeWidth="2" />
                    <rect x="18.5" y="18.5" width="163" height="163" rx="24" fill="none" stroke="#ecfeff" strokeWidth="1" opacity="0.7" />
                    <rect x="24" y="24" width="152" height="152" rx="20" fill="url(#diamond-bg)" stroke="#06151f" strokeWidth="1.5" />
                    <rect x="28" y="28" width="144" height="144" rx="17" fill="none" stroke="url(#diamond-cyan-metal)" strokeWidth="2" />

                    {/* Corner rivets. */}
                    {[[34, 34], [166, 34], [34, 166], [166, 166]].map(([cx, cy]) => (
                        <g key={`rv-${cx}-${cy}`}>
                            <circle cx={cx} cy={cy} r="3.2" fill="url(#diamond-silver-metal)" stroke="#0f172a" strokeWidth="0.9" />
                            <circle cx={cx} cy={cy} r="1" fill="#155e75" />
                        </g>
                    ))}

                    {/* ── CYAN ROAD RING (around the photo) ── */}
                    <circle cx="100" cy="100" r="57" fill="url(#diamond-asphalt)" />
                    <circle cx="100" cy="100" r="57" fill="none" stroke="url(#diamond-cyan-metal)" strokeWidth="3.4" />
                    <circle cx="100" cy="100" r="53" fill="none" stroke="#ecfeff" strokeWidth="1" opacity="0.8" />
                    <circle cx="100" cy="100" r="50.5" fill="none" stroke="#67e8f9" strokeWidth="1.6" strokeDasharray="6 5" opacity="0.95" />
                    <circle cx="100" cy="100" r="49" fill="none" stroke="url(#diamond-cyan-metal)" strokeWidth="1.4" />

                    {/* ── SIDE TRAFFIC-LIGHT CAPSULES (strobing) ── */}
                    {[33, 167].map((cx) => (
                        <g key={`tl-${cx}`}>
                            <rect x={cx - 7.5} y="78" width="15" height="44" rx="7" fill="#06121f" stroke="url(#diamond-silver-metal)" strokeWidth="1.7" />
                            <circle cx={cx} cy="87" r="4.3" className="diamond-light-red" stroke="#000000" strokeWidth="0.9" />
                            <circle cx={cx} cy="100" r="4.3" className="diamond-light-yellow" stroke="#000000" strokeWidth="0.9" />
                            <circle cx={cx} cy="113" r="4.3" className="diamond-light-green" stroke="#000000" strokeWidth="0.9" />
                            <circle cx={cx - 1.5} cy="85.6" r="1.3" fill="#ffffff" opacity="0.6" />
                        </g>
                    ))}

                    {/* ── TOP CREST (the division medallion sits here) ── */}
                    <polygon points="80,30 120,30 114,12 86,12" fill="url(#diamond-cyan-bevel)" stroke="#0f172a" strokeWidth="1.6" strokeLinejoin="round" />
                    <polygon points="100,2 109,11 100,20 91,11" fill="url(#diamond-cyan-metal)" stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* police strobe lights flanking the crest */}
                    <rect x="62" y="16" width="11" height="6" rx="1.6" className="diamond-police-red" stroke="#000000" strokeWidth="0.7" />
                    <rect x="127" y="16" width="11" height="6" rx="1.6" className="diamond-police-blue" stroke="#000000" strokeWidth="0.7" />

                    {/* ── PREMIUM DIAMOND NAMEPLATE ── */}
                    <rect x="54" y="152" width="92" height="20" rx="6" fill="#06141f" transform="translate(1.5,2)" />
                    <rect x="54" y="152" width="92" height="20" rx="6" fill="#06141f" stroke="url(#diamond-cyan-metal)" strokeWidth="2.2" />
                    <rect x="57" y="155" width="86" height="14" rx="4" fill="none" stroke="#67e8f9" strokeWidth="0.7" opacity="0.55" />
                    <polygon points="66,162 70,159 70,165" fill="url(#diamond-cyan-metal)" />
                    <polygon points="134,162 130,159 130,165" fill="url(#diamond-cyan-metal)" />
                    <text x="100" y="166" fill="url(#diamond-cyan-metal)" fontSize="10.5" fontWeight="900" fontFamily="Roboto, sans-serif" textAnchor="middle" letterSpacing="1.6">DIAMOND</text>
                </svg>

                {/* Sweeping crystal cyan/blue shine overlay */}
                <div className="diamond-avatar__shine" aria-hidden="true" />

                {/* Top jewel beacon glow */}
                <div className="diamond-avatar__top-glow" aria-hidden="true" />

                {/* Side crystal shimmer + side glows */}
                <div className="diamond-avatar__crystal-shimmer" aria-hidden="true" />
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

                {/* Division Badge (top-centre, on the crest) */}
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
