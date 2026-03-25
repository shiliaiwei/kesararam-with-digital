"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Folder,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Grid3x3,
  List,
  Filter,
  X,
  Download,
} from "lucide-react";

interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  folder: string;
  filename: string;
  resource_type: string;
}

interface FolderItem {
  name: string;
  path: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryRedesigned() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CloudinaryAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceType, setResourceType] = useState<"image" | "video" | "all">("image");
  const [loading, setLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CloudinaryAsset | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Load folders on mount
  useEffect(() => {
    fetchFolders();
  }, []);

  // Load assets when folder or resource type changes
  useEffect(() => {
    fetchAssets();
  }, [selectedFolder, resourceType]);

  // Filter assets based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = assets.filter((asset) =>
        asset.filename.toLowerCase().includes(query) ||
        asset.public_id.toLowerCase().includes(query) ||
        asset.folder.toLowerCase().includes(query)
      );
      setFilteredAssets(filtered);
    } else {
      setFilteredAssets(assets);
    }
  }, [searchQuery, assets]);

  const fetchFolders = async () => {
    setFoldersLoading(true);
    try {
      const response = await fetch(`/api/cloudinary/folders?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setFoldersLoading(false);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: resourceType === "all" ? "image" : resourceType,
        limit: "500",
        // Add timestamp to prevent caching
        _t: Date.now().toString(),
      });

      const response = await fetch(`/api/cloudinary/images?${params}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      const data = await response.json();

      let assets = data.resources || [];

      // Filter by folder if selected
      if (selectedFolder !== "all") {
        assets = assets.filter((asset: CloudinaryAsset) =>
          asset.folder === selectedFolder
        );
      }

      setAssets(assets);
      setFilteredAssets(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
      setFilteredAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-black">Media Library</h1>
              <p className="text-sm text-zinc-600 font-bold">
                Browse and manage all resources from Cloudinary
              </p>
            </div>
            <button
              onClick={fetchAssets}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 border-2 border-black font-black text-xs uppercase hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename, folder..."
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000] transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-black text-xs uppercase transition-all ${
                showFilters
                  ? "bg-black text-yellow-400"
                  : "bg-white text-black hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              <Filter size={14} />
              Filters
            </button>

            <div className="flex gap-1 border-2 border-black bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-black text-yellow-400"
                    : "text-black hover:bg-zinc-100"
                }`}
                title="Grid view"
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-black text-yellow-400"
                    : "text-black hover:bg-zinc-100"
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>

            <span className="flex items-center px-3 py-2 bg-white border-2 border-black font-black text-xs text-black">
              {filteredAssets.length} / {assets.length}
            </span>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-zinc-50 border-2 border-black space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-2 text-black">
                  Resource Type
                </label>
                <div className="flex gap-2">
                  {(["image", "video", "all"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setResourceType(type)}
                      className={`px-3 py-2 border-2 border-black font-bold text-xs uppercase transition-all ${
                        resourceType === type
                          ? "bg-black text-yellow-400"
                          : "bg-white text-black hover:shadow-[2px_2px_0_#000]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-2 text-black">
                  Folder
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedFolder("all")}
                    className={`px-3 py-2 border-2 border-black font-bold text-xs uppercase transition-all ${
                      selectedFolder === "all"
                        ? "bg-black text-yellow-400"
                        : "bg-white text-black hover:shadow-[2px_2px_0_#000]"
                    }`}
                  >
                    All
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder.path}
                      onClick={() => setSelectedFolder(folder.path)}
                      className={`px-3 py-2 border-2 border-black font-bold text-xs uppercase transition-all truncate ${
                        selectedFolder === folder.path
                          ? "bg-black text-yellow-400"
                          : "bg-white text-black hover:shadow-[2px_2px_0_#000]"
                      }`}
                      title={folder.name}
                    >
                      {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-zinc-400" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ImageIcon size={48} className="text-zinc-300" />
            <p className="text-sm font-black uppercase text-zinc-400">
              No resources found
            </p>
            <p className="text-xs text-zinc-500">
              {searchQuery
                ? "Try a different search term"
                : "Upload resources to your Cloudinary account"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.public_id}
                onClick={() => setSelectedAsset(asset)}
                className="bg-white border-2 border-black hover:shadow-[4px_4px_0_#000] transition-all cursor-pointer group"
              >
                {/* Image Preview */}
                <div className="aspect-square bg-zinc-100 border-b-2 border-black relative overflow-hidden">
                  <img
                    src={asset.secure_url}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-2">
                  <p
                    className="text-xs font-black uppercase truncate mb-1"
                    title={asset.filename}
                  >
                    {asset.filename}
                  </p>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-2">
                    <span>
                      {asset.width}×{asset.height}
                    </span>
                    <span>{formatBytes(asset.bytes)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(asset.secure_url);
                    }}
                    className={`w-full flex items-center justify-center gap-1 py-1 text-[10px] font-black uppercase transition-all border-2 border-black ${
                      copiedUrl === asset.secure_url
                        ? "bg-black text-yellow-400"
                        : "bg-yellow-400 text-black hover:shadow-[2px_2px_0_#000]"
                    }`}
                  >
                    {copiedUrl === asset.secure_url ? (
                      <>
                        <Check size={12} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white border-2 border-black overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black bg-black">
                  <th className="px-4 py-3 text-left text-xs font-black uppercase text-yellow-400">
                    Preview
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase text-yellow-400">
                    Filename
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase text-yellow-400">
                    Folder
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase text-yellow-400">
                    Dimensions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase text-yellow-400">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase text-yellow-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => (
                  <tr
                    key={asset.public_id}
                    className={`border-b border-zinc-200 hover:bg-zinc-50 cursor-pointer ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50"
                    }`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <td className="px-4 py-3">
                      <img
                        src={asset.secure_url}
                        alt={asset.filename}
                        className="w-12 h-12 object-cover border border-zinc-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-sm text-black truncate">
                        {asset.filename}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-zinc-600 font-bold">
                        {asset.folder || "root"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-zinc-600">
                        {asset.width}×{asset.height}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-zinc-600">
                        {formatBytes(asset.bytes)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(asset.secure_url);
                          }}
                          className="p-1 hover:bg-black hover:text-yellow-400 transition-all"
                          title="Copy URL"
                        >
                          <Copy size={14} />
                        </button>
                        <a
                          href={asset.secure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:bg-black hover:text-yellow-400 transition-all"
                          title="Open in new tab"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_#000]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-black border-b-2 border-black sticky top-0">
              <h2 className="text-lg font-black uppercase text-yellow-400">
                Asset Details
              </h2>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-yellow-400 hover:text-yellow-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preview */}
              <div className="border-2 border-black aspect-video overflow-hidden bg-zinc-100">
                <img
                  src={selectedAsset.secure_url}
                  alt={selectedAsset.filename}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-black p-3">
                  <p className="text-xs font-black uppercase text-zinc-600 mb-1">
                    Filename
                  </p>
                  <p className="font-bold text-sm break-all">
                    {selectedAsset.filename}
                  </p>
                </div>
                <div className="border-2 border-black p-3">
                  <p className="text-xs font-black uppercase text-zinc-600 mb-1">
                    Folder
                  </p>
                  <p className="font-bold text-sm">
                    {selectedAsset.folder || "root"}
                  </p>
                </div>
                <div className="border-2 border-black p-3">
                  <p className="text-xs font-black uppercase text-zinc-600 mb-1">
                    Dimensions
                  </p>
                  <p className="font-bold text-sm">
                    {selectedAsset.width} × {selectedAsset.height}
                  </p>
                </div>
                <div className="border-2 border-black p-3">
                  <p className="text-xs font-black uppercase text-zinc-600 mb-1">
                    Size
                  </p>
                  <p className="font-bold text-sm">
                    {formatBytes(selectedAsset.bytes)}
                  </p>
                </div>
                <div className="border-2 border-black p-3">
                  <p className="text-xs font-black uppercase text-zinc-600 mb-1">
                    Format
                  </p>
                  <p className="font-bold text-sm uppercase">
                    {selectedAsset.format}
                  </p>
                </div>
                <div className="border-2 border-black p-3">
                  <p className="text-xs font-black uppercase text-zinc-600 mb-1">
                    Uploaded
                  </p>
                  <p className="font-bold text-sm">
                    {new Date(selectedAsset.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* URL */}
              <div className="border-2 border-black">
                <div className="px-4 py-2 bg-black">
                  <span className="font-black text-xs uppercase text-yellow-400">
                    URL
                  </span>
                </div>
                <p className="px-4 py-3 text-xs font-mono break-all text-zinc-600 bg-zinc-50">
                  {selectedAsset.secure_url}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyUrl(selectedAsset.secure_url)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-400 text-black border-2 border-black font-black text-xs uppercase hover:shadow-[2px_2px_0_#000] transition-all"
                >
                  <Copy size={16} />
                  Copy URL
                </button>
                <a
                  href={selectedAsset.secure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black border-2 border-black font-black text-xs uppercase hover:shadow-[2px_2px_0_#000] transition-all"
                >
                  <ExternalLink size={16} />
                  Open
                </a>
                <button
                  onClick={() =>
                    downloadAsset(selectedAsset.secure_url, selectedAsset.filename)
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black border-2 border-black font-black text-xs uppercase hover:shadow-[2px_2px_0_#000] transition-all"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
