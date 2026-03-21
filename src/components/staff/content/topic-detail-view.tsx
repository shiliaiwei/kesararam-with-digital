"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";

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
  draft: { label: "Draft", color: "bg-gray-300 text-gray-900", icon: Clock },
  pending: { label: "Under Review", color: "bg-yellow-300 text-yellow-900", icon: Clock },
  approved: { label: "Approved", color: "bg-green-300 text-green-900", icon: CheckCircle },
  published: { label: "Published", color: "bg-blue-300 text-blue-900", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-300 text-red-900", icon: XCircle },
};

export function TopicDetailView({ categorySlug, topicId }: TopicDetailViewProps) {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/topics/${topicId}`);
      if (response.ok) {
        const data = await response.json();
        setTopic(data.topic);
      } else {
        alert("Topic not found");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching topic:", error);
      alert("Failed to load topic");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      const response = await fetch(`/api/staff/topics/${topicId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/staff/content/${categorySlug}`);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete topic");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert("Failed to delete topic");
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Submit this topic for admin review?")) return;

    try {
      const response = await fetch(`/api/staff/topics/${topicId}/submit`, {
        method: "POST",
      });

      if (response.ok) {
        fetchTopic();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit topic");
      }
    } catch (error) {
      console.error("Error submitting topic:", error);
      alert("Failed to submit topic");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-zinc-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-zinc-600">Topic not found</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[topic.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/staff/content/${categorySlug}`)}
          className="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to List
        </button>

        <div className="flex items-center gap-2">
          {/* Submit button - only for draft or rejected */}
          {(topic.status === "draft" || topic.status === "rejected") && (
            <button
              onClick={handleSubmit}
              className="bg-green-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
            >
              <Send size={20} />
              Submit for Review
            </button>
          )}

          {/* Delete button - only for draft */}
          {topic.status === "draft" && (
            <button
              onClick={handleDelete}
              className="bg-red-400 border-2 border-black px-4 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2"
            >
              <Trash2 size={20} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Edit Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-400 p-4">
        <p className="text-sm font-bold text-blue-900">
          💡 To edit this topic, go back to the list and click the Edit button (pencil icon) to open the edit form.
        </p>
      </div>

      {/* Topic Details Card */}
      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase border-2 border-black ${statusConfig.color}`}
          >
            <StatusIcon size={16} />
            {statusConfig.label}
          </span>
        </div>

        {/* Topic Code */}
        <div className="mb-4">
          <span className="text-xs font-bold text-zinc-500 uppercase">Topic Code</span>
          <p className="font-mono text-lg font-bold">{topic.topic_code}</p>
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase">Name (English)</span>
            <p className="text-xl font-black mt-1">{topic.name_en}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase">Name (Khmer)</span>
            <p className="text-xl font-black mt-1">{topic.name_km}</p>
          </div>
        </div>

        {/* Sub-group */}
        {topic.sub_group && (
          <div className="mb-6">
            <span className="text-xs font-bold text-zinc-500 uppercase">Type / Sub-group</span>
            <p className="text-lg font-bold mt-1">{topic.sub_group}</p>
          </div>
        )}

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase">Description (English)</span>
            <p className="text-sm mt-2 whitespace-pre-wrap">{topic.description_en}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase">Description (Khmer)</span>
            <p className="text-sm mt-2 whitespace-pre-wrap">{topic.description_km}</p>
          </div>
        </div>

        {/* Image */}
        {topic.primary_image_url && (
          <div className="mb-6">
            <span className="text-xs font-bold text-zinc-500 uppercase block mb-2">Primary Image</span>
            <div className="w-64 h-64 border-2 border-black p-4 bg-gray-50">
              <img
                src={topic.primary_image_url}
                alt={topic.name_en}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Audio */}
        {(topic.audio_url_en || topic.audio_url_km) && (
          <div className="mb-6">
            <span className="text-xs font-bold text-zinc-500 uppercase block mb-2">Audio Files</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.audio_url_en && (
                <div>
                  <p className="text-sm font-bold mb-2">English Audio</p>
                  <audio controls className="w-full">
                    <source src={topic.audio_url_en} />
                  </audio>
                </div>
              )}
              {topic.audio_url_km && (
                <div>
                  <p className="text-sm font-bold mb-2">Khmer Audio</p>
                  <audio controls className="w-full">
                    <source src={topic.audio_url_km} />
                  </audio>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {topic.status === "rejected" && topic.rejection_reason && (
          <div className="bg-red-50 border-2 border-red-400 p-4 mb-6">
            <p className="text-sm font-bold text-red-900 mb-2">Rejection Reason:</p>
            <p className="text-sm text-red-800">{topic.rejection_reason}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t-2 border-gray-200">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase block">Created</span>
            <p className="text-sm mt-1">{new Date(topic.created_at).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase block">Updated</span>
            <p className="text-sm mt-1">{new Date(topic.updated_at).toLocaleString()}</p>
          </div>
          {topic.submitted_at && (
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase block">Submitted</span>
              <p className="text-sm mt-1">{new Date(topic.submitted_at).toLocaleString()}</p>
            </div>
          )}
          {topic.reviewed_at && (
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase block">Reviewed</span>
              <p className="text-sm mt-1">{new Date(topic.reviewed_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
