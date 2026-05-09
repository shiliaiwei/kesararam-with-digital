"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronUp,
  CheckCircle, Circle, Image as ImageIcon, Lock,
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

/**
 * QuestionsManager — READ-ONLY for staff.
 * Questions are managed exclusively by admins via /admin/content/questions.
 */
export function QuestionsManager({ topicId, topicStatus }: { topicId: number; topicStatus: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg uppercase">Questions</h2>
          <p className="text-xs text-zinc-500">
            {questions.length} question{questions.length !== 1 ? "s" : ""} in this topic
          </p>
        </div>
      </div>

      {/* Admin-only notice */}
      <div className="bg-zinc-100 border-2 border-zinc-400 px-4 py-3 flex items-start gap-3">
        <Lock size={16} className="text-zinc-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-zinc-700 uppercase">Questions are managed by admins only</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Questions linked to this topic are added and edited by the admin team.
            Focus on the topic content — the admin will attach the right questions.
          </p>
        </div>
      </div>

      {topicStatus === "pending" && (
        <div className="bg-yellow-50 border-2 border-yellow-400 px-4 py-2 text-xs font-bold text-yellow-800">
          Topic is under review. Questions are locked until admin decision.
        </div>
      )}

      {/* Questions list — read-only */}
      {loading ? (
        <div className="py-8 text-center text-sm text-zinc-400 font-bold">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-zinc-300">
          <p className="font-bold text-zinc-500">No questions linked yet</p>
          <p className="text-xs text-zinc-400 mt-1">The admin will add questions once this topic is approved.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="border-2 border-black bg-white overflow-hidden">
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
                  <span className="text-[10px] text-zinc-400 font-bold">{q.answers?.length ?? 0} ans</span>
                  {q.image_url && <ImageIcon size={12} className="text-zinc-400" />}
                  {expandedId === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {expandedId === q.id && (
                <div className="border-t-2 border-black px-4 py-3 bg-gray-50 space-y-3">
                  {q.image_url && (
                    <img src={q.image_url} alt="" className="h-24 object-contain border border-black" />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.answers?.map((a, ai) => (
                      <div
                        key={ai}
                        className={`flex items-center gap-2 px-3 py-2 border-2 text-sm font-bold ${a.isCorrect
                            ? "border-green-500 bg-green-50 text-green-900"
                            : "border-zinc-300 bg-white text-zinc-700"
                          }`}
                      >
                        {a.isCorrect
                          ? <CheckCircle size={13} className="text-green-600 shrink-0" />
                          : <Circle size={13} className="text-zinc-400 shrink-0" />}
                        <span className="truncate">{a.answerEn}</span>
                      </div>
                    ))}
                  </div>
                  {q.hint_en && (
                    <p className="text-xs text-zinc-500 italic">Hint: {q.hint_en}</p>
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
