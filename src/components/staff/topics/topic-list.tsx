"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, Edit, Trash2, Send, Filter } from "lucide-react";
import { BrandSelect } from "@/components/ui/brand-select";

interface Topic {
  id: number;
  topicCode?: string;
  topic_code?: string;
  categoryId?: number;
  category_id?: number;
  nameEn?: string;
  name_en?: string;
  nameKm?: string;
  name_km?: string;
  category_name?: string;
  categoryName?: string;
  status: string;
  questionCount?: number;
  question_count?: number;
  createdAt?: string;
  created_at?: string;
}

const CATEGORY_SLUGS: Record<number, string> = {
  1: "road-sign",
  2: "road-traffic",
  3: "priority",
  4: "driving",
  5: "technical",
  6: "loading-people-goods",
  7: "general-knowledge",
  8: "emergency",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-200 text-gray-800",
  pending: "bg-yellow-200 text-yellow-800",
  approved: "bg-green-200 text-green-800",
  published: "bg-blue-200 text-blue-800",
  rejected: "bg-red-200 text-red-800",
};

const CATEGORIES = [
  { id: 1, name: "Traffic Signs" },
  { id: 2, name: "Road Traffic Law" },
  { id: 3, name: "Right of Way" },
  { id: 4, name: "Driving Skills" },
  { id: 5, name: "Vehicle Technology" },
  { id: 6, name: "Loading People & Goods" },
  { id: 7, name: "General Knowledge" },
  { id: 8, name: "Emergency" },
];

export function TopicList() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchTopics();
  }, [search, categoryFilter, statusFilter, page]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/staff/topics?${params}`);
      const data = await response.json();

      setTopics(data.topics || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      const response = await fetch(`/api/staff/topics/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTopics();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete topic");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert("Failed to delete topic");
    }
  };

  const handleSubmit = async (id: number) => {
    try {
      const response = await fetch(`/api/staff/topics/${id}/submit`, {
        method: "POST",
      });

      if (response.ok) {
        fetchTopics();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit topic");
      }
    } catch (error) {
      console.error("Error submitting topic:", error);
      alert("Failed to submit topic");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Topics</h1>
          <p className="text-zinc-600">
            Manage topic records for all categories
          </p>
        </div>
        <button
          onClick={() => router.push("/staff/topics/create")}
          className="bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <Plus size={20} />
          Create Topic
        </button>
      </div>

      {/* Filters */}
      <div
        className="bg-white border-2 border-black p-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
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

          {/* Status Filter */}
          <div>
            <BrandSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              fullWidth
              ariaLabel="Filter by status"
              className="px-4 py-2"
              options={[
                { value: "", label: "All Status" },
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "published", label: "Published" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Topics Table */}
      <div
        className="bg-white border-2 border-black overflow-hidden"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-zinc-600">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-600">No topics found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="px-4 py-3 text-left font-black">Code</th>
                  <th className="px-4 py-3 text-left font-black">Name</th>
                  <th className="px-4 py-3 text-left font-black">Category</th>
                  <th className="px-4 py-3 text-left font-black">Questions</th>
                  <th className="px-4 py-3 text-left font-black">Status</th>
                  <th className="px-4 py-3 text-left font-black">Created</th>
                  <th className="px-4 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 font-mono text-sm">
                      {topic.topicCode || topic.topic_code || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{topic.nameEn || topic.name_en || "—"}</div>
                      <div className="text-sm text-zinc-600">
                        {topic.nameKm || topic.name_km || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {CATEGORIES.find(c => c.id === (topic.categoryId || topic.category_id))?.name || topic.categoryName || topic.category_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {topic.questionCount ?? topic.question_count ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-bold uppercase ${
                          STATUS_COLORS[topic.status]
                        }`}
                      >
                        {topic.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(topic.createdAt || topic.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const slug = CATEGORY_SLUGS[topic.categoryId || topic.category_id || 1] || "road-sign";
                            router.push(`/staff/content/${slug}/${topic.id}`);
                          }}
                          className="p-2 border-2 border-black hover:bg-blue-100 transition-all"
                          title="View Questions & Details"
                        >
                          <Eye size={16} />
                        </button>
                        {(topic.status === "draft" ||
                          topic.status === "rejected") && (
                          <>
                            <button
                              onClick={() => {
                                const slug = CATEGORY_SLUGS[topic.categoryId || topic.category_id || 1] || "road-sign";
                                router.push(`/staff/content/${slug}`);
                              }}
                              className="p-2 border-2 border-black hover:bg-yellow-100 transition-all"
                              title="Edit Topic"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleSubmit(topic.id)}
                              className="p-2 border-2 border-black hover:bg-green-100 transition-all"
                              title="Submit for Review"
                            >
                              <Send size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(topic.id)}
                              className="p-2 border-2 border-black hover:bg-red-100 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Showing {topics.length} of {pagination.total} topics
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 border-2 border-black font-bold">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="px-4 py-2 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
