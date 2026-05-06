"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { SaveCardButton } from "./save-card-button";
import { CategoryHero, CategoryHeroConfig } from "./category-hero";

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
  { key: "Basic Maneuvers", en: "Basic Maneuvers", km: "ចលនាមូលដ្ឋាន" },
  { key: "Advanced Techniques", en: "Advanced Techniques", km: "បច្ចេកទេសកម្រិតខ្ពស់" },
  { key: "Defensive Driving", en: "Defensive Driving", km: "បើកបរការពារ" },
];

const UI = {
  en: {
    category: "KNOWLEDGE CATEGORY",
    title: "Driving Skills",
    titleKm: "ជំនាញបើកបរ",
    desc: "Learn proper driving techniques and best practices for road safety.",
    back: "Back to Categories",
    search: "Search questions...",
    all: "All",
    showing: "Showing", of: "of", questions: "questions",
    noQuestions: "No questions found",
    reset: "Reset",
    answer: "Answer",
    lawRef: "Law Reference",
    playAudio: "Play Audio",
    stopAudio: "Stop",
  },
  kh: {
    category: "ប្រភេទចំណេះដឹង",
    title: "ជំនាញបើកបរ",
    titleKm: "Driving Skills",
    desc: "រៀនបច្ចេកទេសបើកបរត្រឹមត្រូវ និងការអនុវត្តល្អបំផុតសម្រាប់សុវត្ថិភាពផ្លូវ។",
    back: "ត្រឡប់ទៅប្រភេទ",
    search: "ស្វែងរកសំណួរ...",
    all: "ទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", questions: "សំណួរ",
    noQuestions: "រកមិនឃើញសំណួរ",
    reset: "កំណត់ឡើងវិញ",
    answer: "ចម្លើយ",
    lawRef: "ឯកសារយោងច្បាប់",
    playAudio: "ចាក់សំឡេង",
    stopAudio: "ឈប់",
  },
} as const;

