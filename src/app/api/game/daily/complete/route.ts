import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
    getOrCreateDailySet,
    recordDailyAttempt,
    InsufficientQuestionsError,
} from "@/lib/gamekit/server";
import { todayInPhnomPenh } from "@/lib/gamekit/dates";
import type { RoundResult } from "@/lib/gamekit/types";

export const dynamic = "force-dynamic";

/** POST /api/game/daily/complete — score 5 answers, record attempt, update streak. */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const today = todayInPhnomPenh();
        const set = await getOrCreateDailySet(today);

        const body = await req.json().catch(() => ({}));
        const rounds: RoundResult[] = Array.isArray(body?.rounds) ? body.rounds : [];

        const result = await recordDailyAttempt(
            session?.id ?? null,
            today,
            set,
            rounds
        );
        return NextResponse.json(result);
    } catch (e) {
        if (e instanceof InsufficientQuestionsError) {
            return NextResponse.json({ error: "unavailable" }, { status: 503 });
        }
        console.error("daily complete error:", e);
        return NextResponse.json({ error: "Failed to record" }, { status: 500 });
    }
}
