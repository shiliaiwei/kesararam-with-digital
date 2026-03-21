"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { SignDetailPopup } from "./sign-detail-popup";
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

const SUB_GROUPS = ["Warning", "Prohibitory", "Mandatory", "Informational"];

export function TrafficSignsCatalogue() {
  const { lang } = useLang();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

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
    km: {
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

  const t = translations[lang];

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

      {/* Signs Grid - Only Image + Code */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
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
            <p className="text-zinc-600 font-bold">{t.noSigns}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="group bg-white border-2 border-black hover:shadow-[4px_4px_0_#000] transition-all flex flex-col"
              >
                {/* Image Only */}
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

      {/* Sign Detail Popup */}
      {selectedTopic && (
        <SignDetailPopup
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
        />
      )}
    </div>
  );
}
