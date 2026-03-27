"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Search, Edit, Trash2, Send,
  Globe, Clock, FileText, XCircle, CheckCircle,
  Image as ImageIcon, Music, RefreshCw, HelpCircle,
  ChevronDown, ChevronUp, Circle, Save, X, Loader2
} from "lucide-react";
import { TopicFormModal } from "./topic-form-modal";
import { useToast } from "@/components/ui/toast-container";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  status: string;
  question_count: number;
  created_at: string;
  updated_at: string;
  sub_group: string | null;
  created_by: number;
  updated_by?: number;
  creator_name?: string;
  updater_name?: string;
  primary_image_url?: string | null;
  audio_url_en?: string | null;
  rejection_reason?: string | null;
}

interface Answer {
  id?: number;
  answerEn: string;
  answerKm: string;
  isCorrect: boolean;
  imageUrl: string;
}

interface Question {
  id: number;
  question_en: string;
  question_km: string;
  hint_en: string | null;
  image_url: string | null;
  difficulty: string;
  answers: Answer[];
}

interface CategoryContentManagerProps {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  requiresImage?: boolean;
  requiresAudio?: boolean;
}

const SUB_GROUPS: Record<string, string[]> = {
  "road-sign":            ["Warning", "Prohibitory", "Mandatory", "Informational"],
  "road-traffic":         ["Traffic Rules", "Speed Limits", "Parking", "Overtaking"],
  "priority":             ["Intersections", "Roundabouts", "Pedestrian Crossings"],
  "driving":              ["Basic Maneuvers", "Advanced Techniques", "Defensive Driving"],
  "technical":            ["Engine", "Brakes", "Lights", "Safety Systems"],
  "loading-people-goods": ["Weight Limits", "Passenger Safety", "Cargo Securing"],
  "general-knowledge":    ["Road Safety", "Environmental", "Legal"],
  "emergency":            ["Accidents", "Breakdowns", "First Aid", "Emergency Contacts"],
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  published: <Globe        size={12} className="text-blue-600"   />,
  pending:   <Clock        size={12} className="text-yellow-600" />,
  approved:  <CheckCircle  size={12} className="text-green-600"  />,
  draft:     <FileText     size={12} className="text-gray-500"   />,
  rejected:  <XCircle      size={12} className="text-red-600"    />,
};

const STATUS_STYLE: Record<string, string> = {
  published: "bg-blue-100 text-blue-800 border border-blue-300",
  pending:   "bg-yellow-100 text-yellow-800 border border-yellow-300",
  approved:  "bg-green-100 text-green-800 border border-green-300",
  draft:     "bg-gray-100 text-gray-700 border border-gray-300",
  rejected:  "bg-red-100 text-red-800 border border-red-300",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Public", pending: "Under Review",
  approved: "Approved", draft: "Draft", rejected: "Rejected",
};

const ALL_STATUSES = ["published", "pending", "approved", "draft", "rejected"] as const;
const BLANK_ANSWER = (): Answer => ({ answerEn: "", answerKm: "", isCorrect: false, imageUrl: "" });
const DIFF_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  hard: "bg-red-100 text-red-800 border-red-300",
};

