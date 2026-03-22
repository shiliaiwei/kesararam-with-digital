"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, BookOpen, Brain, FileText, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { MediaImage } from "@/components/common/media-image";
import { MediaAudio } from "@/components/common/media-audio";

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
  onClose: () => void;
}

export function SignDetailPopup({ topic, onClose }: SignDetailPopupProps) {
  const { lang } = useLang();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div
        className="bg-white border-4 border-black w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-2 sm:my-8"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-amber-400 border-b-4 border-black p-3 sm:p-4 flex items-center justify-between z-10">
          <div className="font-mono text-xs sm:text-sm font-bold text-black">
            {topic.topic_code}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sign Image - At the top, no text above */}
        <div className="p-4 sm:p-6 border-b-2 border-black bg-gray-50">
          <div className="max-w-xs sm:max-w-sm mx-auto">
            <div
              className="aspect-square bg-white border-4 border-black p-4 sm:p-8 flex items-center justify-center"
              style={{ boxShadow: "6px 6px 0 #000" }}
            >
              {topic.primary_image_url ? (
                <MediaImage
                  src={topic.primary_image_url}
                  alt={lang === "en" ? topic.name_en : topic.name_km}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-6xl sm:text-8xl">🚦</div>
              )}
            </div>
          </div>
        </div>

        {/* Name - Below the image */}
        <div className="p-4 sm:p-6 border-b-2 border-black bg-white">
          <h2 className="text-xl sm:text-2xl font-black text-center">
            {lang === "en" ? topic.name_en : topic.name_km}
          </h2>
        </div>
        
        {/* Meaning & Description - Below name */}
        <div className="p-4 sm:p-6 border-b-2 border-black">
          <h4 className="font-black text-base sm:text-lg mb-3">
            {lang === "en" ? "Meaning & Description" : "អត្ថន័យ និងការពិពណ៌នា"}
          </h4>
          <p className="text-sm sm:text-base text-zinc-800 leading-relaxed whitespace-pre-wrap">
            {lang === "en" ? topic.description_en : topic.description_km}
          </p>

          {topic.law_reference && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 border-2 border-blue-400">
              <div className="font-bold text-xs sm:text-sm text-blue-800 mb-1">
                {lang === "en" ? "Law Reference" : "ឯកសារយោង"}
              </div>
              <div className="text-xs sm:text-sm">{topic.law_reference}</div>
            </div>
          )}
        </div>

        {/* Audio Player - Only for selected language */}
        {((lang === "en" && topic.audio_url_en) || (lang === "kh" && topic.audio_url_km)) && (
          <div className="p-4 sm:p-6 border-b-2 border-black bg-gray-50">
            <h4 className="font-black text-base sm:text-lg mb-3">
              {lang === "en" ? "Audio Pronunciation" : "ការបញ្ចេញសំឡេង"}
            </h4>
            <button
              onClick={() => toggleAudio(lang === "en" ? "en" : "km")}
              className="w-full bg-white border-2 border-black px-4 sm:px-6 py-2.5 sm:py-3 font-bold hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {playingAudio === (lang === "en" ? "en" : "km") ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
              {lang === "en" ? "Play Audio" : "ចាក់សំឡេង"}
            </button>
            {lang === "en" && topic.audio_url_en && (
              <MediaAudio
                ref={audioEnRef}
                src={topic.audio_url_en}
                onEnded={handleAudioEnded}
              />
            )}
            {lang === "kh" && topic.audio_url_km && (
              <MediaAudio
                ref={audioKmRef}
                src={topic.audio_url_km}
                onEnded={handleAudioEnded}
              />
            )}
          </div>
        )}

        {/* Linked Q&A */}
        {questions.length > 0 && (
          <div className="p-4 sm:p-6 border-b-2 border-black">
            <h4 className="font-black text-base sm:text-lg mb-3">
              {lang === "en" ? `Related Questions (${questions.length})` : `សំណួរពាក់ព័ន្ធ (${questions.length})`}
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
                    className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start gap-2 sm:gap-3 text-left flex-1">
                      <span className="font-black text-xs sm:text-sm bg-black text-white px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0">
                        Q{index + 1}
                      </span>
                      <span className="font-bold text-sm sm:text-base">
                        {lang === "en" ? q.question_en : q.question_km}
                      </span>
                    </div>
                    {expandedQA === q.id ? (
                      <ChevronUp size={18} className="flex-shrink-0 ml-2" />
                    ) : (
                      <ChevronDown size={18} className="flex-shrink-0 ml-2" />
                    )}
                  </button>

                  {expandedQA === q.id && (
                    <div className="p-3 sm:p-4 border-t-2 border-black bg-gray-50">
                      <div className="space-y-2">
                        {q.answers.map((a, aIndex) => (
                          <div
                            key={a.id}
                            className={`p-2.5 sm:p-3 border-2 border-black ${
                              a.is_correct
                                ? "bg-green-100 border-green-600"
                                : "bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-sm sm:text-base flex-shrink-0">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>
                              <span className="text-sm sm:text-base flex-1">
                                {lang === "en" ? a.answer_en : a.answer_km}
                              </span>
                              {a.is_correct && (
                                <span className="ml-auto text-green-600 font-bold text-xs sm:text-sm flex-shrink-0">
                                  ✓ {lang === "en" ? "CORRECT" : "ត្រឹមត្រូវ"}
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
        <div className="p-4 sm:p-6 border-b-2 border-black">
          <h4 className="font-black text-base sm:text-lg mb-3">
            {lang === "en" ? "Practice with this sign" : "អនុវត្តជាមួយសញ្ញានេះ"}
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button className="bg-blue-400 border-2 border-black px-3 sm:px-4 py-2.5 sm:py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <BookOpen size={16} />
              {lang === "en" ? "Flashcards" : "កាត"}
            </button>
            <button className="bg-green-400 border-2 border-black px-3 sm:px-4 py-2.5 sm:py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Brain size={16} />
              {lang === "en" ? "Quiz" : "តេស្ត"}
            </button>
            <button className="bg-purple-400 border-2 border-black px-3 sm:px-4 py-2.5 sm:py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <FileText size={16} />
              {lang === "en" ? "Practice" : "អនុវត្ត"}
            </button>
            <button className="bg-red-400 border-2 border-black px-3 sm:px-4 py-2.5 sm:py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Zap size={16} />
              {lang === "en" ? "Challenge" : "ប្រកួត"}
            </button>
          </div>
        </div>

        {/* Close Button Footer */}
        <div className="p-4 sm:p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-white border-2 border-black px-4 sm:px-6 py-2 sm:py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all text-sm sm:text-base"
          >
            {lang === "en" ? "Close" : "បិទ"}
          </button>
        </div>
      </div>
    </div>
  );
}
