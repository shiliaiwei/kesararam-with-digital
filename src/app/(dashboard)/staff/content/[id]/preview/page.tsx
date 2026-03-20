import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems } from "@/db/schema/content";
import { eq, and } from "drizzle-orm";
import { ArrowLeft, Edit, Image as ImageIcon, Music, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Preview Content | Staff Dashboard",
  description: "Preview educational content",
};

const CATEGORIES = [
  { id: 1, name: "Traffic Signs" },
  { id: 2, name: "Road Traffic" },
  { id: 3, name: "Priority" },
  { id: 4, name: "Driving" },
  { id: 5, name: "Technical" },
  { id: 6, name: "Loading People & Goods" },
  { id: 7, name: "General Knowledge" },
  { id: 8, name: "Emergency" },
];

export default async function PreviewContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id || session.user.role !== "staff") {
    notFound();
  }

  const { id } = await params;
  const contentId = parseInt(id);

  const [content] = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.id, contentId),
        eq(contentItems.createdBy, session.user.id)
      )
    );

  if (!content) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.id === content.categoryId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/staff/content"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-black mb-2"
          >
            <ArrowLeft size={20} />
            Back to Content
          </Link>
          <h1 className="text-3xl font-black text-black">Content Preview</h1>
        </div>

        {(content.status === "pending" || content.status === "rejected") && (
          <Link
            href={`/staff/content/${content.id}/edit`}
            className="bg-yellow-400 border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
          >
            <Edit size={20} />
            Edit
          </Link>
        )}
      </div>

      {/* Status Badge */}
      <div
        className={`inline-block px-4 py-2 border-2 border-black font-black ${
          content.status === "active"
            ? "bg-green-400"
            : content.status === "pending"
            ? "bg-yellow-400"
            : content.status === "rejected"
            ? "bg-red-400"
            : "bg-gray-400"
        }`}
      >
        Status: {content.status.toUpperCase()}
      </div>

      {/* Basic Info */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-2xl font-black text-black">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-zinc-600 mb-1">Category</p>
            <p className="text-lg">{category?.name}</p>
          </div>
          <div>
            <p className="font-bold text-zinc-600 mb-1">Type</p>
            <p className="text-lg">{content.type}</p>
          </div>
        </div>

        <div>
          <p className="font-bold text-zinc-600 mb-1">Title (English)</p>
          <p className="text-xl font-black">{content.titleEn}</p>
        </div>

        {content.titleKm && (
          <div>
            <p className="font-bold text-zinc-600 mb-1">Title (Khmer)</p>
            <p className="text-xl font-black">{content.titleKm}</p>
          </div>
        )}

        {content.descriptionEn && (
          <div>
            <p className="font-bold text-zinc-600 mb-1">Description (English)</p>
            <p className="text-lg">{content.descriptionEn}</p>
          </div>
        )}

        {content.descriptionKm && (
          <div>
            <p className="font-bold text-zinc-600 mb-1">Description (Khmer)</p>
            <p className="text-lg">{content.descriptionKm}</p>
          </div>
        )}
      </div>

      {/* Q&A Section */}
      {(content.questionEn || content.answerEn) && (
        <div
          className="bg-white border-2 border-black p-6 space-y-4"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <h2 className="text-2xl font-black text-black">Question & Answer</h2>

          {content.questionEn && (
            <div>
              <p className="font-bold text-zinc-600 mb-1">Question (English)</p>
              <p className="text-lg">{content.questionEn}</p>
            </div>
          )}

          {content.questionKm && (
            <div>
              <p className="font-bold text-zinc-600 mb-1">Question (Khmer)</p>
              <p className="text-lg">{content.questionKm}</p>
            </div>
          )}

          {content.answerEn && (
            <div>
              <p className="font-bold text-zinc-600 mb-1">Answer (English)</p>
              <p className="text-lg">{content.answerEn}</p>
            </div>
          )}

          {content.answerKm && (
            <div>
              <p className="font-bold text-zinc-600 mb-1">Answer (Khmer)</p>
              <p className="text-lg">{content.answerKm}</p>
            </div>
          )}
        </div>
      )}

      {/* Media Resources */}
      {(content.imageUrl ||
        content.audioUrlEn ||
        content.audioUrlKm ||
        content.videoUrl ||
        content.logoUrl ||
        content.brandUrl) && (
        <div
          className="bg-white border-2 border-black p-6 space-y-4"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <h2 className="text-2xl font-black text-black flex items-center gap-2">
            <ImageIcon size={24} />
            Media Resources
          </h2>

          {content.imageUrl && (
            <div>
              <p className="font-bold text-zinc-600 mb-2">Image</p>
              <img
                src={content.imageUrl}
                alt={content.titleEn}
                className="max-w-md border-2 border-black"
                style={{ boxShadow: "4px 4px 0 #000" }}
              />
            </div>
          )}

          {content.audioUrlEn && (
            <div>
              <p className="font-bold text-zinc-600 mb-2 flex items-center gap-2">
                <Music size={18} />
                Audio (English)
              </p>
              <audio controls className="w-full max-w-md">
                <source src={content.audioUrlEn} />
              </audio>
            </div>
          )}

          {content.audioUrlKm && (
            <div>
              <p className="font-bold text-zinc-600 mb-2 flex items-center gap-2">
                <Music size={18} />
                Audio (Khmer)
              </p>
              <audio controls className="w-full max-w-md">
                <source src={content.audioUrlKm} />
              </audio>
            </div>
          )}

          {content.videoUrl && (
            <div>
              <p className="font-bold text-zinc-600 mb-2 flex items-center gap-2">
                <Video size={18} />
                Video
              </p>
              <video controls className="max-w-2xl border-2 border-black">
                <source src={content.videoUrl} />
              </video>
            </div>
          )}

          {content.logoUrl && (
            <div>
              <p className="font-bold text-zinc-600 mb-2">Logo</p>
              <img
                src={content.logoUrl}
                alt="Logo"
                className="max-w-xs border-2 border-black"
              />
            </div>
          )}

          {content.brandUrl && (
            <div>
              <p className="font-bold text-zinc-600 mb-2">Brand</p>
              <img
                src={content.brandUrl}
                alt="Brand"
                className="max-w-xs border-2 border-black"
              />
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div
        className="bg-white border-2 border-black p-6 space-y-4"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-2xl font-black text-black">Settings</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="font-bold text-zinc-600 mb-1">Difficulty</p>
            <p className="text-lg capitalize">{content.difficulty || "N/A"}</p>
          </div>
          <div>
            <p className="font-bold text-zinc-600 mb-1">Subtopic</p>
            <p className="text-lg">{content.subtopic || "N/A"}</p>
          </div>
          <div>
            <p className="font-bold text-zinc-600 mb-1">Score Points</p>
            <p className="text-lg">{content.scorePoints}</p>
          </div>
          <div>
            <p className="font-bold text-zinc-600 mb-1">Time Limit</p>
            <p className="text-lg">{content.timeLimit}s</p>
          </div>
        </div>

        {content.tags && content.tags.length > 0 && (
          <div>
            <p className="font-bold text-zinc-600 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-400 border-2 border-black px-3 py-1 text-sm font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div
        className="bg-white border-2 border-black p-6 space-y-2"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <h2 className="text-2xl font-black text-black mb-4">Metadata</h2>
        <p className="text-sm text-zinc-600">
          Created: {new Date(content.createdAt).toLocaleString()}
        </p>
        <p className="text-sm text-zinc-600">
          Updated: {new Date(content.updatedAt).toLocaleString()}
        </p>
        {content.approvedAt && (
          <p className="text-sm text-zinc-600">
            Approved: {new Date(content.approvedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
