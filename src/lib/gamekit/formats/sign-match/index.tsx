"use client";

import { useState, useMemo, useRef } from "react";
import { Grid2x2 } from "lucide-react";
import { cloudinaryOptimize } from "@/lib/cloudinary";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

interface Pair {
    id: number;
    nameEn: string;
    nameKm: string;
    imageUrl: string;
}
interface SignMatchRound {
    kind: "sign-match";
    pairs: Pair[];
}
type Card = { key: string; pairId: number; type: "image" | "text"; label?: string; imageUrl?: string };

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function SignMatchView({ round, lang, onRoundComplete }: RoundViewProps<SignMatchRound>) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "var(--font-learning)" } : {};
    const doneRef = useRef(false);
    const startRef = useRef(Date.now());

    const cards = useMemo<Card[]>(() => {
        const built: Card[] = [];
        for (const p of round.pairs) {
            built.push({ key: `i${p.id}`, pairId: p.id, type: "image", imageUrl: p.imageUrl });
            built.push({ key: `t${p.id}`, pairId: p.id, type: "text", label: kh ? p.nameKm || p.nameEn : p.nameEn });
        }
        return shuffle(built);
    }, [round, kh]);

    const [flipped, setFlipped] = useState<string[]>([]);
    const [matched, setMatched] = useState<Set<number>>(new Set());
    const [flips, setFlips] = useState(0);
    const lockRef = useRef(false);

    function onTap(card: Card) {
        if (lockRef.current || doneRef.current) return;
        if (matched.has(card.pairId) || flipped.includes(card.key)) return;
        const next = [...flipped, card.key];
        setFlipped(next);
        if (next.length === 2) {
            setFlips((f) => f + 1);
            lockRef.current = true;
            const [aKey, bKey] = next;
            const a = cards.find((c) => c.key === aKey)!;
            const b = cards.find((c) => c.key === bKey)!;
            const isMatch = a.pairId === b.pairId && a.type !== b.type;
            setTimeout(() => {
                if (isMatch) {
                    const m = new Set(matched);
                    m.add(a.pairId);
                    setMatched(m);
                    if (m.size === round.pairs.length && !doneRef.current) {
                        doneRef.current = true;
                        // score: reward fewer flips — count "correct" rounds as pairs matched
                        onRoundComplete({
                            refId: 0,
                            isCorrectGuess: true,
                            payload: { flips, pairs: round.pairs.length },
                            timeTakenMs: Date.now() - startRef.current,
                            difficulty: "easy",
                        });
                    }
                }
                setFlipped([]);
                lockRef.current = false;
            }, 650);
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="text-center text-sm font-black text-zinc-300" style={khFont}>
                {kh ? `ផ្គូផ្គងសញ្ញា · ${matched.size}/${round.pairs.length}` : `Match the signs · ${matched.size}/${round.pairs.length}`}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {cards.map((card) => {
                    const isUp = flipped.includes(card.key) || matched.has(card.pairId);
                    return (
                        <button
                            key={card.key}
                            onClick={() => onTap(card)}
                            className="aspect-square border-2 border-black flex items-center justify-center p-1.5 transition-all"
                            style={{
                                background: matched.has(card.pairId) ? "#22c55e" : isUp ? "#fff" : "#18181b",
                                boxShadow: "3px 3px 0 #000",
                                minHeight: 44,
                            }}
                            aria-label="card"
                        >
                            {isUp ? (
                                card.type === "image" ? (
                                    <img src={cloudinaryOptimize(card.imageUrl!, 200)} alt="" className="max-h-full max-w-full object-contain pointer-events-none" />
                                ) : (
                                    <span className="text-[10px] sm:text-xs font-black text-black text-center leading-tight" style={khFont}>{card.label}</span>
                                )
                            ) : (
                                <Grid2x2 size={20} className="text-zinc-600" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const signMatchFormat: GameFormat<SignMatchRound, KitCompletionResult> = {
    meta: {
        id: "sign-match",
        route: "/play/sign-match",
        title: { en: "Sign Match", kh: "Sign Match" },
        description: { en: "Flip cards and match each sign to its meaning.", kh: "ត្រឡប់ប័ណ្ណ ហើយផ្គូផ្គងសញ្ញានីមួយៗទៅនឹងអត្ថន័យ។" },
        brandColor: "#22c55e",
        Icon: Grid2x2,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "equal", showStreakHud: false },
    fetchRounds: async () => {
        const r = await fetch("/api/game/sign-match?count=6");
        if (!r.ok) { const d = await r.json().catch(() => ({})); return { rounds: [], locked: d.locked, lockMessage: d.lockMessage }; }
        return r.json();
    },
    completePath: "/api/game/sign-match/complete",
    RoundView: SignMatchView,
};
