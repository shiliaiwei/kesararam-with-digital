"use client";

import { useEffect, useState } from "react";
import { Crown, Medal, Award, Star } from "lucide-react";
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
  { height: "h-28", color: "#ffd700", icon: Crown, label: "1st", labelKm: "ទី១", emoji: "🥇" },
  { height: "h-20", color: "#c0c0c0", icon: Medal, label: "2nd", labelKm: "ទី២", emoji: "🥈" },
  { height: "h-16", color: "#cd7f32", icon: Award, label: "3rd", labelKm: "ទី៣", emoji: "🥉" },
];

const ORDER = [1, 0, 2]; // display: 2nd, 1st, 3rd

/** Confetti particle */
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${1.4 + Math.random() * 1.2}s`,
    color: ["#ffd700", "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316"][i % 6],
    size: `${6 + Math.random() * 8}px`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <div key={p.id} className="absolute top-0 rounded-sm"
          style={{
            left: p.left, width: p.size, height: p.size,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function Podium({ podium, finalLeaderboard, currentUserId, lang, onPlayAgain }: PodiumProps) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealedIdx, setRevealedIdx] = useState<number[]>([]);

  const myEntry = finalLeaderboard.find((e) => e.userId === currentUserId);
  const myRank = myEntry?.rank ?? null;

  useEffect(() => {
    // Staggered reveal: 3rd → 2nd → 1st with rank-specific sounds
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 3rd place reveal
    timers.push(setTimeout(() => {
      setRevealedIdx([2]);
      if (podium[2]) sounds.rank3();
    }, 600));

    // 2nd place reveal
    timers.push(setTimeout(() => {
      setRevealedIdx([2, 1]);
      if (podium[1]) sounds.rank2();
    }, 1800));

    // 1st place reveal + confetti
    timers.push(setTimeout(() => {
      setRevealedIdx([2, 1, 0]);
      if (podium[0]) {
        sounds.rank1();
        setShowConfetti(true);
      }
    }, 3200));

    // Play personal rank sound after podium
    timers.push(setTimeout(() => {
      if (myRank === 1) sounds.rank1();
      else if (myRank === 2) sounds.rank2();
      else if (myRank === 3) sounds.rank3();
      else if (myRank && myRank <= 10) sounds.result_good();
      else sounds.cheer();
    }, 4800));

    // Hide confetti after 4s
    timers.push(setTimeout(() => setShowConfetti(false), 7000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-8 relative">
      {showConfetti && <Confetti />}

      {/* Title */}
      <div className="text-center">
        <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
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
          const cfg = PODIUM_CONFIG[podiumIdx];
          const Icon = cfg.icon;
          const isMe = entry?.userId === currentUserId;
          const isRevealed = revealedIdx.includes(podiumIdx);

          return (
            <div key={podiumIdx}
              className="flex flex-col items-center gap-2 transition-all duration-700"
              style={{ opacity: isRevealed ? 1 : 0, transform: isRevealed ? "translateY(0) scale(1)" : "translateY(24px) scale(0.85)" }}>
              {entry ? (
                <>
                  {/* Avatar */}
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-14 h-14 border-2 border-black flex items-center justify-center font-black text-xl mx-auto mb-1"
                        style={{ backgroundColor: cfg.color, boxShadow: isMe ? `0 0 16px ${cfg.color}` : undefined }}>
                        {entry.displayName.charAt(0).toUpperCase()}
                      </div>
                      {isMe && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border border-black flex items-center justify-center">
                          <Star size={10} className="text-black" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-black max-w-[80px] truncate text-center" style={khFont}>
                      {entry.displayName}{isMe ? " ★" : ""}
                    </div>
                    <div className="text-xs font-bold text-zinc-500 tabular-nums">
                      {entry.totalScore.toLocaleString()}
                    </div>
                    <div className="text-lg">{cfg.emoji}</div>
                  </div>
                  {/* Block */}
                  <div className={`w-24 ${cfg.height} border-2 border-black flex flex-col items-center justify-center gap-1`}
                    style={{ backgroundColor: cfg.color, boxShadow: "4px 4px 0 #000" }}>
                    <Icon size={20} className="text-black" />
                    <span className="text-xs font-black" style={khFont}>{kh ? cfg.labelKm : cfg.label}</span>
                  </div>
                </>
              ) : (
                <div className="w-24" />
              )}
            </div>
          );
        })}
      </div>

      {/* My result (if not top 3) */}
      {myEntry && myRank && myRank > 3 && (
        <div className="border-2 border-black p-4 bg-yellow-50 text-center" style={{ boxShadow: "3px 3px 0 #000" }}>
          <div className="text-sm font-bold text-zinc-600" style={khFont}>
            {kh ? "លទ្ធផលរបស់អ្នក" : "Your result"}
          </div>
          <div className="text-2xl font-black">
            #{myRank} — {myEntry.totalScore.toLocaleString()} pts
          </div>
          {myRank <= 10 && (
            <div className="text-xs font-bold text-green-600 mt-1" style={khFont}>
              {kh ? "ល្អណាស់! អ្នកស្ថិតក្នុង Top 10!" : "Great job! You're in the Top 10!"}
            </div>
          )}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="w-full max-w-md">
        <div className="text-xs font-black uppercase tracking-widest mb-2 text-zinc-500" style={khFont}>
          {kh ? "ចំណាត់ថ្នាក់ទាំងអស់" : "Full Rankings"}
        </div>
        {finalLeaderboard.slice(0, 10).map((entry, i) => (
          <div key={entry.userId}
            className="flex items-center gap-3 p-2 border-b border-black/10"
            style={{ backgroundColor: entry.userId === currentUserId ? "#fef9c3" : undefined }}>
            <span className="w-6 text-sm font-black text-zinc-400">#{i + 1}</span>
            <span className="flex-1 text-sm font-bold truncate" style={khFont}>{entry.displayName}</span>
            <span className="text-sm font-black tabular-nums">{entry.totalScore.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {onPlayAgain && (
        <button onClick={onPlayAgain}
          className="px-8 py-4 bg-black text-yellow-400 font-black border-2 border-black text-lg"
          style={{ boxShadow: "4px 4px 0 #ffd700", ...khFont }}>
          {kh ? "លេងម្តងទៀត" : "Play Again"}
        </button>
      )}
    </div>
  );
}

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
