"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Volume2, X } from "lucide-react";
import { useLang } from "@/context/lang-context";
import type { TrafficSign } from "@/db/schema";

interface TrafficSignsGridProps {
  initialSigns?: TrafficSign[];
}

export function TrafficSignsGrid({ initialSigns = [] }: TrafficSignsGridProps) {
  const [signs, setSigns] = useState<TrafficSign[]>(initialSigns);
  const [selectedSign, setSelectedSign] = useState<TrafficSign | null>(null);
  const [loading, setLoading] = useState(!initialSigns.length);
  const { lang } = useLang();
  const kh = lang === "kh";

  useEffect(() => {
    if (!initialSigns.length) {
      fetchSigns();
    }
  }, []);

  const fetchSigns = async () => {
    try {
      const response = await fetch("/api/traffic-signs");
      const data = await response.json();
      setSigns(data.signs || []);
    } catch (error) {
      console.error("Error fetching signs:", error);
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-white border-2 border-black animate-pulse"
            style={{ boxShadow: "4px 4px 0 #000" }}
          />
        ))}
      </div>
    );
  }

  if (!signs.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-yellow-400 border-2 border-black mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">🚦</span>
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
      {/* Responsive Grid - Uniform Card Sizes */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-3">
        {signs.map((sign) => (
          <button
            key={sign.id}
            onClick={() => setSelectedSign(sign)}
            className="bg-white border-2 border-black hover:shadow-[4px_4px_0_#000] transition-all duration-200 group overflow-hidden"
            style={{ 
              boxShadow: "3px 3px 0 #000",
              aspectRatio: "1 / 1",
              minHeight: "100px"
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center p-3">
              <Image
                src={sign.imageUrl}
                alt={kh ? sign.titleKm : sign.titleEn}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 14vw, 10vw"
                className="object-contain group-hover:scale-110 transition-transform duration-200"
                style={{ padding: "8px" }}
                unoptimized
              />
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedSign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-yellow-400">
              <h2 className="text-xl font-black text-black">
                {kh ? selectedSign.titleKm : selectedSign.titleEn}
              </h2>
              <button
                onClick={() => setSelectedSign(null)}
                className="w-8 h-8 border-2 border-black bg-red-400 flex items-center justify-center hover:bg-red-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="relative w-full h-64 bg-gray-50 border-2 border-black">
                <Image
                  src={selectedSign.imageUrl}
                  alt={kh ? selectedSign.titleKm : selectedSign.titleEn}
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
              </div>

              {/* Bilingual Title */}
              <div>
                <h3 className="text-2xl font-black text-black mb-2">
                  {selectedSign.titleEn}
                </h3>
                <p
                  className="text-xl text-zinc-600"
                  style={{ fontFamily: "Siemreap, sans-serif" }}
                >
                  {selectedSign.titleKm}
                </p>
              </div>

              {/* English Description + Audio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-black uppercase">
                    English
                  </h4>
                  {selectedSign.audioUrlEn ? (
                    <button
                      onClick={() => playAudio(selectedSign.audioUrlEn!)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-400 border-2 border-black text-xs font-bold hover:bg-blue-300"
                    >
                      <Volume2 size={14} />
                      Play Audio
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      Audio not available
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {selectedSign.descriptionEn}
                </p>
              </div>

              {/* Khmer Description + Audio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4
                    className="text-sm font-bold text-black uppercase"
                    style={{ fontFamily: "Siemreap, sans-serif" }}
                  >
                    ភាសាខ្មែរ
                  </h4>
                  {selectedSign.audioUrlKm ? (
                    <button
                      onClick={() => playAudio(selectedSign.audioUrlKm!)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-400 border-2 border-black text-xs font-bold hover:bg-blue-300"
                    >
                      <Volume2 size={14} />
                      ចាក់សំឡេង
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 italic" style={{ fontFamily: "Siemreap, sans-serif" }}>
                      មិនមានសំឡេង
                    </span>
                  )}
                </div>
                <p
                  className="text-sm text-zinc-700 leading-relaxed"
                  style={{ fontFamily: "Siemreap, sans-serif" }}
                >
                  {selectedSign.descriptionKm}
                </p>
              </div>

              {/* Sign Type Badge */}
              <div className="flex items-center gap-2 pt-4 border-t-2 border-black">
                <span className="px-3 py-1 bg-gray-200 border border-black text-xs font-bold">
                  {selectedSign.signType}
                </span>
                {selectedSign.category && (
                  <span className="px-3 py-1 bg-gray-200 border border-black text-xs font-bold">
                    {selectedSign.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
