"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ArrowLeft, X, Volume2, ChevronDown, ChevronUp } from "lucide-react";
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
  primary_image_url: string | null;
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
  audio_url_en?: string;
  audio_url_km?: string;
  answers: Answer[];
}

const SUB_GROUPS: { key: string; en: string; km: string }[] = [
  { key: "Traffic Rules", en: "Traffic Rules", km: "វិធានចរាចរ" },
  { key: "Speed Limits",  en: "Speed Limits",  km: "ល្បឿន" },
  { key: "Parking",       en: "Parking",       km: "ចត" },
  { key: "Overtaking",    en: "Overtaking",    km: "ជែង" },
];

const UI = {
  en: {
    category: "KNOWLEDGE CATEGORY",
    title: "Road Traffic Law",
    titleKm: "ច្បាប់ចរាចរណ៍ផ្លូវ",
    desc: "Learn essential road traffic laws and regulations in Cambodia. Study law articles, case studies, and Q&A to understand your responsibilities as a road user.",
    back: "Back to Categories",
    search: "Search by topic or question...",
    all: "All Topics",
    showing: "Showing", of: "of", topics: "topics",
    noTopics: "No topics found",
    reset: "Reset",
    questions: "Questions",
    answer: "Answer",
    hint: "Hint",
    lawRef: "Law Reference",
    playAudio: "Play Audio",
    stopAudio: "Stop",
    loadingQ: "Loading questions...",
    tapReveal: "Tap a question to see the answer",
  },
  kh: {
    category: "ប្រភេទចំណេះដឹង",
    title: "ច្បាប់ចរាចរណ៍ផ្លូវ",
    titleKm: "Road Traffic Law",
    desc: "រៀនច្បាប់ និងបទប្បញ្ញត្តិចរាចរណ៍ផ្លូវសំខាន់ៗនៅកម្ពុជា។",
    back: "ត្រឡប់ទៅប្រភេទ",
    search: "ស្វែងរកប្រធានបទ ឬសំណួរ...",
    all: "ប្រធានបទទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", topics: "ប្រធានបទ",
    noTopics: "រកមិនឃើញប្រធានបទ",
    reset: "កំណត់ឡើងវិញ",
    questions: "សំណួរ",
    answer: "ចម្លើយ",
    hint: "ힰ",
    lawRef: "ឯកសារយោងច្បាប់",
    playAudio: "ចាក់សំឡេង",
    stopAudio: "ឈប់",
    loadingQ: "កំពុងផ្ទុកសំណួរ...",
    tapReveal: "ចុចលើសំណួរដើម្បីមើលចម្លើយ",
  },
} as const;

