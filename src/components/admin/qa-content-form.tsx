"use client";

import { useState } from "react";
import { X, Save, Image as ImageIcon, Volume2 } from "lucide-react";
import Image from "next/image";
import { CloudinaryMediaBrowser } from "@/components/media/cloudinary-media-browser";

interface ContentItem {
  id?: number;
  questionEn: string;
  questionKm: string;
  answerEn: string;
  answerKm: string;
  imageUrl?: string | null;
  audioUrlEn?: string | null;
  audioUrlKm?: string | null;
  difficulty?: string | null;
  subtopic?: string | null;
  scorePoints: number;
  timeLimit: number;
  isActive: boolean;
}

interface QAContentFormProps {
  content?: ContentItem | null;
  categoryId: number;
  onClose: () => void;
  onSave: (content: Partial<ContentItem>) => void;
}

export function QAContentForm({
  content,
  categoryId,
  onClose,
  onSave,
}: QAContentFormProps) {
  const [formData, setFormData] = useState<ContentItem>({
    questionEn: content?.questionEn || "",
    questionKm: content?.questionKm || "",
    answerEn: content?.answerEn || "",
    answerKm: content?.answerKm || "",
    imageUrl: content?.imageUrl || null,
    audioUrlEn: content?.audioUrlEn || null,
    audioUrlKm: content?.audioUrlKm || null,
    difficulty: content?.difficulty || "medium",
    subtopic: content?.subtopic || null,
    scorePoints: content?.scorePoints || 10,
    timeLimit: content?.timeLimit || 30,
    isActive: content?.isActive ?? true,
  });

  const [activeTab, setActiveTab] = useState<"en" | "km">("en");
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [audioUrlInput, setAudioUrlInput] = useState({
    en: formData.audioUrlEn || "",
    km: formData.audioUrlKm || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, imageUrl }));
    setShowMediaBrowser(false);
  };

  const handleAudioUrlChange = (language: "en" | "km", url: string) => {
    setAudioUrlInput((prev) => ({ ...prev, [language]: url }));
    setFormData((prev) => ({
      ...prev,
      [language === "en" ? "audioUrlEn" : "audioUrlKm"]: url || null,
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 overflow-y-auto">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-5xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-black">
            <h2 className="text-xl font-black text-black">
              {content ? "Edit Q&A Content" : "Add New Q&A Content"}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 border-2 border-black bg-red-400 flex items-center justify-center hover:bg-red-300"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Language Tabs */}
            <div className="flex border-2 border-black">
              <button
                type="button"
                onClick={() => setActiveTab("en")}
                className={`flex-1 py-2 px-4 font-bold text-sm border-r-2 border-black ${
                  activeTab === "en" ? "bg-blue-400" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("km")}
                className={`flex-1 py-2 px-4 font-bold text-sm ${
                  activeTab === "km" ? "bg-blue-400" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                ខ្មែរ (Khmer)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Media & Settings */}
              <div className="space-y-6">
                {/* Image Selection */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Image (Optional)
                  </label>
                  <div className="border-2 border-black bg-yellow-50 p-4">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <Image
                          src={formData.imageUrl}
                          alt="Preview"
                          width={400}
                          height={200}
                          className="w-full h-48 object-contain border-2 border-black bg-white"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: null }))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-400 border border-black flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="h-48 border-2 border-dashed border-black flex flex-col items-center justify-center text-zinc-600">
                        <ImageIcon size={32} className="mb-2" />
                        <p className="text-sm font-medium">Select from Cloudinary</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowMediaBrowser(true)}
                      className="mt-3 w-full flex items-center justify-center gap-2 p-2 border-2 border-black bg-blue-400 hover:bg-blue-300 font-bold text-sm"
                    >
                      <ImageIcon size={16} />
                      Browse Cloudinary Media
                    </button>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty || "medium"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, difficulty: e.target.value }))
                      }
                      className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Subtopic (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.subtopic || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subtopic: e.target.value || null }))
                      }
                      className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                      placeholder="e.g., Traffic Laws, Safety Rules"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Score Points
                      </label>
                      <input
                        type="number"
                        value={formData.scorePoints}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            scorePoints: parseInt(e.target.value) || 10,
                          }))
                        }
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Time Limit (s)
                      </label>
                      <input
                        type="number"
                        value={formData.timeLimit}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            timeLimit: parseInt(e.target.value) || 30,
                          }))
                        }
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                        min="10"
                        max="300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="space-y-6">
                {/* English Content */}
                {activeTab === "en" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Question (English)
                      </label>
                      <textarea
                        value={formData.questionEn}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, questionEn: e.target.value }))
                        }
                        rows={3}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none resize-none"
                        placeholder="Enter the question..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Answer (English)
                      </label>
                      <textarea
                        value={formData.answerEn}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, answerEn: e.target.value }))
                        }
                        rows={6}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none resize-none"
                        placeholder="Enter the detailed answer..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Audio URL (English) - Optional
                      </label>
                      <input
                        type="url"
                        value={audioUrlInput.en}
                        onChange={(e) => handleAudioUrlChange("en", e.target.value)}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                        placeholder="https://example.com/audio-en.mp3"
                      />
                      {formData.audioUrlEn && (
                        <button
                          type="button"
                          onClick={() => new Audio(formData.audioUrlEn!).play()}
                          className="mt-2 flex items-center gap-1 px-3 py-2 bg-blue-400 border-2 border-black text-sm font-bold"
                        >
                          <Volume2 size={14} />
                          Test Audio
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Khmer Content */}
                {activeTab === "km" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Question (Khmer)
                      </label>
                      <textarea
                        value={formData.questionKm}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, questionKm: e.target.value }))
                        }
                        rows={3}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none resize-none"
                        style={{ fontFamily: "Siemreap, sans-serif" }}
                        placeholder="បញ្ចូលសំណួរ..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Answer (Khmer)
                      </label>
                      <textarea
                        value={formData.answerKm}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, answerKm: e.target.value }))
                        }
                        rows={6}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none resize-none"
                        style={{ fontFamily: "Siemreap, sans-serif" }}
                        placeholder="បញ្ចូលចម្លើយលម្អិត..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Audio URL (Khmer) - Optional
                      </label>
                      <input
                        type="url"
                        value={audioUrlInput.km}
                        onChange={(e) => handleAudioUrlChange("km", e.target.value)}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                        placeholder="https://example.com/audio-km.mp3"
                      />
                      {formData.audioUrlKm && (
                        <button
                          type="button"
                          onClick={() => new Audio(formData.audioUrlKm!).play()}
                          className="mt-2 flex items-center gap-1 px-3 py-2 bg-blue-400 border-2 border-black text-sm font-bold"
                        >
                          <Volume2 size={14} />
                          ចាក់សំឡេង
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-black">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-red-400 border-2 border-black font-bold text-sm hover:bg-red-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000]"
              >
                <Save size={16} />
                {content ? "Update" : "Create"} Content
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cloudinary Media Browser */}
      <CloudinaryMediaBrowser
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={handleImageSelect}
        selectedUrl={formData.imageUrl || ""}
      />
    </>
  );
}
