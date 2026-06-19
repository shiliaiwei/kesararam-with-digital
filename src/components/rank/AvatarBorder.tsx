"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    calculateRankAndDivision,
    type AvatarSize,
} from "@/lib/ranks";
import { PointsBadge } from "./PointsBadge";
import { RoadAvatarBorder } from "./RoadAvatarBorder";
import { GoldAvatarBorder } from "./GoldAvatarBorder";
import { PlatinumAvatarBorder } from "./PlatinumAvatarBorder";
import { DiamondAvatarBorder } from "./DiamondAvatarBorder";
import { MythicAvatarBorder } from "./MythicAvatarBorder";

export interface AvatarBorderProps {
    src?: string | null;
    alt: string;
    score: number;
    username?: string;
    size?: AvatarSize;
    /** show division shield + safety icon + rank banner (default true) */
    showBadges?: boolean;
    /** show the points chip (default true) */
    showPoints?: boolean;
    /** show the division shield (default true) */
    showDivision?: boolean;
    /** run the looping ring / badge animations (default true) */
    animated?: boolean;
    className?: string;
}

export function AvatarBorder({
    src,
    alt,
    score,
    username,
    size = "md",
    showBadges = true,
    showPoints = true,
    showDivision = true,
    animated = true,
    className,
}: AvatarBorderProps) {
    const { rank } = calculateRankAndDivision(score);

    const renderBorder = () => {
        if (rank.id === "mythic") {
            return (
                <MythicAvatarBorder
                    src={src}
                    alt={alt}
                    username={username}
                    score={score}
                    size={size}
                    animated={animated}
                />
            );
        }
        if (rank.id === "diamond") {
            return (
                <DiamondAvatarBorder
                    src={src}
                    alt={alt}
                    username={username}
                    score={score}
                    size={size}
                    animated={animated}
                />
            );
        }
        if (rank.id === "platinum") {
            return (
                <PlatinumAvatarBorder
                    src={src}
                    alt={alt}
                    username={username}
                    score={score}
                    size={size}
                    animated={animated}
                />
            );
        }
        if (rank.id === "gold") {
            return (
                <GoldAvatarBorder
                    src={src}
                    alt={alt}
                    username={username}
                    score={score}
                    size={size}
                    animated={animated}
                />
            );
        }
        return (
            <RoadAvatarBorder
                src={src}
                alt={alt}
                username={username}
                score={score}
                size={size}
                animated={animated}
                showRankBadge={true}
            />
        );
    };

    return (
        <div className={cn("inline-flex flex-col items-center", className)}>
            {renderBorder()}
            {/* Show points badge under the frame if requested */}
            {showBadges && showPoints && (
                <PointsBadge
                    config={rank}
                    points={score > 0 ? score : undefined}
                    label={score > 0 ? undefined : rank.displayPoints}
                    animated={animated}
                    className="mt-2"
                />
            )}
        </div>
    );
}

export default AvatarBorder;
