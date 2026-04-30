"use client";

import { useState, useEffect } from "react";
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

// Ordered per official Cambodian traffic sign PDF (ក→ខ→គ→ឃ)
const SUB_GROUPS = [
  "Prohibitory Signs",
  "Mandatory Signs",
  "Priority Signs",
  "Warning Signs",
  "Temporary Signs",
  "Direction Signs",
  "Buildup Area Boundary Signs",
  "Street Name Signs",
  "Informative Signs",
  "Supplementary Signs",
  "Sign Posts",
  "Transverse Markings",
  "Longitudinal Markings",
  "Arrows Markings",
  "Other Road Markings",
  "Traffic Lights",
  "Traffic Police Signals",
];

export function TrafficSignsCatalogue() {
  const { lang } = useLang();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleTopicClick = async (topic: Topic) => {
    // Toggle: clicking the same sign closes it
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

  // Translations
  const translations = {
    en: {
      category: "KNOWLEDGE CATEGORY",
      title: "Traffic Signs",
      titleKm: "សញ្ញាចរាចរណ៍",
      description: "Browse and learn all official road signs used in Cambodia. Each sign includes a description, what it means, and audio support in Khmer and English.",
      backButton: "Back to Categories",
      searchPlaceholder: "Search by sign name or code...",
      allSignTypes: "All Sign Types",
      showing: "Showing",
      of: "of",
      signs: "signs",
      noSigns: "No signs found",
    },
    kh: {
      category: "ប្រភេទចំណេះដឹង",
      title: "សញ្ញាចរាចរណ៍",
      titleKm: "Traffic Signs",
      description: "រកមើល និងរៀនសញ្ញាចរាចរណ៍ផ្លូវការទាំងអស់ដែលប្រើនៅកម្ពុជា។ សញ្ញានីមួយៗរួមមានការពិពណ៌នា អត្ថន័យ និងការគាំទ្រសំឡេងជាភាសាខ្មែរ និងអង់គ្លេស។",
      backButton: "ត្រឡប់ទៅប្រភេទ",
      searchPlaceholder: "ស្វែងរកតាមឈ្មោះ ឬលេខកូដសញ្ញា...",
      allSignTypes: "ប្រភេទសញ្ញាទាំងអស់",
      showing: "បង្ហាញ",
      of: "នៃ",
      signs: "សញ្ញា",
      noSigns: "រកមិនឃើញសញ្ញា",
    },
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    filterTopics();
  }, [topics, search, subGroupFilter]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/public/topics?categoryId=1&status=published");
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTopics = () => {
    let filtered = [...topics];

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name_en.toLowerCase().includes(search.toLowerCase()) ||
          t.name_km.includes(search) ||
          t.topic_code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (subGroupFilter) {
      filtered = filtered.filter((t) => t.sub_group === subGroupFilter);
    }

    setFilteredTopics(filtered);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="bg-amber-400 border-b-4 border-black"
        style={{ boxShadow: "0 4px 0 #000" }}
      >
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
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => window.history.back()}
          className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          {t.backButton}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
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
      </div>

      {/* Signs Grid - inline expand on click */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
            ))}
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
      </div>

      {/* Remove old modal — replaced by inline panel above */}
    </div>
  );
}
