"use client";

import { useState, useEffect } from "react";
import { Eye, Check, X, Filter, Search, AlertCircle } from "lucide-react";
import { TopicReviewModal } from "./topic-review-modal";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  category_name: string;
  category_id: number;
  status: string;
  question_count: number;
  created_at: string;
  creator_name: string;
  sub_group: string;
}

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

export function AdminReviewQueue() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchTopics();
  }, [categoryFilter, typeFilter, search]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "pending",
      });

      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/review/topics?${params}`);
      const data = await response.json();

      setTopics(data.topics || []);
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Approve this topic?")) return;

    try {
      const response = await fetch(`/api/admin/review/topics/${id}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        fetchTopics();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve topic");
      }
    } catch (error) {
      console.error("Error approving topic:", error);
      alert("Failed to approve topic");
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      const response = await fetch(`/api/admin/review/topics/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchTopics();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject topic");
      }
    } catch (error) {
      console.error("Error rejecting topic:", error);
      alert("Failed to reject topic");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">Content Review Queue</h1>
            <p className="text-zinc-600">
              Review and approve content submissions from staff
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 border-2 border-black px-4 py-2">
              <div className="text-2xl font-black">{stats.pending}</div>
              <div className="text-xs font-bold uppercase">Pending</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            className="bg-yellow-50 border-2 border-black p-4"
            style={{ boxShadow: "2px 2px 0 #000" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="text-2xl font-black">{stats.pending}</div>
                <div className="text-sm font-bold">Pending Review</div>
              </div>
            </div>
          </div>

          <div
            className="bg-green-50 border-2 border-black p-4"
            style={{ boxShadow: "2px 2px 0 #000" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-400 border-2 border-black flex items-center justify-center">
                <Check size={24} />
              </div>
              <div>
                <div className="text-2xl font-black">{stats.approved}</div>
                <div className="text-sm font-bold">Approved Today</div>
              </div>
            </div>
          </div>

          <div
            className="bg-red-50 border-2 border-black p-4"
            style={{ boxShadow: "2px 2px 0 #000" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-400 border-2 border-black flex items-center justify-center">
                <X size={24} />
              </div>
              <div>
                <div className="text-2xl font-black">{stats.rejected}</div>
                <div className="text-sm font-bold">Rejected Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type/Group Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by type/group..."
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
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
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-bold mb-2">All caught up!</p>
            <p className="text-zinc-600">No pending content to review</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="px-4 py-3 text-left font-black">Code</th>
                  <th className="px-4 py-3 text-left font-black">Name</th>
                  <th className="px-4 py-3 text-left font-black">Category</th>
                  <th className="px-4 py-3 text-left font-black">Type</th>
                  <th className="px-4 py-3 text-left font-black">Questions</th>
                  <th className="px-4 py-3 text-left font-black">Created By</th>
                  <th className="px-4 py-3 text-left font-black">Submitted</th>
                  <th className="px-4 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id} className="border-b border-gray-200 hover:bg-yellow-50">
                    <td className="px-4 py-3 font-mono text-sm">
                      {topic.topic_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{topic.name_en}</div>
                      <div className="text-sm text-zinc-600">
                        {topic.name_km}
                      </div>
                    </td>
                    <td className="px-4 py-3">{topic.category_name}</td>
                    <td className="px-4 py-3 text-sm">{topic.sub_group || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {topic.question_count}
                    </td>
                    <td className="px-4 py-3 text-sm">{topic.creator_name}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(topic.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTopic(topic)}
                          className="p-2 border-2 border-black bg-blue-400 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Review"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleApprove(topic.id)}
                          className="p-2 border-2 border-black bg-green-400 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Rejection reason:");
                            if (reason) handleReject(topic.id, reason);
                          }}
                          className="p-2 border-2 border-black bg-red-400 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedTopic && (
        <TopicReviewModal
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onApprove={() => {
            handleApprove(selectedTopic.id);
            setSelectedTopic(null);
          }}
          onReject={(reason) => {
            handleReject(selectedTopic.id, reason);
            setSelectedTopic(null);
          }}
        />
      )}
    </div>
  );
}
