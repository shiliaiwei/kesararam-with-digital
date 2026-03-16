"use client";

import { useState, useEffect } from "react";
import { CloudinaryMediaBrowser } from "@/components/media/cloudinary-media-browser";
import { 
  Images, 
  Upload, 
  Folder, 
  Tag, 
  Search, 
  Grid3X3, 
  List,
  Download,
  Trash2,
  Edit,
  Copy
} from "lucide-react";

export function MediaManagement() {
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    folders: 0,
    tags: 0,
    storage: "0 MB"
  });

  // Load stats from Cloudinary API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/cloudinary/test');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats({
              totalImages: data.stats?.total_count || 0,
              folders: data.stats?.folders_count || 0,
              tags: 0, // We don't have tag stats yet
              storage: "N/A" // We don't have storage stats yet
            });
          } else {
            console.error('Cloudinary API error:', data.details);
          }
        } else {
          console.error('Failed to fetch Cloudinary stats');
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-purple-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Images size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black">Media Library</h1>
            <p className="text-sm text-zinc-600">
              Browse and manage Cloudinary media assets organized by folders
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMediaBrowser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-400 border-2 border-black font-bold text-sm hover:bg-blue-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
          >
            <Images size={16} />
            Browse Media
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100">
            <Upload size={16} />
            Upload New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-400 border-2 border-black flex items-center justify-center">
              <Images size={18} className="text-black" />
            </div>
            <div>
              <p className="text-xl font-black text-black">{stats.totalImages}</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Total Images</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-400 border-2 border-black flex items-center justify-center">
              <Folder size={18} className="text-black" />
            </div>
            <div>
              <p className="text-xl font-black text-black">{stats.folders}</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Folders</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 border-2 border-black flex items-center justify-center">
              <Tag size={18} className="text-black" />
            </div>
            <div>
              <p className="text-xl font-black text-black">{stats.tags}</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Tags</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-400 border-2 border-black flex items-center justify-center">
              <Upload size={18} className="text-black" />
            </div>
            <div>
              <p className="text-xl font-black text-black">{stats.storage}</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Storage Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search media..."
              className="pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000] w-64"
            />
          </div>

          {/* Folder Filter */}
          <select className="px-3 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]">
            <option value="">All Folders</option>
            <option value="traffic-signs">Traffic Signs</option>
            <option value="road-markings">Road Markings</option>
            <option value="vehicles">Vehicles</option>
            <option value="emergency">Emergency</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border-2 border-black">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 border-r-2 border-black ${
                viewMode === "grid" ? "bg-blue-400" : "bg-white hover:bg-gray-100"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list" ? "bg-blue-400" : "bg-white hover:bg-gray-100"
              }`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedImages.length > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-bold text-zinc-600">
                {selectedImages.length} selected
              </span>
              <button className="p-2 bg-green-400 border-2 border-black hover:bg-green-300">
                <Download size={16} />
              </button>
              <button className="p-2 bg-yellow-400 border-2 border-black hover:bg-yellow-300">
                <Edit size={16} />
              </button>
              <button className="p-2 bg-red-400 border-2 border-black hover:bg-red-300">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Folder Quick Access */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
        <h3 className="text-lg font-black text-black mb-3">Quick Access Folders</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: "Traffic Signs", path: "traffic-signs", color: "#eab308", count: 245 },
            { name: "Road Markings", path: "road-markings", color: "#3b82f6", count: 128 },
            { name: "Vehicles", path: "vehicles", color: "#22c55e", count: 89 },
            { name: "Emergency", path: "emergency", color: "#dc2626", count: 34 },
            { name: "General", path: "general", color: "#8b5cf6", count: 156 },
            { name: "Uploads", path: "uploads", color: "#f59e0b", count: 67 }
          ].map((folder) => (
            <button
              key={folder.path}
              onClick={() => setShowMediaBrowser(true)}
              className="flex flex-col items-center gap-2 p-3 border-2 border-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            >
              <div 
                className="w-12 h-12 border-2 border-black flex items-center justify-center"
                style={{ backgroundColor: folder.color }}
              >
                <Folder size={20} className="text-black" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-black">{folder.name}</p>
                <p className="text-xs text-zinc-600">{folder.count} files</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
        <h3 className="text-lg font-black text-black mb-3">Recent Uploads</h3>
        <div className="text-center py-8 text-zinc-500">
          <Upload size={32} className="mx-auto mb-2" />
          <p className="text-sm">No recent uploads</p>
          <button 
            onClick={() => setShowMediaBrowser(true)}
            className="mt-2 px-4 py-2 bg-blue-400 border-2 border-black font-bold text-sm text-black hover:bg-blue-300"
          >
            Browse All Media
          </button>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-yellow-50 border-2 border-black shadow-[4px_4px_0_#000] p-4">
        <h3 className="text-lg font-black text-black mb-3">💡 Media Management Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-bold text-black mb-1">Organize by Folders</h4>
            <p className="text-zinc-700">Keep images organized in folders like traffic-signs, vehicles, etc.</p>
          </div>
          <div>
            <h4 className="font-bold text-black mb-1">Use Descriptive Names</h4>
            <p className="text-zinc-700">Name files clearly: stop-sign-red.jpg instead of img001.jpg</p>
          </div>
          <div>
            <h4 className="font-bold text-black mb-1">Optimize Images</h4>
            <p className="text-zinc-700">Cloudinary automatically optimizes images for web delivery</p>
          </div>
          <div>
            <h4 className="font-bold text-black mb-1">Add Tags</h4>
            <p className="text-zinc-700">Tag images for easier searching and categorization</p>
          </div>
        </div>
      </div>

      {/* Cloudinary Media Browser */}
      {showMediaBrowser && (
        <CloudinaryMediaBrowser
          isOpen={showMediaBrowser}
          onClose={() => setShowMediaBrowser(false)}
          onSelect={(url) => {
            // Handle image selection - could copy to clipboard, etc.
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(url);
              alert("Image URL copied to clipboard!");
            } else {
              // Fallback for browsers without clipboard API
              console.log("Selected image URL:", url);
              alert("Image selected: " + url);
            }
          }}
        />
      )}
    </div>
  );
}