"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Search, ArrowLeft, X } from "lucide-react";
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
  const subGroupLabel = SUB_GROUPS.find(s => s.key === topic.sub_group);

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
        {/* Image */}
        <div className="flex items-center justify-center p-5 border-b-2 md:border-b-0 md:border-r-2 border-black bg-zinc-50">
          {topic.primary_image_url && (
            <img src={topic.primary_image_url} alt={name} className="object-contain max-h-36 max-w-full" />
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 flex flex-col">
          <h2 className="text-2xl font-black leading-tight" style={kf}>
            {name}
          </h2>

          {description && (
            <p className="text-sm leading-relaxed text-zinc-700" style={kf}>
              {description}
            </p>
          )}

          {topic.law_reference && (
            <div className="bg-blue-50 border-2 border-blue-200 px-3 py-2 text-xs text-blue-800">
              <span className="font-black uppercase block mb-0.5" style={kf}>Law Reference</span>
              <span style={kf}>{topic.law_reference}</span>
            </div>
          )}

          {/* Buttons at bottom right */}
          <div className="mt-auto flex items-center justify-end gap-2 pt-4">
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
