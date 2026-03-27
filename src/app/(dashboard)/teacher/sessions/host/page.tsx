"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useGameSSE } from "@/hooks/use-game-sse";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import type { SSEEvent, ParticipantInfo, LeaderboardEntry } from "@/lib/game-event-bus";
import {
  Play, SkipForward, Pause, Square, Users, BarChart2,
  Copy, Check, ChevronRight, Loader2
} from "lucide-react";

type HostPhase =
  | { name: "setup" }
  | { name: "creating" }
  | { name: "lobby"; code: string; sessionId: number; participants: ParticipantInfo[] }
  | { name: "active"; code: string; sessionId: number; qIndex: number; total: number; leaderboard: LeaderboardEntry[]; questionText: string }
  | { name: "round_end"; code: string; sessionId: number; leaderboard: LeaderboardEntry[]; qIndex: number; total: number }
  | { name: "ended"; code: string; sessionId: number; leaderboard: LeaderboardEntry[] };

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

    // Restore active session if teacher navigates back
    fetch("/api/game/sessions")
      .then((r) => r.json())
      .then((d) => {
        const active = (d.sessions ?? []).find(
          (s: any) => s.status === "lobby" || s.status === "active" || s.status === "paused"
        );
        if (active) {
          setPhase({
            name: "lobby",
            code: active.sessionCode,
            sessionId: active.id,
            participants: [],
          });
        }
      })
      .catch(() => {});
  }, []);

  const activeCode = "code" in phase ? phase.code : "";

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === "lobby_update") {
      setPhase((p) => {
        if (p.name === "lobby") return { ...p, participants: event.participants };
        return p;
      });
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
        sessionName,
        categoryIds: selectedCats,
        difficulty,
        questionCount: cfg.questionCount,
        timePerQuestion: cfg.timePerQuestion,
        scoringMode,
        language,
        gameType: selectedMode,
        maxPlayers,
        allowLateJoin: true,
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
    try {
      await fetch(`/api/game/sessions/${phase.code}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } finally {
      setControlling(false);
    }
  }

  function copyCode() {
    if (!("code" in phase)) return;
    navigator.clipboard.writeText(phase.code);
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
          <h1 className="text-3xl font-black" style={khFont}>
            {kh ? "ហ្គេមផ្ទាល់" : "Live Game Session"}
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Session name */}
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

          {/* Game mode */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
              {kh ? "របៀបលេង" : "Game Mode"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GAME_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className="p-3 border-2 border-black text-left transition-all duration-100"
                  style={{
                    backgroundColor: selectedMode === m.id ? m.color : "#fff",
                    boxShadow: selectedMode === m.id ? "3px 3px 0 #000" : "2px 2px 0 #000",
                    transform: selectedMode === m.id ? "translate(-1px,-1px)" : undefined,
                  }}
                >
                  <div className="font-black text-sm text-black" style={khFont}>{kh ? m.labelKm : m.label}</div>
                  <div className="text-xs text-black/60">{m.questionCount}Q · {m.timePerQuestion}s/Q</div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
              {kh ? "ប្រភេទ" : "Categories"}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const sel = selectedCats.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCats((p) => sel ? p.filter((id) => id !== cat.id) : [...p, cat.id])}
                    className="px-3 py-1.5 border-2 border-black text-sm font-bold transition-all"
                    style={{ backgroundColor: sel ? "#000" : "#fff", color: sel ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}
                  >
                    <span style={khFont}>{kh ? cat.titleKm : cat.titleEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
                {kh ? "ពិន្ទុ" : "Scoring"}
              </div>
              {["speed", "equal"].map((s) => (
                <button key={s} onClick={() => setScoringMode(s)}
                  className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all"
                  style={{ backgroundColor: scoringMode === s ? "#000" : "#fff", color: scoringMode === s ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}
                >
                  {s === "speed" ? (kh ? "ល្បឿន" : "Speed") : (kh ? "ស្មើ" : "Equal")}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
                {kh ? "ភាសា" : "Language"}
              </div>
              {["both", "en", "km"].map((l) => (
                <button key={l} onClick={() => setLanguage(l)}
                  className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all"
                  style={{ backgroundColor: language === l ? "#000" : "#fff", color: language === l ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}
                >
                  {l === "both" ? (kh ? "ទាំងពីរ" : "Both") : l.toUpperCase()}
                </button>
              ))}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>
                {kh ? "កម្រិត" : "Difficulty"}
              </div>
              {["mixed", "easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all"
                  style={{ backgroundColor: difficulty === d ? "#000" : "#fff", color: difficulty === d ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 font-bold text-sm border-2 border-red-500 px-3 py-2" style={khFont}>{error}</p>}

          {/* Max players */}
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

          <button
            onClick={createSession}
            disabled={phase.name === "creating"}
            className="w-full py-5 bg-black text-yellow-400 font-black text-xl border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ boxShadow: "5px 5px 0 #ffd700", ...khFont }}
          >
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
          <button
            onClick={() => control("start")}
            disabled={controlling}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-black border-2 border-black disabled:opacity-40 transition-all"
            style={{ boxShadow: "3px 3px 0 #000", ...khFont }}
          >
            <Play size={16} />
            {kh ? "ចាប់ផ្តើម" : "Start Game"}
          </button>
        </div>

        {/* Room code display */}
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
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-3 bg-black text-white font-black border-2 border-black transition-all"
            style={{ boxShadow: "3px 3px 0 #ffd700" }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? (kh ? "បានចម្លង" : "Copied") : (kh ? "ចម្លង" : "Copy")}
          </button>
        </div>

        {/* Participants */}
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

  // ── Active / Round End ─────────────────────────────────────────────────────
  if (phase.name === "active" || phase.name === "round_end") {
    const isActive = phase.name === "active";
    return (
      <div className="max-w-3xl">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1" style={khFont}>
              {kh ? "ហ្គេមកំពុងដំណើរការ" : "Game In Progress"}
            </div>
            <div className="font-black text-xl" style={khFont}>
              {kh ? `សំណួរ ${phase.qIndex + 1}/${phase.total}` : `Question ${phase.qIndex + 1} / ${phase.total}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => control("pause")}
              disabled={controlling || !isActive}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-black font-black border-2 border-black disabled:opacity-40"
              style={{ boxShadow: "2px 2px 0 #000" }}
            >
              <Pause size={14} />
            </button>
            <button
              onClick={() => control("advance")}
              disabled={controlling}
              className="flex items-center gap-2 px-5 py-2 bg-black text-yellow-400 font-black border-2 border-black disabled:opacity-40"
              style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}
            >
              {controlling ? <Loader2 size={14} className="animate-spin" /> : <SkipForward size={14} />}
              {isActive ? (kh ? "បន្ទាប់" : "Next") : (kh ? "សំណួរបន្ទាប់" : "Next Question")}
            </button>
            <button
              onClick={() => control("end")}
              disabled={controlling}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white font-black border-2 border-black disabled:opacity-40"
              style={{ boxShadow: "2px 2px 0 #000" }}
            >
              <Square size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-200 border border-black mb-6">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${((phase.qIndex + 1) / phase.total) * 100}%` }}
          />
        </div>

        {/* Question preview (active only) */}
        {isActive && phase.questionText && (
          <div className="border-2 border-black p-4 bg-zinc-50 mb-6 font-bold text-sm" style={{ boxShadow: "3px 3px 0 #000" }}>
            {phase.questionText}
          </div>
        )}

        {/* Leaderboard */}
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={14} className="text-zinc-500" />
          <span className="font-black text-sm uppercase tracking-widest text-zinc-500" style={khFont}>
            {kh ? "ចំណាត់ថ្នាក់" : "Leaderboard"}
          </span>
        </div>
        <LeaderboardPanel entries={phase.leaderboard} lang={lang as "en" | "kh"} />
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

        {/* Summary card */}
        <div className="border-2 border-black bg-yellow-400 p-6 mb-6" style={{ boxShadow: "5px 5px 0 #000" }}>
          <div className="text-4xl font-black text-center mb-1" style={khFont}>
            {phase.leaderboard.length} {kh ? "អ្នកលេង" : "players"}
          </div>
          <div className="text-center text-sm font-bold text-black/60" style={khFont}>
            {kh ? "បានចូលរួមក្នុងហ្គេម" : "participated in this game"}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => router.push(`/teacher/sessions/${phase.code}/analytics`)}
            className="flex items-center gap-2 px-5 py-3 bg-black text-white font-black border-2 border-black"
            style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}
          >
            <BarChart2 size={14} />
            {kh ? "មើលលទ្ធផល" : "View Results"}
          </button>
          <button
            onClick={() => setPhase({ name: "setup" })}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-black font-black border-2 border-black"
            style={{ boxShadow: "3px 3px 0 #000", ...khFont }}
          >
            <ChevronRight size={14} />
            {kh ? "ហ្គេមថ្មី" : "New Game"}
          </button>
        </div>

        {phase.leaderboard.length > 0 && (
          <>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>
              {kh ? "ចំណាត់ថ្នាក់ចុងក្រោយ" : "Final Leaderboard"}
            </div>
            <LeaderboardPanel entries={phase.leaderboard} lang={lang as "en" | "kh"} />
          </>
        )}
      </div>
    );
  }

  return null;
}
