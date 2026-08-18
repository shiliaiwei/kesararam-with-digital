import * as React from "react";
import {
    TrafficCone,
    ChevronsUp,
    TriangleAlert,
    Info,
    Gem,
    ShieldCheck,
    OctagonAlert,
    Trophy,
    Crown,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankConfig, RankIconId } from "@/lib/ranks";

/**
 * SafetyIconBadge — a small road-safety icon chip that sits OUTSIDE the avatar
 * image (never over the photo). Uses Lucide icons only (Kesararam With Digital brand rule: no emoji,
 * no Unicode symbols). Flat, monochrome, single colour.
 */

/** Map a rank's icon id to its Lucide icon. */
const ICONS: Record<RankIconId, LucideIcon> = {
    "traffic-cone": TrafficCone,
    "chevrons-up": ChevronsUp,
    "triangle-alert": TriangleAlert,
    info: Info,
    gem: Gem,
    "shield-check": ShieldCheck,
    "octagon-alert": OctagonAlert,
    trophy: Trophy,
    crown: Crown,
};

export interface SafetyIconBadgeProps {
    config: RankConfig;
    /** icon box size in px (default 28) */
    size?: number;
    /** render as a circular road-sign chip instead of a square one */
    rounded?: boolean;
    className?: string;
}

export function SafetyIconBadge({ config, size = 28, rounded = false, className }: SafetyIconBadgeProps) {
    const Icon = ICONS[config.icon];
    const iconPx = Math.round(size * 0.62);

    return (
        <span
            className={cn(
                // road-sign chip · solid black border · hard offset shadow
                "inline-flex items-center justify-center border-2 border-black",
                "shadow-[2px_2px_0_0_#000]",
                rounded && "rounded-full",
                className,
            )}
            style={{
                width: size,
                height: size,
                background: config.primaryColor,
                color: config.textColor,
            }}
            aria-hidden="true"
        >
            <Icon size={iconPx} strokeWidth={2.5} />
        </span>
    );
}

export default SafetyIconBadge;
