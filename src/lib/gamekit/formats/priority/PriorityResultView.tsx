"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { Lang } from "@/lib/gamekit/types";
import type { PriorityCompletionResult } from "./types";

export function PriorityResultView({
    result,
    lang,
}: {
    result: PriorityCompletionResult;
    lang: Lang;
}) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

    return (
        <div className="flex flex-col gap-3">
            {result.perScene.map((s, i) => (
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
                    <div className="text-xs font-mono text-zinc-600 mb-1">
                        {kh ? "ចម្លើយត្រូវ៖ " : "Correct order: "}
                        {s.correctOrder.join(" → ")}
                    </div>
                    {!s.isCorrect && (
                        <div className="text-xs font-mono text-red-500 mb-1">
                            {kh ? "អ្នកជ្រើស៖ " : "You chose: "}
                            {s.submittedOrder.join(" → ") || "—"}
                        </div>
                    )}
                    <p className="text-sm font-bold text-zinc-800 mt-2" style={khFont}>
                        {kh ? s.explanationKm || s.explanationEn : s.explanationEn}
                    </p>
                </div>
            ))}
        </div>
    );
}
