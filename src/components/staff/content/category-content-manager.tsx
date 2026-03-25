"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, Eye, Edit, Trash2, Send,
  Globe, Clock, FileText, XCircle, CheckCircle,
  Image as ImageIcon, Music, ChevronDown, RefreshCw
} from "lucide-react";
import { TopicFormModal } from "./topic-form-modal";
import { useToast } from "@/components/ui/toast-container";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  status: string;
  question_count: number;
  created_at: string;
  updated_at: string;
  sub_group: string | null;
  created_by: number;
  updated_by?: number;
  creator_name?: string;
  updater_name?: string;
  primary_image_url?: string | null;
  audio_url_en?: string | null;
  rejection_reason?: string | null;
}

interface CategoryContentManagerProps {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  requiresImage?: boolean;
  requiresAudio?: boolean;
}

const SUB_GROUPS: Record<string, string[]> = {
  "road-sign":            ["Warning", "Prohibitory", "Mandatory", "Informational"],
  "road-traffic":         ["Traffic Rules", "Speed Limits", "Parking", "Overtaking"],
  "priority":             ["Intersections", "Roundabouts", "Pedestrian Crossings"],
  "driving":              ["Basic Maneuvers", "Advanced Techniques", "Defensive Driving"],
  "technical":            ["Engine", "Brakes", "Lights", "Safety Systems"],
  "loading-people-goods": ["Weight Limits", "Passenger Safety", "Cargo Securing"],
  "general-knowledge":    ["Road Safety", "Environmental", "Legal"],
  "emergency":            ["Accidents", "Breakdowns", "First Aid", "Emergency Contacts"],
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  published: <Globe   size={12} className="text-blue-600"   />,
  pending:   <Clock   size={12} className="text-yellow-600" />,
  approved:  <CheckCircle size={12} className="text-green-600" />,
  draft:     <FileText size={12} className="text-gray-500"  />,
  rejected:  <XCircle size={12} className="text-red-600"    />,
};

const STATUS_STYLE: Record<string, string> = {
  published: "bg-blue-100 text-blue-800 border border-blue-300",
  pending:   "bg-yellow-100 text-yellow-800 border border-yellow-300",
  approved:  "bg-green-100 text-green-800 border border-green-300",
  draft:     "bg-gray-100 text-gray-700 border border-gray-300",
  rejected:  "bg-red-100 text-red-800 border border-red-300",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Public",
  pending:   "Under Review",
  approved:  "Approved",
  draft:     "Draft",
  rejected:  "Rejected",
};

const ALL_STATUSES = ["published", "pending", "approved", "draft", "rejected"] as const;

