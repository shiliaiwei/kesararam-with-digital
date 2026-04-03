"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search, RefreshCw, Copy, Check, X, Grid3x3, List,
  Folder, FolderOpen, Image as ImageIcon, Film, FileType,
  ExternalLink, Download, ChevronRight, Upload, Filter,
  SlidersHorizontal, AlertCircle,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaAsset {
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

type ViewMode = "grid" | "list";
type ResourceFilter = "all" | "image" | "video";
type SortKey = "name" | "date" | "size";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const FORMAT_COLORS: Record<string, string> = {
  jpg: "#f97316", jpeg: "#f97316", png: "#3b82f6", gif: "#a855f7",
  webp: "#22c55e", svg: "#06b6d4", mp4: "#ef4444", webm: "#ef4444",
  mov: "#ef4444",
};

// ─── Asset Card (Grid) ────────────────────────────────────────────────────────

function AssetCard({
  asset, selected, onSelect, onCopy, copied,
}: {
  asset: MediaAsset;
  selected: boolean;
  onSelect: () => void;
  onCopy: (e: React.MouseEvent) => void;
  copied: boolean;
}) {
  const isVideo = asset.resource_type === "video";
  const fmtColor = FORMAT_COLORS[asset.format] ?? "#6b7280";

  return (
    <div
      onClick={onSelect}
      className={`group bg-white cursor-pointer transition-all duration-100 ${
        selected
          ? "shadow-[4px_4px_0_#eab308] -translate-x-0.5 -translate-y-0.5"
          : "hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5"
      }`}
      style={{ border: selected ? "2px solid #eab308" : "2px solid #000" }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100" style={{ borderBottom: "2px solid #000" }}>
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <Film className="w-8 h-8 text-zinc-400" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.secure_url} alt={asset.filename} className="w-full h-full object-cover" loading="lazy" />
        )}
        {/* Format badge */}
        <span
          className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-black uppercase text-white"
          style={{ background: fmtColor, border: "1px solid #000" }}
        >
          {asset.format}
        </span>
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-yellow-400 border-2 border-black flex items-center justify-center">
            <Check className="w-3 h-3 text-black" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 space-y-1">
        <p className="text-[11px] font-black uppercase truncate text-black" title={asset.filename}>
          {asset.filename}
        </p>
        <div className="flex justify-between text-[10px] font-bold text-zinc-500">
          <span>{asset.width > 0 ? `${asset.width}×${asset.height}` : "—"}</span>
          <span>{formatBytes(asset.bytes)}</span>
        </div>
        <button
          onClick={onCopy}
          className="w-full flex items-center justify-center gap-1 py-1 text-[10px] font-black uppercase transition-all"
          style={{
            background: copied ? "#000" : "#eab308",
            color: copied ? "#eab308" : "#000",
            border: "2px solid #000",
          }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  asset, onClose, onCopy, copied,
}: {
  asset: MediaAsset;
  onClose: () => void;
  onCopy: (url: string) => void;
  copied: boolean;
}) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-white" style={{ border: "2px solid #000", borderLeft: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black">
        <span className="font-black text-[11px] uppercase tracking-widest text-yellow-400">Details</span>
        <button onClick={onClose} className="text-yellow-400 hover:text-yellow-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Preview */}
        <div className="aspect-square overflow-hidden bg-zinc-100" style={{ border: "2px solid #000" }}>
          {asset.resource_type === "video" ? (
            <video src={asset.secure_url} controls className="w-full h-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.secure_url} alt={asset.filename} className="w-full h-full object-contain" />
          )}
        </div>

        {/* Meta rows */}
        {[
          { label: "Filename", value: asset.filename },
          { label: "Public ID", value: asset.public_id },
          { label: "Folder", value: asset.folder || "root" },
          { label: "Format", value: asset.format.toUpperCase() },
          { label: "Dimensions", value: asset.width > 0 ? `${asset.width} × ${asset.height}` : "—" },
          { label: "Size", value: formatBytes(asset.bytes) },
          { label: "Uploaded", value: formatDate(asset.created_at) },
        ].map(({ label, value }) => (
          <div key={label} className="pb-2" style={{ borderBottom: "1px solid #e5e7eb" }}>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
            <p className="text-[11px] font-bold text-black break-all mt-0.5">{value}</p>
          </div>
        ))}

        {/* URL box */}
        <div style={{ border: "2px solid #000" }}>
          <div className="px-2 py-1 bg-black">
            <span className="text-[9px] font-black uppercase text-yellow-400">Secure URL</span>
          </div>
          <p className="px-2 py-2 text-[9px] font-mono break-all text-zinc-500 bg-zinc-50 leading-relaxed">
            {asset.secure_url}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onCopy(asset.secure_url)}
            className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-black uppercase transition-all"
            style={{
              background: copied ? "#000" : "#eab308",
              color: copied ? "#eab308" : "#000",
              border: "2px solid #000",
            }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <div className="flex gap-2">
            <a
              href={asset.secure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-black uppercase bg-white text-black hover:bg-zinc-50 transition-all"
              style={{ border: "2px solid #000" }}
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
            <a
              href={asset.secure_url}
              download={asset.filename}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-black uppercase bg-white text-black hover:bg-zinc-50 transition-all"
              style={{ border: "2px solid #000" }}
            >
              <Download className="w-3 h-3" />
              Save
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MediaLibrary() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("");
  const [lastUploaded, setLastUploaded] = useState<string | null>(null);

  // ── Fetch folders ──────────────────────────────────────────────────────────
  const fetchFolders = useCallback(async () => {
    setFoldersLoading(true);
    try {
      const res = await fetch(`/api/cloudinary/folders?_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setFolders(data.folders ?? []);
    } catch {
      setFolders([]);
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  // ── Fetch assets ───────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "500", _t: Date.now().toString() });
      if (resourceFilter !== "all") params.set("type", resourceFilter);
      const res = await fetch(`/api/cloudinary/images?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setAssets(data.resources ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load assets");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [resourceFilter]);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);
  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // ── Copy helper ────────────────────────────────────────────────────────────
  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }, []);

  // ── Derived: unique formats ────────────────────────────────────────────────
  const availableFormats = useMemo(() => {
    const fmts = new Set(assets.map((a) => a.format.toLowerCase()));
    return Array.from(fmts).sort();
  }, [assets]);

  // ── Derived: filtered + sorted assets ─────────────────────────────────────
  const displayed = useMemo(() => {
    let list = assets;

    // folder filter
    if (selectedFolder !== "all") {
      list = list.filter((a) => a.folder === selectedFolder);
    }

    // resource type filter
    if (resourceFilter !== "all") {
      list = list.filter((a) => a.resource_type === resourceFilter);
    }

    // format filter
    if (formatFilter !== "all") {
      list = list.filter((a) => a.format.toLowerCase() === formatFilter);
    }

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.filename.toLowerCase().includes(q) ||
          a.public_id.toLowerCase().includes(q) ||
          a.folder.toLowerCase().includes(q) ||
          a.format.toLowerCase().includes(q)
      );
    }

    // sort
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.filename.localeCompare(b.filename);
      if (sortKey === "size") return b.bytes - a.bytes;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [assets, selectedFolder, resourceFilter, formatFilter, search, sortKey]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSize = useMemo(() => displayed.reduce((s, a) => s + a.bytes, 0), [displayed]);

  return (
    <div className="flex h-[calc(100vh-88px)] bg-white overflow-hidden" style={{ border: "2px solid #000" }}>

      {/* ── LEFT SIDEBAR: Folders ─────────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col bg-white" style={{ borderRight: "2px solid #000" }}>
        {/* Sidebar header */}
        <div className="px-3 py-2.5 flex items-center justify-between" style={{ background: "#000", borderBottom: "2px solid #000" }}>
          <span className="font-black text-[11px] uppercase tracking-widest text-yellow-400">Folders</span>
          <button onClick={fetchFolders} className="text-yellow-400 hover:text-yellow-300">
            <RefreshCw className={`w-3 h-3 ${foldersLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* All */}
        <button
          onClick={() => setSelectedFolder("all")}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[11px] font-black uppercase transition-colors"
          style={{
            background: selectedFolder === "all" ? "#eab308" : "#fff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">All Media</span>
          <span className="ml-auto text-[10px] font-bold text-zinc-500">{assets.length}</span>
        </button>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto">
          {foldersLoading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          ) : folders.length === 0 ? (
            <p className="px-3 py-4 text-[10px] font-bold text-zinc-400 uppercase">No folders</p>
          ) : (
            folders.map((f) => {
              const count = assets.filter((a) => a.folder === f.path).length;
              const active = selectedFolder === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFolder(f.path)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-bold uppercase transition-colors"
                  style={{
                    background: active ? "#eab308" : "#fff",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <Folder className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  {active && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                  {!active && <span className="text-[10px] text-zinc-400">{count}</span>}
                </button>
              );
            })
          )}
        </div>

        {/* Upload button */}
        <div className="p-3" style={{ borderTop: "2px solid #000" }}>
          <button
            onClick={() => setShowUpload((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-black uppercase transition-all"
            style={{
              background: showUpload ? "#000" : "#eab308",
              color: showUpload ? "#eab308" : "#000",
              border: "2px solid #000",
            }}
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap" style={{ background: "#fff", borderBottom: "2px solid #000" }}>
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, folder, format..."
              className="w-full pl-8 pr-3 py-1.5 text-[11px] font-bold focus:outline-none"
              style={{ border: "2px solid #000" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Type filter */}
          <div className="flex" style={{ border: "2px solid #000" }}>
            {(["all", "image", "video"] as ResourceFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setResourceFilter(t)}
                className="px-2.5 py-1.5 text-[10px] font-black uppercase transition-colors"
                style={{
                  background: resourceFilter === t ? "#000" : "#fff",
                  color: resourceFilter === t ? "#eab308" : "#000",
                  borderRight: t !== "video" ? "1px solid #000" : undefined,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Format filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="py-1.5 px-2 text-[10px] font-black uppercase focus:outline-none"
            style={{ border: "2px solid #000" }}
          >
            <option value="all">All Formats</option>
            {availableFormats.map((f) => (
              <option key={f} value={f}>{f.toUpperCase()}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="py-1.5 px-2 text-[10px] font-black uppercase focus:outline-none"
            style={{ border: "2px solid #000" }}
          >
            <option value="date">Newest First</option>
            <option value="name">Name A–Z</option>
            <option value="size">Largest First</option>
          </select>

          {/* View toggle */}
          <div className="flex" style={{ border: "2px solid #000" }}>
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 transition-colors"
              style={{ background: viewMode === "grid" ? "#000" : "#fff", color: viewMode === "grid" ? "#eab308" : "#000", borderRight: "1px solid #000" }}
              title="Grid view"
            >
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 transition-colors"
              style={{ background: viewMode === "list" ? "#000" : "#fff", color: viewMode === "list" ? "#eab308" : "#000" }}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAssets}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase transition-all disabled:opacity-50"
            style={{ background: "#000", color: "#eab308", border: "2px solid #000" }}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {/* Stats */}
          <div className="ml-auto flex items-center gap-3 text-[10px] font-black uppercase text-zinc-500">
            <span>{displayed.length} / {assets.length} files</span>
            <span>{formatBytes(totalSize)}</span>
          </div>
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ background: "#fefce8", borderBottom: "2px solid #000" }}>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-black">Folder:</label>
              <input
                type="text"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                placeholder="e.g. traffic-signs"
                className="px-2 py-1 text-[11px] font-bold focus:outline-none w-40"
                style={{ border: "2px solid #000" }}
              />
            </div>
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "ml_default"}
              options={{ folder: uploadFolder || undefined }}
              onSuccess={(result: unknown) => {
                const r = result as { info?: { secure_url?: string } };
                if (r.info?.secure_url) {
                  setLastUploaded(r.info.secure_url);
                  fetchAssets();
                  fetchFolders();
                }
              }}
            >
              {({ open }) => (
                <button
                  onClick={() => open()}
                  className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-black uppercase transition-all"
                  style={{ background: "#000", color: "#eab308", border: "2px solid #000" }}
                >
                  <Upload className="w-3 h-3" />
                  Choose Files
                </button>
              )}
            </CldUploadWidget>
            {lastUploaded && (
              <span className="text-[10px] font-bold text-green-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Uploaded successfully
              </span>
            )}
          </div>
        )}

        {/* Active filters bar */}
        {(search || selectedFolder !== "all" || resourceFilter !== "all" || formatFilter !== "all") && (
          <div className="flex items-center gap-2 px-4 py-1.5 flex-wrap" style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <span className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Active:
            </span>
            {selectedFolder !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase bg-black text-yellow-400" style={{ border: "1px solid #000" }}>
                <Folder className="w-2.5 h-2.5" /> {selectedFolder}
                <button onClick={() => setSelectedFolder("all")} className="ml-1 hover:text-yellow-200"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {resourceFilter !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase bg-black text-yellow-400" style={{ border: "1px solid #000" }}>
                {resourceFilter}
                <button onClick={() => setResourceFilter("all")} className="ml-1 hover:text-yellow-200"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {formatFilter !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase bg-black text-yellow-400" style={{ border: "1px solid #000" }}>
                .{formatFilter}
                <button onClick={() => setFormatFilter("all")} className="ml-1 hover:text-yellow-200"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase bg-black text-yellow-400" style={{ border: "1px solid #000" }}>
                &ldquo;{search}&rdquo;
                <button onClick={() => setSearch("")} className="ml-1 hover:text-yellow-200"><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
            <button
              onClick={() => { setSearch(""); setSelectedFolder("all"); setResourceFilter("all"); setFormatFilter("all"); }}
              className="text-[10px] font-black uppercase text-zinc-400 hover:text-black ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 text-[11px] font-bold" style={{ background: "#fee2e2", border: "2px solid #dc2626", color: "#dc2626" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-zinc-300" />
              <p className="text-[11px] font-black uppercase text-zinc-400">Loading from Cloudinary...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <ImageIcon className="w-12 h-12 text-zinc-200" />
              <p className="text-[11px] font-black uppercase text-zinc-400">No assets found</p>
              <p className="text-[10px] text-zinc-400">Try adjusting your filters or search</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {displayed.map((asset) => (
                <AssetCard
                  key={asset.public_id}
                  asset={asset}
                  selected={selectedAsset?.public_id === asset.public_id}
                  onSelect={() => setSelectedAsset(asset)}
                  onCopy={(e) => { e.stopPropagation(); copyUrl(asset.secure_url); }}
                  copied={copiedUrl === asset.secure_url}
                />
              ))}
            </div>
          ) : (
            /* List view */
            <div className="bg-white overflow-hidden" style={{ border: "2px solid #000" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#000", borderBottom: "2px solid #000" }}>
                    {["Preview", "Filename", "Folder", "Format", "Dimensions", "Size", "Uploaded", "Actions"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-black uppercase text-yellow-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((asset, idx) => (
                    <tr
                      key={asset.public_id}
                      onClick={() => setSelectedAsset(asset)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: selectedAsset?.public_id === asset.public_id ? "#fefce8" : idx % 2 === 0 ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td className="px-3 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.secure_url} alt={asset.filename} className="w-10 h-10 object-cover" style={{ border: "1px solid #e5e7eb" }} />
                      </td>
                      <td className="px-3 py-2 max-w-[160px]">
                        <p className="text-[11px] font-bold text-black truncate">{asset.filename}</p>
                        <p className="text-[9px] text-zinc-400 font-mono truncate">{asset.public_id}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] font-bold text-zinc-600">{asset.folder || "root"}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="px-1.5 py-0.5 text-[9px] font-black uppercase text-white"
                          style={{ background: FORMAT_COLORS[asset.format] ?? "#6b7280", border: "1px solid #000" }}
                        >
                          {asset.format}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] font-bold text-zinc-600">
                          {asset.width > 0 ? `${asset.width}×${asset.height}` : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] font-bold text-zinc-600">{formatBytes(asset.bytes)}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] font-bold text-zinc-600 whitespace-nowrap">{formatDate(asset.created_at)}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyUrl(asset.secure_url); }}
                            className="p-1 transition-colors hover:bg-black hover:text-yellow-400"
                            title="Copy URL"
                          >
                            {copiedUrl === asset.secure_url ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={asset.secure_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 transition-colors hover:bg-black hover:text-yellow-400"
                            title="Open"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
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
      </div>

      {/* ── RIGHT DETAIL PANEL ────────────────────────────────────────────── */}
      {selectedAsset && (
        <DetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onCopy={copyUrl}
          copied={copiedUrl === selectedAsset.secure_url}
        />
      )}
    </div>
  );
}
