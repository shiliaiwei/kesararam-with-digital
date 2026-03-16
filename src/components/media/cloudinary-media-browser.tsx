"use client";

import { useState, useEffect } from "react";
import { X, Search, Folder, Image as ImageIcon, Check } from "lucide-react";
import Image from "next/image";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  folder?: string;
}

interface CloudinaryFolder {
  name: string;
  path: string;
}

interface CloudinaryMediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  selectedUrl?: string;
}

// Mock data - replace with actual Cloudinary API calls
const mockFolders: CloudinaryFolder[] = [
  { name: "traffic-signs", path: "traffic-signs" },
  { name: "road-markings", path: "road-markings" },
  { name: "vehicles", path: "vehicles" },
  { name: "emergency", path: "emergency" },
  { name: "general", path: "general" },
];

const mockImages: CloudinaryResource[] = [
  {
    public_id: "traffic-signs/stop-sign",
    secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    format: "jpg",
    width: 400,
    height: 400,
    bytes: 25600,
    created_at: "2024-03-15T10:00:00Z",
    folder: "traffic-signs"
  },
  {
    public_id: "traffic-signs/yield-sign",
    secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_5_2026-03-15_13-28-33_iyd1g0",
    format: "jpg",
    width: 400,
    height: 400,
    bytes: 28800,
    created_at: "2024-03-15T10:05:00Z",
    folder: "traffic-signs"
  },
  {
    public_id: "traffic-signs/speed-limit",
    secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_4_2026-03-15_13-28-33_dudy3h",
    format: "jpg",
    width: 400,
    height: 400,
    bytes: 22400,
    created_at: "2024-03-15T10:10:00Z",
    folder: "traffic-signs"
  },
  {
    public_id: "road-markings/yellow-line",
    secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_1_2026-03-15_13-28-33_ftfpbi",
    format: "jpg",
    width: 600,
    height: 300,
    bytes: 35200,
    created_at: "2024-03-15T10:15:00Z",
    folder: "road-markings"
  },
  {
    public_id: "vehicles/car-front",
    secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_2_2026-03-15_13-28-33_eashrw",
    format: "jpg",
    width: 500,
    height: 300,
    bytes: 42000,
    created_at: "2024-03-15T10:20:00Z",
    folder: "vehicles"
  }
];

export function CloudinaryMediaBrowser({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedUrl 
}: CloudinaryMediaBrowserProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, selectedFolder]);

  const loadImages = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filteredImages = mockImages;
      
      if (selectedFolder) {
        filteredImages = mockImages.filter(img => img.folder === selectedFolder);
      }
      
      if (searchTerm) {
        filteredImages = filteredImages.filter(img => 
          img.public_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setImages(filteredImages);
      setLoading(false);
    }, 500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <h2 className="text-xl font-black text-black">Select Media from Cloudinary</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 border-black bg-red-400 flex items-center justify-center hover:bg-red-300"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar - Folders */}
          <div className="w-64 border-r-2 border-black bg-gray-50 p-4">
            <h3 className="text-sm font-black text-black mb-3 uppercase">Folders</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center gap-2 p-2 text-left border border-black text-sm font-medium transition-colors ${
                  selectedFolder === null 
                    ? "bg-blue-400 text-black" 
                    : "bg-white hover:bg-blue-50 text-black"
                }`}
              >
                <Folder size={16} />
                All Images
              </button>
              {mockFolders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => setSelectedFolder(folder.path)}
                  className={`w-full flex items-center gap-2 p-2 text-left border border-black text-sm font-medium transition-colors ${
                    selectedFolder === folder.path 
                      ? "bg-blue-400 text-black" 
                      : "bg-white hover:bg-blue-50 text-black"
                  }`}
                >
                  <Folder size={16} />
                  {folder.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b-2 border-black">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]"
                />
              </div>
            </div>

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-zinc-600">Loading images...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.public_id}
                      className={`relative border-2 border-black bg-white overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-[4px_4px_0_#000] hover:-translate-x-1 hover:-translate-y-1 ${
                        selectedUrl === image.secure_url ? "ring-4 ring-blue-400" : ""
                      }`}
                      onClick={() => onSelect(image.secure_url)}
                    >
                      {/* Selection Indicator */}
                      {selectedUrl === image.secure_url && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-400 border-2 border-black flex items-center justify-center z-10">
                          <Check size={12} className="text-black" />
                        </div>
                      )}

                      {/* Image */}
                      <div className="aspect-square bg-gray-100 relative">
                        <Image
                          src={image.secure_url}
                          alt={image.public_id}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-2 border-t-2 border-black">
                        <p className="text-xs font-bold text-black truncate">
                          {image.public_id.split('/').pop()}
                        </p>
                        <div className="flex items-center justify-between text-xs text-zinc-600 mt-1">
                          <span>{image.width}×{image.height}</span>
                          <span>{formatFileSize(image.bytes)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && images.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <ImageIcon size={48} className="text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-black mb-2">No images found</h3>
                    <p className="text-sm text-zinc-600">
                      {searchTerm ? "Try adjusting your search terms" : "No images in this folder"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t-2 border-black">
          <div className="text-sm text-zinc-600">
            {images.length} image{images.length !== 1 ? 's' : ''} 
            {selectedFolder && ` in ${selectedFolder}`}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 border-2 border-black font-bold text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
            {selectedUrl && (
              <button
                onClick={() => {
                  onSelect(selectedUrl);
                  onClose();
                }}
                className="px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000]"
              >
                Select Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}