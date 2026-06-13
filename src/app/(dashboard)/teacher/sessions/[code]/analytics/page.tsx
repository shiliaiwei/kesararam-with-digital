"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import {
  BarChart2, Users, Target, Clock, AlertTriangle,
  Download, ArrowLeft, FileText, Crown, TrendingUp,
  CheckCircle, XCircle, Zap, Medal, ChevronDown, ChevronRight, ListChecks
} from "lucide-react";

interface Analytics {
  summary: {
    totalParticipants: number;
    averageScore: number;
    averageAccuracy: number;
    totalQuestions: number;
    sessionName: string;
    startedAt: string | null;
    endedAt: string | null;
  };
  perQuestion: {
    index: number;
    questionId: number;
    questionEn: string;
    questionKm: string;
    correctRate: number;
    averageRemainingMs: number;
    needsReview: boolean;
    totalAnswers: number;
  }[];
  perStudent: {
    userId: number;
    displayName: string;
    avatar: string | null;
    totalScore: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageRemainingMs: number;
    rank: number | null;
    answers: StudentAnswer[];
  }[];
}

interface StudentAnswer {
  index: number;
  questionId: number;
  questionEn: string;
  questionKm: string;
  answered: boolean;
  isCorrect: boolean;
  chosenAnswerEn: string | null;
  chosenAnswerKm: string | null;
  correctAnswerEn: string | null;
  correctAnswerKm: string | null;
  remainingTimeMs: number;
  points: number;
}

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) return <span className="font-black text-zinc-400 text-sm">#{rank}</span>;
  return (
    <div className="w-7 h-7 flex items-center justify-center font-black text-xs"
      style={{ backgroundColor: RANK_COLORS[rank - 1], color: rank === 1 ? "#000" : "#fff" }}>
      {rank === 1 ? <Crown size={13} /> : rank === 2 ? <Medal size={13} /> : <Medal size={13} />}
    </div>
  );
}

