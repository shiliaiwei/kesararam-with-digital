"use client";

import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvatarSize } from "@/lib/ranks";

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
    size?: AvatarSize | number;
    animated?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function DiamondAvatarBorder({
    src,
    alt,
    username,
    size = "md",
    animated = true,
    className,
    children,
}: DiamondAvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);
    const scale = typeof size === "number" ? size / 73.1 : SCALE[size];
    const showCustomAvatar = Boolean(children);
    const showImage = Boolean(src) && !imgFailed && !showCustomAvatar;
    const initial = username?.trim()?.charAt(0)?.toUpperCase() ?? "";

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
                {/* The high-resolution DIAMOND rank border PNG */}
                <img
                    src="/brand/diamond-avatar-border.png"
                    alt="Diamond Rank Border Frame"
                    className="diamond-avatar__frame-img"
                />

                {/* Sweeping crystal cyan/blue shine overlay */}
                <div className="diamond-avatar__shine" aria-hidden="true" />

                {/* Top diamond jewel beacon glow */}
                <div className="diamond-avatar__top-glow" aria-hidden="true" />

                {/* Side crystal shards shimmer/glow */}
                <div className="diamond-avatar__crystal-shimmer" aria-hidden="true" />

                {/* Bottom-right roundabout traffic sign glow */}
                <div className="diamond-avatar__sign-glow" aria-hidden="true" />

                {/* Protected profile photo window in the center (43% cutout) */}
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
            </div>
        </div>
    );
}

export default DiamondAvatarBorder;
