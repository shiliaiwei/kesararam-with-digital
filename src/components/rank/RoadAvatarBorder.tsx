"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    getRankNameByScore,
    getDivisionForScore,
    type Division,
} from "@/lib/road-rank";
import type { AvatarSize } from "@/lib/ranks";

/**
 * RoadAvatarBorder — premium skeuomorphic road-safety avatar frame for the
 * Rookie (yellow) and Rising (green) ranks. Same physical frame, theme swapped by
 * rank. All geometry scales off the `--s` factor (sm .65 · md 1 · lg 1.33 · xl 1.66).
 *
 * CENTER RULE: the circular photo window shows ONLY the user image — no text,
 * glow, or animation over it. The single animated element is the traffic light.
 * Styles live in src/styles/road-avatar-border.css.
 */

const SCALE: Record<AvatarSize, number> = {
    sm: 0.65,
    md: 1,
    lg: 1.33,
    xl: 1.66,
};

interface RoadTheme {
    accent: string;
    accentL: string;
    accentD: string;
    accentDeep: string;
    labelTrim: string;
    shieldBg: string;
}

/** Rookie = yellow caution beginner · Rising = green go-forward progress. */
const THEMES: Record<"yellow" | "green", RoadTheme> = {
    yellow: {
        accent: "#eab308",
        accentL: "#facc15",
        accentD: "#ca8a04",
        accentDeep: "#854d0e",
        labelTrim: "#eab308",
        shieldBg: "#111827",
    },
    green: {
        accent: "#22c55e",
        accentL: "#84cc16",
        accentD: "#4d7c0f",
        accentDeep: "#365314",
        labelTrim: "#84cc16",
        shieldBg: "#0f2417",
    },
};

/* ── Sub-components ──────────────────────────────────────────────────────── */

/** Top-left corner bracket (with rivets) + dark division shield numeral. */
export function DivisionBadge({ division }: { division: Division }) {
    return (
        <>
            <span className="road-avatar__bracket" aria-hidden="true" />
            <span className="road-avatar__shield" aria-label={`Division ${division}`}>
                {division}
            </span>
        </>
    );
}

/** Right-edge traffic-light capsule — the only animated element. */
export function TrafficLightBadge() {
    return (
        <div className="road-traffic" aria-hidden="true">
            <span className="road-traffic__light road-traffic__light--red" />
            <span className="road-traffic__light road-traffic__light--yellow" />
            <span className="road-traffic__light road-traffic__light--green" />
        </div>
    );
}

/** Bottom hexagonal nameplate with the rank label. */
export function RankLabel({ label }: { label: string }) {
    return <div className="road-avatar__nameplate">{label}</div>;
}

/* ── Main component ─────────────────────────────────────────────────────── */

export interface RoadAvatarBorderProps {
    src?: string | null;
    alt: string;
    score: number;
    username?: string;
    size?: AvatarSize;
    /** run the 15s traffic-light loop (default true) */
    animated?: boolean;
    className?: string;
    /** Optional app-rendered avatar content, kept inside the protected photo window. */
    children?: React.ReactNode;
}

export function RoadAvatarBorder({
    src,
    alt,
    score,
    username,
    size = "md",
    animated = true,
    className,
    children,
}: RoadAvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);

    const rankName = getRankNameByScore(score);
    const division = getDivisionForScore(score);
    const theme = rankName === "Rising" ? THEMES.green : THEMES.yellow;
    const scale = SCALE[size];
    const label = rankName.toUpperCase();

    const showCustomAvatar = Boolean(children);
    const showImage = Boolean(src) && !imgFailed && !showCustomAvatar;
    const initial = username?.trim()?.charAt(0)?.toUpperCase() ?? "";

    const vars = {
        "--s": scale,
        "--accent": theme.accent,
        "--accent-l": theme.accentL,
        "--accent-d": theme.accentD,
        "--accent-deep": theme.accentDeep,
        "--label-trim": theme.labelTrim,
        "--shield-bg": theme.shieldBg,
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "road-avatar",
                animated ? "road-avatar--animated" : "road-avatar--static",
                className,
            )}
            data-rank={rankName.toLowerCase()}
            style={vars}
        >
            <div className="road-avatar__plate">
                <span className="road-avatar__caution" aria-hidden="true" />
                <span className="road-avatar__gloss" aria-hidden="true" />

                {/* roadway ring + white dashed lane */}
                <span className="road-avatar__ring" aria-hidden="true" />
                <svg className="road-avatar__lane" viewBox="0 0 100 100" aria-hidden="true">
                    <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeDasharray="4 5"
                        strokeLinecap="round"
                    />
                </svg>

                {/* protected photo window */}
                <div className="road-avatar__photo">
                    {showCustomAvatar ? (
                        <div className="road-avatar__custom-photo" role="img" aria-label={alt}>
                            {children}
                        </div>
                    ) : showImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src as string} alt={alt} onError={() => setImgFailed(true)} />
                    ) : (
                        <div className="road-avatar__fallback" role="img" aria-label={alt}>
                            {initial || (
                                <svg width="46%" height="46%" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.7-9 6v2h18v-2c0-3.3-4-6-9-6Z" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>

                {/* badges (all outside the photo) */}
                <DivisionBadge division={division} />

                <div className="road-avatar__chevron" aria-hidden="true">
                    <svg width="62%" height="58%" viewBox="0 0 24 24" fill="none" stroke="#0b0f17" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4 L12 12 L4 20" />
                        <path d="M12 4 L20 12 L12 20" />
                    </svg>
                </div>

                <TrafficLightBadge />
                <RankLabel label={label} />
            </div>
        </div>
    );
}

export default RoadAvatarBorder;
