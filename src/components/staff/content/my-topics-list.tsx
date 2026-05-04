"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock, CheckCircle, XCircle, Eye, Edit, Trash2,
  AlertCircle, FileText, Send, RefreshCw, Plus,
  ChevronDown, ChevronUp, Image as ImageIcon, Volume2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-container";

interface Topic {
  id: number;
  topicCode: string;
  categoryId: number;
  nameEn: string;
  nameKm: string;
  descriptionEn: string;
  descriptionKm: string;
  subGroup: string | null;
  primaryImageUrl: string | null;
  audioUrlEn: string | null;
  audioUrlKm: string | null;
  status: "draft" | "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}

interface Stats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}

const STATUS = {
  draft: { label: "Draft", icon: FileText, bg: "bg-zinc-100", border: "border-zinc-400", text: "text-zinc-700", dot: "bg-zinc-400" },
  pending: { label: "Pending", icon: Clock, bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-800", dot: "bg-yellow-400 animate-pulse" },
  approved: { label: "Approved", icon: CheckCircle, bg: "bg-green-100", border: "border-green-500", text: "text-green-800", dot: "bg-green-500" },
  rejected: { label: "Rejected", icon: XCircle, bg: "bg-red-100", border: "border-red-500", text: "text-red-800", dot: "bg-red-500" },
} as const;

const CATEGORIES: Record<number, { name: string; slug: string; color: string }> = {
  1: { name: "Traffic Signs", slug: "road-sign", color: "#3b82f6" },
  2: { name: "Road Traffic", slug: "road-traffic", color: "#f59e0b" },
  3: { name: "Priority", slug: "priority", color: "#8b5cf6" },
  4: { name: "Driving", slug: "driving", color: "#22c55e" },
  5: { name: "Technical", slug: "technical", color: "#f97316" },
  6: { name: "Loading & Goods", slug: "loading-people-goods", color: "#06b6d4" },
  7: { name: "General Knowledge", slug: "general-knowledge", color: "#ec4899" },
  8: { name: "Emergency", slug: "emergency", color: "#ef4444" },
};

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, active, color, icon: Icon, onClick,
}: {
  label: string; value: number; active: boolean;
  color: string; icon: React.ElementType; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-0 border-2 border-black p-4 text-left transition-all ${active ? "shadow-[4px_4px_0_#000] -translate-x-0.5 -translate-y-0.5" : "bg-white hover:shadow-[3px_3px_0_#000]"
        }`}
      style={{ backgroundColor: active ? color : undefined }}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className={active ? "text-black" : "text-zinc-500"} />
        <span className={`text-3xl font-black ${active ? "text-black" : "text-zinc-900"}`}>{value}</span>
      </div>
      <p className={`text-xs font-black uppercase tracking-widest ${active ? "text-black" : "text-zinc-500"}`}>{label}</p>
    </button>
  );
}

// ── Topic row card ────────────────────────────────────────────────────────────
function TopicCard({
  topic, onDelete, onSubmit, onView, onEdit, deleteConfirm, setDeleteConfirm,
}: {
  topic: Topic;
  onDelete: (id: number) => void;
  onSubmit: (id: number) => void;
  onView: (id: number, catSlug: string) => void;
  onEdit: (catSlug: string) => void;
  deleteConfirm: number | null;
  setDeleteConfirm: (id: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS[topic.status] ?? STATUS.draft;
  const StatusIcon = s.icon;
  const cat = CATEGORIES[topic.categoryId];

  const canEdit = topic.status === "draft" || topic.status === "rejected";
  const canSubmit = topic.status === "draft";

  return (
    <div className={`border-2 border-black bg-white transition-all ${expanded ? "shadow-[6px_6px_0_#000]" : "shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]"}`}>

      {/* ── Main row ── */}
      <div className="flex items-stretch">

        {/* Status stripe */}
        <div className={`w-1.5 shrink-0 ${topic.status === "approved" ? "bg-green-500"
          : topic.status === "pending" ? "bg-yellow-400"
            : topic.status === "rejected" ? "bg-red-500"
              : "bg-zinc-300"
          }`} />

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3">
          <div className="flex items-start gap-3">

            {/* Left: text */}
            <div className="flex-1 min-w-0">
              {/* Top meta row */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-[10px] font-black bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 text-zinc-500">
                  {topic.topicCode}
                </span>
                {cat && (
                  <span
                    className="text-[10px] font-black px-2 py-0.5 border border-black text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name}
                  </span>
                )}
                {topic.subGroup && (
                  <span className="text-[10px] font-bold text-zinc-500 border border-zinc-200 px-1.5 py-0.5 bg-zinc-50">
                    {topic.subGroup}
                  </span>
                )}
              </div>

              {/* Question / name */}
              <p className="font-black text-sm md:text-base text-black leading-snug mb-0.5">
                {topic.nameEn}
              </p>
              {topic.nameKm && (
                <p className="text-xs text-zinc-500 leading-snug" style={{ fontFamily: "Siemreap, sans-serif" }}>
                  {topic.nameKm}
                </p>
              )}

              {/* Date + assets row */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[10px] text-zinc-400 font-bold">
                  Created {fmt(topic.createdAt)}
                </span>
                {topic.primaryImageUrl && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-500 font-bold">
                    <ImageIcon size={10} /> Image
                  </span>
                )}
                {(topic.audioUrlEn || topic.audioUrlKm) && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-500 font-bold">
                    <Volume2 size={10} /> Audio
                  </span>
                )}
              </div>
            </div>

            {/* Right: status + actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 text-xs font-black ${s.bg} ${s.border} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                {canSubmit && (
                  <button
                    onClick={() => onSubmit(topic.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-400 border-2 border-black font-black text-xs hover:shadow-[2px_2px_0_#000] transition-all"
                    title="Submit for review"
                  >
                    <Send size={12} /> Submit
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => onEdit(cat?.slug || "road-sign")}
                    className="p-1.5 bg-yellow-400 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                )}
                <button
                  onClick={() => onView(topic.id, cat?.slug || "road-sign")}
                  className="p-1.5 bg-blue-400 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
                  title="View"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 bg-zinc-100 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
                  title="Details"
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t-2 border-black bg-zinc-50 px-5 py-4 space-y-3">

          {/* Rejection reason */}
          {topic.status === "rejected" && topic.rejectionReason && (
            <div className="bg-red-50 border-2 border-red-400 px-4 py-3">
              <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">Admin Feedback</p>
              <p className="text-sm text-red-900 font-bold">{topic.rejectionReason}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {[
              { label: "Created", val: topic.createdAt },
              { label: "Updated", val: topic.updatedAt },
              { label: "Submitted", val: topic.submittedAt },
              { label: "Reviewed", val: topic.reviewedAt },
            ].map(({ label, val }) => val ? (
              <div key={label} className="text-xs">
                <span className="font-black text-zinc-400 uppercase tracking-widest">{label} </span>
                <span className="font-bold text-zinc-700">{fmt(val)}</span>
              </div>
            ) : null)}
          </div>

          {/* Delete */}
          {canEdit && (
            <div className="pt-1 border-t border-zinc-200">
              {deleteConfirm === topic.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-700">Delete this item?</span>
                  <button
                    onClick={() => onDelete(topic.id)}
                    className="px-3 py-1.5 text-xs font-black bg-red-500 text-white border-2 border-black hover:bg-red-600"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-xs font-black bg-white border-2 border-black hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(topic.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-red-600 border-2 border-red-300 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function MyTopicsList() {
  const router = useRouter();
  const { showToast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<Stats>({ total: 0, draft: 0, pending: 0, approved: 0, rejected: 0 });

  const fetchTopics = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/staff/topics?scope=mine&limit=200");
      if (res.ok) {
        const data = await res.json();
        const list: Topic[] = data.topics || [];
        setTopics(list);
        setStats({
          total: list.length,
          draft: list.filter((t) => t.status === "draft").length,
          pending: list.filter((t) => t.status === "pending").length,
          approved: list.filter((t) => t.status === "approved").length,
          rejected: list.filter((t) => t.status === "rejected").length,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/staff/topics/${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Deleted", "success"); setDeleteConfirm(null); fetchTopics(true); }
      else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
    } catch { showToast("Failed to delete", "error"); }
  };

  const handleSubmit = async (id: number) => {
    try {
      const res = await fetch(`/api/staff/topics/${id}/submit`, { method: "POST" });
      if (res.ok) { showToast("Submitted for review ✓", "success"); fetchTopics(true); }
      else { const d = await res.json(); showToast(d.error || "Failed", "error"); }
    } catch { showToast("Failed to submit", "error"); }
  };

  const filtered = statusFilter === "all" ? topics : topics.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black mb-1">My Submissions</h1>
          <p className="text-sm text-zinc-500 font-bold">Track your content and see admin feedback</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchTopics(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-white font-black text-xs hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => router.push("/staff/content")}
            className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-black bg-yellow-400 font-black text-xs hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <Plus size={13} /> New Content
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <StatCard label="Total" value={stats.total} active={statusFilter === "all"} color="#fef9c3" icon={FileText} onClick={() => setStatusFilter("all")} />
        <StatCard label="Draft" value={stats.draft} active={statusFilter === "draft"} color="#f4f4f5" icon={FileText} onClick={() => setStatusFilter("draft")} />
        <StatCard label="Pending" value={stats.pending} active={statusFilter === "pending"} color="#fef08a" icon={Clock} onClick={() => setStatusFilter("pending")} />
        <StatCard label="Approved" value={stats.approved} active={statusFilter === "approved"} color="#bbf7d0" icon={CheckCircle} onClick={() => setStatusFilter("approved")} />
        <StatCard label="Rejected" value={stats.rejected} active={statusFilter === "rejected"} color="#fecaca" icon={XCircle} onClick={() => setStatusFilter("rejected")} />
      </div>

      {/* ── Active filter label ── */}
      {statusFilter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Showing: <span className="text-black">{statusFilter}</span> ({filtered.length})
          </span>
          <button onClick={() => setStatusFilter("all")} className="text-xs font-bold text-zinc-400 hover:text-black underline">
            Show all
          </button>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 border-2 border-black animate-pulse" style={{ boxShadow: "3px 3px 0 #000" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-2 border-black bg-white p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
          <AlertCircle size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="font-black text-zinc-500 mb-1">
            {statusFilter === "all" ? "No submissions yet" : `No ${statusFilter} items`}
          </p>
          <p className="text-xs text-zinc-400 mb-4">
            {statusFilter === "all" ? "Go to a category and create your first topic" : "Try a different filter"}
          </p>
          {statusFilter === "all" && (
            <button
              onClick={() => router.push("/staff/content")}
              className="inline-flex items-center gap-2 bg-yellow-400 border-2 border-black px-5 py-2.5 font-black text-sm hover:shadow-[3px_3px_0_#000] transition-all"
            >
              <Plus size={16} /> Browse Categories
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              onView={(id, slug) => router.push(`/staff/content/${slug}/${id}`)}
              onEdit={(slug) => router.push(`/staff/content/${slug}`)}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
