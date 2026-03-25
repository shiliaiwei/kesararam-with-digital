"use client";

import { useState, useEffect } from "react";
import { Search, X, Image as ImageIcon, Music, Check } from "lucide-react";

interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder: string;
  filename: string;
}

interface CloudinarySelectorModalProps {
  type: "image" | "audio";
  onSelect: (url: string) => void;
  onClose: () => void;
  currentUrl?: string;
}

export function CloudinarySelectorModal({
  type,
  onSelect,
  onClose,
  currentUrl,
}: CloudinarySelectorModalProps) {
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CloudinaryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(currentUrl || "");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    fetchAssets();
  }, [type]);

  useEffect(() => {
    // Filter assets based on search and folder
    let filtered = assets;

    if (selectedFolder !== "all") {
      filtered = filtered.filter((asset) => asset.folder === selectedFolder);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.filename.toLowerCase().includes(query) ||
          asset.public_id.toLowerCase().includes(query)
      );
    }

    setFilteredAssets(filtered);
  }, [search, selectedFolder, assets]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        limit: "500",
        _t: Date.now().toString(),
      });
      const response = await fetch(`/api/staff/media/cloudinary?${params}`, {
        cache: "no-store",
      });
      const data = await response.json();
      const fetchedAssets = data.assets || [];
      setAssets(fetchedAssets);
      setFilteredAssets(fetchedAssets);

      // Extract unique folders
      const uniqueFolders = Array.from(
        new Set(fetchedAssets.map((a: CloudinaryAsset) => a.folder || "root"))
      ).sort() as string[];
      setFolders(uniqueFolders);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
      setFilteredAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  const Icon = type === "image" ? ImageIcon : Music;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white border-4 border-black w-full max-w-6xl max-h-[90vh] flex flex-col"
        style={{ boxShadow: "12px 12px 0 #000" }}
      >
        {/* Header */}
        <div className="border-b-4 border-black p-5 flex items-center justify-between bg-yellow-400">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black border-2 border-black">
              <Icon size={24} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black">
                Select {type === "image" ? "Image" : "Audio"}
              </h2>
              <p className="text-sm font-bold text-black/70">
                Browse and search from Cloudinary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-black hover:text-yellow-400 border-2 border-black transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b-2 border-black bg-white space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder={`Search by filename...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-black font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_#000] transition-all"
              />
            </div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-4 py-2.5 border-2 border-black font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_#000] bg-white"
            >
              <option value="all">All Folders</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-600">
              Showing {filteredAssets.length} of {assets.length} {type}(s)
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-blue-600 hover:text-blue-800 font-bold"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-50">
          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 border-2 border-black animate-pulse"
                />
              ))}
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Icon size={64} className="text-zinc-300 mb-4" />
              <p className="text-lg font-black text-zinc-400 mb-2">
                No {type}s found
              </p>
              {search && (
                <p className="text-sm text-zinc-500">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.public_id}
                  onClick={() => setSelectedUrl(asset.secure_url)}
                  className={`relative aspect-square border-2 transition-all group ${
                    selectedUrl === asset.secure_url
                      ? "border-green-500 ring-4 ring-green-400 shadow-[4px_4px_0_#22c55e]"
                      : "border-black hover:shadow-[4px_4px_0_#000]"
                  }`}
                >
                  {type === "image" ? (
                    <img
                      src={asset.secure_url}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-3">
                      <Music size={40} className="text-purple-600 mb-2" />
                      <p className="text-[10px] font-bold text-center truncate w-full px-1">
                        {asset.filename}
                      </p>
                      <p className="text-[9px] text-zinc-500 uppercase mt-1">
                        {asset.format}
                      </p>
                    </div>
                  )}
                  {selectedUrl === asset.secure_url && (
                    <div className="absolute top-2 right-2 bg-green-500 border-2 border-white shadow-lg p-1.5 rounded-full">
                      <Check size={18} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] p-1.5 truncate font-bold">
                    {asset.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-black p-4 flex gap-3 bg-white">
          <button
            onClick={handleSelect}
            disabled={!selectedUrl}
            className="flex-1 bg-green-400 border-2 border-black px-6 py-3 font-black text-lg hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select {type === "image" ? "Image" : "Audio"}
          </button>
          <button
            onClick={onClose}
            className="px-8 bg-white border-2 border-black py-3 font-black text-lg hover:shadow-[4px_4px_0_#000] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
