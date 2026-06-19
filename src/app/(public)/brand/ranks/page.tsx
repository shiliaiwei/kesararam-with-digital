"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronsUp,
  Crown,
  Gem,
  Info,
  ShieldCheck,
  TrafficCone,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { CautionTape } from "@/components/brand/brand-kit";
import { RoadAvatarBorder } from "@/components/rank/RoadAvatarBorder";
import { GoldAvatarBorder } from "@/components/rank/GoldAvatarBorder";
import { PlatinumAvatarBorder } from "@/components/rank/PlatinumAvatarBorder";
import { DiamondAvatarBorder } from "@/components/rank/DiamondAvatarBorder";
import { MythicAvatarBorder } from "@/components/rank/MythicAvatarBorder";
import {
  RANK_CONFIGS,
  calculateRankAndDivision,
  formatPoints,
  type Division,
  type RankConfig,
} from "@/lib/ranks";
import { getDivisionBounds, getDivisionProgress, getNextDivision } from "@/lib/road-rank";

type ProfilePreview = {
  rank: number;
  name: string;
  username: string;
  score: number;
  initials: string;
  avatarClass: string;
};

const ICONS: Record<string, LucideIcon> = {
  rookie: TrafficCone,
  rising: ChevronsUp,
  gold: TriangleAlert,
  platinum: Info,
  diamond: Gem,
  mythic: Crown,
};

const TIER_SAMPLE_SCORES: Record<string, number> = {
  rookie: 640,
  rising: 1850,
  gold: 3120,
  platinum: 6100,
  diamond: 9850,
  mythic: 21000,
};

const PROFILE_PREVIEWS: ProfilePreview[] = [
  {
    rank: 1,
    name: "Sophea",
    username: "sophea_safe",
    score: 30520,
    initials: "SP",
    avatarClass: "bg-zinc-950 text-white",
  },
  {
    rank: 2,
    name: "Dara",
    username: "dara_road",
    score: 9850,
    initials: "DR",
    avatarClass: "bg-cyan-500 text-black",
  },
  {
    rank: 3,
    name: "Bopha",
    username: "bopha_signs",
    score: 3120,
    initials: "BS",
    avatarClass: "bg-yellow-500 text-black",
  },
];

const DIVISION_ORDER: Division[] = ["IV", "III", "II", "I"];

function AvatarInitials({
  initials,
  className,
}: {
  initials: string;
  className: string;
}) {
  return (
    <div className={`flex h-full w-full items-center justify-center font-black ${className}`}>
      {initials}
    </div>
  );
}

function TierAvatar({
  score,
  username,
  initials,
  avatarClass,
  size = 96,
}: {
  score: number;
  username: string;
  initials: string;
  avatarClass: string;
  size?: number;
}) {
  const { rank } = calculateRankAndDivision(score);
  const alt = `${username} avatar`;
  const child = <AvatarInitials initials={initials} className={avatarClass} />;

  if (rank.id === "mythic") {
    return (
      <MythicAvatarBorder score={score} username={username} alt={alt} size={size}>
        {child}
      </MythicAvatarBorder>
    );
  }

  if (rank.id === "diamond") {
    return (
      <DiamondAvatarBorder score={score} username={username} alt={alt} size={size}>
        {child}
      </DiamondAvatarBorder>
    );
  }

  if (rank.id === "platinum") {
    return (
      <PlatinumAvatarBorder score={score} username={username} alt={alt} size={size}>
        {child}
      </PlatinumAvatarBorder>
    );
  }

  if (rank.id === "gold") {
    return (
      <GoldAvatarBorder score={score} username={username} alt={alt} size={size}>
        {child}
      </GoldAvatarBorder>
    );
  }

  return (
    <RoadAvatarBorder score={score} username={username} alt={alt} size={size} showRankBadge={size >= 84}>
      {child}
    </RoadAvatarBorder>
  );
}

