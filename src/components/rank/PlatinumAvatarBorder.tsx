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

export interface PlatinumAvatarBorderProps {
    src?: string | null;
    alt: string;
    username?: string;
    size?: AvatarSize;
    animated?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function PlatinumAvatarBorder({
    src,
    alt,
    username,
    size = "md",
    animated = true,
    className,
    children,
}: PlatinumAvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);
    const scale = SCALE[size];
    const showCustomAvatar = Boolean(children);
    const showImage = Boolean(src) && !imgFailed && !showCustomAvatar;
    const initial = username?.trim()?.charAt(0)?.toUpperCase() ?? "";

    const vars = {
        "--s": scale,
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "platinum-avatar",
                animated ? "platinum-avatar--animated" : "platinum-avatar--static",
                className,
            )}
            style={vars}
        >
            <div className="platinum-avatar__plate">
                {/* The high-resolution PLATINUM rank border PNG */}
                <img
                    src="/brand/platinum-avatar-border.png"
                    alt="Platinum Rank Border Frame"
                    className="platinum-avatar__frame-img"
                />

                {/* Sweeping silver/light shine overlay (masked to shield) */}
                <div className="platinum-avatar__shine" aria-hidden="true" />

                {/* Top information-sign badge glow */}
                <div className="platinum-avatar__top-glow" aria-hidden="true" />

                {/* Rotating/breathing ring light around the dashed road lane */}
                <div className="platinum-avatar__ring-glow" aria-hidden="true" />

                {/* Protected profile photo window in the center */}
                <div className="platinum-avatar__photo">
                    {showCustomAvatar ? (
                        <div className="platinum-avatar__custom-photo" role="img" aria-label={alt}>
                            {children}
                        </div>
                    ) : showImage ? (
                        <img
                            src={src as string}
                            alt={alt}
                            className="platinum-avatar__img"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div className="platinum-avatar__fallback" role="img" aria-label={alt}>
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

export default PlatinumAvatarBorder;
