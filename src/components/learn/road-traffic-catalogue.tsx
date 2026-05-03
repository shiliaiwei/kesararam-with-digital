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

const SUB_GROUPS: { key: string; en: string; km: string }[] = [
  { key: "Traffic Rules", en: "Traffic Rules", km: "វិធានចរាចរ" },
  { key: "Speed Limits", en: "Speed Limits", km: "ល្បឿន" },
  { key: "Parking", en: "Parking", km: "ចត" },
  { key: "Overtaking", en: "Overtaking", km: "ជែង" },
];

const UI = {
  en: {
    category: "KNOWLEDGE CATEGORY",
    title: "Road Traffic Law",
    titleKm: "ច្បាប់ចរាចរណ៍ផ្លូវ",
    desc: "Learn essential road traffic laws and regulations in Cambodia.",
    back: "Back to Categories",
    search: "Search questions...",
    all: "All",
    showing: "Showing", of: "of", topics: "questions",
    noTopics: "No questions found",
    reset: "Reset",
    answer: "Answer",
    lawRef: "Law Reference",
    playAudio: "Play Audio",
    stopAudio: "Stop",
  },
  kh: {
    category: "ប្រភេទចំណេះដឹង",
    title: "ច្បាប់ចរាចរណ៍ផ្លូវ",
    titleKm: "Road Traffic Law",
    desc: "រៀនច្បាប់ និងបទប្បញ្ញត្តិចរាចរណ៍ផ្លូវសំខាន់ៗនៅកម្ពុជា។",
    back: "ត្រឡប់ទៅប្រភេទ",
    search: "ស្វែងរកសំណួរ...",
    all: "ទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", topics: "សំណួរ",
    noTopics: "រកមិនឃើញសំណួរ",
    reset: "កំណត់ឡើងវិញ",
    answer: "ចម្លើយ",
    lawRef: "ឯកសារយោងច្បាប់",
    playAudio: "ចាក់សំឡេង",
    stopAudio: "ឈប់",
  },
} as const;

