"use client";

import { useState } from "react";
import { Image as ImageIcon, Music, Video, Link as LinkIcon, Cloud, X, Check } from "lucide-react";
import { CloudinarySelectorModal } from "./cloudinary-selector-modal";
import { sanitizeSafeUrl } from "@/lib/cloudinary";

interface MediaSelectorProps {
  type: "image" | "audio" | "video";
  label: string;
  value: string;
  source: "url" | "cloudinary";
  onChange: (url: string, source: "url" | "cloudinary") => void;
  placeholder?: string;
  audioLanguage?: "en" | "km"; // For filtering audio files by language
}

export function MediaSelector({
  type,
  label,
  value,
  source,
  onChange,
  placeholder,
  audioLanguage,
}: MediaSelectorProps) {
  const [showBrowser, setShowBrowser] = useState(false);
  const [inputMode, setInputMode] = useState<"url" | "cloudinary">(source || "cloudinary");
  const safeSrc = sanitizeSafeUrl(value);

  const getIcon = () => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "audio":
        return Music;
      case "video":
        return Video;
    }
  };

  const Icon = getIcon();

  const handleCloudinarySelect = (url: string) => {
    onChange(url, "cloudinary");
    setInputMode("cloudinary");
  };

  const clearSelection = () => {
    onChange("", inputMode);
  };

  return (
    <div className="space-y-3">
      <label className="block font-bold text-sm flex items-center gap-2">
        <Icon size={16} />
        {label}
      </label>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setInputMode("url")}
          className={`px-3 py-2 border-2 border-black font-bold transition-all inline-flex items-center justify-center gap-2 text-xs uppercase ${
            inputMode === "url"
              ? "bg-blue-400 text-black shadow-[2px_2px_0_#000]"
              : "bg-white text-black hover:shadow-[2px_2px_0_#000]"
          }`}
        >
          <LinkIcon size={14} />
          URL
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode("cloudinary");
            setShowBrowser(true);
          }}
          className={`px-3 py-2 border-2 border-black font-bold transition-all inline-flex items-center justify-center gap-2 text-xs uppercase ${
            inputMode === "cloudinary"
              ? "bg-purple-400 text-black shadow-[2px_2px_0_#000]"
              : "bg-white text-black hover:shadow-[2px_2px_0_#000]"
          }`}
        >
          <Cloud size={14} />
          Cloudinary
        </button>
      </div>

      {/* URL Input Mode */}
      {inputMode === "url" && (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value, "url")}
            className="w-full px-4 py-2.5 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]"
            placeholder={placeholder || `https://example.com/${type}.${type === "audio" ? "mp3" : "jpg"}`}
          />
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-red-600 hover:text-red-800 font-bold"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Cloudinary Mode */}
      {inputMode === "cloudinary" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowBrowser(true)}
            className="w-full px-4 py-3 border-2 border-black font-black text-sm bg-purple-50 hover:bg-purple-100 hover:shadow-[2px_2px_0_#000] transition-all uppercase"
          >
            {value ? `Change ${type}` : `Browse ${type}s`}
          </button>
          
          {/* Preview */}
          {safeSrc && (
            <div className="border-2 border-black bg-white overflow-hidden">
              {type === "image" && (
                <div className="relative">
                  <div className="aspect-video bg-zinc-100">
                    <img
                      src={safeSrc}
                      alt="Selected"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 border-2 border-white shadow-lg p-1 rounded-full">
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
              {type === "audio" && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500 border-2 border-black">
                      <Music size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase text-zinc-600">
                        Selected Audio
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {safeSrc.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <audio controls className="w-full">
                    <source src={safeSrc} />
                  </audio>
                </div>
              )}
              {type === "video" && (
                <div className="aspect-video bg-zinc-100">
                  <video controls className="w-full h-full">
                    <source src={safeSrc} />
                  </video>
                </div>
              )}
              <div className="p-2 bg-zinc-50 border-t-2 border-black flex items-center justify-between">
                <p className="text-[10px] font-mono text-zinc-600 truncate flex-1">
                  {value}
                </p>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="ml-2 p-1 hover:bg-red-100 border border-red-300 rounded transition-all"
                  title="Clear"
                >
                  <X size={12} className="text-red-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cloudinary Browser Modal */}
      {showBrowser && type !== "video" && (
        <CloudinarySelectorModal
          type={type as "image" | "audio"}
          onSelect={handleCloudinarySelect}
          onClose={() => setShowBrowser(false)}
          currentUrl={value}
          audioLanguage={audioLanguage}
        />
      )}
    </div>
  );
}
