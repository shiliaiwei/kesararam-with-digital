import { Route } from "lucide-react";
import type { GameFormat } from "@/lib/gamekit/types";
import type { TrafficRound, TrafficCompletionResult } from "./types";
import { SceneView } from "./SceneView";
import { TrafficResultView } from "./ResultView";

export const trafficCommanderFormat: GameFormat<TrafficRound, TrafficCompletionResult> = {
    meta: {
        id: "traffic-commander",
        route: "/play/traffic-commander",
        title: { en: "Traffic Commander", kh: "Traffic Commander" },
        description: {
            en: "Draw each vehicle's path through the junction — in the right order.",
            kh: "គូរផ្លូវរថយន្តកាត់ផ្លូវប្រសព្វ តាមលំដាប់ត្រឹមត្រូវ។",
        },
        brandColor: "#06b6d4",
        Icon: Route,
        accessTier: "user",
        badge: { en: "COMMAND", kh: "បញ្ជាការ" },
    },
    config: { timed: false, secondsPerRound: 0, scoringMode: "speed", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/traffic-commander?count=5");
        if (!r.ok) {
            const d = await r.json().catch(() => ({}));
            return { rounds: [], locked: d.locked, lockMessage: d.lockMessage };
        }
        return r.json();
    },
    completePath: "/api/game/traffic-commander/complete",
    RoundView: SceneView,
    ResultView: TrafficResultView,
};
