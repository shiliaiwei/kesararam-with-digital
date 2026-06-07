import { Sparkles } from "lucide-react";
import type { GameFormat } from "@/lib/gamekit/types";
import type { PriorityRound, PriorityCompletionResult } from "./types";
import { PriorityRoundView } from "./PriorityRoundView";
import { PriorityResultView } from "./PriorityResultView";

export const priorityFormat: GameFormat<PriorityRound, PriorityCompletionResult> = {
    meta: {
        id: "priority-puzzle",
        route: "/play/priority-puzzle",
        title: { en: "Who Goes First?", kh: "តើអ្នកណាទៅមុន?" },
        description: {
            en: "Tap the vehicles in the correct right-of-way order.",
            kh: "ប៉ះរថយន្តតាមលំដាប់សិទ្ធិទៅមុនឱ្យបានត្រឹមត្រូវ។",
        },
        brandColor: "#06b6d4",
        Icon: Sparkles,
        accessTier: "user",
        badge: { en: "PRIORITY", kh: "អាទិភាព" },
    },
    config: { timed: false, secondsPerRound: 30, scoringMode: "speed", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/priority?count=5");
        if (!r.ok) return { rounds: [], locked: true, lockMessage: { en: "No scenes available.", kh: "មិនមានឆាក។" } };
        return r.json();
    },
    completePath: "/api/game/priority/complete",
    RoundView: PriorityRoundView,
    ResultView: PriorityResultView,
};
