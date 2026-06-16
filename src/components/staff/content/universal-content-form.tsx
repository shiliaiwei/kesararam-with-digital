"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Image as ImageIcon, Music, Video, Tag } from "lucide-react";
import { BrandSelect } from "@/components/ui/brand-select";
import { QAForm } from "./qa-form";
import { MediaSelector } from "../media/media-selector";

interface FormData {
  categoryId: string;
  type: string;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  questionEn: string;
  questionKm: string;
  answerEn: string;
  answerKm: string;
  imageUrl: string;
  audioUrlEn: string;
  audioUrlKm: string;
  videoUrl: string;
  logoUrl: string;
  brandUrl: string;
  difficulty: string;
  subtopic: string;
  scorePoints: string;
  timeLimit: string;
  resourceType: string;
  tags: string;
}

const CATEGORIES = [
  { id: 1, name: "Traffic Signs", slug: "road-sign" },
  { id: 2, name: "Road Traffic", slug: "road-traffic" },
  { id: 3, name: "Priority", slug: "priority" },
  { id: 4, name: "Driving", slug: "driving" },
  { id: 5, name: "Technical", slug: "technical" },
  { id: 6, name: "Loading People & Goods", slug: "loading-people-goods" },
  { id: 7, name: "General Knowledge", slug: "general-knowledge" },
  { id: 8, name: "Emergency", slug: "emergency" },
];

