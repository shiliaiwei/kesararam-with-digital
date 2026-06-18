import * as React from "react";
import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import {
    calculateRankAndDivision,
    migrateOldScore,
    migrateUsers,
    sortLeaderboardUsers,
    formatPoints,
    MIGRATION_MULTIPLIER,
    type LeaderboardUser,
    type RankName,
    type Division,
} from "@/lib/ranks";
import { AvatarBorder } from "@/components/rank/AvatarBorder";
import { RankShowcaseGrid } from "@/components/rank/RankShowcaseGrid";
import { AllTierPreview } from "@/components/rank/AllTierPreview";
import { LeaderboardUserCard } from "@/components/rank/LeaderboardUserCard";
import { RankProgressBar } from "@/components/rank/RankProgressBar";

export const metadata: Metadata = {
    title: "KWD Road Safety Rank System",
    description:
        "Avatar border & profile badge system — 6 ranks, Roman-numeral divisions, score migration and leaderboard for the KWD road-safety quiz platform.",
};

/* ── Demo data ──────────────────────────────────────────────────────────── */

// Old leaderboard scores → ×10 migration (see spec examples).
const DEMO_OLD_SCORES = [25, 23, 21, 18, 10, 5, 0, 120, 500] as const;

const RAW_USERS: LeaderboardUser[] = [
    { id: "u1", username: "sophea", name: "Sophea", imageUrl: "", oldScore: 500, score: 500, lastActivityAt: "2026-06-18T09:30:00Z", fastestQuizTime: 38 },
    { id: "u2", username: "dara", name: "Dara", imageUrl: "", oldScore: 120, score: 120, lastActivityAt: "2026-06-18T08:10:00Z", fastestQuizTime: 51 },
    { id: "u3", username: "channary", name: "Channary", imageUrl: "", oldScore: 25, score: 25, lastActivityAt: "2026-06-17T19:05:00Z", fastestQuizTime: 44 },
    { id: "u4", username: "rithy", name: "Rithy", imageUrl: "", oldScore: 23, score: 23, lastActivityAt: "2026-06-18T07:45:00Z", fastestQuizTime: 47 },
    { id: "u5", username: "kanya", name: "Kanya", imageUrl: "", oldScore: 21, score: 21, lastActivityAt: "2026-06-16T12:00:00Z", fastestQuizTime: 40 },
    { id: "u6", username: "vichea", name: "Vichea", imageUrl: "", oldScore: 18, score: 18, lastActivityAt: "2026-06-18T06:20:00Z", fastestQuizTime: 55 },
    { id: "u7", username: "mealea", name: "Mealea", imageUrl: "", oldScore: 10, score: 10, lastActivityAt: "2026-06-15T15:30:00Z", fastestQuizTime: 60 },
    { id: "u8", username: "panha", name: "Panha", imageUrl: "", oldScore: 5, score: 5, lastActivityAt: "2026-06-18T05:00:00Z", fastestQuizTime: 62 },
];

const MIGRATED_USERS = migrateUsers(RAW_USERS, MIGRATION_MULTIPLIER);
const LEADERBOARD = sortLeaderboardUsers(MIGRATED_USERS);

// Testing checklist (spec): score → expected rank + division.
const CHECKLIST: { score: number; rank: RankName; division: Division; note?: string }[] = [
    { score: 0, rank: "Rookie", division: "IV" },
    { score: 250, rank: "Rookie", division: "III" },
    { score: 1000, rank: "Rising", division: "IV" },
    { score: 2500, rank: "Gold", division: "IV" },
    { score: 3500, rank: "Platinum", division: "IV" },
    { score: 7000, rank: "Diamond", division: "IV" },
    { score: 12000, rank: "Mythic", division: "IV" },
    { score: 15000, rank: "Mythic", division: "III" },
    { score: 30000, rank: "Mythic", division: "I", note: "open-ended top" },
    { score: 2499, rank: "Rising", division: "I", note: "just before rank up" },
    { score: 11999, rank: "Diamond", division: "I", note: "just before rank up" },
];

/* ── Small layout helpers (brutalist KWD) ───────────────────────────────── */

