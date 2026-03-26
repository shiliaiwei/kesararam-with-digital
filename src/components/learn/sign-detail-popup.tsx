"use client";

import { useState, useRef } from "react";
import { X, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "@/context/lang-context";

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
  questions?: Question[];
  onClose: () => void;
}

export function SignDetailPopup({ topic, questions = [], onClose }: SignDetailPopupProps) {
  const { lang } = useLang();
  const [playingAudio, setPlayingAudio] = useState<"en" | "km" | null>(null);
  const [expandedQA, setExpandedQA] = useState<number | null>(null);
  const audioEnRef = useRef<HTMLAudioElement>(null);
  const audioKmRef = useRef<HTMLAudioElement>(null);

  const isKh = lang === "kh";
  const name = isKh ? topic.name_km : topic.name_en;
  const description = isKh ? topic.description_km : topic.description_en;
  const audioUrl = isKh ? topic.audio_url_km : topic.audio_url_en;
  const audioRef = isKh ? audioKmRef : audioEnRef;

  const toggleAudio = () => {
    if (playingAudio) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      audioRef.current?.play();
      setPlayingAudio(isKh ? "km" : "en");
    }
  };

  return (
    /* Blurred backdrop — full focus on card */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      {/* Card — stop propagation so clicking inside doesn't close */}
      <div
        className="relative bg-white w-full max-w-lg rounded-none border-4 border-black flex flex-col"
        style={{ boxShadow: "8px 8px 0 #000", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button — top right, always visible */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Image */}
          {topic.primary_image_url && (
            <div className="flex justify-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 border-4 border-black bg-gray-50 flex items-center justify-center p-3">
                <img
                  src={topic.primary_image_url}
                  alt={name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Code + sub-group */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="font-mono text-xs bg-zinc-100 border border-zinc-300 px-2 py-0.5">
              {topic.topic_code}
            </span>
            {topic.sub_group && (
              <span className="text-xs font-bold bg-amber-100 border border-amber-400 px-2 py-0.5">
                {topic.sub_group}
              </span>
            )}
          </div>

          {/* Title — large, centered, bold */}
          <h2 className="text-xl sm:text-2xl font-black text-center leading-snug break-words">
            {name}
          </h2>

          {/* Description — readable, no label clutter */}
          {description && (
            <p className="text-sm sm:text-base text-zinc-700 leading-relaxed text-center break-words whitespace-pre-wrap">
              {description}
            </p>
          )}

          {/* Law reference */}
          {topic.law_reference && (
            <div className="bg-blue-50 border-2 border-blue-300 px-4 py-3 text-xs sm:text-sm text-blue-800">
              <span className="font-black uppercase tracking-wide block mb-1">
                {isKh ? "ឯកសារយោងច្បាប់" : "Law Reference"}
              </span>
              {topic.law_reference}
            </div>
          )}

          {/* Audio */}
          {audioUrl && (
            <button
              onClick={toggleAudio}
              className="w-full border-2 border-black py-2.5 font-black text-sm inline-flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all"
            >
              {playingAudio ? <Pause size={16} /> : <Play size={16} />}
              {isKh ? "ចាក់សំឡេង" : "Play Audio"}
            </button>
          )}
          {topic.audio_url_en && <audio ref={audioEnRef} src={topic.audio_url_en} onEnded={() => setPlayingAudio(null)} />}
          {topic.audio_url_km && <audio ref={audioKmRef} src={topic.audio_url_km} onEnded={() => setPlayingAudio(null)} />}

          {/* Q&A */}
          {questions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 text-center">
                {isKh ? `សំណួរពាក់ព័ន្ធ (${questions.length})` : `Related Questions (${questions.length})`}
              </p>
              {questions.map((q, i) => (
                <div key={q.id} className="border-2 border-black">
                  <button
                    onClick={() => setExpandedQA(expandedQA === q.id ? null : q.id)}
                    className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 transition-all"
                  >
                    <span className="font-black text-xs bg-black text-white px-1.5 py-0.5 shrink-0 mt-0.5">Q{i + 1}</span>
                    <span className="font-bold text-sm flex-1 break-words">{isKh ? q.question_km : q.question_en}</span>
                    {expandedQA === q.id ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
                  </button>
                  {expandedQA === q.id && (
                    <div className="border-t-2 border-black bg-gray-50 p-3 space-y-2">
                      {q.answers.map((a, ai) => (
                        <div key={a.id} className={`px-3 py-2 border-2 text-sm flex gap-2 ${a.is_correct ? "bg-green-100 border-green-500" : "bg-white border-gray-200"}`}>
                          <span className="font-bold shrink-0">{String.fromCharCode(65 + ai)}.</span>
                          <span className="flex-1 break-words">{isKh ? a.answer_km : a.answer_en}</span>
                          {a.is_correct && <span className="text-green-600 font-black text-xs shrink-0">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer close button */}
        <div className="border-t-4 border-black p-4">
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-3 font-black text-sm hover:bg-zinc-800 transition-all"
          >
            {isKh ? "បិទ" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
