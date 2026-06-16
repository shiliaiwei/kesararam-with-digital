"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, Check, X, Search, AlertCircle, ChevronDown, XCircle } from "lucide-react";
import { TopicReviewModal } from "./topic-review-modal";
import { BrandSelect } from "@/components/ui/brand-select";

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
  submitted_at: string;
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

// ── Inline reject dialog ──────────────────────────────────────────────────────
function RejectDialog({
  topic,
  onConfirm,
  onCancel,
}: {
  topic: Topic;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white border-2 border-black w-full max-w-md p-6 space-y-4"
        style={{ boxShadow: "6px 6px 0 #000" }}
      >
        <h2 className="text-xl font-black">Reject Topic</h2>
        <p className="text-sm text-zinc-600">
          <span className="font-bold">{topic.topic_code}</span> — {topic.name_en}
        </p>
        <textarea
          autoFocus
          rows={4}
          placeholder="Provide a clear rejection reason for the staff member..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border-2 border-black p-3 font-medium resize-none focus:outline-none focus:shadow-[2px_2px_0_#000]"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="px-4 py-2 border-2 border-black bg-red-400 font-bold hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AdminReviewQueue() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Topic | null>(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  // Unique creators derived from loaded data
  const creators = Array.from(
    new Map(
      topics
        .filter((t) => t.creator_name)
        .map((t) => [t.creator_name, t.creator_name])
    ).values()
  ).sort();

  // Debounce search input
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 350);
  };

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "pending" });
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (creatorFilter) params.append("creator", creatorFilter);

      const response = await fetch(`/api/admin/review/topics?${params}`);
      const data = await response.json();
      setTopics(data.topics || []);
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, typeFilter, debouncedSearch, creatorFilter]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleApprove = async (id: number) => {
    if (!confirm("Approve this topic?")) return;
    try {
      const res = await fetch(`/api/admin/review/topics/${id}/approve`, { method: "POST" });
      if (res.ok) {
        fetchTopics();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to approve topic");
      }
    } catch {
      alert("Failed to approve topic");
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      const res = await fetch(`/api/admin/review/topics/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        fetchTopics();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reject topic");
      }
    } catch {
      alert("Failed to reject topic");
    }
  };

  // Active filter count (excluding search which has its own clear)
  const activeFilters = [
    categoryFilter && { key: "category", label: CATEGORIES.find((c) => String(c.id) === categoryFilter)?.name ?? categoryFilter, clear: () => setCategoryFilter("") },
    creatorFilter && { key: "creator", label: creatorFilter, clear: () => setCreatorFilter("") },
    typeFilter && { key: "type", label: typeFilter, clear: () => setTypeFilter("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryFilter("");
    setCreatorFilter("");
    setTypeFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border-2 border-black p-6" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">Content Review Queue</h1>
            <p className="text-zinc-600">Review and approve content submissions from staff</p>
          </div>
          <div className="bg-yellow-100 border-2 border-black px-4 py-2 text-center">
            <div className="text-2xl font-black">{stats.pending}</div>
            <div className="text-xs font-bold uppercase">Pending</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { bg: "bg-yellow-50", icon: <AlertCircle size={24} />, iconBg: "bg-yellow-400", value: stats.pending, label: "Pending Review" },
            { bg: "bg-green-50", icon: <Check size={24} />, iconBg: "bg-green-400", value: stats.approved, label: "Approved Today" },
            { bg: "bg-red-50", icon: <X size={24} />, iconBg: "bg-red-400", value: stats.rejected, label: "Rejected Today" },
          ].map(({ bg, icon, iconBg, value, label }) => (
            <div key={label} className={`${bg} border-2 border-black p-4`} style={{ boxShadow: "2px 2px 0 #000" }}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${iconBg} border-2 border-black flex items-center justify-center`}>{icon}</div>
                <div>
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-sm font-bold">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search by name */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
            {search && (
              <button onClick={() => handleSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <XCircle size={16} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
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

          {/* Created By filter */}
          <div className="relative">
            <BrandSelect
              value={creatorFilter}
              onValueChange={setCreatorFilter}
              fullWidth
              ariaLabel="Filter by creator"
              className="px-4 py-2"
              options={[
                { value: "", label: "All Staff" },
                ...creators.map((name) => ({ value: name, label: name })),
              ]}
            />
          </div>

          {/* Type / sub-group filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by type/group..."
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
            {typeFilter && (
              <button onClick={() => setTypeFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Active filter badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs font-bold text-zinc-500 uppercase">Active filters:</span>
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-200 border border-black text-xs font-bold"
              >
                {f.label}
                <button onClick={f.clear} className="hover:text-red-600">
                  <X size={12} />
                </button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs font-bold text-red-600 underline hover:no-underline ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
        {/* Result count bar */}
        {!loading && (
          <div className="px-4 py-2 border-b-2 border-black bg-zinc-50 flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-600">
              {topics.length === 0
                ? "No results"
                : `Showing ${topics.length} topic${topics.length !== 1 ? "s" : ""}`}
            </span>
            {(activeFilters.length > 0 || debouncedSearch) && (
              <button onClick={clearAllFilters} className="text-xs font-bold text-zinc-500 hover:text-black underline">
                Reset filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-black border-t-yellow-400 rounded-full animate-spin mb-3" />
            <p className="text-zinc-600 font-medium">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-bold mb-2">All caught up!</p>
            <p className="text-zinc-600">No pending content matches your filters</p>
            {(activeFilters.length > 0 || debouncedSearch) && (
              <button onClick={clearAllFilters} className="mt-4 px-4 py-2 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="px-4 py-3 text-left font-black text-sm">Code</th>
                  <th className="px-4 py-3 text-left font-black text-sm">Name</th>
                  <th className="px-4 py-3 text-left font-black text-sm">Category</th>
                  <th className="px-4 py-3 text-left font-black text-sm">Type</th>
                  <th className="px-4 py-3 text-center font-black text-sm">Questions</th>
                  <th className="px-4 py-3 text-left font-black text-sm">Created By</th>
                  <th className="px-4 py-3 text-left font-black text-sm">Submitted</th>
                  <th className="px-4 py-3 text-right font-black text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, i) => (
                  <tr
                    key={topic.id}
                    className={`border-b border-gray-200 hover:bg-yellow-50 transition-colors ${i % 2 === 0 ? "" : "bg-zinc-50/40"}`}
                  >
                    <td className="px-4 py-3 font-mono text-sm font-bold">{topic.topic_code}</td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="font-bold leading-tight">{topic.name_en}</div>
                      <div className="text-sm text-zinc-500 leading-tight">{topic.name_km}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 bg-blue-100 border border-blue-300 text-xs font-bold rounded-sm">
                        {topic.category_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">{topic.sub_group || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 border text-xs font-bold ${topic.question_count > 0 ? "bg-green-100 border-green-400" : "bg-red-100 border-red-300"}`}>
                        {topic.question_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setCreatorFilter(topic.creator_name)}
                        className="text-sm font-medium hover:underline hover:text-blue-700 text-left"
                        title="Filter by this staff member"
                      >
                        {topic.creator_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 whitespace-nowrap">
                      {new Date(topic.submitted_at || topic.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTopic(topic)}
                          className="p-2 border-2 border-black bg-blue-400 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Review details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleApprove(topic.id)}
                          className="p-2 border-2 border-black bg-green-400 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Approve"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => setRejectTarget(topic)}
                          className="p-2 border-2 border-black bg-red-400 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Reject"
                        >
                          <X size={15} />
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

      {/* Inline Reject Dialog */}
      {rejectTarget && (
        <RejectDialog
          topic={rejectTarget}
          onConfirm={(reason) => {
            handleReject(rejectTarget.id, reason);
            setRejectTarget(null);
          }}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
