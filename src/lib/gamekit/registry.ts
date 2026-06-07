/**
 * GameKit format registry — the hub maps these into the existing GameCard.
 * Existing play-hub modes are untouched; these are appended as extra cards.
 */

import { dailyFormat } from "./formats/daily";
import { priorityFormat } from "./formats/priority";
import { signMatchFormat } from "./formats/sign-match";
import { catchSignFormat } from "./formats/catch-sign";
import { lightHeroFormat } from "./formats/light-hero";
import { safetyAdventureFormat } from "./formats/safety-adventure";
import type { GameFormatMeta } from "./types";

// Note: typed loosely as the array mixes different TRound/TResult generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GAMEKIT_FORMATS: { meta: GameFormatMeta }[] = [
    dailyFormat as any,
    priorityFormat as any,
    signMatchFormat as any,
    catchSignFormat as any,
    lightHeroFormat as any,
    safetyAdventureFormat as any,
];

/** Hub card metadata for all GameKit games (for /play). */
export const GAMEKIT_CARDS: GameFormatMeta[] = GAMEKIT_FORMATS.map((f) => f.meta);
