import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RANK_CONFIGS, DIVISIONS } from "@/lib/ranks";

/**
 * AllTierPreview — the simple progression flows:
 *   Rookie → Rising → … → Highmaster   (tier flow)
 *   IV → III → II → I → Rank Up          (division flow)
 * Pure chips, no avatar frames, for a compact "how it works" strip.
 */

export interface AllTierPreviewProps {
    className?: string;
}

export function AllTierPreview({ className }: AllTierPreviewProps) {
    return (
        <div className={cn("space-y-5", className)}>
            {/* Tier flow */}
            <div>
                <div className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Rank Flow
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {RANK_CONFIGS.map((config, i) => (
                        <React.Fragment key={config.id}>
                            <span
                                className="border-2 border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wide shadow-[2px_2px_0_0_#000]"
                                style={{ background: config.primaryColor, color: config.textColor }}
                            >
                                {config.label}
                            </span>
                            {i < RANK_CONFIGS.length - 1 && (
                                <ArrowRight size={16} strokeWidth={3} className="text-black" aria-hidden />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Division flow */}
            <div>
                <div className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-500">
                    Division Flow
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {DIVISIONS.map((d) => (
                        <React.Fragment key={d}>
                            <span className="inline-flex h-8 w-8 items-center justify-center border-2 border-black bg-[#0a0a0a] text-sm font-black tabular-nums text-white shadow-[2px_2px_0_0_#000]">
                                {d}
                            </span>
                            <ArrowRight size={16} strokeWidth={3} className="text-black" aria-hidden />
                        </React.Fragment>
                    ))}
                    <span className="border-2 border-black bg-[#eab308] px-3 py-1.5 text-sm font-black uppercase tracking-wide text-black shadow-[2px_2px_0_0_#000]">
                        Rank Up
                    </span>
                </div>
            </div>
        </div>
    );
}

export default AllTierPreview;
