import { CalendarDays } from "lucide-react";
import type { GameFormat } from "@/lib/gamekit/types";
import type { DailyRound, DailyCompletionResult } from "./types";
import { DailyRoundView } from "./DailyRoundView";

export const dailyFormat: GameFormat<DailyRound, DailyCompletionResult> = {
    meta: {
        id: "daily",
        route: "/play/daily",
        title: { en: "Daily Challenge", kh: "បញ្ហាប្រចាំថ្ងៃ" },
        description: {
            en: "5 questions. Same for everyone. Keep your streak alive.",
            kh: "សំណួរ ៥ ដូចគ្នាសម្រាប់អ្នករាល់គ្នា — រក្សាស្ទ្រីករបស់អ្នក។",
        },
        brandColor: "#a855f7",
        Icon: CalendarDays,
        accessTier: "guest",
        badge: { en: "DAILY", kh: "ប្រចាំថ្ងៃ" },
    },
    config: { timed: true, secondsPerRound: 30, scoringMode: "speed", showStreakHud: true },
    fetchRounds: async () => {
        const r = await fetch("/api/game/daily");
        if (!r.ok) return { rounds: [], locked: true, lockMessage: { en: "Daily challenge unavailable.", kh: "បញ្ហាប្រចាំថ្ងៃមិនមាន។" } };
        return r.json();
    },
    completePath: "/api/game/daily/complete",
    RoundView: DailyRoundView,
};
