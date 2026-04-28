"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";

interface QuestionFormProps {
  question?: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function QuestionForm({ question, onClose, onSave }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    categoryId: "",
    topicId: question?.topicId?.toString() || "",
    questionType: question?.questionType || "mcq",
    questionEn: question?.questionEn || "",
    questionKm: question?.questionKm || "",
    hintEn: question?.hintEn || "",
    hintKm: question?.hintKm || "",
    difficulty: question?.difficulty || "medium",
    timeLimit: question?.timeLimit?.toString() || "20",
    pointsMultiplier: question?.pointsMultiplier?.toString() || "1",
    status: question?.status || "published",
  });
  
  // Default answers based on question type
  const [answers, setAnswers] = useState<any[]>(question?.answers || [
    { answerEn: "", answerKm: "", isCorrect: true },
    { answerEn: "", answerKm: "", isCorrect: false },
    { answerEn: "", answerKm: "", isCorrect: false },
    { answerEn: "", answerKm: "", isCorrect: false },
  ]);

  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data || []);
        setLoadingCats(false);
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
        setLoadingCats(false);
      });
  }, []);

  // Load topics when category changes or initially if topicId exists
  useEffect(() => {
    const fetchTopics = async (catId?: string) => {
      setLoadingTopics(true);
      let url = "/api/public/topics?status=published";
      if (catId) url += `&categoryId=${catId}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        setTopics(data.topics || []);
      } catch (err) {
        console.error("Failed to load topics", err);
      } finally {
        setLoadingTopics(false);
      }
    };

    if (formData.categoryId) {
      fetchTopics(formData.categoryId);
    } else {
      fetchTopics();
    }
  }, [formData.categoryId]);

  // Adjust answers when question type changes
  useEffect(() => {
    if (question && question.questionType === formData.questionType) return; // Retain existing on initial load
    
    if (formData.questionType === "true_false") {
      setAnswers([
        { answerEn: "True", answerKm: "ពិត", isCorrect: true },
        { answerEn: "False", answerKm: "ខុស", isCorrect: false },
      ]);
    } else if (["mcq", "guess_pic", "multi_select", "pin_answer"].includes(formData.questionType)) {
      setAnswers([
        { answerEn: "", answerKm: "", isCorrect: true },
        { answerEn: "", answerKm: "", isCorrect: false },
        { answerEn: "", answerKm: "", isCorrect: false },
        { answerEn: "", answerKm: "", isCorrect: false },
      ]);
    } else if (["type_answer", "puzzle", "slider"].includes(formData.questionType)) {
      setAnswers([
        { answerEn: "", answerKm: "", isCorrect: true },
      ]);
    }
  }, [formData.questionType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (index: number, field: string, value: any) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      if (field === "isCorrect" && formData.questionType !== "multi_select") {
        // Single correct answer types
        newAnswers.forEach((a, i) => { a.isCorrect = (i === index); });
      } else {
        newAnswers[index] = { ...newAnswers[index], [field]: value };
      }
      return newAnswers;
    });
  };

  const addAnswer = () => {
    setAnswers(prev => [...prev, { answerEn: "", answerKm: "", isCorrect: false }]);
  };

  const removeAnswer = (index: number) => {
    setAnswers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    
    try {
      // Validate answers
      if (answers.length === 0) {
        throw new Error("You must provide at least one answer.");
      }
      if (!answers.some(a => a.isCorrect)) {
        throw new Error("You must select at least one correct answer.");
      }
      
      const payload = {
        ...formData,
        timeLimit: parseInt(formData.timeLimit, 10),
        pointsMultiplier: parseInt(formData.pointsMultiplier, 10),
        answers: answers.map((a, i) => ({
          ...a,
          answerType: formData.questionType === "guess_pic" || formData.questionType === "pin_answer" ? "image_selection" : "multiple_choice",
          isCorrect: formData.questionType === "puzzle" || formData.questionType === "type_answer" || formData.questionType === "slider" ? true : a.isCorrect,
          sortOrder: i
        }))
      };
      
      await onSave(payload);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setSaving(false); // Only set false on error, parent unmounts on success
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] w-full max-w-3xl max-h-[90vh] flex flex-col">
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm">
              {error}
            </div>
          )}
          
          <form id="question-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  Category Filter
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                  disabled={loadingCats}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.titleEn}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  Topic <span className="text-red-500">*</span>
                </label>
                <select
                  name="topicId"
                  value={formData.topicId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                  disabled={loadingTopics}
                >
                  <option value="" disabled>
                    {loadingTopics ? "Loading topics..." : "Select a linked topic"}
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameEn || t.name_en} ({t.topicCode || t.topic_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  Question Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                >
                  <option value="mcq">Quiz</option>
                  <option value="true_false">True or false</option>
                  <option value="type_answer">Type answer</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="slider">Slider</option>
                  <option value="pin_answer">Pin answer</option>
                  <option value="guess_pic">Guess Picture</option>
                  <option value="multi_select">Multi-Select</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  Time Limit <span className="text-red-500">*</span>
                </label>
                <select
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                >
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="20">20 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="90">1 minute 30 seconds</option>
                  <option value="120">2 minutes</option>
                  <option value="240">4 minutes</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-black uppercase tracking-wider">
                  Points <span className="text-red-500">*</span>
                </label>
                <select
                  name="pointsMultiplier"
                  value={formData.pointsMultiplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:ring-2 ring-black font-medium text-sm"
                >
                  <option value="1">Standard</option>
                  <option value="2">Double points</option>
                  <option value="0">No points</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-black uppercase tracking-wider">
                Question <span className="text-red-500">*</span>
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

            {/* Answers Section */}
            <div className="space-y-3 bg-zinc-50 p-4 border-2 border-black">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-black text-black uppercase tracking-wider">
                    Answers <span className="text-red-500">*</span>
                  </label>
                  {formData.questionType === "puzzle" && (
                    <p className="text-xs text-zinc-500 mt-1">Add items in the correct order (top to bottom).</p>
                  )}
                  {formData.questionType === "type_answer" && (
                    <p className="text-xs text-zinc-500 mt-1">Add all acceptable variations of the correct answer.</p>
                  )}
                  {formData.questionType === "slider" && (
                    <p className="text-xs text-zinc-500 mt-1">Enter the exact numeric value.</p>
                  )}
                </div>
                {formData.questionType !== "true_false" && formData.questionType !== "slider" && (
                  <button type="button" onClick={addAnswer} className="text-xs font-bold bg-white border border-black px-2 py-1 flex items-center gap-1 hover:bg-gray-100 shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                    <Plus size={12} /> Add Option
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {answers.map((answer, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {!["type_answer", "puzzle", "slider"].includes(formData.questionType) && (
                      <div className="flex-shrink-0 pt-3">
                        <input
                          type={formData.questionType === "multi_select" ? "checkbox" : "radio"}
                          name="correctAnswer"
                          checked={answer.isCorrect}
                          onChange={(e) => handleAnswerChange(index, "isCorrect", e.target.checked)}
                          className="w-5 h-5 cursor-pointer accent-purple-600"
                          title="Mark as correct"
                        />
                      </div>
                    )}
                    
                    {formData.questionType === "puzzle" && (
                      <div className="flex-shrink-0 pt-2 w-8 h-8 flex items-center justify-center font-bold bg-purple-200 border-2 border-black rounded-full text-sm shadow-[2px_2px_0_#000]">
                        {index + 1}
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <input
                        type={formData.questionType === "slider" ? "number" : "text"}
                        value={answer.answerEn}
                        onChange={(e) => handleAnswerChange(index, "answerEn", e.target.value)}
                        required
                        placeholder={
                          formData.questionType === "type_answer" ? "Acceptable answer variation..." :
                          formData.questionType === "slider" ? "Numeric Value" :
                          `Option ${index + 1} (English)`
                        }
                        className={`w-full px-3 py-2 border-2 border-black focus:outline-none text-sm font-medium ${answer.isCorrect || ["type_answer", "puzzle", "slider"].includes(formData.questionType) ? 'bg-green-100' : 'bg-white'}`}
                        disabled={formData.questionType === "true_false"}
                      />
                      <input
                        type={formData.questionType === "slider" ? "number" : "text"}
                        value={answer.answerKm}
                        onChange={(e) => handleAnswerChange(index, "answerKm", e.target.value)}
                        placeholder={
                          formData.questionType === "type_answer" ? "Acceptable answer variation (Khmer)..." :
                          formData.questionType === "slider" ? "Numeric Value (Khmer)" :
                          `Option ${index + 1} (Khmer)`
                        }
                        className={`w-full px-3 py-2 border-2 border-black focus:outline-none text-sm ${answer.isCorrect || ["type_answer", "puzzle", "slider"].includes(formData.questionType) ? 'bg-green-100' : 'bg-white'}`}
                        style={{ fontFamily: "Siemreap, sans-serif" }}
                        disabled={formData.questionType === "true_false"}
                      />
                    </div>
                    {formData.questionType !== "true_false" && answers.length > (formData.questionType === "type_answer" ? 1 : 2) && formData.questionType !== "slider" && (
                      <button type="button" onClick={() => removeAnswer(index)} className="p-2 border-2 border-black bg-red-100 text-red-600 hover:bg-red-200 mt-2 shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
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
                  <option value="easy">Easy (100 pts)</option>
                  <option value="medium">Medium (200 pts)</option>
                  <option value="hard">Hard (300 pts)</option>
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
            disabled={saving || loadingCats}
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
