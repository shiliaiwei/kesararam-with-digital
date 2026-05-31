"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { MediaSelector } from "../media/media-selector";

interface Answer {
  id: string;
  answerType: string;
  answerEn: string;
  answerKm: string;
  isCorrect: boolean;
  imageUrl: string;
  imageSource: "url" | "cloudinary";
  sortOrder: number;
  metadata: any;
}

interface Question {
  id: string;
  questionEn: string;
  questionKm: string;
  hintEn: string;
  hintKm: string;
  imageUrl: string;
  imageSource: "url" | "cloudinary";
  audioUrlEn: string;
  audioSourceEn: "url" | "cloudinary";
  audioUrlKm: string;
  audioSourceKm: "url" | "cloudinary";
  answers: Answer[];
  expanded: boolean;
}

interface QAFormProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

const ANSWER_TYPES = [
  { value: "text_short", label: "Short Text" },
  { value: "text_paragraph", label: "Paragraph" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "rating", label: "Rating Scale" },
  { value: "image_selection", label: "Image Selection" },
];

export function QAForm({ questions, onChange }: QAFormProps) {
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      questionEn: "",
      questionKm: "",
      hintEn: "",
      hintKm: "",
      imageUrl: "",
      imageSource: "url",
      audioUrlEn: "",
      audioSourceEn: "url",
      audioUrlKm: "",
      audioSourceKm: "url",
      answers: [],
      expanded: true,
    };
    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    onChange(questions.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    onChange(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const toggleQuestion = (questionId: string) => {
    onChange(
      questions.map((q) =>
        q.id === questionId ? { ...q, expanded: !q.expanded } : q
      )
    );
  };

  const addAnswer = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || question.answers.length >= 5) return;

    const newAnswer: Answer = {
      id: `a-${Date.now()}`,
      answerType: "multiple_choice",
      answerEn: "",
      answerKm: "",
      isCorrect: false,
      imageUrl: "",
      imageSource: "url",
      sortOrder: question.answers.length,
      metadata: null,
    };

    updateQuestion(questionId, {
      answers: [...question.answers, newAnswer],
    });
  };

  const removeAnswer = (questionId: string, answerId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      answers: question.answers.filter((a) => a.id !== answerId),
    });
  };

  const updateAnswer = (
    questionId: string,
    answerId: string,
    updates: Partial<Answer>
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      answers: question.answers.map((a) =>
        a.id === answerId ? { ...a, ...updates } : a
      ),
    });
  };

  return (
    <div className="space-y-4">
      {questions.map((question, qIndex) => (
        <div
          key={question.id}
          className="bg-white border-2 border-black"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          {/* Question Header */}
          <div className="border-b-2 border-black p-4 flex items-center justify-between bg-blue-50">
            <button
              type="button"
              onClick={() => toggleQuestion(question.id)}
              className="flex items-center gap-2 font-black text-lg"
            >
              {question.expanded ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
              Question {qIndex + 1}
            </button>
            <button
              type="button"
              onClick={() => removeQuestion(question.id)}
              className="bg-red-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Question Content */}
          {question.expanded && (
            <div className="p-4 space-y-4">
              {/* Question Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">
                    Question (English) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={question.questionEn}
                    onChange={(e) =>
                      updateQuestion(question.id, { questionEn: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
                    placeholder="Enter question in English"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Question (Khmer)</label>
                  <textarea
                    value={question.questionKm}
                    onChange={(e) =>
                      updateQuestion(question.id, { questionKm: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
                    placeholder="បញ្ចូលសំណួរជាភាសាខ្មែរ"
                  />
                </div>
              </div>

              {/* Hints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Hint (English)</label>
                  <input
                    type="text"
                    value={question.hintEn}
                    onChange={(e) =>
                      updateQuestion(question.id, { hintEn: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                    placeholder="Optional hint"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Hint (Khmer)</label>
                  <input
                    type="text"
                    value={question.hintKm}
                    onChange={(e) =>
                      updateQuestion(question.id, { hintKm: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                    placeholder="ជំនួយជាភាសាខ្មែរ"
                  />
                </div>
              </div>

              {/* Question Media */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MediaSelector
                  type="image"
                  label="Question Image"
                  value={question.imageUrl}
                  source={question.imageSource}
                  onChange={(url, source) =>
                    updateQuestion(question.id, {
                      imageUrl: url,
                      imageSource: source,
                    })
                  }
                />
                <MediaSelector
                  type="audio"
                  label="Audio (English)"
                  value={question.audioUrlEn}
                  source={question.audioSourceEn}
                  onChange={(url, source) =>
                    updateQuestion(question.id, {
                      audioUrlEn: url,
                      audioSourceEn: source,
                    })
                  }
                />
                <MediaSelector
                  type="audio"
                  label="Audio (Khmer)"
                  value={question.audioUrlKm}
                  source={question.audioSourceKm}
                  onChange={(url, source) =>
                    updateQuestion(question.id, {
                      audioUrlKm: url,
                      audioSourceKm: source,
                    })
                  }
                />
              </div>

              {/* Answers Section */}
              <div className="border-t-2 border-black pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-lg">
                    Answers ({question.answers.length}/5)
                  </h4>
                  <button
                    type="button"
                    onClick={() => addAnswer(question.id)}
                    disabled={question.answers.length >= 5}
                    className="bg-green-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Answer
                  </button>
                </div>

                {question.answers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300">
                    <p className="text-zinc-600">
                      No answers yet. Add at least one answer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {question.answers.map((answer, aIndex) => (
                      <div
                        key={answer.id}
                        className="border-2 border-black p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-bold">Answer {aIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeAnswer(question.id, answer.id)}
                            className="bg-red-400 border-2 border-black p-1 hover:shadow-[2px_2px_0_#000] transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Answer Type */}
                          <div>
                            <label className="block font-bold mb-2 text-sm">
                              Answer Type
                            </label>
                            <select
                              value={answer.answerType}
                              onChange={(e) =>
                                updateAnswer(question.id, answer.id, {
                                  answerType: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                            >
                              {ANSWER_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Answer Text */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold mb-2 text-sm">
                                Answer (English)
                              </label>
                              <input
                                type="text"
                                value={answer.answerEn}
                                onChange={(e) =>
                                  updateAnswer(question.id, answer.id, {
                                    answerEn: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                                placeholder="Answer text"
                              />
                            </div>
                            <div>
                              <label className="block font-bold mb-2 text-sm">
                                Answer (Khmer)
                              </label>
                              <input
                                type="text"
                                value={answer.answerKm}
                                onChange={(e) =>
                                  updateAnswer(question.id, answer.id, {
                                    answerKm: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                                placeholder="ចម្លើយ"
                              />
                            </div>
                          </div>

                          {/* Correct Answer Checkbox */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={answer.isCorrect}
                              onChange={(e) =>
                                updateAnswer(question.id, answer.id, {
                                  isCorrect: e.target.checked,
                                })
                              }
                              className="w-5 h-5 border-2 border-black"
                            />
                            <span className="font-bold text-sm">
                              This is the correct answer
                            </span>
                          </label>

                          {/* Answer Image (for image_selection type) */}
                          {answer.answerType === "image_selection" && (
                            <MediaSelector
                              type="image"
                              label="Answer Image"
                              value={answer.imageUrl}
                              source={answer.imageSource}
                              onChange={(url, source) =>
                                updateAnswer(question.id, answer.id, {
                                  imageUrl: url,
                                  imageSource: source,
                                })
                              }
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Question Button */}
      <button
        type="button"
        onClick={addQuestion}
        className="w-full bg-blue-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Question
      </button>
    </div>
  );
}
