"use client";

import { useState, useEffect, useRef } from "react";
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

// ── Sub-group definitions with Khmer labels (PDF order) ──────────────────────
const SUB_GROUPS: { key: string; en: string; km: string; section: string; sectionKm: string }[] = [
  // ក. Traffic Signs — Regulatory
  { key: "Prohibitory Signs", en: "Prohibitory", km: "ហាមឃាត់", section: "Regulatory Signs", sectionKm: "សញ្ញានិយតកម្ម" },
  { key: "Mandatory Signs", en: "Mandatory", km: "បង្គាប់", section: "Regulatory Signs", sectionKm: "សញ្ញានិយតកម្ម" },
  { key: "Priority Signs", en: "Priority", km: "អាទិភាព", section: "Regulatory Signs", sectionKm: "សញ្ញានិយតកម្ម" },
  // ក. Traffic Signs — Warning
  { key: "Warning Signs", en: "Warning", km: "ព្រមាន", section: "Warning Signs", sectionKm: "សញ្ញាព្រមាន" },
  { key: "Temporary Signs", en: "Temporary", km: "បណ្ដោះអាសន្ន", section: "Warning Signs", sectionKm: "សញ្ញាព្រមាន" },
  // ក. Traffic Signs — Informative
  { key: "Direction Signs", en: "Direction", km: "ទិសដៅ", section: "Informative Signs", sectionKm: "សញ្ញាផ្ដល់ព័ត៌មាន" },
  { key: "Buildup Area Boundary Signs", en: "Area Boundary", km: "ព្រំដែនតំបន់", section: "Informative Signs", sectionKm: "សញ្ញាផ្ដល់ព័ត៌មាន" },
  { key: "Street Name Signs", en: "Street Name", km: "ឈ្មោះផ្លូវវិថី", section: "Informative Signs", sectionKm: "សញ្ញាផ្ដល់ព័ត៌មាន" },
  { key: "Informative Signs", en: "Informative", km: "ព័ត៌មាន", section: "Informative Signs", sectionKm: "សញ្ញាផ្ដល់ព័ត៌មាន" },
  // ក. Traffic Signs — Other
  { key: "Supplementary Signs", en: "Supplementary", km: "បន្ថែម", section: "Other Signs", sectionKm: "សញ្ញាផ្សេងទៀត" },
  { key: "Sign Posts", en: "Sign Posts", km: "បង្គោលសញ្ញា", section: "Other Signs", sectionKm: "សញ្ញាផ្សេងទៀត" },
  // ខ. Road Markings
  { key: "Transverse Markings", en: "Transverse", km: "ចំណារឆ្លងកាត់", section: "Road Markings", sectionKm: "ចំណារផ្លូវវិថី" },
  { key: "Longitudinal Markings", en: "Longitudinal", km: "ចំណារបណ្ដោយ", section: "Road Markings", sectionKm: "ចំណារផ្លូវវិថី" },
  { key: "Arrows Markings", en: "Arrows", km: "ចំណារព្រួញ", section: "Road Markings", sectionKm: "ចំណារផ្លូវវិថី" },
  { key: "Other Road Markings", en: "Other Markings", km: "ចំណារផ្សេងទៀត", section: "Road Markings", sectionKm: "ចំណារផ្លូវវិថី" },
  // គ. Traffic Signals
  { key: "Traffic Lights", en: "Traffic Lights", km: "ភ្លើងសញ្ញា", section: "Traffic Signals", sectionKm: "ភ្លើងសញ្ញាចរាចរណ៍" },
  // ឃ. Police Signals
  { key: "Traffic Police Signals", en: "Police Signals", km: "សញ្ញាប៉ូលិស", section: "Police Signals", sectionKm: "សញ្ញាប៉ូលិស" },
];

// Default filter on load — show Regulatory Signs (most important for exam)
const DEFAULT_FILTER = "Prohibitory Signs";