export function CategoryContentManager({
  categoryId,
  categoryName,
  categorySlug,
  requiresImage = false,
  requiresAudio = false,
}: CategoryContentManagerProps) {
  const { showToast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("published"); // default: show public
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => { fetchTopics(); }, [categoryId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        categoryId: categoryId.toString(),
        scope: "all",
        limit: "500",
      });
      const res = await fetch(`/api/staff/topics?${params}`, { cache: "no-store" });
      const data = await res.json();
      // Sort by id ascending (same order as list)
      const sorted = (data.topics || []).sort((a: Topic, b: Topic) => a.id - b.id);
      setTopics(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Stats per status
  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const st of ALL_STATUSES) s[st] = topics.filter(t => t.status === st).length;
    s.all = topics.length;
    return s;
  }, [topics]);

  // Filtered list — client-side for instant response
  const filtered = useMemo(() => {
    return topics.filter(t => {
      if (statusFilter && statusFilter !== "all" && t.status !== statusFilter) return false;
      if (subGroupFilter && t.sub_group !== subGroupFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return t.name_en.toLowerCase().includes(q) ||
               t.topic_code.toLowerCase().includes(q) ||
               (t.name_km || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [topics, statusFilter, subGroupFilter, search]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/staff/topics/${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Deleted", "success"); setDeleteConfirm(null); fetchTopics(); }
      else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
    } catch { showToast("Failed to delete", "error"); }
  };

  const handleSubmit = async (id: number) => {
    try {
      const res = await fetch(`/api/staff/topics/${id}/submit`, { method: "POST" });
      if (res.ok) { showToast("Submitted for review", "success"); fetchTopics(); }
      else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
    } catch { showToast("Failed to submit", "error"); }
  };

  const subGroups = SUB_GROUPS[categorySlug] || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border-2 border-black p-5" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black">{categoryName}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Showing all content — public items are visible to learners
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchTopics}
              className="p-2.5 border-2 border-black hover:bg-gray-100 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-400 border-2 border-black px-4 py-2.5 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Create
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${
              statusFilter === "all" ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            All ({stats.all})
          </button>
          {ALL_STATUSES.map(s => stats[s] > 0 && (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all inline-flex items-center gap-1.5 ${
                statusFilter === s ? "shadow-[2px_2px_0_#000]" : ""
              } ${STATUS_STYLE[s]}`}
            >
              {STATUS_ICON[s]}
              {STATUS_LABEL[s]} ({stats[s]})
            </button>
          ))}
        </div>

        {/* Search + sub-group */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
          </div>
          {subGroups.length > 0 && (
            <select
              value={subGroupFilter}
              onChange={e => setSubGroupFilter(e.target.value)}
              className="px-3 py-2 border-2 border-black text-sm font-bold bg-white focus:outline-none min-w-[130px]"
            >
              <option value="">All Types</option>
              {subGroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Content list */}
      <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 w-2/3" />
                  <div className="h-3 bg-gray-100 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Globe size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-bold text-zinc-500 mb-1">
              {statusFilter === "published" ? "No published content yet" : "No content found"}
            </p>
            <p className="text-xs text-zinc-400 mb-4">
              {statusFilter === "published"
                ? "Create content and submit for admin review to publish"
                : "Try a different filter"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-400 border-2 border-black px-5 py-2.5 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Create Content
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onEdit={() => setEditingTopic(topic)}
                onSubmit={() => handleSubmit(topic.id)}
                onDelete={() => setDeleteConfirm(topic.id)}
                onDeleteConfirm={() => handleDelete(topic.id)}
                onDeleteCancel={() => setDeleteConfirm(null)}
                isDeleteConfirm={deleteConfirm === topic.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreateModal || editingTopic) && (
        <TopicFormModal
          categoryId={categoryId}
          categorySlug={categorySlug}
          requiresImage={requiresImage}
          requiresAudio={requiresAudio}
          initialData={editingTopic}
          onClose={() => { setShowCreateModal(false); setEditingTopic(null); }}
          onSuccess={() => { setShowCreateModal(false); setEditingTopic(null); fetchTopics(); }}
        />
      )}
    </div>
  );
}

// ── Row component ──────────────────────────────────────────────────────────────
function TopicRow({
  topic,
  onEdit,
  onSubmit,
  onDelete,
  onDeleteConfirm,
  onDeleteCancel,
  isDeleteConfirm,
}: {
  topic: Topic;
  onEdit: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  isDeleteConfirm: boolean;
}) {
  const isPublished = topic.status === "published";
  const canEdit = true; // staff can always request edit (goes back to pending)
  const canDelete = topic.status === "draft" || topic.status === "rejected";
  const canSubmit = topic.status === "draft" || topic.status === "rejected";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
      isPublished ? "border-l-4 border-blue-400" : ""
    }`}>
      {/* Thumbnail */}
      <div className="w-11 h-11 shrink-0 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
        {topic.primary_image_url ? (
          <img src={topic.primary_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={18} className="text-gray-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm truncate">{topic.name_en}</span>
          {topic.audio_url_en && <Music size={11} className="text-purple-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] font-mono text-zinc-400">#{topic.id}</span>
          {topic.sub_group && (
            <span className="text-[10px] text-zinc-500">{topic.sub_group}</span>
          )}
          <span className="text-[10px] text-zinc-400">
            {topic.question_count} Q
          </span>
        </div>
        {topic.status === "rejected" && topic.rejection_reason && (
          <p className="text-[10px] text-red-600 mt-0.5 truncate" title={topic.rejection_reason}>
            {topic.rejection_reason}
          </p>
        )}
      </div>

      {/* Status badge */}
      <span className={`px-2 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1 shrink-0 ${STATUS_STYLE[topic.status]}`}>
        {STATUS_ICON[topic.status]}
        {STATUS_LABEL[topic.status]}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Edit — always available, re-submits for review */}
        <button
          onClick={onEdit}
          className="p-1.5 border-2 border-black hover:bg-yellow-100 transition-all"
          title={isPublished ? "Edit (will go back to review)" : "Edit"}
        >
          <Edit size={14} />
        </button>

        {/* Submit for review */}
        {canSubmit && (
          <button
            onClick={onSubmit}
            className="p-1.5 border-2 border-black bg-green-100 hover:bg-green-200 transition-all"
            title="Submit for review"
          >
            <Send size={14} />
          </button>
        )}

        {/* Delete */}
        {canDelete && (
          isDeleteConfirm ? (
            <div className="flex gap-1">
              <button onClick={onDeleteConfirm} className="px-2 py-1 text-[10px] font-black bg-red-500 text-white border-2 border-black">
                Yes
              </button>
              <button onClick={onDeleteCancel} className="px-2 py-1 text-[10px] font-black bg-white border-2 border-black">
                No
              </button>
            </div>
          ) : (
            <button
              onClick={onDelete}
              className="p-1.5 border-2 border-black hover:bg-red-100 transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )
        )}
      </div>
    </div>
  );
}
