"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronUp,
  CheckCircle, Circle, Image as ImageIcon, Lock, HelpCircle, Plus, Edit, Trash2
} from "lucide-react";
import { QuestionFormModal } from "@/components/admin/questions/question-form-modal";

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

export function QuestionsManager({
  topic,
  categorySlug,
}: {
  topic: {
    id: number;
    topicCode: string;
    categoryId: number;
    nameEn: string;
    nameKm: string;
    primaryImageUrl: string | null;
    status: string;
  };
  categorySlug: string;
}) {
  const topicId = topic.id;
  const topicStatus = topic.status;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  const isEditable = topicStatus === "draft" || topicStatus === "rejected";

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

  const handleDeleteQuestion = async (qid: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/staff/topics/${topicId}/questions/${qid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchQuestions();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete question");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete question");
    }
  };

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
        {isEditable && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 border-2 border-black bg-yellow-400 font-black text-xs hover:shadow-[2px_2px_0_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1 uppercase tracking-wide"
          >
            <Plus size={14} /> Add Question
          </button>
        )}
      </div>

      {/* Instructions / Notice */}
      <div className="bg-zinc-100 border-2 border-zinc-400 px-4 py-3 flex items-start gap-3">
        {isEditable ? (
          <HelpCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
        ) : (
          <Lock size={16} className="text-zinc-500 shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-xs font-black text-zinc-700 uppercase">
            {isEditable ? "Manage Q&A Questions" : "Questions are locked"}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isEditable
              ? "You can add, edit, and delete questions for this topic. Any questions you add will go through admin review and approval before becoming public."
              : "This topic is currently live or under review. Questions are locked and can only be modified if administrators send the topic back for editing."}
          </p>
        </div>
      </div>

      {topicStatus === "pending" && (
        <div className="bg-yellow-50 border-2 border-yellow-400 px-4 py-2 text-xs font-bold text-yellow-800">
          Topic is under review. Questions are locked until admin decision.
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="py-8 text-center text-sm text-zinc-400 font-bold">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-zinc-300">
          <p className="font-bold text-zinc-500">No questions linked yet</p>
          <p className="text-xs text-zinc-400 mt-1">
            {isEditable ? "Get started by adding questions for this topic." : "The admin will add questions once this topic is approved."}
          </p>
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
                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 text-[10px] font-black border uppercase tracking-wider ${
                    q.status === "published" || q.status === "approved"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : q.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : q.status === "rejected"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-zinc-100 text-zinc-800 border-zinc-300"
                  }`}>
                    {q.status || "draft"}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-black border ${DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium}`}>
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold">{q.answers?.length ?? 0} ans</span>
                  {q.image_url && <ImageIcon size={12} className="text-zinc-400" />}

                  {/* Actions for editable topics */}
                  {isEditable && (
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingQuestion(q);
                        }}
                        className="p-1 border-2 border-black bg-yellow-100 hover:bg-yellow-200 transition-all"
                        title="Edit Question"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(q.id);
                        }}
                        className="p-1 border-2 border-black bg-red-100 hover:bg-red-200 transition-all"
                        title="Delete Question"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

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

      {/* Add Modal */}
      {showAddModal && (
        <QuestionFormModal
          preSelectedTopic={{
            id: topic.id,
            topicCode: topic.topicCode,
            nameEn: topic.nameEn,
            nameKm: topic.nameKm,
            categoryId: topic.categoryId,
            primaryImageUrl: topic.primaryImageUrl || undefined,
            categorySlug: categorySlug,
          }}
          userRole="staff"
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchQuestions();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <QuestionFormModal
          initialData={editingQuestion}
          preSelectedTopic={{
            id: topic.id,
            topicCode: topic.topicCode,
            nameEn: topic.nameEn,
            nameKm: topic.nameKm,
            categoryId: topic.categoryId,
            primaryImageUrl: topic.primaryImageUrl || undefined,
            categorySlug: categorySlug,
          }}
          userRole="staff"
          onClose={() => setEditingQuestion(null)}
          onSuccess={() => {
            setEditingQuestion(null);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}