// ── Audio hook ──────────────────────────────────────────────────────────────
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

      {/* ── Meta strip: code + subgroup ── */}
      <div className="px-3 pt-2 pb-1 flex items-center gap-2">
        <span className="font-mono text-[9px] font-black bg-zinc-100 border border-zinc-300 text-zinc-400 px-1.5 py-0.5 rounded">
          {topic.topic_code}
        </span>
        {subGroup && (
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider" style={kf}>
            {isKh ? subGroup.km : subGroup.en}
          </span>
        )}
      </div>

      {/* ── Image — full width, capped at 200px ── */}
      {topic.primary_image_url && (
        <div className="overflow-hidden" style={{ maxHeight: "200px" }}>
          <img
            src={topic.primary_image_url}
            alt={isKh ? topic.name_km : topic.name_en}
            className="w-full object-cover"
            style={{ maxHeight: "200px" }}
          />
        </div>
      )}

      <div className="px-3 pb-3">
        {/* ── Title ── */}
        <p className="text-sm font-black leading-snug text-black mt-2 mb-2" style={kf}>
          {isKh ? topic.name_km : topic.name_en}
        </p>

        {/* ── Answer zone ── */}
        {answer && (
          <div className={`rounded overflow-hidden border transition-all duration-300 ${playing ? "border-yellow-400" : "border-emerald-400"}`}>
            <div className={`px-2 py-1 flex items-center gap-2 transition-colors duration-300 ${playing ? "bg-yellow-400" : "bg-emerald-500"}`}>
              <span className="text-[8px] font-black uppercase tracking-widest text-white" style={kf}>{t.answer}</span>
              {playing && (
                <span className="flex gap-0.5 items-end h-2.5 ml-auto">
                  {[60, 100, 75, 90, 55].map((h, i) => (
                    <span key={i} className="w-0.5 bg-black rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </span>
              )}
            </div>
            <div className={`px-3 py-2 transition-colors duration-300 ${playing ? "bg-yellow-50" : "bg-emerald-50"}`}>
              <p className={`font-bold text-sm leading-snug ${playing ? "text-black" : "text-emerald-900"}`} style={kf}>
                {answer}
              </p>
            </div>
          </div>
        )}

        {/* ── Law reference ── */}
        {topic.law_reference && (
          <div className="mt-1.5 rounded overflow-hidden border border-amber-300">
            <div className="bg-amber-400 px-2 py-0.5">
              <p className="text-[8px] font-black uppercase tracking-widest text-amber-900" style={kf}>{t.lawRef}</p>
            </div>
            <div className="bg-amber-50 px-2 py-1.5">
              <p className="text-[11px] font-mono text-amber-900" style={kf}>{topic.law_reference}</p>
            </div>
          </div>
        )}

        {/* ── Audio + Save row ── */}
        <div className="mt-2 flex items-center gap-2">
          {audioUrl && (
            <button
              onClick={toggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-black text-xs transition-all select-none rounded ${loading ? "bg-zinc-100 text-zinc-400 cursor-wait"
                : playing ? "bg-black text-green-400"
                  : "bg-white hover:bg-green-400"
                }`}
              style={kf}
            >
              {loading ? (
                <><span className="flex gap-0.5 items-end h-3">{[60, 100, 75].map((h, i) => <span key={i} className="w-0.5 bg-zinc-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />)}</span>{isKh ? "ផ្ទុក..." : "Loading..."}</>
              ) : playing ? (
                <><span className="flex gap-0.5 items-end h-3">{[60, 100, 75, 90, 55].map((h, i) => <span key={i} className="w-0.5 bg-green-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />)}</span>{t.stopAudio}</>
              ) : (
                <><Volume2 size={13} />{t.playAudio}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Category hero config ─────────────────────────────────────────────────────
const HERO_CONFIG: CategoryHeroConfig = {
  heroBg: "bg-green-400",
  titleColor: "text-black",
  subtitleColor: "text-black/60",
  descColor: "text-black/80",
  iconShadow: "shadow-[6px_6px_0_#000]",
  pillActiveBg: "bg-black",
  pillActiveText: "text-green-400",
  pillBadgeBg: "bg-green-400",
  pillBadgeText: "text-black",
  pillHoverBg: "hover:bg-green-400",
  emoji: "🚗",
  icon: (
    <svg viewBox="0 0 100 100" className="w-20 h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="15" y="40" width="70" height="30" rx="4" fill="#4ade80" stroke="#000" strokeWidth="3" />
      <path d="M 25 40 L 35 25 L 65 25 L 75 40" fill="#86efac" stroke="#000" strokeWidth="2" />
      <circle cx="30" cy="72" r="8" fill="#000" />
      <circle cx="70" cy="72" r="8" fill="#000" />
      <circle cx="30" cy="72" r="4" fill="#4ade80" />
      <circle cx="70" cy="72" r="4" fill="#4ade80" />
      <rect x="38" y="28" width="10" height="10" fill="#bfdbfe" stroke="#000" strokeWidth="1.5" />
      <rect x="52" y="28" width="10" height="10" fill="#bfdbfe" stroke="#000" strokeWidth="1.5" />
    </svg>
  ),
};

// ── Main Catalogue ────────────────────────────────────────────────────────────
export function DrivingCatalogue() {
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.kh : UI.en;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [questionNumbers, setQuestionNumbers] = useState<Record<number, number>>({});

  useEffect(() => {
    setLoading(true);
    fetch("/api/public/topics?categoryId=4&status=published")
      .then((r) => r.json())
      .then((d) => {
        const topicsData = d.topics || [];
        setTopics(topicsData);

        // Create sequential numbering for all topics
        const numbers: Record<number, number> = {};
        topicsData.forEach((topic: Topic, index: number) => {
          numbers[topic.id] = index + 1;
        });
        setQuestionNumbers(numbers);
      })
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <CategoryHero
        config={HERO_CONFIG}
        titleEn={UI.en.title}
        titleKm={UI.kh.title}
        descEn={UI.en.desc}
        descKm={UI.kh.desc}
        totalCount={topics.length}
        filteredCount={filtered.length}
        itemLabelEn="questions"
        itemLabelKm="សំណួរ"
        onBack={() => window.history.back()}
      />

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
                ? "bg-black text-green-400 shadow-[2px_2px_0_#16a34a]"
                : "bg-white hover:bg-green-400 hover:shadow-[2px_2px_0_#000]"
                }`}
              style={kf}
            >
              {t.all}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${!subGroupFilter && !search ? "bg-green-400 text-black" : "bg-zinc-100 text-zinc-600"}`}>
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${isActive ? "bg-green-400 border-black shadow-[2px_2px_0_#000]" : "bg-white hover:bg-green-400 hover:shadow-[2px_2px_0_#000]"
                    }`}
                  style={kf}
                >
                  {isKh ? sg.km : sg.en}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-black text-green-400" : "bg-zinc-100 text-zinc-600"}`}>
                    {countMap[sg.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Count + reset */}
          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500" style={kf}>
              {t.showing} <span className="text-black font-black">{filtered.length}</span> {t.of} {topics.length} {t.questions}
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
            <p className="text-zinc-600 font-bold" style={kf}>{t.noQuestions}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((topic, displayIndex) => {
              const isOpen = expandedTopic === topic.id;
              const question = isKh ? topic.name_km : topic.name_en;
              const questionNumber = questionNumbers[topic.id] || displayIndex + 1;

              return (
                <div
                  key={topic.id}
                  className={`border-2 border-black transition-all ${isOpen ? "shadow-[6px_6px_0_#16a34a]" : "shadow-[4px_4px_0_#000]"} bg-white`}
                >
                  {/* ── Question row — with numbering ── */}
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className={`w-full flex items-start justify-between gap-3 px-4 py-4 md:py-5 text-left transition-colors ${isOpen ? "bg-green-400" : "hover:bg-green-50"}`}
                  >
                    {/* Question number + text */}
                    <div className="flex-1 flex items-start gap-3">
                      <span className="font-black text-lg md:text-xl text-green-600 shrink-0 pt-0.5 min-w-[40px]">
                        {questionNumber}.
                      </span>
                      <p
                        className={`font-black text-base md:text-lg leading-snug ${isOpen ? "text-black" : "text-zinc-900"}`}
                        style={kf}
                      >
                        {question}
                      </p>
                    </div>
                    <span className="shrink-0 mt-0.5">
                      {isOpen
                        ? <ChevronUp size={22} className="text-black" />
                        : <ChevronDown size={22} className="text-zinc-400" />
                      }
                    </span>
                  </button>

                  {/* ── Answer panel ── */}
                  {isOpen && (
                    <>
                      <AnswerCard topic={topic} isKh={isKh} t={t} />
                      <div className="px-3 py-2 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end">
                        <SaveCardButton topic={topic} isKh={isKh} size="lg" />
                      </div>
                    </>
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
