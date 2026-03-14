import { db } from "@/lib/db";
import { contentItems, categories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, FileText, Eye, EyeOff, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  "road-sign": "Road Signs",
  "road-traffic": "Road Traffic",
  priority: "Priority",
  driving: "Driving",
  technical: "Technical",
  "loading-people-goods": "Loading",
  "general-knowledge": "General",
  emergency: "Emergency",
};

export default async function AdminContentPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let items: {
    id: number;
    categoryId: number;
    categorySlug: string | null;
    type: string;
    titleEn: string;
    isActive: boolean;
    scorePoints: number;
    createdAt: Date;
  }[] = [];

  try {
    items = await db
      .select({
        id: contentItems.id,
        categoryId: contentItems.categoryId,
        categorySlug: categories.slug,
        type: contentItems.type,
        titleEn: contentItems.titleEn,
        isActive: contentItems.isActive,
        scorePoints: contentItems.scorePoints,
        createdAt: contentItems.createdAt,
      })
      .from(contentItems)
      .leftJoin(categories, eq(contentItems.categoryId, categories.id))
      .orderBy(desc(contentItems.createdAt));
  } catch (err) {
    console.error("[admin content] DB error:", err);
  }

  // Calculate stats
  const totalItems = items.length;
  const activeItems = items.filter(item => item.isActive).length;
  const inactiveItems = totalItems - activeItems;
  const avgScore = items.length > 0 ? Math.round(items.reduce((sum, item) => sum + item.scorePoints, 0) / items.length) : 0;

  const stats = [
    { label: "Total Items", value: totalItems.toString(), icon: FileText, color: "#3b82f6" },
    { label: "Active", value: activeItems.toString(), icon: Eye, color: "#22c55e" },
    { label: "Inactive", value: inactiveItems.toString(), icon: EyeOff, color: "#ef4444" },
    { label: "Avg Score", value: avgScore.toString(), icon: BookOpen, color: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-green-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <BookOpen size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
                Content
              </h1>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                All quiz questions and learning materials
              </p>
            </div>
          </div>
          
          {/* Add Content Button */}
          <button className="flex items-center gap-2 px-4 py-3 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100">
            <Plus size={20} className="text-black" />
            <span className="font-black text-sm uppercase tracking-wide text-black">
              Add Content
            </span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex flex-col gap-3"
            style={{ borderRadius: "0px" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: stat.color, borderRadius: "0px" }}
              >
                <stat.icon size={20} className="text-black" />
              </div>
              <span className="text-3xl font-black text-black">
                {stat.value}
              </span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Content Table Card */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        {/* Card Header */}
        <div className="border-b-2 border-black bg-green-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            Content Items
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            {items.length} item{items.length !== 1 ? "s" : ""} in the library
          </p>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Title
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Category
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Type
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Score
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black hidden lg:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-200 hover:bg-yellow-50">
                    <td className="py-3 px-2 font-bold text-sm text-black max-w-56 truncate">
                      {item.titleEn}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 text-xs font-black uppercase border border-black bg-cyan-400">
                        {CATEGORY_LABELS[item.categorySlug ?? ""] ??
                          item.categorySlug ??
                          item.categoryId}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-zinc-600 uppercase">
                      {item.type}
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-black">
                      {item.scorePoints}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs font-black uppercase border-2 border-black ${
                          item.isActive
                            ? "bg-green-400 text-black"
                            : "bg-red-400 text-black"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs font-bold text-zinc-500 hidden lg:table-cell">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-sm font-bold text-zinc-500 uppercase tracking-wide"
                    >
                      No content items yet. Add questions via the content API.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
