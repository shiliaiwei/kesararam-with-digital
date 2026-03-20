"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  Music,
  Video,
  FileImage,
  ExternalLink,
} from "lucide-react";

interface MediaItem {
  id: number;
  name: string;
  type: string;
  url: string;
  source: string;
  cloudinaryId: string | null;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: string;
}

const MEDIA_TYPES = [
  { value: "image", label: "Images", icon: ImageIcon, color: "bg-blue-400" },
  { value: "audio", label: "Audio", icon: Music, color: "bg-purple-400" },
  { value: "video", label: "Videos", icon: Video, color: "bg-red-400" },
  { value: "logo", label: "Logos", icon: FileImage, color: "bg-green-400" },
  { value: "brand", label: "Brands", icon: FileImage, color: "bg-yellow-400" },
];

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, [typeFilter, searchQuery]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/staff/media?${params}`);
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMediaIcon = (type: string) => {
    const mediaType = MEDIA_TYPES.find((t) => t.value === type);
    return mediaType?.icon || ImageIcon;
  };

  const getMediaColor = (type: string) => {
    const mediaType = MEDIA_TYPES.find((t) => t.value === type);
    return mediaType?.color || "bg-gray-400";
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-400 border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Media
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[4px_4px_0_#000] transition-all"
          />
        </div>
      </div>

      {/* Type Filter Tabs */}
      {showFilters && (
        <div
          className="bg-white border-2 border-black p-4"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("")}
              className={`px-4 py-2 border-2 border-black font-bold transition-all ${
                typeFilter === ""
                  ? "bg-black text-white"
                  : "bg-white hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              All Media
            </button>
            {MEDIA_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value)}
                  className={`px-4 py-2 border-2 border-black font-bold transition-all inline-flex items-center gap-2 ${
                    typeFilter === type.value
                      ? `${type.color} shadow-[2px_2px_0_#000]`
                      : "bg-white hover:shadow-[2px_2px_0_#000]"
                  }`}
                >
                  <Icon size={18} />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border-2 border-black p-4 animate-pulse"
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              <div className="aspect-square bg-gray-200 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div
          className="bg-white border-2 border-black p-12 text-center"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <p className="text-zinc-600 mb-4">No media found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-400 border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Your First Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => {
            const Icon = getMediaIcon(item.type);
            const color = getMediaColor(item.type);

            return (
              <div
                key={item.id}
                className="bg-white border-2 border-black hover:shadow-[6px_6px_0_#000] transition-all group"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                {/* Media Preview */}
                <div className="aspect-square bg-gray-100 border-b-2 border-black relative overflow-hidden">
                  {item.type === "image" || item.type === "logo" || item.type === "brand" ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon size={48} className="text-zinc-400" />
                    </div>
                  )}

                  {/* Source Badge */}
                  <div
                    className={`absolute top-2 right-2 ${
                      item.source === "cloudinary" ? "bg-blue-400" : "bg-gray-400"
                    } border-2 border-black px-2 py-1 text-xs font-bold`}
                  >
                    {item.source === "cloudinary" ? "Cloudinary" : "External"}
                  </div>
                </div>

                {/* Media Info */}
                <div className="p-3">
                  <div className={`${color} border-2 border-black px-2 py-1 mb-2 inline-flex items-center gap-1`}>
                    <Icon size={14} />
                    <span className="text-xs font-bold uppercase">{item.type}</span>
                  </div>

                  <h3 className="font-bold text-sm mb-1 truncate" title={item.name}>
                    {item.name}
                  </h3>

                  <div className="text-xs text-zinc-600 space-y-1">
                    {item.fileSize && (
                      <p>Size: {formatFileSize(item.fileSize)}</p>
                    )}
                    {item.width && item.height && (
                      <p>
                        {item.width} × {item.height}
                      </p>
                    )}
                    {item.duration && (
                      <p>Duration: {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}</p>
                    )}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    View
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <AddMediaModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchMedia();
          }}
        />
      )}
    </div>
  );
}

// Simple Add Media Modal
function AddMediaModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "image",
    url: "",
    source: "external",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/staff/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add media");
      }
    } catch (error) {
      console.error("Error adding media:", error);
      alert("Failed to add media");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white border-4 border-black p-6 max-w-md w-full"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        <h2 className="text-2xl font-black mb-4">Add Media</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="My Image"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            >
              {MEDIA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              required
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-400 border-2 border-black px-4 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Media"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border-2 border-black px-4 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
