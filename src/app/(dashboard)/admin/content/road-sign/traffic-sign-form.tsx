"use client";

import { useState } from "react";
import { X, Volume2, Save, Eye, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { BrandSelect } from "@/components/ui/brand-select";
import { CloudinaryMediaBrowser } from "@/components/media/cloudinary-media-browser";

interface TrafficSign {
  id?: number;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  imageUrl: string;
  audioUrlEn?: string | null;
  audioUrlKm?: string | null;
  signType: string;
  category?: string | null;
  status?: string;
  isActive: boolean;
  createdAt?: string;
}

interface TrafficSignFormProps {
  sign?: TrafficSign | null;
  onClose: () => void;
  onSave: (sign: TrafficSign) => void;
}

export function TrafficSignForm({ sign, onClose, onSave }: TrafficSignFormProps) {
  const [formData, setFormData] = useState<TrafficSign>({
    titleEn: sign?.titleEn || "",
    titleKm: sign?.titleKm || "",
    descriptionEn: sign?.descriptionEn || "",
    descriptionKm: sign?.descriptionKm || "",
    imageUrl: sign?.imageUrl || "",
    audioUrlEn: sign?.audioUrlEn || null,
    audioUrlKm: sign?.audioUrlKm || null,
    signType: sign?.signType || "regulatory",
    category: sign?.category || null,
    isActive: sign?.isActive ?? true,
  });

  const [activeTab, setActiveTab] = useState<"en" | "km">("en");
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
    setShowMediaBrowser(false);
  };

  const handleAudioUpload = (language: "en" | "km") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real implementation, upload to cloud storage
      const audioUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [language === "en" ? "audioUrlEn" : "audioUrlKm"]: audioUrl
      }));
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-black">
            <h2 className="text-xl font-black text-black">
              {sign ? 'Edit Traffic Sign' : 'Add New Traffic Sign'}
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
              {/* Left Column - Image and Status */}
              <div className="space-y-6">
                {/* Image Selection */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Traffic Sign Image
                  </label>
                  <div className="border-2 border-black bg-yellow-50 p-4">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <Image
                          src={formData.imageUrl}
                          alt="Preview"
                          width={300}
                          height={200}
                          className="w-full h-48 object-contain border-2 border-black bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
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

                {/* Sign Type */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Sign Type
                  </label>
                  <BrandSelect
                    value={formData.signType}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, signType: v }))}
                    required
                    fullWidth
                    ariaLabel="Sign Type"
                    className="p-3"
                    options={[
                      { value: "regulatory", label: "Regulatory" },
                      { value: "warning", label: "Warning" },
                      { value: "informational", label: "Informational" },
                      { value: "guide", label: "Guide" },
                    ]}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.category || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value || null }))}
                    className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                    placeholder="e.g., speed, parking, direction"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.isActive}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        checked={!formData.isActive}
                        onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Inactive</span>
                    </label>
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
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={formData.titleEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                        placeholder="e.g., Stop Sign"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Description (English)
                      </label>
                      <textarea
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                        rows={4}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
                        placeholder="Detailed description of the traffic sign..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Audio (English)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload("en")}
                          className="flex-1 text-sm border-2 border-black p-2"
                        />
                        {formData.audioUrlEn && (
                          <button
                            type="button"
                            className="px-3 py-2 bg-blue-400 border-2 border-black flex items-center gap-1 text-sm font-bold"
                          >
                            <Volume2 size={14} />
                            Play
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Khmer Content */}
                {activeTab === "km" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Title (Khmer)
                      </label>
                      <input
                        type="text"
                        value={formData.titleKm}
                        onChange={(e) => setFormData(prev => ({ ...prev, titleKm: e.target.value }))}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                        style={{ fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }}
                        placeholder="ឧ.ទ. សញ្ញាឈប់"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Description (Khmer)
                      </label>
                      <textarea
                        value={formData.descriptionKm}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionKm: e.target.value }))}
                        rows={4}
                        className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] resize-none"
                        style={{ fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }}
                        placeholder="ការពិពណ៌នាលម្អិតអំពីសញ្ញាចរាចរ..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Audio (Khmer)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload("km")}
                          className="flex-1 text-sm border-2 border-black p-2"
                        />
                        {formData.audioUrlKm && (
                          <button
                            type="button"
                            className="px-3 py-2 bg-blue-400 border-2 border-black flex items-center gap-1 text-sm font-bold"
                          >
                            <Volume2 size={14} />
                            Play
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-black">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 border-2 border-black font-bold text-sm hover:bg-gray-300"
              >
                <Eye size={16} />
                Preview
              </button>
              
              <div className="flex items-center gap-3">
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
                  {sign ? 'Update' : 'Create'} Sign
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Cloudinary Media Browser */}
      <CloudinaryMediaBrowser
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={handleImageSelect}
        selectedUrl={formData.imageUrl}
      />
    </>
  );
}
