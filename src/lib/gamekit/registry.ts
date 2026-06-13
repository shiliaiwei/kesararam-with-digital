/**
 * GameKit format registry — the hub maps these into the existing GameCard.
 * Existing play-hub modes are untouched; these are appended as extra cards.
 */

import { dailyFormat } from "./formats/daily";
import { trafficCommanderFormat } from "./formats/traffic-commander";
import { signMatchFormat } from "./formats/sign-match";
import { signConnectFormat } from "./formats/sign-connect";
import { catchSignFormat } from "./formats/catch-sign";
import { lightHeroFormat } from "./formats/light-hero";
import { safetyAdventureFormat } from "./formats/safety-adventure";
import type { GameFormatMeta } from "./types";

// Note: typed loosely as the array mixes different TRound/TResult generics.
// Traffic Commander supersedes the old "Who Goes First" priority puzzle, which is
// no longer listed in the hub (its format file + route remain for any deep links).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GAMEKIT_FORMATS: { meta: GameFormatMeta }[] = [
    dailyFormat as any,
    trafficCommanderFormat as any,
    signMatchFormat as any,
    signConnectFormat as any,
    catchSignFormat as any,
    lightHeroFormat as any,
    safetyAdventureFormat as any,
];

/** Hub card metadata for all GameKit games (for /play). */
export const GAMEKIT_CARDS: GameFormatMeta[] = GAMEKIT_FORMATS.map((f) => f.meta);
