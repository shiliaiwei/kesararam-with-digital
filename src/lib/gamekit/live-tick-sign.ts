/**
 * Live "Click the Sign" (tick-sign) helpers — shared by the session create route,
 * the /state poll, and the control-route SSE broadcasts.
 *
 * A live tick-sign session reuses the MCQ engine: each row is broadcast as one
 * `image_pick` question (prompt = the sign's name, 4 sign images as choices). The
 * answer key never leaves the server — a pick is correct iff the chosen sign's
 * topic id equals the prompt's topic id, which is exactly `questionId` for the
 * step (see the answer route). The full rows are persisted in
 * gameSessions.roundData; questionIds holds the per-row prompt ids so the existing
 * index/timer/scoring/sync machinery works unchanged.
 */

import { getSignItems } from "./kid-rounds";

export interface TickLiveRow {
    promptId: number; // topic id of the correct sign (== the step's questionId)
    promptEn: string;
    promptKm: string;
    choices: { id: number; imageUrl: string }[]; // 1 correct + 3 decoys, pre-shuffled
}

export interface TickLiveRoundData {
    rows: TickLiveRow[];
}

function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Build N click-the-sign rows (prompt name + 4 image choices: 1 correct + 3 decoys). */
export async function buildTickSignLiveRows(count: number): Promise<TickLiveRow[]> {
    const n = Math.max(1, Math.min(count, 30));
    const pool = await getSignItems(Math.min(40, n + 12));
    if (pool.length < 4) return [];

    const rows: TickLiveRow[] = [];
    for (let i = 0; i < n && i < pool.length; i++) {
        const prompt = pool[i];
        const decoys = shuffle(pool.filter((s) => s.id !== prompt.id)).slice(0, 3);
        const choices = shuffle([prompt, ...decoys]).map((c) => ({
            id: c.id,
            imageUrl: c.imageUrl,
        }));
        rows.push({
            promptId: prompt.id,
            promptEn: prompt.nameEn,
            promptKm: prompt.nameKm,
            choices,
        });
    }
    return rows;
}

/**
 * Shape one row as the live "currentQuestion" payload. gameType "image_pick" makes
 * the existing AnswerGrid render the 4 sign images with no UI change; the prompt
 * is the sign's name. The correct choice is never flagged.
 */
export function tickRowToQuestion(row: TickLiveRow) {
    return {
        id: row.promptId,
        questionEn: `Click the sign: ${row.promptEn}`,
        questionKm: `ចុចសញ្ញា៖ ${row.promptKm}`,
        imageUrl: null as string | null,
        audioUrlEn: null as string | null,
        audioUrlKm: null as string | null,
        difficulty: "easy" as string | null,
        gameType: "image_pick" as const,
        answers: row.choices.map((c) => ({
            id: c.id,
            answerEn: "",
            answerKm: "",
            imageUrl: c.imageUrl,
        })),
        topicCode: null as string | null,
    };
}
