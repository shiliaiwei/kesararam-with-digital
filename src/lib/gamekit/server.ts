/**
 * GameKit server service — the SINGLE place that scores plays via calculateScore
 * and persists points (lifetimePoints + pointsLedger + attempt tables).
 * API routes are thin wrappers around these functions.
 */

import { db } from "@/lib/db";
import { sql, eq, and, inArray } from "drizzle-orm";
import { users } from "@/db/schema/users";
import {
    questions,
    answers,
    dailyChallengeSets,
    dailyAttempts,
    userStreaks,
    priorityScenes,
    gameAttempts,
    pointsLedger,
    type DailyChallengeSet,
} from "@/db/schema/content";
import { calculateScore } from "@/lib/game-engine";
import {
    computeStreak,
    streakMilestoneBonus,
    sameMultiset,
    arrayEquals,
} from "./dates";
import type { RoundResult } from "./types";
import type { DailyCompletionResult } from "./formats/daily/types";
import type {
    PriorityRound,
    PriorityCompletionResult,
} from "./formats/priority/types";

const DAILY_QUESTION_COUNT = 5;
const DAILY_TOTAL_MS = 30_000;
const PRIORITY_TOTAL_MS = 30_000;

export class InsufficientQuestionsError extends Error {
    constructor() {
        super("Not enough approved questions for the daily set");
        this.name = "InsufficientQuestionsError";
    }
}

function isUniqueViolation(e: unknown): boolean {
    const msg = e instanceof Error ? e.message : String(e);
    return /duplicate key|unique constraint|daily_attempts_user_date_unique/i.test(
        msg
    );
}

/** Record one points-earning play in the ledger (windowed leaderboards). */
async function recordLedger(
    userId: number,
    source: string,
    gameType: string,
    points: number
) {
    if (points <= 0) return;
    await db.insert(pointsLedger).values({ userId, source, gameType, points });
}