// UI text
const UI = {
  en: {
    backButton: "Back to Categories",
    searchPlaceholder: "Search by sign name or code...",
    all: "All Signs",
    showing: "Showing",
    of: "of",
    signs: "signs",
    noSigns: "No signs found",
    lawRef: "Law Reference",
    relatedQ: "Related Questions",
    loadingQ: "Loading questions...",
    audioEn: "EN Audio",
    audioKm: "Play Audio",
  },
  kh: {
    backButton: "ត្រឡប់ទៅប្រភេទ",
    searchPlaceholder: "ស្វែងរកតាមឈ្មោះ ឬលេខកូដសញ្ញា...",
    all: "សញ្ញាទាំងអស់",
    showing: "បង្ហាញ",
    of: "នៃ",
    signs: "សញ្ញា",
    noSigns: "រកមិនឃើញសញ្ញា",
    lawRef: "ឯកសារយោងច្បាប់",
    relatedQ: "សំណួរពាក់ព័ន្ធ",
    loadingQ: "កំពុងផ្ទុកសំណួរ...",
    audioEn: "EN Audio",
    audioKm: "ចាក់សំឡេង",
  },
} as const;

export function TrafficSignsCatalogue() {
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.kh : UI.en;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState<string>(DEFAULT_FILTER);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

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
    // Scroll grid into view smoothly
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  useEffect(() => { fetchTopics(); }, []);

  useEffect(() => {
    let filtered = [...topics];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        t => t.name_en.toLowerCase().includes(q) ||
          t.name_km.includes(search) ||
          t.topic_code.toLowerCase().includes(q)
      );
    }
    if (subGroupFilter) {
      filtered = filtered.filter(t => t.sub_group === subGroupFilter);
    }
    setFilteredTopics(filtered);
  }, [topics, search, subGroupFilter]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/topics?categoryId=1&status=published");
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Derive which sub-groups actually have data
  const availableKeys = new Set(topics.map(t => t.sub_group));
  const availableGroups = SUB_GROUPS.filter(sg => availableKeys.has(sg.key));

  // Count per sub-group for badge
  const countMap = topics.reduce<Record<string, number>>((acc, t) => {
    acc[t.sub_group] = (acc[t.sub_group] || 0) + 1;
    return acc;
  }, {});

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
          <div className="relative mb-4">
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

          {/* Tag pills grouped by section */}
          <div className="space-y-2.5">
            {/* All Signs */}
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => handleFilterChange("")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${subGroupFilter === "" && !search
                    ? "bg-black text-yellow-400 shadow-[2px_2px_0_#ca8a04]"
                    : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                  }`}
                style={kf}
              >
                {t.all}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${subGroupFilter === "" && !search ? "bg-yellow-400 text-black" : "bg-zinc-100 text-zinc-600"}`}>
                  {topics.length}
                </span>
              </button>
            </div>

            {/* Section groups */}
            {(() => {
              const sections: string[] = [];
              availableGroups.forEach(sg => { if (!sections.includes(sg.section)) sections.push(sg.section); });
              return sections.map(section => {
                const sectionGroups = availableGroups.filter(sg => sg.section === section);
                const sectionKm = sectionGroups[0]?.sectionKm || section;
                return (
                  <div key={section} className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-full sm:w-auto shrink-0" style={kf}>
                      {isKh ? sectionKm : section}
                    </span>
                    {sectionGroups.map(sg => {
                      const isActive = subGroupFilter === sg.key && !search;
                      const count = countMap[sg.key] || 0;
                      return (
                        <button
                          key={sg.key}
                          onClick={() => handleFilterChange(sg.key)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${isActive
                              ? "bg-yellow-400 shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                              : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                            }`}
                          style={kf}
                        >
                          {isKh ? sg.km : sg.en}
                          {count > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${isActive ? "bg-black text-yellow-400" : "bg-zinc-100 text-zinc-600"}`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              });
            })()}
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
            {(subGroupFilter !== DEFAULT_FILTER || search) && (
              <button
                onClick={() => { setSubGroupFilter(DEFAULT_FILTER); setSearch(""); setSelectedTopic(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-black underline"
                style={kf}
              >
                {isKh ? "កំណត់ឡើងវិញ" : "Reset"}
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
              const COLS = 8;
              const isLastInRow = (idx + 1) % COLS === 0 || idx === filteredTopics.length - 1;
              const selectedIdx = selectedTopic ? filteredTopics.findIndex(t => t.id === selectedTopic.id) : -1;
              const showPanelAfter =
                selectedTopic &&
                selectedIdx >= 0 &&
                idx >= selectedIdx &&
                Math.floor(idx / COLS) === Math.floor(selectedIdx / COLS) &&
                isLastInRow;

              return (
                <>
                  <button
                    key={topic.id}
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
                    <div
                      key={`panel-${selectedTopic.id}`}
                      className="col-span-full border-4 border-yellow-400 bg-white"
                      style={{ boxShadow: "6px 6px 0 #000" }}
                    >
                      <div className="flex items-center justify-between px-5 py-3 bg-yellow-400 border-b-2 border-black">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-xs font-black bg-black text-yellow-400 px-2 py-0.5">
                            {selectedTopic.topic_code}
                          </span>
                          {selectedTopic.sub_group && (
                            <span className="text-xs font-bold text-black/70" style={kf}>
                              {isKh ? SUB_GROUPS.find(s => s.key === selectedTopic.sub_group)?.km || selectedTopic.sub_group : selectedTopic.sub_group}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => { setSelectedTopic(null); setSelectedQuestions([]); }}
                          className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
                        <div className="flex items-center justify-center p-6 border-b-2 md:border-b-0 md:border-r-2 border-black bg-zinc-50">
                          {selectedTopic.primary_image_url && (
                            <img src={selectedTopic.primary_image_url} alt={selectedTopic.name_en} className="object-contain max-h-40 max-w-full" />
                          )}
                        </div>
                        <div className="p-5 space-y-3">
                          <h2 className="text-2xl font-black">{selectedTopic.name_en}</h2>
                          <p className="text-lg text-zinc-600" style={{ fontFamily: "Siemreap, sans-serif" }}>{selectedTopic.name_km}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">English</p>
                              <p className="text-sm text-zinc-700 leading-relaxed">{selectedTopic.description_en || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">ខ្មែរ</p>
                              <p className="text-sm text-zinc-700 leading-relaxed" style={{ fontFamily: "Siemreap, sans-serif" }}>{selectedTopic.description_km || "—"}</p>
                            </div>
                          </div>
                          {selectedTopic.law_reference && (
                            <div className="bg-blue-50 border-2 border-blue-200 px-3 py-2 text-xs text-blue-800">
                              <span className="font-black uppercase block mb-0.5" style={kf}>{t.lawRef}</span>
                              {selectedTopic.law_reference}
                            </div>
                          )}
                          {(selectedTopic.audio_url_en || selectedTopic.audio_url_km) && (
                            <div className="flex gap-2 flex-wrap pt-1">
                              {selectedTopic.audio_url_en && (
                                <button onClick={() => new Audio(selectedTopic.audio_url_en).play()}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white hover:bg-yellow-400 font-black text-xs shadow-[2px_2px_0_#000] transition-all">
                                  <Volume2 size={13} /> {t.audioEn}
                                </button>
                              )}
                              {selectedTopic.audio_url_km && (
                                <button onClick={() => new Audio(selectedTopic.audio_url_km).play()}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white hover:bg-yellow-400 font-black text-xs shadow-[2px_2px_0_#000] transition-all"
                                  style={{ fontFamily: "Siemreap, sans-serif" }}>
                                  <Volume2 size={13} /> {t.audioKm}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {loadingQuestions ? (
                        <div className="border-t-2 border-black px-5 py-4 text-xs font-bold text-zinc-400" style={kf}>{t.loadingQ}</div>
                      ) : selectedQuestions.length > 0 && (
                        <div className="border-t-2 border-black px-5 py-4 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3" style={kf}>
                            {t.relatedQ} ({selectedQuestions.length})
                          </p>
                          {selectedQuestions.map((q: any, i: number) => (
                            <details key={q.id} className="border-2 border-black">
                              <summary className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-zinc-50 list-none">
                                <span className="font-black text-[10px] bg-black text-white px-1.5 py-0.5 shrink-0 mt-0.5">Q{i + 1}</span>
                                <span className="font-bold text-sm flex-1" style={kf}>{isKh ? q.question_km : q.question_en}</span>
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

<div className="max-w-7xl mx-auto px-4 py-12">
  <div className="flex items-start justify-between gap-8">
    <div className="flex-1">
      <div className="inline-block bg-black text-white px-3 py-1 font-bold text-sm mb-4">
        {t.category}
      </div>
      <h1 className="text-4xl md:text-5xl font-black mb-2">{t.title}</h1>
      <h2 className="text-xl md:text-2xl font-bold mb-4">{t.titleKm}</h2>
      <p className="text-base md:text-lg max-w-2xl">
        {t.description}
      </p>
    </div>

    {/* Category Illustration */}
    <div className="hidden lg:block flex-shrink-0">
      <div
        className="w-40 h-40 xl:w-48 xl:h-48 bg-white border-4 border-black flex items-center justify-center"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-28 h-28 xl:w-32 xl:h-32"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
          <circle cx="50" cy="35" r="8" fill="red" />
          <circle cx="50" cy="50" r="8" fill="yellow" />
          <circle cx="50" cy="65" r="8" fill="green" />
        </svg>
      </div>
    </div>
  </div>
</div>
      </div >

  {/* Back Button */ }
  < div className = "max-w-7xl mx-auto px-4 py-6" >
    <button
      onClick={() => window.history.back()}
      className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
    >
      <ArrowLeft size={20} />
      {t.backButton}
    </button>
      </div >

  {/* Filters & Search */ }
  < div className = "max-w-7xl mx-auto px-4 pb-6" >
    <div
      className="bg-white border-2 border-black p-4"
      style={{ boxShadow: "4px 4px 0 #000" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
        {/* Search */}
        <div className="md:col-span-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
          </div>
        </div>

        {/* Sub-group Filter */}
        <div className="md:col-span-4">
          <select
            value={subGroupFilter}
            onChange={(e) => setSubGroupFilter(e.target.value)}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
          >
            <option value="">{t.allSignTypes}</option>
            {SUB_GROUPS.map((sg) => (
              <option key={sg} value={sg}>
                {sg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Count */}
      <div className="mt-4 text-sm font-bold text-zinc-600">
        {t.showing} {filteredTopics.length} {t.of} {topics.length} {t.signs}
      </div>
    </div>
      </div >

  {/* Signs Grid - inline expand on click */ }
  < div className = "max-w-7xl mx-auto px-4 pb-12" >
  {
    loading?(
          <div className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4" >
      {
        Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
        ))
      }
          </div>
        ) : filteredTopics.length === 0 ? (
  <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
    <p className="text-zinc-600 font-bold">{t.noSigns}</p>
  </div>
) : (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
    {filteredTopics.map((topic, idx) => {
      const isSelected = selectedTopic?.id === topic.id;
      const COLS = 8;
      const isLastInRow = (idx + 1) % COLS === 0 || idx === filteredTopics.length - 1;
      const selectedIdx = selectedTopic ? filteredTopics.findIndex(t => t.id === selectedTopic.id) : -1;
      const showPanelAfter =
        selectedTopic &&
        selectedIdx >= 0 &&
        idx >= selectedIdx &&
        Math.floor(idx / COLS) === Math.floor(selectedIdx / COLS) &&
        isLastInRow;

      return (
        <>
          <button
            key={topic.id}
            onClick={() => handleTopicClick(topic)}
            aria-expanded={isSelected}
            className={`group border-2 transition-all duration-150 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${isSelected
              ? "border-yellow-400 bg-yellow-400 shadow-[4px_4px_0_#ca8a04]"
              : "border-black bg-white hover:border-yellow-400 hover:bg-yellow-400 hover:shadow-[4px_4px_0_#ca8a04]"
              }`}
          >
            {/* Image */}
            <div className="relative w-full overflow-hidden" style={{ paddingBottom: "100%" }}>
              {topic.primary_image_url ? (
                <img
                  src={topic.primary_image_url}
                  alt={topic.topic_code}
                  className="absolute inset-0 w-full h-full object-contain p-3 md:p-4 group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="text-3xl">🚦</span>
                </div>
              )}
            </div>
            {/* Code */}
            <div className={`border-t-2 p-2 w-full transition-colors ${isSelected ? "border-yellow-500 bg-yellow-500" : "border-black bg-zinc-50 group-hover:border-yellow-500 group-hover:bg-yellow-500"
              }`}>
              <div className="font-mono text-xs font-black text-center text-black">
                {topic.topic_code}
              </div>
            </div>
          </button>

          {/* Inline detail panel after last card in selected row */}
          {showPanelAfter && selectedTopic && (
            <div
              key={`panel-${selectedTopic.id}`}
              className="col-span-full border-4 border-yellow-400 bg-white"
              style={{ boxShadow: "6px 6px 0 #000" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3 bg-yellow-400 border-b-2 border-black">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-black bg-black text-yellow-400 px-2 py-0.5">
                    {selectedTopic.topic_code}
                  </span>
                  {selectedTopic.sub_group && (
                    <span className="text-xs font-bold text-black/70">{selectedTopic.sub_group}</span>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedTopic(null); setSelectedQuestions([]); }}
                  className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
                {/* Image */}
                <div className="flex items-center justify-center p-6 border-b-2 md:border-b-0 md:border-r-2 border-black bg-zinc-50">
                  {selectedTopic.primary_image_url && (
                    <img
                      src={selectedTopic.primary_image_url}
                      alt={selectedTopic.name_en}
                      className="object-contain max-h-40 max-w-full"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h2 className="text-2xl font-black">{selectedTopic.name_en}</h2>
                  <p className="text-lg text-zinc-600" style={{ fontFamily: "Siemreap, sans-serif" }}>
                    {selectedTopic.name_km}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">English</p>
                      <p className="text-sm text-zinc-700 leading-relaxed">{selectedTopic.description_en || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">ខ្មែរ</p>
                      <p className="text-sm text-zinc-700 leading-relaxed" style={{ fontFamily: "Siemreap, sans-serif" }}>
                        {selectedTopic.description_km || "—"}
                      </p>
                    </div>
                  </div>
                  {selectedTopic.law_reference && (
                    <div className="bg-blue-50 border-2 border-blue-200 px-3 py-2 text-xs text-blue-800">
                      <span className="font-black uppercase block mb-0.5">Law Reference</span>
                      {selectedTopic.law_reference}
                    </div>
                  )}
                  {/* Audio */}
                  {(selectedTopic.audio_url_en || selectedTopic.audio_url_km) && (
                    <div className="flex gap-2 flex-wrap pt-1">
                      {selectedTopic.audio_url_en && (
                        <button
                          onClick={() => new Audio(selectedTopic.audio_url_en).play()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white hover:bg-yellow-400 font-black text-xs shadow-[2px_2px_0_#000] transition-all"
                        >
                          <Volume2 size={13} /> EN Audio
                        </button>
                      )}
                      {selectedTopic.audio_url_km && (
                        <button
                          onClick={() => new Audio(selectedTopic.audio_url_km).play()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white hover:bg-yellow-400 font-black text-xs shadow-[2px_2px_0_#000] transition-all"
                          style={{ fontFamily: "Siemreap, sans-serif" }}
                        >
                          <Volume2 size={13} /> ចាក់សំឡេង
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Related questions */}
              {loadingQuestions ? (
                <div className="border-t-2 border-black px-5 py-4 text-xs font-bold text-zinc-400">Loading questions...</div>
              ) : selectedQuestions.length > 0 && (
                <div className="border-t-2 border-black px-5 py-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                    Related Questions ({selectedQuestions.length})
                  </p>
                  {selectedQuestions.map((q: any, i: number) => (
                    <details key={q.id} className="border-2 border-black group/q">
                      <summary className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-zinc-50 list-none">
                        <span className="font-black text-[10px] bg-black text-white px-1.5 py-0.5 shrink-0 mt-0.5">Q{i + 1}</span>
                        <span className="font-bold text-sm flex-1">{q.question_en}</span>
                      </summary>
                      <div className="border-t-2 border-black bg-zinc-50 p-3 space-y-2">
                        {q.answers?.map((a: any, ai: number) => (
                          <div key={a.id} className={`px-3 py-2 border-2 text-sm flex gap-2 ${a.is_correct ? "bg-green-100 border-green-500" : "bg-white border-zinc-200"}`}>
                            <span className="font-bold shrink-0">{String.fromCharCode(65 + ai)}.</span>
                            <span className="flex-1">{a.answer_en}</span>
                            {a.is_correct && <span className="text-green-600 font-black text-xs">✓</span>}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      );
    })}
  </div>
)}
      </div >

  {/* Remove old modal — replaced by inline panel above */ }
    </div >
  );
}
