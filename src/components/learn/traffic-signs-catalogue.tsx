"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Search, ArrowLeft, X, Volume2 } from "lucide-react";
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

const SUB_GROUPS: { key: string; en: string; km: string }[] = [
  { key: "Prohibitory Signs", en: "Prohibitory", km: "ហាមឃាត់" },
  { key: "Mandatory Signs", en: "Mandatory", km: "បង្គាប់" },
  { key: "Priority Signs", en: "Priority", km: "អាទិភាព" },
  { key: "Warning Signs", en: "Warning", km: "ព្រមាន" },
  { key: "Temporary Signs", en: "Temporary", km: "បណ្ដោះអាសន្ន" },
  { key: "Direction Signs", en: "Direction", km: "ទិសដៅ" },
  { key: "Buildup Area Boundary Signs", en: "Area Boundary", km: "ព្រំដែនតំបន់" },
  { key: "Street Name Signs", en: "Street Name", km: "ឈ្មោះផ្លូវវិថី" },
  { key: "Informative Signs", en: "Informative", km: "ព័ត៌មាន" },
  { key: "Supplementary Signs", en: "Supplementary", km: "បន្ថែម" },
  { key: "Sign Posts", en: "Sign Posts", km: "បង្គោលសញ្ញា" },
  { key: "Transverse Markings", en: "Transverse", km: "ចំណារឆ្លងកាត់" },
  { key: "Longitudinal Markings", en: "Longitudinal", km: "ចំណារបណ្ដោយ" },
  { key: "Arrows Markings", en: "Arrows", km: "ចំណារព្រួញ" },
  { key: "Other Road Markings", en: "Other Markings", km: "ចំណារផ្សេងទៀត" },
  { key: "Traffic Lights", en: "Traffic Lights", km: "ភ្លើងសញ្ញា" },
  { key: "Traffic Police Signals", en: "Police Signals", km: "សញ្ញាប៉ូលិស" },
];

// Default: show all signs on entry. User can tap a tag to filter.
function getDefaultFilter(): string {
  return "";
}

