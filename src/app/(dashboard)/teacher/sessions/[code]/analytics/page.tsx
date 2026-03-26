"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/context/lang-context";
import { BarChart2, Users, Target, Clock, AlertTriangle, Download, ArrowLeft } from "lucide-react";

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
  }[];
}

export default function AnalyticsPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/game/sessions/${code}/analytics`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [code]);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Rank", "Name", "Score", "Correct", "Incorrect"],
      ...data.perStudent.map((s) => [s.rank ?? "-", s.displayName, s.totalScore, s.correctAnswers, s.incorrectAnswers]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${code}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-zinc-500 font-bold text-sm mb-2 hover:text-black transition-colors">
            <ArrowLeft size={14} />
            <span style={khFont}>{kh ? "ត្រឡប់" : "Back"}</span>
          </button>
          <div className="inline-block bg-black text-yellow-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-2" style={khFont}>
            {code}
          </div>
          <h1 className="text-3xl font-black" style={khFont}>{summary.sessionName}</h1>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white font-black border-2 border-black text-sm"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <Download size={14} />
          CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: kh ? "អ្នកចូលរួម" : "Players", value: summary.totalParticipants, color: "#3b82f6" },
          { icon: Target, label: kh ? "ពិន្ទុមធ្យម" : "Avg Score", value: summary.averageScore.toLocaleString(), color: "#ffd700" },
          { icon: BarChart2, label: kh ? "ភាពត្រឹមត្រូវ" : "Accuracy", value: `${summary.averageAccuracy}%`, color: "#22c55e" },
          { icon: Clock, label: kh ? "សំណួរ" : "Questions", value: summary.totalQuestions, color: "#f97316" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="border-2 border-black p-4" style={{ boxShadow: "3px 3px 0 #000" }}>
            <Icon size={16} style={{ color }} className="mb-2" />
            <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
            <div className="text-xs font-bold text-zinc-500 mt-1" style={khFont}>{label}</div>
          </div>
        ))}
      </div>

      {/* Per-question */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={14} className="text-zinc-500" />
          <span className="font-black text-sm uppercase tracking-widest text-zinc-500" style={khFont}>
            {kh ? "ការវិភាគម្តងៗ" : "Per Question"}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {perQuestion.map((q) => {
            const pct = Math.round(q.correctRate * 100);
            return (
              <div
                key={q.questionId}
                className="border-2 border-black p-4"
                style={{ boxShadow: "2px 2px 0 #000", backgroundColor: q.needsReview ? "#fff7ed" : "#fff" }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-black text-zinc-400 flex-shrink-0">Q{q.index + 1}</span>
                    <span className="text-sm font-bold truncate" style={khFont}>
                      {kh ? q.questionKm || q.questionEn : q.questionEn}
                    </span>
                    {q.needsReview && (
                      <AlertTriangle size={12} className="text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                  <span className="font-black text-sm flex-shrink-0" style={{ color: pct >= 70 ? "#22c55e" : pct >= 40 ? "#f97316" : "#ef4444" }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-200 border border-black">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 70 ? "#22c55e" : pct >= 40 ? "#f97316" : "#ef4444",
                    }}
                  />
                </div>
                <div className="text-xs text-zinc-400 mt-1">{q.totalAnswers} {kh ? "ចម្លើយ" : "answers"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-student */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-zinc-500" />
          <span className="font-black text-sm uppercase tracking-widest text-zinc-500" style={khFont}>
            {kh ? "ការវិភាគតាមសិស្ស" : "Per Student"}
          </span>
        </div>
        <div className="border-2 border-black" style={{ boxShadow: "3px 3px 0 #000" }}>
          <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-widest" style={khFont}>
            <span>{kh ? "ចំណាត់" : "Rank"}</span>
            <span className="col-span-2">{kh ? "ឈ្មោះ" : "Name"}</span>
            <span>{kh ? "ពិន្ទុ" : "Score"}</span>
            <span>{kh ? "ត្រូវ" : "Correct"}</span>
          </div>
          {perStudent.map((s, i) => (
            <div
              key={s.userId}
              className="grid grid-cols-5 gap-2 px-4 py-3 border-t border-black/10 text-sm"
              style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}
            >
              <span className="font-black text-zinc-400">#{s.rank ?? i + 1}</span>
              <span className="col-span-2 font-bold truncate" style={khFont}>{s.displayName}</span>
              <span className="font-black tabular-nums">{s.totalScore.toLocaleString()}</span>
              <span className="font-bold text-green-600">{s.correctAnswers}/{s.correctAnswers + s.incorrectAnswers}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
