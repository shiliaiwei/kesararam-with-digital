"use client";

import { useState, useRef } from "react";
import { TrafficCone, Hand, Footprints, AlertTriangle } from "lucide-react";
import type { GameFormat, RoundViewProps, KitCompletionResult } from "@/lib/gamekit/types";

interface LightHeroRound {
    kind: "light-hero";
    light: "green" | "red" | "yellow";
}

const ACTIONS = [
    { id: "go", correctFor: "green", en: "Go", km: "ទៅ", Icon: Footprints, color: "#22c55e" },
    { id: "stop", correctFor: "red", en: "Stop", km: "ឈប់", Icon: Hand, color: "#ef4444" },
    { id: "slow", correctFor: "yellow", en: "Slow", km: "បន្ថយ", Icon: AlertTriangle, color: "#f59e0b" },
] as const;

const LIGHT_COLOR = { green: "#22c55e", red: "#ef4444", yellow: "#f59e0b" };

function LightHeroView({ round, lang, onRoundComplete }: RoundViewProps<LightHeroRound>) {
    const kh = lang === "kh";
    const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
    const [picked, setPicked] = useState<string | null>(null);
    const startRef = useRef(Date.now());
    const doneRef = useRef(false);

    function pick(actionId: string, correctFor: string) {
        if (doneRef.current) return;
        doneRef.current = true;
        setPicked(actionId);
        const isCorrect = round.light === correctFor;
        setTimeout(() => {
            onRoundComplete({
                refId: 0,
                isCorrectGuess: isCorrect,
                payload: { picked: actionId, light: round.light },
                timeTakenMs: Date.now() - startRef.current,
                difficulty: "easy",
            });
        }, 450);
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="text-center text-sm font-black text-zinc-300" style={khFont}>
                {kh ? "តើអ្នកគួរធ្វើអ្វី?" : "What should you do?"}
            </div>
            {/* Traffic light */}
            <div className="border-4 border-black bg-zinc-900 p-3 flex flex-col gap-2.5" style={{ boxShadow: "5px 5px 0 #000" }}>
                {(["red", "yellow", "green"] as const).map((c) => (
                    <span
                        key={c}
                        className="w-12 h-12 rounded-full border-2 border-black"
                        style={{ background: round.light === c ? LIGHT_COLOR[c] : "#3f3f46", opacity: round.light === c ? 1 : 0.4 }}
                    />
                ))}
            </div>
            {/* Actions */}
            <div className="grid grid-cols-3 gap-3 w-full">
                {ACTIONS.map((a) => {
                    const reveal = picked !== null;
                    const isCorrect = round.light === a.correctFor;
                    const isPicked = picked === a.id;
                    return (
                        <button
                            key={a.id}
                            onClick={() => pick(a.id, a.correctFor)}
                            disabled={picked !== null}
                            className="py-5 border-4 border-black flex flex-col items-center gap-2 font-black transition-all"
                            style={{
                                background: reveal ? (isCorrect ? "#bbf7d0" : isPicked ? "#fecaca" : "#fff") : "#fff",
                                boxShadow: "4px 4px 0 #000",
                                minHeight: 44,
                            }}
                        >
                            <a.Icon size={28} style={{ color: a.color }} strokeWidth={2.4} />
                            <span className="text-sm" style={khFont}>{kh ? a.km : a.en}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const lightHeroFormat: GameFormat<LightHeroRound, KitCompletionResult> = {
    meta: {
        id: "light-hero",
        route: "/play/light-hero",
        title: { en: "Traffic Light Hero", kh: "បញ្ញាបរភ្លើងសញ្ញា" },
        description: { en: "Green go, red stop, yellow slow — tap the right action!", kh: "បៃតងទៅ ក្រហមឈប់ លឿងបន្ថយ — ប៉ះសកម្មភាពត្រឹមត្រូវ!" },
        brandColor: "#ef4444",
        Icon: TrafficCone,
        accessTier: "user",
        badge: { en: "KIDS", kh: "កុមារ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "speed", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/light-hero?count=8");
        if (!r.ok) { const d = await r.json().catch(() => ({})); return { rounds: [], locked: d.locked, lockMessage: d.lockMessage }; }
        return r.json();
    },
    completePath: "/api/game/light-hero/complete",
    RoundView: LightHeroView,
};
