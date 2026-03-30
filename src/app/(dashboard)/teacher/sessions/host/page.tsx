"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { useGameSSE } from "@/hooks/use-game-sse";
import { GAME_MODE_CONFIG } from "@/lib/game-engine";
import type { SSEEvent, ParticipantInfo, LeaderboardEntry, QuestionPayload } from "@/lib/game-event-bus";
import {
  Play, Square, Users, BarChart2,
  Copy, Check, ChevronRight, Loader2,
  SkipForward, Crown, TrendingUp, TrendingDown, Minus
} from "lucide-react";

// Answer color/label config matching student UI
const ANSWER_STYLES = [
  { bg: "#ef4444", label: "A" },
  { bg: "#3b82f6", label: "B" },
  { bg: "#22c55e", label: "C" },
  { bg: "#f97316", label: "D" },
];

type HostPhase =
  | { name: "setup" }
  | { name: "creating" }
  | { name: "lobby"; code: string; sessionId: number; participants: ParticipantInfo[] }
  | { name: "active"; code: string; sessionId: number; qIndex: number; total: number; leaderboard: LeaderboardEntry[]; question: QuestionPayload }
  | { name: "round_end"; code: string; sessionId: number; leaderboard: LeaderboardEntry[]; qIndex: number; total: number; question: QuestionPayload; correctAnswerId: number | null }
  | { name: "ended"; code: string; sessionId: number; leaderboard: LeaderboardEntry[] };

