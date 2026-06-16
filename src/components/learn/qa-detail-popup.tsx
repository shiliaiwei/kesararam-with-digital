"use client";

import { useState, useRef } from "react";
import { X, Play, Pause } from "lucide-react";
import { useLang } from "@/context/lang-context";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  description_en: string;
  description_km: string;
  sub_group: string;
  law_reference: string;
  audio_url_en: string;
  audio_url_km: string;
}

interface Answer {
  id: number;
  answer_en: string;
  answer_km: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  topic_id: number;
  question_en: string;
  question_km: string;
  hint_en: string;
  hint_km: string;
  image_url: string | null;
  answers: Answer[];
}

interface QAItem extends Question {
  topic: Topic;
}

interface QADetailPopupProps {
  qaItem: QAItem;
  onClose: () => void;
}

export function QADetailPopup({ qaItem, onClose }: QADetailPopupProps) {
  const { lang } = useLang();
  const [playingAudio, setPlayingAudio] = useState<"en" | "kh" | null>(null);
  const audioEnRef = useRef<HTMLAudioElement>(null);
  const audioKhRef = useRef<HTMLAudioElement>(null);

  const translations = {
    en: {
      question: "Question",
      answer: "Answer",
      explanation: "Explanation",
      lawReference: "Law Reference",
      relatedTopic: "Related Topic",
      playEnglish: "Play English",
      playKhmer: "Play Khmer",
    },
    kh: {
      question: "សំណួរ",
      answer: "ចម្លើយ",
      explanation: "ការពន្យល់",
      lawReference: "ឯកសារយោងច្បាប់",
      relatedTopic: "ប្រធានបទពាក់ព័ន្ធ",
      playEnglish: "ចាក់អង់គ្លេស",
      playKhmer: "ចាក់ខ្មែរ",
    },
  };

  const t = translations[lang] || translations.en;

  const toggleAudio = (language: "en" | "kh") => {
    const audioRef = language === "en" ? audioEnRef : audioKhRef;
    const otherAudioRef = language === "en" ? audioKhRef : audioEnRef;

    if (playingAudio === language) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      otherAudioRef.current?.pause();
      audioRef.current?.play();
      setPlayingAudio(language);
    }
  };

  const handleAudioEnded = () => {
    setPlayingAudio(null);
  };

  const correctAnswer = qaItem.answers.find((a) => a.is_correct);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div
        className="bg-white border-4 border-black w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-2 sm:my-8"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-blue-400 border-b-4 border-black p-4 sm:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-black flex items-center justify-center">
              <span className="font-black text-lg sm:text-xl">Q{qaItem.id}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-black mb-1">
                {qaItem.topic.topic_code}
              </div>
              {qaItem.topic.sub_group && (
                <div className="text-xs font-bold bg-white border border-black px-2 py-0.5 inline-block">
                  {qaItem.topic.sub_group}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Question */}
        <div className="p-4 sm:p-6 border-b-2 border-black">
          <h4 className="font-black text-sm sm:text-base mb-3 text-blue-600">
            {t.question}
          </h4>
          
          {/* Question Image (scenario/reference) */}
          {qaItem.image_url && (
            <div className="mb-4">
              <div
                className="bg-white border-2 border-black p-4 max-w-md mx-auto"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                <img
                  src={qaItem.image_url}
                  alt="Question scenario"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}

          <p className="text-lg sm:text-xl font-bold text-black leading-relaxed font-learning">
            {lang === "en" ? qaItem.question_en : qaItem.question_km}
          </p>
        </div>

        {/* Answer */}
        <div className="p-4 sm:p-6 border-b-2 border-black bg-green-50">
          <h4 className="font-black text-sm sm:text-base mb-3 text-green-700">
            {t.answer}
          </h4>
          {correctAnswer && (
            <div className="bg-white border-2 border-green-600 p-4">
              <p className="text-base sm:text-lg font-bold text-black font-learning">
                {lang === "en" ? correctAnswer.answer_en : correctAnswer.answer_km}
              </p>
            </div>
          )}
        </div>

        {/* Explanation */}
        {(qaItem.hint_en || qaItem.hint_km) && (
          <div className="p-4 sm:p-6 border-b-2 border-black">
            <h4 className="font-black text-sm sm:text-base mb-3">
              {t.explanation}
            </h4>
            <p className="text-sm sm:text-base text-zinc-800 leading-relaxed whitespace-pre-wrap font-learning">
              {lang === "en" ? qaItem.hint_en : qaItem.hint_km}
            </p>
          </div>
        )}

        {/* Law Reference */}
        {qaItem.topic.law_reference && (
          <div className="p-4 sm:p-6 border-b-2 border-black bg-amber-50">
            <h4 className="font-black text-sm sm:text-base mb-3 text-amber-800">
              {t.lawReference}
            </h4>
            <div className="bg-white border-2 border-amber-600 p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-mono text-amber-900">
                {qaItem.topic.law_reference}
              </p>
            </div>
          </div>
        )}

        {/* Audio Players */}
        {(qaItem.topic.audio_url_en || qaItem.topic.audio_url_km) && (
          <div className="p-4 sm:p-6 border-b-2 border-black bg-gray-50">
            <h4 className="font-black text-sm sm:text-base mb-3">
              Audio Explanation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {qaItem.topic.audio_url_en && (
                <div>
                  <button
                    onClick={() => toggleAudio("en")}
                    className="w-full bg-white border-2 border-black px-4 py-2.5 sm:py-3 font-bold hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {playingAudio === "en" ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                    {t.playEnglish}
                  </button>
                  <audio
                    ref={audioEnRef}
                    src={qaItem.topic.audio_url_en}
                    onEnded={handleAudioEnded}
                  />
                </div>
              )}

              {qaItem.topic.audio_url_km && (
                <div>
                  <button
                    onClick={() => toggleAudio("kh")}
                    className="w-full bg-white border-2 border-black px-4 py-2.5 sm:py-3 font-bold hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {playingAudio === "kh" ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                    {t.playKhmer}
                  </button>
                  <audio
                    ref={audioKhRef}
                    src={qaItem.topic.audio_url_km}
                    onEnded={handleAudioEnded}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Topic */}
        <div className="p-4 sm:p-6 bg-gray-100">
          <h4 className="font-black text-sm mb-2 text-zinc-600">
            {t.relatedTopic}
          </h4>
          <p className="text-sm sm:text-base font-bold text-black font-learning">
            {lang === "en" ? qaItem.topic.name_en : qaItem.topic.name_km}
          </p>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-learning">
            {lang === "en" ? qaItem.topic.description_en : qaItem.topic.description_km}
          </p>
        </div>
      </div>
    </div>
  );
}