// ── Audio button used inside question detail ──────────────────────────────────
function AudioButton({ url, isKh, t }: { url: string; isKh: boolean; t: typeof UI.en }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
      playingRef.current = false;
    };
  }, [url]);

  const handle = () => {
    if (playingRef.current || loadingAudio) {
      audioRef.current?.pause();
      if (audioRef.current) { audioRef.current.src = ""; audioRef.current = null; }
      playingRef.current = false; setPlaying(false); setLoadingAudio(false);
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setLoadingAudio(true);
    audio.addEventListener("canplaythrough", () => {
      audio.play().catch(() => { setLoadingAudio(false); setPlaying(false); playingRef.current = false; });
      setLoadingAudio(false); setPlaying(true); playingRef.current = true;
    }, { once: true });
    audio.addEventListener("ended", () => { setPlaying(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.addEventListener("error", () => { setPlaying(false); setLoadingAudio(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.load();
  };

  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black font-black text-sm transition-all select-none ${
        loadingAudio ? "bg-zinc-100 text-zinc-400 cursor-wait"
        : playing ? "bg-black text-yellow-400 shadow-[3px_3px_0_#ca8a04] hover:bg-zinc-800"
        : "bg-white hover:bg-yellow-400 shadow-[3px_3px_0_#000] hover:shadow-[3px_3px_0_#ca8a04]"
      }`}
      style={kf}
    >
      {loadingAudio ? (
        <><span className="flex gap-0.5 items-end h-3">{[60,100,75].map((h,i)=><span key={i} className="w-1 bg-zinc-400 rounded-sm animate-pulse" style={{height:`${h}%`,animationDelay:`${i*120}ms`}}/>)}</span>{isKh?"កំពុងផ្ទុក...":"Loading..."}</>
      ) : playing ? (
        <><span className="flex gap-0.5 items-end h-3">{[60,100,75,90].map((h,i)=><span key={i} className="w-1 bg-yellow-400 rounded-sm animate-pulse" style={{height:`${h}%`,animationDelay:`${i*100}ms`}}/>)}</span>{t.stopAudio}</>
      ) : (
        <><Volume2 size={15}/>{t.playAudio}</>
      )}
    </button>
  );
}

// ── Main Catalogue ────────────────────────────────────────────────────────────
export function RoadTrafficCatalogue() {
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.kh : UI.en;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  // questions cache: topicId -> Question[]
  const [questionsCache, setQuestionsCache] = useState<Record<number, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState<Record<number, boolean>>({});
  // expanded topic
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  // expanded question (shows answer)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Fetch topics once
  useEffect(() => {
    setLoading(true);
    fetch("/api/public/topics?categoryId=2&status=published")
      .then((r) => r.json())
      .then((d) => setTopics(d.topics || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Lazy-load questions when a topic is expanded
  const expandTopic = async (topicId: number) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
      setExpandedQuestion(null);
      return;
    }
    setExpandedTopic(topicId);
    setExpandedQuestion(null);
    if (questionsCache[topicId]) return; // already loaded
    setLoadingQuestions((prev) => ({ ...prev, [topicId]: true }));
    try {
      const res = await fetch(`/api/public/topics/${topicId}/questions`);
      const data = await res.json();
      setQuestionsCache((prev) => ({ ...prev, [topicId]: data.questions || [] }));
    } catch {
      setQuestionsCache((prev) => ({ ...prev, [topicId]: [] }));
    } finally {
      setLoadingQuestions((prev) => ({ ...prev, [topicId]: false }));
    }
  };

  const toggleQuestion = (qId: number) => {
    setExpandedQuestion(expandedQuestion === qId ? null : qId);
  };

  // Filter topics
  const filtered = topics.filter((tp) => {
    const matchSearch = !search.trim() || (
      tp.name_en.toLowerCase().includes(search.toLowerCase()) ||
      tp.name_km.includes(search) ||
      tp.topic_code.toLowerCase().includes(search.toLowerCase())
    );
    const matchGroup = !subGroupFilter || tp.sub_group === subGroupFilter;
    return matchSearch && matchGroup;
  });

  const countMap = topics.reduce<Record<string, number>>((acc, tp) => {
    acc[tp.sub_group] = (acc[tp.sub_group] || 0) + 1;
    return acc;
  }, {});
  const availableGroups = SUB_GROUPS.filter((sg) => countMap[sg.key]);
  const isDefaultFilter = !subGroupFilter && !search.trim();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Blue Header Banner ─────────────────────────────────────── */}
      <div className="bg-blue-400 border-b-4 border-black" style={{ boxShadow: "0 4px 0 #000" }}>
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="inline-block bg-black text-white px-3 py-1 font-bold text-xs mb-4" style={kf}>
                {t.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-1" style={kf}>{t.title}</h1>
              <h2 className="text-lg md:text-xl font-bold mb-4 opacity-80" style={kf}>{t.titleKm}</h2>
              <p className="text-sm md:text-base max-w-2xl opacity-90" style={kf}>{t.desc}</p>
            </div>
            {/* Icon box */}
            <div className="hidden lg:flex shrink-0 w-36 h-36 xl:w-44 xl:h-44 bg-white border-4 border-black items-center justify-center" style={{ boxShadow: "8px 8px 0 #000" }}>
              <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="3">
                <rect x="15" y="20" width="70" height="60" rx="2"/>
                <line x1="15" y1="38" x2="85" y2="38"/>
                <line x1="35" y1="20" x2="35" y2="80"/>
                <circle cx="25" cy="29" r="3" fill="currentColor"/>
                <circle cx="50" cy="55" r="8"/>
                <line x1="50" y1="47" x2="50" y2="55"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Back Button ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <button
          onClick={() => window.history.back()}
          className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2 text-sm"
          style={kf}
        >
          <ArrowLeft size={16} />
          {t.back}
        </button>
      </div>

      {/* ── Filter + Search bar ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-5">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSubGroupFilter(""); setExpandedTopic(null); setExpandedQuestion(null); }}
              className="w-full pl-10 pr-9 py-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] text-sm"
              style={kf}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Tag pills — same style as road-sign */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
            {/* All */}
            <button
              onClick={() => { setSubGroupFilter(""); setExpandedTopic(null); setExpandedQuestion(null); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${
                !subGroupFilter && !search
                  ? "bg-black text-yellow-400 shadow-[2px_2px_0_#ca8a04]"
                  : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
              }`}
              style={kf}
            >
              {t.all}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${!subGroupFilter && !search ? "bg-yellow-400 text-black" : "bg-zinc-100 text-zinc-600"}`}>
                {topics.length}
              </span>
            </button>

            <span className="w-px h-4 bg-zinc-300 shrink-0 mx-0.5" />

            {availableGroups.map((sg) => {
              const isActive = subGroupFilter === sg.key && !search;
              return (
                <button
                  key={sg.key}
                  onClick={() => { setSubGroupFilter(sg.key); setExpandedTopic(null); setExpandedQuestion(null); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${
                    isActive
                      ? "bg-yellow-400 border-black shadow-[2px_2px_0_#000]"
                      : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                  }`}
                  style={kf}
                >
                  {isKh ? sg.km : sg.en}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-black text-yellow-400" : "bg-zinc-100 text-zinc-600"}`}>
                    {countMap[sg.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Count + reset */}
          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500" style={kf}>
              {t.showing} <span className="text-black font-black">{filtered.length}</span> {t.of} {topics.length} {t.topics}
              {subGroupFilter && !search && (
                <span className="ml-2 text-yellow-700">
                  — {isKh ? SUB_GROUPS.find((s) => s.key === subGroupFilter)?.km : SUB_GROUPS.find((s) => s.key === subGroupFilter)?.en}
                </span>
              )}
            </p>
            {!isDefaultFilter && (
              <button
                onClick={() => { setSubGroupFilter(""); setSearch(""); setExpandedTopic(null); setExpandedQuestion(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-black underline"
                style={kf}
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Topics + Questions List ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 border-2 border-black animate-pulse" style={{ boxShadow: "4px 4px 0 #000" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
            <p className="text-zinc-600 font-bold" style={kf}>{t.noTopics}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((topic) => {
              const isOpen = expandedTopic === topic.id;
              const qs = questionsCache[topic.id] || [];
              const isLoadingQ = loadingQuestions[topic.id];
              const subGroup = SUB_GROUPS.find((s) => s.key === topic.sub_group);
              const audioUrl = isKh ? topic.audio_url_km : topic.audio_url_en;

              return (
                <div
                  key={topic.id}
                  className="bg-white border-2 border-black"
                  style={{ boxShadow: "4px 4px 0 #000" }}
                >
                  {/* ── Topic row — click to expand ── */}
                  <button
                    onClick={() => expandTopic(topic.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors ${isOpen ? "bg-blue-400" : "hover:bg-blue-50"}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className={`font-mono text-[10px] font-black px-2 py-0.5 border shrink-0 ${isOpen ? "bg-black text-yellow-400 border-black" : "bg-zinc-100 border-zinc-300 text-zinc-500"}`}>
                        {topic.topic_code}
                      </span>
                      {subGroup && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 border shrink-0 ${isOpen ? "bg-blue-500 border-blue-600 text-white" : "bg-blue-50 border-blue-200 text-blue-700"}`} style={kf}>
                          {isKh ? subGroup.km : subGroup.en}
                        </span>
                      )}
                      <span className={`font-black text-sm md:text-base truncate ${isOpen ? "text-black" : "text-zinc-900"}`} style={kf}>
                        {isKh ? topic.name_km : topic.name_en}
                      </span>
                    </div>
                    {isOpen
                      ? <ChevronUp size={20} className="shrink-0 text-black" />
                      : <ChevronDown size={20} className="shrink-0 text-zinc-400" />
                    }
                  </button>

                  {/* ── Expanded topic content ── */}
                  {isOpen && (
                    <div className="border-t-2 border-black">

                      {/* Topic image */}
                      {topic.primary_image_url && (
                        <div className="border-b-2 border-black">
                          <img
                            src={topic.primary_image_url}
                            alt={isKh ? topic.name_km : topic.name_en}
                            className="w-full object-cover max-h-64"
                          />
                        </div>
                      )}

                      {/* Description + audio */}
                      <div className="px-4 py-4 bg-zinc-50 border-b-2 border-black space-y-3">
                        {(topic.description_en || topic.description_km) && (
                          <p className="text-sm text-zinc-700 leading-relaxed" style={kf}>
                            {isKh ? topic.description_km : topic.description_en}
                          </p>
                        )}
                        {topic.law_reference && (
                          <div className="bg-amber-50 border-2 border-amber-300 px-3 py-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5" style={kf}>{t.lawRef}</p>
                            <p className="text-xs font-mono text-amber-900" style={kf}>{topic.law_reference}</p>
                          </div>
                        )}
                        {audioUrl && <AudioButton url={audioUrl} isKh={isKh} t={t} />}
                      </div>

                      {/* Questions */}
                      <div className="px-4 py-4 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3" style={kf}>
                          {t.questions} {qs.length > 0 && `(${qs.length})`}
                        </p>

                        {isLoadingQ ? (
                          <div className="space-y-2">
                            {[1,2,3].map((i) => <div key={i} className="h-12 bg-gray-200 border-2 border-black animate-pulse" />)}
                          </div>
                        ) : qs.length === 0 ? (
                          <p className="text-xs text-zinc-400 font-bold" style={kf}>{t.loadingQ}</p>
                        ) : (
                          <>
                            <p className="text-[10px] text-zinc-400 mb-2" style={kf}>👆 {t.tapReveal}</p>
                            <div className="space-y-2">
                              {qs.map((q, qi) => {
                                const isQOpen = expandedQuestion === q.id;
                                const correct = q.answers.find((a) => a.is_correct);
                                const qAudio = isKh ? q.audio_url_km : q.audio_url_en;

                                return (
                                  <div key={q.id} className={`border-2 transition-all ${isQOpen ? "border-yellow-400" : "border-black"}`}>
                                    {/* Question row */}
                                    <button
                                      onClick={() => toggleQuestion(q.id)}
                                      className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors ${isQOpen ? "bg-yellow-400" : "hover:bg-yellow-50"}`}
                                    >
                                      <span className={`font-black text-[10px] px-1.5 py-0.5 shrink-0 mt-0.5 ${isQOpen ? "bg-black text-yellow-400" : "bg-black text-white"}`}>
                                        Q{qi + 1}
                                      </span>
                                      <span className="font-bold text-sm flex-1 leading-snug" style={kf}>
                                        {isKh ? q.question_km : q.question_en}
                                      </span>
                                      {isQOpen
                                        ? <ChevronUp size={16} className="shrink-0 mt-0.5 text-black" />
                                        : <ChevronDown size={16} className="shrink-0 mt-0.5 text-zinc-400" />
                                      }
                                    </button>

                                    {/* Answer panel */}
                                    {isQOpen && (
                                      <div className="border-t-2 border-black bg-white p-3 space-y-3">
                                        {/* Question image */}
                                        {q.image_url && (
                                          <img
                                            src={q.image_url}
                                            alt="Question"
                                            className="w-full border-2 border-black object-cover"
                                            style={{ aspectRatio: "16/9" }}
                                          />
                                        )}

                                        {/* Correct answer */}
                                        {correct && (
                                          <div className="bg-green-50 border-2 border-green-500 px-3 py-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-1" style={kf}>{t.answer}</p>
                                            <p className="font-black text-sm text-green-900" style={kf}>
                                              {isKh ? correct.answer_km : correct.answer_en}
                                            </p>
                                          </div>
                                        )}

                                        {/* Hint */}
                                        {(q.hint_en || q.hint_km) && (
                                          <div className="bg-blue-50 border-2 border-blue-300 px-3 py-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1" style={kf}>💡 {t.hint}</p>
                                            <p className="text-xs text-blue-900" style={kf}>{isKh ? q.hint_km : q.hint_en}</p>
                                          </div>
                                        )}

                                        {/* Per-question audio */}
                                        {qAudio && <AudioButton url={qAudio} isKh={isKh} t={t} />}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