function TierPill({ score }: { score: number }) {
  const { rank, division } = calculateRankAndDivision(score);
  const Icon = ICONS[rank.id] ?? ShieldCheck;

  return (
    <span
      className="inline-flex max-w-full items-stretch overflow-hidden border-2 border-black bg-white text-black shadow-[2px_2px_0_#000]"
      aria-label={`${rank.name} division ${division}`}
    >
      <span
        className="flex items-center justify-center border-r-2 border-black px-2"
        style={{ backgroundColor: rank.accentColor, color: rank.textColor }}
        aria-hidden="true"
      >
        <Icon size={15} strokeWidth={2.6} />
      </span>
      <span className="flex min-w-0 items-center gap-1.5 px-2.5 py-1">
        <span className="truncate text-[11px] font-black uppercase tracking-wider">{rank.name}</span>
        <span className="font-mono text-[10px] font-black text-zinc-500">{division}</span>
      </span>
    </span>
  );
}

function ScoreBand({ score }: { score: number }) {
  const { lower, upper } = getDivisionBounds(score);
  if (!Number.isFinite(upper)) {
    return <span>{formatPoints(lower)}+ pts</span>;
  }
  const end = formatPoints(upper - 1);
  return (
    <span>
      {formatPoints(lower)}-{end} pts
    </span>
  );
}

