"use client";

import { useState } from "react";
import { X, Save, Send } from "lucide-react";
import { MediaSelector } from "../media/media-selector";

interface TopicFormModalProps {
  categoryId: number;
  categorySlug: string;
  requiresImage?: boolean;
  requiresAudio?: boolean;
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

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

export function TopicFormModal({
  categoryId,
  categorySlug,
  requiresImage = false,
  requiresAudio = false,
  initialData,
  onClose,
  onSuccess,
}: TopicFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topicCode: initialData?.topic_code || "",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (submitForReview = false) => {
    setLoading(true);

    try {
      const payload = {
        topicCode: formData.topicCode || undefined,
        categoryId,
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
          await fetch(`/api/staff/topics/${topic.id}/submit`, {
            method: "POST",
          });
        }

        onSuccess();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-yellow-400 border-b-4 border-black p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black">
            {initialData ? "Edit Topic" : "Create New Topic"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-black text-lg">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block font-bold mb-2">Sub-group / Type</label>
                <select
                  name="subGroup"
                  value={formData.subGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                >
                  <option value="">Select Type</option>
                  {SUB_GROUPS[categorySlug]?.map((sg) => (
                    <option key={sg} value={sg}>
                      {sg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

            <div>
              <label className="block font-bold mb-2">Law Reference</label>
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
          <div className="space-y-4">
            <h3 className="font-black text-lg">Descriptions</h3>

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
          <div className="space-y-4">
            <h3 className="font-black text-lg">Media Resources</h3>

            {requiresImage && (
              <div className="bg-amber-50 border-2 border-amber-400 p-3">
                <p className="font-bold text-sm">Image is REQUIRED for this category</p>
              </div>
            )}

            {requiresAudio && (
              <div className="bg-amber-50 border-2 border-amber-400 p-3">
                <p className="font-bold text-sm">
                  Audio (both languages) is REQUIRED for this category
                </p>
              </div>
            )}

            <MediaSelector
              type="image"
              label={`Primary Image${requiresImage ? " *" : ""}`}
              value={formData.primaryImageUrl}
              source={formData.primaryImageSource as "url" | "cloudinary"}
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
                label={`Audio (English)${requiresAudio ? " *" : ""}`}
                value={formData.audioUrlEn}
                source={formData.audioSourceEn as "url" | "cloudinary"}
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
                label={`Audio (Khmer)${requiresAudio ? " *" : ""}`}
                value={formData.audioUrlKm}
                source={formData.audioSourceKm as "url" | "cloudinary"}
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
        </div>

        {/* Actions */}
        <div className="border-t-4 border-black p-6 bg-gray-50 flex gap-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex-1 bg-blue-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? "Saving..." : "Save as Draft"}
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex-1 bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {loading ? "Submitting..." : "Submit for Review"}
          </button>

          <button
            onClick={onClose}
            className="bg-white border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2"
          >
            <X size={20} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
