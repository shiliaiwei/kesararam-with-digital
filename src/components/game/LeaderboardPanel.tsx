"use client";

import { TrendingUp, TrendingDown, Minus, Crown } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/game-event-bus";
import { useEffect, useState } from "react";

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
  lang: "en" | "kh";
}

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];

export function LeaderboardPanel({ entries, currentUserId, lang }: LeaderboardPanelProps) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};
  const [animatingRanks, setAnimatingRanks] = useState<Set<number>>(new Set());

  // Trigger animation when rank changes
  useEffect(() => {
    const changedRanks = new Set(
      entries.filter(e => e.rankChange !== 0).map(e => e.userId)
    );
    setAnimatingRanks(changedRanks);
    
    const timer = setTimeout(() => {
      setAnimatingRanks(new Set());
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [entries]);

  return (
    <div className="flex flex-col gap-2">
      {entries.slice(0, 10).map((entry, i) => {
        const isMe = entry.userId === currentUserId;
        const rankColor = RANK_COLORS[i] ?? "#e5e7eb";
        const isTop3 = i < 3;
        const isAnimating = animatingRanks.has(entry.userId);

        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-3 p-3 border-2 border-black rounded-none transition-all duration-500 ${
              isAnimating ? 'animate-rank-change' : ''
            }`}
            style={{
              backgroundColor: isMe ? "#ffd700" : isTop3 ? "#fff" : "#f9fafb",
              boxShadow: isMe ? "3px 3px 0 #000" : "2px 2px 0 #000",
              transform: isMe ? "translate(-1px,-1px)" : undefined,
            }}
          >
            {/* Rank */}
            <div
              className="w-8 h-8 flex items-center justify-center border-2 border-black rounded-none font-black text-sm flex-shrink-0"
              style={{ backgroundColor: isTop3 ? rankColor : "#e5e7eb" }}
            >
              {isTop3 ? <Crown size={14} /> : entry.rank}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div
                className="font-black text-sm truncate"
                style={khFont}
              >
                {entry.displayName}
                {isMe && (
                  <span className="ml-1 text-xs font-bold text-black/60">
                    {kh ? "(អ្នក)" : "(you)"}
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500" style={khFont}>
                {entry.correctAnswers} {kh ? "ត្រូវ" : "correct"}
                {entry.currentStreak > 1 && (
                  <span className="ml-2 text-orange-500 font-bold">
                    x{entry.currentStreak}
                  </span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <div className="font-black text-lg tabular-nums">
                {entry.totalScore.toLocaleString()}
              </div>
              <div className={`flex items-center justify-end gap-0.5 text-xs ${
                isAnimating ? 'animate-bounce' : ''
              }`}>
                {entry.rankChange > 0 ? (
                  <TrendingUp size={12} className="text-green-600 animate-pulse" />
                ) : entry.rankChange < 0 ? (
                  <TrendingDown size={12} className="text-red-500 animate-pulse" />
                ) : (
                  <Minus size={10} className="text-zinc-400" />
                )}
                <span
                  className={`font-bold ${
                    entry.rankChange > 0
                      ? "text-green-600"
                      : entry.rankChange < 0
                      ? "text-red-500"
                      : "text-zinc-400"
                  }`}
                >
                  {entry.rankChange !== 0
                    ? `${entry.rankChange > 0 ? "+" : ""}${entry.rankChange}`
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes rank-change {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-rank-change {
          animation: rank-change 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
