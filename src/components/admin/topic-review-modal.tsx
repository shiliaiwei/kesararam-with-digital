"use client";

import { useState, useEffect } from "react";
import { X, Check, XCircle, Play, Pause } from "lucide-react";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  description_en: string;
  description_km: string;
  primary_image_url: string;
  sub_group: string;
  law_reference: string;
  audio_url_en: string;
  audio_url_km: string;
  category_name: string;
  creator_name: string;
  question_count: number;
}

interface Question {
  id: number;
  question_en: string;
  question_km: string;
  hint_en: string;
  hint_km: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  answer_en: string;
  answer_km: string;
  is_correct: boolean;
}

interface TopicReviewModalProps {
  topic: Topic;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function TopicReviewModal({
  topic,
  onClose,
  onApprove,
  onReject,
}: TopicReviewModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [topic.id]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/topics/${topic.id}`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    onReject(rejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-white border-4 border-black max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-yellow-400 border-b-4 border-black p-6 flex items-center justify-between z-10">
          <div>
            <div className="text-sm font-bold mb-1">REVIEW CONTENT</div>
            <h2 className="text-2xl font-black">{topic.name_en}</h2>
            <div className="text-sm font-bold text-zinc-800">
              By {topic.creator_name} • {topic.category_name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Topic Details */}
          <div
            className="border-2 border-black p-4"
            style={{ boxShadow: "2px_2px_0_#000" }}
          >
            <h3 className="font-black text-lg mb-4">Topic Information</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-bold text-zinc-600">Topic Code</div>
                <div className="font-mono font-bold">{topic.topic_code}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-600">Sub-group</div>
                <div className="font-bold">{topic.sub_group || "N/A"}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-bold text-zinc-600 mb-1">
                Name (Khmer)
              </div>
              <div className="font-bold">{topic.name_km}</div>
            </div>

            {topic.law_reference && (
              <div className="mb-4">
                <div className="text-sm font-bold text-zinc-600 mb-1">
                  Law Reference
                </div>
                <div className="font-bold">{topic.law_reference}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-bold text-zinc-600 mb-1">
                  Description (English)
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {topic.description_en}
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-600 mb-1">
                  Description (Khmer)
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {topic.description_km}
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          {(topic.primary_image_url || topic.audio_url_en || topic.audio_url_km) && (
            <div
              className="border-2 border-black p-4"
              style={{ boxShadow: "2px_2px_0_#000" }}
            >
              <h3 className="font-black text-lg mb-4">Media</h3>

              {topic.primary_image_url && (
                <div className="mb-4">
                  <div className="text-sm font-bold text-zinc-600 mb-2">Image</div>
                  <img
                    src={topic.primary_image_url}
                    alt={topic.name_en}
                    className="max-w-md border-2 border-black"
                    style={{ boxShadow: "4px 4px 0 #000" }}
                  />
                </div>
              )}

              {(topic.audio_url_en || topic.audio_url_km) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topic.audio_url_en && (
                    <div>
                      <div className="text-sm font-bold text-zinc-600 mb-2">
                        Audio (English)
                      </div>
                      <audio controls className="w-full">
                        <source src={topic.audio_url_en} />
                      </audio>
                    </div>
                  )}
                  {topic.audio_url_km && (
                    <div>
                      <div className="text-sm font-bold text-zinc-600 mb-2">
                        Audio (Khmer)
                      </div>
                      <audio controls className="w-full">
                        <source src={topic.audio_url_km} />
                      </audio>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          <div
            className="border-2 border-black p-4"
            style={{ boxShadow: "2px_2px_0_#000" }}
          >
            <h3 className="font-black text-lg mb-4">
              Questions ({questions.length})
            </h3>

            {loading ? (
              <p className="text-zinc-600">Loading questions...</p>
            ) : questions.length === 0 ? (
              <div className="bg-red-50 border-2 border-red-400 p-4">
                <p className="font-bold text-red-800">
                  ⚠️ No questions linked to this topic
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="border-2 border-black p-4 bg-gray-50"
                  >
                    <div className="font-black mb-2">Question {index + 1}</div>
                    <div className="mb-2">
                      <div className="text-sm font-bold text-zinc-600">English</div>
                      <div>{q.question_en}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-sm font-bold text-zinc-600">Khmer</div>
                      <div>{q.question_km}</div>
                    </div>

                    {(q.answers || []).length > 0 && (
                      <div>
                        <div className="text-sm font-bold text-zinc-600 mb-2">
                          Answers
                        </div>
                        <div className="space-y-1">
                          {(q.answers || []).map((a, aIndex) => (
                            <div
                              key={a.id}
                              className={`p-2 border-2 border-black text-sm ${
                                a.is_correct
                                  ? "bg-green-100 border-green-600"
                                  : "bg-white"
                              }`}
                            >
                              <span className="font-bold">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>{" "}
                              {a.answer_en}
                              {a.is_correct && (
                                <span className="ml-2 text-green-600 font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div
              className="border-2 border-red-400 bg-red-50 p-4"
              style={{ boxShadow: "2px_2px_0_#000" }}
            >
              <h3 className="font-black text-lg mb-4">Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
                placeholder="Explain why this content is being rejected..."
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t-4 border-black p-6 bg-gray-50 flex gap-4">
          {!showRejectForm ? (
            <>
              <button
                onClick={onApprove}
                className="flex-1 bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Approve & Publish
              </button>

              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 bg-red-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Reject
              </button>

              <button
                onClick={onClose}
                className="bg-white border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Confirm Rejection
              </button>

              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
                className="bg-white border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
