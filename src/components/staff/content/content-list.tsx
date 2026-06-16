"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandSelect } from "@/components/ui/brand-select";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface ContentItem {
  id: number;
  categoryId: number;
  type: string;
  status: string;
  titleEn: string;
  titleKm: string;
  questionEn: string;
  difficulty: string | null;
  subtopic: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = [
  { id: 1, name: "Traffic Signs", slug: "road-sign" },
  { id: 2, name: "Road Traffic", slug: "road-traffic" },
  { id: 3, name: "Priority", slug: "priority" },
  { id: 4, name: "Driving", slug: "driving" },
  { id: 5, name: "Technical", slug: "technical" },
  { id: 6, name: "Loading", slug: "loading-people-goods" },
  { id: 7, name: "General Knowledge", slug: "general-knowledge" },
  { id: 8, name: "Emergency", slug: "emergency" },
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-400",
    textColor: "text-yellow-900",
  },
  active: {
    label: "Approved",
    icon: CheckCircle,
    color: "bg-green-400",
    textColor: "text-green-900",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-400",
    textColor: "text-red-900",
  },
  inactive: {
    label: "Inactive",
    icon: AlertCircle,
    color: "bg-gray-400",
    textColor: "text-gray-900",
  },
};

export function ContentList() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [pagination.page, statusFilter, categoryFilter, searchQuery]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);

      console.log("Fetching content with params:", params.toString());
      
      const response = await fetch(`/api/staff/content?${params}`);
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Content data:", data);

      setContent(data.content || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to load content. Please try again.");
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const response = await fetch(`/api/staff/content/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchContent();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete content");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content");
    }
  };

  const getCategoryName = (categoryId: number) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/staff/content/create"
            className="bg-green-400 border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Content
          </Link>

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
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[4px_4px_0_#000] transition-all"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          className="bg-white border-2 border-black p-6 space-y-4"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <h3 className="font-black text-lg">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block font-bold mb-2">Status</label>
              <BrandSelect
                value={statusFilter}
                onValueChange={setStatusFilter}
                fullWidth
                ariaLabel="Filter by status"
                className="px-4 py-2"
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "active", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block font-bold mb-2">Category</label>
              <BrandSelect
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                fullWidth
                ariaLabel="Filter by category"
                className="px-4 py-2"
                options={[
                  { value: "", label: "All Categories" },
                  ...CATEGORIES.map((cat) => ({ value: String(cat.id), label: cat.name })),
                ]}
              />
            </div>
          </div>

          <button
            onClick={() => {
              setStatusFilter("");
              setCategoryFilter("");
              setSearchQuery("");
            }}
            className="text-sm font-bold text-zinc-600 hover:text-black"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
      ) : error ? (
        <div
          className="bg-red-100 border-2 border-red-600 p-6"
          style={{ boxShadow: "4px 4px 0 #dc2626" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-900" size={24} />
            <div>
              <p className="font-bold text-red-900">Error Loading Content</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchContent()}
            className="bg-red-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all"
          >
            Try Again
          </button>
        </div>
      ) : content.length === 0 ? (
        <div
          className="bg-white border-2 border-black p-12 text-center"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <p className="text-zinc-600 mb-4">No content found</p>
          <Link
            href="/staff/content/create"
            className="bg-green-400 border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Your First Content
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((item) => {
            const statusConfig =
              STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={item.id}
                className="bg-white border-2 border-black p-6 hover:shadow-[6px_6px_0_#000] transition-all"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-black">
                        {item.titleEn}
                      </h3>
                      <span
                        className={`${statusConfig.color} ${statusConfig.textColor} border-2 border-black px-3 py-1 text-xs font-bold inline-flex items-center gap-1`}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {item.titleKm && (
                      <p className="text-zinc-600 mb-2">{item.titleKm}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                      <span className="font-bold">
                        Category: {getCategoryName(item.categoryId)}
                      </span>
                      {item.difficulty && (
                        <span>Difficulty: {item.difficulty}</span>
                      )}
                      {item.subtopic && <span>Subtopic: {item.subtopic}</span>}
                      <span>Type: {item.type}</span>
                    </div>

                    <div className="mt-2 text-xs text-zinc-500">
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/staff/content/${item.id}/preview`}
                      className="bg-blue-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </Link>

                    {(item.status === "pending" || item.status === "rejected") && (
                      <>
                        <Link
                          href={`/staff/content/${item.id}/edit`}
                          className="bg-yellow-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>

                        {item.status === "pending" && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2 font-bold">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
