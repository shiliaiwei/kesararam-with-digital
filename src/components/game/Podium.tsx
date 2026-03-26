"use client";

import { useEffect } from "react";
import { Crown, Medal, Award } from "lucide-react";
import { sounds } from "@/lib/game-sounds";
import type { LeaderboardEntry } from "@/lib/game-event-bus";

interface PodiumProps {
  podium: LeaderboardEntry[];
  finalLeaderboard: LeaderboardEntry[];
  currentUserId?: number;
  lang: "en" | "kh";
  onPlayAgain?: () => void;
}

const PODIUM_CONFIG = [
  { height: "h-28", color: "#ffd700", icon: Crown, label: "1st", labelKm: "ទី១" },
  { height: "h-20", color: "#c0c0c0", icon: Medal, label: "2nd", labelKm: "ទី២" },
  { height: "h-16", color: "#cd7f32", icon: Award, label: "3rd", labelKm: "ទី៣" },
];

const ORDER = [1, 0, 2]; // display order: 2nd, 1st, 3rd

export function Podium({ podium, finalLeaderboard, currentUserId, lang, onPlayAgain }: PodiumProps) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  useEffect(() => {
    sounds.podium();
  }, []);

  const myEntry = finalLeaderboard.find((e) => e.userId === currentUserId);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Title */}
      <div className="text-center">
        <div
          className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3"
          style={khFont}
        >
          {kh ? "ចប់ហ្គេម" : "Game Over"}
        </div>
        <h2 className="text-4xl font-black" style={khFont}>
          {kh ? "ចំណាត់ថ្នាក់" : "Final Results"}
        </h2>
      </div>

      {/* Podium */}
      <div className="flex items-end gap-4 justify-center">
        {ORDER.map((podiumIdx) => {
          const entry = podium[podiumIdx];
          if (!entry) return <div key={podiumIdx} className="w-24" />;
          const cfg = PODIUM_CONFIG[podiumIdx];
          const Icon = cfg.icon;
          const isMe = entry.userId === currentUserId;

          return (
            <div key={entry.userId} className="flex flex-col items-center gap-2">
              {/* Avatar / Name */}
              <div className="text-center">
                <div
                  className="w-12 h-12 border-2 border-black rounded-none flex items-center justify-center font-black text-lg mx-auto mb-1"
                  style={{ backgroundColor: cfg.color }}
                >
                  {entry.displayName.charAt(0).toUpperCase()}
                </div>
                <div
                  className="text-xs font-black max-w-[80px] truncate text-center"
                  style={khFont}
                >
                  {entry.displayName}
                  {isMe && " *"}
                </div>
                <div className="text-xs font-bold text-zinc-500 tabular-nums">
                  {entry.totalScore.toLocaleString()}
                </div>
              </div>

              {/* Podium block */}
              <div
                className={`w-24 ${cfg.height} border-2 border-black flex flex-col items-center justify-center gap-1`}
                style={{ backgroundColor: cfg.color, boxShadow: "4px 4px 0 #000" }}
              >
                <Icon size={20} className="text-black" />
                <span className="text-xs font-black" style={khFont}>
                  {kh ? cfg.labelKm : cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* My result */}
      {myEntry && myEntry.rank && myEntry.rank > 3 && (
        <div
          className="border-2 border-black p-4 bg-yellow-50 text-center"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <div className="text-sm font-bold text-zinc-600" style={khFont}>
            {kh ? "លទ្ធផលរបស់អ្នក" : "Your result"}
          </div>
          <div className="text-2xl font-black">
            #{myEntry.rank} — {myEntry.totalScore.toLocaleString()} pts
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="w-full max-w-md">
        <div className="text-xs font-black uppercase tracking-widest mb-2 text-zinc-500" style={khFont}>
          {kh ? "ចំណាត់ថ្នាក់ទាំងអស់" : "Full Rankings"}
        </div>
        {finalLeaderboard.slice(0, 10).map((entry, i) => (
          <div
            key={entry.userId}
            className="flex items-center gap-3 p-2 border-b border-black/10"
            style={{ backgroundColor: entry.userId === currentUserId ? "#fef9c3" : undefined }}
          >
            <span className="w-6 text-sm font-black text-zinc-400">#{i + 1}</span>
            <span className="flex-1 text-sm font-bold truncate" style={khFont}>
              {entry.displayName}
            </span>
            <span className="text-sm font-black tabular-nums">
              {entry.totalScore.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="px-8 py-4 bg-black text-yellow-400 font-black border-2 border-black text-lg"
          style={{ boxShadow: "4px 4px 0 #ffd700", ...khFont }}
        >
          {kh ? "លេងម្តងទៀត" : "Play Again"}
        </button>
      )}
    </div>
  );
}
