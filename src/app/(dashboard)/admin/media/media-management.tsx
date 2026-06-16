"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Copy, Check, Folder, Images, X, ChevronRight } from "lucide-react";

interface MediaItem {
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

// Single image card
function MediaCard({ item, onCopy, copied }: { item: MediaItem; onCopy: (url: string) => void; copied: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const name = item.public_id.split("/").pop() ?? item.public_id;

  return (
    <div
      className="bg-white group"
      style={{ border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100" style={{ borderBottom: "2px solid #000" }}>
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
        {errored ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-100">
            <Images className="w-8 h-8 text-gray-300" />
            <span className="text-[10px] font-bold text-gray-400 uppercase">Failed</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.secure_url}
            alt={name}
            className="w-full h-full object-cover"
            style={{ display: loaded ? "block" : "none" }}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
      </div>

      {/* Info */}
      <div className="p-2 space-y-1">
        <p className="text-[11px] font-black uppercase truncate" title={name}>{name}</p>
        <div className="flex justify-between text-[10px] font-bold text-gray-500">
          <span>{item.width}×{item.height}</span>
          <span>{formatBytes(item.bytes)}</span>
        </div>
        <button
          onClick={() => onCopy(item.secure_url)}
          className="w-full flex items-center justify-center gap-1 py-1 text-[10px] font-black uppercase transition-all"
          style={{
            background: copied ? "#000" : "#FFEE00",
            color: copied ? "#FFEE00" : "#000",
            border: "2px solid #000",
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "COPIED" : "COPY URL"}
        </button>
      </div>
    </div>
  );
}

export function MediaManagement() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Load folders once
  useEffect(() => {
    fetch("/api/cloudinary/folders")
      .then((r) => r.json())
      .then((d) => {
        const all: FolderItem[] = [{ name: "All Images", path: "root" }, ...(d.folders ?? [])];
        setFolders(all);
      })
      .catch(() => {});
  }, []);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("folder", selectedFolder);
      if (search) params.set("search", search);
      const res = await fetch(`/api/cloudinary/images?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.details ?? data.error ?? "Failed");
      setItems(data.resources ?? []);
    } catch (e: any) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, search]);

  useEffect(() => { loadImages(); }, [loadImages]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Client-side search filter
  const filtered = search
    ? items.filter((i) =>
        i.public_id.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0" style={{ fontFamily: "var(--font-system)" }}>

      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col" style={{ border: "2px solid #000", borderRight: "none", background: "#fff" }}>
        <div className="px-3 py-2" style={{ background: "#000", borderBottom: "2px solid #000" }}>
          <span className="font-black text-[11px] uppercase tracking-widest" style={{ color: "#FFEE00" }}>FOLDERS</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {folders.map((f) => (
            <button
              key={f.path}
              onClick={() => setSelectedFolder(f.path)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-black uppercase transition-colors"
              style={{
                background: selectedFolder === f.path ? "#FFEE00" : "#fff",
                borderBottom: "1px solid #000",
              }}
            >
              <Folder className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{f.name}</span>
              {selectedFolder === f.path && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0" style={{ border: "2px solid #000", background: "#f9f9f9" }}>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#fff", borderBottom: "2px solid #000" }}>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 pr-3 py-1.5 text-[11px] font-bold focus:outline-none"
              style={{ border: "2px solid #000" }}
            />
          </div>
          <button
            onClick={loadImages}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black uppercase"
            style={{ background: "#000", color: "#FFEE00", border: "2px solid #000" }}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            REFRESH
          </button>
          <span className="text-[11px] font-bold text-gray-500 ml-auto">
            {filtered.length} image{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-3 mt-3 px-3 py-2 text-[11px] font-bold" style={{ background: "#fee2e2", border: "2px solid #dc2626", color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Images className="w-10 h-10 text-gray-300" />
              <p className="text-[11px] font-black uppercase text-gray-400">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((item) => (
                <div key={item.public_id} onClick={() => setSelectedItem(item)} className="cursor-pointer">
                  <MediaCard
                    item={item}
                    onCopy={(url) => { copyUrl(url); }}
                    copied={copiedUrl === item.secure_url}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedItem && (
        <div
          className="w-64 flex-shrink-0 flex flex-col"
          style={{ border: "2px solid #000", borderLeft: "none", background: "#fff" }}
        >
          <div className="flex items-center justify-between px-3 py-2" style={{ background: "#000", borderBottom: "2px solid #000" }}>
            <span className="font-black text-[11px] uppercase" style={{ color: "#FFEE00" }}>DETAILS</span>
            <button onClick={() => setSelectedItem(null)} style={{ color: "#FFEE00" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto flex-1">
            {/* Preview */}
            <div style={{ border: "2px solid #000", aspectRatio: "1", overflow: "hidden", background: "#f0f0f0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedItem.secure_url} alt={selectedItem.public_id} className="w-full h-full object-contain" />
            </div>
            {/* Meta */}
            <div className="space-y-1 text-[11px]">
              <div style={{ borderBottom: "1px solid #000", paddingBottom: 4 }}>
                <p className="font-black uppercase text-[10px] text-gray-500">FILENAME</p>
                <p className="font-bold break-all">{selectedItem.public_id.split("/").pop()}</p>
              </div>
              <div style={{ borderBottom: "1px solid #000", paddingBottom: 4 }}>
                <p className="font-black uppercase text-[10px] text-gray-500">FOLDER</p>
                <p className="font-bold">{selectedItem.folder || "root"}</p>
              </div>
              <div style={{ borderBottom: "1px solid #000", paddingBottom: 4 }}>
                <p className="font-black uppercase text-[10px] text-gray-500">DIMENSIONS</p>
                <p className="font-bold">{selectedItem.width} × {selectedItem.height}</p>
              </div>
              <div style={{ borderBottom: "1px solid #000", paddingBottom: 4 }}>
                <p className="font-black uppercase text-[10px] text-gray-500">SIZE</p>
                <p className="font-bold">{formatBytes(selectedItem.bytes)}</p>
              </div>
              <div style={{ borderBottom: "1px solid #000", paddingBottom: 4 }}>
                <p className="font-black uppercase text-[10px] text-gray-500">FORMAT</p>
                <p className="font-bold uppercase">{selectedItem.format}</p>
              </div>
              <div>
                <p className="font-black uppercase text-[10px] text-gray-500">UPLOADED</p>
                <p className="font-bold">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {/* URL */}
            <div style={{ border: "2px solid #000" }}>
              <div className="px-2 py-1" style={{ background: "#000" }}>
                <span className="font-black text-[10px] uppercase" style={{ color: "#FFEE00" }}>URL</span>
              </div>
              <p className="px-2 py-1 text-[9px] font-mono break-all text-gray-600 bg-gray-50">{selectedItem.secure_url}</p>
              <button
                onClick={() => copyUrl(selectedItem.secure_url)}
                className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-black uppercase"
                style={{
                  background: copiedUrl === selectedItem.secure_url ? "#000" : "#FFEE00",
                  color: copiedUrl === selectedItem.secure_url ? "#FFEE00" : "#000",
                  borderTop: "2px solid #000",
                }}
              >
                {copiedUrl === selectedItem.secure_url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedUrl === selectedItem.secure_url ? "COPIED" : "COPY URL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
