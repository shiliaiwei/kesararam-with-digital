"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Search,
  Tags,
} from "lucide-react";

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

function normalizeSearch(input: string): string {
  return input.trim().toLowerCase();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFolder(initialFolder);
    setSelectedCategory(initialCategory);
    setSearchTerm("");
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

  const filteredResources = useMemo(() => {
    const query = normalizeSearch(searchTerm);
    if (!query) {
      return resources;
    }

    return resources.filter((resource) => {
      const fileName =
        resource.public_id.split("/").pop() ?? resource.public_id;
      const searchable = [
        fileName,
        resource.public_id,
        resource.folder,
        ...(resource.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [resources, searchTerm]);

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
    return "Search, filter, and browse images quickly";
  }

  return (
    <Card className="border-2 border-black rounded-none shadow-[4px_4px_0_#000]">
      <CardHeader>
        <CardTitle className="text-2xl font-black uppercase tracking-tighter text-black">
          {viewTitle()}
        </CardTitle>
        <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1 text-zinc-500">
          {viewDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000] space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="xl:col-span-2 flex flex-col gap-1">
              <span className="text-xs font-black uppercase tracking-widest text-black">
                Search images
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="SEARCH..."
                  className="w-full h-10 border-2 border-black pl-10 pr-3 text-sm font-bold bg-white focus:outline-none focus:ring-0 placeholder:text-black/60 uppercase"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-black uppercase tracking-widest text-black">
                Folder filter
              </span>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="h-10 border-2 border-black bg-white px-2 text-sm font-bold focus:outline-none focus:ring-0 uppercase"
              >
                <option value="">ALL FOLDERS</option>
                {folders.map((folder) => (
                  <option key={folder.name} value={folder.name}>
                    {folder.name} ({folder.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-black uppercase tracking-widest text-black">
                Category filter
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 border-2 border-black bg-white px-2 text-sm font-bold focus:outline-none focus:ring-0 uppercase"
              >
                <option value="">ALL CATEGORIES</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedFolder("");
                setSelectedCategory("");
                setSearchTerm("");
              }}
              className="px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-black bg-white text-black shadow-[2px_2px_0_#000] hover:bg-black hover:text-white transition-colors"
            >
              Reset Filters
            </button>
            {selectedFolder && (
              <span className="px-2 py-1 text-xs font-bold border-2 border-black bg-black text-white uppercase">
                Folder: {selectedFolder}
              </span>
            )}
            {selectedCategory && (
              <span className="px-2 py-1 text-xs font-bold border-2 border-black bg-black text-white uppercase">
                Category: {selectedCategory}
              </span>
            )}
            {searchTerm && (
              <span className="px-2 py-1 text-xs font-bold border-2 border-black bg-black text-white uppercase">
                Search: {searchTerm}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="border-2 border-black bg-white px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-black">
                Showing
              </p>
              <p className="text-lg font-black text-black">
                {filteredResources.length}
              </p>
            </div>
            <div className="border-2 border-black bg-white px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-black">
                Total
              </p>
              <p className="text-lg font-black text-black">
                {resources.length}
              </p>
            </div>
            <div className="border-2 border-black bg-white px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-black">
                Folders
              </p>
              <p className="text-lg font-black text-black">{folders.length}</p>
            </div>
            <div className="border-2 border-black bg-white px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-black">
                Categories
              </p>
              <p className="text-lg font-black text-black">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 border-2 border-dashed border-black">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm font-bold uppercase tracking-widest text-black">
              Loading images...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="border-2 border-black bg-white p-4">
            <p className="text-sm font-black text-black uppercase">Error: {error}</p>
          </div>
        )}

        {!loading && !error && viewMode === "folders" && (
          <div className="border-2 border-black p-4 bg-white">
            <h4 className="text-sm font-black uppercase tracking-widest text-black mb-3">
              Folders
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className="text-left border-2 border-black bg-white p-2 shadow-[2px_2px_0_#000] hover:bg-black hover:text-white transition-colors group"
                >
                  <p className="text-xs font-black truncate uppercase">{folder.name}</p>
                  <p className="text-xs text-black group-hover:text-white font-bold">
                    {folder.count} images
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && viewMode === "categories" && (
          <div className="border-2 border-black p-4 bg-white">
            <h4 className="text-sm font-black uppercase tracking-widest text-black mb-3">
              Categories
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className="text-left border-2 border-black bg-white p-2 shadow-[2px_2px_0_#000] hover:bg-black hover:text-white transition-colors group"
                >
                  <p className="text-xs font-black truncate uppercase">{category.name}</p>
                  <p className="text-xs text-black group-hover:text-white font-bold">
                    {category.count} images
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredResources.map((resource) => (
              <div
                key={resource.public_id}
                className="border-2 border-black bg-white overflow-hidden group hover:shadow-[4px_4px_0_#000] transition-shadow"
              >
                {/* Image wrapper */}
                <div className="relative w-full aspect-square overflow-hidden bg-white border-b-2 border-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resource.url}
                    alt={resource.public_id}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>

                {/* Image metadata */}
                <div className="p-3 space-y-2">
                  <p className="text-xs font-black uppercase truncate text-black" title={resource.public_id}>
                    {resource.public_id.split("/").pop()}
                  </p>
                  <p className="text-[11px] font-bold text-black truncate uppercase">
                    {resource.folder}
                  </p>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[10px] font-black uppercase border border-black bg-black text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-black font-mono mt-2 pt-2 border-t-2 border-black">
                    <span className="font-bold">{resource.width}x{resource.height}</span>
                    <span className="font-bold">{resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  <button
                    onClick={() => void copyImageUrl(resource)}
                    className="w-full mt-2 px-2 py-1.5 text-xs font-black uppercase border-2 border-black bg-white text-black shadow-[2px_2px_0_#000] hover:bg-black hover:text-white transition-colors active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    {copiedId === resource.public_id ? "COPIED" : "COPY URL"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredResources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 border-2 border-dashed border-black">
            <ImageIcon className="w-12 h-12 text-black" />
            <p className="text-sm font-black text-black uppercase tracking-widest">
              No images match your filters
            </p>
            <p className="text-xs font-bold text-black uppercase">
              Try changing search, folder, or category filters
            </p>
          </div>
        )}

        <div className="border-l-4 border-black bg-white p-3 mt-6">
          <p className="text-xs font-black text-black uppercase tracking-widest">
            View: {viewMode} • Showing: {filteredResources.length} of{" "}
            {resources.length} images
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