// ── Audio hook — returns playing state + handler ──────────────────────────────
function useAudio(url: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
      playingRef.current = false;
    };
  }, [url]);

  const toggle = () => {
    if (!url) return;
    if (playingRef.current || loading) {
      audioRef.current?.pause();
      if (audioRef.current) { audioRef.current.src = ""; audioRef.current = null; }
      playingRef.current = false; setPlaying(false); setLoading(false);
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setLoading(true);
    audio.addEventListener("canplaythrough", () => {
      audio.play().catch(() => { setLoading(false); setPlaying(false); playingRef.current = false; });
      setLoading(false); setPlaying(true); playingRef.current = true;
    }, { once: true });
    audio.addEventListener("ended", () => { setPlaying(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.addEventListener("error", () => { setPlaying(false); setLoading(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.load();
  };

  return { playing, loading, toggle };
}

// ── Expanded answer card ──────────────────────────────────────────────────────
function AnswerCard({ topic, isKh, t }: { topic: Topic; isKh: boolean; t: typeof UI.en }) {
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const audioUrl = isKh ? (topic.audio_url_km || topic.audio_url_en) : (topic.audio_url_en || topic.audio_url_km);
  const { playing, loading, toggle } = useAudio(audioUrl || null);

  const answer = isKh ? topic.description_km : topic.description_en;
  const subGroup = SUB_GROUPS.find((s) => s.key === topic.sub_group);

  return (
    <div className="border-t-2 border-black bg-white">

      {/* Meta info — 25% opacity, small, not distracting */}
      <div className="px-4 pt-3 flex items-center gap-2 opacity-30">
        <span className="font-mono text-[10px] font-black bg-zinc-200 px-1.5 py-0.5">
          {topic.topic_code}
        </span>
        {subGroup && (
          <span className="text-[10px] font-bold" style={kf}>
            {isKh ? subGroup.km : subGroup.en}
          </span>
        )}
      </div>

      {/* Image — centered, max 320px tall, never full bleed */}
      {topic.primary_image_url && (
        <div className="flex justify-center px-4 pt-4">
          <div className="border-2 border-black overflow-hidden w-full max-w-md">
            <img
              src={topic.primary_image_url}
              alt={isKh ? topic.name_km : topic.name_en}
              className="w-full object-cover"
              style={{ maxHeight: "220px", objectPosition: "center" }}
            />
          </div>
        </div>
      )}

      {/* Answer — highlighted yellow when audio plays */}
      {answer && (
        <div className={`mx-4 mt-3 px-4 py-3 border-2 rounded transition-all duration-300 ${playing ? "bg-yellow-200 border-yellow-400" : "bg-green-50 border-green-400"}`}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60" style={kf}>
            {t.answer}
          </p>
          <p className={`font-black text-base md:text-lg leading-relaxed ${playing ? "text-black" : "text-green-900"}`} style={kf}>
            {answer}
          </p>
        </div>
      )}

      {/* Law reference — subtle */}
      {topic.law_reference && (
        <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 opacity-70">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5" style={kf}>{t.lawRef}</p>
          <p className="text-xs font-mono text-amber-900" style={kf}>{topic.law_reference}</p>
        </div>
      )}

      {/* Audio button */}
      {audioUrl && (
        <div className="px-4 pt-4 pb-5">
          <button
            onClick={toggle}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 border-2 border-black font-black text-sm transition-all select-none ${loading ? "bg-zinc-100 text-zinc-400 cursor-wait"
              : playing ? "bg-black text-yellow-400 shadow-[4px_4px_0_#ca8a04]"
                : "bg-white hover:bg-yellow-400 shadow-[4px_4px_0_#000] hover:shadow-[4px_4px_0_#ca8a04]"
              }`}
            style={kf}
          >
            {loading ? (
              <><span className="flex gap-0.5 items-end h-4">{[60, 100, 75].map((h, i) => <span key={i} className="w-1 bg-zinc-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />)}</span>{isKh ? "កំពុងផ្ទុក..." : "Loading..."}</>
            ) : playing ? (
              <><span className="flex gap-0.5 items-end h-4">{[60, 100, 75, 90, 55].map((h, i) => <span key={i} className="w-1 bg-yellow-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />)}</span>{t.stopAudio}</>
            ) : (
              <><Volume2 size={18} />{t.playAudio}</>
            )}
          </button>
        </div>
      )}
    </div>
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
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/public/topics?categoryId=2&status=published")
      .then((r) => r.json())
      .then((d) => setTopics(d.topics || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleTopic = (id: number) => {
    setExpandedTopic(expandedTopic === id ? null : id);
  };

  const filtered = topics.filter((tp) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || (
      tp.name_en.toLowerCase().includes(q) ||
      tp.name_km.includes(search.trim()) ||
      tp.topic_code.toLowerCase().includes(q)
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

      {/* ── Blue Header ───────────────────────────────────────────── */}
      <div className="bg-blue-400 border-b-4 border-black" style={{ boxShadow: "0 4px 0 #000" }}>
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-block bg-black text-white px-3 py-1 font-bold text-xs mb-4" style={kf}>
                {t.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-1" style={kf}>{t.title}</h1>
              <h2 className="text-lg font-bold mb-3 opacity-70" style={kf}>{t.titleKm}</h2>
              <p className="text-sm max-w-xl opacity-80" style={kf}>{t.desc}</p>
            </div>
            <div className="hidden md:flex shrink-0 w-32 h-32 bg-white border-4 border-black items-center justify-center" style={{ boxShadow: "6px 6px 0 #000" }}>
              <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="3">
                <rect x="15" y="20" width="70" height="60" rx="2" />
                <line x1="15" y1="38" x2="85" y2="38" />
                <line x1="35" y1="20" x2="35" y2="80" />
                <circle cx="25" cy="29" r="3" fill="currentColor" />
                <circle cx="50" cy="55" r="8" />
                <line x1="50" y1="47" x2="50" y2="55" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Back Button ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        <button
          onClick={() => window.history.back()}
          className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2 text-sm"
          style={kf}
        >
          <ArrowLeft size={16} />
          {t.back}
        </button>
      </div>

      {/* ── Filter + Search ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-5">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSubGroupFilter(""); setExpandedTopic(null); }}
              className="w-full pl-10 pr-9 py-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] text-sm"
              style={kf}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Tag pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
            <button
              onClick={() => { setSubGroupFilter(""); setExpandedTopic(null); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${!subGroupFilter && !search
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
                  onClick={() => { setSubGroupFilter(sg.key); setExpandedTopic(null); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${isActive ? "bg-yellow-400 border-black shadow-[2px_2px_0_#000]" : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
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
            </p>
            {!isDefaultFilter && (
              <button
                onClick={() => { setSubGroupFilter(""); setSearch(""); setExpandedTopic(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-black underline"
                style={kf}
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Questions List ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
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
              const question = isKh ? topic.name_km : topic.name_en;

              return (
                <div
                  key={topic.id}
                  className={`border-2 border-black transition-all ${isOpen ? "shadow-[6px_6px_0_#1d4ed8]" : "shadow-[4px_4px_0_#000]"} bg-white`}
                >
                  {/* ── Question row — ONLY question text, no badges ── */}
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className={`w-full flex items-start justify-between gap-3 px-4 py-4 md:py-5 text-left transition-colors ${isOpen ? "bg-blue-400" : "hover:bg-blue-50"}`}
                  >
                    {/* Question text — full, no truncation */}
                    <p
                      className={`font-black text-base md:text-lg leading-snug flex-1 ${isOpen ? "text-black" : "text-zinc-900"}`}
                      style={kf}
                    >
                      {question}
                    </p>
                    <span className="shrink-0 mt-0.5">
                      {isOpen
                        ? <ChevronUp size={22} className="text-black" />
                        : <ChevronDown size={22} className="text-zinc-400" />
                      }
                    </span>
                  </button>

                  {/* ── Answer panel ── */}
                  {isOpen && (
                    <AnswerCard topic={topic} isKh={isKh} t={t} />
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
