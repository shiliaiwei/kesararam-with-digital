"use client";

import { useState, useEffect } from "react";
import { Search, Image as ImageIcon, Video, X } from "lucide-react";
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
  };
}

interface Album {
  id: string;
  title: string;
  mediaItemsCount?: string;
}

interface GooglePhotosPickerProps {
  onSelect: (mediaId: string, fileUrl: string, fileName: string) => void;
  onClose: () => void;
  fileType?: 'image' | 'video' | 'all';
}

export function GooglePhotosPicker({ onSelect, onClose, fileType = 'all' }: GooglePhotosPickerProps) {
  const [items, setItems] = useState<GooglePhotosItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<GooglePhotosItem | null>(null);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (currentAlbumId) {
      fetchMediaItems();
    } else {
      fetchAlbums();
    }
  }, [currentAlbumId]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media/google-photos/list?type=albums');
      const data = await response.json();
      if (data.success) {
        setAlbums(data.albums);
      } else {
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaItems = async () => {
    setLoading(true);
    try {
      const url = currentAlbumId 
        ? `/api/media/google-photos/list?albumId=${currentAlbumId}`
        : '/api/media/google-photos/list';
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setItems(filterByType(data.items));
      } else {
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
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

  const handleSearch = async () => {
    if (!search.trim()) {
      if (currentAlbumId) {
        fetchMediaItems();
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
        setItems(filterByType(data.items));
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByType = (items: GooglePhotosItem[]) => {
    if (fileType === 'all') return items;
    
    return items.filter(item => {
      switch (fileType) {
        case 'image':
          return isPhoto(item);
        case 'video':
          return isVideo(item);
        default:
          return true;
      }
    });
  };

  const handleSelectItem = () => {
    if (selectedItem) {
      const url = getDownloadUrl(selectedItem.baseUrl);
      onSelect(selectedItem.id, url, selectedItem.filename);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header */}
        <div className="bg-blue-400 border-b-4 border-black p-4 flex items-center justify-between">
          <h2 className="text-xl font-black">Select from Google Photos</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b-2 border-black">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button
                onClick={handleBreadcrumbClick}
                className="text-sm px-2 py-1 bg-gray-100 border border-black hover:bg-blue-100 font-bold"
              >
                All Albums
              </button>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <span className="text-zinc-400">/</span>
                  <span className="text-sm px-2 py-1 bg-blue-100 border border-black font-bold">
                    {crumb.name}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
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
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
              ))}
            </div>
          ) : !currentAlbumId && albums.length > 0 ? (
            // Show albums
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleAlbumClick(album)}
                  className="p-4 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all text-left bg-blue-50"
                >
                  <ImageIcon size={48} className="text-blue-600 mb-2" />
                  <p className="text-sm font-bold truncate">{album.title}</p>
                  {album.mediaItemsCount && (
                    <p className="text-xs text-zinc-500">{album.mediaItemsCount} items</p>
                  )}
                </button>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 font-bold">No items found</p>
            </div>
          ) : (
            // Show media items
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-2 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all text-left relative ${
                    selectedItem?.id === item.id ? 'bg-yellow-100 shadow-[2px_2px_0_#000]' : 'bg-white'
                  }`}
                >
                  <div className="aspect-square mb-2 bg-gray-100 border-2 border-black flex items-center justify-center overflow-hidden relative">
                    <img 
                      src={getThumbnailUrl(item.baseUrl, 300)} 
                      alt={item.filename} 
                      className="w-full h-full object-cover" 
                    />
                    {isVideo(item) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Video size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold truncate">{item.filename}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-black p-4 bg-gray-50 flex gap-3">
          <button
            onClick={handleSelectItem}
            disabled={!selectedItem}
            className="flex-1 bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select File
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border-2 border-black font-black hover:shadow-[4px_4px_0_#000] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
