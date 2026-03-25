"use client";

import { useState } from "react";
import { Image as ImageIcon, Music, Video, Link as LinkIcon, Cloud, X } from "lucide-react";
import { CloudinaryBrowser } from "./cloudinary-browser";

interface MediaSelectorProps {
  type: "image" | "audio" | "video";
  label: string;
  value: string;
  source: "url" | "cloudinary";
  onChange: (url: string, source: "url" | "cloudinary") => void;
  placeholder?: string;
}

export function MediaSelector({
  type,
  label,
  value,
  source,
  onChange,
  placeholder,
}: MediaSelectorProps) {
  const [showBrowser, setShowBrowser] = useState(false);
  const [inputMode, setInputMode] = useState<"url" | "cloudinary">(source);

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

  const handleUrlChange = (url: string) => {
    onChange(url, "url");
    setInputMode("url");
  };

  const handleCloudinarySelect = (url: string, src: "cloudinary") => {
    onChange(url, src);
    setInputMode("cloudinary");
  };

  const clearSelection = () => {
    onChange("", inputMode);
  };

  return (
    <div>
      <label className="block font-bold mb-2 flex items-center gap-2">
        <Icon size={18} />
        {label}
      </label>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          type="button"
          onClick={() => setInputMode("url")}
          className={`px-3 py-2 border-2 border-black font-bold transition-all inline-flex items-center justify-center gap-1.5 text-sm ${
            inputMode === "url"
              ? "bg-blue-400 shadow-[2px_2px_0_#000]"
              : "bg-white hover:shadow-[2px_2px_0_#000]"
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
          className={`px-3 py-2 border-2 border-black font-bold transition-all inline-flex items-center justify-center gap-1.5 text-sm ${
            inputMode === "cloudinary"
              ? "bg-purple-400 shadow-[2px_2px_0_#000]"
              : "bg-white hover:shadow-[2px_2px_0_#000]"
          }`}
        >
          <Cloud size={14} />
          Cloudinary
        </button>
      </div>

      {/* URL Input */}
      {inputMode === "url" && (
        <input
          type="url"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
          placeholder={placeholder || `https://example.com/${type}.${type === "audio" ? "mp3" : type === "video" ? "mp4" : "jpg"}`}
        />
      )}

      {/* Cloudinary Selection */}
      {inputMode === "cloudinary" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowBrowser(true)}
            className="w-full px-4 py-2 border-2 border-black font-bold bg-purple-100 hover:shadow-[2px_2px_0_#000] transition-all"
          >
            {value ? "Change Selection" : "Browse Cloudinary"}
          </button>
          
          {/* Preview */}
          {value && (
            <div className="border-2 border-black bg-white">
              {type === "image" && (
                <div className="aspect-video bg-zinc-100 border-b-2 border-black">
                  <img
                    src={value}
                    alt="Selected image"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {type === "audio" && (
                <div className="p-4 bg-zinc-50 border-b-2 border-black">
                  <audio controls className="w-full">
                    <source src={value} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              {type === "video" && (
                <div className="aspect-video bg-zinc-100 border-b-2 border-black">
                  <video controls className="w-full h-full">
                    <source src={value} />
                    Your browser does not support the video element.
                  </video>
                </div>
              )}
              <div className="p-2 flex items-center justify-between">
                <p className="text-xs font-medium truncate flex-1">{value}</p>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="ml-2 p-1 hover:bg-red-100 border border-red-300 rounded"
                  title="Clear selection"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cloudinary Browser Modal */}
      {showBrowser && (
        <CloudinaryBrowser
          type={type}
          onSelect={handleCloudinarySelect}
          onClose={() => setShowBrowser(false)}
          currentUrl={value}
        />
      )}
    </div>
  );
}
