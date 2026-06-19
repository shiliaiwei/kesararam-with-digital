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

    // Faceted warning-diamond gems (diamond = road warning sign). Top + bottom large,
    // left + right small — straddling the gold road ring like the reference.
    const diamonds = [
        { cx: 100, cy: 28, r: 23 },
        { cx: 100, cy: 172, r: 23 },
        { cx: 30, cy: 100, r: 18 },
        { cx: 170, cy: 100, r: 18 },
    ];
    // Beveled "ingot" bars flanking each diamond along the four edges.
    const bars = [
        { x: 42, y: 23, w: 34, h: 15 }, { x: 124, y: 23, w: 34, h: 15 },
        { x: 42, y: 162, w: 34, h: 15 }, { x: 124, y: 162, w: 34, h: 15 },
        { x: 23, y: 42, w: 15, h: 34 }, { x: 23, y: 124, w: 15, h: 34 },
        { x: 162, y: 42, w: 15, h: 34 }, { x: 162, y: 124, w: 15, h: 34 },
    ];

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
                {/* Ornate art-deco gold frame (scalable SVG, no PNG). */}
                <svg
                    className="gold-avatar__frame-img"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="gold-metallic-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ca8a04" />
                            <stop offset="25%" stopColor="#ffd700" />
                            <stop offset="50%" stopColor="#ffffff">
                                <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="75%" stopColor="#ffd700" />
                            <stop offset="100%" stopColor="#854d0e" />
                        </linearGradient>
                        <linearGradient id="gold-metallic-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ca8a04" />
                            <stop offset="50%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                        {/* Vertical gold bevel for raised bars / diamonds. */}
                        <linearGradient id="gold-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fff1b8" />
                            <stop offset="45%" stopColor="#f5c211" />
                            <stop offset="100%" stopColor="#8a5a07" />
                        </linearGradient>
                        <radialGradient id="gold-road-asphalt" cx="50%" cy="44%" r="58%">
                            <stop offset="0%" stopColor="#1c1917" />
                            <stop offset="75%" stopColor="#0c0a09" />
                            <stop offset="100%" stopColor="#020202" />
                        </radialGradient>
                    </defs>

                    {/* Hard offset shadow (brutalist, zero blur). */}
                    <rect x="14" y="14" width="172" height="172" rx="26" fill="#000000" transform="translate(4,4)" />

                    {/* ── GOLD SQUIRCLE FRAME + DARK BODY ── */}
                    <rect x="14" y="14" width="172" height="172" rx="26" fill="url(#gold-metallic-primary)" stroke="#000000" strokeWidth="3" />
                    <rect x="19" y="19" width="162" height="162" rx="22" fill="none" stroke="#fff3c0" strokeWidth="1" opacity="0.7" />
                    <rect x="24" y="24" width="152" height="152" rx="19" fill="#121212" stroke="url(#gold-metallic-secondary)" strokeWidth="2" />

                    {/* Beveled edge bars (flank each diamond). */}
                    {bars.map((b) => (
                        <g key={`bar-${b.x}-${b.y}`} stroke="#000000">
                            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="url(#gold-bevel)" strokeWidth="1.3" />
                            <rect x={b.x + 3} y={b.y + 3} width={b.w - 6} height={b.h - 6} rx="1" fill="url(#gold-metallic-secondary)" strokeWidth="0.7" />
                            <rect x={b.x + 3} y={b.y + 3} width={b.w - 6} height={(b.h - 6) / 2} rx="1" fill="#fff3c0" opacity="0.32" />
                        </g>
                    ))}

                    {/* Corner bevel studs. */}
                    {[[30, 30], [170, 30], [30, 170], [170, 170]].map(([cx, cy]) => (
                        <g key={`stud-${cx}-${cy}`} stroke="#000000">
                            <rect x={cx - 7} y={cy - 7} width="14" height="14" rx="2" fill="url(#gold-bevel)" strokeWidth="1.2" transform={`rotate(45 ${cx} ${cy})`} />
                            <circle cx={cx} cy={cy} r="2.4" fill="url(#gold-metallic-secondary)" strokeWidth="0.7" />
                        </g>
                    ))}

                    {/* ── ASPHALT ROAD RING + THICK GOLD RINGS (around the photo) ── */}
                    <circle cx="100" cy="100" r="58" fill="url(#gold-road-asphalt)" />
                    <circle cx="100" cy="100" r="58" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="3.5" />
                    <circle cx="100" cy="100" r="54" fill="none" stroke="url(#gold-metallic-secondary)" strokeWidth="2" />
                    <circle cx="100" cy="100" r="52" fill="none" stroke="#ffd700" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.85" />
                    <circle cx="100" cy="100" r="49" fill="none" stroke="url(#gold-metallic-primary)" strokeWidth="1.6" />

                    {/* ── FACETED WARNING-DIAMOND GEMS (drawn on top, straddling the ring) ── */}
                    {diamonds.map((d) => {
                        const { cx, cy, r } = d;
                        const ir = r * 0.62;
                        const C = `${cx},${cy}`;
                        const outer = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
                        const iT = `${cx},${cy - ir}`, iR = `${cx + ir},${cy}`, iB = `${cx},${cy + ir}`, iL = `${cx - ir},${cy}`;
                        return (
                            <g key={`gem-${cx}-${cy}`} stroke="#000000" strokeLinejoin="round">
                                <polygon points={outer} fill="url(#gold-bevel)" strokeWidth="1.6" />
                                <polygon points={`${iT} ${iR} ${iB} ${iL}`} fill="url(#gold-metallic-secondary)" strokeWidth="0.9" />
                                <polygon points={`${iT} ${C} ${iR}`} fill="#fff3c0" opacity="0.92" strokeWidth="0.4" />
                                <polygon points={`${iR} ${C} ${iB}`} fill="#dd9c12" strokeWidth="0.4" />
                                <polygon points={`${iB} ${C} ${iL}`} fill="#c5860c" strokeWidth="0.4" />
                                <polygon points={`${iL} ${C} ${iT}`} fill="#ffe79e" strokeWidth="0.4" />
                            </g>
                        );
                    })}
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

                {/* Rank Nameplate (Bottom-Center) */}
                <div className="gold-avatar__nameplate">GOLD</div>
            </div>
        </div>
    );
}

export default GoldAvatarBorder;
