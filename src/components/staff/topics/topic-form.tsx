"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Send } from "lucide-react";
import { MediaSelector } from "../media/media-selector";

interface TopicFormData {
  topicCode: string;
  categoryId: string;
  nameEn: string;
  nameKm: string;
  descriptionEn: string;
  descriptionKm: string;
  primaryImageUrl: string;
  primaryImageSource: "url" | "cloudinary";
  lawReference: string;
  subGroup: string;
  audioUrlEn: string;
  audioSourceEn: "url" | "cloudinary";
  audioUrlKm: string;
  audioSourceKm: "url" | "cloudinary";
}

const CATEGORIES = [
  { id: 1, name: "Traffic Signs", slug: "road-sign", requiresImage: true, requiresAudio: true },
  { id: 2, name: "Road Traffic Law", slug: "road-traffic", requiresImage: false, requiresAudio: false },
  { id: 3, name: "Right of Way", slug: "priority", requiresImage: true, requiresAudio: false },
  { id: 4, name: "Driving Skills", slug: "driving", requiresImage: false, requiresAudio: false },
  { id: 5, name: "Vehicle Technology", slug: "technical", requiresImage: false, requiresAudio: false },
  { id: 6, name: "Loading People & Goods", slug: "loading-people-goods", requiresImage: false, requiresAudio: false },
  { id: 7, name: "General Knowledge", slug: "general-knowledge", requiresImage: false, requiresAudio: false },
  { id: 8, name: "Emergency", slug: "emergency", requiresImage: false, requiresAudio: true },
];

const SUB_GROUPS: Record<string, string[]> = {
  "road-sign": ["Warning", "Prohibitory", "Mandatory", "Informational"],
  "road-traffic": ["Traffic Rules", "Speed Limits", "Parking", "Overtaking"],
  "priority": ["Intersections", "Roundabouts", "Pedestrian Crossings"],
  "driving": ["Basic Maneuvers", "Advanced Techniques", "Defensive Driving"],
  "technical": ["Engine", "Brakes", "Lights", "Safety Systems"],
  "loading-people-goods": ["Weight Limits", "Passenger Safety", "Cargo Securing"],
  "general-knowledge": ["Road Safety", "Environmental", "Legal"],
  "emergency": ["Accidents", "Breakdowns", "First Aid", "Emergency Contacts"],
};