export default function AnalyticsPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"questions" | "students">("questions");
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/game/sessions/${code}/analytics`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [code]);

  // ── CSV Export ─────────────────────────────────────────────────────────────
  function exportCSV() {
    if (!data) return;
    const { summary, perQuestion, perStudent } = data;

    const lines: string[] = [];

    // Session summary
    lines.push("SESSION SUMMARY");
    lines.push(`Code,${code}`);
    lines.push(`Session,${summary.sessionName ?? code}`);
    lines.push(`Players,${summary.totalParticipants}`);
    lines.push(`Avg Score,${summary.averageScore}`);
    lines.push(`Avg Accuracy,${summary.averageAccuracy}%`);
    lines.push(`Total Questions,${summary.totalQuestions}`);
    lines.push(`Started,${summary.startedAt ? new Date(summary.startedAt).toLocaleString() : "-"}`);
    lines.push(`Ended,${summary.endedAt ? new Date(summary.endedAt).toLocaleString() : "-"}`);
    lines.push("");

    // Per-student
    lines.push("STUDENT PERFORMANCE");
    lines.push("Rank,Name,Score,Correct,Incorrect,Accuracy %,Avg Speed (ms)");
    for (const s of perStudent) {
      const total = s.correctAnswers + s.incorrectAnswers;
      const acc = total > 0 ? Math.round((s.correctAnswers / total) * 100) : 0;
      lines.push([
        s.rank ?? "-",
        `"${s.displayName}"`,
        s.totalScore,
        s.correctAnswers,
        s.incorrectAnswers,
        `${acc}%`,
        s.averageRemainingMs,
      ].join(","));
    }
    lines.push("");

    // Per-question
    lines.push("QUESTION ANALYSIS");
    lines.push("Q#,Question,Correct Rate,Total Answers,Needs Review,Avg Remaining (ms)");
    for (const q of perQuestion) {
      lines.push([
        `Q${q.index + 1}`,
        `"${q.questionEn.replace(/"/g, "'")}"`,
        `${Math.round(q.correctRate * 100)}%`,
        q.totalAnswers,
        q.needsReview ? "YES" : "no",
        q.averageRemainingMs,
      ].join(","));
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${code}-analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── PDF Export (print) ─────────────────────────────────────────────────────
  function exportPDF() {
    if (!data) return;
    const { summary, perQuestion, perStudent } = data;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Session ${code} — Analytics</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; color: #111; background: #fff; padding: 32px; font-size: 12px; }
  h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
  h2 { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin: 24px 0 10px; border-bottom: 2px solid #000; padding-bottom: 4px; }
  .badge { display: inline-block; background: #000; color: #ffd700; font-weight: 900; font-size: 11px; padding: 2px 8px; letter-spacing: 0.1em; margin-bottom: 8px; }
  .meta { color: #666; font-size: 11px; margin-bottom: 20px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat { border: 2px solid #000; padding: 12px; }
  .stat-val { font-size: 24px; font-weight: 900; }
  .stat-lbl { font-size: 10px; font-weight: 700; color: #666; text-transform: uppercase; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #000; color: #fff; font-weight: 900; font-size: 10px; text-transform: uppercase; padding: 6px 8px; text-align: left; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
  tr:nth-child(even) td { background: #f9fafb; }
  .bar-wrap { background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 3px; }
  .bar { height: 6px; border-radius: 3px; }
  .tag-review { background: #fef3c7; color: #92400e; font-size: 9px; font-weight: 700; padding: 1px 5px; border: 1px solid #fbbf24; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<div class="badge">${code}</div>
<h1>${summary.sessionName ?? `Session ${code}`}</h1>
<div class="meta">
  ${summary.startedAt ? `Started: ${new Date(summary.startedAt).toLocaleString()}` : ""}
  ${summary.endedAt ? ` &nbsp;·&nbsp; Ended: ${new Date(summary.endedAt).toLocaleString()}` : ""}
</div>

<div class="stats">
  <div class="stat"><div class="stat-val" style="color:#3b82f6">${summary.totalParticipants}</div><div class="stat-lbl">Players</div></div>
  <div class="stat"><div class="stat-val" style="color:#eab308">${summary.averageScore}</div><div class="stat-lbl">Avg Score</div></div>
  <div class="stat"><div class="stat-val" style="color:#22c55e">${summary.averageAccuracy}%</div><div class="stat-lbl">Accuracy</div></div>
  <div class="stat"><div class="stat-val" style="color:#f97316">${summary.totalQuestions}</div><div class="stat-lbl">Questions</div></div>
</div>

<h2>Student Performance</h2>
<table>
  <thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th><th>Avg Speed</th></tr></thead>
  <tbody>
    ${perStudent.map((s) => {
      const total = s.correctAnswers + s.incorrectAnswers;
      const acc = total > 0 ? Math.round((s.correctAnswers / total) * 100) : 0;
      return `<tr>
        <td><strong>#${s.rank ?? "-"}</strong></td>
        <td>${s.displayName}</td>
        <td><strong>${s.totalScore.toLocaleString()}</strong></td>
        <td style="color:#16a34a">${s.correctAnswers}</td>
        <td style="color:#dc2626">${s.incorrectAnswers}</td>
        <td>${acc}%</td>
        <td>${(s.averageRemainingMs / 1000).toFixed(1)}s left</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>

<h2>Question Analysis</h2>
<table>
  <thead><tr><th>#</th><th>Question</th><th>Correct Rate</th><th>Answers</th><th>Status</th></tr></thead>
  <tbody>
    ${perQuestion.map((q) => {
      const pct = Math.round(q.correctRate * 100);
      const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
      return `<tr>
        <td><strong>Q${q.index + 1}</strong></td>
        <td>${q.questionEn}</td>
        <td>
          <strong style="color:${color}">${pct}%</strong>
          <div class="bar-wrap"><div class="bar" style="width:${pct}%;background:${color}"></div></div>
        </td>
        <td>${q.totalAnswers}</td>
        <td>${q.needsReview ? '<span class="tag-review">⚠ Review</span>' : '✓'}</td>
      </tr>`;
    }).join("")}
  </tbody>
</table>

<div style="margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;color:#999;font-size:10px;">
  Generated by KWD · ${new Date().toLocaleString()}
</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !data) return (
    <div className="text-red-600 font-bold p-4 border-2 border-red-500">{error || "No data"}</div>
  );

  const { summary, perQuestion, perStudent } = data;
  const topScore = perStudent[0]?.totalScore ?? 0;

  return (
    <div className="max-w-4xl" ref={printRef}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-zinc-500 font-bold text-sm mb-2 hover:text-black transition-colors">
            <ArrowLeft size={14} />
            <span style={khFont}>{kh ? "ត្រឡប់" : "Back"}</span>
          </button>
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-2">{code}</div>
          <h1 className="text-3xl font-black" style={khFont}>{summary.sessionName ?? `Session ${code}`}</h1>
          {(summary.startedAt || summary.endedAt) && (
            <div className="text-xs text-zinc-400 font-bold mt-1">
              {summary.startedAt && new Date(summary.startedAt).toLocaleString()}
              {summary.endedAt && ` → ${new Date(summary.endedAt).toLocaleString()}`}
            </div>
          )}
        </div>
        {/* Export buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white font-black border-2 border-black text-sm hover:bg-zinc-800 transition-all"
            style={{ boxShadow: "3px 3px 0 #ffd700" }}>
            <Download size={14} />
            CSV
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 text-black font-black border-2 border-black text-sm hover:bg-yellow-300 transition-all"
            style={{ boxShadow: "3px 3px 0 #000" }}>
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Users, label: kh ? "អ្នកចូលរួម" : "Players", value: summary.totalParticipants, color: "#3b82f6" },
          { icon: Target, label: kh ? "ពិន្ទុមធ្យម" : "Avg Score", value: summary.averageScore.toLocaleString(), color: "#eab308" },
          { icon: BarChart2, label: kh ? "ភាពត្រឹមត្រូវ" : "Accuracy", value: `${summary.averageAccuracy}%`, color: "#22c55e" },
          { icon: Clock, label: kh ? "សំណួរ" : "Questions", value: summary.totalQuestions, color: "#f97316" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="border-2 border-black p-4 bg-white" style={{ boxShadow: "3px 3px 0 #000" }}>
            <Icon size={16} style={{ color }} className="mb-2" />
            <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
            <div className="text-xs font-bold text-zinc-500 mt-1" style={khFont}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-2 border-black w-fit" style={{ boxShadow: "3px 3px 0 #000" }}>
        {(["questions", "students"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2.5 font-black text-sm uppercase tracking-widest transition-all"
            style={{ backgroundColor: activeTab === tab ? "#000" : "#fff", color: activeTab === tab ? "#ffd700" : "#000" }}>
            {tab === "questions" ? (kh ? "សំណួរ" : "Questions") : (kh ? "សិស្ស" : "Students")}
          </button>
        ))}
      </div>

      {/* ── Per Question ── */}
      {activeTab === "questions" && (
        <div className="flex flex-col gap-2">
          {perQuestion.map((q) => {
            const pct = Math.round(q.correctRate * 100);
            const barColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f97316" : "#ef4444";
            return (
              <div key={q.questionId} className="border-2 border-black p-4 bg-white"
                style={{ boxShadow: "2px 2px 0 #000", backgroundColor: q.needsReview ? "#fff7ed" : "#fff" }}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-xs font-black text-zinc-400 flex-shrink-0 mt-0.5">Q{q.index + 1}</span>
                    <span className="text-sm font-bold leading-snug" style={khFont}>
                      {kh ? q.questionKm || q.questionEn : q.questionEn}
                    </span>
                    {q.needsReview && <AlertTriangle size={13} className="text-orange-500 flex-shrink-0 mt-0.5" />}
                  </div>
                  <span className="font-black text-base flex-shrink-0" style={{ color: barColor }}>{pct}%</span>
                </div>
                <div className="h-2 bg-zinc-200 border border-black/20 mb-1.5">
                  <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-bold">
                  <span>{q.totalAnswers} {kh ? "ចម្លើយ" : "answers"}</span>
                  {q.averageRemainingMs > 0 && (
                    <span className="flex items-center gap-1">
                      <Zap size={10} />
                      {(q.averageRemainingMs / 1000).toFixed(1)}s {kh ? "នៅសល់" : "avg left"}
                    </span>
                  )}
                  {q.needsReview && (
                    <span className="text-orange-500">{kh ? "ត្រូវការពិនិត្យ" : "Needs review"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Per Student ── */}
      {activeTab === "students" && (
        <div className="flex flex-col gap-3">
          {perStudent.map((s, i) => {
            const rank = s.rank ?? i + 1;
            const total = s.correctAnswers + s.incorrectAnswers;
            const acc = total > 0 ? Math.round((s.correctAnswers / total) * 100) : 0;
            const scoreBarPct = topScore > 0 ? Math.round((s.totalScore / topScore) * 100) : 0;
            const initials = (s.displayName || "?").slice(0, 2).toUpperCase();
            const isTop3 = rank <= 3;

            return (
              <div key={s.userId} className="border-2 border-black p-4 bg-white"
                style={{ boxShadow: "2px 2px 0 #000", borderLeftWidth: isTop3 ? 4 : 2, borderLeftColor: isTop3 ? RANK_COLORS[rank - 1] : "#000" }}>
                <div className="flex items-center gap-3 mb-3">
                  {/* Rank */}
                  <RankBadge rank={rank} />
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                    style={{ background: `hsl(${(s.userId * 47) % 360}, 55%, 45%)` }}>
                    {initials}
                  </div>
                  {/* Name + score */}
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm truncate" style={khFont}>{s.displayName}</div>
                    <div className="text-xs text-zinc-400 font-bold">{s.totalScore.toLocaleString()} pts</div>
                  </div>
                  {/* Accuracy badge */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-lg tabular-nums" style={{ color: acc >= 70 ? "#22c55e" : acc >= 40 ? "#f97316" : "#ef4444" }}>
                      {acc}%
                    </div>
                    <div className="text-xs text-zinc-400 font-bold">{kh ? "ភាពត្រឹមត្រូវ" : "accuracy"}</div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-1.5 bg-zinc-100 border border-black/10 mb-2">
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${scoreBarPct}%`, backgroundColor: isTop3 ? RANK_COLORS[rank - 1] : "#3b82f6" }} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1 font-bold text-green-600">
                    <CheckCircle size={11} />
                    {s.correctAnswers} {kh ? "ត្រូវ" : "correct"}
                  </div>
                  <div className="flex items-center gap-1 font-bold text-red-500">
                    <XCircle size={11} />
                    {s.incorrectAnswers} {kh ? "មិនត្រូវ" : "wrong"}
                  </div>
                  <div className="flex items-center gap-1 font-bold text-zinc-400">
                    <Zap size={11} />
                    {s.averageRemainingMs > 0 ? `${(s.averageRemainingMs / 1000).toFixed(1)}s` : "—"}
                  </div>
                </div>

                {/* ── Per-question answer breakdown (expandable) ── */}
                {(s.answers?.length ?? 0) > 0 && (
                  <>
                    <button
                      onClick={() => setExpandedStudent(expandedStudent === s.userId ? null : s.userId)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border-2 border-black bg-zinc-50 hover:bg-yellow-50 font-black text-xs uppercase tracking-wider transition-colors"
                      style={{ boxShadow: "2px 2px 0 #000", ...khFont }}
                    >
                      <ListChecks size={13} />
                      {expandedStudent === s.userId
                        ? (kh ? "លាក់ចម្លើយ" : "Hide answers")
                        : (kh ? "មើលចម្លើយម្ដងមួយៗ" : "View each answer")}
                      {expandedStudent === s.userId ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>

                    {expandedStudent === s.userId && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {s.answers.map((a) => {
                          const chosen = kh ? (a.chosenAnswerKm || a.chosenAnswerEn) : (a.chosenAnswerEn || a.chosenAnswerKm);
                          const correct = kh ? (a.correctAnswerKm || a.correctAnswerEn) : (a.correctAnswerEn || a.correctAnswerKm);
                          const qText = kh ? (a.questionKm || a.questionEn) : (a.questionEn || a.questionKm);
                          return (
                            <div key={a.questionId}
                              className="border-2 border-black p-2.5"
                              style={{ background: !a.answered ? "#f4f4f5" : a.isCorrect ? "#f0fdf4" : "#fef2f2", borderLeftWidth: 5, borderLeftColor: !a.answered ? "#a1a1aa" : a.isCorrect ? "#22c55e" : "#ef4444" }}>
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-black text-zinc-400 mt-0.5 flex-shrink-0">Q{a.index + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold leading-snug" style={khFont}>{qText}</div>
                                  {!a.answered ? (
                                    <div className="mt-1 text-[11px] font-bold text-zinc-400" style={khFont}>{kh ? "មិនបានឆ្លើយ" : "No answer"}</div>
                                  ) : (
                                    <div className="mt-1 flex flex-col gap-0.5 text-[11px] font-bold" style={khFont}>
                                      <div className="flex items-center gap-1" style={{ color: a.isCorrect ? "#16a34a" : "#dc2626" }}>
                                        {a.isCorrect ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                        <span className="text-zinc-500">{kh ? "ជ្រើស៖" : "Picked:"}</span>
                                        <span>{chosen ?? "—"}</span>
                                      </div>
                                      {!a.isCorrect && (
                                        <div className="flex items-center gap-1 text-green-700">
                                          <CheckCircle size={11} />
                                          <span className="text-zinc-500">{kh ? "ត្រឹមត្រូវ៖" : "Correct:"}</span>
                                          <span>{correct ?? "—"}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {a.answered && a.isCorrect && <div className="text-[11px] font-black text-green-600">+{a.points}</div>}
                                  {a.answered && a.remainingTimeMs > 0 && (
                                    <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-0.5 justify-end">
                                      <Zap size={9} />{(a.remainingTimeMs / 1000).toFixed(1)}s
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
