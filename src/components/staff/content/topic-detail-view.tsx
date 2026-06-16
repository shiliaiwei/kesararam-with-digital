"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Trash2, CheckCircle, XCircle, Clock, HelpCircle, FileText, Image as ImageIcon, Volume2 } from "lucide-react";
import { QuestionsManager } from "./questions-manager";

// API returns camelCase from Drizzle ORM
interface Topic {
  id: number;
  topicCode: string;
  categoryId: number;
  nameEn: string;
  nameKm: string;
  descriptionEn: string;
  descriptionKm: string;
  primaryImageUrl: string | null;
  subGroup: string | null;
  audioUrlEn: string | null;
  audioUrlKm: string | null;
  lawReference: string | null;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  categoryName?: string | null;
}

interface TopicDetailViewProps {
  categorySlug: string;
  topicId: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-zinc-200 text-zinc-900", icon: FileText },
  pending: { label: "Under Review", color: "bg-yellow-300 text-yellow-900", icon: Clock },
  approved: { label: "Approved", color: "bg-green-300 text-green-900", icon: CheckCircle },
  published: { label: "Published", color: "bg-blue-300 text-blue-900", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-300 text-red-900", icon: XCircle },
  inactive: { label: "Inactive", color: "bg-zinc-200 text-zinc-600", icon: XCircle },
};

function fmt(d: string | null | undefined): string | null {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

type Tab = "questions" | "details";

export function TopicDetailView({ categorySlug, topicId }: TopicDetailViewProps) {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("questions");

  useEffect(() => { fetchTopic(); }, [topicId]);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/topics/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setTopic(data.topic);
      } else {
        router.back();
      }
    } catch {
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this topic and all its questions?")) return;
    const res = await fetch(`/api/staff/topics/${topicId}`, { method: "DELETE" });
    if (res.ok) router.push(`/staff/content/${categorySlug}`);
    else { const d = await res.json(); alert(d.error || "Failed to delete"); }
  };

  const handleSubmit = async () => {
    if (!confirm("Submit this topic for admin review?")) return;
    const res = await fetch(`/api/staff/topics/${topicId}/submit`, { method: "POST" });
    if (res.ok) fetchTopic();
    else { const d = await res.json(); alert(d.error || "Failed to submit"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!topic) return null;

  const statusConfig = STATUS_CONFIG[topic.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;
  const canSubmit = topic.status === "draft" || topic.status === "rejected";
  const canDelete = topic.status === "draft";

  return (
    <div className="space-y-4 max-w-4xl">

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => router.push(`/staff/content/${categorySlug}`)}
          className="bg-white border-2 border-black px-4 py-2 font-bold text-sm hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 border-black ${statusConfig.color}`}>
            <StatusIcon size={13} /> {statusConfig.label}
          </span>
          {canSubmit && (
            <button
              onClick={handleSubmit}
              className="bg-green-400 border-2 border-black px-4 py-2 font-bold text-sm hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
            >
              <Send size={15} /> Submit for Review
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="bg-red-100 border-2 border-black px-3 py-2 font-bold text-sm hover:bg-red-200 transition-all inline-flex items-center gap-2 text-red-700"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Topic header card */}
      <div className="bg-white border-2 border-black" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-stretch">
          {topic.primaryImageUrl && (
            <div className="w-24 md:w-32 shrink-0 border-r-2 border-black bg-zinc-50 flex items-center justify-center p-3">
              <img
                src={topic.primaryImageUrl}
                alt={topic.nameEn}
                className="object-contain max-h-24 max-w-full"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 px-5 py-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-[10px] font-black bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 text-zinc-500">
                {topic.topicCode}
              </span>
              {topic.categoryName && (
                <span className="text-[10px] font-bold text-zinc-500 border border-zinc-200 px-1.5 py-0.5 bg-zinc-50">
                  {topic.categoryName}
                </span>
              )}
              {topic.subGroup && (
                <span className="text-[10px] font-black border border-black bg-zinc-100 px-2 py-0.5">
                  {topic.subGroup}
                </span>
              )}
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
            <h1 className="text-xl md:text-2xl font-black leading-snug">{topic.nameEn}</h1>
            {topic.nameKm && (
              <p className="text-sm text-zinc-600 mt-0.5" style={{ fontFamily: "var(--font-system)" }}>
                {topic.nameKm}
              </p>
            )}
          </div>
        </div>
        {topic.status === "rejected" && topic.rejectionReason && (
          <div className="border-t-2 border-red-400 bg-red-50 px-5 py-3 text-sm font-bold text-red-800">
            ✗ Admin feedback: {topic.rejectionReason}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black">
        <button
          onClick={() => setTab("questions")}
          className={`px-5 py-2.5 font-black text-sm uppercase border-r-2 border-black inline-flex items-center gap-2 transition-colors ${tab === "questions" ? "bg-yellow-400" : "bg-white hover:bg-yellow-50"
            }`}
        >
          <HelpCircle size={15} /> Questions
        </button>
        <button
          onClick={() => setTab("details")}
          className={`px-5 py-2.5 font-black text-sm uppercase inline-flex items-center gap-2 transition-colors ${tab === "details" ? "bg-yellow-400" : "bg-white hover:bg-yellow-50"
            }`}
        >
          <FileText size={15} /> Details
        </button>
      </div>

      {/* Questions tab */}
      {tab === "questions" && (
        <QuestionsManager topicId={topic.id} topicStatus={topic.status} />
      )}

      {/* Details tab */}
      {tab === "details" && (
        <div className="bg-white border-2 border-black p-6 space-y-6" style={{ boxShadow: "4px 4px 0 #000" }}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Answer (English)</span>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
                {topic.descriptionEn || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Answer (Khmer)</span>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800" style={{ fontFamily: "var(--font-system)" }}>
                {topic.descriptionKm || "—"}
              </p>
            </div>
          </div>

          {topic.lawReference && (
            <div className="bg-amber-50 border-2 border-amber-300 px-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-1">Law Reference</span>
              <p className="text-sm font-mono text-amber-900">{topic.lawReference}</p>
            </div>
          )}

          {(topic.audioUrlEn || topic.audioUrlKm) && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Audio</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.audioUrlEn && (
                  <div className="border-2 border-black p-3">
                    <p className="text-xs font-black uppercase mb-2">English</p>
                    <audio controls className="w-full">
                      <source src={topic.audioUrlEn} />
                    </audio>
                  </div>
                )}
                {topic.audioUrlKm && (
                  <div className="border-2 border-black p-3">
                    <p className="text-xs font-black uppercase mb-2">Khmer</p>
                    <audio controls className="w-full">
                      <source src={topic.audioUrlKm} />
                    </audio>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t-2 border-zinc-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Timeline</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: "Created", val: fmt(topic.createdAt) },
                { label: "Updated", val: fmt(topic.updatedAt) },
                { label: "Submitted", val: fmt(topic.submittedAt) },
                { label: "Reviewed", val: fmt(topic.reviewedAt) },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="font-black uppercase text-zinc-400 block">{label}</span>
                  <p className="mt-0.5 font-bold text-zinc-700">{val ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