function Section({ n, title, subtitle, children }: { n: number; title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-10">
            <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-[#eab308] text-base font-black text-black shadow-[3px_3px_0_0_#000]">
                    {n}
                </span>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-wide text-black sm:text-2xl">{title}</h2>
                    {subtitle && <p className="text-sm text-zinc-600">{subtitle}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

function CautionBand() {
    return (
        <div
            className="h-4 w-full border-y-2 border-black"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#eab308 0 16px,#000 16px 32px)" }}
            aria-hidden
        />
    );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function RanksPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            {/* 1 · Title */}
            <header className="border-b-2 border-black bg-white">
                <div className="mx-auto w-full max-w-6xl px-4 py-12 text-center">
                    <div className="mb-3 inline-block border-2 border-black bg-black px-3 py-1 text-xs font-black uppercase tracking-widest text-[#eab308]">
                        Kesararam With Digital
                    </div>
                    <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-black sm:text-5xl">
                        KWD Road Safety<br />Rank System
                    </h1>
                    <p className="mt-3 text-base font-bold uppercase tracking-wider text-zinc-700">
                        Avatar Border &amp; Profile Badge System
                    </p>
                    <p className="font-kh-ui mt-1 text-sm text-zinc-500">
                        ប្រព័ន្ធលំដាប់សុវត្ថិភាពចរាចរណ៍ — រូបតំណាង និងផ្លាកសញ្ញា
                    </p>
                </div>
            </header>
            <CautionBand />

            {/* 2 · All 6 tier preview grid */}
            <Section n={1} title="All 6 Ranks" subtitle="Rookie → Mythic · placeholder avatars show each frame.">
                <RankShowcaseGrid />
            </Section>

            <CautionBand />

            {/* 3 · Division progression */}
            <Section n={2} title="Progression" subtitle="How players climb tiers and Roman-numeral divisions.">
                <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
                    <AllTierPreview />
                </div>
            </Section>

            <CautionBand />

            {/* 4 · Score migration demo */}
            <Section
                n={3}
                title="Score Migration"
                subtitle={`Old leaderboard scores × ${MIGRATION_MULTIPLIER} (migrationMultiplier). Old scores are preserved, never reset.`}
            >
                <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0_0_#000]">
                    <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b-2 border-black bg-black text-[#eab308]">
                                <th className="px-4 py-2 font-black uppercase tracking-wide">Old Score</th>
                                <th className="px-4 py-2 font-black uppercase tracking-wide">New Score</th>
                                <th className="px-4 py-2 font-black uppercase tracking-wide">Rank</th>
                                <th className="px-4 py-2 font-black uppercase tracking-wide">Division</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_OLD_SCORES.map((old) => {
                                const next = migrateOldScore(old);
                                const res = calculateRankAndDivision(next);
                                return (
                                    <tr key={old} className="border-b border-zinc-300 odd:bg-zinc-50">
                                        <td className="px-4 py-2 font-mono font-bold tabular-nums">{old}</td>
                                        <td className="px-4 py-2 font-mono font-black tabular-nums">{formatPoints(next)}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className="inline-block border-2 border-black px-2 py-0.5 text-xs font-black uppercase"
                                                style={{ background: res.rank.primaryColor, color: res.rank.textColor }}
                                            >
                                                {res.rank.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 font-black tabular-nums" style={{ color: res.rank.accentColor }}>
                                            {res.division}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Section>

            <CautionBand />

            {/* 5 · Leaderboard demo */}
            <Section n={4} title="Leaderboard" subtitle="Sorted by score → latest activity → fastest quiz time.">
                <div className="grid gap-3">
                    {LEADERBOARD.map((user, i) => (
                        <LeaderboardUserCard key={user.id} user={user} position={i + 1} />
                    ))}
                </div>
            </Section>

            <CautionBand />

            {/* 6 · Avatar size examples + progress bar */}
            <Section n={5} title="Avatar Sizes" subtitle="sm 64 · md 96 · lg 128 · xl 160 — same player (Diamond II).">
                <div className="flex flex-wrap items-end justify-center gap-8 border-2 border-black bg-white p-8 shadow-[4px_4px_0_0_#000]">
                    {(["sm", "md", "lg", "xl"] as const).map((size) => (
                        <div key={size} className="flex flex-col items-center gap-3">
                            <AvatarBorder src={null} alt="Sample player" username="Sophea" score={9500} size={size} />
                            <span className="text-xs font-black uppercase tracking-wider text-zinc-500">{size}</span>
                        </div>
                    ))}
                </div>
                <div className="mx-auto mt-8 max-w-md border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
                    <RankProgressBar score={9500} />
                </div>
            </Section>

            <CautionBand />

            {/* 7 · Testing checklist (computed live) */}
            <Section n={6} title="Testing Checklist" subtitle="Computed live from src/lib/ranks.ts — green = logic matches the spec.">
                <div className="grid gap-2 sm:grid-cols-2">
                    {CHECKLIST.map(({ score, rank, division, note }) => {
                        const res = calculateRankAndDivision(score);
                        const pass = res.rank.name === rank && res.division === division;
                        return (
                            <div
                                key={`${score}-${rank}`}
                                className="flex items-center gap-3 border-2 border-black bg-white p-3 shadow-[2px_2px_0_0_#000]"
                            >
                                <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black"
                                    style={{ background: pass ? "#22c55e" : "#ef4444", color: "#fff" }}
                                >
                                    {pass ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                                </span>
                                <span className="font-mono text-sm font-bold tabular-nums">{formatPoints(score)} PTS</span>
                                <span className="text-sm font-black uppercase">
                                    → {res.rank.label} {res.division}
                                </span>
                                {note && <span className="ml-auto text-[11px] italic text-zinc-500">{note}</span>}
                            </div>
                        );
                    })}
                </div>
            </Section>

            <CautionBand />

            {/* 8 · Integration notes */}
            <Section n={7} title="Connect Real Users" subtitle="Only `score` is stored; rank & division are always derived.">
                <div className="space-y-4 border-2 border-black bg-white p-5 text-sm shadow-[4px_4px_0_0_#000]">
                    <p className="text-zinc-700">
                        Store only the permanent <code className="bg-zinc-100 px-1 font-mono">score</code> per user
                        (plus optional <code className="bg-zinc-100 px-1 font-mono">oldScore</code>,
                        <code className="bg-zinc-100 px-1 font-mono">migratedScore</code>,
                        <code className="bg-zinc-100 px-1 font-mono">isScoreMigrated</code>,
                        <code className="bg-zinc-100 px-1 font-mono">lastActivityAt</code>,
                        <code className="bg-zinc-100 px-1 font-mono">fastestQuizTime</code>). Never persist rank/division
                        as truth — always recompute from score after every update.
                    </p>
                    <pre className="overflow-x-auto border-2 border-black bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100">{`// 1 · One-time migration (run once, keep a backup of oldScore):
import { migrateUsers } from "@/lib/ranks";
const migrated = migrateUsers(usersFromDb); // newScore = oldScore × 10

// 2 · Award new quiz points to the migrated score (never restart at 0):
user.score = user.score + earnedPoints;

// 3 · Render anywhere from score alone:
<AvatarBorder src={user.imageUrl} alt={user.name} username={user.username} score={user.score} />

// 4 · Leaderboard:
import { sortLeaderboardUsers } from "@/lib/ranks";
const board = sortLeaderboardUsers(users); // score → activity → fastest time`}</pre>
                    <p className="text-zinc-700">
                        This module lives at <code className="bg-zinc-100 px-1 font-mono">src/lib/ranks.ts</code> +
                        <code className="bg-zinc-100 px-1 font-mono">src/components/rank/*</code> and is fully separate
                        from the legacy <code className="bg-zinc-100 px-1 font-mono">src/lib/rank-utils.ts</code> tier
                        system, so the two can coexist during cut-over.
                    </p>
                </div>
            </Section>

            <CautionBand />
            <footer className="mx-auto w-full max-w-6xl px-4 py-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
                KWD · Kesararam With Digital · Road Safety Rank System
            </footer>
        </main>
    );
}
