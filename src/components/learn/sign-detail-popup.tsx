"use client";

import { useState, useRef } from "react";
import { X, Volume2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
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
      if (audioRef.current) audioRef.current.currentTime = 0;
      setPlaying(false);
      setLoading(false);
    } else {
      const el = audioRef.current;
      if (!el) return;
      if (el.readyState >= 3) {
        el.currentTime = 0;
        el.play();
        setPlaying(true);
      } else {
        setLoading(true);
        el.load();
        el.oncanplaythrough = () => {
          el.play();
          setLoading(false);
          setPlaying(true);
          el.oncanplaythrough = null;
        };
      }
    }
  };

  const hl = playing ? "bg-yellow-400 text-black font-black" : "font-black text-black";
  const hlDesc = playing ? "bg-yellow-400 text-black font-black" : "font-medium text-zinc-600";

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
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto flex-1">

          {topic.primary_image_url && (
            <div className="w-full flex items-center justify-center bg-white border-b-4 border-black py-6">
              <img
                src={topic.primary_image_url}
                alt={name}
                className="object-contain"
                style={{ maxHeight: 180, maxWidth: "75%" }}
              />
            </div>
          )}

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

          <div className="px-5 pt-2 pb-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">
              Sign Category
            </p>
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-black break-words"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
              {topic.name_en}
            </h2>
            {topic.name_km && topic.name_km !== topic.name_en && (
              <p className="text-base font-bold leading-snug text-zinc-500 mt-1 break-words"
                style={{ fontFamily: "Siemreap, sans-serif", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                {topic.name_km}
              </p>
            )}
          </div>

          {(topic.description_en || topic.description_km) && (
            <div className="mx-5 mt-2 mb-3 rounded overflow-hidden border border-emerald-400">
              <div className="bg-emerald-500 px-3 py-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Description</span>
              </div>
              <div className="bg-emerald-50 px-4 py-3 space-y-2">
                {topic.description_en && (
                  <p className="text-sm font-medium leading-relaxed text-emerald-900 break-words"
                    style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {topic.description_en}
                  </p>
                )}
                {topic.description_km && (
                  <p className="text-sm font-medium leading-relaxed text-emerald-900 break-words"
                    style={{ fontFamily: "Siemreap, sans-serif", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {topic.description_km}
                  </p>
                )}
              </div>
            </div>
          )}

          {topic.law_reference && (
            <div className="mx-5 mb-4 bg-blue-50 border-2 border-blue-200 px-4 py-3 text-xs text-blue-800">
              <span className="font-black uppercase tracking-wide block mb-1" style={kf}>
                {isKh ? "Law Reference" : "Law Reference"}
              </span>
              <span style={kf}>{topic.law_reference}</span>
            </div>
          )}

          {audioUrl && (
            <div className="px-5 pb-5">
              <button
                onClick={toggleAudio}
                disabled={loading}
                className={`w-full py-3 font-black text-sm inline-flex items-center justify-center gap-2.5 border-2 border-black select-none ${loading
                    ? "bg-zinc-100 text-zinc-400 cursor-wait"
                    : playing
                      ? "bg-black text-yellow-400 shadow-[4px_4px_0_#ca8a04]"
                      : "bg-white text-black shadow-[4px_4px_0_#000] hover:bg-yellow-400 hover:shadow-[4px_4px_0_#ca8a04]"
                  }`}
                style={kf}
              >
                {loading ? (
                  <>
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                    {isKh ? "Loading..." : "Loading audio..."}
                  </>
                ) : playing ? (
                  <>
                    <span className="flex gap-0.5 items-end h-4">
                      {[60, 100, 75, 90].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-yellow-400 rounded-sm animate-pulse"
                          style={{ height: h + "%", animationDelay: i * 100 + "ms" }}
                        />
                      ))}
                    </span>
                    {isKh ? "ចុចដើម្បីឈប់" : "Tap to stop"}
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    {isKh ? "ចាក់សំឡេង" : "Play Audio"}
                  </>
                )}
              </button>
            </div>
          )}

          {topic.audio_url_en && (
            <audio ref={audioEnRef} src={topic.audio_url_en} onEnded={() => setPlaying(false)} />
          )}
          {topic.audio_url_km && (
            <audio ref={audioKmRef} src={topic.audio_url_km} onEnded={() => setPlaying(false)} />
          )}

          {questions.length > 0 && (
            <div className="border-t-2 border-black px-5 py-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3" style={kf}>
                {isKh ? `Related (${questions.length})` : `Related Questions (${questions.length})`}
              </p>
              {questions.map((q: Question, i: number) => (
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
                      {q.answers.map((a: Answer, ai: number) => (
                        <div
                          key={a.id}
                          className={`px-3 py-2 border-2 text-sm flex gap-2 ${a.is_correct ? "bg-green-100 border-green-500" : "bg-white border-zinc-200"
                            }`}
                        >
                          <span className="font-bold shrink-0">{String.fromCharCode(65 + ai)}.</span>
                          <span className="flex-1 break-words" style={kf}>
                            {isKh ? a.answer_km : a.answer_en}
                          </span>
                          {a.is_correct && (
                            <span className="text-green-600 font-black text-xs shrink-0">&#10003;</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t-4 border-black p-4">
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-3 font-black text-sm hover:bg-zinc-800 transition-all"
            style={kf}
          >
            {isKh ? "Close" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