// ── Inline Question Form ──────────────────────────────────────────────────────
function QuestionForm({ topicId, initial, onSave, onCancel }: {
  topicId: number; initial?: Question; onSave: () => void; onCancel: () => void;
}) {
  const [qEn, setQEn] = useState(initial?.question_en ?? "");
  const [qKm, setQKm] = useState(initial?.question_km ?? "");
  const [hintEn, setHintEn] = useState(initial?.hint_en ?? "");
  const [imgUrl, setImgUrl] = useState(initial?.image_url ?? "");
  const [diff, setDiff] = useState(initial?.difficulty ?? "medium");
  const [answers, setAnswers] = useState<Answer[]>(
    initial?.answers?.length
      ? initial.answers.map(a => ({ id: a.id, answerEn: a.answerEn, answerKm: a.answerKm, isCorrect: a.isCorrect, imageUrl: a.imageUrl ?? "" }))
      : [BLANK_ANSWER(), BLANK_ANSWER(), BLANK_ANSWER(), BLANK_ANSWER()]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const upd = (i: number, f: keyof Answer, v: string | boolean) =>
    setAnswers(p => p.map((a, idx) => idx === i ? { ...a, [f]: v } : a));

  const save = async () => {
    if (!qEn.trim()) { setErr("Question (English) is required"); return; }
    const valid = answers.filter(a => a.answerEn.trim());
    if (valid.length < 2) { setErr("At least 2 answers required"); return; }
    if (!valid.some(a => a.isCorrect)) { setErr("Mark at least one correct answer"); return; }
    setSaving(true); setErr("");
    try {
      const url = initial
        ? `/api/staff/topics/${topicId}/questions/${initial.id}`
        : `/api/staff/topics/${topicId}/questions`;
      const res = await fetch(url, {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionEn: qEn.trim(), questionKm: qKm.trim(), hintEn: hintEn.trim() || null, imageUrl: imgUrl.trim() || null, difficulty: diff, answers: valid }),
      });
      if (res.ok) onSave();
      else { const d = await res.json(); setErr(d.error || "Failed"); }
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="border-2 border-black bg-white p-4 space-y-3" style={{ boxShadow: "3px 3px 0 #000" }}>
      <div className="flex items-center justify-between">
        <span className="font-black text-xs uppercase">{initial ? "Edit Question" : "New Question"}</span>
        <button onClick={onCancel} className="p-1 border border-black hover:bg-gray-100"><X size={12} /></button>
      </div>
      {err && <div className="bg-red-50 border border-red-400 px-3 py-1.5 text-xs font-bold text-red-700">{err}</div>}

      <div className="grid grid-cols-2 gap-2">
        <textarea value={qEn} onChange={e => setQEn(e.target.value)} rows={2}
          className="border-2 border-black px-2 py-1.5 text-sm focus:outline-none resize-none"
          placeholder="Question (English) *" />
        <textarea value={qKm} onChange={e => setQKm(e.target.value)} rows={2}
          className="border-2 border-black px-2 py-1.5 text-sm focus:outline-none resize-none"
          placeholder="Question (Khmer)" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select value={diff} onChange={e => setDiff(e.target.value)}
          className="border-2 border-black px-2 py-1.5 text-sm font-bold bg-white focus:outline-none">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input value={imgUrl} onChange={e => setImgUrl(e.target.value)}
          className="col-span-2 border-2 border-black px-2 py-1.5 text-sm focus:outline-none"
          placeholder="Image URL (optional)" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase">Answers — tick the correct one(s)</span>
          {answers.length < 6 && (
            <button onClick={() => setAnswers(p => [...p, BLANK_ANSWER()])}
              className="text-[10px] font-black border border-black px-2 py-0.5 bg-green-100 hover:bg-green-200 inline-flex items-center gap-1">
              <Plus size={10} /> Add
            </button>
          )}
        </div>
        {answers.map((a, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <button onClick={() => upd(i, "isCorrect", !a.isCorrect)}
              className={`w-6 h-6 shrink-0 border-2 border-black flex items-center justify-center ${a.isCorrect ? "bg-green-400" : "bg-white"}`}>
              {a.isCorrect ? <CheckCircle size={12} /> : <Circle size={12} />}
            </button>
            <input value={a.answerEn} onChange={e => upd(i, "answerEn", e.target.value)}
              className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none"
              placeholder={`Answer ${i + 1} (EN)`} />
            <input value={a.answerKm} onChange={e => upd(i, "answerKm", e.target.value)}
              className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none"
              placeholder={`Answer ${i + 1} (KM)`} />
            {answers.length > 2 && (
              <button onClick={() => setAnswers(p => p.filter((_, idx) => idx !== i))}
                className="p-1 border border-black hover:bg-red-100"><X size={11} /></button>
            )}
          </div>
        ))}
        <p className="text-[10px] text-zinc-400">2 answers = True/False &nbsp;|&nbsp; 4 answers = MCQ &nbsp;|&nbsp; image answers = Image Pick</p>
      </div>

      <div className="flex justify-end gap-2 pt-1 border-t border-black">
        <button onClick={onCancel} className="px-3 py-1.5 border-2 border-black text-xs font-black hover:bg-gray-100">Cancel</button>
        <button onClick={save} disabled={saving}
          className="px-3 py-1.5 border-2 border-black bg-green-400 text-xs font-black hover:shadow-[2px_2px_0_#000] disabled:opacity-50 inline-flex items-center gap-1.5">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Inline Questions Panel ────────────────────────────────────────────────────
function QuestionsPanel({ topicId, topicStatus }: { topicId: number; topicStatus: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/topics/${topicId}/questions`);
      const d = await res.json();
      setQuestions(d.questions || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [topicId]);

  useEffect(() => { load(); }, [load]);

  const del = async (qid: number) => {
    await fetch(`/api/staff/topics/${topicId}/questions/${qid}`, { method: "DELETE" });
    setDelConfirm(null); load();
  };

  const canEdit = topicStatus !== "pending";

  return (
    <div className="border-t-2 border-black bg-zinc-50 p-4 space-y-3">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <span className="font-black text-sm uppercase flex items-center gap-2">
          <HelpCircle size={15} className="text-purple-600" />
          Questions ({questions.length})
        </span>
        {canEdit && !showCreate && (
          <button onClick={() => setShowCreate(true)}
            className="bg-purple-400 border-2 border-black px-3 py-1.5 text-xs font-black hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-1.5">
            <Plus size={13} /> Add Question
          </button>
        )}
      </div>

      {topicStatus === "pending" && (
        <p className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-300 px-2 py-1">
          Under review — questions are read-only until admin decision.
        </p>
      )}

      {showCreate && (
        <QuestionForm topicId={topicId}
          onSave={() => { setShowCreate(false); load(); }}
          onCancel={() => setShowCreate(false)} />
      )}

      {loading ? (
        <p className="text-xs text-zinc-400 font-bold py-2">Loading...</p>
      ) : questions.length === 0 && !showCreate ? (
        <div className="text-center py-6 border-2 border-dashed border-zinc-300">
          <p className="text-xs font-bold text-zinc-500 mb-2">No questions yet for this topic</p>
          {canEdit && (
            <button onClick={() => setShowCreate(true)}
              className="bg-purple-400 border-2 border-black px-4 py-2 text-xs font-black hover:shadow-[2px_2px_0_#000] inline-flex items-center gap-1.5">
              <Plus size={13} /> Create First Question
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {questions.map((q, idx) => (
            <div key={q.id} className="border-2 border-black bg-white">
              {editingId === q.id ? (
                <QuestionForm topicId={topicId} initial={q}
                  onSave={() => { setEditingId(null); load(); }}
                  onCancel={() => setEditingId(null)} />
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                    <span className="w-5 h-5 shrink-0 bg-black text-white text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{q.question_en}</p>
                      {q.question_km && <p className="text-[10px] text-zinc-500 truncate">{q.question_km}</p>}
                    </div>
                    <span className={`px-1.5 py-0.5 text-[10px] font-black border ${DIFF_COLORS[q.difficulty] ?? DIFF_COLORS.medium}`}>{q.difficulty}</span>
                    <span className="text-[10px] text-zinc-400 font-bold shrink-0">{q.answers?.length ?? 0} ans</span>
                    {expandedId === q.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </div>

                  {expandedId === q.id && (
                    <div className="border-t-2 border-black px-3 py-2 bg-gray-50 space-y-2">
                      {q.image_url && <img src={q.image_url} alt="" className="h-20 object-contain border border-black" />}
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.answers?.map((a, ai) => (
                          <div key={ai} className={`flex items-center gap-1.5 px-2 py-1.5 border-2 text-xs font-bold ${a.isCorrect ? "border-green-500 bg-green-50 text-green-900" : "border-zinc-300 bg-white text-zinc-600"}`}>
                            {a.isCorrect ? <CheckCircle size={11} className="text-green-600 shrink-0" /> : <Circle size={11} className="text-zinc-400 shrink-0" />}
                            <span className="truncate">{a.answerEn}</span>
                          </div>
                        ))}
                      </div>
                      {q.hint_en && <p className="text-[10px] text-zinc-500 italic">Hint: {q.hint_en}</p>}
                      {canEdit && (
                        <div className="flex gap-1.5 pt-1">
                          <button onClick={() => { setEditingId(q.id); setExpandedId(null); }}
                            className="px-2.5 py-1 border-2 border-black bg-yellow-100 hover:bg-yellow-200 text-[10px] font-black inline-flex items-center gap-1">
                            <Edit size={11} /> Edit
                          </button>
                          {delConfirm === q.id ? (
                            <>
                              <button onClick={() => del(q.id)} className="px-2.5 py-1 border-2 border-black bg-red-500 text-white text-[10px] font-black">Confirm</button>
                              <button onClick={() => setDelConfirm(null)} className="px-2.5 py-1 border-2 border-black bg-white text-[10px] font-black">Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => setDelConfirm(q.id)}
                              className="px-2.5 py-1 border-2 border-black bg-red-100 hover:bg-red-200 text-[10px] font-black inline-flex items-center gap-1">
                              <Trash2 size={11} /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