export function TopicForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TopicFormData>({
    topicCode: initialData?.topic_code || "",
    categoryId: initialData?.category_id?.toString() || "",
    nameEn: initialData?.name_en || "",
    nameKm: initialData?.name_km || "",
    descriptionEn: initialData?.description_en || "",
    descriptionKm: initialData?.description_km || "",
    primaryImageUrl: initialData?.primary_image_url || "",
    primaryImageSource: initialData?.primary_image_source || "url",
    lawReference: initialData?.law_reference || "",
    subGroup: initialData?.sub_group || "",
    audioUrlEn: initialData?.audio_url_en || "",
    audioSourceEn: initialData?.audio_source_en || "url",
    audioUrlKm: initialData?.audio_url_km || "",
    audioSourceKm: initialData?.audio_source_km || "url",
  });

  const selectedCategory = CATEGORIES.find(
    (c) => c.id.toString() === formData.categoryId
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, submitForReview = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        topicCode: formData.topicCode || undefined,
        categoryId: parseInt(formData.categoryId),
        nameEn: formData.nameEn,
        nameKm: formData.nameKm,
        descriptionEn: formData.descriptionEn,
        descriptionKm: formData.descriptionKm,
        primaryImageUrl: formData.primaryImageUrl || null,
        primaryImageSource: formData.primaryImageSource,
        lawReference: formData.lawReference || null,
        subGroup: formData.subGroup || null,
        audioUrlEn: formData.audioUrlEn || null,
        audioSourceEn: formData.audioSourceEn,
        audioUrlKm: formData.audioUrlKm || null,
        audioSourceKm: formData.audioSourceKm,
        status: submitForReview ? "pending" : "draft",
      };

      const url = initialData
        ? `/api/staff/topics/${initialData.id}`
        : "/api/staff/topics";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const { topic } = await response.json();
        
        if (submitForReview && !initialData) {
          // Submit immediately after creation
          await fetch(`/api/staff/topics/${topic.id}/submit`, {
            method: "POST",
          });
        }
        
        router.push("/staff/topics");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save topic");
      }
    } catch (error) {
      console.error("Error saving topic:", error);
      alert("Failed to save topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Basic Information */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topic Code */}
          <div>
            <label className="block font-bold mb-2">Topic Code</label>
            <input
              type="text"
              name="topicCode"
              value={formData.topicCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="Auto-generated if empty"
            />
            <p className="text-sm text-zinc-600 mt-1">
              Leave empty for auto-generation
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-group */}
        {formData.categoryId && selectedCategory && (
          <div>
            <label className="block font-bold mb-2">Sub-group / Type</label>
            <select
              name="subGroup"
              value={formData.subGroup}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            >
              <option value="">Select Sub-group</option>
              {SUB_GROUPS[selectedCategory.slug]?.map((sg) => (
                <option key={sg} value={sg}>
                  {sg}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Name English */}
        <div>
          <label className="block font-bold mb-2">
            Name (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nameEn"
            value={formData.nameEn}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="Enter name in English"
          />
        </div>

        {/* Name Khmer */}
        <div>
          <label className="block font-bold mb-2">
            Name (Khmer) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nameKm"
            value={formData.nameKm}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="បញ្ចូលឈ្មោះជាភាសាខ្មែរ"
          />
        </div>

        {/* Law Reference */}
        <div>
          <label className="block font-bold mb-2">Law / Article Reference</label>
          <input
            type="text"
            name="lawReference"
            value={formData.lawReference}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder="e.g., Article 42, Section 3"
          />
        </div>
      </div>

      {/* Descriptions */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black">Descriptions</h2>

        <div>
          <label className="block font-bold mb-2">
            Description (English) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descriptionEn"
            value={formData.descriptionEn}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="Enter detailed description in English"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">
            Description (Khmer) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descriptionKm"
            value={formData.descriptionKm}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
            placeholder="បញ្ចូលការពិពណ៌នាលម្អិតជាភាសាខ្មែរ"
          />
        </div>
      </div>

      {/* Media */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-xl font-black">Media Resources</h2>

        {selectedCategory?.requiresImage && (
          <div className="bg-amber-50 border-2 border-amber-400 p-3">
            <p className="font-bold text-sm">
              Image is REQUIRED for {selectedCategory.name}
            </p>
          </div>
        )}

        {selectedCategory?.requiresAudio && (
          <div className="bg-amber-50 border-2 border-amber-400 p-3">
            <p className="font-bold text-sm">
              Audio (both languages) is REQUIRED for {selectedCategory.name}
            </p>
          </div>
        )}

        <MediaSelector
          type="image"
          label={`Primary Image${selectedCategory?.requiresImage ? " *" : ""}`}
          value={formData.primaryImageUrl}
          source={formData.primaryImageSource}
          onChange={(url, source) =>
            setFormData((prev) => ({
              ...prev,
              primaryImageUrl: url,
              primaryImageSource: source,
            }))
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaSelector
            type="audio"
            label={`Audio (English)${selectedCategory?.requiresAudio ? " *" : ""}`}
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
            label={`Audio (Khmer)${selectedCategory?.requiresAudio ? " *" : ""}`}
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

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-400 border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save as Draft"}
        </button>

        <button
          type="button"
          onClick={(e) => handleSubmit(e as any, true)}
          disabled={loading}
          className="bg-green-400 border-2 border-black px-8 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Send size={20} />
          {loading ? "Submitting..." : "Submit for Review"}
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
