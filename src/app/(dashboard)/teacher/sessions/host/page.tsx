"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useGameSSE } from "@/hooks/use-game-sse";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import type { SSEEvent, ParticipantInfo, LeaderboardEntry } from "@/lib/game-event-bus";
import {
  Play, Square, Users, BarChart2,
  Copy, Check, ChevronRight, Loader2,
  SkipForward, Crown, TrendingUp, TrendingDown, Minus
} from "lucide-react";

type HostPhase =
  | { name: "setup" }
  | { name: "creating" }
  | { name: "lobby"; code: string; sessionId: number; participants: ParticipantInfo[] }
  | { name: "active"; code: string; sessionId: number; qIndex: number; total: number; leaderboard: LeaderboardEntry[]; questionText: string; questionKm?: string }
  | { name: "round_end"; code: string; sessionId: number; leaderboard: LeaderboardEntry[]; qIndex: number; total: number }
  | { name: "ended"; code: string; sessionId: number; leaderboard: LeaderboardEntry[] };

// ── Live Leaderboard Row ───────────────────────────────────────────────────
function LiveLeaderRow({ entry, rank, isTop3 }: { entry: LeaderboardEntry; rank: number; isTop3: boolean }) {
  const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];
  const rankColor = RANK_COLORS[rank - 1] ?? "#374151";
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-2 border-white/20 rounded-none transition-all duration-500"
      style={{ backgroundColor: isTop3 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)" }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center border-2 border-white/30 font-black text-sm flex-shrink-0 text-black"
        style={{ backgroundColor: isTop3 ? rankColor : "#6b7280" }}
      >
        {isTop3 ? <Crown size={14} /> : rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black text-white text-sm truncate">{entry.displayName}</div>
        <div className="text-xs text-white/50">{entry.correctAnswers} correct{entry.currentStreak > 1 ? ` · 🔥x${entry.currentStreak}` : ""}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-black text-white text-lg tabular-nums">{entry.totalScore.toLocaleString()}</div>
        <div className="flex items-center justify-end gap-0.5 text-xs">
          {entry.rankChange > 0 ? <TrendingUp size={10} className="text-green-400" /> : entry.rankChange < 0 ? <TrendingDown size={10} className="text-red-400" /> : <Minus size={10} className="text-white/30" />}
          <span className={entry.rankChange > 0 ? "text-green-400 font-bold" : entry.rankChange < 0 ? "text-red-400 font-bold" : "text-white/30"}>
            {entry.rankChange !== 0 ? `${entry.rankChange > 0 ? "+" : ""}${entry.rankChange}` : "–"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HostPage() {
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [phase, setPhase] = useState<HostPhase>({ name: "setup" });
  const [categories, setCategories] = useState<{ id: number; titleEn: string; titleKm: string }[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [selectedMode, setSelectedMode] = useState("quick-quiz");
  const [difficulty, setDifficulty] = useState("mixed");
  const [scoringMode, setScoringMode] = useState("speed");
  const [language, setLanguage] = useState("both");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [controlling, setControlling] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(50);

  useEffect(() => {
    fetch("/api/game/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        if (d.categories?.length) setSelectedCats([d.categories[0].id]);
      });

    fetch("/api/game/sessions")
      .then((r) => r.json())
      .then((d) => {
        const active = (d.sessions ?? []).find(
          (s: any) => s.status === "lobby" || s.status === "active" || s.status === "paused"
        );
        if (active) {
          setPhase({ name: "lobby", code: active.sessionCode, sessionId: active.id, participants: [] });
        }
      })
      .catch(() => {});
  }, []);

  const activeCode = "code" in phase ? phase.code : "";

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === "lobby_update") {
      setPhase((p) => p.name === "lobby" ? { ...p, participants: event.participants } : p);
    }
    if (event.type === "question_start") {
      setPhase((p) => {
        if (p.name === "lobby" || p.name === "round_end" || p.name === "active") {
          return {
            name: "active",
            code: "code" in p ? p.code : "",
            sessionId: "sessionId" in p ? p.sessionId : 0,
            qIndex: event.index,
            total: event.total,
            leaderboard: p.name === "active" ? p.leaderboard : [],
            questionText: event.question.questionEn,
            questionKm: event.question.questionKm,
          };
        }
        return p;
      });
    }
    if (event.type === "question_end") {
      setPhase((p) => {
        if (p.name === "active") {
          return { name: "round_end", code: p.code, sessionId: p.sessionId, leaderboard: event.leaderboard, qIndex: p.qIndex, total: p.total };
        }
        return p;
      });
    }
    if (event.type === "session_end") {
      setPhase((p) => ({
        name: "ended",
        code: "code" in p ? p.code : "",
        sessionId: "sessionId" in p ? p.sessionId : 0,
        leaderboard: event.finalLeaderboard,
      }));
    }
  }, []);

  useGameSSE(activeCode, handleSSEEvent, !!activeCode);

  async function createSession() {
    if (!sessionName.trim()) { setError(kh ? "ដាក់ឈ្មោះ" : "Enter session name"); return; }
    if (!selectedCats.length) { setError(kh ? "ជ្រើសរើសប្រភេទ" : "Select a category"); return; }
    setError("");
    setPhase({ name: "creating" });

    const cfg = GAME_MODE_CONFIG[selectedMode];
    const res = await fetch("/api/game/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionName, categoryIds: selectedCats, difficulty,
        questionCount: cfg.questionCount, timePerQuestion: cfg.timePerQuestion,
        scoringMode, language, gameType: selectedMode, maxPlayers, allowLateJoin: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Failed");
      setPhase({ name: "setup" });
      return;
    }

    const data = await res.json();
    setPhase({ name: "lobby", code: data.sessionCode, sessionId: data.sessionId, participants: [] });
  }

  async function control(action: string) {
    if (controlling || !("code" in phase)) return;
    setControlling(true);
    setError("");
    try {
      const res = await fetch(`/api/game/sessions/${(phase as any).code}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(errorData.details || errorData.error || `Failed to ${action}`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setControlling(false);
    }
  }

  function copyCode() {
    if (!("code" in phase)) return;
    navigator.clipboard.writeText((phase as any).code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const GAME_MODES = Object.entries(GAME_MODE_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase.name === "setup" || phase.name === "creating") {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
            {kh ? "បង្កើតហ្គេម" : "Create Game"}
          </div>
          <h1 className="text-3xl font-black" style={khFont}>{kh ? "ហ្គេមផ្ទាល់" : "Live Game Session"}</h1>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 block mb-2" style={khFont}>
              {kh ? "ឈ្មោះ" : "Session Name"}
            </label>
            <input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={kh ? "ឧ. ថ្នាក់ ១០ - ប្រឡងសញ្ញា" : "e.g. Class 10 - Traffic Signs"}
              className="w-full border-2 border-black px-4 py-3 font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_#000]"
              style={{ boxShadow: "2px 2px 0 #000", ...khFont }}
            />
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
              {kh ? "របៀបលេង" : "Game Mode"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GAME_MODES.map((m) => (
                <button key={m.id} onClick={() => setSelectedMode(m.id)}
                  className="p-3 border-2 border-black text-left transition-all duration-100"
                  style={{ backgroundColor: selectedMode === m.id ? m.color : "#fff", boxShadow: selectedMode === m.id ? "3px 3px 0 #000" : "2px 2px 0 #000", transform: selectedMode === m.id ? "translate(-1px,-1px)" : undefined }}>
                  <div className="font-black text-sm text-black" style={khFont}>{kh ? m.labelKm : m.label}</div>
                  <div className="text-xs text-black/60">{m.questionCount}Q · {m.timePerQuestion}s/Q</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
              {kh ? "ប្រភេទ" : "Categories"}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const sel = selectedCats.includes(cat.id);
                return (
                  <button key={cat.id}
                    onClick={() => setSelectedCats((p) => sel ? p.filter((id) => id !== cat.id) : [...p, cat.id])}
                    className="px-3 py-1.5 border-2 border-black text-sm font-bold transition-all"
                    style={{ backgroundColor: sel ? "#000" : "#fff", color: sel ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                    <span style={khFont}>{kh ? cat.titleKm : cat.titleEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "ពិន្ទុ" : "Scoring"}</div>
              {["speed", "equal"].map((s) => (
                <button key={s} onClick={() => setScoringMode(s)}
                  className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all"
                  style={{ backgroundColor: scoringMode === s ? "#000" : "#fff", color: scoringMode === s ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  {s === "speed" ? (kh ? "ល្បឿន" : "Speed") : (kh ? "ស្មើ" : "Equal")}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "ភាសា" : "Language"}</div>
              {["both", "en", "km"].map((l) => (
                <button key={l} onClick={() => setLanguage(l)}
                  className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all"
                  style={{ backgroundColor: language === l ? "#000" : "#fff", color: language === l ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  {l === "both" ? (kh ? "ទាំងពីរ" : "Both") : l.toUpperCase()}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "កម្រិត" : "Difficulty"}</div>
              {["mixed", "easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all"
                  style={{ backgroundColor: difficulty === d ? "#000" : "#fff", color: difficulty === d ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 font-bold text-sm border-2 border-red-500 px-3 py-2" style={khFont}>{error}</p>}

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
              {kh ? "អ្នកលេងអតិបរមា" : "Max Players"}
            </div>
            <div className="flex gap-2">
              {[10, 20, 30, 50, 100].map((n) => (
                <button key={n} onClick={() => setMaxPlayers(n)}
                  className="flex-1 py-2 border-2 border-black text-xs font-black transition-all"
                  style={{ backgroundColor: maxPlayers === n ? "#000" : "#fff", color: maxPlayers === n ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button onClick={createSession} disabled={phase.name === "creating"}
            className="w-full py-5 bg-black text-yellow-400 font-black text-xl border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ boxShadow: "5px 5px 0 #ffd700", ...khFont }}>
            {phase.name === "creating" ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
            {kh ? "បង្កើតហ្គេម" : "Create Game"}
          </button>
        </div>
      </div>
    );
  }

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (phase.name === "lobby") {
    return (
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1" style={khFont}>
              {kh ? "ហ្គេមរង់ចាំ" : "Waiting Room"}
            </div>
            <h1 className="text-3xl font-black" style={khFont}>{kh ? "ចូលរួម" : "Players Joining"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (confirm(kh ? "បោះបង់ហ្គេមនេះ?" : "Cancel this game session?")) { control("terminate"); setTimeout(() => setPhase({ name: "setup" }), 500); } }}
              disabled={controlling}
              className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white font-black border-2 border-black disabled:opacity-40 transition-all"
              style={{ boxShadow: "3px 3px 0 #000", ...khFont }}>
              <Square size={16} />
              {kh ? "បោះបង់" : "Cancel"}
            </button>
            <button onClick={() => control("start")} disabled={controlling}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-black border-2 border-black disabled:opacity-40 transition-all"
              style={{ boxShadow: "3px 3px 0 #000", ...khFont }}>
              <Play size={16} />
              {kh ? "ចាប់ផ្តើម" : "Start Game"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 border-2 border-red-500 bg-red-50 p-4" style={{ boxShadow: "3px 3px 0 #dc2626" }}>
            <p className="text-red-600 font-bold text-sm" style={khFont}>{error}</p>
          </div>
        )}

        <div className="border-2 border-black p-6 mb-6 bg-yellow-400 flex items-center justify-between" style={{ boxShadow: "5px 5px 0 #000" }}>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-black/60 mb-1" style={khFont}>
              {kh ? "លេខកូដបន្ទប់" : "Room Code"}
            </div>
            <div className="text-6xl font-black text-black tracking-widest">{phase.code}</div>
            <div className="text-sm text-black/60 mt-1" style={khFont}>
              {kh ? "ចូល: /play/" : "Join at: /play/"}{phase.code}
            </div>
          </div>
          <button onClick={copyCode}
            className="flex items-center gap-2 px-4 py-3 bg-black text-white font-black border-2 border-black transition-all"
            style={{ boxShadow: "3px 3px 0 #ffd700" }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? (kh ? "បានចម្លង" : "Copied") : (kh ? "ចម្លង" : "Copy")}
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-zinc-500" />
          <span className="font-black text-sm" style={khFont}>
            {phase.participants.length} / {maxPlayers} {kh ? "នាក់" : "players"}
          </span>
          <div className="flex-1 h-2 bg-zinc-200 border border-black">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${Math.min((phase.participants.length / maxPlayers) * 100, 100)}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {phase.participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-2 border-2 border-black p-2 bg-white" style={{ boxShadow: "2px 2px 0 #000" }}>
              <div className="w-8 h-8 bg-yellow-400 border border-black flex items-center justify-center font-black text-black text-sm flex-shrink-0">
                {p.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold truncate" style={khFont}>{p.displayName}</span>
            </div>
          ))}
          {phase.participants.length === 0 && (
            <div className="col-span-4 text-center py-8 text-zinc-400 font-bold" style={khFont}>
              {kh ? "រង់ចាំអ្នកចូលរួម..." : "Waiting for players to join..."}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Active / Round End — FULLSCREEN PRESENTATION MODE ─────────────────────
  if (phase.name === "active" || phase.name === "round_end") {
    const isActive = phase.name === "active";
    const progress = ((phase.qIndex + 1) / phase.total) * 100;
    const leaderboard = phase.leaderboard ?? [];

    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-black text-sm uppercase tracking-widest">LIVE</span>
            </div>
            <div className="text-white/60 text-sm font-bold" style={khFont}>
              {kh ? `សំណួរ ${phase.qIndex + 1} / ${phase.total}` : `Question ${phase.qIndex + 1} / ${phase.total}`}
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 mx-8 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {error && <span className="text-red-400 text-xs font-bold max-w-xs truncate">{error}</span>}
            <button
              onClick={() => { if (confirm(kh ? "បញ្ចប់ហ្គេម?" : "End this game session?")) control("end"); }}
              disabled={controlling}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black border border-red-400 disabled:opacity-40 transition-all text-sm"
              style={{ boxShadow: "0 0 12px rgba(239,68,68,0.4)" }}
            >
              <Square size={14} />
              {kh ? "បញ្ចប់" : "End Live"}
            </button>
            <button
              onClick={() => control("advance")}
              disabled={controlling}
              className="flex items-center gap-3 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black border-2 border-yellow-300 disabled:opacity-40 transition-all text-base"
              style={{ boxShadow: "0 0 20px rgba(250,204,21,0.5)" }}
            >
              {controlling ? <Loader2 size={18} className="animate-spin" /> : <SkipForward size={18} />}
              {isActive ? (kh ? "បន្ទាប់" : "Next") : (kh ? "សំណួរបន្ទាប់" : "Next Question")}
            </button>
          </div>
        </div>

        {/* Main content: question + leaderboard */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Question panel (2/3 width) */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
            {/* Question type badge */}
            <div className="mb-6 flex items-center gap-3">
              <div className="px-4 py-1.5 bg-yellow-400 text-black font-black text-xs uppercase tracking-widest border border-yellow-300">
                {isActive ? (kh ? "សំណួរ" : "Question") : (kh ? "ចប់វគ្គ" : "Round Over")}
              </div>
              <div className="text-white/40 text-xs font-bold">
                {phase.qIndex + 1} / {phase.total}
              </div>
            </div>

            {/* Question text */}
            {isActive && (
              <div className="w-full max-w-2xl">
                <div
                  className="text-center text-white font-black text-2xl lg:text-3xl xl:text-4xl leading-tight mb-4"
                  style={khFont}
                >
                  {kh && phase.questionKm ? phase.questionKm : phase.questionText}
                </div>
                {kh && phase.questionKm && phase.questionText && (
                  <div className="text-center text-white/50 text-lg font-bold mt-2">
                    {phase.questionText}
                  </div>
                )}
              </div>
            )}

            {/* Round end state */}
            {!isActive && (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <div className="text-white font-black text-2xl mb-2" style={khFont}>
                  {kh ? "ចប់វគ្គ!" : "Round Complete!"}
                </div>
                <div className="text-white/60 text-sm" style={khFont}>
                  {kh ? "ចុច «សំណួរបន្ទាប់» ដើម្បីបន្ត" : "Click «Next Question» to continue"}
                </div>
              </div>
            )}

            {/* Teacher note */}
            <div className="mt-8 px-4 py-2 border border-white/10 bg-white/5 text-white/40 text-xs font-bold text-center max-w-md">
              {kh ? "👁 អ្នកគ្រូមើលបានតែ — សិស្សជ្រើសចម្លើយ" : "👁 Teacher view only — students select answers"}
            </div>
          </div>

          {/* Right: Live Leaderboard (1/3 width) */}
          <div className="w-80 xl:w-96 flex flex-col border-l border-white/10 flex-shrink-0">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <BarChart2 size={14} className="text-yellow-400" />
              <span className="text-white font-black text-sm uppercase tracking-widest" style={khFont}>
                {kh ? "ចំណាត់ថ្នាក់" : "Live Scores"}
              </span>
              <span className="ml-auto text-white/40 text-xs font-bold">{leaderboard.length} {kh ? "នាក់" : "players"}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm font-bold" style={khFont}>
                  {kh ? "រង់ចាំពិន្ទុ..." : "Waiting for scores..."}
                </div>
              ) : (
                leaderboard.slice(0, 15).map((entry, i) => (
                  <LiveLeaderRow key={entry.userId} entry={entry} rank={i + 1} isTop3={i < 3} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Ended ──────────────────────────────────────────────────────────────────
  if (phase.name === "ended") {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
            {kh ? "ចប់ហ្គេម" : "Game Over"}
          </div>
          <h1 className="text-3xl font-black" style={khFont}>{kh ? "លទ្ធផលចុងក្រោយ" : "Final Results"}</h1>
        </div>

        <div className="border-2 border-black bg-yellow-400 p-6 mb-6" style={{ boxShadow: "5px 5px 0 #000" }}>
          <div className="text-4xl font-black text-center mb-1" style={khFont}>
            {phase.leaderboard.length} {kh ? "អ្នកលេង" : "players"}
          </div>
          <div className="text-center text-sm font-bold text-black/60" style={khFont}>
            {kh ? "បានចូលរួមក្នុងហ្គេម" : "participated in this game"}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => router.push(`/teacher/sessions/${phase.code}/analytics`)}
            className="flex items-center gap-2 px-5 py-3 bg-black text-white font-black border-2 border-black"
            style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}>
            <BarChart2 size={14} />
            {kh ? "មើលលទ្ធផល" : "View Results"}
          </button>
          <button onClick={() => setPhase({ name: "setup" })}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-black font-black border-2 border-black"
            style={{ boxShadow: "3px 3px 0 #000", ...khFont }}>
            <ChevronRight size={14} />
            {kh ? "ហ្គេមថ្មី" : "New Game"}
          </button>
        </div>

        {phase.leaderboard.length > 0 && (
          <>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>
              {kh ? "ចំណាត់ថ្នាក់ចុងក្រោយ" : "Final Leaderboard"}
            </div>
            <div className="flex flex-col gap-2">
              {phase.leaderboard.slice(0, 10).map((entry, i) => {
                const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];
                const isTop3 = i < 3;
                return (
                  <div key={entry.userId}
                    className="flex items-center gap-3 p-3 border-2 border-black"
                    style={{ backgroundColor: isTop3 ? "#fff" : "#f9fafb", boxShadow: "2px 2px 0 #000" }}>
                    <div className="w-8 h-8 flex items-center justify-center border-2 border-black font-black text-sm flex-shrink-0"
                      style={{ backgroundColor: isTop3 ? RANK_COLORS[i] : "#e5e7eb" }}>
                      {isTop3 ? <Crown size={14} /> : entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm truncate" style={khFont}>{entry.displayName}</div>
                      <div className="text-xs text-zinc-500">{entry.correctAnswers} {kh ? "ត្រូវ" : "correct"}</div>
                    </div>
                    <div className="font-black text-lg tabular-nums">{entry.totalScore.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}