const UI = {
  en: {
    backButton: "Back to Categories",
    searchPlaceholder: "Search by sign name or code...",
    all: "All Signs",
    showing: "Showing", of: "of", signs: "signs",
    noSigns: "No signs found",
    lawRef: "Law Reference",
    relatedQ: "Related Questions",
    loadingQ: "Loading questions...",
    playAudio: "Play Audio",
    stopAudio: "Stop Audio",
    reset: "Reset",
  },
  kh: {
    backButton: "ត្រឡប់ទៅប្រភេទ",
    searchPlaceholder: "ស្វែងរកតាមឈ្មោះ ឬលេខកូដសញ្ញា...",
    all: "សញ្ញាទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", signs: "សញ្ញា",
    noSigns: "រកមិនឃើញសញ្ញា",
    lawRef: "ឯកសារយោងច្បាប់",
    relatedQ: "សំណួរពាក់ព័ន្ធ",
    loadingQ: "កំពុងផ្ទុកសំណួរ...",
    playAudio: "ចាក់សំឡេង",
    stopAudio: "ឈប់សំឡេង",
    reset: "កំណត់ឡើងវិញ",
  },
} as const;

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({
  topic, questions, loadingQuestions, isKh, kf, t, onClose,
}: {
  topic: Topic;
  questions: any[];
  loadingQuestions: boolean;
  isKh: boolean;
  kf: React.CSSProperties;
  t: typeof UI.en;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  // Use a ref so the stop handler always has the current audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [topic.id]);

  const name = isKh ? topic.name_km : topic.name_en;
  const description = isKh ? topic.description_km : topic.description_en;
  const audioUrl = isKh ? topic.audio_url_km : topic.audio_url_en;
  const subGroupLabel = SUB_GROUPS.find(s => s.key === topic.sub_group);

  // Cleanup when topic changes or panel unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      playingRef.current = false;
    };
  }, [topic.id]);

  const handleAudio = () => {
    if (!audioUrl) return;

    // STOP — audio is playing or loading
    if (playingRef.current || loadingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      playingRef.current = false;
      setPlaying(false);
      setLoadingAudio(false);
      return;
    }

    // PLAY — create fresh audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setLoadingAudio(true);

    audio.addEventListener("canplaythrough", () => {
      audio.play().catch(() => {
        setLoadingAudio(false);
        setPlaying(false);
        playingRef.current = false;
      });
      setLoadingAudio(false);
      setPlaying(true);
      playingRef.current = true;
    }, { once: true });

    audio.addEventListener("ended", () => {
      setPlaying(false);
      playingRef.current = false;
      audioRef.current = null;
    }, { once: true });

    audio.addEventListener("error", () => {
      setPlaying(false);
      setLoadingAudio(false);
      playingRef.current = false;
      audioRef.current = null;
    }, { once: true });

    audio.load();
  };

  return (
    <div ref={panelRef} className="col-span-full border-4 border-yellow-400 bg-white" style={{ boxShadow: "6px 6px 0 #000", scrollMarginTop: "100px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-yellow-400 border-b-2 border-black">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-black bg-black text-yellow-400 px-2 py-0.5">
            {topic.topic_code}
          </span>
          {subGroupLabel && (
            <span className="text-xs font-bold text-black/70" style={kf}>
              {isKh ? subGroupLabel.km : subGroupLabel.en}
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
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
        {/* Sign image */}
        <div className="flex items-center justify-center p-5 border-b-2 md:border-b-0 md:border-r-2 border-black bg-zinc-50">
          {topic.primary_image_url && (
            <img src={topic.primary_image_url} alt={name} className="object-contain max-h-36 max-w-full" />
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Title — yellow highlight when playing */}
          <h2
            className={`text-2xl font-black leading-tight transition-all duration-300 ${playing ? "bg-yellow-300/60 px-1 -mx-1 rounded-sm" : ""
              }`}
            style={kf}
          >
            {name}
          </h2>

          {/* Description — yellow highlight when playing */}
          {description && (
            <p
              className={`text-sm leading-relaxed transition-all duration-300 ${playing
                ? "bg-yellow-300/60 text-black font-bold px-2 py-1 -mx-2 rounded-sm"
                : "text-zinc-700"
                }`}
              style={kf}
            >
              {description}
            </p>
          )}

          {/* Law reference */}
          {topic.law_reference && (
            <div className="bg-blue-50 border-2 border-blue-200 px-3 py-2 text-xs text-blue-800">
              <span className="font-black uppercase block mb-0.5" style={kf}>{t.lawRef}</span>
              <span style={kf}>{topic.law_reference}</span>
            </div>
          )}

          {/* Audio button */}
          {audioUrl && (
            <div className="pt-1">
              <button
                onClick={handleAudio}
                className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-black font-black text-sm transition-all select-none ${loadingAudio
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
            </div>
          )}
        </div>
      </div>

      {/* Related questions */}
      {loadingQuestions ? (
        <div className="border-t-2 border-black px-5 py-4 text-xs font-bold text-zinc-400" style={kf}>
          {t.loadingQ}
        </div>
      ) : questions.length > 0 && (
        <div className="border-t-2 border-black px-5 py-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3" style={kf}>
            {t.relatedQ} ({questions.length})
          </p>
          {questions.map((q: any, i: number) => (
            <details key={q.id} className="border-2 border-black">
              <summary className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-zinc-50 list-none">
                <span className="font-black text-[10px] bg-black text-white px-1.5 py-0.5 shrink-0 mt-0.5">Q{i + 1}</span>
                <span className="font-bold text-sm flex-1" style={kf}>
                  {isKh ? q.question_km : q.question_en}
                </span>
              </summary>
              <div className="border-t-2 border-black bg-zinc-50 p-3 space-y-2">
                {q.answers?.map((a: any, ai: number) => (
                  <div key={a.id} className={`px-3 py-2 border-2 text-sm flex gap-2 ${a.is_correct ? "bg-green-100 border-green-500" : "bg-white border-zinc-200"}`}>
                    <span className="font-bold shrink-0">{String.fromCharCode(65 + ai)}.</span>
                    <span className="flex-1" style={kf}>{isKh ? a.answer_km : a.answer_en}</span>
                    {a.is_correct && <span className="text-green-600 font-black text-xs">✓</span>}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main catalogue ────────────────────────────────────────────────────────────
export function TrafficSignsCatalogue() {
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.kh : UI.en;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Initialise with alternating default (runs once on mount)
  const [subGroupFilter, setSubGroupFilter] = useState<string>(() => getDefaultFilter());
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(8);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(8); // lg
      else if (window.innerWidth >= 768) setCols(6); // md
      else if (window.innerWidth >= 640) setCols(4); // sm
      else setCols(3); // default (matches grid-cols-3)
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const handleTopicClick = async (topic: Topic) => {
    if (selectedTopic?.id === topic.id) {
      setSelectedTopic(null);
      setSelectedQuestions([]);
      return;
    }
    setSelectedTopic(topic);
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/public/topics/${topic.id}/questions`);
      const data = await res.json();
      setSelectedQuestions(data.questions || []);
    } catch {
      setSelectedQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleFilterChange = (key: string) => {
    setSubGroupFilter(key);
    setSelectedTopic(null);
    setSelectedQuestions([]);
  };

  useEffect(() => { fetchTopics(); }, []);

  useEffect(() => {
    let filtered = [...topics];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        tp => tp.name_en.toLowerCase().includes(q) ||
          tp.name_km.includes(search) ||
          tp.topic_code.toLowerCase().includes(q)
      );
    }
    if (subGroupFilter) {
      filtered = filtered.filter(tp => tp.sub_group === subGroupFilter);
    }
    setFilteredTopics(filtered);
  }, [topics, search, subGroupFilter]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/topics?categoryId=1&status=published");
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const availableKeys = new Set(topics.map(tp => tp.sub_group));
  // Category tags — all except "All Signs" which goes at the end
  const availableGroups = SUB_GROUPS.filter(sg => availableKeys.has(sg.key));
  const countMap = topics.reduce<Record<string, number>>((acc, tp) => {
    acc[tp.sub_group] = (acc[tp.sub_group] || 0) + 1;
    return acc;
  }, {});

  const isDefaultFilter = subGroupFilter === "";

  return (
    <div className="min-h-screen bg-white">

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <button
          onClick={() => window.history.back()}
          className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2 text-sm"
          style={kf}
        >
          <ArrowLeft size={16} />
          {t.backButton}
        </button>
      </div>

      {/* ── Filter Tag Bar ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSubGroupFilter(""); setSelectedTopic(null); }}
              className="w-full pl-10 pr-9 py-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] text-sm"
              style={kf}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Tag pills — single scrollable row, "All Signs" first */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {/* All Signs — first */}
            <button
              onClick={() => handleFilterChange("")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${subGroupFilter === "" && !search
                ? "bg-black text-yellow-400 shadow-[2px_2px_0_#ca8a04]"
                : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                }`}
              style={kf}
            >
              {t.all}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${subGroupFilter === "" && !search ? "bg-yellow-400 text-black" : "bg-zinc-100 text-zinc-600"}`}>
                {topics.length}
              </span>
            </button>

            {/* Divider */}
            <span className="w-px h-4 bg-zinc-300 shrink-0 mx-0.5" />

            {/* Category tags */}
            {availableGroups.map(sg => {
              const isActive = subGroupFilter === sg.key && !search;
              const count = countMap[sg.key] || 0;
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
                  {count > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-black text-yellow-400" : "bg-zinc-100 text-zinc-600"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result count + reset */}
          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500" style={kf}>
              {t.showing} <span className="text-black font-black">{filteredTopics.length}</span> {t.of} {topics.length} {t.signs}
              {subGroupFilter && !search && (
                <span className="ml-2 text-yellow-700">
                  — {isKh ? SUB_GROUPS.find(s => s.key === subGroupFilter)?.km : SUB_GROUPS.find(s => s.key === subGroupFilter)?.en}
                </span>
              )}
            </p>
            {(!isDefaultFilter || search) && (
              <button
                onClick={() => { setSubGroupFilter(getDefaultFilter()); setSearch(""); setSelectedTopic(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-black underline"
                style={kf}
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Signs Grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-12" ref={gridRef}>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
            <p className="text-zinc-600 font-bold" style={kf}>{t.noSigns}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredTopics.map((topic, idx) => {
              const isSelected = selectedTopic?.id === topic.id;
              const isLastInRow = (idx + 1) % cols === 0 || idx === filteredTopics.length - 1;
              const selectedIdx = selectedTopic ? filteredTopics.findIndex(tp => tp.id === selectedTopic.id) : -1;
              const showPanelAfter =
                selectedTopic &&
                selectedIdx >= 0 &&
                idx >= selectedIdx &&
                Math.floor(idx / cols) === Math.floor(selectedIdx / cols) &&
                isLastInRow;

              return (
                <Fragment key={topic.id}>
                  <button
                    onClick={() => handleTopicClick(topic)}
                    aria-expanded={isSelected}
                    className={`group border-2 transition-all duration-150 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${isSelected
                      ? "border-yellow-400 bg-yellow-400 shadow-[4px_4px_0_#ca8a04]"
                      : "border-black bg-white hover:border-yellow-400 hover:bg-yellow-400 hover:shadow-[4px_4px_0_#ca8a04]"
                      }`}
                  >
                    <div className="relative w-full overflow-hidden" style={{ paddingBottom: "100%" }}>
                      {topic.primary_image_url ? (
                        <img
                          src={topic.primary_image_url}
                          alt={topic.topic_code}
                          className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <span className="text-2xl">🚦</span>
                        </div>
                      )}
                    </div>
                    <div className={`border-t-2 px-1 py-1.5 w-full transition-colors ${isSelected ? "border-yellow-500 bg-yellow-500" : "border-black bg-zinc-50 group-hover:border-yellow-500 group-hover:bg-yellow-500"
                      }`}>
                      <div className="font-mono text-[9px] font-black text-center text-black leading-none">
                        {topic.topic_code}
                      </div>
                    </div>
                  </button>

                  {showPanelAfter && selectedTopic && (
                    <DetailPanel
                      key={`panel-${selectedTopic.id}`}
                      topic={selectedTopic}
                      questions={selectedQuestions}
                      loadingQuestions={loadingQuestions}
                      isKh={isKh}
                      kf={kf}
                      t={t}
                      onClose={() => { setSelectedTopic(null); setSelectedQuestions([]); }}
                    />
                  )}
                </>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
