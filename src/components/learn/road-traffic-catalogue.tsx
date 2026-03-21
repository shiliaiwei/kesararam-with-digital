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
  audio_url_en: string;
  audio_url_km: string;
}

interface Question {
  id: number;
  question_en: string;
  question_km: string;
  hint_en: string;
  hint_km: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  answer_en: string;
  answer_km: string;
  is_correct: boolean;
}

const SUB_GROUPS = ["Traffic Rules", "Speed Limits", "Parking", "Overtaking"];

export function RoadTrafficCatalogue() {
  const { lang } = useLang();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Record<number, Question[]>>({});
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  const translations = {
    en: {
      category: "KNOWLEDGE CATEGORY",
      title: "Road Traffic Law",
      titleKm: "ច្បាប់ចរាចរណ៍ផ្លូវ",
      description: "Learn essential road traffic laws and regulations in Cambodia. Each topic includes questions, answers, and audio explanations.",
      backButton: "Back to Categories",
      searchPlaceholder: "Search by topic or question...",
      allTypes: "All Types",
      showing: "Showing",
      of: "of",
      topics: "topics",
      noTopics: "No topics found",
      questions: "Questions",
      correctAnswer: "Correct Answer",
      explanation: "Explanation",
      playAudio: "Play Audio",
    },
    kh: {
      category: "ប្រភេទចំណេះដឹង",
      title: "ច្បាប់ចរាចរណ៍ផ្លូវ",
      titleKm: "Road Traffic Law",
      description: "រៀនច្បាប់ និងបទប្បញ្ញត្តិចរាចរណ៍ផ្លូវសំខាន់ៗនៅកម្ពុជា។ ប្រធានបទនីមួយៗរួមមានសំណួរ ចម្លើយ និងការពន្យល់សំឡេង។",
      backButton: "ត្រឡប់ទៅប្រភេទ",
      searchPlaceholder: "ស្វែងរកតាមប្រធានបទ ឬសំណួរ...",
      allTypes: "ប្រភេទទាំងអស់",
      showing: "បង្ហាញ",
      of: "នៃ",
      topics: "ប្រធានបទ",
      noTopics: "រកមិនឃើញប្រធានបទ",
      questions: "សំណួរ",
      correctAnswer: "ចម្លើយត្រឹមត្រូវ",
      explanation: "ការពន្យល់",
      playAudio: "ចាក់សំឡេង",
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
      const response = await fetch("/api/public/topics?categoryId=2&status=published");
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (topicId: number) => {
    if (questions[topicId]) return;

    try {
      const response = await fetch(`/api/public/topics/${topicId}/questions`);
      const data = await response.json();
      setQuestions((prev) => ({
        ...prev,
        [topicId]: data.questions || [],
      }));
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
          t.topic_code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (subGroupFilter) {
      filtered = filtered.filter((t) => t.sub_group === subGroupFilter);
    }

    setFilteredTopics(filtered);
  };

  const toggleTopic = (topicId: number) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
      fetchQuestions(topicId);
    }
  };

  const toggleAudio = (topicId: number) => {
    if (playingAudio === topicId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(topicId);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="bg-blue-400 border-b-4 border-black"
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
                  <circle cx="50" cy="50" r="35" />
                  <path d="M 30 50 L 70 50 M 50 30 L 50 70" />
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

      {/* Topics List */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border-2 border-black p-6 animate-pulse"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                <div className="h-6 bg-gray-200 w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 w-1/2"></div>
              </div>
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
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white border-2 border-black"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                {/* Topic Header */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono bg-zinc-100 border border-black px-2 py-1">
                        {topic.topic_code}
                      </span>
                      {topic.sub_group && (
                        <span className="text-xs font-bold bg-blue-100 border border-blue-400 px-2 py-1">
                          {topic.sub_group}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black mb-1">
                      {lang === "en" ? topic.name_en : topic.name_km}
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {lang === "en" ? topic.description_en : topic.description_km}
                    </p>
                  </div>
                  {expandedTopic === topic.id ? (
                    <ChevronUp size={24} className="flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown size={24} className="flex-shrink-0 ml-4" />
                  )}
                </button>

                {/* Expanded Content */}
                {expandedTopic === topic.id && (
                  <div className="border-t-2 border-black bg-gray-50 p-6">
                    {/* Audio Player */}
                    {((lang === "en" && topic.audio_url_en) || (lang === "kh" && topic.audio_url_km)) && (
                      <div className="mb-6">
                        <button
                          onClick={() => toggleAudio(topic.id)}
                          className="bg-blue-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
                        >
                          {playingAudio === topic.id ? <Pause size={18} /> : <Play size={18} />}
                          {t.playAudio}
                        </button>
                        {lang === "en" && topic.audio_url_en && (
                          <audio
                            src={topic.audio_url_en}
                            autoPlay={playingAudio === topic.id}
                            onEnded={() => setPlayingAudio(null)}
                          />
                        )}
                        {lang === "kh" && topic.audio_url_km && (
                          <audio
                            src={topic.audio_url_km}
                            autoPlay={playingAudio === topic.id}
                            onEnded={() => setPlayingAudio(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* Questions */}
                    <h4 className="font-black text-lg mb-4">
                      {t.questions} ({questions[topic.id]?.length || 0})
                    </h4>
                    {questions[topic.id] && questions[topic.id].length > 0 ? (
                      <div className="space-y-4">
                        {questions[topic.id].map((q, index) => (
                          <div
                            key={q.id}
                            className="bg-white border-2 border-black p-4"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <span className="font-black text-sm bg-black text-white px-2 py-1 flex-shrink-0">
                                Q{index + 1}
                              </span>
                              <p className="font-bold text-base">
                                {lang === "en" ? q.question_en : q.question_km}
                              </p>
                            </div>

                            {/* Answers */}
                            <div className="space-y-2 ml-10">
                              {q.answers.map((a, aIndex) => (
                                <div
                                  key={a.id}
                                  className={`p-3 border-2 ${
                                    a.is_correct
                                      ? "bg-green-100 border-green-600"
                                      : "bg-white border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="font-bold flex-shrink-0">
                                      {String.fromCharCode(65 + aIndex)}.
                                    </span>
                                    <span className="flex-1">
                                      {lang === "en" ? a.answer_en : a.answer_km}
                                    </span>
                                    {a.is_correct && (
                                      <span className="text-green-600 font-bold text-sm flex-shrink-0">
                                        ✓ {t.correctAnswer}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Hint/Explanation */}
                            {(q.hint_en || q.hint_km) && (
                              <div className="mt-3 ml-10 p-3 bg-blue-50 border-2 border-blue-400">
                                <p className="text-sm font-bold text-blue-900 mb-1">
                                  {t.explanation}:
                                </p>
                                <p className="text-sm text-blue-800">
                                  {lang === "en" ? q.hint_en : q.hint_km}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-zinc-600 text-sm">No questions available yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
