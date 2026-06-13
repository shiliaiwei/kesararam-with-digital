"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { Lang } from "@/lib/gamekit/types";
import type { PriorityCompletionResult } from "./types";

/** Build a stable id → 1-based label map for one scene (sorted vehicle ids). */
function labelMap(ids: string[]): Record<string, number> {
    const unique = Array.from(new Set(ids)).sort();
    const map: Record<string, number> = {};
    unique.forEach((id, i) => { map[id] = i + 1; });
    return map;
}

function OrderBadges({ ids, map, tone }: { ids: string[]; map: Record<string, number>; tone: "ok" | "bad" }) {
    if (ids.length === 0) return <span className="text-zinc-400">—</span>;
    return (
        <span className="inline-flex items-center gap-1 flex-wrap align-middle">
            {ids.map((id, i) => (
                <span key={`${id}-${i}`} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-zinc-400">→</span>}
                    <span
                        className={`w-5 h-5 text-[11px] font-black flex items-center justify-center rounded-full border ${tone === "ok" ? "bg-green-600 text-white border-green-700" : "bg-red-500 text-white border-red-600"}`}
                    >
                        {map[id] ?? "?"}
                    </span>
                </span>
            ))}
        </span>
    );
}

export function PriorityResultView({
    result,
    lang,
}: {
    result: PriorityCompletionResult;
    lang: Lang;
}) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};

    return (
        <div className="flex flex-col gap-3">
            {result.perScene.map((s, i) => {
                const map = labelMap([...s.correctOrder, ...s.submittedOrder]);
                return (
                    <div key={s.sceneId} className="border-2 border-black bg-white p-4" style={{ boxShadow: "3px 3px 0 #000" }}>
                        <div className="flex items-center gap-2 mb-2">
                            {s.isCorrect ? (
                                <CheckCircle2 size={18} className="text-green-600" />
                            ) : (
                                <XCircle size={18} className="text-red-500" />
                            )}
                            <span className="font-black text-sm" style={khFont}>
                                {kh ? `ឆាក ${i + 1}` : `Scene ${i + 1}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-1" style={khFont}>
                            <span className="font-bold">{kh ? "ទៅមុនគេ: " : "Goes first:"}</span>
                            <OrderBadges ids={s.correctOrder.slice(0, 1)} map={map} tone="ok" />
                            <span className="text-zinc-400 ml-1">{kh ? "(លំដាប់ពេញ: " : "(full order: "}</span>
                            <OrderBadges ids={s.correctOrder} map={map} tone="ok" />
                            <span className="text-zinc-400">)</span>
                        </div>
                        {!s.isCorrect && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-1" style={khFont}>
                                <span className="font-bold">{kh ? "អ្នកជ្រើស: " : "You chose:"}</span>
                                <OrderBadges ids={s.submittedOrder} map={map} tone="bad" />
                            </div>
                        )}
                        <p className="text-sm font-bold text-zinc-800 mt-2" style={khFont}>
                            {kh ? s.explanationKm || s.explanationEn : s.explanationEn}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
