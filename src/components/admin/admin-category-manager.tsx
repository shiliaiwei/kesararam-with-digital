"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Eye, Check, X, Globe, Clock, FileText,
  ChevronDown, Edit, Trash2, Send, RefreshCw, Filter
} from "lucide-react";
import { TopicReviewModal } from "./topic-review-modal";
import { useToast } from "@/components/ui/toast-container";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  status: string;
  sub_group: string | null;
  primary_image_url: string | null;
  question_count: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
  updater_name: string;
  rejection_reason: string | null;
}

interface AdminCategoryManagerProps {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
}

const STATUS_STYLE: Record<string, string> = {
  published: "bg-blue-300 text-blue-900 border border-blue-500",
  pending:   "bg-yellow-300 text-yellow-900 border border-yellow-500",
  approved:  "bg-green-300 text-green-900 border border-green-500",
  draft:     "bg-gray-200 text-gray-800 border border-gray-400",
  rejected:  "bg-red-300 text-red-900 border border-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Public",
  pending:   "Under Review",
  approved:  "Approved",
  draft:     "Draft",
  rejected:  "Rejected",
};

const ALL_STATUSES = ["published", "pending", "approved", "draft", "rejected"];

export function AdminCategoryManager({
  categoryId,
  categoryName,
  categorySlug,
}: AdminCategoryManagerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Derived sub-groups from loaded topics
  const subGroups = [...new Set(topics.map((t) => t.sub_group).filter(Boolean))] as string[];

  // Stats
  const stats = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = topics.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => { fetchTopics(); }, [categoryId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ categoryId: categoryId.toString(), limit: "200" });
      const res = await fetch(`/api/staff/topics?${params}`, { cache: "no-store" });
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/review/topics/${id}/approve`, { method: "POST" });
      if (res.ok) { showToast("Topic approved and published", "success"); fetchTopics(); }
      else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
    } catch { showToast("Failed to approve", "error"); }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      const res = await fetch(`/api/admin/review/topics/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) { showToast("Topic rejected", "success"); fetchTopics(); }
      else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
    } catch { showToast("Failed to reject", "error"); }
  };

  const handleUnpublish = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/review/topics/${id}/unpublish`, { method: "POST" });
      if (res.ok) { showToast("Topic unpublished", "success"); fetchTopics(); }
      else { showToast("Failed to unpublish", "error"); }
    } catch { showToast("Failed", "error"); }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/staff/topics/${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Deleted", "success"); setDeleteConfirm(null); fetchTopics(); }
      else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
    } catch { showToast("Failed to delete", "error"); }
  };

  // Filtered list
  const filtered = topics.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (subGroupFilter && t.sub_group !== subGroupFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.name_en.toLowerCase().includes(q) || t.topic_code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border-2 border-black p-5" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black">{categoryName}</h1>
            <p className="text-zinc-500 text-sm">Admin content control — approve, reject, publish</p>
          </div>
          <button onClick={fetchTopics} className="p-2 border-2 border-black hover:bg-gray-100 transition-all">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${!statusFilter ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
          >
            All ({topics.length})
          </button>
          {ALL_STATUSES.map((s) => stats[s] > 0 && (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${statusFilter === s ? "shadow-[2px_2px_0_#000]" : ""} ${STATUS_STYLE[s]}`}
            >
              {STATUS_LABEL[s]} ({stats[s]})
            </button>
          ))}
        </div>

        {/* Search + sub-group filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
          </div>
          {subGroups.length > 0 && (
            <select
              value={subGroupFilter}
              onChange={(e) => setSubGroupFilter(e.target.value)}
              className="px-3 py-2 border-2 border-black text-sm font-bold bg-white focus:outline-none"
            >
              <option value="">All Types</option>
              {subGroups.map((sg) => <option key={sg} value={sg}>{sg}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
        {loading ? (
          <div className="p-10 text-center text-zinc-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            {topics.length === 0 ? "No content in this category yet" : "No results match your filters"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="px-4 py-3 text-left font-black">Topic</th>
                  <th className="px-4 py-3 text-left font-black">Type</th>
                  <th className="px-4 py-3 text-left font-black">Status</th>
                  <th className="px-4 py-3 text-center font-black">Q&A</th>
                  <th className="px-4 py-3 text-left font-black">By</th>
                  <th className="px-4 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((topic) => (
                  <tr key={topic.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {topic.primary_image_url && (
                          <img src={topic.primary_image_url} alt="" className="w-8 h-8 object-cover border border-gray-200 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold leading-tight">{topic.name_en}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{topic.topic_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{topic.sub_group || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase inline-block w-fit ${STATUS_STYLE[topic.status]}`}>
                          {STATUS_LABEL[topic.status] || topic.status}
                        </span>
                        {topic.status === "rejected" && topic.rejection_reason && (
                          <span className="text-[10px] text-red-600 truncate max-w-[140px]" title={topic.rejection_reason}>
                            {topic.rejection_reason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{topic.question_count}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{topic.creator_name || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => setSelectedTopic(topic as any)}
                          className="p-1.5 border-2 border-black hover:bg-blue-100 transition-all"
                          title="Review"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Approve pending */}
                        {topic.status === "pending" && (
                          <button
                            onClick={() => handleApprove(topic.id)}
                            className="p-1.5 border-2 border-black bg-green-400 hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Approve & Publish"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        {/* Reject pending */}
                        {topic.status === "pending" && (
                          <button
                            onClick={() => {
                              const reason = prompt("Rejection reason:");
                              if (reason) handleReject(topic.id, reason);
                            }}
                            className="p-1.5 border-2 border-black bg-red-400 hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        )}

                        {/* Unpublish */}
                        {topic.status === "published" && (
                          <button
                            onClick={() => handleUnpublish(topic.id)}
                            className="p-1.5 border-2 border-black bg-orange-300 hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Unpublish"
                          >
                            <Globe size={14} />
                          </button>
                        )}

                        {/* Delete draft/rejected */}
                        {(topic.status === "draft" || topic.status === "rejected") && (
                          deleteConfirm === topic.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(topic.id)} className="px-2 py-1 text-[10px] font-black bg-red-500 text-white border-2 border-black">Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[10px] font-black bg-white border-2 border-black">No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(topic.id)}
                              className="p-1.5 border-2 border-black hover:bg-red-100 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )
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

      {/* Review Modal */}
      {selectedTopic && (
        <TopicReviewModal
          topic={selectedTopic as any}
          onClose={() => setSelectedTopic(null)}
          onApprove={() => { handleApprove(selectedTopic.id); setSelectedTopic(null); }}
          onReject={(reason) => { handleReject(selectedTopic.id, reason); setSelectedTopic(null); }}
        />
      )}
    </div>
  );
}
