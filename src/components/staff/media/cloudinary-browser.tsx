"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Image as ImageIcon, Music, Video, Check } from "lucide-react";

interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at: string;
  filename?: string;
}

interface CloudinaryBrowserProps {
  type: "image" | "audio" | "video";
  onSelect: (url: string, source: "cloudinary") => void;
  onClose: () => void;
  currentUrl?: string;
}

export function CloudinaryBrowser({
  type,
  onSelect,
  onClose,
  currentUrl,
}: CloudinaryBrowserProps) {
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(currentUrl || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAssets();
  }, [type, debouncedSearch]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        search: debouncedSearch,
      });
      const response = await fetch(`/api/staff/media/cloudinary?${params}`);
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl, "cloudinary");
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "audio":
        return Music;
      case "video":
        return Video;
      default:
        return ImageIcon;
    }
  };

  const Icon = getIcon();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] flex flex-col"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header */}
        <div className="border-b-4 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={24} />
            <h2 className="text-2xl font-black">
              Select {type.charAt(0).toUpperCase() + type.slice(1)} from Cloudinary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 border-2 border-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b-2 border-black">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Search by filename or path (e.g., "stop-sign", "warning", "kwd/")
          </p>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 border-2 border-black animate-pulse"
                />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 mb-2">No assets found</p>
              {search && (
                <p className="text-sm text-zinc-500">
                  Try a different search term or clear the search
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <button
                  key={asset.public_id}
                  onClick={() => setSelectedUrl(asset.secure_url)}
                  className={`relative aspect-square border-2 border-black hover:shadow-[4px_4px_0_#000] transition-all ${
                    selectedUrl === asset.secure_url
                      ? "ring-4 ring-green-400 shadow-[4px_4px_0_#000]"
                      : ""
                  }`}
                >
                  {type === "image" ? (
                    <img
                      src={asset.secure_url}
                      alt={asset.public_id}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Icon size={48} className="text-zinc-400" />
                    </div>
                  )}
                  {selectedUrl === asset.secure_url && (
                    <div className="absolute top-2 right-2 bg-green-400 border-2 border-black p-1">
                      <Check size={16} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-2 truncate">
                    {asset.filename || asset.public_id.split("/").pop()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-black p-4 flex gap-2">
          <button
            onClick={handleSelect}
            disabled={!selectedUrl}
            className="flex-1 bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
