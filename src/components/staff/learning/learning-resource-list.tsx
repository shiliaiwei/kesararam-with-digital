"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2, Eye, BookOpen } from "lucide-react";
import { BrandSelect } from "@/components/ui/brand-select";

interface LearningResource {
  id: number;
  categoryId: number;
  titleEn: string;
  titleKm: string;
  difficulty: string;
  subtopic: string;
  status: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { id: 1, name: "Traffic Signs", icon: "🚦" },
  { id: 2, name: "Road Traffic", icon: "🚗" },
  { id: 3, name: "Priority", icon: "⚠️" },
  { id: 4, name: "Driving", icon: "🚙" },
  { id: 5, name: "Technical", icon: "🔧" },
  { id: 6, name: "Loading People & Goods", icon: "📦" },
  { id: 7, name: "General Knowledge", icon: "📚" },
  { id: 8, name: "Emergency", icon: "🚨" },
];

export function LearningResourceList() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [categoryFilter, searchQuery]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/staff/learning-resources?${params}`);
      const data = await response.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = (categoryId: number) => {
    return CATEGORIES.find((c) => c.id === categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Learning Resources</h2>
        <Link
          href="/staff/learning-resources/create"
          className="bg-green-400 border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <Plus size={20} />
          Create Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <Filter size={20} />
          Filters
        </button>

        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
          />
        </div>
      </div>

      {showFilters && (
        <div
          className="bg-white border-2 border-black p-4"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <label className="block font-bold mb-2">Category</label>
          <BrandSelect
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            fullWidth
            ariaLabel="Filter by category"
            className="px-4 py-2"
            options={[
              { value: "", label: "All Categories" },
              ...CATEGORIES.map((cat) => ({ value: String(cat.id), label: `${cat.icon} ${cat.name}` })),
            ]}
          />
        </div>
      )}

      {/* Resources List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border-2 border-black p-6 animate-pulse"
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div
          className="bg-white border-2 border-black p-12 text-center"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <BookOpen size={48} className="mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-600 mb-4">No learning resources found</p>
          <Link
            href="/staff/learning-resources/create"
            className="bg-green-400 border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create First Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {resources.map((resource) => {
            const category = getCategoryData(resource.categoryId);
            return (
              <div
                key={resource.id}
                className="bg-white border-2 border-black p-6 hover:shadow-[6px_6px_0_#000] transition-all"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{category?.icon}</span>
                      <h3 className="text-xl font-black">{resource.titleEn}</h3>
                    </div>
                    {resource.titleKm && (
                      <p className="text-zinc-600 mb-2">{resource.titleKm}</p>
                    )}
                    <div className="flex gap-4 text-sm text-zinc-600">
                      <span>{resource.questionCount} questions</span>
                      <span>Difficulty: {resource.difficulty}</span>
                      {resource.subtopic && <span>Subtopic: {resource.subtopic}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/staff/learning-resources/${resource.id}`}
                      className="bg-blue-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                      aria-label="View resource"
                      title="View resource"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/staff/learning-resources/${resource.id}/edit`}
                      className="bg-yellow-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                      aria-label="Edit resource"
                      title="Edit resource"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      className="bg-red-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                      aria-label="Delete resource"
                      title="Delete resource"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
