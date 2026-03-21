"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, ChevronDown, ChevronUp, Play, Pause, FileText, ExternalLink } from "lucide-react";
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

const SUB_GROUPS = ["Road Safety", "Environmental", "Legal"];

export function GeneralKnowledgeCatalogue() {
  const { lang } = useLang();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [questions, setQuestions] = useState<Record<number, Question[]>>({});
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});
  const [resourceFilter, setResourceFilter] = useState<"all" | "pdf" | "link">("all");

  const translations = {
    en: {
      category: "KNOWLEDGE CATEGORY",
      title: "General Knowledge",
      titleKm: "ចំណេះដឹងទូទៅ",
      description: "Essential road safety topics and broad driving knowledge. Learn about environmental awareness, legal responsibilities, and general safety practices.",
      backButton: "Back to Categories",
      searchPlaceholder: "Search by topic...",
      allTypes: "All Types",
      showing: "Showing",
      of: "of",
      topics: "topics",
      noTopics: "No topics found",
      questions: "Questions",
      playAudio: "Play Audio",
      lawReference: "Law Reference",
      resources: "Learning Resources",
      allResources: "All Resources",
      pdfOnly: "PDF Documents",
      linksOnly: "Useful Links",
      noResources: "No resources available",
    },
    kh: {
      category: "ប្រភេទចំណេះដឹង",
      title: "ចំណេះដឹងទូទៅ",
      titleKm: "General Knowledge",
      description: "ប្រធានបទសុវត្ថិភាពផ្លូវសំខាន់ៗ និងចំណេះដឹងបើកបរទូលំទូលាយ។ រៀនអំពីការយល់ដឹងបរិស្ថាន ទំនួលខុសត្រូវផ្នែកច្បាប់ និងការអនុវត្តសុវត្ថិភាពទូទៅ។",
      backButton: "ត្រឡប់ទៅប្រភេទ",
      searchPlaceholder: "ស្វែងរកតាមប្រធានបទ...",
      allTypes: "ប្រភេទទាំងអស់",
      showing: "បង្ហាញ",
      of: "នៃ",
      topics: "ប្រធានបទ",
      noTopics: "រកមិនឃើញប្រធានបទ",
      questions: "សំណួរ",
      playAudio: "ចាក់សំឡេង",
      lawReference: "ឯកសារយោងច្បាប់",
      resources: "ធនធានសិក្សា",
      allResources: "ធនធានទាំងអស់",
      pdfOnly: "ឯកសារ PDF",
      linksOnly: "តំណភ្ជាប់មានប្រយោជន៍",
      noResources: "មិនមានធនធាន",
    },
  };

  const t = translations[lang] || translations.en;

  // Mock resources - in production, fetch from API
  const mockResources = [
    { id: 1, type: "pdf", title_en: "Road Safety Guidelines 2024", title_km: "គោលការណ៍ណែនាំសុវត្ថិភាពផ្លូវ ២០២៤", url: "#" },
    { id: 2, type: "pdf", title_en: "Environmental Driving Practices", title_km: "ការអនុវត្តបើកបរបរិស្ថាន", url: "#" },
    { id: 3, type: "link", title_en: "Ministry of Public Works Official Site", title_km: "គេហទំព័រផ្លូវការក្រសួងសាធារណការ", url: "https://mpwt.gov.kh" },
    { id: 4, type: "link", title_en: "Cambodia Traffic Police", title_km: "ប៉ូលីសចរាចរណ៍កម្ពុជា", url: "#" },
  ];

  const filteredResources = mockResources.filter(r => 
    resourceFilter === "all" || r.type === resourceFilter
  );

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (topics.length > 0) {
      topics.forEach(topic => {
        fetchQuestions(topic.id);
      });
    }
  }, [topics]);

  useEffect(() => {
    filterTopics();
  }, [topics, search, subGroupFilter]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/public/topics?categoryId=7&status=published");
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

  const toggleTopic = (topicId: number) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
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
        className="bg-purple-400 border-b-4 border-black"
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
                  strokeWidth="2"
                >
                  <rect x="30" y="20" width="40" height="50" rx="2" fill="#c084fc" stroke="#000" strokeWidth="3" />
                  <path d="M 35 30 L 65 30 M 35 40 L 65 40 M 35 50 L 65 50 M 35 60 L 65 60" stroke="#000" strokeWidth="2" />
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

      {/* Learning Resources Section */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div
          className="bg-white border-2 border-black p-4 md:p-6"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <h3 className="font-black text-lg mb-4">{t.resources}</h3>
          
          {/* Resource Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setResourceFilter("all")}
              className={`px-4 py-2 border-2 border-black font-bold transition-all ${
                resourceFilter === "all" ? "bg-purple-400 shadow-[2px_2px_0_#000]" : "bg-white hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              {t.allResources}
            </button>
            <button
              onClick={() => setResourceFilter("pdf")}
              className={`px-4 py-2 border-2 border-black font-bold transition-all inline-flex items-center gap-2 ${
                resourceFilter === "pdf" ? "bg-purple-400 shadow-[2px_2px_0_#000]" : "bg-white hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              <FileText size={16} />
              {t.pdfOnly}
            </button>
            <button
              onClick={() => setResourceFilter("link")}
              className={`px-4 py-2 border-2 border-black font-bold transition-all inline-flex items-center gap-2 ${
                resourceFilter === "link" ? "bg-purple-400 shadow-[2px_2px_0_#000]" : "bg-white hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              <ExternalLink size={16} />
              {t.linksOnly}
            </button>
          </div>

          {/* Resources List */}
          {filteredResources.length === 0 ? (
            <p className="text-zinc-600 text-sm">{t.noResources}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border-2 border-black bg-gray-50 hover:bg-purple-50 hover:shadow-[2px_2px_0_#000] transition-all flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {resource.type === "pdf" ? (
                      <FileText size={20} className="text-purple-600" />
                    ) : (
                      <ExternalLink size={20} className="text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm break-words">
                      {lang === "en" ? resource.title_en : resource.title_km}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {resource.type === "pdf" ? "PDF Document" : "External Link"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
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
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border-2 border-black p-6 animate-pulse"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                <div className="h-6 bg-gray-200 w-3/4 mb-3"></div>
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
                {/* Topic Header - Clickable */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full p-4 md:p-6 flex items-start justify-between hover:bg-gray-50 transition-all text-left"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono bg-zinc-100 border border-black px-2 py-1 whitespace-nowrap">
                        {topic.topic_code}
                      </span>
                      {topic.sub_group && (
                        <span className="text-xs font-bold bg-purple-100 border border-purple-400 px-2 py-1 whitespace-nowrap">
                          {topic.sub_group}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-black break-words">
                      {lang === "en" ? topic.name_en : topic.name_km}
                    </h3>
                  </div>
                  
                  {expandedTopics[topic.id] ? (
                    <ChevronUp size={24} className="flex-shrink-0" />
                  ) : (
                    <ChevronDown size={24} className="flex-shrink-0" />
                  )}
                </button>

                {/* Topic Content - Collapsible */}
                {expandedTopics[topic.id] && (
                  <div className="border-t-2 border-black bg-gray-50 p-4 md:p-6">
                    {/* Topic Image - 16:9 only */}
                    {topic.primary_image_url && (
                      <div className="mb-4 md:mb-6">
                        <img
                          src={topic.primary_image_url}
                          alt={lang === "en" ? topic.name_en : topic.name_km}
                          className="w-full max-w-3xl border-2 border-black object-cover"
                          style={{ aspectRatio: '16/9' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm md:text-base text-zinc-700 mb-4 md:mb-6 break-words whitespace-pre-wrap">
                      {lang === "en" ? topic.description_en : topic.description_km}
                    </p>

                    {/* Audio Player */}
                    {((lang === "en" && topic.audio_url_en) || (lang === "kh" && topic.audio_url_km)) && (
                      <div className="mb-4 md:mb-6">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudio(topic.id);
                          }}
                          className="bg-purple-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
                        >
                          {playingAudio === topic.id ? <Pause size={18} /> : <Play size={18} />}
                          {t.playAudio}
                        </button>
                        {playingAudio === topic.id && (
                          <audio
                            key={`audio-${topic.id}-${lang}`}
                            src={lang === "en" ? topic.audio_url_en : topic.audio_url_km}
                            autoPlay
                            onEnded={() => setPlayingAudio(null)}
                            onError={() => setPlayingAudio(null)}
                            className="hidden"
                          />
                        )}
                      </div>
                    )}

                    {/* Law Reference */}
                    {topic.law_reference && (
                      <div className="mb-4 md:mb-6 p-3 md:p-4 bg-amber-50 border-2 border-amber-600">
                        <p className="text-xs md:text-sm font-bold text-amber-900 mb-2">
                          {t.lawReference}
                        </p>
                        <p className="text-xs md:text-sm font-mono text-amber-800 break-words">
                          {topic.law_reference}
                        </p>
                      </div>
                    )}

                    {/* Questions Section - Collapsible Individual Questions */}
                    {questions[topic.id] && questions[topic.id].length > 0 && (
                      <div>
                        <h4 className="font-black text-base md:text-lg mb-4">
                          {t.questions}
                        </h4>
                        <div className="space-y-3">
                          {questions[topic.id].map((q, index) => (
                            <div
                              key={q.id}
                              className="bg-white border-2 border-black"
                            >
                              {/* Question Header - Clickable */}
                              <button
                                onClick={() => toggleQuestion(q.id)}
                                className="w-full p-3 md:p-4 flex items-start justify-between hover:bg-gray-100 transition-all text-left"
                              >
                                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0 pr-2">
                                  <span className="font-black text-xs md:text-sm bg-black text-white px-2 py-1 flex-shrink-0">
                                    Q{index + 1}
                                  </span>
                                  <p className="font-bold text-sm md:text-base break-words overflow-wrap-anywhere">
                                    {lang === "en" ? q.question_en : q.question_km}
                                  </p>
                                </div>
                                {expandedQuestions[q.id] ? (
                                  <ChevronUp size={20} className="flex-shrink-0" />
                                ) : (
                                  <ChevronDown size={20} className="flex-shrink-0" />
                                )}
                              </button>

                              {/* Question Details - Expanded */}
                              {expandedQuestions[q.id] && (
                                <div className="border-t-2 border-black bg-gray-50 p-3 md:p-4">
                                  {/* Question Image */}
                                  {q.image_url && (
                                    <div className="mb-4">
                                      <img
                                        src={q.image_url}
                                        alt="Question diagram"
                                        className="w-full border-2 border-black object-cover"
                                        style={{ aspectRatio: '16/9' }}
                                      />
                                    </div>
                                  )}

                                  {/* Answers */}
                                  <div className="space-y-2 mb-4">
                                    {q.answers.map((a, aIndex) => (
                                      <div
                                        key={a.id}
                                        className={`p-2 md:p-3 border-2 ${
                                          a.is_correct
                                            ? "bg-green-100 border-green-600"
                                            : "bg-white border-gray-300"
                                        }`}
                                      >
                                        <div className="flex items-start gap-2">
                                          <span className="font-bold flex-shrink-0 text-sm md:text-base">
                                            {String.fromCharCode(65 + aIndex)}.
                                          </span>
                                          <span className="flex-1 text-sm md:text-base break-words overflow-wrap-anywhere">
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
                                    <div className="p-3 bg-blue-50 border-2 border-blue-400">
                                      <p className="text-xs md:text-sm font-bold text-blue-900 mb-1">
                                        💡 Hint
                                      </p>
                                      <p className="text-xs md:text-sm text-blue-800 break-words overflow-wrap-anywhere">
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
