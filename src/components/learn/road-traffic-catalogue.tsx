"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Search, ArrowLeft, X, Volume2, ChevronDown } from "lucide-react";
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
  { key: "Traffic Rules", en: "Traffic Rules", km: "វិធាន" },
  { key: "Speed Limits", en: "Speed Limits", km: "ល្បឿន" },
  { key: "Parking", en: "Parking", km: "ចត" },
  { key: "Overtaking", en: "Overtaking", km: "ជែង" },
];

const UI = {
  en: {
    back: "Back to Categories",
    search: "Search questions...",
    all: "All Questions",
    showing: "Showing", of: "of", questions: "questions",
    noQ: "No questions found",
    reset: "Reset",
    answer: "Answer",
    hint: "Hint",
    lawRef: "Law Reference",
    playAudio: "Play Audio",
    stopAudio: "Stop",
    tapHint: "Tap any card to see the answer",
  },
  kh: {
    back: "ត្រឡប់ទៅប្រភេទ",
    search: "ស្វែងរកសំណួរ...",
    all: "សំណួរទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", questions: "សំណួរ",
    noQ: "រកមិនឃើញសំណួរ",
    reset: "កំណត់ឡើងវិញ",
    answer: "ចម្លើយ",
    hint: "ힰ",
    lawRef: "ឯកសារយោងច្បាប់",
    playAudio: "ចាក់សំឡេង",
    stopAudio: "ឈប់",
    tapHint: "ចុចលើប័ណ្ណដើម្បីមើលចម្លើយ",
  },
} as const;

// ── Flat list of all questions with their topic attached ──────────────────────
interface FlatQuestion extends Question {
  topic: Topic;
}

