"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, BookOpen, Brain, FileText, Zap, ChevronDown, ChevronUp } from "lucide-react";

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

interface SignDetailPopupProps {
  topic: Topic;
  language: "en" | "km";
  onClose: () => void;
}

export function SignDetailPopup({ topic, language, onClose }: SignDetailPopupProps) {
  const [activeTab, setActiveTab] = useState<"en" | "km">(language);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQA, setExpandedQA] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<"en" | "km" | null>(null);
  const audioEnRef = useRef<HTMLAudioElement>(null);
  const audioKmRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchQuestions();
  }, [topic.id]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/public/topics/${topic.id}/questions`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const toggleAudio = (lang: "en" | "km") => {
    const audioRef = lang === "en" ? audioEnRef : audioKmRef;
    const otherAudioRef = lang === "en" ? audioKmRef : audioEnRef;

    if (playingAudio === lang) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      otherAudioRef.current?.pause();
      audioRef.current?.play();
      setPlayingAudio(lang);
    }
  };

  const handleAudioEnded = () => {
    setPlayingAudio(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-amber-400 border-b-4 border-black p-6 flex items-start justify-between z-10">
          <div className="flex-1">
            <div className="font-mono text-sm font-bold text-black mb-2">
              {topic.topic_code}
            </div>
            <h2 className="text-3xl font-black mb-2">{topic.name_en}</h2>
            <h3 className="text-2xl font-bold text-zinc-800">{topic.name_km}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sign Image */}
        <div className="p-6 border-b-2 border-black bg-gray-50">
          <div className="max-w-md mx-auto">
            <div
              className="aspect-square bg-white border-4 border-black p-8 flex items-center justify-center"
              style={{ boxShadow: "8px 8px 0 #000" }}
            >
              {topic.primary_image_url ? (
                <img
                  src={topic.primary_image_url}
                  alt={topic.name_en}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-8xl">🚦</div>
              )}
            </div>
          </div>
        </div>

        {/* Description Tabs */}
        <div className="border-b-2 border-black">
          <div className="flex">
            <button
              onClick={() => setActiveTab("en")}
              className={`flex-1 px-6 py-3 font-black border-r-2 border-black transition-all ${
                activeTab === "en"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveTab("km")}
              className={`flex-1 px-6 py-3 font-black transition-all ${
                activeTab === "km"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              ភាសាខ្មែរ
            </button>
          </div>
        </div>

        {/* Description Content */}
        <div className="p-6 border-b-2 border-black">
          <h4 className="font-black text-lg mb-3">Meaning & Description</h4>
          <p className="text-zinc-800 leading-relaxed whitespace-pre-wrap">
            {activeTab === "en" ? topic.description_en : topic.description_km}
          </p>

          {topic.law_reference && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-400">
              <div className="font-bold text-sm text-blue-800 mb-1">
                Law Reference
              </div>
              <div className="text-sm">{topic.law_reference}</div>
            </div>
          )}
        </div>

        {/* Audio Players */}
        {(topic.audio_url_en || topic.audio_url_km) && (
          <div className="p-6 border-b-2 border-black bg-gray-50">
            <h4 className="font-black text-lg mb-3">Audio Pronunciation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.audio_url_en && (
                <div>
                  <button
                    onClick={() => toggleAudio("en")}
                    className="w-full bg-white border-2 border-black px-6 py-3 font-bold hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
                  >
                    {playingAudio === "en" ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                    Play English
                  </button>
                  <audio
                    ref={audioEnRef}
                    src={topic.audio_url_en}
                    onEnded={handleAudioEnded}
                  />
                </div>
              )}

              {topic.audio_url_km && (
                <div>
                  <button
                    onClick={() => toggleAudio("km")}
                    className="w-full bg-white border-2 border-black px-6 py-3 font-bold hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
                  >
                    {playingAudio === "km" ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                    Play Khmer
                  </button>
                  <audio
                    ref={audioKmRef}
                    src={topic.audio_url_km}
                    onEnded={handleAudioEnded}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linked Q&A */}
        {questions.length > 0 && (
          <div className="p-6 border-b-2 border-black">
            <h4 className="font-black text-lg mb-3">
              Related Questions ({questions.length})
            </h4>
            <div className="space-y-2">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border-2 border-black bg-white"
                >
                  <button
                    onClick={() =>
                      setExpandedQA(expandedQA === q.id ? null : q.id)
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start gap-3 text-left">
                      <span className="font-black text-sm bg-black text-white px-2 py-1">
                        Q{index + 1}
                      </span>
                      <span className="font-bold">
                        {activeTab === "en" ? q.question_en : q.question_km}
                      </span>
                    </div>
                    {expandedQA === q.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>

                  {expandedQA === q.id && (
                    <div className="p-4 border-t-2 border-black bg-gray-50">
                      <div className="space-y-2">
                        {q.answers.map((a, aIndex) => (
                          <div
                            key={a.id}
                            className={`p-3 border-2 border-black ${
                              a.is_correct
                                ? "bg-green-100 border-green-600"
                                : "bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-bold">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>
                              <span>
                                {activeTab === "en" ? a.answer_en : a.answer_km}
                              </span>
                              {a.is_correct && (
                                <span className="ml-auto text-green-600 font-bold text-sm">
                                  ✓ CORRECT
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Mode Buttons */}
        <div className="p-6">
          <h4 className="font-black text-lg mb-3">Practice with this sign</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="bg-blue-400 border-2 border-black px-4 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <BookOpen size={18} />
              Flashcards
            </button>
            <button className="bg-green-400 border-2 border-black px-4 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <Brain size={18} />
              Quiz
            </button>
            <button className="bg-purple-400 border-2 border-black px-4 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <FileText size={18} />
              Practice
            </button>
            <button className="bg-red-400 border-2 border-black px-4 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <Zap size={18} />
              Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
