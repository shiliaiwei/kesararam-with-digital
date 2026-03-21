"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { QADetailPopup } from "@/components/learn/qa-detail-popup";

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

interface QAItem extends Question {
  topic: Topic;
}

const SUB_GROUPS = ["Traffic Rules", "Speed Limits", "Parking", "Overtaking"];

export function RoadTrafficCatalogue() {
  const { lang } = useLang();
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [filteredQAItems, setFilteredQAItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedQA, setSelectedQA] = useState<QAItem | null>(null);

  const translations = {
    en: {
      category: "KNOWLEDGE CATEGORY",
      title: "Road Traffic Law",
      titleKm: "ច្បាប់ចរាចរណ៍ផ្លូវ",
      description: "Learn essential road traffic laws and regulations in Cambodia. Study law articles, case studies, and Q&A to understand your responsibilities as a road user.",
      backButton: "Back to Categories",
      searchPlaceholder: "Search by topic or question...",
      allTypes: "All Types",
      showing: "Showing",
      of: "of",
      questions: "questions",
      noQuestions: "No questions found",
    },
    kh: {
      category: "ប្រភេទចំណេះដឹង",
      title: "ច្បាប់ចរាចរណ៍ផ្លូវ",
      titleKm: "Road Traffic Law",
      description: "រៀនច្បាប់ និងបទប្បញ្ញត្តិចរាចរណ៍ផ្លូវសំខាន់ៗនៅកម្ពុជា។ សិក្សាអត្ថបទច្បាប់ ករណីសិក្សា និងសំណួរ-ចម្លើយ ដើម្បីយល់ពីទំនួលខុសត្រូវរបស់អ្នកក្នុងនាមជាអ្នកប្រើប្រាស់ផ្លូវ។",
      backButton: "ត្រឡប់ទៅប្រភេទ",
      searchPlaceholder: "ស្វែងរកតាមប្រធានបទ ឬសំណួរ...",
      allTypes: "ប្រភេទទាំងអស់",
      showing: "បង្ហាញ",
      of: "នៃ",
      questions: "សំណួរ",
      noQuestions: "រកមិនឃើញសំណួរ",
    },
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    fetchQAItems();
  }, []);

  useEffect(() => {
    filterQAItems();
  }, [qaItems, search, subGroupFilter]);

  const fetchQAItems = async () => {
    setLoading(true);
    try {
      // Fetch all topics for category 2 (Road Traffic)
      const topicsResponse = await fetch("/api/public/topics?categoryId=2&status=published");
      const topicsData = await topicsResponse.json();
      const topics = topicsData.topics || [];

      // Fetch questions for each topic
      const allQAItems: QAItem[] = [];
      for (const topic of topics) {
        try {
          const questionsResponse = await fetch(`/api/public/topics/${topic.id}/questions`);
          const questionsData = await questionsResponse.json();
          const questions = questionsData.questions || [];
          
          // Combine topic with each question
          questions.forEach((q: Question) => {
            allQAItems.push({
              ...q,
              topic,
            });
          });
        } catch (error) {
          console.error(`Error fetching questions for topic ${topic.id}:`, error);
        }
      }

      setQAItems(allQAItems);
    } catch (error) {
      console.error("Error fetching Q&A items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterQAItems = () => {
    let filtered = [...qaItems];

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.question_en.toLowerCase().includes(search.toLowerCase()) ||
          item.question_km.includes(search) ||
          item.topic.name_en.toLowerCase().includes(search.toLowerCase()) ||
          item.topic.name_km.includes(search) ||
          item.topic.topic_code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (subGroupFilter) {
      filtered = filtered.filter((item) => item.topic.sub_group === subGroupFilter);
    }

    setFilteredQAItems(filtered);
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
            {t.showing} {filteredQAItems.length} {t.of} {qaItems.length} {t.questions}
          </div>
        </div>
      </div>

      {/* Q&A List */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border-2 border-black p-4 animate-pulse"
                style={{ boxShadow: "2px 2px 0 #000" }}
              >
                <div className="h-5 bg-gray-200 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredQAItems.length === 0 ? (
          <div
            className="bg-white border-2 border-black p-12 text-center"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <p className="text-zinc-600 font-bold">{t.noQuestions}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQAItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSelectedQA(item)}
                className="w-full bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-left group"
                style={{ boxShadow: "2px 2px 0 #000" }}
              >
                <div className="flex items-start gap-4">
                  {/* Question ID */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-400 border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="font-black text-lg">Q{index + 1}</span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-zinc-100 border border-black px-2 py-0.5">
                        {item.topic.topic_code}
                      </span>
                      {item.topic.sub_group && (
                        <span className="text-xs font-bold bg-blue-100 border border-blue-400 px-2 py-0.5">
                          {item.topic.sub_group}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-base text-black line-clamp-2">
                      {lang === "en" ? item.question_en : item.question_km}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Q&A Detail Popup */}
      {selectedQA && (
        <QADetailPopup
          qaItem={selectedQA}
          onClose={() => setSelectedQA(null)}
        />
      )}
    </div>
  );
}