const CONTENT_TYPES = [
  { value: "qa", label: "Q&A" },
  { value: "flashcard", label: "Flashcard" },
  { value: "scenario", label: "Scenario" },
  { value: "reference", label: "Reference" },
  { value: "mixed", label: "Mixed" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function UniversalContentForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    categoryId: initialData?.categoryId?.toString() || "",
    type: initialData?.type || "qa",
    titleEn: initialData?.titleEn || "",
    titleKm: initialData?.titleKm || "",
    descriptionEn: initialData?.descriptionEn || "",
    descriptionKm: initialData?.descriptionKm || "",
    questionEn: initialData?.questionEn || "",
    questionKm: initialData?.questionKm || "",
    answerEn: initialData?.answerEn || "",
    answerKm: initialData?.answerKm || "",
    imageUrl: initialData?.imageUrl || "",
    audioUrlEn: initialData?.audioUrlEn || "",
    audioUrlKm: initialData?.audioUrlKm || "",
    videoUrl: initialData?.videoUrl || "",
    logoUrl: initialData?.logoUrl || "",
    brandUrl: initialData?.brandUrl || "",
    difficulty: initialData?.difficulty || "medium",
    subtopic: initialData?.subtopic || "",
    scorePoints: initialData?.scorePoints?.toString() || "10",
    timeLimit: initialData?.timeLimit?.toString() || "30",
    resourceType: initialData?.resourceType || "qa",
    tags: initialData?.tags?.join(", ") || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        categoryId: parseInt(formData.categoryId),
        type: formData.type,
        titleEn: formData.titleEn,
        titleKm: formData.titleKm,
        descriptionEn: formData.descriptionEn,
        descriptionKm: formData.descriptionKm,
        questionEn: formData.questionEn,
        questionKm: formData.questionKm,
        answerEn: formData.answerEn,
        answerKm: formData.answerKm,
        imageUrl: formData.imageUrl || null,
        audioUrlEn: formData.audioUrlEn || null,
        audioUrlKm: formData.audioUrlKm || null,
        videoUrl: formData.videoUrl || null,
        logoUrl: formData.logoUrl || null,
        brandUrl: formData.brandUrl || null,
        difficulty: formData.difficulty,
        subtopic: formData.subtopic || null,
        scorePoints: parseInt(formData.scorePoints),
        timeLimit: parseInt(formData.timeLimit),
        resourceType: formData.resourceType,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
      };

      const url = initialData
        ? `/api/staff/content/${initialData.id}`
        : "/api/staff/content";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/staff/content");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block font-bold mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <BrandSelect
              name="categoryId"
              value={String(formData.categoryId ?? "")}
              onValueChange={(v) => handleChange({ target: { name: "categoryId", value: v } } as any)}
              required
              fullWidth
              ariaLabel="Category"
              className="px-4 py-2"
              options={[
                { value: "", label: "Select Category" },
                ...CATEGORIES.map((cat) => ({ value: String(cat.id), label: cat.name })),
              ]}
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block font-bold mb-2">
              Content Type <span className="text-red-500">*</span>
            </label>
            <BrandSelect
              name="type"
              value={formData.type}
              onValueChange={(v) => handleChange({ target: { name: "type", value: v } } as any)}
              required
              fullWidth
              ariaLabel="Content Type"
              className="px-4 py-2"
              options={CONTENT_TYPES.map((type) => ({ value: type.value, label: type.label }))}
            />
          </div>
        </div>

        {/* Title English */}
        <div>
          <label className="block font-bold mb-2">
            Title (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="titleEn"
            value={formData.titleEn}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="Enter title in English"
          />
        </div>

        {/* Title Khmer */}
        <div>
          <label className="block font-bold mb-2">Title (Khmer)</label>
          <input
            type="text"
            name="titleKm"
            value={formData.titleKm}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="បញ្ចូលចំណងជើងជាភាសាខ្មែរ"
          />
        </div>
      </div>

      {/* Descriptions */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black">Descriptions</h2>

        {/* Description English */}
        <div>
          <label className="block font-bold mb-2">Description (English)</label>
          <textarea
            name="descriptionEn"
            value={formData.descriptionEn}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="Enter description in English"
          />
        </div>

        {/* Description Khmer */}
        <div>
          <label className="block font-bold mb-2">Description (Khmer)</label>
          <textarea
            name="descriptionKm"
            value={formData.descriptionKm}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="បញ្ចូលការពិពណ៌នាជាភាសាខ្មែរ"
          />
        </div>
      </div>

      {/* Q&A Section */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black">Question & Answer</h2>

        {/* Question English */}
        <div>
          <label className="block font-bold mb-2">Question (English)</label>
          <textarea
            name="questionEn"
            value={formData.questionEn}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="Enter question in English"
          />
        </div>

        {/* Question Khmer */}
        <div>
          <label className="block font-bold mb-2">Question (Khmer)</label>
          <textarea
            name="questionKm"
            value={formData.questionKm}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="បញ្ចូលសំណួរជាភាសាខ្មែរ"
          />
        </div>

        {/* Answer English */}
        <div>
          <label className="block font-bold mb-2">Answer (English)</label>
          <textarea
            name="answerEn"
            value={formData.answerEn}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="Enter answer in English"
          />
        </div>

        {/* Answer Khmer */}
        <div>
          <label className="block font-bold mb-2">Answer (Khmer)</label>
          <textarea
            name="answerKm"
            value={formData.answerKm}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="បញ្ចូលចម្លើយជាភាសាខ្មែរ"
          />
        </div>
      </div>

      {/* Media Resources */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black flex items-center gap-2">
          <ImageIcon size={24} />
          Media Resources
        </h2>

        {/* Image URL */}
        <div>
          <label className="block font-bold mb-2">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="https://example.com/image.jpg or Cloudinary URL"
          />
          <p className="text-sm text-zinc-600 mt-1">
            Enter external URL or select from Cloudinary
          </p>
        </div>

        {/* Audio URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2 flex items-center gap-2">
              <Music size={18} />
              Audio URL (English)
            </label>
            <input
              type="url"
              name="audioUrlEn"
              value={formData.audioUrlEn}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="https://example.com/audio-en.mp3"
            />
          </div>

          <div>
            <label className="block font-bold mb-2 flex items-center gap-2">
              <Music size={18} />
              Audio URL (Khmer)
            </label>
            <input
              type="url"
              name="audioUrlKm"
              value={formData.audioUrlKm}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="https://example.com/audio-km.mp3"
            />
          </div>
        </div>

        {/* Video URL */}
        <div>
          <label className="block font-bold mb-2 flex items-center gap-2">
            <Video size={18} />
            Video URL
          </label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="https://example.com/video.mp4"
          />
        </div>

        {/* Logo & Brand URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2">Logo URL</label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Brand URL</label>
            <input
              type="url"
              name="brandUrl"
              value={formData.brandUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="https://example.com/brand.png"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black text-black">Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Difficulty */}
          <div>
            <label className="block font-bold mb-2">Difficulty</label>
            <BrandSelect
              name="difficulty"
              value={formData.difficulty}
              onValueChange={(v) => handleChange({ target: { name: "difficulty", value: v } } as any)}
              fullWidth
              ariaLabel="Difficulty"
              className="px-4 py-2"
              options={DIFFICULTIES.map((diff) => ({ value: diff.value, label: diff.label }))}
            />
          </div>

          {/* Subtopic */}
          <div>
            <label className="block font-bold mb-2">Subtopic</label>
            <input
              type="text"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="e.g., Speed Limits"
            />
          </div>

          {/* Score Points */}
          <div>
            <label className="block font-bold mb-2">Score Points</label>
            <input
              type="number"
              name="scorePoints"
              value={formData.scorePoints}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
          </div>

          {/* Time Limit */}
          <div>
            <label className="block font-bold mb-2">Time Limit (sec)</label>
            <input
              type="number"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              min="10"
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-bold mb-2 flex items-center gap-2">
            <Tag size={18} />
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="safety, rules, regulations (comma separated)"
          />
          <p className="text-sm text-zinc-600 mt-1">
            Separate tags with commas
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-400 border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Save size={20} />
          {loading ? "Saving..." : initialData ? "Update Content" : "Create Content"}
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
