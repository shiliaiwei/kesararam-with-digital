"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { MediaSelector } from "../media/media-selector";
import { useToast } from "@/components/ui/toast-container";

interface TopicFormModalProps {
  categoryId?: number;
  categorySlug?: string;
  requiresImage?: boolean;
  requiresAudio?: boolean;
  initialData?: any;
  isAdmin?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { id: 1, name: "Road Signs", slug: "road-sign" },
  { id: 2, name: "Road Traffic", slug: "road-traffic" },
  { id: 3, name: "Priority Rules", slug: "priority" },
  { id: 4, name: "Driving Techniques", slug: "driving" },
  { id: 5, name: "Technical Knowledge", slug: "technical" },
  { id: 6, name: "Loading People & Goods", slug: "loading-people-goods" },
  { id: 7, name: "General Knowledge", slug: "general-knowledge" },
  { id: 8, name: "Emergency Situations", slug: "emergency" },
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

export function TopicFormModal({
  categoryId: propCategoryId,
  categorySlug: propCategorySlug,
  requiresImage = false,
  requiresAudio = false,
  initialData,
  isAdmin = false,
  onClose,
  onSuccess,
}: TopicFormModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: propCategoryId || initialData?.categoryId || initialData?.category_id || 1,
    topicCode: initialData?.topicCode || initialData?.topic_code || "",
    nameEn: initialData?.nameEn || initialData?.name_en || "",
    nameKm: initialData?.nameKm || initialData?.name_km || "",
    descriptionEn: initialData?.descriptionEn || initialData?.description_en || "",
    descriptionKm: initialData?.descriptionKm || initialData?.description_km || "",
    primaryImageUrl: initialData?.primaryImageUrl || initialData?.primary_image_url || "",
    primaryImageSource: initialData?.primaryImageSource || initialData?.primary_image_source || "url",
    lawReference: initialData?.lawReference || initialData?.law_reference || "",
    subGroup: initialData?.subGroup || initialData?.sub_group || "",
    audioUrlEn: initialData?.audioUrlEn || initialData?.audio_url_en || "",
    audioSourceEn: initialData?.audioSourceEn || initialData?.audio_source_en || "url",
    audioUrlKm: initialData?.audioUrlKm || initialData?.audio_url_km || "",
    audioSourceKm: initialData?.audioSourceKm || initialData?.audio_source_km || "url",
  });

  const selectedCategory = CATEGORIES.find(c => c.id === formData.categoryId);
  const currentCategorySlug = selectedCategory?.slug || propCategorySlug || "road-sign";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        topicCode: formData.topicCode || undefined,
        categoryId: formData.categoryId,
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
        status: isAdmin ? undefined : "pending", // Admin keeps current status, staff submits for review
      };

      // Admin uses admin endpoint (no status restriction), staff uses staff endpoint
      const baseUrl = isAdmin && initialData
        ? `/api/admin/topics/${initialData.id}`
        : initialData
        ? `/api/staff/topics/${initialData.id}`
        : "/api/staff/topics";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(baseUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast(
          initialData 
            ? "Topic updated and submitted for review" 
            : "Topic created and submitted for review",
          "success"
        );
        onSuccess();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to save topic", "error");
      }
    } catch (error) {
      console.error("Error saving topic:", error);
      showToast("Failed to save topic", "error");
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
          {/* Info Banner for Road Traffic */}
          {formData.categoryId === 2 && (
            <div className="bg-blue-50 border-2 border-blue-400 p-4">
              <p className="text-sm font-bold text-blue-900 mb-2">
                📝 Road Traffic Law Content
              </p>
              <p className="text-sm text-blue-800">
                For Road Traffic Law, you need to add questions after creating the topic. 
                Questions will appear on the public learn page for users to study.
              </p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-black text-lg">Basic Information</h3>

            <div>
              <label className="block font-bold mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  categoryId: parseInt(e.target.value),
                  subGroup: "" // Reset sub-group when category changes
                }))}
                className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
                {SUB_GROUPS[currentCategorySlug]?.map((sg) => (
                  <option key={sg} value={sg}>
                    {sg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Topic Code</label>
              <input
                type="text"
                name="topicCode"
                value={formData.topicCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                placeholder="e.g., RS-W-001, RT-SL-040, PR-INT-001"
              />
              <p className="text-xs text-zinc-600 mt-1">
                Optional. Leave blank to auto-generate.
              </p>
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
                placeholder={formData.nameEn ? "" : "e.g., Stop Sign, Speed Limit 40 km/h"}
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
                placeholder={formData.nameKm ? "" : "ឧ. សញ្ញាឈប់, កំណត់ល្បឿន ៤០ គ.ម/ម"}
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
                placeholder={formData.descriptionEn ? "" : "Enter description in English"}
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
                placeholder={formData.descriptionKm ? "" : "បញ្ចូលការពិពណ៌នាជាភាសាខ្មែរ"}
              />
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="font-black text-lg">Media Resources</h3>

            {/* Image Requirement Alert - Only for Q&A type categories */}
            {(formData.categoryId === 2 || formData.categoryId === 7) && (
              <div className="bg-orange-50 border-2 border-orange-500 p-4">
                <p className="text-sm font-bold text-orange-900 mb-2">
                  ⚠️ Image Aspect Ratio Requirement
                </p>
                <p className="text-sm text-orange-800">
                  All images MUST be in 16:9 aspect ratio (landscape). Images that don't meet this requirement will not be displayed on the public learn page.
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  Recommended sizes: 1920x1080, 1280x720, 960x540, or any 16:9 ratio
                </p>
              </div>
            )}

            {requiresImage && (
              <div className="bg-amber-50 border-2 border-amber-400 p-3">
                <p className="font-bold text-sm">Image is REQUIRED for this category</p>
              </div>
            )}

            {/* Audio Note */}
            <div className="bg-blue-50 border-2 border-blue-400 p-3">
              <p className="font-bold text-sm text-blue-900 mb-1">
                🎵 Audio Files (Optional)
              </p>
              <p className="text-xs text-blue-800">
                You can provide audio in one or both languages. If audio is not available for a language, leave it blank and users will see "Audio not available" on the learn page.
              </p>
            </div>

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
                label="Audio (English)"
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
                label="Audio (Khmer)"
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
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {loading ? "Submitting..." : "Submit for Review"}
          </button>

          <button
            onClick={onClose}
            type="button"
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
