"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Folder,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
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

export function CloudinaryMediaLibrary() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CloudinaryAsset | null>(null);

  // Load folders on mount
  useEffect(() => {
    fetchFolders();
  }, []);

  // Load assets when folder changes
  useEffect(() => {
    fetchAssets();
  }, [selectedFolder]);

  const fetchFolders = async () => {
    setFoldersLoading(true);
    try {
      const response = await fetch("/api/cloudinary/folders");
      const data = await response.json();
      const allFolders: FolderItem[] = [
        { name: "All Images", path: "root" },
        ...(data.folders || []),
      ];
      setFolders(allFolders);
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
        folder: selectedFolder,
        search: searchQuery,
      });
      const response = await fetch(`/api/cloudinary/images?${params}`);
      const data = await response.json();
      setAssets(data.resources || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredAssets = searchQuery
    ? assets.filter((asset) =>
        asset.public_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : assets;

  return (
    <div className="flex h-[calc(100vh-200px)] gap-0">
      {/* Sidebar - Folders */}
      <div
        className="w-64 flex-shrink-0 flex flex-col bg-white"
        style={{ border: "2px solid #000", borderRight: "none" }}
      >
        <div
          className="px-4 py-3 bg-black border-b-2 border-black flex items-center justify-between"
        >
          <span className="font-black text-xs uppercase tracking-widest text-yellow-400">
            Folders
          </span>
          <button
            onClick={fetchFolders}
            className="p-1 hover:bg-zinc-800 rounded"
            title="Refresh folders"
          >
            <RefreshCw
              size={14}
              className={`text-yellow-400 ${foldersLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {foldersLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={20} className="animate-spin text-zinc-400" />
            </div>
          ) : (
            folders.map((folder) => (
              <button
                key={folder.path}
                onClick={() => setSelectedFolder(folder.path)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left text-xs font-bold uppercase transition-colors border-b border-zinc-200 ${
                  selectedFolder === folder.path
                    ? "bg-yellow-400 text-black"
                    : "bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <Folder size={14} className="flex-shrink-0" />
                <span className="truncate flex-1">{folder.name}</span>
                {selectedFolder === folder.path && (
                  <ChevronRight size={14} className="flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col min-w-0 bg-zinc-50"
        style={{ border: "2px solid #000" }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-4 py-3 bg-white border-b-2 border-black"
        >
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAssets()}
              placeholder="Search images..."
              className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000] transition-all"
            />
          </div>
          <button
            onClick={fetchAssets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-400 border-2 border-black font-black text-xs uppercase hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <span className="text-xs font-bold text-zinc-500">
            {filteredAssets.length} image{filteredAssets.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw size={32} className="animate-spin text-zinc-400" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <ImageIcon size={48} className="text-zinc-300" />
              <p className="text-sm font-black uppercase text-zinc-400">
                No images found
              </p>
              <p className="text-xs text-zinc-500">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload images to your Cloudinary account"}
              </p>
            </div>
          ) : (
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
                      alt={asset.public_id}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p
                      className="text-xs font-black uppercase truncate mb-1"
                      title={asset.public_id.split("/").pop()}
                    >
                      {asset.public_id.split("/").pop()}
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
                          Copy URL
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedAsset && (
        <div
          className="w-80 flex-shrink-0 flex flex-col bg-white"
          style={{ border: "2px solid #000", borderLeft: "none" }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-black border-b-2 border-black">
            <span className="font-black text-xs uppercase text-yellow-400">
              Details
            </span>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-yellow-400 hover:text-yellow-300"
            >
              ×
            </button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Preview */}
            <div className="border-2 border-black aspect-square overflow-hidden bg-zinc-100">
              <img
                src={selectedAsset.secure_url}
                alt={selectedAsset.public_id}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-xs">
              <div className="border-b border-zinc-200 pb-2">
                <p className="font-black uppercase text-[10px] text-zinc-500 mb-1">
                  Filename
                </p>
                <p className="font-bold break-all">
                  {selectedAsset.public_id.split("/").pop()}
                </p>
              </div>
              <div className="border-b border-zinc-200 pb-2">
                <p className="font-black uppercase text-[10px] text-zinc-500 mb-1">
                  Folder
                </p>
                <p className="font-bold">{selectedAsset.folder || "root"}</p>
              </div>
              <div className="border-b border-zinc-200 pb-2">
                <p className="font-black uppercase text-[10px] text-zinc-500 mb-1">
                  Dimensions
                </p>
                <p className="font-bold">
                  {selectedAsset.width} × {selectedAsset.height}
                </p>
              </div>
              <div className="border-b border-zinc-200 pb-2">
                <p className="font-black uppercase text-[10px] text-zinc-500 mb-1">
                  Size
                </p>
                <p className="font-bold">{formatBytes(selectedAsset.bytes)}</p>
              </div>
              <div className="border-b border-zinc-200 pb-2">
                <p className="font-black uppercase text-[10px] text-zinc-500 mb-1">
                  Format
                </p>
                <p className="font-bold uppercase">{selectedAsset.format}</p>
              </div>
              <div>
                <p className="font-black uppercase text-[10px] text-zinc-500 mb-1">
                  Uploaded
                </p>
                <p className="font-bold">
                  {new Date(selectedAsset.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* URL */}
            <div className="border-2 border-black">
              <div className="px-3 py-2 bg-black">
                <span className="font-black text-[10px] uppercase text-yellow-400">
                  URL
                </span>
              </div>
              <p className="px-3 py-2 text-[9px] font-mono break-all text-zinc-600 bg-zinc-50">
                {selectedAsset.secure_url}
              </p>
              <button
                onClick={() => copyUrl(selectedAsset.secure_url)}
                className={`w-full flex items-center justify-center gap-1 py-2 text-xs font-black uppercase border-t-2 border-black transition-all ${
                  copiedUrl === selectedAsset.secure_url
                    ? "bg-black text-yellow-400"
                    : "bg-yellow-400 text-black hover:bg-yellow-300"
                }`}
              >
                {copiedUrl === selectedAsset.secure_url ? (
                  <>
                    <Check size={14} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy URL
                  </>
                )}
              </button>
            </div>

            {/* View Link */}
            <a
              href={selectedAsset.secure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 bg-white border-2 border-black font-black text-xs uppercase hover:shadow-[2px_2px_0_#000] transition-all"
            >
              <ExternalLink size={14} />
              Open in New Tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
