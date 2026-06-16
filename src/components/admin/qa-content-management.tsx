"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Filter } from "lucide-react";
import { BrandSelect } from "@/components/ui/brand-select";
import Image from "next/image";
import { QAContentForm } from "./qa-content-form";

interface ContentItem {
  id: number;
  categoryId: number;
  type: string;
  status: string;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  imageUrl?: string | null;
  audioUrlEn?: string | null;
  audioUrlKm?: string | null;
  questionEn: string;
  questionKm: string;
  answerEn: string;
  answerKm: string;
  scorePoints: number;
  timeLimit: number;
  difficulty?: string | null;
  subtopic?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  createdBy?: number | null;
}

interface ContentWithCreator {
  content: ContentItem;
  creator: {
    id: number;
    username: string;
    displayName: string | null;
  } | null;
}

interface QAContentManagementProps {
  categorySlug: string;
  categoryId: number;
  categoryTitle: string;
}

export function QAContentManagement({
  categorySlug,
  categoryId,
  categoryTitle,
}: QAContentManagementProps) {
  const [data, setData] = useState<ContentWithCreator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [categorySlug]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/admin/content?categorySlug=${categorySlug}`);
      const result = await response.json();
      setData(result.content || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = data.filter((item) => {
    const content = item.content;
    const matchesSearch =
      content.questionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.questionKm.includes(searchTerm) ||
      content.answerEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || content.difficulty === difficultyFilter;
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  const handleSaveContent = async (contentData: Partial<ContentItem>) => {
    try {
      if (editingContent?.id) {
        await fetch(`/api/admin/content/${editingContent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contentData),
        });
      } else {
        await fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...contentData, categoryId }),
        });
      }

      fetchContent();
      setShowForm(false);
      setEditingContent(null);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Approve this content?")) return;

    try {
      await fetch(`/api/admin/content/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: "Approved" }),
      });
      fetchContent();
    } catch (error) {
      console.error("Error approving content:", error);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await fetch(`/api/admin/content/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchContent();
    } catch (error) {
      console.error("Error rejecting content:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      });
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-400",
      approved: "bg-green-400",
      rejected: "bg-red-400",
      inactive: "bg-gray-400",
    };
    return styles[status as keyof typeof styles] || "bg-gray-400";
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-black">
            {categoryTitle} - Content Management
          </h1>
          <p className="text-sm text-zinc-600">
            Manage Q&A content with approval workflow
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
        >
          <Plus size={16} />
          Add New Content
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]"
          />
        </div>
        <BrandSelect
          value={statusFilter}
          onValueChange={setStatusFilter}
          ariaLabel="Filter by status"
          className="px-4 py-2 text-sm"
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        <BrandSelect
          value={difficultyFilter}
          onValueChange={setDifficultyFilter}
          ariaLabel="Filter by difficulty"
          className="px-4 py-2 text-sm"
          options={[
            { value: "all", label: "All Difficulty" },
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />
        <div className="text-sm text-zinc-600">
          {filteredContent.length} of {data.length} items
        </div>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredContent.map(({ content, creator }) => (
          <div
            key={content.id}
            className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                {content.imageUrl && (
                  <div className="relative w-32 h-32 flex-shrink-0 border-2 border-black bg-gray-50">
                    <Image
                      src={content.imageUrl}
                      alt="Content"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Content Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs font-bold border border-black ${getStatusBadge(
                        content.status
                      )}`}
                    >
                      {content.status}
                    </span>
                    {content.difficulty && (
                      <span className="px-2 py-1 bg-blue-100 border border-black text-xs font-bold">
                        {content.difficulty}
                      </span>
                    )}
                    {content.subtopic && (
                      <span className="px-2 py-1 bg-gray-100 border border-black text-xs font-bold">
                        {content.subtopic}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-base text-black">
                      {content.questionEn}
                    </h3>
                    <p
                      className="text-sm text-zinc-600"
                      style={{ fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }}
                    >
                      {content.questionKm}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-700">
                    <p className="line-clamp-2">{content.answerEn}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    {creator && <span>by {creator.displayName || creator.username}</span>}
                    <span>•</span>
                    <span>{content.scorePoints} points</span>
                    <span>•</span>
                    <span>{content.timeLimit}s</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {content.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(content.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-400 border border-black text-xs font-bold hover:bg-green-300 whitespace-nowrap"
                      >
                        <CheckCircle size={12} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(content.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-400 border border-black text-xs font-bold hover:bg-red-300 whitespace-nowrap"
                      >
                        <XCircle size={12} />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setEditingContent(content)}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-400 border border-black text-xs font-bold hover:bg-yellow-300 whitespace-nowrap"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(content.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-400 border border-black text-xs font-bold hover:bg-red-300 whitespace-nowrap"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-400 border-2 border-black mx-auto mb-4 flex items-center justify-center">
            <Plus size={24} className="text-black" />
          </div>
          <h3 className="text-lg font-black text-black mb-2">No content found</h3>
          <p className="text-sm text-zinc-600 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start by adding your first Q&A content"}
          </p>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingContent) && (
        <QAContentForm
          content={editingContent}
          categoryId={categoryId}
          onClose={() => {
            setShowForm(false);
            setEditingContent(null);
          }}
          onSave={handleSaveContent}
        />
      )}
    </div>
  );
}
