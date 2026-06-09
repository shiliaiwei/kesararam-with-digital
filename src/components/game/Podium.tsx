"use client";

import { useEffect, useState } from "react";
import { Crown, Medal, Award, Star, TrendingUp, TrendingDown, Minus, Flame, Share2, Loader2, Trophy } from "lucide-react";
import { sounds } from "@/lib/game-sounds";
import type { LeaderboardEntry } from "@/lib/game-event-bus";
import { RankBadge as TierBadge } from "@/components/shared/rank-label";
import { getAvatarFaceStyle } from "@/lib/utils";

interface PodiumProps {
  podium: LeaderboardEntry[];
  finalLeaderboard: LeaderboardEntry[];
  currentUserId?: number;
  lang: "en" | "kh";
  onPlayAgain?: () => void;
  sessionCode?: string;
  totalQuestions?: number;
  currentUserPoints?: number;
}

const PODIUM_CONFIG = [
  { height: "h-40", color: "#ffd700", icon: Crown, label: "1st", labelKm: "ទី១", glow: "rgba(255, 215, 0, 0.3)" },
  { height: "h-28", color: "#c0c0c0", icon: Medal, label: "2nd", labelKm: "ទី២", glow: "rgba(192, 192, 192, 0.3)" },
  { height: "h-24", color: "#cd7f32", icon: Award, label: "3rd", labelKm: "ទី៣", glow: "rgba(205, 127, 50, 0.3)" },
];

const ORDER = [1, 0, 2]; // display: 2nd, 1st, 3rd