function ProfileRow({ profile }: { profile: ProfilePreview }) {
  const { rank, division } = calculateRankAndDivision(profile.score);
  const next = getNextDivision(profile.score);
  const progress = getDivisionProgress(profile.score);

  return (
    <article className="border-3 border-black bg-white shadow-[4px_4px_0_#000]">
      <div className="grid grid-cols-[auto_1fr] gap-4 p-4 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center">
        <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-yellow-500 font-mono text-sm font-black shadow-[2px_2px_0_#000]">
          {profile.rank}
        </div>

        <TierAvatar
          score={profile.score}
          username={profile.username}
          initials={profile.initials}
          avatarClass={profile.avatarClass}
          size={84}
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black uppercase tracking-wide">{profile.name}</h3>
            <TierPill score={profile.score} />
          </div>
          <p className="mt-1 truncate font-mono text-xs font-bold text-zinc-500">@{profile.username}</p>
          <div className="mt-3 h-3 w-full max-w-sm border-2 border-black bg-zinc-100">
            <div className="h-full bg-yellow-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 sm:w-44">
          <div className="border-2 border-black bg-zinc-50 p-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Points</p>
            <p className="font-mono text-sm font-black">{formatPoints(profile.score)}</p>
          </div>
          <div className="border-2 border-black bg-zinc-50 p-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Division</p>
            <p className="font-mono text-sm font-black">{division}</p>
          </div>
          <div className="col-span-2 border-2 border-black bg-black p-2 text-white">
            <p className="text-[9px] font-black uppercase tracking-wider text-yellow-400">Next</p>
            <p className="truncate text-xs font-black uppercase">
              {next.pointsNeeded === 0
                ? "Max division"
                : `${formatPoints(next.pointsNeeded)} pts to ${next.rank} ${next.division}`}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function TierCard({ tier }: { tier: RankConfig }) {
  const score = TIER_SAMPLE_SCORES[tier.id] ?? tier.minPoints;
  const { division } = calculateRankAndDivision(score);
  const Icon = ICONS[tier.id] ?? ShieldCheck;

  return (
    <article className="border-3 border-black bg-white shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]">
      <div className="flex items-center justify-between gap-3 border-b-3 border-black bg-zinc-50 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black"
            style={{ backgroundColor: tier.accentColor, color: tier.textColor }}
          >
            <Icon size={17} strokeWidth={2.7} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black uppercase tracking-wider">{tier.name}</h3>
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-zinc-500">{tier.safetyTheme}</p>
          </div>
        </div>
        <span className="shrink-0 bg-black px-2 py-1 font-mono text-[10px] font-black text-white">
          {tier.minPoints === 0 ? "START" : `${formatPoints(tier.minPoints)} PTS`}
        </span>
      </div>

      <div className="flex justify-center border-b-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-8">
        <TierAvatar
          score={score}
          username={`${tier.id}_preview`}
          initials={tier.name.slice(0, 2).toUpperCase()}
          avatarClass={tier.id === "rookie" || tier.id === "mythic" ? "bg-zinc-950 text-white" : "bg-white text-black"}
          size={94}
        />
      </div>

      <div className="space-y-3 p-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <TierPill score={score} />
          <span className="border-2 border-black bg-yellow-500 px-2 py-1 font-mono font-black shadow-[1px_1px_0_#000]">
            DIV {division}
          </span>
        </div>
        <p className="min-h-10 font-semibold leading-relaxed text-zinc-700">{tier.description}</p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="border-2 border-black bg-zinc-50 p-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Preview score</p>
            <p className="font-mono font-black">{formatPoints(score)}</p>
          </div>
          <div className="border-2 border-black bg-zinc-50 p-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Point band</p>
            <p className="font-mono font-black">
              <ScoreBand score={score} />
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function DivisionStepper({
  selectedScore,
  setSelectedScore,
}: {
  selectedScore: number;
  setSelectedScore: (score: number) => void;
}) {
  const current = calculateRankAndDivision(selectedScore);
  const selectedTier = current.rank;

  const divisionScores = useMemo(() => {
    return DIVISION_ORDER.map((division) => {
      const rank = selectedTier;
      const index = DIVISION_ORDER.indexOf(division);

      if (rank.divisionThresholds) {
        return rank.divisionThresholds[index];
      }

      const nextTier = RANK_CONFIGS[RANK_CONFIGS.findIndex((item) => item.id === rank.id) + 1];
      if (!nextTier) return rank.minPoints;

      const step = (nextTier.minPoints - rank.minPoints) / DIVISION_ORDER.length;
      return Math.floor(rank.minPoints + step * index);
    });
  }, [selectedTier]);

  return (
    <div className="border-3 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
      <h2 className="border-b-2 border-black pb-2 text-sm font-black uppercase tracking-wider">
        Rank Preview Control
      </h2>

      <label className="mt-4 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
        Tier
      </label>
      <select
        value={selectedTier.id}
        onChange={(event) => {
          const tier = RANK_CONFIGS.find((item) => item.id === event.target.value) ?? RANK_CONFIGS[0];
          setSelectedScore(TIER_SAMPLE_SCORES[tier.id] ?? tier.minPoints);
        }}
        className="mt-1 w-full border-2 border-black bg-white p-2 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#000] outline-none"
      >
        {RANK_CONFIGS.map((tier) => (
          <option key={tier.id} value={tier.id}>
            {tier.name}
          </option>
        ))}
      </select>

      <label className="mt-4 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
        Score
      </label>
      <input
        type="number"
        min={0}
        value={selectedScore}
        onChange={(event) => setSelectedScore(Number(event.target.value) || 0)}
        className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm font-black shadow-[2px_2px_0_#000] outline-none"
      />

      <div className="mt-4 grid grid-cols-4 border-2 border-black shadow-[2px_2px_0_#000]">
        {DIVISION_ORDER.map((division, index) => (
          <button
            key={division}
            type="button"
            onClick={() => setSelectedScore(divisionScores[index])}
            className={`py-2 font-mono text-xs font-black ${
              current.division === division ? "bg-yellow-500 text-black" : "bg-white text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            {division}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center border-2 border-dashed border-zinc-300 bg-zinc-50 p-6">
        <TierAvatar
          score={selectedScore}
          username="brand_preview"
          initials="BP"
          avatarClass="bg-zinc-950 text-white"
          size={104}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="border-2 border-black bg-zinc-50 p-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Tier</p>
          <p className="font-black uppercase">{current.rank.name}</p>
        </div>
        <div className="border-2 border-black bg-zinc-50 p-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Division</p>
          <p className="font-mono font-black">{current.division}</p>
        </div>
      </div>
    </div>
  );
}

export default function RanksShowcasePage() {
  const [selectedScore, setSelectedScore] = useState(9850);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 font-system text-black selection:bg-yellow-500 selection:text-black">
      <CautionTape variant="chevron" height={16} />

      <header className="border-b-3 border-black bg-white px-6 py-12 shadow-[0_4px_0_#000]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="border border-black bg-yellow-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-[1px_1px_0_#000]">
                Design System
              </span>
              <span className="bg-black px-2 py-0.5 font-mono text-[10px] font-black tracking-wider text-white">
                Score Derived
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              Rank Highlight Preview
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-600">
              Avatar borders, user names, tier labels, points, and Roman divisions are derived from lifetime score.
            </p>
          </div>

          <Link
            href="/brand"
            className="inline-flex w-fit items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] active:translate-y-0 active:shadow-[1px_1px_0_#000]"
          >
            <ArrowLeft size={16} strokeWidth={2.7} />
            Brand Guidelines
          </Link>
        </div>
      </header>

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 px-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <DivisionStepper selectedScore={selectedScore} setSelectedScore={setSelectedScore} />
        </aside>

        <main className="space-y-10">
          <section>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Leaderboard style</p>
                <h2 className="text-xl font-black uppercase tracking-wide">Profile Rank Highlight</h2>
              </div>
              <TierPill score={selectedScore} />
            </div>

            <div className="space-y-4">
              {PROFILE_PREVIEWS.map((profile) => (
                <ProfileRow key={profile.username} profile={profile} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tier frames</p>
              <h2 className="text-xl font-black uppercase tracking-wide">Avatar Border Divisions</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {RANK_CONFIGS.map((tier) => (
                <TierCard key={tier.id} tier={tier} />
              ))}
            </div>
          </section>

          <section className="border-3 border-black bg-white p-6 shadow-[4px_4px_0_#000]">
            <h2 className="border-b-2 border-black pb-2 text-sm font-black uppercase tracking-wider">
              Division Point Thresholds
            </h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border-2 border-black p-3 font-black uppercase tracking-wider">Rank</th>
                    <th className="border-2 border-black p-3 font-black uppercase tracking-wider">Tier min</th>
                    <th className="border-2 border-black p-3 font-black uppercase tracking-wider">Division</th>
                    <th className="border-2 border-black p-3 font-black uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {RANK_CONFIGS.flatMap((tier) =>
                    DIVISION_ORDER.map((division, index) => {
                      const score =
                        tier.divisionThresholds?.[index] ??
                        (() => {
                          const nextTier = RANK_CONFIGS[RANK_CONFIGS.findIndex((item) => item.id === tier.id) + 1];
                          if (!nextTier) return tier.minPoints;
                          return Math.floor(tier.minPoints + ((nextTier.minPoints - tier.minPoints) / 4) * index);
                        })();
                      return (
                        <tr key={`${tier.id}-${division}`} className={index % 2 === 0 ? "bg-white" : "bg-zinc-50"}>
                          <td className="border-2 border-black p-3 font-black">{index === 0 ? tier.name : ""}</td>
                          <td className="border-2 border-black p-3 font-mono font-black">
                            {index === 0 ? formatPoints(tier.minPoints) : ""}
                          </td>
                          <td className="border-2 border-black p-3 font-mono font-black">{division}</td>
                          <td className="border-2 border-black p-3 font-mono font-black">
                            <ScoreBand score={score} />
                          </td>
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-3 border-black bg-zinc-900 p-6 text-white shadow-[4px_4px_0_#000]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Progression</p>
                <h2 className="text-lg font-black uppercase tracking-wide">Division IV to Division I</h2>
                <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-zinc-300">
                  Players climb four divisions inside each rank before the next avatar border tier unlocks.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {DIVISION_ORDER.map((division, index) => (
                  <React.Fragment key={division}>
                    <span className="flex h-11 w-11 items-center justify-center border-2 border-white bg-yellow-500 font-mono text-sm font-black text-black shadow-[2px_2px_0_#fff]">
                      {division}
                    </span>
                    {index < DIVISION_ORDER.length - 1 && <ArrowRight size={18} strokeWidth={2.7} />}
                  </React.Fragment>
                ))}
                <span className="flex h-11 w-28 items-center justify-center border-2 border-white bg-black px-3 text-xs font-black uppercase shadow-[2px_2px_0_#fff]">
                  Rank Up
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6">
        <div className="relative flex h-20 items-center justify-center overflow-hidden border-3 border-black bg-zinc-900 shadow-[4px_4px_0_#000]">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 border-t-2 border-dashed border-white opacity-40" />
          <div className="absolute left-4 top-2 bottom-2 w-8 rotate-12 border border-black bg-yellow-500">
            <div
              className="h-full w-full"
              style={{ background: "repeating-linear-gradient(45deg, #eab308, #eab308 6px, #000 6px, #000 12px)" }}
            />
          </div>
          <div className="absolute right-4 top-2 bottom-2 w-8 -rotate-12 border border-black bg-yellow-500">
            <div
              className="h-full w-full"
              style={{ background: "repeating-linear-gradient(45deg, #eab308, #eab308 6px, #000 6px, #000 12px)" }}
            />
          </div>

          <div className="z-10 text-center text-white">
            <span className="mb-1 block text-xs font-black uppercase tracking-widest text-yellow-400">
              Kesararam With Digital
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[9px] text-zinc-400">
              <UserRound size={12} strokeWidth={2.5} />
              Rank previews follow real score thresholds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
