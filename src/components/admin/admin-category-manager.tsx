"use client";

import { useState, useEffect } from "react";
import {
  Search, Eye, Check, X, Globe, Clock, FileText,
  RefreshCw, Edit, Trash2, RotateCcw, Plus, Image as ImageIcon, Music,
  HelpCircle, ChevronDown, ChevronUp, CheckCircle, Circle, Save, Loader2
} from "lucide-react";
import { TopicReviewModal } from "./topic-review-modal";
import { TopicFormModal } from "@/components/staff/content/topic-form-modal";
import { useToast } from "@/components/ui/toast-container";

// ── Inline reject dialog (no browser prompt) ─────────────────────────────────
function RejectDialog({
  topicName,
  onConfirm,
  onCancel,
}: {
  topicName: string;
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
        <p className="text-sm text-zinc-600 font-medium">{topicName}</p>
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

interface Topic {
  id: number;
  topic_code: string; topicCode?: string;
  name_en: string; nameEn?: string;
  name_km: string; nameKm?: string;
  status: string;
  sub_group: string | null; subGroup?: string | null;
  primary_image_url: string | null; primaryImageUrl?: string | null;
  audio_url_en?: string | null; audioUrlEn?: string | null;
  question_count: number; questionCount?: number;
  created_at: string; createdAt?: string;
  updated_at: string; updatedAt?: string;
  creator_name: string; creatorName?: string;
  rejection_reason: string | null; rejectionReason?: string | null;
  description_en?: string; descriptionEn?: string;
  description_km?: string; descriptionKm?: string;
  law_reference?: string | null; lawReference?: string | null;
  audio_url_km?: string | null; audioUrlKm?: string | null;
  audio_source_en?: string; audioSourceEn?: string;
  audio_source_km?: string; audioSourceKm?: string;
  primary_image_source?: string; primaryImageSource?: string;
  category_id?: number; categoryId?: number;
}

interface AdminCategoryManagerProps {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
}

const STATUS_STYLE: Record<string, string> = {
  published: "bg-blue-300 text-blue-900 border border-blue-500",
  pending: "bg-yellow-300 text-yellow-900 border border-yellow-500",
  approved: "bg-green-300 text-green-900 border border-green-500",
  draft: "bg-gray-200 text-gray-800 border border-gray-400",
  rejected: "bg-red-300 text-red-900 border border-red-500",
};
const STATUS_LABEL: Record<string, string> = {
  published: "Public", pending: "Under Review", approved: "Approved",
  draft: "Draft", rejected: "Rejected",
};
const ALL_STATUSES = ["published", "pending", "approved", "draft", "rejected"];

export function AdminCategoryManager({ categoryId, categoryName, categorySlug }: AdminCategoryManagerProps) {
  const { showToast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [requestEditConfirm, setRequestEditConfirm] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Topic | null>(null);

  const subGroups = [...new Set((topics || []).map(t => t?.sub_group || t?.subGroup).filter(Boolean))] as string[];
  const stats = ALL_STATUSES.reduce((acc, s) => { acc[s] = (topics || []).filter(t => (t?.status || "draft") === s).length; return acc; }, {} as Record<string, number>);

  useEffect(() => { fetchTopics(); }, [categoryId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ categoryId: categoryId.toString(), limit: "500" });
      const res = await fetch(`/api/staff/topics?${params}`, { cache: "no-store" });
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApprove = async (id: number) => {
    const res = await fetch(`/api/admin/review/topics/${id}/approve`, { method: "POST" });
    if (res.ok) { showToast("Approved & published", "success"); fetchTopics(); }
    else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
  };

  const handleReject = async (id: number, reason: string) => {
    const res = await fetch(`/api/admin/review/topics/${id}/reject`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) { showToast("Rejected", "success"); fetchTopics(); }
    else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
  };

  const handleUnpublish = async (id: number) => {
    const res = await fetch(`/api/admin/review/topics/${id}/unpublish`, { method: "POST" });
    if (res.ok) { showToast("Unpublished", "success"); fetchTopics(); }
    else showToast("Failed", "error");
  };

  // Admin can delete any topic regardless of status
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Deleted", "success"); setDeleteConfirm(null); fetchTopics(); }
    else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
  };

  // Request edit — sets topic back to draft so staff can edit
  const handleRequestEdit = async (id: number) => {
    const res = await fetch(`/api/admin/topics/${id}/request-edit`, { method: "POST" });
    if (res.ok) { showToast("Sent back to staff for editing", "success"); setRequestEditConfirm(null); fetchTopics(); }
    else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
  };

  const filtered = topics.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (subGroupFilter && (t.sub_group || t.subGroup) !== subGroupFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (t.name_en || t.nameEn || "").toLowerCase().includes(q) ||
        (t.topic_code || t.topicCode || "").toLowerCase().includes(q);
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
            <p className="text-zinc-500 text-sm">Admin full control — approve, reject, edit, delete, request revision</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchTopics} className="p-2 border-2 border-black hover:bg-gray-100"><RefreshCw size={16} /></button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setStatusFilter("")} className={`px-3 py-1.5 border-2 border-black text-xs font-black ${!statusFilter ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}>
            All ({topics.length})
          </button>
          {ALL_STATUSES.map(s => stats[s] > 0 && (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`px-3 py-1.5 border-2 border-black text-xs font-black ${statusFilter === s ? "shadow-[2px_2px_0_#000]" : ""} ${STATUS_STYLE[s]}`}>
              {STATUS_LABEL[s]} ({stats[s]})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input type="text" placeholder="Search topics..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm font-medium focus:outline-none" />
          </div>
          {subGroups.length > 0 && (
            <select value={subGroupFilter} onChange={e => setSubGroupFilter(e.target.value)}
              className="px-3 py-2 border-2 border-black text-sm font-bold bg-white focus:outline-none">
              <option value="">All Types</option>
              {subGroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}
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
                  <th className="px-4 py-3 text-center font-black">Q</th>
                  <th className="px-4 py-3 text-left font-black">By</th>
                  <th className="px-4 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(topic => (
                  <tr key={topic.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(topic.primary_image_url || topic.primaryImageUrl) ? (
                          <img src={topic.primary_image_url || topic.primaryImageUrl!} alt="" className="w-8 h-8 object-cover border border-gray-200 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                            <ImageIcon size={14} className="text-gray-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold leading-tight">{topic.name_en || topic.nameEn}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">#{topic.id} · {topic.topic_code || topic.topicCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">{topic.sub_group || topic.subGroup || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase inline-block w-fit ${STATUS_STYLE[topic.status || "draft"]}`}>
                        {STATUS_LABEL[topic.status || "draft"] || topic.status}
                      </span>
                      {topic.status === "rejected" && (topic.rejection_reason || topic.rejectionReason) && (
                        <p className="text-[10px] text-red-600 truncate max-w-[140px] mt-0.5">
                          {topic.rejection_reason || topic.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-xs">
                      {topic.question_count ?? topic.questionCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{topic.creator_name || topic.creatorName || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">

                        {/* View/Review */}
                        <button onClick={() => setSelectedTopic(topic)}
                          className="p-1.5 border-2 border-black hover:bg-blue-100" title="Review">
                          <Eye size={14} />
                        </button>

                        {/* Manage Questions */}
                        <a href={`/admin/content/questions?topicId=${topic.id}`}
                          className="p-1.5 border-2 border-black hover:bg-purple-100 flex items-center justify-center" title="Manage Questions">
                          <HelpCircle size={14} className="text-purple-600" />
                        </a>

                        {/* Admin Edit — any status */}
                        <button onClick={() => setEditingTopic(topic)}
                          className="p-1.5 border-2 border-black hover:bg-yellow-100" title="Edit">
                          <Edit size={14} />
                        </button>

                        {/* Approve pending */}
                        {topic.status === "pending" && (
                          <button onClick={() => handleApprove(topic.id)}
                            className="p-1.5 border-2 border-black bg-green-400 hover:shadow-[2px_2px_0_#000]" title="Approve & Publish">
                            <Check size={14} />
                          </button>
                        )}

                        {/* Reject pending */}
                        {topic.status === "pending" && (
                          <button onClick={() => setRejectTarget(topic)}
                            className="p-1.5 border-2 border-black bg-red-400 hover:shadow-[2px_2px_0_#000]" title="Reject">
                            <X size={14} />
                          </button>
                        )}

                        {/* Request Edit — send back to staff (approved/published) */}
                        {(topic.status === "approved" || topic.status === "published") && (
                          requestEditConfirm === topic.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleRequestEdit(topic.id)}
                                className="px-2 py-1 text-[10px] font-black bg-orange-400 border-2 border-black">Send</button>
                              <button onClick={() => setRequestEditConfirm(null)}
                                className="px-2 py-1 text-[10px] font-black bg-white border-2 border-black">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setRequestEditConfirm(topic.id)}
                              className="p-1.5 border-2 border-black bg-orange-200 hover:bg-orange-300" title="Request staff to edit">
                              <RotateCcw size={14} />
                            </button>
                          )
                        )}

                        {/* Unpublish */}
                        {topic.status === "published" && (
                          <button onClick={() => handleUnpublish(topic.id)}
                            className="p-1.5 border-2 border-black bg-blue-200 hover:bg-blue-300" title="Unpublish">
                            <Globe size={14} />
                          </button>
                        )}

                        {/* Delete — admin can delete any status */}
                        {deleteConfirm === topic.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(topic.id)}
                              className="px-2 py-1 text-[10px] font-black bg-red-500 text-white border-2 border-black">Yes</button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-[10px] font-black bg-white border-2 border-black">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(topic.id)}
                            className="p-1.5 border-2 border-black hover:bg-red-100" title="Delete">
                            <Trash2 size={14} />
                          </button>
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
          onReject={reason => { handleReject(selectedTopic.id, reason); setSelectedTopic(null); }}
        />
      )}

      {/* Edit Modal — admin can edit any topic */}
      {editingTopic && (
        <TopicFormModal
          categoryId={categoryId}
          categorySlug={categorySlug}
          initialData={editingTopic}
          isAdmin={true}
          onClose={() => setEditingTopic(null)}
          onSuccess={() => { setEditingTopic(null); fetchTopics(); }}
        />
      )}

      {/* Inline Reject Dialog */}
      {rejectTarget && (
        <RejectDialog
          topicName={rejectTarget.name_en || rejectTarget.nameEn || ""}
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