/** Atomically add points to a user's lifetime total. */
async function addLifetimePoints(userId: number, points: number) {
    if (points <= 0) return;
    await db
        .update(users)
        .set({
            lifetimePoints: sql`${users.lifetimePoints} + ${points}`,
            totalGamesPlayed: sql`${users.totalGamesPlayed} + 1`,
            highestScore: sql`GREATEST(${users.highestScore}, ${points})`,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Challenge
// ─────────────────────────────────────────────────────────────────────────────

/** Get the daily set for `today`, creating it once if absent (concurrency-safe). */
export async function getOrCreateDailySet(
    today: string
): Promise<DailyChallengeSet> {
    const existing = await db
        .select()
        .from(dailyChallengeSets)
        .where(eq(dailyChallengeSets.challengeDate, today))
        .limit(1);
    if (existing[0]) return existing[0];

    // Pick DAILY_QUESTION_COUNT distinct approved/usable questions.
    const picks = await db
        .select({ id: questions.id })
        .from(questions)
        .where(inArray(questions.status, ["approved", "published"]))
        .orderBy(sql`RANDOM()`)
        .limit(DAILY_QUESTION_COUNT);

    if (picks.length < DAILY_QUESTION_COUNT) {
        throw new InsufficientQuestionsError();
    }

    const questionIds = picks.map((p) => p.id);
    try {
        const inserted = await db
            .insert(dailyChallengeSets)
            .values({ challengeDate: today, questionIds })
            .returning();
        return inserted[0];
    } catch (e) {
        if (isUniqueViolation(e)) {
            // Lost the race — re-read the winner's set.
            const row = await db
                .select()
                .from(dailyChallengeSets)
                .where(eq(dailyChallengeSets.challengeDate, today))
                .limit(1);
            if (row[0]) return row[0];
        }
        throw e;
    }
}

/** Build the client-facing daily rounds (no isCorrect leaked). */
export async function getDailyRounds(set: DailyChallengeSet) {
    const qRows = await db
        .select()
        .from(questions)
        .where(inArray(questions.id, set.questionIds));
    const aRows = await db
        .select()
        .from(answers)
        .where(inArray(answers.questionId, set.questionIds));

    const byQuestion = new Map<number, typeof aRows>();
    for (const a of aRows) {
        const list = byQuestion.get(a.questionId) ?? [];
        list.push(a);
        byQuestion.set(a.questionId, list);
    }

    // Preserve the set's question order.
    return set.questionIds
        .map((qid) => qRows.find((q) => q.id === qid))
        .filter((q): q is (typeof qRows)[number] => !!q)
        .map((q) => {
            const ans = (byQuestion.get(q.id) ?? []).sort(
                (x, y) => x.sortOrder - y.sortOrder
            );
            const hasImageAnswers = ans.some((a) => a.imageUrl);
            const gameType: "mcq" | "true_false" | "image_pick" =
                ans.length === 2 ? "true_false" : hasImageAnswers ? "image_pick" : "mcq";
            return {
                questionId: q.id,
                questionEn: q.questionEn,
                questionKm: q.questionKm,
                topicCode: null as string | null,
                imageUrl: q.imageUrl,
                gameType,
                difficulty: q.difficulty,
                answers: ans.map((a) => ({
                    id: a.id,
                    answerEn: a.answerEn,
                    answerKm: a.answerKm,
                    imageUrl: a.imageUrl,
                })),
            };
        });
}

/** Has this user already played the daily for `today`? */
export async function getExistingDailyAttempt(userId: number, today: string) {
    const rows = await db
        .select()
        .from(dailyAttempts)
        .where(
            and(
                eq(dailyAttempts.userId, userId),
                eq(dailyAttempts.challengeDate, today)
            )
        )
        .limit(1);
    return rows[0] ?? null;
}

/** Score + record a daily attempt (server-authoritative, anti-replay, streak). */
export async function recordDailyAttempt(
    userId: number | null,
    today: string,
    set: DailyChallengeSet,
    rounds: RoundResult[]
): Promise<DailyCompletionResult> {
    // Load authoritative correct answers (never trust the client).
    const aRows = await db
        .select({
            id: answers.id,
            questionId: answers.questionId,
            isCorrect: answers.isCorrect,
        })
        .from(answers)
        .where(inArray(answers.questionId, set.questionIds));
    const correctByQuestion = new Map<number, number>();
    for (const a of aRows) if (a.isCorrect) correctByQuestion.set(a.questionId, a.id);

    const qRows = await db
        .select({ id: questions.id, difficulty: questions.difficulty })
        .from(questions)
        .where(inArray(questions.id, set.questionIds));
    const diffByQuestion = new Map(qRows.map((q) => [q.id, q.difficulty]));

    let totalScore = 0;
    let correctCount = 0;
    let streak = 0;
    const perRound: DailyCompletionResult["perRound"] = [];

    for (const qid of set.questionIds) {
        const r = rounds.find((x) => x.refId === qid);
        const chosen = (r?.payload?.answerId as number | undefined) ?? null;
        const isCorrect = chosen !== null && correctByQuestion.get(qid) === chosen;
        if (isCorrect) {
            streak++;
            correctCount++;
        } else {
            streak = 0;
        }
        const timeTakenMs = r?.timeTakenMs ?? DAILY_TOTAL_MS;
        const s = calculateScore({
            isCorrect,
            difficulty: diffByQuestion.get(qid) ?? "medium",
            scoringMode: "speed",
            remainingTimeMs: Math.max(0, DAILY_TOTAL_MS - timeTakenMs),
            totalTimeMs: DAILY_TOTAL_MS,
            currentStreak: streak,
        });
        totalScore += s.totalPoints;
        perRound.push({ refId: qid, isCorrect, pointsEarned: s.totalPoints });
    }

    // Guest: compute but do not persist.
    if (userId === null) {
        return {
            totalScore,
            correctAnswers: correctCount,
            totalRounds: set.questionIds.length,
            perRound,
            persisted: false,
            currentStreak: 0,
            longestStreak: 0,
            streakBonusAwarded: 0,
            alreadyPlayed: false,
        };
    }

    // Streak (consecutive-day) + milestone bonus.
    const prevStreakRows = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);
    const prev = prevStreakRows[0] ?? null;
    const { current, longest } = computeStreak(prev, today);
    const streakBonus = streakMilestoneBonus(current);
    totalScore += streakBonus;

    // Persist: insert attempt (unique guard), streak, points, ledger.
    try {
        await db.insert(dailyAttempts).values({
            userId,
            challengeDate: today,
            setId: set.id,
            score: totalScore,
            correctCount,
            totalQuestions: set.questionIds.length,
            streakAfter: current,
            breakdown: JSON.stringify(perRound),
        });
    } catch (e) {
        if (isUniqueViolation(e)) {
            return toAlreadyPlayed(userId, today, set.questionIds.length);
        }
        throw e;
    }

    if (prev) {
        await db
            .update(userStreaks)
            .set({
                currentStreak: current,
                longestStreak: longest,
                lastPlayDate: today,
                updatedAt: new Date(),
            })
            .where(eq(userStreaks.userId, userId));
    } else {
        await db.insert(userStreaks).values({
            userId,
            currentStreak: current,
            longestStreak: longest,
            lastPlayDate: today,
        });
    }

    await addLifetimePoints(userId, totalScore);
    await recordLedger(userId, "daily", "daily", totalScore);

    return {
        totalScore,
        correctAnswers: correctCount,
        totalRounds: set.questionIds.length,
        perRound,
        persisted: true,
        currentStreak: current,
        longestStreak: longest,
        streakBonusAwarded: streakBonus,
        alreadyPlayed: false,
    };
}

async function toAlreadyPlayed(
    userId: number,
    today: string,
    totalQ: number
): Promise<DailyCompletionResult> {
    const prior = await getExistingDailyAttempt(userId, today);
    const perRound = prior?.breakdown
        ? (JSON.parse(prior.breakdown) as DailyCompletionResult["perRound"])
        : [];
    return {
        totalScore: prior?.score ?? 0,
        correctAnswers: prior?.correctCount ?? 0,
        totalRounds: prior?.totalQuestions ?? totalQ,
        perRound,
        persisted: true,
        currentStreak: prior?.streakAfter ?? 0,
        longestStreak: prior?.streakAfter ?? 0,
        streakBonusAwarded: 0,
        alreadyPlayed: true,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Who Goes First? (Priority Puzzle)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch N random approved scenes WITHOUT correctOrder (anti-cheat). */
export async function getPriorityScenes(count: number): Promise<PriorityRound[]> {
    const rows = await db
        .select()
        .from(priorityScenes)
        .where(eq(priorityScenes.status, "approved"))
        .orderBy(sql`RANDOM()`)
        .limit(Math.max(1, Math.min(count, 20)));

    return rows.map((s) => ({
        sceneId: s.id,
        titleEn: s.titleEn,
        titleKm: s.titleKm,
        layout: JSON.parse(s.layout),
        difficulty: s.difficulty,
    }));
}

/** Validate tapped orders + score (server-authoritative); reveal correctOrder after. */
export async function validatePriority(
    userId: number | null,
    rounds: { sceneId: number; submittedOrder: string[]; timeTakenMs: number }[]
): Promise<PriorityCompletionResult> {
    const sceneIds = rounds.map((r) => r.sceneId);
    const scenes = sceneIds.length
        ? await db
            .select()
            .from(priorityScenes)
            .where(
                and(
                    inArray(priorityScenes.id, sceneIds),
                    eq(priorityScenes.status, "approved")
                )
            )
        : [];
    const sceneById = new Map(scenes.map((s) => [s.id, s]));

    let totalScore = 0;
    let correctCount = 0;
    const perScene: PriorityCompletionResult["perScene"] = [];
    const perRound: PriorityCompletionResult["perRound"] = [];

    for (const r of rounds) {
        const scene = sceneById.get(r.sceneId);
        if (!scene) continue;
        const correctOrder = JSON.parse(scene.correctOrder) as string[];
        const layout = JSON.parse(scene.layout) as {
            vehicles: { id: string }[];
        };
        const vehicleIds = layout.vehicles.map((v) => v.id);
        const isPermutation = sameMultiset(r.submittedOrder, vehicleIds);
        const isCorrect = isPermutation && arrayEquals(r.submittedOrder, correctOrder);
        if (isCorrect) correctCount++;

        const s = calculateScore({
            isCorrect,
            difficulty: scene.difficulty ?? "medium",
            scoringMode: "speed",
            remainingTimeMs: Math.max(0, PRIORITY_TOTAL_MS - r.timeTakenMs),
            totalTimeMs: PRIORITY_TOTAL_MS,
            currentStreak: correctCount,
        });
        totalScore += s.totalPoints;

        perScene.push({
            sceneId: scene.id,
            submittedOrder: r.submittedOrder,
            correctOrder,
            isCorrect,
            explanationEn: scene.explanationEn,
            explanationKm: scene.explanationKm,
        });
        perRound.push({ refId: scene.id, isCorrect, pointsEarned: s.totalPoints });
    }

    let persisted = false;
    if (userId !== null && totalScore > 0) {
        await addLifetimePoints(userId, totalScore);
        await recordLedger(userId, "priority-puzzle", "priority-puzzle", totalScore);
        persisted = true;
    } else if (userId !== null) {
        persisted = true; // logged-in play counts as recorded even at 0 points
    }

    return {
        totalScore,
        correctAnswers: correctCount,
        totalRounds: rounds.length,
        perRound,
        persisted,
        perScene,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic kid/other GameKit games
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score + record a generic kid game. Correctness is taken from the client's
 * round result for arcade-style games (no DB answer key); points still use
 * calculateScore and only persist when `willRecord`.
 */
export async function recordGameAttempt(
    gameId: string,
    userId: number | null,
    willRecord: boolean,
    rounds: RoundResult[]
) {
    let totalScore = 0;
    let correctCount = 0;
    let streak = 0;
    const perRound: { refId: number; isCorrect: boolean; pointsEarned: number }[] = [];

    for (const r of rounds) {
        const isCorrect = !!r.isCorrectGuess;
        if (isCorrect) {
            streak++;
            correctCount++;
        } else {
            streak = 0;
        }
        const totalMs = 15_000;
        const s = calculateScore({
            isCorrect,
            difficulty: r.difficulty ?? "easy",
            scoringMode: "speed",
            remainingTimeMs: Math.max(0, totalMs - r.timeTakenMs),
            totalTimeMs: totalMs,
            currentStreak: streak,
        });
        totalScore += s.totalPoints;
        perRound.push({ refId: r.refId, isCorrect, pointsEarned: s.totalPoints });
    }

    let persisted = false;
    if (userId !== null && willRecord) {
        await db.insert(gameAttempts).values({
            userId,
            gameId,
            score: totalScore,
            correctCount,
            totalRounds: rounds.length,
            breakdown: JSON.stringify(perRound),
        });
        await addLifetimePoints(userId, totalScore);
        await recordLedger(userId, gameId, gameId, totalScore);
        persisted = true;
    }

    return {
        totalScore,
        correctAnswers: correctCount,
        totalRounds: rounds.length,
        perRound,
        persisted,
    };
}
