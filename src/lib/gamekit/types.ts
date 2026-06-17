/**
 * GameKit core types — the plug-in contract every mini-game implements.
 *
 * A GameFormat declares static metadata, runtime config, how to fetch rounds,
 * where to POST results, and the per-round UI. The GameKitShell drives the
 * phase machine and the server gamekit service performs authoritative scoring.
 *
 * These types are shared client + server safe (no DB / scoring imports here).
 */

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type Lang = "en" | "kh";

/** Bilingual string pair used everywhere in the kit. */
export interface I18nText {
    en: string;
    kh: string;
}

/** Access tier controlling who may play and whether the score is recorded. */
export type AccessTier = "guest" | "user" | "class-pro";

/** Static, build-time metadata describing a game for the hub + routing. */
export interface GameFormatMeta {
    id: string; // e.g. "daily", "priority-puzzle", "sign-match"
    route: string; // e.g. "/play/daily"
    title: I18nText;
    description: I18nText;
    brandColor: string; // on-palette hex
    Icon: LucideIcon; // Lucide only — no emoji
    accessTier: AccessTier;
    badge?: I18nText; // hub card chip, e.g. {en:"DAILY", kh:"ប្រចាំថ្ងៃ"}
    /** Official game: pinned above others on the hub; usable in live teacher sessions. */
    official?: boolean;
}

/** Runtime config a format requests from the shell. */
export interface GameFormatConfig {
    timed: boolean; // does each round run a CountdownTimer?
    secondsPerRound: number; // used only when timed
    scoringMode: "speed" | "equal"; // forwarded to calculateScore
    showStreakHud: boolean; // show the streak flame chip
}

/** Normalized result a format emits for ONE round. */
export interface RoundResult {
    /** Stable id of the round subject (questionId or sceneId). */
    refId: number;
    /** Client's correctness guess — server re-validates; cosmetic HUD only. */
    isCorrectGuess: boolean;
    /** Opaque per-format payload the server needs to re-validate & score. */
    payload: Record<string, unknown>;
    timeTakenMs: number;
    /** Difficulty (forwarded to calculateScore); may be null. */
    difficulty?: string | null;
    /**
     * For multi-item rounds (drag N words, tick N rows): how many sub-items were
     * correct and the total. Drives the in-game HUD counter (so partial-correct
     * rounds visibly add points) and per-unit server scoring in recordGameAttempt.
     * Omit for single-answer rounds — they fall back to isCorrectGuess.
     */
    correctUnits?: number;
    unitCount?: number;
}

/** Props the shell passes into every format's round renderer. */
export interface RoundViewProps<TRound> {
    round: TRound;
    index: number;
    total: number;
    lang: Lang;
    muted: boolean;
    /** Call exactly once when the user completes this round. */
    onRoundComplete: (result: RoundResult) => void;
    /** Overridden timer limit (number of seconds, or null for no timer) */
    timerSeconds?: number | null;
}

/** Shared authoritative result returned by every complete endpoint. */
export interface KitCompletionResult {
    totalScore: number;
    correctAnswers: number;
    totalRounds: number;
    perRound: { refId: number; isCorrect: boolean; pointsEarned: number }[];
    persisted: boolean; // false for guests / unrecorded plays
}

/** The plug-in contract. TRound = per-round data; TResult = server result shape. */
export interface GameFormat<TRound, TResult extends KitCompletionResult> {
    meta: GameFormatMeta;
    config: GameFormatConfig;
    /** Client fetch of rounds (calls the format's GET API). */
    fetchRounds: () => Promise<{
        rounds: TRound[];
        alreadyPlayed?: boolean;
        locked?: boolean;
        lockMessage?: I18nText;
    }>;
    /** Server path the shell POSTs RoundResult[] to for authoritative scoring. */
    completePath: string;
    /** The per-round UI (reuses AnswerGrid / CountdownTimer where useful). */
    RoundView: ComponentType<RoundViewProps<TRound>>;
    /** Optional custom results view; falls back to shared brand results screen. */
    ResultView?: ComponentType<{ result: TResult; lang: Lang }>;
}

/** Result of the server access gate. */
export interface AccessDecision {
    allowed: boolean;
    reason?:
    | "guest_ok_no_record"
    | "needs_login"
    | "needs_class"
    | "needs_teacher_pro";
    willRecord: boolean; // whether a completion will persist
    message?: I18nText; // bilingual lock/notice message
}

/** Shell phase machine (mirrors solo/page.tsx: setup/loading/playing/results). */
export type KitPhase<TRound, TResult extends KitCompletionResult> =
    | { name: "setup" }
    | { name: "loading" }
    | { name: "locked"; message: I18nText }
    | { name: "alreadyPlayed" }
    | {
        name: "playing";
        rounds: TRound[];
        index: number;
        cosmeticScore: number;
        streak: number;
        secondsLimit: number | null;
    }
    | { name: "results"; result: TResult };
