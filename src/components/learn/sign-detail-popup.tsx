"use client";

import { useState, useRef } from "react";
import { X, Play, Pause, ChevronDown, ChevronUp, Volume2 } from "lucide-react";
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
  const [playing, setPlaying] = useState(false);
  const [expandedQA, setExpandedQA] = useState<number | null>(null);
  const audioEnRef = useRef<HTMLAudioElement>(null);
  const audioKmRef = useRef<HTMLAudioElement>(null);

  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const name = isKh ? topic.name_km : topic.name_en;
  const description = isKh ? topic.description_km : topic.description_en;
  const audioUrl = isKh ? topic.audio_url_km : topic.audio_url_en;
  const audioRef = isKh ? audioKmRef : audioEnRef;

  const toggleAudio = () => {
    if (playing) {
      audioRef.current?.pause();
      audioRef.current && (audioRef.current.currentTime = 0);
      setPlaying(false);
    } else {
      audioRef.current?.play();
      setPlaying(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-md flex flex-col border-4 border-black"
        style={{ boxShadow: "8px 8px 0 #000", maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto flex-1">

          {/* ── Image block — full width, prominent ── */}
          {topic.primary_image_url && (
            <div
              className={`relative w-full flex items-center justify-center transition-all duration-300 ${
                playing ? "bg-yellow-400 border-b-4 border-black" : "bg-zinc-50 border-b-4 border-black"
              }`}
              style={{ minHeight: 220 }}
            >
              <img
                src={topic.primary_image_url}
                alt={name}
                className={`object-contain transition-all duration-300 ${
                  playing ? "scale-110 drop-shadow-2xl" : "scale-100"
                }`}
                style={{ maxHeight: 200, maxWidth: "80%" }}
              />
              {/* Playing pulse ring */}
              {playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border-4 border-black animate-ping opacity-20" />
                </div>
              )}
            </div>
          )}

          {/* ── Meta — dimmed, small, below image ── */}
          <div className="flex items-center gap-2 px-5 pt-3 pb-1">
            <span className="font-mono text-[10px] text-zinc-400 border border-zinc-200 px-1.5 py-0.5 bg-zinc-50">
              {topic.topic_code}
            </span>
            {topic.sub_group && (
              <span className="text-[10px] font-bold text-zinc-400 border border-zinc-200 px-1.5 py-0.5 bg-zinc-50">
                {topic.sub_group}
              </span>
            )}
          </div>

          {/* ── Title — left, large, highlights when playing ── */}
          <div className="px-5 pt-2 pb-1">
            <h2
              className={`text-2xl sm:text-3xl font-black leading-tight break-words transition-all duration-300 ${
                playing ? "text-black scale-[1.02] origin-left" : "text-black"
              }`}
              style={kf}
            >
              {name}
            </h2>
          </div>

          {/* ── Description — left, highlights when playing ── */}
          {description && (
            <div className="px-5 pt-1 pb-4">
              <p
                className={`text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap transition-all duration-300 ${
                  playing ? "text-black font-semibold" : "text-zinc-600 font-medium"
                }`}
                style={kf}
              >
                {description}
              </p>
            </div>
          )}

          {/* ── Law reference ── */}
          {topic.law_reference && (
            <div className="mx-5 mb-4 bg-blue-50 border-2 border-blue-200 px-4 py-3 text-xs text-blue-800">
              <span className="font-black uppercase tracking-wide block mb-1" style={kf}>
                {isKh ? "ឯកសារយោងច្បាប់" : "Law Reference"}
              </span>
              <span style={kf}>{topic.law_reference}</span>
            </div>
          )}

          {/* ── Audio button ── */}
          {audioUrl && (
            <div className="px-5 pb-5">
              <button
                onClick={toggleAudio}
                className={`w-full py-3 font-black text-sm inline-flex items-center justify-center gap-2 border-2 border-black transition-all duration-200 ${
                  playing
                    ? "bg-black text-yellow-400 shadow-[4px_4px_0_#ca8a04]"
                    : "bg-white text-black hover:bg-black hover:text-white shadow-[4px_4px_0_#000]"
                }`}
                style={kf}
              >
                {playing ? (
                  <>
                    <Volume2 size={16} className="animate-pulse" />
                    {isKh ? "កំពុងចាក់..." : "Playing..."}
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    {isKh ? "ចាក់សំឡេង" : "Play Audio"}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Hidden audio elements */}
          {topic.audio_url_en && (
            <audio ref={audioEnRef} src={topic.audio_url_en} onEnded={() => setPlaying(false)} />
          )}
          {topic.audio_url_km && (
            <audio ref={audioKmRef} src={topic.audio_url_km} onEnded={() => setPlaying(false)} />
          )}

          {/* ── Q&A ── */}
          {questions.length > 0 && (
            <div className="border-t-2 border-black px-5 py-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3" style={kf}>
                {isKh ? `សំណួរពាក់ព័ន្ធ (${questions.length})` : `Related Questions (${questions.length})`}
              </p>
              {questions.map((q, i) => (
                <div key={q.id} className="border-2 border-black">
                  <button
                    onClick={() => setExpandedQA(expandedQA === q.id ? null : q.id)}
                    className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-zinc-50 transition-all"
                  >
                    <span className="font-black text-[10px] bg-black text-white px-1.5 py-0.5 shrink-0 mt-0.5">
                      Q{i + 1}
                    </span>
                    <span className="font-bold text-sm flex-1 break-words" style={kf}>
                      {isKh ? q.question_km : q.question_en}
                    </span>
                    {expandedQA === q.id
                      ? <ChevronUp size={14} className="shrink-0 mt-0.5" />
                      : <ChevronDown size={14} className="shrink-0 mt-0.5" />}
                  </button>
                  {expandedQA === q.id && (
                    <div className="border-t-2 border-black bg-zinc-50 p-3 space-y-2">
                      {q.answers.map((a, ai) => (
                        <div
                          key={a.id}
                          className={`px-3 py-2 border-2 text-sm flex gap-2 ${
                            a.is_correct ? "bg-green-100 border-green-500" : "bg-white border-zinc-200"
                          }`}
                        >
                          <span className="font-bold shrink-0">{String.fromCharCode(65 + ai)}.</span>
                          <span className="flex-1 break-words" style={kf}>
                            {isKh ? a.answer_km : a.answer_en}
                          </span>
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

        {/* Footer */}
        <div className="border-t-4 border-black p-4">
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-3 font-black text-sm hover:bg-zinc-800 transition-all"
            style={kf}
          >
            {isKh ? "បិទ" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
