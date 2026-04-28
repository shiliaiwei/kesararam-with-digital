"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface QuestionFormProps {
  question?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function QuestionForm({ question, onClose, onSave }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    topicId: question?.topicId?.toString() || "",
    questionType: question?.questionType || "quiz",
    questionEn: question?.questionEn || "",
    questionKm: question?.questionKm || "",
    hintEn: question?.hintEn || "",
    hintKm: question?.hintKm || "",
    difficulty: question?.difficulty || "medium",
    status: question?.status || "published",
  });
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch only published (public) topics
    fetch("/api/public/topics?status=published")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data.topics || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load topics", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-amber-400">
          <h2 className="text-xl font-black text-black">
            {question ? "Edit Question" : "Add New Question"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 border-black bg-red-400 flex items-center justify-center hover:bg-red-300 transition-colors shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <X size={16} className="text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 font-bold animate-pulse">Loading topics...</div>
          ) : (
            <form id="question-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider">
                    Topic (Public Only) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="topicId"
                    value={formData.topicId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                  >
                    <option value="" disabled>Select a linked topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameEn} ({t.topicCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider">
                    Question Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="questionType"
                    value={formData.questionType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm capitalize"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="flashcard">Flashcard</option>
                    <option value="challenge">Challenge</option>
                    <option value="practice">Practice</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  Question (English) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="questionEn"
                  value={formData.questionEn}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                  placeholder="E.g., What does this sign mean?"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  Question (Khmer)
                </label>
                <textarea
                  name="questionKm"
                  value={formData.questionKm}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black text-sm"
                  style={{ fontFamily: "Siemreap, sans-serif" }}
                  placeholder="E.g., តើសញ្ញានេះមានន័យដូចម្តេច?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider">
                    Hint (English)
                  </label>
                  <input
                    type="text"
                    name="hintEn"
                    value={formData.hintEn}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider">
                    Hint (Khmer)
                  </label>
                  <input
                    type="text"
                    name="hintKm"
                    value={formData.hintKm}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black text-sm"
                    style={{ fontFamily: "Siemreap, sans-serif" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm capitalize"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-black text-black uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm capitalize"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-black bg-zinc-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border-2 border-black font-bold text-sm bg-white hover:bg-gray-100 transition-colors shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="question-form"
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-sm bg-blue-400 hover:bg-blue-300 transition-colors shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