/** Brutalist Confetti */
function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${1.8 + Math.random() * 1.5}s`,
    color: ["#ffd700", "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#f97316"][i % 6],
    size: `${8 + Math.random() * 12}px`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <div key={p.id} className="absolute top-0 border-2 border-black"
          style={{
            left: p.left, width: p.size, height: p.size,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
            borderRadius: "0px",
          }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/** Avatar Component */
interface NeubrutalistAvatarProps {
  src: string | null | undefined;
  initials: string;
  userId: number;
  size?: "sm" | "md" | "lg";
}

function NeubrutalistAvatar({ src, initials, userId, size = "md" }: NeubrutalistAvatarProps) {
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl"
  };

  // Avatars are stored as JSON { face, head } (composite SVG layers). Parse and
  // render the layered avatar; fall back to a plain image URL, then initials.
  const parsed = (() => {
    if (!src) return null;
    try {
      const o = JSON.parse(src) as { face?: string; head?: string };
      if (o && (o.face || o.head)) return o;
    } catch { /* not JSON — treat as URL */ }
    return null;
  })();

  if (parsed) {
    return (
      <div className={`${sizeClasses[size]} border-4 border-black overflow-hidden relative`} style={{ borderRadius: "0px", background: "#FFD700" }}>
        {parsed.head && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/avatar/head/${encodeURIComponent(parsed.head)}`} alt="" aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
        )}
        {parsed.face && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/avatar/face/${encodeURIComponent(parsed.face)}`} alt="" aria-hidden
            style={getAvatarFaceStyle(parsed.head)} />
        )}
      </div>
    );
  }

  if (!src || failed) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center text-white font-black border-4 border-black`}
        style={{
          background: `linear-gradient(135deg, hsl(${(userId * 61) % 360}, 70%, 45%) 0%, hsl(${(userId * 61 + 45) % 360}, 70%, 35%) 100%)`,
          borderRadius: "0px",
        }}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} border-4 border-black overflow-hidden bg-white`} style={{ borderRadius: "0px" }}>
      <img
        src={src}
        alt={initials}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function Podium({ podium, finalLeaderboard, currentUserId, lang, onPlayAgain, sessionCode, totalQuestions, currentUserPoints }: PodiumProps) {
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

    // Hide confetti after 8s
    timers.push(setTimeout(() => setShowConfetti(false), 8000));

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

      // Background - KWD Brand Black
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 800, 500);

      // Yellow border - KWD Brand
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 8;
      ctx.strokeRect(15, 15, 770, 470);

      // Inner black border
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, 760, 460);

      // Yellow caution stripe pattern at top
      const stripeHeight = 40;
      for (let x = 0; x < 800; x += 40) {
        ctx.fillStyle = x % 80 === 0 ? "#eab308" : "#000000";
        ctx.fillRect(x, 20, 40, stripeHeight);
      }

      // Brand Title
      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("KESARARAM LIVE GAME", 400, 48);

      // Player Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px 'Siemreap', system-ui, -apple-system, sans-serif";
      ctx.fillText(myEntry.displayName, 400, 130);

      // Rank Badge Container - Brutalist
      ctx.fillStyle = "#eab308";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      const badgeX = 250, badgeY = 160, badgeW = 300, badgeH = 140;
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

      // Hard shadow
      ctx.fillStyle = "#000000";
      ctx.fillRect(badgeX + 6, badgeY + 6, badgeW, badgeH);
      ctx.fillStyle = "#eab308";
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

      // Rank Number
      const isRank1 = myRank === 1;
      const isRank2 = myRank === 2;
      const isRank3 = myRank === 3;
      let badgeColor = "#000000";
      if (isRank1) badgeColor = "#ffd700";
      else if (isRank2) badgeColor = "#c0c0c0";
      else if (isRank3) badgeColor = "#cd7f32";

      ctx.fillStyle = badgeColor;
      ctx.font = "bold 72px system-ui, -apple-system, sans-serif";
      ctx.fillText(`#${myRank}`, 400, 245);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 18px 'Siemreap', system-ui, -apple-system, sans-serif";
      ctx.fillText(kh ? "ចំណាត់ថ្នាក់ចុងក្រោយ" : "FINAL RANK", 400, 280);

      // Score Box
      ctx.fillStyle = "#000000";
      ctx.fillRect(200, 320, 400, 70);
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;
      ctx.strokeRect(200, 320, 400, 70);

      ctx.fillStyle = "#eab308";
      ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
      ctx.fillText(`${myEntry.totalScore.toLocaleString()} PTS`, 400, 365);

      // Stats Row
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px 'Siemreap', system-ui, -apple-system, sans-serif";

      const streakText = kh
        ? `🔥 ជាប់គ្នា: ${myEntry.currentStreak}`
        : `🔥 Streak: ${myEntry.currentStreak}`;

      const correctText = kh
        ? `✓ ត្រឹមត្រូវ: ${myEntry.correctAnswers}${totalQuestions ? ` / ${totalQuestions}` : ""}`
        : `✓ Correct: ${myEntry.correctAnswers}${totalQuestions ? ` / ${totalQuestions}` : ""}`;

      ctx.fillText(`${correctText}   |   ${streakText}`, 400, 430);

      // Room code
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        kh ? `លេខកូដបន្ទប់: ${sessionCode || ""}` : `Room Code: ${sessionCode || ""}`,
        400,
        465
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

      {/* Title - KWD Brand Style */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-4 py-2 border-4 border-black shadow-[4px_4px_0_#000] mb-4" style={{ borderRadius: "0px", ...khFont }}>
          <Trophy size={16} />
          {kh ? "ចប់ហ្គេម" : "Game Over"}
        </div>
        <h2 className="text-5xl font-black text-white mb-2" style={khFont}>
          {kh ? "លទ្ធផលចុងក្រោយ" : "Final Results"}
        </h2>
        <p className="text-zinc-400 font-bold text-sm" style={khFont}>
          {finalLeaderboard.length} {kh ? "អ្នកចូលរួម" : "participants"}
        </p>
      </div>

      {/* Podium - Brutalist Style */}
      <div className="flex items-end gap-6 justify-center mb-4">
        {ORDER.map((podiumIdx) => {
          const entry = podium[podiumIdx];
          const cfg = PODIUM_CONFIG[podiumIdx];
          const Icon = cfg.icon;
          const isMe = entry?.userId === currentUserId;
          const isRevealed = revealedIdx.includes(podiumIdx);
          const initials = entry?.displayName.slice(0, 2).toUpperCase() || "?";

          return (
            <div key={podiumIdx}
              className="flex flex-col items-center gap-3 transition-all duration-700"
              style={{
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? "translateY(0) scale(1)" : "translateY(40px) scale(0.8)"
              }}>
              {entry ? (
                <>
                  {/* Avatar + Icon Crown */}
                  <div className="relative mb-2" style={{
                    animation: isRevealed && podiumIdx === 0 ? "bounce 0.6s ease-in-out" : "none"
                  }}>
                    <NeubrutalistAvatar
                      src={entry.avatar}
                      initials={initials}
                      userId={entry.userId}
                      size="lg"
                    />
                    {/* Floating icon badge */}
                    <div
                      className="absolute -top-3 -right-3 w-10 h-10 border-3 border-black flex items-center justify-center shadow-[3px_3px_0_#000]"
                      style={{
                        backgroundColor: cfg.color,
                        borderRadius: "0px",
                        borderWidth: "3px"
                      }}>
                      <Icon size={20} className="text-black" />
                    </div>
                    {/* "You" indicator */}
                    {isMe && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px" }}>
                        <Star size={10} className="text-black inline" />
                      </div>
                    )}
                  </div>

                  {/* Name - Better visibility */}
                  <div className="text-sm font-black max-w-[100px] truncate text-center text-white px-2 py-1 bg-black/40 border-2 border-white/20" style={{ borderRadius: "0px", ...khFont }}>
                    {entry.displayName}
                  </div>

                  {/* Score */}
                  <div className="text-base font-black text-white bg-black/60 px-3 py-1 border-2 border-white/30 tabular-nums" style={{ borderRadius: "0px" }}>
                    {entry.totalScore.toLocaleString()}
                  </div>

                  {/* Podium Block - Brutalist */}
                  <div
                    className={`w-28 ${cfg.height} border-4 border-black flex flex-col items-center justify-center gap-1`}
                    style={{
                      backgroundColor: cfg.color,
                      boxShadow: "6px 6px 0 #000",
                      borderRadius: "0px"
                    }}>
                    <span className="text-2xl font-black text-black" style={khFont}>
                      {kh ? cfg.labelKm : cfg.label}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-28" />
              )}
            </div>
          );
        })}
      </div>

      {/* My result (if not top 3) - Brutalist Card */}
      {myEntry && myRank && myRank > 3 && (
        <div className="border-4 border-yellow-400 p-5 bg-black text-center shadow-[6px_6px_0_#eab308] animate-fade-in max-w-md" style={{ borderRadius: "0px" }}>
          <div className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2" style={khFont}>
            {kh ? "លទ្ធផលរបស់អ្នក" : "Your Result"}
          </div>
          <div className="text-3xl font-black text-white mb-1">
            #{myRank}
          </div>
          <div className="text-xl font-black text-yellow-400 mb-2">
            {myEntry.totalScore.toLocaleString()} {kh ? "ពិន្ទុ" : "pts"}
          </div>
          {myRank <= 10 && (
            <div className="inline-block text-xs font-black bg-green-400 text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000]" style={{ borderRadius: "0px", ...khFont }}>
              {kh ? "ល្អណាស់! TOP 10" : "Great! TOP 10"}
            </div>
          )}
        </div>
      )}

      {/* Full leaderboard - Brutalist Cards */}
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-xs font-black uppercase tracking-widest mb-4 text-yellow-400 flex items-center gap-2" style={khFont}>
          <div className="h-1 w-8 bg-yellow-400" />
          {kh ? "ចំណាត់ថ្នាក់ទាំងអស់" : "Full Rankings"}
          <div className="h-1 flex-1 bg-yellow-400/20" />
        </div>

        <div className="flex flex-col gap-3">
          {finalLeaderboard.slice(0, 10).map((entry, i) => {
            const isMe = entry.userId === currentUserId;
            const initials = entry.displayName.slice(0, 2).toUpperCase();
            const isTop3 = i < 3;

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 border-4 transition-all duration-300 ${isMe
                  ? "bg-yellow-400 border-black shadow-[5px_5px_0_#000]"
                  : isTop3
                    ? "bg-white border-black shadow-[4px_4px_0_#000]"
                    : "bg-zinc-900 border-zinc-700 shadow-[3px_3px_0_#000]"
                  } hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]`}
                style={{ borderRadius: "0px" }}
              >
                {/* Rank Badge */}
                <div className={`w-12 h-12 flex items-center justify-center font-black text-xl border-3 shrink-0 ${i === 0 ? "bg-yellow-400 text-black border-black" :
                  i === 1 ? "bg-zinc-300 text-black border-black" :
                    i === 2 ? "bg-amber-600 text-white border-black" :
                      isMe ? "bg-black text-yellow-400 border-yellow-400" :
                        "bg-zinc-800 text-zinc-400 border-zinc-600"
                  }`} style={{ borderRadius: "0px", borderWidth: "3px" }}>
                  #{i + 1}
                </div>

                {/* Avatar */}
                <NeubrutalistAvatar
                  src={entry.avatar}
                  initials={initials}
                  userId={entry.userId}
                  size="sm"
                />

                {/* Name & Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-base font-black truncate ${isMe ? "text-black" : isTop3 ? "text-black" : "text-white"}`} style={khFont}>
                      {entry.displayName}
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-black text-yellow-400 border-2 border-black" style={{ borderRadius: "0px" }}>
                        {kh ? "អ្នក" : "YOU"}
                      </span>
                    )}
                    {currentUserPoints !== undefined && currentUserPoints > 0 && isMe && (
                      <TierBadge lifetimePoints={currentUserPoints} size="xs" lang={lang} />
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold" style={khFont}>
                    <span className={`flex items-center gap-1 ${isMe ? "text-black" : isTop3 ? "text-green-600" : "text-green-400"}`}>
                      <span className="font-black">✓</span> {entry.correctAnswers}
                    </span>
                    {entry.currentStreak > 1 && (
                      <span className={`flex items-center gap-1 ${isMe ? "text-orange-600" : "text-orange-400"}`}>
                        <Flame size={12} className="fill-current" />
                        ×{entry.currentStreak}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score & Change */}
                <div className="text-right shrink-0">
                  <div className={`text-lg font-black tabular-nums ${isMe ? "text-black" : isTop3 ? "text-black" : "text-white"}`}>
                    {entry.totalScore.toLocaleString()}
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-0.5">
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
                        <Minus size={10} className="text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-500">—</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons - Brutalist Style */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-2xl justify-center">
        {myEntry && (
          <button
            onClick={handleDownloadShareCard}
            disabled={isGeneratingCard}
            className="flex-1 px-6 py-4 bg-yellow-400 text-black font-black border-4 border-black flex items-center justify-center gap-2 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_#000] disabled:opacity-50 transition-all text-base"
            style={{ boxShadow: "5px 5px 0 #000", borderRadius: "0px", ...khFont }}
          >
            {isGeneratingCard ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Share2 size={18} />
            )}
            {isGeneratingCard
              ? (kh ? "កំពុងបង្កើត..." : "Generating...")
              : (kh ? "រក្សាទុកកាតលទ្ធផល" : "Save Result Card")}
          </button>
        )}

        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="flex-1 px-6 py-4 bg-black text-yellow-400 font-black border-4 border-yellow-400 flex items-center justify-center gap-2 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#eab308] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_#eab308] transition-all text-base"
            style={{ boxShadow: "5px 5px 0 #eab308", borderRadius: "0px", ...khFont }}
          >
            {kh ? "លេងម្តងទៀត" : "Play Again"}
          </button>
        )}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
