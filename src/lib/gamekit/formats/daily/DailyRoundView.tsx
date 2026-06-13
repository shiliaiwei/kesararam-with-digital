"use client";

import { useState, useRef } from "react";
import { AnswerGrid } from "@/components/game/AnswerGrid";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import type { RoundViewProps } from "@/lib/gamekit/types";
import type { DailyRound } from "./types";

const ROUND_SECONDS = 30;

export function DailyRoundView({
    round,
    lang,
    muted,
    onRoundComplete,
    timerSeconds,
}: RoundViewProps<DailyRound>) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const startRef = useRef(Date.now());
    const doneRef = useRef(false);
    const limit = timerSeconds !== undefined ? timerSeconds : ROUND_SECONDS;
    const [endsAt] = useState(() => limit ? new Date(Date.now() + limit * 1000).toISOString() : "");

    function finish(answerId: number | null) {
        if (doneRef.current) return;
        doneRef.current = true;
        onRoundComplete({
            refId: round.questionId,
            isCorrectGuess: false, // server is authoritative; cosmetic guess unused for daily
            payload: { answerId },
            timeTakenMs: Date.now() - startRef.current,
            difficulty: round.difficulty,
        });
    }

    function handleSelect(id: number) {
        if (selectedId !== null) return;
        setSelectedId(id);
        setTimeout(() => finish(id), 600);
    }

    return (
        <>
            {limit !== null && (
                <div className="flex items-center justify-end">
                    <CountdownTimer
                        endsAt={endsAt}
                        totalSeconds={limit}
                        muted={muted}
                        onExpire={() => finish(null)}
                    />
                </div>
            )}

            {round.imageUrl && (
                <div className="shrink-0 w-full h-44 flex items-center justify-center p-3 border-4 border-black bg-white" style={{ boxShadow: "6px 6px 0 #000" }}>
                    <img
                        src={cloudinaryOptimize(round.imageUrl, 800)}
                        alt="question"
                        className="h-full w-auto object-contain select-none pointer-events-none"
                    />
                </div>
            )}

            <div
                className="shrink-0 w-full bg-zinc-900 border-2 border-black p-3 text-white font-black flex items-center justify-center text-center"
                style={{ fontSize: "clamp(0.95rem, 3.5vw, 1.4rem)", lineHeight: 1.3, ...khFont }}
            >
                {kh ? round.questionKm || round.questionEn : round.questionEn}
            </div>

            <AnswerGrid
                answers={round.answers}
                selectedId={selectedId}
                correctId={null}
                disabled={selectedId !== null}
                lang={lang}
                gameType={round.gameType}
                onSelect={handleSelect}
            />
        </>
    );
}
