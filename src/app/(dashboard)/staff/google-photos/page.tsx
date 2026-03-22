"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Search, RefreshCw, Video, ChevronRight, Home, Copy, X } from "lucide-react";
import { getDownloadUrl, getThumbnailUrl, isPhoto, isVideo } from "@/lib/google-photos-client";

interface GooglePhotosItem {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  filename: string;
  mediaMetadata?: {
    width?: string;
    height?: string;
    creationTime?: string;
  };
}

interface Album {
  id: string;
  title: string;
  mediaItemsCount?: string;
}

interface AlbumStats {
  total: number;
  images: number;
  videos: number;
  fileTypes: Record<string, number>;
}

export default function AdminGooglePhotosDashboard() {
  const [items, setItems] = useState<GooglePhotosItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([]);
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [previewItem, setPreviewItem] = useState<GooglePhotosItem | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [albumStats, setAlbumStats] = useState<Record<string, AlbumStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
  });

  useEffect(() => {
    if (currentAlbumId) {
      fetchMediaItems(currentAlbumId);
    } else {
      fetchAlbums();
    }
  }, [currentAlbumId]);

  useEffect(() => {
    calculateStats();
  }, [items]);

  useEffect(() => {
    // Fetch stats for all albums when at root level
    if (!currentAlbumId && albums.length > 0) {
      albums.forEach(album => {
        if (!albumStats[album.id] && !loadingStats[album.id]) {
          fetchAlbumStats(album.id);
        }
      });
    }
  }, [albums, currentAlbumId]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media/google-photos/list?type=albums');
      const data = await response.json();
      if (data.success) {
        setAlbums(data.albums);
      } else {
        console.error('API Error:', data);
        alert(`Error: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      alert('Failed to connect to Google Photos API');
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaItems = async (albumId: string) => {
    setLoading(true);
    try {
      const url = `/api/media/google-photos/list?albumId=${albumId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      } else {
        console.error('API Error:', data);
        alert(`Error: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('Error fetching media items:', error);
      alert('Failed to connect to Google Photos API');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumStats = async (albumId: string) => {
    setLoadingStats(prev => ({ ...prev, [albumId]: true }));
    try {
      const response = await fetch(`/api/media/google-photos/album-stats?albumId=${albumId}`);
      const data = await response.json();
      if (data.success) {
        setAlbumStats(prev => ({ ...prev, [albumId]: data.stats }));
      }
    } catch (error) {
      console.error('Error fetching album stats:', error);
    } finally {
      setLoadingStats(prev => ({ ...prev, [albumId]: false }));
    }
  };

  const handleAlbumClick = (album: Album) => {
    setCurrentAlbumId(album.id);
    setBreadcrumbs([{ id: album.id, name: album.title }]);
  };

  const handleBreadcrumbClick = () => {
    setCurrentAlbumId(null);
    setBreadcrumbs([]);
    setItems([]);
  };

  const handleCopyLink = (item: GooglePhotosItem) => {
    const url = getDownloadUrl(item.baseUrl);
    navigator.clipboard.writeText(url);
    setCopySuccess(item.id + 'view');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handlePreview = (item: GooglePhotosItem) => {
    setPreviewItem(item);
  };

  const handleUseFile = (item: GooglePhotosItem) => {
    navigator.clipboard.writeText(getDownloadUrl(item.baseUrl));
    setCopySuccess(item.id + 'use');
    setTimeout(() => setCopySuccess(null), 3000);
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      if (currentAlbumId) {
        fetchMediaItems(currentAlbumId);
      } else {
        fetchAlbums();
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/media/google-photos/search?q=${encodeURIComponent(search)}`);
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: items.length,
      images: items.filter(item => isPhoto(item)).length,
      videos: items.filter(item => isVideo(item)).length,
    };
    setStats(stats);
  };

  const getFilteredItems = () => {
    if (filterType === "all") return items;
    
    return items.filter(item => {
      switch (filterType) {
        case "image": return isPhoto(item);
        case "video": return isVideo(item);
        default: return true;
      }
    });
  };

  const filteredItems = getFilteredItems();

  return (
    <>
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon size={32} className="text-blue-600" />
          <h1 className="text-3xl font-black">Google Photos Resources</h1>
        </div>
        <p className="text-zinc-600">Browse and manage media files by album</p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-2 border-black p-3 mb-6" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBreadcrumbClick}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-black hover:bg-yellow-100 transition-all font-bold text-sm"
          >
            <Home size={14} />
            All Albums
          </button>
          {breadcrumbs.map((crumb) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <ChevronRight size={16} className="text-zinc-400" />
              <span className="px-3 py-1 bg-yellow-100 border border-black font-bold text-sm">
                {crumb.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Album Grid View - Show at root level */}
      {!currentAlbumId && albums.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <ImageIcon className="text-blue-600" size={32} />
            Browse by Album
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {albums.map((album) => {
              const stats = albumStats[album.id];
              const loading = loadingStats[album.id];
              const topFileTypes = stats ? Object.entries(stats.fileTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([ext, count]) => `${ext.toUpperCase()} (${count})`)
                .join(', ') : '';

              return (
                <button
                  key={album.id}
                  onClick={() => handleAlbumClick(album)}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-black p-6 hover:shadow-[6px_6px_0_#000] transition-all text-left group"
                >
                  <ImageIcon size={56} className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-black text-xl mb-2">{album.title}</h3>
                  
                  {loading ? (
                    <div className="text-sm text-zinc-500">Loading stats...</div>
                  ) : stats ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">Total Items:</span>
                        <span className="font-bold">{stats.total}</span>
                      </div>
                      
                      {stats.images > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <ImageIcon size={14} className="text-blue-600" />
                          <span className="text-zinc-600">{stats.images} Photos</span>
                        </div>
                      )}
                      
                      {stats.videos > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Video size={14} className="text-green-600" />
                          <span className="text-zinc-600">{stats.videos} Videos</span>
                        </div>
                      )}
                      
                      {topFileTypes && (
                        <div className="text-xs text-zinc-500 pt-1">
                          {topFileTypes}
                        </div>
                      )}
                    </div>
                  ) : album.mediaItemsCount ? (
                    <p className="text-sm text-zinc-600">{album.mediaItemsCount} items</p>
                  ) : (
                    <p className="text-sm text-zinc-600">Click to browse</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats and Grid View - Show when inside an album */}
      {currentAlbumId && (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-zinc-600 mb-1">Total Items</p>
          <p className="text-2xl font-black">{stats.total}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-400 p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-blue-900 mb-1">Photos</p>
          <p className="text-2xl font-black text-blue-600">{stats.images}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-400 p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-green-900 mb-1">Videos</p>
          <p className="text-2xl font-black text-green-600">{stats.videos}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-2 border-black p-4 mb-6" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-400 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all"
            >
              Search
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => currentAlbumId ? fetchMediaItems(currentAlbumId) : fetchAlbums()}
            disabled={loading}
            className="px-6 py-2 bg-green-400 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { type: "all", label: "All Items", color: "bg-white" },
            { type: "image", label: "Photos", color: "bg-blue-100" },
            { type: "video", label: "Videos", color: "bg-green-100" },
          ].map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 border-2 border-black font-bold transition-all ${
                filterType === type ? `${color} shadow-[2px_2px_0_#000]` : 'bg-white hover:shadow-[2px_2px_0_#000]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-bold text-zinc-600">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="group">
                <div 
                  className="aspect-square bg-gray-100 border-2 border-black overflow-hidden cursor-pointer hover:shadow-[4px_4px_0_#000] transition-all relative"
                  onClick={() => handlePreview(item)}
                >
                  <img 
                    src={getThumbnailUrl(item.baseUrl, 300)} 
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />
                  {isVideo(item) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video size={32} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium truncate flex-1">{item.filename}</p>
                  <button
                    onClick={() => handleCopyLink(item)}
                    className={`p-1.5 border border-black hover:shadow-[2px_2px_0_#000] transition-all ${
                      copySuccess === item.id + 'view' ? 'bg-green-200' : 'bg-yellow-100'
                    }`}
                    title="Copy Link"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-400 p-4">
        <p className="text-sm font-bold text-blue-900 mb-2">📝 How to Use</p>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click on albums to browse their contents</li>
          <li>Use breadcrumb navigation to go back</li>
          <li>Click on any photo/video to preview</li>
          <li>Click <strong>Copy</strong> icon to copy the file link</li>
        </ol>
      </div>
    </div>

    {/* Preview Modal */}
    {previewItem && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
        <div className="bg-white border-4 border-black max-w-5xl w-full max-h-[90vh] overflow-auto" style={{ boxShadow: "8px 8px 0 #000" }} onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="bg-zinc-100 border-b-2 border-black p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {isPhoto(previewItem) ? <ImageIcon size={24} /> : <Video size={24} />}
              <div>
                <h3 className="font-black text-lg">{previewItem.filename}</h3>
                <p className="text-sm text-zinc-600">
                  {previewItem.mediaMetadata?.width} × {previewItem.mediaMetadata?.height}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewItem(null)}
              className="p-2 bg-red-400 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Preview Area */}
            <div className="mb-6 bg-zinc-50 border-2 border-black p-4 min-h-[400px] flex items-center justify-center">
              {isPhoto(previewItem) && (
                <img 
                  src={getDownloadUrl(previewItem.baseUrl, 1200)} 
                  alt={previewItem.filename}
                  className="max-w-full max-h-[600px] object-contain border-2 border-black"
                />
              )}
              
              {isVideo(previewItem) && (
                <div className="w-full">
                  <video 
                    controls 
                    className="max-w-full max-h-[600px] border-2 border-black mx-auto"
                    controlsList="nodownload"
                  >
                    <source src={getDownloadUrl(previewItem.baseUrl)} type={previewItem.mimeType} />
                    Your browser does not support video playback.
                  </video>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleCopyLink(previewItem)}
                className={`px-6 py-3 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 ${
                  copySuccess === previewItem.id + 'view' ? 'bg-green-200' : 'bg-blue-100'
                }`}
              >
                <Copy size={18} />
                {copySuccess === previewItem.id + 'view' ? 'Link Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => handleUseFile(previewItem)}
                className={`px-6 py-3 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 ${
                  copySuccess === previewItem.id + 'use' ? 'bg-green-200' : 'bg-yellow-100'
                }`}
              >
                {copySuccess === previewItem.id + 'use' ? 'Copied!' : 'Use in Form'}
              </button>
            </div>

            {/* Link Display */}
            <div className="mt-4">
              <div className="bg-zinc-50 border-2 border-black p-3">
                <p className="text-xs font-bold text-zinc-600 mb-1">File URL:</p>
                <code className="text-xs break-all">{getDownloadUrl(previewItem.baseUrl)}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
