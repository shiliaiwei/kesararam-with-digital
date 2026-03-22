"use client";

import { useState } from "react";
import { Image as ImageIcon, Music, Video, Link as LinkIcon, Cloud, HardDrive } from "lucide-react";
import { CloudinaryBrowser } from "./cloudinary-browser";
import { GooglePhotosPicker } from "./google-photos-picker";

interface MediaSelectorProps {
  type: "image" | "audio" | "video";
  label: string;
  value: string;
  source: "url" | "cloudinary" | "google-photos";
  onChange: (url: string, source: "url" | "cloudinary" | "google-photos") => void;
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
  const [showGooglePhotos, setShowGooglePhotos] = useState(false);
  const [inputMode, setInputMode] = useState<"url" | "cloudinary" | "google-photos">(source);

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

  const handleGooglePhotosSelect = (mediaId: string, url: string, fileName: string) => {
    onChange(url, "google-photos");
    setInputMode("google-photos");
  };

  return (
    <div>
      <label className="block font-bold mb-2 flex items-center gap-2">
        <Icon size={18} />
        {label}
      </label>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-2 mb-2">
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
        <button
          type="button"
          onClick={() => {
            setInputMode("google-photos");
            setShowGooglePhotos(true);
          }}
          className={`px-3 py-2 border-2 border-black font-bold transition-all inline-flex items-center justify-center gap-1.5 text-sm ${
            inputMode === "google-photos"
              ? "bg-green-400 shadow-[2px_2px_0_#000]"
              : "bg-white hover:shadow-[2px_2px_0_#000]"
          }`}
        >
          <ImageIcon size={14} />
          Photos
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
          {value && (
            <div className="p-2 border-2 border-black bg-gray-50">
              <p className="text-sm font-medium truncate">{value}</p>
            </div>
          )}
        </div>
      )}

      {/* Google Photos Selection */}
      {inputMode === "google-photos" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowGooglePhotos(true)}
            className="w-full px-4 py-2 border-2 border-black font-bold bg-green-100 hover:shadow-[2px_2px_0_#000] transition-all"
          >
            {value ? "Change Selection" : "Browse Google Photos"}
          </button>
          {value && (
            <div className="p-2 border-2 border-black bg-gray-50">
              <p className="text-sm font-medium truncate">{value}</p>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2">
          {type === "image" && (
            <img
              src={value}
              alt="Preview"
              className="max-w-xs border-2 border-black"
              style={{ boxShadow: "4px 4px 0 #000" }}
            />
          )}
          {type === "audio" && (
            <audio controls className="w-full max-w-md mt-2">
              <source src={value} />
            </audio>
          )}
          {type === "video" && (
            <video controls className="max-w-md border-2 border-black mt-2">
              <source src={value} />
            </video>
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

      {/* Google Photos Picker Modal */}
      {showGooglePhotos && (
        <GooglePhotosPicker
          fileType={type === 'image' ? 'image' : type === 'video' ? 'video' : 'all'}
          onSelect={handleGooglePhotosSelect}
          onClose={() => setShowGooglePhotos(false)}
        />
      )}
    </div>
  );
}
