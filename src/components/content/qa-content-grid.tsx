"use client";

import { useState, useEffect } from "react";
import { Volume2, X, FileText, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useLang } from "@/context/lang-context";
import type { ContentItem } from "@/db/schema";

interface QAContentGridProps {
  categorySlug: string;
  initialContent?: ContentItem[];
}

export function QAContentGrid({ categorySlug, initialContent = [] }: QAContentGridProps) {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(!initialContent.length);
  const { lang } = useLang();
  const kh = lang === "kh";

  useEffect(() => {
    if (!initialContent.length) {
      fetchContent();
    }
  }, [categorySlug]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/${categorySlug}`);
      const data = await response.json();
      setContent(data.content || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border-2 border-black p-6 animate-pulse"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!content.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-yellow-400 border-2 border-black mx-auto mb-4 flex items-center justify-center">
          <FileText size={32} className="text-black" />
        </div>
        <h3 className="text-xl font-black mb-2">
          {kh ? "មិនទាន់មានមាតិកា" : "No content yet"}
        </h3>
        <p className="text-sm text-zinc-500">
          {kh
            ? "អ្នកគ្រប់គ្រងនឹងបោះពុម្ពមាតិកាឆាប់ៗនេះ។"
            : "An administrator will publish content for this category soon."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Q&A List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-white border-2 border-black p-6 hover:shadow-[6px_6px_0_#000] transition-all duration-200 text-left group"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-400 border border-black text-xs font-bold">
                    Q{index + 1}
                  </span>
                  {item.difficulty && (
                    <span className="px-2 py-1 bg-gray-200 border border-black text-xs font-bold">
                      {item.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-black mb-2 line-clamp-2">
                  {kh ? item.questionKm || item.questionEn : item.questionEn}
                </h3>
                {item.subtopic && (
                  <p className="text-xs text-zinc-500 mb-2">{item.subtopic}</p>
                )}
                {item.imageUrl && (
                  <div className="relative w-full h-32 mt-3 border border-black">
                    <Image
                      src={item.imageUrl}
                      alt="Question illustration"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <ChevronRight
                size={20}
                className="text-black group-hover:translate-x-1 transition-transform flex-shrink-0"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-yellow-400">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-black text-white text-sm font-bold">
                  Q{content.findIndex((c) => c.id === selectedItem.id) + 1}
                </span>
                {selectedItem.difficulty && (
                  <span className="px-3 py-1 bg-white border-2 border-black text-sm font-bold">
                    {selectedItem.difficulty}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 border-2 border-black bg-red-400 flex items-center justify-center hover:bg-red-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              {selectedItem.imageUrl && (
                <div className="relative w-full h-64 bg-gray-50 border-2 border-black">
                  <Image
                    src={selectedItem.imageUrl}
                    alt="Question illustration"
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                </div>
              )}

              {/* Question Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-black uppercase">
                      Question (English)
                    </h4>
                    {selectedItem.audioUrlEn && (
                      <button
                        onClick={() => playAudio(selectedItem.audioUrlEn!)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-400 border-2 border-black text-xs font-bold hover:bg-blue-300"
                      >
                        <Volume2 size={14} />
                        Play Audio
                      </button>
                    )}
                  </div>
                  <p className="text-base font-medium text-black">
                    {selectedItem.questionEn}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4
                      className="text-sm font-bold text-black uppercase"
                      style={{ fontFamily: "var(--font-learning)" }}
                    >
                      សំណួរ (ខ្មែរ)
                    </h4>
                    {selectedItem.audioUrlKm && (
                      <button
                        onClick={() => playAudio(selectedItem.audioUrlKm!)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-400 border-2 border-black text-xs font-bold hover:bg-blue-300"
                      >
                        <Volume2 size={14} />
                        ចាក់សំឡេង
                      </button>
                    )}
                  </div>
                  <p
                    className="text-base font-medium text-black"
                    style={{ fontFamily: "var(--font-learning)" }}
                  >
                    {selectedItem.questionKm || selectedItem.questionEn}
                  </p>
                </div>
              </div>

              {/* Answer Section */}
              <div className="border-t-2 border-black pt-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-green-600 uppercase">
                    Answer (English)
                  </h4>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {selectedItem.answerEn}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4
                    className="text-sm font-bold text-green-600 uppercase"
                    style={{ fontFamily: "var(--font-learning)" }}
                  >
                    ចម្លើយ (ខ្មែរ)
                  </h4>
                  <p
                    className="text-sm text-zinc-700 leading-relaxed"
                    style={{ fontFamily: "var(--font-learning)" }}
                  >
                    {selectedItem.answerKm || selectedItem.answerEn}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              {(selectedItem.subtopic || selectedItem.scorePoints) && (
                <div className="flex items-center gap-2 pt-4 border-t border-black flex-wrap">
                  {selectedItem.subtopic && (
                    <span className="px-3 py-1 bg-gray-100 border border-black text-xs font-bold">
                      {selectedItem.subtopic}
                    </span>
                  )}
                  {selectedItem.scorePoints && (
                    <span className="px-3 py-1 bg-green-100 border border-black text-xs font-bold">
                      {selectedItem.scorePoints} points
                    </span>
                  )}
                  {selectedItem.timeLimit && (
                    <span className="px-3 py-1 bg-blue-100 border border-black text-xs font-bold">
                      {selectedItem.timeLimit}s
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
