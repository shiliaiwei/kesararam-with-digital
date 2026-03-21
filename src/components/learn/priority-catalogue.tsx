"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, ChevronDown, ChevronUp, Play, Pause } from "lucide-react";
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

interface Question {
  id: number;
  topic_id: number;
  question_en: string;
  question_km: string;
  hint_en: string;
  hint_km: string;
  image_url: string | null;
  answers: Answer[];
}

interface Answer {
  id: number;
  answer_en: string;
  answer_km: string;
  is_correct: boolean;
}

const SUB_GROUPS = ["Intersections", "Roundabouts", "Pedestrian Crossings"];

export function PriorityCatalogue() {
  const { lang } = useLang();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const translations = {
    en: {
      category: "KNOWLEDGE CATEGORY",
      title: "Right of Way",
      titleKm: "សិទ្ធិអាទិភាព",
      description: "Understand priority rules and how to handle intersections correctly. Learn intersection diagrams, roundabout rules, and pedestrian crossing protocols.",
      backButton: "Back to Categories",
      searchPlaceholder: "Search by topic...",
      allTypes: "All Types",
      showing: "Showing",
      of: "of",
      topics: "scenarios",
      noTopics: "No scenarios found",
      questions: "Questions",
      playAudio: "Play Audio",
      lawReference: "Law Reference",
      close: "Close",
    },
    kh: {
      category: "ប្រភេទចំណេះដឹង",
      title: "សិទ្ធិអាទិភាព",
      titleKm: "Right of Way",
      description: "យល់ពីច្បាប់អាទិភាព និងរបៀបដោះស្រាយផ្លូវប្រសព្វត្រឹមត្រូវ។ រៀនពីដ្យាក្រាមផ្លូវប្រសព្វ ច្បាប់រង្វង់មូល និងពិធីការឆ្លងកាត់អ្នកថ្មើរជើង។",
      backButton: "ត្រឡប់ទៅប្រភេទ",
      searchPlaceholder: "ស្វែងរកតាមប្រធានបទ...",
      allTypes: "ប្រភេទទាំងអស់",
      showing: "បង្ហាញ",
      of: "នៃ",
      topics: "ស្ថានភាព",
      noTopics: "រកមិនឃើញស្ថានភាព",
      questions: "សំណួរ",
      playAudio: "ចាក់សំឡេង",
      lawReference: "ឯកសារយោងច្បាប់",
      close: "បិទ",
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
      const response = await fetch("/api/public/topics?categoryId=3&status=published");
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (topicId: number) => {
    try {
      const response = await fetch(`/api/public/topics/${topicId}/questions`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const filterTopics = () => {
    let filtered = [...topics];

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name_en.toLowerCase().includes(search.toLowerCase()) ||
          t.name_km.includes(search) ||
          t.topic_code.toLowerCase().includes(search.toLowerCase()) ||
          t.description_en.toLowerCase().includes(search.toLowerCase()) ||
          t.description_km.includes(search)
      );
    }

    if (subGroupFilter) {
      filtered = filtered.filter((t) => t.sub_group === subGroupFilter);
    }

    setFilteredTopics(filtered);
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    fetchQuestions(topic.id);
    setExpandedQuestions({});
  };

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const toggleAudio = () => {
    setPlayingAudio(!playingAudio);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="bg-red-400 border-b-4 border-black"
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
                  <circle cx="50" cy="50" r="35" fill="#ef4444" />
                  <circle cx="50" cy="35" r="8" fill="#fef08a" />
                  <circle cx="50" cy="50" r="8" fill="#fef08a" />
                  <circle cx="50" cy="65" r="8" fill="#fef08a" />
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

            <div className="md:col-span-4">
              <select
                value={subGroupFilter}
                onChange={(e) => setSubGroupFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              >
                <option value="">{t.allTypes}</option>
                {SUB_GROUPS.map((sg) => (
                  <option key={sg} value={sg}>
                    {sg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm font-bold text-zinc-600">
            {t.showing} {filteredTopics.length} {t.of} {topics.length} {t.topics}
          </div>
        </div>
      </div>

      {/* Scenarios Grid - Image + Code like Road Signs */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 border-2 border-black animate-pulse"
              />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <div
            className="bg-white border-2 border-black p-12 text-center"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <p className="text-zinc-600 font-bold">{t.noTopics}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                className="group bg-white border-2 border-black hover:shadow-[4px_4px_0_#000] transition-all flex flex-col"
              >
                {/* Intersection Diagram Image */}
                <div className="aspect-square p-3 md:p-4 flex items-center justify-center">
                  {topic.primary_image_url ? (
                    <img
                      src={topic.primary_image_url}
                      alt={topic.topic_code}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl md:text-4xl">🚦</span>
                    </div>
                  )}
                </div>
                {/* Code Only */}
                <div className="border-t-2 border-black p-2 bg-zinc-50">
                  <div className="font-mono text-xs font-bold text-center text-zinc-700">
                    {topic.topic_code}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Popup */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div
            className="bg-white border-2 sm:border-4 border-black w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-2 sm:my-8"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-red-400 border-b-2 sm:border-b-4 border-black p-3 sm:p-6 flex items-start justify-between z-10">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-mono bg-white border border-black sm:border-2 px-2 py-1 whitespace-nowrap">
                    {selectedTopic.topic_code}
                  </span>
                  {selectedTopic.sub_group && (
                    <span className="text-xs font-bold bg-red-100 border border-red-600 sm:border-2 px-2 py-1 whitespace-nowrap">
                      {selectedTopic.sub_group}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black break-words">
                  {lang === "en" ? selectedTopic.name_en : selectedTopic.name_km}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="ml-2 p-1.5 sm:p-2 bg-white border border-black sm:border-2 hover:shadow-[2px_2px_0_#000] transition-all flex-shrink-0 text-lg sm:text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Intersection Diagram - 16:9 */}
              {selectedTopic.primary_image_url && (
                <div className="w-full">
                  <img
                    src={selectedTopic.primary_image_url}
                    alt={lang === "en" ? selectedTopic.name_en : selectedTopic.name_km}
                    className="w-full border-2 border-black object-cover"
                    style={{ aspectRatio: '16/9' }}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-sm sm:text-base break-words whitespace-pre-wrap">
                  {lang === "en" ? selectedTopic.description_en : selectedTopic.description_km}
                </p>
              </div>

              {/* Audio Player */}
              {((lang === "en" && selectedTopic.audio_url_en) || (lang === "kh" && selectedTopic.audio_url_km)) && (
                <div>
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="bg-red-400 border-2 border-black px-3 sm:px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2 text-sm sm:text-base"
                  >
                    {playingAudio ? <Pause size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Play size={16} className="sm:w-[18px] sm:h-[18px]" />}
                    {t.playAudio}
                  </button>
                  {playingAudio && (
                    <audio
                      key={`audio-${selectedTopic.id}-${lang}`}
                      src={lang === "en" ? selectedTopic.audio_url_en : selectedTopic.audio_url_km}
                      autoPlay
                      onEnded={() => setPlayingAudio(false)}
                      onError={() => setPlayingAudio(false)}
                      className="hidden"
                    />
                  )}
                </div>
              )}

              {/* Law Reference */}
              {selectedTopic.law_reference && (
                <div className="p-3 sm:p-4 bg-amber-50 border-2 border-amber-600">
                  <p className="text-xs sm:text-sm font-bold text-amber-900 mb-2">
                    {t.lawReference}
                  </p>
                  <p className="text-xs sm:text-sm font-mono text-amber-800 break-words overflow-wrap-anywhere">
                    {selectedTopic.law_reference}
                  </p>
                </div>
              )}

              {/* Questions Section */}
              {questions.length > 0 && (
                <div>
                  <h4 className="font-black text-base sm:text-lg mb-3 sm:mb-4">
                    {t.questions}
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {questions.map((q, index) => (
                      <div
                        key={q.id}
                        className="bg-gray-50 border-2 border-black"
                      >
                        {/* Question Header */}
                        <button
                          onClick={() => toggleQuestion(q.id)}
                          className="w-full p-3 sm:p-4 flex items-start justify-between hover:bg-gray-100 transition-all text-left"
                        >
                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
                            <span className="font-black text-xs sm:text-sm bg-black text-white px-2 py-1 flex-shrink-0">
                              Q{index + 1}
                            </span>
                            <p className="font-bold text-sm sm:text-base break-words overflow-wrap-anywhere">
                              {lang === "en" ? q.question_en : q.question_km}
                            </p>
                          </div>
                          {expandedQuestions[q.id] ? (
                            <ChevronUp size={18} className="flex-shrink-0 sm:w-5 sm:h-5" />
                          ) : (
                            <ChevronDown size={18} className="flex-shrink-0 sm:w-5 sm:h-5" />
                          )}
                        </button>

                        {/* Question Details */}
                        {expandedQuestions[q.id] && (
                          <div className="border-t-2 border-black bg-white p-3 sm:p-4">
                            {/* Question Image */}
                            {q.image_url && (
                              <div className="mb-3 sm:mb-4">
                                <img
                                  src={q.image_url}
                                  alt="Question scenario"
                                  className="w-full border-2 border-black object-cover"
                                  style={{ aspectRatio: '16/9' }}
                                />
                              </div>
                            )}

                            {/* Answers */}
                            <div className="space-y-2 mb-3 sm:mb-4">
                              {q.answers.map((a, aIndex) => (
                                <div
                                  key={a.id}
                                  className={`p-2 sm:p-3 border-2 ${
                                    a.is_correct
                                      ? "bg-green-100 border-green-600"
                                      : "bg-white border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="font-bold flex-shrink-0 text-sm sm:text-base">
                                      {String.fromCharCode(65 + aIndex)}.
                                    </span>
                                    <span className="flex-1 text-sm sm:text-base break-words overflow-wrap-anywhere">
                                      {lang === "en" ? a.answer_en : a.answer_km}
                                    </span>
                                    {a.is_correct && (
                                      <span className="text-green-600 font-bold text-sm flex-shrink-0">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Hint */}
                            {(q.hint_en || q.hint_km) && (
                              <div className="p-2 sm:p-3 bg-blue-50 border-2 border-blue-400">
                                <p className="text-xs sm:text-sm font-bold text-blue-900 mb-1">
                                  💡 Hint
                                </p>
                                <p className="text-xs sm:text-sm text-blue-800 break-words overflow-wrap-anywhere">
                                  {lang === "en" ? q.hint_en : q.hint_km}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t-2 sm:border-t-4 border-black p-3 sm:p-6 bg-gray-50">
              <button
                onClick={() => setSelectedTopic(null)}
                className="w-full bg-white border-2 border-black px-4 sm:px-6 py-2 sm:py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all text-sm sm:text-base"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
