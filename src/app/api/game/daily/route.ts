import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
    getOrCreateDailySet,
    getDailyRounds,
    getExistingDailyAttempt,
    InsufficientQuestionsError,
} from "@/lib/gamekit/server";
import { todayInPhnomPenh } from "@/lib/gamekit/dates";

export const dynamic = "force-dynamic";

/** GET /api/game/daily — today's 5 rounds + alreadyPlayed (server-dated). */
export async function GET() {
    try {
        const session = await getSession();
        const today = todayInPhnomPenh();
        const set = await getOrCreateDailySet(today);
        const rounds = await getDailyRounds(set);

        let alreadyPlayed = false;
        if (session) {
            const prior = await getExistingDailyAttempt(session.id, today);
            alreadyPlayed = !!prior;
        }

        return NextResponse.json({ setId: set.id, rounds, alreadyPlayed });
    } catch (e) {
        if (e instanceof InsufficientQuestionsError) {
            return NextResponse.json(
                {
                    error: "unavailable",
                    message: {
                        en: "Today's challenge is not available yet. Please check back soon.",
                        kh: "បញ្ហាប្រចាំថ្ងៃមិនទាន់មាននៅឡើយទេ។ សូមត្រឡប់មកម្ដងទៀតពេលក្រោយ។",
                    },
                },
                { status: 503 }
            );
        }
        console.error("daily GET error:", e);
        return NextResponse.json({ error: "Failed to load daily" }, { status: 500 });
    }
}