// ── Leaderboard row ────────────────────────────────────────────────────────
function LiveLeaderRow({ entry, rank, showScore }: { entry: LeaderboardEntry; rank: number; showScore: boolean }) {
  const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];
  const isTop3 = rank <= 3;
  const rankColor = RANK_COLORS[rank - 1] ?? "#4b5563";
  const initials = (entry.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 transition-all duration-500"
      style={{
        backgroundColor: isTop3 ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
        borderLeft: isTop3 ? `3px solid ${rankColor}` : "3px solid transparent",
      }}
    >
      {/* Rank badge */}
      <div
        className="w-7 h-7 flex items-center justify-center font-black text-xs flex-shrink-0"
        style={{ backgroundColor: isTop3 ? rankColor : "#374151", color: isTop3 && rank === 1 ? "#000" : "#fff" }}
      >
        {isTop3 ? <Crown size={12} /> : rank}
      </div>
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 text-white"
        style={{ background: `hsl(${(entry.userId * 47) % 360}, 60%, 45%)`, border: "1.5px solid rgba(255,255,255,0.2)" }}>
        {initials}
      </div>
      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-xs truncate">{entry.displayName}</div>
        {entry.currentStreak > 1 && (
          <div className="text-orange-400 text-xs font-bold">🔥 ×{entry.currentStreak}</div>
        )}
      </div>
      {/* Score */}
      <div className="text-right flex-shrink-0">
        {showScore ? (
          <>
            <div className="font-black text-white text-sm tabular-nums">{entry.totalScore.toLocaleString()}</div>
            <div className="flex items-center justify-end gap-0.5">
              {entry.rankChange > 0 ? <TrendingUp size={9} className="text-green-400" /> : entry.rankChange < 0 ? <TrendingDown size={9} className="text-red-400" /> : <Minus size={9} className="text-white/20" />}
              <span className={`text-xs font-bold ${entry.rankChange > 0 ? "text-green-400" : entry.rankChange < 0 ? "text-red-400" : "text-white/20"}`}>
                {entry.rankChange !== 0 ? `${entry.rankChange > 0 ? "+" : ""}${entry.rankChange}` : "–"}
              </span>
            </div>
          </>
        ) : (
          <div className="font-black text-white/30 text-sm">···</div>
        )}
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
  // Participants from lobby — kept for leaderboard seeding
  const [lobbyParticipants, setLobbyParticipants] = useState<ParticipantInfo[]>([]);
  // Custom question count (overrides game mode default)
  const [questionCount, setQuestionCount] = useState(10);

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
        if (active) setPhase({ name: "lobby", code: active.sessionCode, sessionId: active.id, participants: [] });
      })
      .catch(() => {});
  }, []);

  const activeCode = "code" in phase ? (phase as any).code : "";

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === "lobby_update") {
      setLobbyParticipants(event.participants);
      setPhase((p) => p.name === "lobby" ? { ...p, participants: event.participants } : p);
    }
    if (event.type === "question_start") {
      setPhase((p) => {
        if (p.name === "lobby" || p.name === "round_end" || p.name === "active") {
          // Seed leaderboard from lobby participants if first question
          const prevLeaderboard = p.name === "active" ? p.leaderboard
            : p.name === "round_end" ? p.leaderboard
            : [];
          return {
            name: "active",
            code: "code" in p ? (p as any).code : "",
            sessionId: "sessionId" in p ? (p as any).sessionId : 0,
            qIndex: event.index,
            total: event.total,
            leaderboard: prevLeaderboard,
            question: event.question,
          };
        }
        return p;
      });
    }
    if (event.type === "question_end") {
      setPhase((p) => {
        if (p.name === "active") {
          return {
            name: "round_end",
            code: p.code, sessionId: p.sessionId,
            leaderboard: event.leaderboard,
            qIndex: p.qIndex, total: p.total,
            question: p.question,
            correctAnswerId: event.correctAnswerId,
          };
        }
        return p;
      });
    }
    if (event.type === "session_end") {
      setPhase((p) => ({
        name: "ended",
        code: "code" in p ? (p as any).code : "",
        sessionId: "sessionId" in p ? (p as any).sessionId : 0,
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
      body: JSON.stringify({ sessionName, categoryIds: selectedCats, difficulty, questionCount: questionCount, timePerQuestion: cfg.timePerQuestion, scoringMode, language, gameType: selectedMode, maxPlayers, allowLateJoin: true }),
    });
    if (!res.ok) { const err = await res.json(); setError(err.error ?? "Failed"); setPhase({ name: "setup" }); return; }
    const data = await res.json();
    setPhase({ name: "lobby", code: data.sessionCode, sessionId: data.sessionId, participants: [] });
  }

  async function control(action: string) {
    if (controlling || !("code" in phase)) return;
    setControlling(true); setError("");
    try {
      const res = await fetch(`/api/game/sessions/${(phase as any).code}/control`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({ error: "Unknown" })); setError(e.details || e.error || `Failed to ${action}`); }
    } catch (err) { setError(`Network error: ${err instanceof Error ? err.message : "Unknown"}`); }
    finally { setControlling(false); }
  }

  function copyCode() {
    if (!("code" in phase)) return;
    navigator.clipboard.writeText((phase as any).code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const GAME_MODES = Object.entries(GAME_MODE_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase.name === "setup" || phase.name === "creating") {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>{kh ? "បង្កើតហ្គេម" : "Create Game"}</div>
          <h1 className="text-3xl font-black" style={khFont}>{kh ? "ហ្គេមផ្ទាល់" : "Live Game Session"}</h1>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 block mb-2" style={khFont}>{kh ? "ឈ្មោះ" : "Session Name"}</label>
            <input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder={kh ? "ឧ. ថ្នាក់ ១០" : "e.g. Class 10 - Traffic Signs"} className="w-full border-2 border-black px-4 py-3 font-bold text-sm focus:outline-none" style={{ boxShadow: "2px 2px 0 #000", ...khFont }} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "របៀបលេង" : "Game Mode"}</div>
            <div className="grid grid-cols-2 gap-2">
              {GAME_MODES.map((m) => (
                <button key={m.id} onClick={() => { setSelectedMode(m.id); setQuestionCount(m.questionCount); }} className="p-3 border-2 border-black text-left transition-all"
                  style={{ backgroundColor: selectedMode === m.id ? m.color : "#fff", boxShadow: selectedMode === m.id ? "3px 3px 0 #000" : "2px 2px 0 #000", transform: selectedMode === m.id ? "translate(-1px,-1px)" : undefined }}>
                  <div className="font-black text-sm text-black" style={khFont}>{kh ? m.labelKm : m.label}</div>
                  <div className="text-xs text-black/60">{m.questionCount}Q · {m.timePerQuestion}s/Q</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "ប្រភេទ" : "Categories"}</div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => { const sel = selectedCats.includes(cat.id); return (
                <button key={cat.id} onClick={() => setSelectedCats((p) => sel ? p.filter((id) => id !== cat.id) : [...p, cat.id])} className="px-3 py-1.5 border-2 border-black text-sm font-bold transition-all"
                  style={{ backgroundColor: sel ? "#000" : "#fff", color: sel ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  <span style={khFont}>{kh ? cat.titleKm : cat.titleEn}</span>
                </button>
              ); })}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "ពិន្ទុ" : "Scoring"}</div>
              {["speed","equal"].map((s) => <button key={s} onClick={() => setScoringMode(s)} className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all" style={{ backgroundColor: scoringMode===s?"#000":"#fff", color: scoringMode===s?"#ffd700":"#000", boxShadow:"2px 2px 0 #000" }}>{s==="speed"?(kh?"ល្បឿន":"Speed"):(kh?"ស្មើ":"Equal")}</button>)}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "ភាសា" : "Language"}</div>
              {["both","en","km"].map((l) => <button key={l} onClick={() => setLanguage(l)} className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all" style={{ backgroundColor: language===l?"#000":"#fff", color: language===l?"#ffd700":"#000", boxShadow:"2px 2px 0 #000" }}>{l==="both"?(kh?"ទាំងពីរ":"Both"):l.toUpperCase()}</button>)}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "កម្រិត" : "Difficulty"}</div>
              {["mixed","easy","medium","hard"].map((d) => <button key={d} onClick={() => { setDifficulty(d); if (d !== "mixed" && questionCount > 20) setQuestionCount(20); }} className="w-full py-2 border-2 border-black text-xs font-black mb-1 transition-all" style={{ backgroundColor: difficulty===d?"#000":"#fff", color: difficulty===d?"#ffd700":"#000", boxShadow:"2px 2px 0 #000" }}>{d.charAt(0).toUpperCase()+d.slice(1)}</button>)}
            </div>
          </div>
          {error && <p className="text-red-600 font-bold text-sm border-2 border-red-500 px-3 py-2" style={khFont}>{error}</p>}

          {/* ── Question Count + Composition ── */}
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>
              {kh ? "ចំនួនសំណួរ" : "Question Count"}
            </div>
            <div className="flex items-center gap-4 mb-3">
              <input
                type="range"
                min={5}
                max={difficulty === "easy" || difficulty === "medium" || difficulty === "hard" ? 20 : 40}
                step={1}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="flex-1 accent-yellow-400 cursor-pointer"
              />
              <div className="w-14 text-center border-2 border-black font-black text-lg py-1 bg-yellow-400" style={{ boxShadow: "2px 2px 0 #000" }}>
                {questionCount}
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {(difficulty === "mixed" ? [5, 10, 15, 20, 30, 40] : [5, 10, 15, 20]).map((n) => (
                <button key={n} onClick={() => setQuestionCount(n)}
                  className="flex-1 py-1.5 border-2 border-black text-xs font-black transition-all"
                  style={{ backgroundColor: questionCount === n ? "#000" : "#fff", color: questionCount === n ? "#ffd700" : "#000", boxShadow: "2px 2px 0 #000" }}>
                  {n}
                </button>
              ))}
            </div>
            {/* Composition breakdown */}
            <div className="border-2 border-black bg-zinc-50 p-3" style={{ boxShadow: "2px 2px 0 #000" }}>
              <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2" style={khFont}>
                {kh ? "ការបែងចែកសំណួរ" : "Composition Preview"}
              </div>
              {difficulty === "mixed" ? (() => {
                const easy = Math.round(questionCount * 0.4);
                const hard = Math.round(questionCount * 0.2);
                const medium = questionCount - easy - hard;
                const tf = Math.max(1, Math.round(questionCount * 0.15));
                const mcq = questionCount - tf;
                return (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{kh ? "ងាយ" : "Easy"}</span><span className="text-right font-black">{easy}Q</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />{kh ? "មធ្យម" : "Medium"}</span><span className="text-right font-black">{medium}Q</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{kh ? "លំបាក" : "Hard"}</span><span className="text-right font-black">{hard}Q</span>
                    <span className="col-span-2 border-t border-zinc-200 mt-1 pt-1" />
                    <span className="text-zinc-500">MCQ</span><span className="text-right font-black text-zinc-500">{mcq}Q</span>
                    <span className="text-zinc-500">{kh ? "ត្រូវ/មិនត្រូវ" : "True / False"}</span><span className="text-right font-black text-zinc-500">{tf}Q</span>
                  </div>
                );
              })() : (
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full inline-block ${difficulty === "easy" ? "bg-green-500" : difficulty === "medium" ? "bg-yellow-500" : "bg-red-500"}`} />
                    {difficulty === "easy" ? (kh ? "ងាយ" : "Easy") : difficulty === "medium" ? (kh ? "មធ្យម" : "Medium") : (kh ? "លំបាក" : "Hard")} · {kh ? "MCQ + ត្រូវ/មិនត្រូវ" : "MCQ + True/False"}
                  </span>
                  <span className="font-black">{questionCount}Q <span className="text-zinc-400 font-bold">/ max 20</span></span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2" style={khFont}>{kh ? "អ្នកលេងអតិបរមា" : "Max Players"}</div>
            <div className="flex gap-2">
              {[10,20,30,50,100].map((n) => <button key={n} onClick={() => setMaxPlayers(n)} className="flex-1 py-2 border-2 border-black text-xs font-black transition-all" style={{ backgroundColor: maxPlayers===n?"#000":"#fff", color: maxPlayers===n?"#ffd700":"#000", boxShadow:"2px 2px 0 #000" }}>{n}</button>)}
            </div>
          </div>
          <button onClick={createSession} disabled={phase.name==="creating"} className="w-full py-5 bg-black text-yellow-400 font-black text-xl border-2 border-black disabled:opacity-50 flex items-center justify-center gap-2" style={{ boxShadow:"5px 5px 0 #ffd700", ...khFont }}>
            {phase.name==="creating" ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
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
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1" style={khFont}>{kh ? "ហ្គេមរង់ចាំ" : "Waiting Room"}</div>
            <h1 className="text-3xl font-black" style={khFont}>{kh ? "ចូលរួម" : "Players Joining"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (confirm(kh ? "បោះបង់ហ្គេមនេះ?" : "Cancel this game session?")) { control("terminate"); setTimeout(() => setPhase({ name: "setup" }), 500); } }} disabled={controlling}
              className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white font-black border-2 border-black disabled:opacity-40" style={{ boxShadow:"3px 3px 0 #000", ...khFont }}>
              <Square size={16} />{kh ? "បោះបង់" : "Cancel"}
            </button>
            <button onClick={() => control("start")} disabled={controlling}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-black border-2 border-black disabled:opacity-40" style={{ boxShadow:"3px 3px 0 #000", ...khFont }}>
              <Play size={16} />{kh ? "ចាប់ផ្តើម" : "Start Game"}
            </button>
          </div>
        </div>
        {error && <div className="mb-6 border-2 border-red-500 bg-red-50 p-4"><p className="text-red-600 font-bold text-sm" style={khFont}>{error}</p></div>}
        <div className="border-2 border-black p-6 mb-6 bg-yellow-400 flex items-center justify-between" style={{ boxShadow:"5px 5px 0 #000" }}>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-black/60 mb-1" style={khFont}>{kh ? "លេខកូដបន្ទប់" : "Room Code"}</div>
            <div className="text-6xl font-black text-black tracking-widest">{phase.code}</div>
            <div className="text-sm text-black/60 mt-1" style={khFont}>{kh ? "ចូល: /play/" : "Join at: /play/"}{phase.code}</div>
          </div>
          <button onClick={copyCode} className="flex items-center gap-2 px-4 py-3 bg-black text-white font-black border-2 border-black" style={{ boxShadow:"3px 3px 0 #ffd700" }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? (kh?"បានចម្លង":"Copied") : (kh?"ចម្លង":"Copy")}
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-zinc-500" />
          <span className="font-black text-sm" style={khFont}>{phase.participants.length} / {maxPlayers} {kh?"នាក់":"players"}</span>
          <div className="flex-1 h-2 bg-zinc-200 border border-black"><div className="h-full bg-green-500 transition-all" style={{ width:`${Math.min((phase.participants.length/maxPlayers)*100,100)}%` }} /></div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {phase.participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-2 border-2 border-black p-2 bg-white" style={{ boxShadow:"2px 2px 0 #000" }}>
              <div className="w-8 h-8 bg-yellow-400 border border-black flex items-center justify-center font-black text-black text-sm flex-shrink-0">{p.displayName.charAt(0).toUpperCase()}</div>
              <span className="text-sm font-bold truncate" style={khFont}>{p.displayName}</span>
            </div>
          ))}
          {phase.participants.length === 0 && <div className="col-span-4 text-center py-8 text-zinc-400 font-bold" style={khFont}>{kh?"រង់ចាំអ្នកចូលរួម...":"Waiting for players to join..."}</div>}
        </div>
      </div>
    );
  }

  // ── Active / Round End — FULLSCREEN PRESENTATION ──────────────────────────
  if (phase.name === "active" || phase.name === "round_end") {
    const isActive = phase.name === "active";
    const progress = ((phase.qIndex + 1) / phase.total) * 100;
    const leaderboard = phase.leaderboard ?? [];
    const question = phase.question;
    const answers = question?.answers ?? [];
    const correctAnswerId = phase.name === "round_end" ? phase.correctAnswerId : null;

    // Seed leaderboard display from lobby participants if empty
    const displayLeaderboard: LeaderboardEntry[] = leaderboard.length > 0
      ? leaderboard
      : lobbyParticipants.map((p, i) => ({
          userId: p.userId,
          displayName: p.displayName,
          avatar: p.avatar,
          totalScore: 0,
          rank: i + 1,
          rankChange: 0,
          correctAnswers: 0,
          currentStreak: 0,
        }));

    return (
      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{
          backgroundColor: "#0d0d14",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 flex-shrink-0 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-sm">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white font-black text-xs tracking-widest">LIVE</span>
            </div>
            <span className="text-white/60 text-sm font-bold" style={khFont}>
              {kh ? `សំណួរ ${phase.qIndex + 1} / ${phase.total}` : `Question ${phase.qIndex + 1} / ${phase.total}`}
            </span>
          </div>
          {/* Progress */}
          <div className="flex-1 mx-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all duration-700 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {/* Controls */}
          <div className="flex items-center gap-2">
            {error && <span className="text-red-400 text-xs font-bold max-w-xs truncate">{error}</span>}
            <button
              onClick={() => { if (confirm(kh ? "បញ្ចប់ហ្គេម?" : "End this game session?")) control("end"); }}
              disabled={controlling}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-sm border border-red-500 disabled:opacity-40 transition-all"
            >
              <Square size={13} />{kh ? "បញ្ចប់" : "End Live"}
            </button>
            <button
              onClick={() => control("advance")}
              disabled={controlling}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm border-2 border-yellow-300 disabled:opacity-40 transition-all"
              style={{ boxShadow: "0 0 16px rgba(250,204,21,0.45)" }}
            >
              {controlling ? <Loader2 size={16} className="animate-spin" /> : <SkipForward size={16} />}
              {isActive ? (kh ? "បន្ទាប់" : "Next") : (kh ? "សំណួរបន្ទាប់" : "Next Question")}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Question + Answers (projection area) */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-y-auto">

            {/* Question number badge */}
            <div className="flex items-center gap-3 mb-5">
              <div className="px-3 py-1 bg-yellow-400 text-black font-black text-xs uppercase tracking-widest">
                {isActive ? (kh ? "សំណួរ" : "Question") : (kh ? "ចប់វគ្គ" : "Round Over")}
              </div>
              <span className="text-white/40 text-xs font-bold">{phase.qIndex + 1} / {phase.total}</span>
            </div>

            {/* Question text */}
            <div className="w-full max-w-3xl text-center mb-8">
              <div className="text-white font-black text-2xl lg:text-3xl xl:text-4xl leading-snug" style={khFont}>
                {kh && question?.questionKm ? question.questionKm : question?.questionEn}
              </div>
              {kh && question?.questionKm && question?.questionEn && (
                <div className="text-white/40 text-base font-bold mt-2">{question.questionEn}</div>
              )}
            </div>

            {/* Answer options — shown always, correct revealed only on round_end */}
            {answers.length > 0 && (
              <div className={`w-full max-w-3xl grid gap-3 ${answers.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
                {answers.map((ans, i) => {
                  const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
                  const isCorrect = correctAnswerId !== null && ans.id === correctAnswerId;
                  const isWrong = correctAnswerId !== null && ans.id !== correctAnswerId;
                  const text = kh ? (ans.answerKm || ans.answerEn) : ans.answerEn;

                  return (
                    <div
                      key={ans.id}
                      className="flex items-center gap-3 px-5 py-4 border-2 transition-all duration-500"
                      style={{
                        backgroundColor: isCorrect ? "#16a34a" : isWrong ? "rgba(255,255,255,0.04)" : style.bg,
                        borderColor: isCorrect ? "#4ade80" : isWrong ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.3)",
                        opacity: isWrong ? 0.35 : 1,
                        boxShadow: isCorrect ? "0 0 20px rgba(74,222,128,0.4)" : "none",
                      }}
                    >
                      <div className="w-9 h-9 flex items-center justify-center bg-black/20 font-black text-white text-base flex-shrink-0">
                        {style.label}
                      </div>
                      <span className="font-black text-white text-base leading-tight" style={khFont}>{text}</span>
                      {isCorrect && <span className="ml-auto text-2xl">✅</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Round end hint */}
            {!isActive && (
              <div className="mt-6 text-white/40 text-sm font-bold text-center" style={khFont}>
                {kh ? "ចុច «សំណួរបន្ទាប់» ដើម្បីបន្ត" : "Click «Next Question» to continue"}
              </div>
            )}
          </div>

          {/* Right: Live Leaderboard */}
          <div className="w-72 xl:w-80 flex flex-col border-l border-white/10 flex-shrink-0 bg-black/20">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
              <BarChart2 size={13} className="text-yellow-400" />
              <span className="text-white font-black text-xs uppercase tracking-widest" style={khFont}>
                {kh ? "ចំណាត់ថ្នាក់" : "Live Scores"}
              </span>
              <span className="ml-auto text-white/30 text-xs font-bold">{displayLeaderboard.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {displayLeaderboard.length === 0 ? (
                <div className="text-center py-10 text-white/20 text-xs font-bold" style={khFont}>
                  {kh ? "រង់ចាំ..." : "Waiting..."}
                </div>
              ) : (
                displayLeaderboard.slice(0, 20).map((entry, i) => (
                  <LiveLeaderRow
                    key={entry.userId}
                    entry={entry}
                    rank={i + 1}
                    showScore={!isActive}
                  />
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
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>{kh?"ចប់ហ្គេម":"Game Over"}</div>
          <h1 className="text-3xl font-black" style={khFont}>{kh?"លទ្ធផលចុងក្រោយ":"Final Results"}</h1>
        </div>
        <div className="border-2 border-black bg-yellow-400 p-6 mb-6" style={{ boxShadow:"5px 5px 0 #000" }}>
          <div className="text-4xl font-black text-center mb-1" style={khFont}>{phase.leaderboard.length} {kh?"អ្នកលេង":"players"}</div>
          <div className="text-center text-sm font-bold text-black/60" style={khFont}>{kh?"បានចូលរួមក្នុងហ្គេម":"participated in this game"}</div>
        </div>
        <div className="flex gap-3 mb-6">
          <button onClick={() => router.push(`/teacher/sessions/${phase.code}/analytics`)} className="flex items-center gap-2 px-5 py-3 bg-black text-white font-black border-2 border-black" style={{ boxShadow:"3px 3px 0 #ffd700", ...khFont }}>
            <BarChart2 size={14} />{kh?"មើលលទ្ធផល":"View Results"}
          </button>
          <button onClick={() => setPhase({ name: "setup" })} className="flex items-center gap-2 px-5 py-3 bg-yellow-400 text-black font-black border-2 border-black" style={{ boxShadow:"3px 3px 0 #000", ...khFont }}>
            <ChevronRight size={14} />{kh?"ហ្គេមថ្មី":"New Game"}
          </button>
        </div>
        {phase.leaderboard.length > 0 && (
          <>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3" style={khFont}>{kh?"ចំណាត់ថ្នាក់ចុងក្រោយ":"Final Leaderboard"}</div>
            <div className="flex flex-col gap-2">
              {phase.leaderboard.slice(0, 10).map((entry, i) => {
                const RANK_COLORS = ["#ffd700","#c0c0c0","#cd7f32"];
                const isTop3 = i < 3;
                return (
                  <div key={entry.userId} className="flex items-center gap-3 p-3 border-2 border-black" style={{ backgroundColor: isTop3?"#fff":"#f9fafb", boxShadow:"2px 2px 0 #000" }}>
                    <div className="w-8 h-8 flex items-center justify-center border-2 border-black font-black text-sm flex-shrink-0" style={{ backgroundColor: isTop3?RANK_COLORS[i]:"#e5e7eb" }}>
                      {isTop3 ? <Crown size={14} /> : entry.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0"
                      style={{ background: `hsl(${(entry.userId * 47) % 360}, 60%, 45%)` }}>
                      {(entry.displayName||"?").slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm truncate" style={khFont}>{entry.displayName}</div>
                      <div className="text-xs text-zinc-500">{entry.correctAnswers} {kh?"ត្រូវ":"correct"}</div>
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
