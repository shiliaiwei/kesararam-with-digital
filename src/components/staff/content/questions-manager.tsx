"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit, Trash2, ChevronDown, ChevronUp,
  CheckCircle, Circle, Image as ImageIcon, Save, X, Loader2
} from "lucide-react";

interface Answer {
  id?: number;
  answerEn: string;
  answerKm: string;
  isCorrect: boolean;
  imageUrl: string;
}

interface Question {
  id: number;
  topic_id: number;
  question_en: string;
  question_km: string;
  hint_en: string | null;
  hint_km: string | null;
  image_url: string | null;
  audio_url_en: string | null;
  audio_url_km: string | null;
  difficulty: string;
  status: string;
  sort_order: number;
  answers: Answer[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  hard: "bg-red-100 text-red-800 border-red-300",
};

const BLANK_ANSWER = (): Answer => ({ answerEn: "", answerKm: "", isCorrect: false, imageUrl: "" });

function QuestionForm({
  topicId,
  initial,
  onSave,
  onCancel,
}: {
  topicId: number;
  initial?: Question;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [questionEn, setQuestionEn] = useState(initial?.question_en ?? "");
  const [questionKm, setQuestionKm] = useState(initial?.question_km ?? "");
  const [hintEn, setHintEn] = useState(initial?.hint_en ?? "");
  const [hintKm, setHintKm] = useState(initial?.hint_km ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "medium");
  const [answers, setAnswers] = useState<Answer[]>(
    initial?.answers?.length
      ? initial.answers.map((a) => ({
          id: a.id,
          answerEn: a.answerEn,
          answerKm: a.answerKm,
          isCorrect: a.isCorrect,
          imageUrl: a.imageUrl ?? "",
        }))
      : [BLANK_ANSWER(), BLANK_ANSWER(), BLANK_ANSWER(), BLANK_ANSWER()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateAnswer = (i: number, field: keyof Answer, value: string | boolean) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  };

  const toggleCorrect = (i: number) => {
    setAnswers((prev) => prev.map((a, idx) => ({ ...a, isCorrect: idx === i ? !a.isCorrect : a.isCorrect })));
  };

  const addAnswer = () => {
    if (answers.length < 6) setAnswers((prev) => [...prev, BLANK_ANSWER()]);
  };

  const removeAnswer = (i: number) => {
    if (answers.length > 2) setAnswers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!questionEn.trim()) { setError("Question (English) is required"); return; }
    const validAnswers = answers.filter((a) => a.answerEn.trim());
    if (validAnswers.length < 2) { setError("At least 2 answers required"); return; }
    if (!validAnswers.some((a) => a.isCorrect)) { setError("Mark at least one correct answer"); return; }

    setSaving(true);
    setError("");
    try {
      const url = initial
        ? `/api/staff/topics/${topicId}/questions/${initial.id}`
        : `/api/staff/topics/${topicId}/questions`;
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionEn: questionEn.trim(),
          questionKm: questionKm.trim(),
          hintEn: hintEn.trim() || null,
          hintKm: hintKm.trim() || null,
          imageUrl: imageUrl.trim() || null,
          difficulty,
          answers: validAnswers,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-2 border-black bg-white p-5 space-y-4" style={{ boxShadow: "4px 4px 0 #000" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm uppercase">{initial ? "Edit Question" : "New Question"}</h3>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 border border-black">
          <X size={14} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-400 px-3 py-2 text-xs font-bold text-red-700">{error}</div>
      )}

      {/* Question text */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-black uppercase block mb-1">Question (English) *</label>
          <textarea
            value={questionEn}
            onChange={(e) => setQuestionEn(e.target.value)}
            rows={2}
            className="w-full border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="Enter question in English..."
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase block mb-1">Question (Khmer)</label>
          <textarea
            value={questionKm}
            onChange={(e) => setQuestionKm(e.target.value)}
            rows={2}
            className="w-full border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="Enter question in Khmer..."
          />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-black uppercase block mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border-2 border-black px-3 py-2 text-sm font-bold bg-white focus:outline-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-black uppercase block mb-1">Image URL (optional)</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Hints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-black uppercase block mb-1">Hint (English)</label>
          <input
            type="text"
            value={hintEn}
            onChange={(e) => setHintEn(e.target.value)}
            className="w-full border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="Optional hint..."
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase block mb-1">Hint (Khmer)</label>
          <input
            type="text"
            value={hintKm}
            onChange={(e) => setHintKm(e.target.value)}
            className="w-full border-2 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="Optional hint..."
          />
        </div>
      </div>

      {/* Answers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-black uppercase">Answers * (tick correct ones)</label>
          {answers.length < 6 && (
            <button
              onClick={addAnswer}
              className="text-xs font-black border-2 border-black px-2 py-1 bg-green-100 hover:bg-green-200 inline-flex items-center gap-1"
            >
              <Plus size={11} /> Add
            </button>
          )}
        </div>
        <div className="space-y-2">
          {answers.map((ans, i) => (
            <div key={i} className="flex items-start gap-2">
              {/* Correct toggle */}
              <button
                onClick={() => toggleCorrect(i)}
                className={`mt-2 shrink-0 w-6 h-6 border-2 border-black flex items-center justify-center transition-colors ${
                  ans.isCorrect ? "bg-green-400" : "bg-white hover:bg-green-50"
                }`}
                title="Mark as correct"
              >
                {ans.isCorrect ? <CheckCircle size={13} /> : <Circle size={13} />}
              </button>

              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ans.answerEn}
                  onChange={(e) => updateAnswer(i, "answerEn", e.target.value)}
                  className="border-2 border-black px-2 py-1.5 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                  placeholder={`Answer ${i + 1} (EN)`}
                />
                <input
                  type="text"
                  value={ans.answerKm}
                  onChange={(e) => updateAnswer(i, "answerKm", e.target.value)}
                  className="border-2 border-black px-2 py-1.5 text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                  placeholder={`Answer ${i + 1} (KM)`}
                />
              </div>

              {answers.length > 2 && (
                <button
                  onClick={() => removeAnswer(i)}
                  className="mt-2 shrink-0 p-1 border border-black hover:bg-red-100"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-400 mt-1">
          2 answers = True/False &nbsp;|&nbsp; 4 answers = MCQ &nbsp;|&nbsp; image answers = Image Pick
        </p>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-2 pt-2 border-t-2 border-black">
        <button
          onClick={onCancel}
          className="px-4 py-2 border-2 border-black text-sm font-black hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 border-2 border-black bg-green-400 text-sm font-black hover:shadow-[2px_2px_0_#000] disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save Question"}
        </button>
      </div>
    </div>
  );
}

export function QuestionsManager({ topicId, topicStatus }: { topicId: number; topicStatus: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/topics/${topicId}/questions`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleDelete = async (qid: number) => {
    try {
      const res = await fetch(`/api/staff/topics/${topicId}/questions/${qid}`, { method: "DELETE" });
      if (res.ok) { setDeleteConfirm(null); fetchQuestions(); }
    } catch (e) { console.error(e); }
  };

  const canEdit = topicStatus !== "pending";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg uppercase">Questions</h2>
          <p className="text-xs text-zinc-500">{questions.length} question{questions.length !== 1 ? "s" : ""} in this topic</p>
        </div>
        {canEdit && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-green-400 border-2 border-black px-4 py-2 font-black text-sm hover:shadow-[3px_3px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Plus size={15} /> Add Question
          </button>
        )}
      </div>

      {topicStatus === "pending" && (
        <div className="bg-yellow-50 border-2 border-yellow-400 px-4 py-2 text-xs font-bold text-yellow-800">
          Topic is under review. Questions are read-only until admin decision.
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <QuestionForm
          topicId={topicId}
          onSave={() => { setShowCreate(false); fetchQuestions(); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Questions list */}
      {loading ? (
        <div className="py-8 text-center text-sm text-zinc-400 font-bold">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-zinc-300">
          <p className="font-bold text-zinc-500 mb-3">No questions yet</p>
          {canEdit && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-green-400 border-2 border-black px-4 py-2 font-black text-sm hover:shadow-[2px_2px_0_#000] inline-flex items-center gap-2"
            >
              <Plus size={14} /> Add First Question
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div key={q.id}>
              {editingId === q.id ? (
                <QuestionForm
                  topicId={topicId}
                  initial={q}
                  onSave={() => { setEditingId(null); fetchQuestions(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="border-2 border-black bg-white overflow-hidden">
                  {/* Question header row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                  >
                    <span className="w-6 h-6 shrink-0 border-2 border-black bg-black text-white text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{q.question_en}</p>
                      {q.question_km && (
                        <p className="text-xs text-zinc-500 truncate">{q.question_km}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-black border ${DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">
                        {q.answers?.length ?? 0} ans
                      </span>
                      {q.image_url && <ImageIcon size={12} className="text-zinc-400" />}
                      {expandedId === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Expanded answers */}
                  {expandedId === q.id && (
                    <div className="border-t-2 border-black px-4 py-3 bg-gray-50 space-y-3">
                      {q.image_url && (
                        <img src={q.image_url} alt="" className="h-24 object-contain border border-black" />
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.answers?.map((a, ai) => (
                          <div
                            key={ai}
                            className={`flex items-center gap-2 px-3 py-2 border-2 text-sm font-bold ${
                              a.isCorrect
                                ? "border-green-500 bg-green-50 text-green-900"
                                : "border-zinc-300 bg-white text-zinc-700"
                            }`}
                          >
                            {a.isCorrect ? (
                              <CheckCircle size={13} className="text-green-600 shrink-0" />
                            ) : (
                              <Circle size={13} className="text-zinc-400 shrink-0" />
                            )}
                            <span className="truncate">{a.answerEn}</span>
                          </div>
                        ))}
                      </div>
                      {q.hint_en && (
                        <p className="text-xs text-zinc-500 italic">Hint: {q.hint_en}</p>
                      )}

                      {/* Actions */}
                      {canEdit && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => { setEditingId(q.id); setExpandedId(null); }}
                            className="px-3 py-1.5 border-2 border-black bg-yellow-100 hover:bg-yellow-200 text-xs font-black inline-flex items-center gap-1"
                          >
                            <Edit size={12} /> Edit
                          </button>
                          {deleteConfirm === q.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDelete(q.id)}
                                className="px-3 py-1.5 border-2 border-black bg-red-500 text-white text-xs font-black"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1.5 border-2 border-black bg-white text-xs font-black"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(q.id)}
                              className="px-3 py-1.5 border-2 border-black bg-red-100 hover:bg-red-200 text-xs font-black inline-flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
