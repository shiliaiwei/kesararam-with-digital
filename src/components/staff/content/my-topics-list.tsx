"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  FileText,
  Send
} from "lucide-react";

interface Topic {
  id: number;
  topic_code: string;
  category_id: number;
  name_en: string;
  name_km: string;
  description_en: string;
  description_km: string;
  sub_group: string | null;
  primary_image_url: string | null;
  audio_url_en: string | null;
  audio_url_km: string | null;
  status: "draft" | "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

interface Stats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "bg-gray-400",
    textColor: "text-gray-900",
    borderColor: "border-gray-600",
  },
  pending: {
    label: "Pending Review",
    icon: Clock,
    color: "bg-yellow-400",
    textColor: "text-yellow-900",
    borderColor: "border-yellow-600",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "bg-green-400",
    textColor: "text-green-900",
    borderColor: "border-green-600",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-400",
    textColor: "text-red-900",
    borderColor: "border-red-600",
  },
};

const CATEGORIES = [
  { id: 1, name: "Traffic Signs", slug: "road-sign" },
  { id: 2, name: "Road Traffic", slug: "road-traffic" },
  { id: 3, name: "Priority", slug: "priority" },
  { id: 4, name: "Driving", slug: "driving" },
  { id: 5, name: "Technical", slug: "technical" },
  { id: 6, name: "Loading People & Goods", slug: "loading-people-goods" },
  { id: 7, name: "General Knowledge", slug: "general-knowledge" },
  { id: 8, name: "Emergency", slug: "emergency" },
];

export function MyTopicsList() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch("/api/staff/topics", {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
        calculateStats(data.topics || []);
      } else {
        console.error("Failed to fetch topics:", response.status);
        setTopics([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      setTopics([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (topicsList: Topic[]) => {
    const newStats = {
      total: topicsList.length,
      draft: topicsList.filter((t) => t.status === "draft").length,
      pending: topicsList.filter((t) => t.status === "pending").length,
      approved: topicsList.filter((t) => t.status === "approved").length,
      rejected: topicsList.filter((t) => t.status === "rejected").length,
    };
    setStats(newStats);
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

  const handleSubmitForReview = async (id: number) => {
    if (!confirm("Submit this topic for admin review?")) return;

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

  const getCategoryName = (categoryId: number) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const filteredTopics =
    statusFilter === "all"
      ? topics
      : topics.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all ${
            statusFilter === "all" ? "shadow-[4px_4px_0_#000]" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="font-black text-sm">Total</span>
          </div>
          <div className="text-3xl font-black">{stats.total}</div>
        </button>

        <button
          onClick={() => setStatusFilter("draft")}
          className={`bg-gray-100 border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all ${
            statusFilter === "draft" ? "shadow-[4px_4px_0_#000]" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText size={20} />
            <span className="font-black text-sm">Draft</span>
          </div>
          <div className="text-3xl font-black">{stats.draft}</div>
        </button>

        <button
          onClick={() => setStatusFilter("pending")}
          className={`bg-yellow-100 border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all ${
            statusFilter === "pending" ? "shadow-[4px_4px_0_#000]" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} />
            <span className="font-black text-sm">Pending</span>
          </div>
          <div className="text-3xl font-black">{stats.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter("approved")}
          className={`bg-green-100 border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all ${
            statusFilter === "approved" ? "shadow-[4px_4px_0_#000]" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} />
            <span className="font-black text-sm">Approved</span>
          </div>
          <div className="text-3xl font-black">{stats.approved}</div>
        </button>

        <button
          onClick={() => setStatusFilter("rejected")}
          className={`bg-red-100 border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all ${
            statusFilter === "rejected" ? "shadow-[4px_4px_0_#000]" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={20} />
            <span className="font-black text-sm">Rejected</span>
          </div>
          <div className="text-3xl font-black">{stats.rejected}</div>
        </button>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border-2 border-black p-6 animate-pulse"
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              <div className="h-4 bg-gray-200 w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div
          className="bg-white border-2 border-black p-12 text-center"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-600 mb-2 font-bold">
            {statusFilter === "all"
              ? "No topics yet"
              : `No ${statusFilter} topics`}
          </p>
          <p className="text-sm text-zinc-500">
            {statusFilter === "all"
              ? "Create your first topic to get started"
              : "Try selecting a different status filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTopics.map((topic) => {
            const statusConfig = STATUS_CONFIG[topic.status];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={topic.id}
                className="bg-white border-2 border-black p-6 hover:shadow-[6px_6px_0_#000] transition-all"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-xs font-mono bg-zinc-100 border border-black px-2 py-1">
                        {topic.topic_code}
                      </span>
                      <span
                        className={`${statusConfig.color} ${statusConfig.textColor} border-2 ${statusConfig.borderColor} px-3 py-1 text-xs font-bold inline-flex items-center gap-1`}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-black mb-1">
                      {topic.name_en}
                    </h3>
                    {topic.name_km && (
                      <p className="text-zinc-600 mb-3">{topic.name_km}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-zinc-600 mb-3">
                      <span className="font-bold">
                        {getCategoryName(topic.category_id)}
                      </span>
                      {topic.sub_group && <span>{topic.sub_group}</span>}
                    </div>

                    {topic.status === "rejected" && topic.rejection_reason && (
                      <div className="bg-red-50 border-2 border-red-400 p-3 mb-3">
                        <p className="text-sm font-bold text-red-900 mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-800">
                          {topic.rejection_reason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4 text-xs text-zinc-500">
                      <span>
                        Created: {new Date(topic.created_at).toLocaleDateString()}
                      </span>
                      {topic.submitted_at && (
                        <span>
                          Submitted:{" "}
                          {new Date(topic.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                      {topic.reviewed_at && (
                        <span>
                          Reviewed:{" "}
                          {new Date(topic.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {topic.status === "draft" && (
                      <button
                        onClick={() => handleSubmitForReview(topic.id)}
                        className="bg-green-400 border-2 border-black px-3 py-2 font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-1 text-sm"
                        title="Submit for Review"
                      >
                        <Send size={16} />
                        Submit
                      </button>
                    )}

                    {(topic.status === "draft" || topic.status === "rejected") && (
                      <>
                        <button
                          className="bg-yellow-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="bg-red-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}

                    <button
                      className="bg-blue-400 border-2 border-black p-2 hover:shadow-[2px_2px_0_#000] transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