// ── Detail Panel (opens inline after the row, like road-sign) ─────────────────
function DetailPanel({
  item, isKh, kf, t, onClose,
}: {
  item: FlatQuestion;
  isKh: boolean;
  kf: React.CSSProperties;
  t: typeof UI.en;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Scroll panel into view
  useEffect(() => {
    const timer = setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
    return () => clearTimeout(timer);
  }, [item.id]);

  // Cleanup audio on unmount / item change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      playingRef.current = false;
    };
  }, [item.id]);

  const audioUrl = isKh
    ? (item.audio_url_km || item.topic.audio_url_km)
    : (item.audio_url_en || item.topic.audio_url_en);

  const correctAnswer = item.answers.find((a) => a.is_correct);
  const subGroup = SUB_GROUPS.find((s) => s.key === item.topic.sub_group);

  const handleAudio = () => {
    if (!audioUrl) return;
    if (playingRef.current || loadingAudio) {
      audioRef.current?.pause();
      if (audioRef.current) { audioRef.current.src = ""; audioRef.current = null; }
      playingRef.current = false;
      setPlaying(false);
      setLoadingAudio(false);
      return;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setLoadingAudio(true);
    audio.addEventListener("canplaythrough", () => {
      audio.play().catch(() => { setLoadingAudio(false); setPlaying(false); playingRef.current = false; });
      setLoadingAudio(false);
      setPlaying(true);
      playingRef.current = true;
    }, { once: true });
    audio.addEventListener("ended", () => { setPlaying(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.addEventListener("error", () => { setPlaying(false); setLoadingAudio(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.load();
  };

  return (
    <div
      ref={panelRef}
      className="col-span-full border-4 border-yellow-400 bg-white"
      style={{ boxShadow: "6px 6px 0 #000", scrollMarginTop: "100px" }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 bg-yellow-400 border-b-2 border-black">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-black bg-black text-yellow-400 px-2 py-0.5">
            {item.topic.topic_code}
          </span>
          {subGroup && (
            <span className="text-xs font-bold text-black/70" style={kf}>
              {isKh ? subGroup.km : subGroup.en}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">

        {/* Question */}
        <p className="font-black text-base md:text-lg leading-snug" style={kf}>
          {isKh ? item.question_km : item.question_en}
        </p>

        {/* Image (if any) */}
        {item.image_url && (
          <div className="border-2 border-black overflow-hidden">
            <img
              src={item.image_url}
              alt="Question scenario"
              className="w-full object-cover"
              style={{ aspectRatio: "16/9" }}
            />
          </div>
        )}

        {/* Answer */}
        {correctAnswer && (
          <div className="bg-green-50 border-2 border-green-500 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1" style={kf}>
              {t.answer}
            </p>
            <p className="font-black text-base text-green-900" style={kf}>
              {isKh ? correctAnswer.answer_km : correctAnswer.answer_en}
            </p>
          </div>
        )}

        {/* Hint */}
        {(item.hint_en || item.hint_km) && (
          <div className="bg-blue-50 border-2 border-blue-300 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1" style={kf}>
              💡 {t.hint}
            </p>
            <p className="text-sm text-blue-900" style={kf}>
              {isKh ? item.hint_km : item.hint_en}
            </p>
          </div>
        )}

        {/* Law reference */}
        {item.topic.law_reference && (
          <div className="bg-amber-50 border-2 border-amber-300 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1" style={kf}>
              {t.lawRef}
            </p>
            <p className="text-xs font-mono text-amber-900" style={kf}>
              {item.topic.law_reference}
            </p>
          </div>
        )}

        {/* Audio */}
        {audioUrl && (
          <button
            onClick={handleAudio}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black font-black text-sm transition-all select-none ${loadingAudio
                ? "bg-zinc-100 text-zinc-400 cursor-wait"
                : playing
                  ? "bg-black text-yellow-400 shadow-[3px_3px_0_#ca8a04] hover:bg-zinc-800"
                  : "bg-white hover:bg-yellow-400 shadow-[3px_3px_0_#000] hover:shadow-[3px_3px_0_#ca8a04]"
              }`}
            style={kf}
          >
            {loadingAudio ? (
              <>
                <span className="flex gap-0.5 items-end h-3">
                  {[60, 100, 75].map((h, i) => (
                    <span key={i} className="w-1 bg-zinc-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />
                  ))}
                </span>
                {isKh ? "កំពុងផ្ទុក..." : "Loading..."}
              </>
            ) : playing ? (
              <>
                <span className="flex gap-0.5 items-end h-3">
                  {[60, 100, 75, 90].map((h, i) => (
                    <span key={i} className="w-1 bg-yellow-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </span>
                {t.stopAudio}
              </>
            ) : (
              <>
                <Volume2 size={15} />
                {t.playAudio}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────
function QuestionCard({
  item, isSelected, isKh, kf, onClick,
}: {
  item: FlatQuestion;
  isSelected: boolean;
  isKh: boolean;
  kf: React.CSSProperties;
  onClick: () => void;
}) {
  const subGroup = SUB_GROUPS.find((s) => s.key === item.topic.sub_group);

  return (
    <button
      onClick={onClick}
      aria-expanded={isSelected}
      className={`group w-full text-left border-2 transition-all duration-150 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${isSelected
          ? "border-yellow-400 bg-yellow-400 shadow-[4px_4px_0_#ca8a04]"
          : "border-black bg-white hover:border-yellow-400 hover:bg-yellow-50 hover:shadow-[4px_4px_0_#ca8a04]"
        }`}
    >
      {/* Card body */}
      <div className="flex-1 p-3 md:p-4 space-y-2">
        {/* Code + subgroup badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-mono text-[9px] font-black px-1.5 py-0.5 border ${isSelected ? "bg-black text-yellow-400 border-black" : "bg-zinc-100 border-zinc-300 text-zinc-500"
            }`}>
            {item.topic.topic_code}
          </span>
          {subGroup && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${isSelected ? "bg-yellow-500 border-yellow-600 text-black" : "bg-blue-50 border-blue-200 text-blue-700"
              }`} style={kf}>
              {isKh ? subGroup.km : subGroup.en}
            </span>
          )}
        </div>

        {/* Question text */}
        <p className={`text-xs md:text-sm font-bold leading-snug line-clamp-3 ${isSelected ? "text-black" : "text-zinc-800 group-hover:text-black"
          }`} style={kf}>
          {isKh ? item.question_km : item.question_en}
        </p>
      </div>

      {/* Footer — tap indicator */}
      <div className={`border-t-2 px-3 py-1.5 w-full flex items-center justify-between transition-colors ${isSelected ? "border-yellow-500 bg-yellow-500" : "border-black bg-zinc-50 group-hover:border-yellow-500 group-hover:bg-yellow-100"
        }`}>
        <span className={`text-[9px] font-black uppercase tracking-wide ${isSelected ? "text-black" : "text-zinc-400"}`} style={kf}>
          {isSelected ? (isKh ? "បិទ" : "Close") : (isKh ? "ចុចមើល" : "Tap to reveal")}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isSelected ? "rotate-180 text-black" : "text-zinc-400"}`}
        />
      </div>
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
  const [allQuestions, setAllQuestions] = useState<FlatQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<FlatQuestion | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(3);

  // Track responsive column count
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCols(4);
      else if (window.innerWidth >= 768) setCols(3);
      else if (window.innerWidth >= 640) setCols(2);
      else setCols(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Fetch topics then all their questions
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/public/topics?categoryId=2&status=published");
        const data = await res.json();
        const fetchedTopics: Topic[] = data.topics || [];
        setTopics(fetchedTopics);

        // Fetch questions for all topics in parallel
        const results = await Promise.all(
          fetchedTopics.map((topic) =>
            fetch(`/api/public/topics/${topic.id}/questions`)
              .then((r) => r.json())
              .then((d) =>
                (d.questions || []).map((q: Question) => ({ ...q, topic }))
              )
              .catch(() => [])
          )
        );
        setAllQuestions(results.flat());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtered list
  const filtered = allQuestions.filter((item) => {
    const matchSearch = !search.trim() || (
      item.question_en.toLowerCase().includes(search.toLowerCase()) ||
      item.question_km.includes(search) ||
      item.topic.topic_code.toLowerCase().includes(search.toLowerCase())
    );
    const matchGroup = !subGroupFilter || item.topic.sub_group === subGroupFilter;
    return matchSearch && matchGroup;
  });

  const handleCardClick = (item: FlatQuestion) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const handleFilterChange = (key: string) => {
    setSubGroupFilter(key);
    setSelectedItem(null);
  };

  // Count per sub_group
  const countMap = allQuestions.reduce<Record<string, number>>((acc, q) => {
    acc[q.topic.sub_group] = (acc[q.topic.sub_group] || 0) + 1;
    return acc;
  }, {});

  const availableGroups = SUB_GROUPS.filter((sg) => countMap[sg.key]);
  const isDefaultFilter = subGroupFilter === "" && !search.trim();

  return (
    <div className="min-h-screen bg-white">

      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
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
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSubGroupFilter(""); setSelectedItem(null); }}
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
          <div
            className="flex items-center gap-1.5 overflow-x-auto py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {/* All */}
            <button
              onClick={() => handleFilterChange("")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${subGroupFilter === "" && !search
                  ? "bg-black text-yellow-400 shadow-[2px_2px_0_#ca8a04]"
                  : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                }`}
              style={kf}
            >
              {t.all}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${subGroupFilter === "" && !search ? "bg-yellow-400 text-black" : "bg-zinc-100 text-zinc-600"
                }`}>
                {allQuestions.length}
              </span>
            </button>

            <span className="w-px h-4 bg-zinc-300 shrink-0 mx-0.5" />

            {availableGroups.map((sg) => {
              const isActive = subGroupFilter === sg.key && !search;
              return (
                <button
                  key={sg.key}
                  onClick={() => handleFilterChange(sg.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${isActive
                      ? "bg-yellow-400 border-black shadow-[2px_2px_0_#000]"
                      : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                    }`}
                  style={kf}
                >
                  {isKh ? sg.km : sg.en}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-black text-yellow-400" : "bg-zinc-100 text-zinc-600"
                    }`}>
                    {countMap[sg.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Count + reset */}
          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500" style={kf}>
              {t.showing} <span className="text-black font-black">{filtered.length}</span> {t.of} {allQuestions.length} {t.questions}
              {subGroupFilter && !search && (
                <span className="ml-2 text-yellow-700">
                  — {isKh ? SUB_GROUPS.find((s) => s.key === subGroupFilter)?.km : SUB_GROUPS.find((s) => s.key === subGroupFilter)?.en}
                </span>
              )}
            </p>
            {!isDefaultFilter && (
              <button
                onClick={() => { setSubGroupFilter(""); setSearch(""); setSelectedItem(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-black underline"
                style={kf}
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Questions Grid ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-12" ref={gridRef}>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 border-2 border-black animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
            <p className="text-zinc-600 font-bold" style={kf}>{t.noQ}</p>
          </div>
        ) : (
          <>
            {/* Tap hint */}
            <p className="text-xs font-bold text-zinc-400 mb-3 text-center" style={kf}>
              👆 {t.tapHint}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((item, idx) => {
                const isSelected = selectedItem?.id === item.id;
                const isLastInRow = (idx + 1) % cols === 0 || idx === filtered.length - 1;
                const selectedIdx = selectedItem
                  ? filtered.findIndex((q) => q.id === selectedItem.id)
                  : -1;
                const showPanelAfter =
                  selectedItem &&
                  selectedIdx >= 0 &&
                  idx >= selectedIdx &&
                  Math.floor(idx / cols) === Math.floor(selectedIdx / cols) &&
                  isLastInRow;

                return (
                  <Fragment key={item.id}>
                    <QuestionCard
                      item={item}
                      isSelected={isSelected}
                      isKh={isKh}
                      kf={kf}
                      onClick={() => handleCardClick(item)}
                    />

                    {showPanelAfter && selectedItem && (
                      <DetailPanel
                        key={`panel-${selectedItem.id}`}
                        item={selectedItem}
                        isKh={isKh}
                        kf={kf}
                        t={t}
                        onClose={() => setSelectedItem(null)}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
