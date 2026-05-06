"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Search, ArrowLeft, X, Volume2 } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { SaveCardButton } from "./save-card-button";

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
  { key: "Intersections", en: "Intersections", km: "ផ្លូវប្រសព្វ" },
  { key: "Intersection Priority – Left Turn", en: "Left Turn", km: "ឆ្វេងលាក់" },
  { key: "Intersection Priority – Sequential", en: "Sequential", km: "ឈានដល់លំដាប់" },
  { key: "Intersection Priority – Simultaneous", en: "Simultaneous", km: "ក្នុងពេលដំណាលគ្នា" },
  { key: "Roundabouts", en: "Roundabouts", km: "រង្វង់ចរាចរ" },
  { key: "Pedestrian Crossings", en: "Pedestrian Crossings", km: "ឆ្លងកាត់ដើម្បីឈានដល់" },
];

const UI = {
  en: {
    category: "KNOWLEDGE CATEGORY",
    title: "Right of Way",
    titleKm: "សិទ្ធិអាទិភាព",
    desc: "Understand priority rules and how to handle intersections correctly.",
    backButton: "Back to Categories",
    searchPlaceholder: "Search by scenario or code...",
    all: "All",
    showing: "Showing", of: "of", scenarios: "scenarios",
    noScenarios: "No scenarios found",
    reset: "Reset",
  },
  kh: {
    category: "ប្រភេទចំណេះដឹង",
    title: "សិទ្ធិអាទិភាព",
    titleKm: "Right of Way",
    desc: "យល់ពីច្បាប់អាទិភាព និងរបៀបដោះស្រាយផ្លូវប្រសព្វត្រឹមត្រូវ។",
    backButton: "ត្រឡប់ទៅប្រភេទ",
    searchPlaceholder: "ស្វែងរកតាមស្ថានភាព ឬលេខកូដ...",
    all: "ទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", scenarios: "ស្ថានភាព",
    noScenarios: "រកមិនឃើញស្ថានភាព",
    reset: "កំណត់ឡើងវិញ",
  },
} as const;

function DetailPanel({
  topic, isKh, kf, t, onClose,
}: {
  topic: Topic;
  isKh: boolean;
  kf: React.CSSProperties;
  t: typeof UI.en;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
      <div className="border-t-2 border-black bg-white">

        {/* ── ZONE 1: Visual anchor — full width image ── */}
        {topic.primary_image_url && (
          <div className="bg-white flex items-center justify-center" style={{ maxHeight: "240px", minHeight: "120px" }}>
            <img
              src={topic.primary_image_url}
              alt={name}
              className="w-full h-full object-contain"
              style={{ maxHeight: "240px" }}
            />
          </div>
        )}

        <div className="px-3 pb-3">
          {/* ── Title ── */}
          <p className="text-sm font-black leading-snug text-black mt-2 mb-2" style={kf}>
            {name}
          </p>

          {/* ── Description zone ── */}
          {description && (
            <div className={`rounded overflow-hidden border transition-all duration-300 ${playing ? "border-yellow-400" : "border-emerald-400"}`}>
              <div className={`px-2 py-1 flex items-center gap-2 transition-colors duration-300 ${playing ? "bg-yellow-400" : "bg-emerald-500"}`}>
                <span className="text-[8px] font-black uppercase tracking-widest text-white" style={kf}>{isKh ? "ពិពណ៌នា" : "Description"}</span>
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
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* ── Law reference ── */}
          {topic.law_reference && (
            <div className="mt-1.5 rounded overflow-hidden border border-amber-300">
              <div className="bg-amber-400 px-2 py-0.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-900" style={kf}>{isKh ? "ឯកសារយោងច្បាប់" : "Law Reference"}</p>
              </div>
              <div className="bg-amber-50 px-2 py-1.5">
                <p className="text-[11px] font-mono text-amber-900" style={kf}>{topic.law_reference}</p>
              </div>
            </div>
          )}

          {/* ── Audio + Save row ── */}
          <div className="mt-2 flex items-center justify-between gap-2">
            {audioUrl && (
              <button
                onClick={handleAudio}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-black text-xs transition-all select-none rounded ${loadingAudio ? "bg-zinc-100 text-zinc-400 cursor-wait"
                  : playing ? "bg-black text-yellow-400"
                    : "bg-white hover:bg-yellow-400"
                  }`}
                style={kf}
              >
                {loadingAudio ? (
                  <><span className="flex gap-0.5 items-end h-3">{[60, 100, 75].map((h, i) => <span key={i} className="w-0.5 bg-zinc-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />)}</span>{isKh ? "ផ្ទុក..." : "Loading..."}</>
                ) : playing ? (
                  <><span className="flex gap-0.5 items-end h-3">{[60, 100, 75, 90, 55].map((h, i) => <span key={i} className="w-0.5 bg-yellow-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />)}</span>{isKh ? "ឈប់" : "Stop"}</>
                ) : (
                  <><Volume2 size={13} />{isKh ? "ចាក់សំឡេង" : "Play Audio"}</>
                )}
              </button>
            )}
            <SaveCardButton topic={topic} isKh={isKh} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PriorityCatalogue() {
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.kh : UI.en;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(8);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(8);
      else if (window.innerWidth >= 768) setCols(6);
      else if (window.innerWidth >= 640) setCols(4);
      else setCols(3);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const handleTopicClick = (topic: Topic) => {
    if (selectedTopic?.id === topic.id) {
      setSelectedTopic(null);
      return;
    }
    setSelectedTopic(topic);
  };

  const handleFilterChange = (key: string) => {
    setSubGroupFilter(key);
    setSelectedTopic(null);
  };

  useEffect(() => { window.scrollTo(0, 0); fetchTopics(); }, []);

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
      const res = await fetch("/api/public/topics?categoryId=3&status=published");
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const availableKeys = new Set(topics.map(tp => tp.sub_group));
  const availableGroups = SUB_GROUPS.filter(sg => availableKeys.has(sg.key));
  const countMap = topics.reduce<Record<string, number>>((acc, tp) => {
    acc[tp.sub_group] = (acc[tp.sub_group] || 0) + 1;
    return acc;
  }, {});

  const isDefaultFilter = subGroupFilter === "";

  return (
    <div className="min-h-screen bg-white pt-4">

      {/* ── Back to Categories ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-3">
        <a
          href="/learn"
          className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white font-black text-xs hover:bg-yellow-400 transition-all shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]"
          style={kf}
        >
          <ArrowLeft size={13} />
          {t.backButton}
        </a>
      </div>

      {/* Filter Tag Bar */}
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

          {/* Tag pills */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
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

            <span className="w-px h-4 bg-zinc-300 shrink-0 mx-0.5" />

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
              {t.showing} <span className="text-black font-black">{filteredTopics.length}</span> {t.of} {topics.length} {t.scenarios}
              {subGroupFilter && !search && (
                <span className="ml-2 text-yellow-700">
                  — {isKh ? SUB_GROUPS.find(s => s.key === subGroupFilter)?.km : SUB_GROUPS.find(s => s.key === subGroupFilter)?.en}
                </span>
              )}
            </p>
            {(!isDefaultFilter || search) && (
              <button
                onClick={() => { setSubGroupFilter(""); setSearch(""); setSelectedTopic(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-black underline"
                style={kf}
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12" ref={gridRef}>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
            <p className="text-zinc-600 font-bold" style={kf}>{t.noScenarios}</p>
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
                      isKh={isKh}
                      kf={kf}
                      t={t}
                      onClose={() => { setSelectedTopic(null); }}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
