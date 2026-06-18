import * as React from "react";
import { cn } from "@/lib/utils";
import { RANK_CONFIGS } from "@/lib/ranks";
import { AvatarBorder } from "./AvatarBorder";

/**
 * RankShowcaseGrid — all 9 tiers in a clean 3×3 grid. Each card shows the avatar
 * frame (placeholder photo), rank name, display points, an example division badge
 * (IV at threshold), the road-safety icon and a short description.
 */

export interface RankShowcaseGridProps {
    animated?: boolean;
    className?: string;
}

export function RankShowcaseGrid({ animated = true, className }: RankShowcaseGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
                className,
            )}
        >
            {RANK_CONFIGS.map((config) => (
                <div
                    key={config.id}
                    className="flex flex-col items-center gap-3 border-2 border-black bg-white p-5 text-center shadow-[4px_4px_0_0_#000]"
                >
                    <AvatarBorder
                        // placeholder photo → fallback user icon, shows the frame clearly
                        src={null}
                        alt={`${config.name} rank frame`}
                        username={config.name}
                        score={config.minPoints}
                        size="md"
                        animated={animated}
                    />

                    <div className="mt-1">
                        <div className="text-base font-black uppercase tracking-wide text-black">
                            {config.label}
                        </div>
                        <div
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: config.accentColor }}
                        >
                            {config.displayPoints}
                        </div>
                    </div>

                    <p className="text-xs leading-snug text-zinc-600">{config.description}</p>
                </div>
            ))}
        </div>
    );
}

export default RankShowcaseGrid;
