"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, Image as ImageIcon, Music, Check, SortAsc, SortDesc, Folder } from "lucide-react";

interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
  folder: string;
  filename: string;
}

interface CloudinarySelectorModalProps {
  type: "image" | "audio";
  onSelect: (url: string) => void;
  onClose: () => void;
  currentUrl?: string;
  audioLanguage?: "en" | "km"; // For filtering audio files by language
}

type SortField = "name" | "date" | "size";
type SortDir = "asc" | "desc";

export function CloudinarySelectorModal({
  type,
  onSelect,
  onClose,
  currentUrl,
  audioLanguage,
}: CloudinarySelectorModalProps) {
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(currentUrl || "");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    fetchAssets();
  }, [type]);

  const fetchAssets = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        type,
        _t: Date.now().toString(),
      });
      const res = await fetch(`/api/staff/media/cloudinary?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setAssets(data.assets || []);
    } catch (err: any) {
      setError(err.message || "Failed to load assets");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Unique folders derived from assets
  const folders = useMemo(() => {
    const set = new Set(assets.map((a) => a.folder || "root"));
    return Array.from(set).sort();
  }, [assets]);

  // Filtered + sorted assets — pure client-side, instant
  const displayed = useMemo(() => {
    let list = assets;

    // Audio language filtering: match by filename containing "ENGLISH" or "KHMER"
    // Accepts all audio formats (wav, mp3, ogg, etc.)
    // Applied only when no manual search is active, so search always works freely
    if (type === "audio" && audioLanguage && !search.trim()) {
      if (audioLanguage === "en") {
        list = list.filter((a) => {
          const name = (a.filename + " " + a.public_id).toUpperCase();
          return name.includes("ENGLISH");
        });
      } else if (audioLanguage === "km") {
        list = list.filter((a) => {
          const name = (a.filename + " " + a.public_id).toUpperCase();
          return name.includes("KHMER");
        });
      }
    }

    // Folder filter
    if (selectedFolder !== "all") {
      list = list.filter((a) => (a.folder || "root") === selectedFolder);
    }

    // Search — match against filename OR full public_id (case-insensitive, no language pre-filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = assets.filter(
        (a) =>
          a.filename.toLowerCase().includes(q) ||
          a.public_id.toLowerCase().includes(q)
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.filename.localeCompare(b.filename);
      } else if (sortField === "date") {
        cmp = (a.created_at || "").localeCompare(b.created_at || "");
      } else if (sortField === "size") {
        cmp = (a.bytes || 0) - (b.bytes || 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [assets, search, selectedFolder, sortField, sortDir, type, audioLanguage]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  const Icon = type === "image" ? ImageIcon : Music;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div
        className="bg-white border-4 border-black w-full max-w-6xl flex flex-col"
        style={{ maxHeight: "92vh", boxShadow: "12px 12px 0 #000" }}
      >
        {/* Header */}
        <div className="border-b-4 border-black p-4 flex items-center justify-between bg-yellow-400 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black">
              <Icon size={22} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-black">
                Select {type === "image" ? "Image" : "Audio"} from Cloudinary
              </h2>
              <p className="text-xs font-bold text-black/60">
                {loading ? "Loading..." : `${assets.length} total assets`}
                {type === "audio" && audioLanguage && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white rounded text-[10px]">
                    {audioLanguage === "en" ? "English files (-ENGLISH)" : "Khmer files (-KHMER)"}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-black hover:text-yellow-400 border-2 border-black transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-3 border-b-2 border-black bg-white shrink-0 space-y-2">
          {/* Search + Folder */}
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search by filename or path..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-8 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Folder filter */}
            <div className="relative">
              <Folder className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="pl-8 pr-3 py-2 border-2 border-black font-bold text-sm focus:outline-none focus:shadow-[2px_2px_0_#000] bg-white appearance-none"
              >
                <option value="all">All Folders</option>
                {folders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort + Count */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">
              {search.trim()
                ? `${displayed.length} of ${assets.length} shown`
                : selectedFolder !== "all"
                  ? `${displayed.length} of ${assets.length} shown`
                  : `${displayed.length} ${type}(s)`}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-zinc-500 mr-1">Sort:</span>
              {(["name", "date", "size"] as SortField[]).map((f) => (
                <button
                  key={f}
                  onClick={() => toggleSort(f)}
                  className={`px-2 py-1 text-xs font-black border-2 border-black transition-all inline-flex items-center gap-1 ${sortField === f
                    ? "bg-black text-white"
                    : "bg-white hover:bg-zinc-100"
                    }`}
                >
                  {f}
                  {sortField === f && (
                    sortDir === "asc" ? <SortAsc size={10} /> : <SortDesc size={10} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3 bg-zinc-50 min-h-0">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-red-600 font-black mb-2">Failed to load assets</p>
              <p className="text-sm text-zinc-500 mb-4">{error}</p>
              <button
                onClick={fetchAssets}
                className="px-4 py-2 bg-yellow-400 border-2 border-black font-black hover:shadow-[2px_2px_0_#000]"
              >
                Retry
              </button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon size={56} className="text-zinc-300 mb-3" />
              <p className="font-black text-zinc-400 mb-1">No results</p>
              <p className="text-sm text-zinc-400">
                {search ? `No ${type}s match "${search}"` : `No ${type}s in this folder`}
              </p>
              {(search || selectedFolder !== "all") && (
                <button
                  onClick={() => { setSearch(""); setSelectedFolder("all"); }}
                  className="mt-3 text-sm font-bold text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {displayed.map((asset) => {
                const isSelected = selectedUrl === asset.secure_url;
                return (
                  <button
                    key={asset.public_id}
                    onClick={() => setSelectedUrl(asset.secure_url)}
                    title={asset.filename}
                    className={`relative aspect-square border-2 transition-all group overflow-hidden ${isSelected
                      ? "border-green-500 ring-4 ring-green-400 shadow-[4px_4px_0_#22c55e]"
                      : "border-black hover:shadow-[4px_4px_0_#000] hover:border-zinc-600"
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
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-2">
                        <Music size={32} className="text-purple-600 mb-1" />
                        <p className="text-[9px] font-bold text-center truncate w-full px-1">
                          {asset.filename}
                        </p>
                        <span className="text-[8px] text-zinc-500 uppercase mt-0.5 bg-white/70 px-1">
                          {asset.format}
                        </span>
                      </div>
                    )}

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-green-500 border-2 border-white shadow-md p-1 rounded-full">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Filename label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[9px] px-1.5 py-1 truncate font-bold">
                      {asset.filename}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-black p-4 flex gap-3 bg-white shrink-0">
          {selectedUrl && (
            <div className="flex-1 flex items-center gap-2 bg-green-50 border-2 border-green-500 px-3 py-2 min-w-0">
              <Check size={16} className="text-green-600 shrink-0" />
              <span className="text-xs font-bold text-green-800 truncate">
                {selectedUrl.split("/").pop()}
              </span>
            </div>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedUrl}
            className="bg-green-400 border-2 border-black px-8 py-3 font-black text-base hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Select {type === "image" ? "Image" : "Audio"}
          </button>
          <button
            onClick={onClose}
            className="bg-white border-2 border-black px-6 py-3 font-black text-base hover:shadow-[4px_4px_0_#000] transition-all shrink-0"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
