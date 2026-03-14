"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, Image as ImageIcon, Loader2, Tags } from "lucide-react";

type ViewMode = "gallery" | "folders" | "categories";

interface CloudinaryResource {
  public_id: string;
  url: string;
  folder: string;
  tags: string[];
  width?: number;
  height?: number;
  created_at?: string;
}

interface NamedCount {
  name: string;
  count: number;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  folders: NamedCount[];
  categories: NamedCount[];
  total: number;
}

function getViewMode(rawView: string | null): ViewMode {
  if (rawView === "folders" || rawView === "categories") {
    return rawView;
  }
  return "gallery";
}

export function CloudinaryGallery() {
  const searchParams = useSearchParams();
  const viewMode = getViewMode(searchParams.get("view"));
  const initialFolder = searchParams.get("folder") ?? "";
  const initialCategory = searchParams.get("category") ?? "";

  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [folders, setFolders] = useState<NamedCount[]>([]);
  const [categories, setCategories] = useState<NamedCount[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>(initialFolder);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFolder(initialFolder);
    setSelectedCategory(initialCategory);
  }, [initialFolder, initialCategory]);

  useEffect(() => {
    void fetchImages(selectedFolder, selectedCategory);
  }, [selectedFolder, selectedCategory]);

  async function fetchImages(folder: string, category: string) {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (folder) {
        queryParams.set("folder", folder);
      }
      if (category) {
        queryParams.set("tag", category);
      }
      const query = queryParams.toString();
      const response = await fetch(
        `/api/cloudinary/images${query ? `?${query}` : ""}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = (await response.json()) as CloudinaryResponse;
      setResources(data.resources || []);
      setFolders(data.folders || []);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("[Cloudinary Gallery Error]", err);
    } finally {
      setLoading(false);
    }
  }

  async function copyImageUrl(resource: CloudinaryResource) {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(resource.url);
      setCopiedId(resource.public_id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setError("Clipboard permission blocked. Copy manually from URL.");
    }
  }

  function viewTitle() {
    if (viewMode === "folders") {
      return "Cloudinary Folders";
    }
    if (viewMode === "categories") {
      return "Cloudinary Categories";
    }
    return "Cloudinary Gallery";
  }

  function viewDescription() {
    if (viewMode === "folders") {
      return "Browse image groups by folder path";
    }
    if (viewMode === "categories") {
      return "Browse image groups by Cloudinary tags";
    }
    return "Display and manage images from Cloudinary";
  }

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0_#000] rounded-none">
      <CardHeader>
        <CardTitle className="text-2xl font-black uppercase tracking-tighter">
          {viewTitle()}
        </CardTitle>
        <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1">
          {viewDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedFolder("");
                setSelectedCategory("");
              }}
              className="px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black bg-white text-black shadow-[2px_2px_0_#000]"
            >
              Reset Filters
            </button>
            {selectedFolder && (
              <span className="px-2 py-1 text-xs font-bold border-2 border-black bg-[#eab308] text-black">
                Folder: {selectedFolder}
              </span>
            )}
            {selectedCategory && (
              <span className="px-2 py-1 text-xs font-bold border-2 border-black bg-[#3b82f6] text-white">
                Category: {selectedCategory}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-start">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#a8a8a8]">
              <FolderOpen className="h-3.5 w-3.5" />
              Folders
            </span>
            {folders.slice(0, 10).map((folder) => (
              <button
                key={folder.name}
                onClick={() =>
                  setSelectedFolder((prev) =>
                    prev === folder.name ? "" : folder.name,
                  )
                }
                className={`px-2 py-1 text-xs font-bold border-2 border-black shadow-[2px_2px_0_#000] ${
                  selectedFolder === folder.name
                    ? "bg-[#22c55e] text-black"
                    : "bg-white text-black"
                }`}
              >
                {folder.name} ({folder.count})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-start">
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#a8a8a8]">
              <Tags className="h-3.5 w-3.5" />
              Categories
            </span>
            {categories.slice(0, 14).map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  setSelectedCategory((prev) =>
                    prev === category.name ? "" : category.name,
                  )
                }
                className={`px-2 py-1 text-xs font-bold border-2 border-black shadow-[2px_2px_0_#000] ${
                  selectedCategory === category.name
                    ? "bg-[#3b82f6] text-white"
                    : "bg-white text-black"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
            <p className="text-sm font-medium text-[#a8a8a8]">
              Loading images...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="border-l-4 border-[#ef4444] bg-[#fecaca] p-4">
            <p className="text-sm font-bold text-[#991b1b]">Error: {error}</p>
          </div>
        )}

        {!loading && !error && viewMode === "folders" && (
          <div className="border-2 border-[#a8a8a8] p-4 bg-[#f8fafc]">
            <h4 className="text-sm font-black uppercase tracking-widest text-black mb-3">
              Folder Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className="text-left border-2 border-black bg-white p-2 shadow-[2px_2px_0_#000]"
                >
                  <p className="text-xs font-black truncate">{folder.name}</p>
                  <p className="text-xs text-[#a8a8a8]">
                    {folder.count} images
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && viewMode === "categories" && (
          <div className="border-2 border-[#a8a8a8] p-4 bg-[#f8fafc]">
            <h4 className="text-sm font-black uppercase tracking-widest text-black mb-3">
              Category Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className="text-left border-2 border-black bg-white p-2 shadow-[2px_2px_0_#000]"
                >
                  <p className="text-xs font-black truncate">{category.name}</p>
                  <p className="text-xs text-[#a8a8a8]">
                    {category.count} images
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.public_id}
                className="border-2 border-[#a8a8a8] bg-[#f5f5f0] overflow-hidden group hover:shadow-[4px_4px_0_#000] transition-shadow"
              >
                {/* Image wrapper */}
                <div className="relative w-full aspect-square overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resource.url}
                    alt={resource.public_id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Image metadata */}
                <div className="p-3 space-y-2">
                  <p className="text-xs font-black uppercase truncate text-black">
                    {resource.public_id.split("/").pop()}
                  </p>
                  <p className="text-[11px] font-semibold text-[#0f172a] truncate">
                    {resource.folder}
                  </p>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-xs font-bold rounded-none bg-[#eab308] text-black border border-black"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {resource.width && resource.height && (
                    <p className="text-xs text-[#a8a8a8] font-medium">
                      {resource.width} × {resource.height}px
                    </p>
                  )}

                  {resource.created_at && (
                    <p className="text-xs text-[#a8a8a8] font-medium">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </p>
                  )}

                  <button
                    onClick={() => void copyImageUrl(resource)}
                    className="w-full mt-2 px-2 py-1.5 text-xs font-black uppercase border-2 border-black bg-white text-black shadow-[2px_2px_0_#000] hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] transition-colors"
                  >
                    {copiedId === resource.public_id ? "Copied" : "Copy URL"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <ImageIcon className="w-12 h-12 text-[#a8a8a8]" />
            <p className="text-sm font-bold text-[#a8a8a8]">
              No images found in Cloudinary
            </p>
            <p className="text-xs text-[#a8a8a8]">
              Upload images with tags to display them here
            </p>
          </div>
        )}

        <div className="border-l-4 border-[#3b82f6] bg-[#e7f4fd] p-3 mt-6">
          <p className="text-xs font-bold text-[#1e40af]">
            Total images: {resources.length} • folders: {folders.length} •
            categories: {categories.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
