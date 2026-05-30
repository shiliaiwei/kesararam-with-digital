"use client";

import { useEffect, useState } from "react";
import { Crown, Medal, Award, Star, TrendingUp, TrendingDown, Minus, Flame, Share2, Loader2 } from "lucide-react";
import { sounds } from "@/lib/game-sounds";
import type { LeaderboardEntry } from "@/lib/game-event-bus";

interface PodiumProps {
  podium: LeaderboardEntry[];
  finalLeaderboard: LeaderboardEntry[];
  currentUserId?: number;
  lang: "en" | "kh";
  onPlayAgain?: () => void;
  sessionCode?: string;
  totalQuestions?: number;
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
        <div key={p.id} className="absolute top-0 rounded-none border border-black"
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

export function Podium({ podium, finalLeaderboard, currentUserId, lang, onPlayAgain, sessionCode, totalQuestions }: PodiumProps) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealedIdx, setRevealedIdx] = useState<number[]>([]);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

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

    // Hide confetti after 7s
    timers.push(setTimeout(() => setShowConfetti(false), 7000));

    return () => timers.forEach(clearTimeout);
  }, [podium, myRank]);

  const handleDownloadShareCard = async () => {
    if (!myEntry || !myRank) return;
    setIsGeneratingCard(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2d context");

      // 1. Draw premium background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 500);
      bgGrad.addColorStop(0, "#09090b"); // Zinc-950
      bgGrad.addColorStop(0.5, "#18181b"); // Zinc-900
      bgGrad.addColorStop(1, "#020617"); // Slate-950
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 500);

      // Decorative dots
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      for (let x = 20; x < 800; x += 40) {
        for (let y = 20; y < 500; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw premium neon amber borders
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 6;
      ctx.strokeRect(15, 15, 770, 470);

      // Gold corners
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 10;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(10, 50); ctx.lineTo(10, 10); ctx.lineTo(50, 10); ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(750, 10); ctx.lineTo(790, 10); ctx.lineTo(790, 50); ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(10, 450); ctx.lineTo(10, 490); ctx.lineTo(50, 490); ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(790, 450); ctx.lineTo(790, 490); ctx.lineTo(750, 490); ctx.stroke();

      // Brand Title
      ctx.fillStyle = "#eab308";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("KESARARAM LIVE", 400, 60);

      // Divider line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 80);
      ctx.lineTo(700, 80);
      ctx.stroke();

      // Player Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px 'Siemreap', system-ui, -apple-system, sans-serif";
      ctx.fillText(myEntry.displayName, 400, 140);

      // Badge/Emblem background box
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(150, 180, 500, 220, 16);
      } else {
        ctx.rect(150, 180, 500, 220);
      }
      ctx.fill();
      ctx.stroke();

      // Rank Emblem
      const isRank1 = myRank === 1;
      const isRank2 = myRank === 2;
      const isRank3 = myRank === 3;
      let badgeColor = "#94a3b8"; // Silver-ish
      if (isRank1) badgeColor = "#fbbf24";
      else if (isRank2) badgeColor = "#cbd5e1";
      else if (isRank3) badgeColor = "#b45309";

      ctx.fillStyle = badgeColor;
      ctx.font = "bold 84px system-ui, -apple-system, sans-serif";
      ctx.fillText(`#${myRank}`, 400, 270);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Siemreap', system-ui, -apple-system, sans-serif";
      ctx.fillText(kh ? "ចំណាត់ថ្នាក់ចុងក្រោយ" : "FINAL RANK", 400, 305);

      // Score
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
      ctx.fillText(`${myEntry.totalScore.toLocaleString()} PTS`, 400, 365);

      // Bottom Stats
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 16px 'Siemreap', system-ui, -apple-system, sans-serif";
      
      const streakText = kh
        ? `🔥 ជាប់គ្នា: ${myEntry.currentStreak} ដង`
        : `🔥 Streak: ${myEntry.currentStreak} answers`;
      
      const correctText = kh
        ? `✓ ត្រឹមត្រូវ: ${myEntry.correctAnswers}${totalQuestions ? ` / ${totalQuestions}` : ""}`
        : `✓ Correct: ${myEntry.correctAnswers}${totalQuestions ? ` / ${totalQuestions}` : ""}`;

      ctx.fillText(`${correctText}   |   ${streakText}`, 400, 440);

      // Room code
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        kh ? `បន្ទប់ហ្គេម: ${sessionCode || ""}` : `Room Code: ${sessionCode || ""}`,
        400,
        475
      );

      // Convert and download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `kesararam_score_${myEntry.displayName.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate share card:", err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8 relative">
      {showConfetti && <Confetti />}

      {/* Title */}
      <div className="text-center animate-fade-in">
        <div className="inline-block bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
          {kh ? "ចប់ហ្គេម" : "Game Over"}
        </div>
        <h2 className="text-4xl font-black text-white" style={khFont}>
          {kh ? "លទ្ធផលចុងក្រោយ" : "Final Results"}
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
                  {/* Avatar + name above block */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      {/* Avatar with colored border */}
                      <div
                        className="w-14 h-14 flex items-center justify-center font-black text-xl mx-auto"
                        style={{
                          backgroundColor: cfg.color,
                          border: `3px solid ${cfg.color}`,
                          boxShadow: `0 0 0 3px #000, 0 0 14px ${cfg.color}`,
                          borderRadius: "50%",
                        }}>
                        <span className="text-black">{entry.displayName.charAt(0).toUpperCase()}</span>
                      </div>
                      {isMe && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border border-black rounded-full flex items-center justify-center">
                          <Star size={10} className="text-black" />
                        </div>
                      )}
                    </div>
                    {/* Name always white */}
                    <div className="text-xs font-black max-w-[80px] truncate text-center text-white" style={khFont}>
                      {entry.displayName}{isMe ? " ★" : ""}
                    </div>
                    {/* Score always white */}
                    <div className="text-xs font-bold text-white/80 tabular-nums">
                      {entry.totalScore.toLocaleString()}
                    </div>
                    <div className="text-lg">{cfg.emoji}</div>
                  </div>
                  {/* Block */}
                  <div className={`w-24 ${cfg.height} border-2 border-black flex flex-col items-center justify-center gap-1`}
                    style={{ backgroundColor: cfg.color, boxShadow: "4px 4px 0 #000" }}>
                    <Icon size={20} className="text-black" />
                    <span className="text-xs font-black text-black" style={khFont}>{kh ? cfg.labelKm : cfg.label}</span>
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
        <div className="border-2 border-yellow-400 p-4 bg-white/5 text-center rounded-xl animate-fade-in" style={{ boxShadow: "3px 3px 0 #ffd700" }}>
          <div className="text-sm font-bold text-white/70" style={khFont}>
            {kh ? "លទ្ធផលរបស់អ្នក" : "Your result"}
          </div>
          <div className="text-2xl font-black text-white">
            #{myRank} — {myEntry.totalScore.toLocaleString()} pts
          </div>
          {myRank <= 10 && (
            <div className="text-xs font-bold text-green-400 mt-1" style={khFont}>
              {kh ? "ល្អណាស់! អ្នកស្ថិតក្នុង Top 10!" : "Great job! You're in the Top 10!"}
            </div>
          )}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-xs font-black uppercase tracking-widest mb-3 text-white/60" style={khFont}>
          {kh ? "ចំណាត់ថ្នាក់ទាំងអស់" : "Full Rankings"}
        </div>
        <div className="flex flex-col gap-2.5">
          {finalLeaderboard.slice(0, 10).map((entry, i) => {
            const isMe = entry.userId === currentUserId;
            
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  isMe
                    ? "bg-yellow-400/10 border-yellow-400/40 shadow-[0_0_12px_rgba(250,204,21,0.1)]"
                    : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700/80"
                }`}
              >
                {/* Rank Number */}
                <span className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-lg ${
                  i === 0 ? "bg-yellow-400 text-black" :
                  i === 1 ? "bg-zinc-300 text-black" :
                  i === 2 ? "bg-amber-600 text-white" :
                  "bg-zinc-800 text-zinc-400"
                }`}>
                  #{i + 1}
                </span>

                {/* Name & Subtitles */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black truncate ${isMe ? "text-yellow-400" : "text-white"}`} style={khFont}>
                      {entry.displayName}
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-yellow-400 text-black rounded">
                        {kh ? "អ្នក" : "YOU"}
                      </span>
                    )}
                  </div>
                  
                  {/* Detailed Mini Stats in Row */}
                  <div className="flex items-center gap-2.5 text-xs mt-0.5 text-zinc-500 font-bold" style={khFont}>
                    <span className="flex items-center gap-0.5">
                      <span className="text-green-500 font-black">✓</span> {entry.correctAnswers} {kh ? "ត្រូវ" : "correct"}
                    </span>
                    {entry.currentStreak > 1 && (
                      <span className="flex items-center gap-0.5 text-orange-500">
                        <Flame size={12} className="fill-orange-500 text-orange-500 animate-pulse" />
                        x{entry.currentStreak}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score & Rank Change */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-black tabular-nums block ${isMe ? "text-yellow-400" : "text-white"}`}>
                    {entry.totalScore.toLocaleString()}
                  </span>
                  
                  {/* Rank Change Indicator */}
                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                    {entry.rankChange > 0 ? (
                      <>
                        <TrendingUp size={11} className="text-green-500" />
                        <span className="text-[10px] font-black text-green-500">+{entry.rankChange}</span>
                      </>
                    ) : entry.rankChange < 0 ? (
                      <>
                        <TrendingDown size={11} className="text-red-500" />
                        <span className="text-[10px] font-black text-red-500">{entry.rankChange}</span>
                      </>
                    ) : (
                      <>
                        <Minus size={10} className="text-zinc-600" />
                        <span className="text-[10px] font-bold text-zinc-600">—</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-md justify-center">
        {myEntry && (
          <button
            onClick={handleDownloadShareCard}
            disabled={isGeneratingCard}
            className="flex-1 px-6 py-3.5 bg-yellow-400 text-black font-black border-2 border-black flex items-center justify-center gap-2 hover:bg-yellow-300 active:translate-y-0.5 active:shadow-[1px_1px_0_#000] disabled:opacity-50 transition-all text-base"
            style={{ boxShadow: "3px 3px 0 #000", ...khFont }}
          >
            {isGeneratingCard ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Share2 size={16} />
            )}
            {isGeneratingCard
              ? (kh ? "កំពុងបង្កើតកាត..." : "Generating Card...")
              : (kh ? "រក្សាទុកកាតលទ្ធផល" : "Save Result Card")}
          </button>
        )}

        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="flex-1 px-6 py-3.5 bg-black text-yellow-400 font-black border-2 border-black flex items-center justify-center hover:bg-zinc-900 active:translate-y-0.5 active:shadow-[1px_1px_0_#ffd700] transition-all text-base"
            style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}
          >
            {kh ? "លេងម្តងទៀត" : "Play Again"}
          </button>
        )}
      </div>
    </div>
  );
}

