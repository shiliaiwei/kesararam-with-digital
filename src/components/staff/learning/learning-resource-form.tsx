"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, BookOpen } from "lucide-react";
import { MediaSelector } from "../media/media-selector";
import { QAForm } from "../content/qa-form";

interface Question {
  id: string;
  questionEn: string;
  questionKm: string;
  hintEn: string;
  hintKm: string;
  imageUrl: string;
  imageSource: "url" | "cloudinary";
  audioUrlEn: string;
  audioSourceEn: "url" | "cloudinary";
  audioUrlKm: string;
  audioSourceKm: "url" | "cloudinary";
  answers: unknown[];
  expanded: boolean;
}

const CATEGORIES = [
  { id: 1, name: "Traffic Signs", slug: "road-sign", icon: "🚦" },
  { id: 2, name: "Road Traffic", slug: "road-traffic", icon: "🚗" },
  { id: 3, name: "Priority", slug: "priority", icon: "⚠️" },
  { id: 4, name: "Driving", slug: "driving", icon: "🚙" },
  { id: 5, name: "Technical", slug: "technical", icon: "🔧" },
  { id: 6, name: "Loading People & Goods", slug: "loading-people-goods", icon: "📦" },
  { id: 7, name: "General Knowledge", slug: "general-knowledge", icon: "📚" },
  { id: 8, name: "Emergency", slug: "emergency", icon: "🚨" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "bg-green-400" },
  { value: "medium", label: "Medium", color: "bg-yellow-400" },
  { value: "hard", label: "Hard", color: "bg-red-400" },
];

export function LearningResourceForm({ initialData }: { initialData?: Record<string, unknown> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.categoryId?.toString() || ""
  );
  const [formData, setFormData] = useState({
    titleEn: initialData?.titleEn || "",
    titleKm: initialData?.titleKm || "",
    descriptionEn: initialData?.descriptionEn || "",
    descriptionKm: initialData?.descriptionKm || "",
    difficulty: initialData?.difficulty || "medium",
    subtopic: initialData?.subtopic || "",
    imageUrl: initialData?.imageUrl || "",
    imageSource: (initialData?.imageSource || "url") as "url" | "cloudinary",
    audioUrlEn: initialData?.audioUrlEn || "",
    audioSourceEn: (initialData?.audioSourceEn || "url") as "url" | "cloudinary",
    audioUrlKm: initialData?.audioUrlKm || "",
    audioSourceKm: (initialData?.audioSourceKm || "url") as "url" | "cloudinary",
    videoUrl: initialData?.videoUrl || "",
    tags: initialData?.tags?.join(", ") || "",
  });

  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        categoryId: parseInt(selectedCategory),
        type: "learning_resource",
        titleEn: formData.titleEn,
        titleKm: formData.titleKm,
        descriptionEn: formData.descriptionEn,
        descriptionKm: formData.descriptionKm,
        difficulty: formData.difficulty,
        subtopic: formData.subtopic,
        imageUrl: formData.imageUrl,
        imageSource: formData.imageSource,
        audioUrlEn: formData.audioUrlEn,
        audioSourceEn: formData.audioSourceEn,
        audioUrlKm: formData.audioUrlKm,
        audioSourceKm: formData.audioSourceKm,
        videoUrl: formData.videoUrl,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        questions: questions.map((q) => ({
          questionEn: q.questionEn,
          questionKm: q.questionKm,
          hintEn: q.hintEn,
          hintKm: q.hintKm,
          imageUrl: q.imageUrl,
          imageSource: q.imageSource,
          audioUrlEn: q.audioUrlEn,
          audioSourceEn: q.audioSourceEn,
          audioUrlKm: q.audioUrlKm,
          audioSourceKm: q.audioSourceKm,
          answers: q.answers,
        })),
      };

      const url = initialData
        ? `/api/staff/learning-resources/${initialData.id}`
        : "/api/staff/learning-resources";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/staff/learning-resources");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save learning resource");
      }
    } catch (error) {
      console.error("Error saving learning resource:", error);
      alert("Failed to save learning resource");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryData = CATEGORIES.find(
    (c) => c.id.toString() === selectedCategory
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Selection */}
      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
          <BookOpen size={24} />
          Select Category
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Choose which category this learning resource belongs to
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id.toString())}
              className={`p-4 border-2 border-black font-bold transition-all ${
                selectedCategory === category.id.toString()
                  ? "bg-blue-400 shadow-[4px_4px_0_#000]"
                  : "bg-white hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-sm">{category.name}</div>
            </button>
          ))}
        </div>

        {selectedCategoryData && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-600">
            <p className="font-bold text-blue-900">
              Selected: {selectedCategoryData.icon} {selectedCategoryData.name}
            </p>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2">
              Title (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, titleEn: e.target.value }))
              }
              required
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="Enter title in English"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Title (Khmer)</label>
            <input
              type="text"
              value={formData.titleKm}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, titleKm: e.target.value }))
              }
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2">Description (English)</label>
            <textarea
              value={formData.descriptionEn}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descriptionEn: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
              placeholder="Enter description in English"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Description (Khmer)</label>
            <textarea
              value={formData.descriptionKm}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  descriptionKm: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
              placeholder="បញ្ចូលការពិពណ៌នាជាភាសាខ្មែរ"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold mb-2">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, difficulty: e.target.value }))
              }
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2">Subtopic</label>
            <input
              type="text"
              value={formData.subtopic}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtopic: e.target.value }))
              }
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="e.g., Speed Limits"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="safety, rules (comma separated)"
            />
          </div>
        </div>
      </div>

      {/* Media Resources */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black">Media Resources</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaSelector
            type="image"
            label="Main Image"
            value={formData.imageUrl}
            source={formData.imageSource}
            onChange={(url, source) =>
              setFormData((prev) => ({ ...prev, imageUrl: url, imageSource: source }))
            }
          />

          <div>
            <label className="block font-bold mb-2">Video URL</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
              }
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="https://example.com/video.mp4"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaSelector
            type="audio"
            label="Audio (English)"
            value={formData.audioUrlEn}
            source={formData.audioSourceEn}
            onChange={(url, source) =>
              setFormData((prev) => ({
                ...prev,
                audioUrlEn: url,
                audioSourceEn: source,
              }))
            }
          />

          <MediaSelector
            type="audio"
            label="Audio (Khmer)"
            value={formData.audioUrlKm}
            source={formData.audioSourceKm}
            onChange={(url, source) =>
              setFormData((prev) => ({
                ...prev,
                audioUrlKm: url,
                audioSourceKm: source,
              }))
            }
          />
        </div>
      </div>

      {/* Questions & Answers */}
      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black mb-4">
          Questions & Answers <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Add questions and answers that will be used in quizzes, flashcards, and challenges
        </p>

        <QAForm questions={questions} onChange={setQuestions} />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || !selectedCategory || questions.length === 0}
          className="bg-green-400 border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Save size={20} />
          {loading
            ? "Saving..."
            : initialData
            ? "Update Resource"
            : "Create Resource"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <X size={20} />
          Cancel
        </button>
      </div>
    </form>
  );
}
