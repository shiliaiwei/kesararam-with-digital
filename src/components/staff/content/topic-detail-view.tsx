"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Trash2, CheckCircle, XCircle, Clock, HelpCircle, FileText } from "lucide-react";
import { QuestionsManager } from "./questions-manager";

interface Topic {
  id: number;
  topic_code: string;
  category_id: number;
  name_en: string;
  name_km: string;
  description_en: string;
  description_km: string;
  primary_image_url: string | null;
  sub_group: string | null;
  audio_url_en: string | null;
  audio_url_km: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

interface TopicDetailViewProps {
  categorySlug: string;
  topicId: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft:     { label: "Draft",        color: "bg-gray-300 text-gray-900",   icon: Clock },
  pending:   { label: "Under Review", color: "bg-yellow-300 text-yellow-900", icon: Clock },
  approved:  { label: "Approved",     color: "bg-green-300 text-green-900",  icon: CheckCircle },
  published: { label: "Published",    color: "bg-blue-300 text-blue-900",    icon: CheckCircle },
  rejected:  { label: "Rejected",     color: "bg-red-300 text-red-900",      icon: XCircle },
};

type Tab = "details" | "questions";

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
  const canEdit = topic.status !== "pending";

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => router.push(`/staff/content/${categorySlug}`)}
          className="bg-white border-2 border-black px-4 py-2 font-bold text-sm hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 border-black ${statusConfig.color}`}>
            <StatusIcon size={13} /> {statusConfig.label}
          </span>
          {canEdit && (topic.status === "draft" || topic.status === "rejected") && (
            <button
              onClick={handleSubmit}
              className="bg-green-400 border-2 border-black px-4 py-2 font-bold text-sm hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
            >
              <Send size={15} /> Submit for Review
            </button>
          )}
          {topic.status === "draft" && (
            <button
              onClick={handleDelete}
              className="bg-red-100 border-2 border-black px-3 py-2 font-bold text-sm hover:bg-red-200 transition-all inline-flex items-center gap-2"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Topic title card */}
      <div className="bg-white border-2 border-black px-5 py-4" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-start gap-4">
          {topic.primary_image_url && (
            <img src={topic.primary_image_url} alt="" className="w-16 h-16 object-contain border-2 border-black shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-zinc-400 mb-0.5">{topic.topic_code}</p>
            <h1 className="text-xl font-black">{topic.name_en}</h1>
            {topic.name_km && <p className="text-sm text-zinc-600">{topic.name_km}</p>}
            {topic.sub_group && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-black border border-black bg-zinc-100">
                {topic.sub_group}
              </span>
            )}
          </div>
        </div>
        {topic.status === "rejected" && topic.rejection_reason && (
          <div className="mt-3 bg-red-50 border-2 border-red-400 px-3 py-2 text-xs font-bold text-red-800">
            Rejected: {topic.rejection_reason}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-black">
        <button
          onClick={() => setTab("questions")}
          className={`px-5 py-2.5 font-black text-sm uppercase border-r-2 border-black inline-flex items-center gap-2 transition-colors ${
            tab === "questions" ? "bg-yellow-400" : "bg-white hover:bg-yellow-50"
          }`}
        >
          <HelpCircle size={15} /> Questions
        </button>
        <button
          onClick={() => setTab("details")}
          className={`px-5 py-2.5 font-black text-sm uppercase inline-flex items-center gap-2 transition-colors ${
            tab === "details" ? "bg-yellow-400" : "bg-white hover:bg-yellow-50"
          }`}
        >
          <FileText size={15} /> Details
        </button>
      </div>

      {/* Tab content */}
      {tab === "questions" && (
        <QuestionsManager topicId={topic.id} topicStatus={topic.status} />
      )}

      {tab === "details" && (
        <div className="bg-white border-2 border-black p-6 space-y-5" style={{ boxShadow: "4px 4px 0 #000" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <span className="text-xs font-black uppercase text-zinc-500 block mb-1">Description (English)</span>
              <p className="text-sm whitespace-pre-wrap">{topic.description_en || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-black uppercase text-zinc-500 block mb-1">Description (Khmer)</span>
              <p className="text-sm whitespace-pre-wrap">{topic.description_km || "—"}</p>
            </div>
          </div>

          {(topic.audio_url_en || topic.audio_url_km) && (
            <div>
              <span className="text-xs font-black uppercase text-zinc-500 block mb-2">Audio</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.audio_url_en && (
                  <div>
                    <p className="text-xs font-bold mb-1">English</p>
                    <audio controls className="w-full"><source src={topic.audio_url_en} /></audio>
                  </div>
                )}
                {topic.audio_url_km && (
                  <div>
                    <p className="text-xs font-bold mb-1">Khmer</p>
                    <audio controls className="w-full"><source src={topic.audio_url_km} /></audio>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t-2 border-zinc-200 text-xs">
            <div>
              <span className="font-black uppercase text-zinc-500 block">Created</span>
              <p className="mt-0.5">{new Date(topic.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-black uppercase text-zinc-500 block">Updated</span>
              <p className="mt-0.5">{new Date(topic.updated_at).toLocaleDateString()}</p>
            </div>
            {topic.submitted_at && (
              <div>
                <span className="font-black uppercase text-zinc-500 block">Submitted</span>
                <p className="mt-0.5">{new Date(topic.submitted_at).toLocaleDateString()}</p>
              </div>
            )}
            {topic.reviewed_at && (
              <div>
                <span className="font-black uppercase text-zinc-500 block">Reviewed</span>
                <p className="mt-0.5">{new Date(topic.reviewed_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
