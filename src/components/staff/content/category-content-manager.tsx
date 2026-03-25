"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Eye, Edit, Trash2, Send, Filter, Clock, User } from "lucide-react";
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
  sub_group: string;
  created_by: number;
  updated_by?: number;
  creator_name?: string;
  updater_name?: string;
}

interface CategoryContentManagerProps {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  requiresImage?: boolean;
  requiresAudio?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-300 text-gray-900 border border-gray-600",
  pending: "bg-yellow-300 text-yellow-900 border border-yellow-600",
  approved: "bg-green-300 text-green-900 border border-green-600",
  published: "bg-blue-300 text-blue-900 border border-blue-600",
  rejected: "bg-red-300 text-red-900 border border-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Under Review",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

const SUB_GROUPS: Record<string, string[]> = {
  "road-sign": ["Warning", "Prohibitory", "Mandatory", "Informational"],
  "road-traffic": ["Traffic Rules", "Speed Limits", "Parking", "Overtaking"],
  "priority": ["Intersections", "Roundabouts", "Pedestrian Crossings"],
  "driving": ["Basic Maneuvers", "Advanced Techniques", "Defensive Driving"],
  "technical": ["Engine", "Brakes", "Lights", "Safety Systems"],
  "loading-people-goods": ["Weight Limits", "Passenger Safety", "Cargo Securing"],
  "general-knowledge": ["Road Safety", "Environmental", "Legal"],
  "emergency": ["Accidents", "Breakdowns", "First Aid", "Emergency Contacts"],
};

export function CategoryContentManager({
  categoryId,
  categoryName,
  categorySlug,
  requiresImage = false,
  requiresAudio = false,
}: CategoryContentManagerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchTopics();
  }, [categoryId, statusFilter, search, subGroupFilter]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        categoryId: categoryId.toString(),
      });

      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/api/staff/topics?${params}`);
      const data = await response.json();
      
      let filtered = data.topics || [];
      
      if (subGroupFilter) {
        filtered = filtered.filter((t: Topic) => t.sub_group === subGroupFilter);
      }
      
      setTopics(filtered);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/staff/topics/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Topic deleted successfully", "success");
        setDeleteConfirm(null);
        fetchTopics();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to delete topic", "error");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      showToast("Failed to delete topic", "error");
    }
  };

  const handleSubmit = async (id: number) => {
    try {
      const response = await fetch(`/api/staff/topics/${id}/submit`, {
        method: "POST",
      });

      if (response.ok) {
        showToast("Topic submitted for review", "success");
        fetchTopics();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to submit topic", "error");
      }
    } catch (error) {
      console.error("Error submitting topic:", error);
      showToast("Failed to submit topic", "error");
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black">{categoryName}</h1>
            <p className="text-zinc-600">
              Create and manage content for this category
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Content
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              />
            </div>
          </div>

          {/* Sub-group Filter */}
          <div>
            <select
              value={subGroupFilter}
              onChange={(e) => setSubGroupFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            >
              <option value="">All Types</option>
              {SUB_GROUPS[categorySlug]?.map((sg) => (
                <option key={sg} value={sg}>
                  {sg}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
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
            <p className="text-zinc-600 mb-4">No topics found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create First Topic
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="px-4 py-3 text-left font-black">Code</th>
                  <th className="px-4 py-3 text-left font-black">Name</th>
                  <th className="px-4 py-3 text-left font-black">Type</th>
                  <th className="px-4 py-3 text-left font-black">Questions</th>
                  <th className="px-4 py-3 text-left font-black">Status</th>
                  <th className="px-4 py-3 text-left font-black">Last Updated</th>
                  <th className="px-4 py-3 text-left font-black">Updated By</th>
                  <th className="px-4 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">
                      {topic.topic_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{topic.name_en}</div>
                      <div className="text-sm text-zinc-600">
                        {topic.name_km}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{topic.sub_group || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {topic.question_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            STATUS_COLORS[topic.status]
                          }`}
                        >
                          {STATUS_LABELS[topic.status] || topic.status}
                        </span>
                        {topic.status === "pending" && (
                          <span className="text-[9px] text-orange-600 font-bold">
                            Under Review by Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-zinc-600">
                        <Clock size={14} />
                        <span>{formatRelativeTime(topic.updated_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-zinc-600">
                        <User size={14} />
                        <span>{topic.updater_name || topic.creator_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/staff/content/${categorySlug}/${topic.id}`)}
                          className="p-2 border-2 border-black hover:bg-blue-100 transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          onClick={() => setEditingTopic(topic)}
                          className="p-2 border-2 border-black hover:bg-yellow-100 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>

                        {(topic.status === "draft" || topic.status === "rejected") && (
                          <button
                            onClick={() => handleSubmit(topic.id)}
                            className="p-2 border-2 border-black hover:bg-green-100 transition-all"
                            title="Submit for Review"
                          >
                            <Send size={16} />
                          </button>
                        )}

                        {topic.status === "draft" && (
                          <>
                            {deleteConfirm === topic.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(topic.id)}
                                  className="px-2 py-1 text-xs font-bold bg-red-500 text-white border-2 border-black hover:bg-red-600"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-xs font-bold bg-white border-2 border-black hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(topic.id)}
                                className="p-2 border-2 border-black hover:bg-red-100 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTopic) && (
        <TopicFormModal
          categoryId={categoryId}
          categorySlug={categorySlug}
          requiresImage={requiresImage}
          requiresAudio={requiresAudio}
          initialData={editingTopic}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTopic(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingTopic(null);
            fetchTopics();
          }}
        />
      )}
    </div>
  );
}
