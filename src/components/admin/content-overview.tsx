"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Clock, CheckCircle, Globe, FileText,
  XCircle, ChevronDown, ChevronRight, Gamepad2,
  Eye, BarChart3, RefreshCw, ArrowRight
} from "lucide-react";

interface CategoryStat {
  category_id: number;
  category_name: string;
  category_slug: string;
  total: number;
  published: number;
  pending: number;
  draft: number;
  rejected: number;
  approved: number;
}

interface SubGroupStat {
  category_id: number;
  sub_group: string;
  total: number;
  published: number;
  pending: number;
  draft: number;
  rejected: number;
}

interface RecentItem {
  id: number;
  topic_code: string;
  name_en: string;
  status: string;
  updated_at: string;
  category_name: string;
  category_slug: string;
  updated_by_name: string;
}

interface Totals {
  total: number;
  published: number;
  pending: number;
  draft: number;
  rejected: number;
  approved: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  "road-sign": "bg-yellow-400",
  "road-traffic": "bg-blue-400",
  "priority": "bg-green-400",
  "driving": "bg-cyan-400",
  "technical": "bg-purple-400",
  "loading-people-goods": "bg-orange-400",
  "general-knowledge": "bg-red-400",
  "emergency": "bg-pink-400",
};

const STATUS_STYLE: Record<string, string> = {
  published: "bg-blue-100 text-blue-800 border border-blue-300",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  draft: "bg-gray-100 text-gray-700 border border-gray-300",
  rejected: "bg-red-100 text-red-800 border border-red-300",
  approved: "bg-green-100 text-green-800 border border-green-300",
};

function StatusPill({ count, label, style }: { count: number; label: string; style: string }) {
  if (count === 0) return null;
  return (
    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-sm ${style}`}>
      {count} {label}
    </span>
  );
}

export function ContentOverview() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [subGroupStats, setSubGroupStats] = useState<SubGroupStat[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content/overview", { cache: "no-store" });
      const data = await res.json();
      setTotals(data.totals);
      setCategoryStats(data.categoryStats || []);
      setSubGroupStats(data.subGroupStats || []);
      setRecent(data.recent || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSubGroups = (categoryId: number) =>
    subGroupStats.filter((s) => s.category_id === categoryId);

  const toggleExpand = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 border-2 border-black animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", value: totals?.total ?? 0, color: "bg-white", icon: BookOpen },
          { label: "Published", value: totals?.published ?? 0, color: "bg-blue-100", icon: Globe },
          { label: "Under Review", value: totals?.pending ?? 0, color: "bg-yellow-100", icon: Clock },
          { label: "Approved", value: totals?.approved ?? 0, color: "bg-green-100", icon: CheckCircle },
          { label: "Draft", value: totals?.draft ?? 0, color: "bg-gray-100", icon: FileText },
          { label: "Rejected", value: totals?.rejected ?? 0, color: "bg-red-100", icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`${color} border-2 border-black p-3`} style={{ boxShadow: "3px 3px 0 #000" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={14} />
              <span className="text-xs font-black uppercase">{label}</span>
            </div>
            <div className="text-3xl font-black">{value}</div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">By Category</h2>
          <button onClick={fetchData} className="p-2 border-2 border-black hover:bg-gray-100 transition-all" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {categoryStats.map((cat) => {
          const subGroups = getSubGroups(cat.category_id);
          const isExpanded = expanded[cat.category_id];
          const accentColor = CATEGORY_COLORS[cat.category_slug] || "bg-gray-400";

          return (
            <div key={cat.category_id} className="bg-white border-2 border-black" style={{ boxShadow: "4px 4px 0 #000" }}>
              {/* Category Row */}
              <div className="flex items-center gap-3 p-4">
                {/* Color accent */}
                <div className={`w-3 h-12 ${accentColor} border-r-2 border-black shrink-0`} />

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-black text-base">{cat.category_name}</span>
                    <span className="text-xs text-zinc-500 font-mono">({cat.total} total)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusPill count={cat.published} label="Public" style={STATUS_STYLE.published} />
                    <StatusPill count={cat.pending} label="Under Review" style={STATUS_STYLE.pending} />
                    <StatusPill count={cat.approved} label="Approved" style={STATUS_STYLE.approved} />
                    <StatusPill count={cat.draft} label="Draft" style={STATUS_STYLE.draft} />
                    <StatusPill count={cat.rejected} label="Rejected" style={STATUS_STYLE.rejected} />
                    {cat.total === 0 && <span className="text-xs text-zinc-400 italic">No content yet</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/content/${cat.category_slug}`}
                    className="p-2 border-2 border-black bg-white hover:bg-yellow-100 hover:shadow-[2px_2px_0_#000] transition-all"
                    title="Manage content"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/admin/review?category=${cat.category_id}`}
                    className="p-2 border-2 border-black bg-white hover:bg-yellow-100 hover:shadow-[2px_2px_0_#000] transition-all relative"
                    title="Review pending"
                  >
                    <Clock size={16} />
                    {cat.pending > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                        {cat.pending}
                      </span>
                    )}
                  </Link>
                  {subGroups.length > 0 && (
                    <button
                      onClick={() => toggleExpand(cat.category_id)}
                      className="p-2 border-2 border-black bg-white hover:bg-gray-100 transition-all"
                      title="Show sub-groups"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-group breakdown */}
              {isExpanded && subGroups.length > 0 && (
                <div className="border-t-2 border-black bg-zinc-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                    {subGroups.map((sg, i) => (
                      <div
                        key={sg.sub_group}
                        className={`p-3 flex items-start justify-between gap-2 ${
                          i % 2 === 0 ? "" : "md:border-l-2 md:border-black"
                        } border-b border-gray-200`}
                      >
                        <div>
                          <p className="font-bold text-sm">{sg.sub_group}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <StatusPill count={sg.published} label="Public" style={STATUS_STYLE.published} />
                            <StatusPill count={sg.pending} label="Review" style={STATUS_STYLE.pending} />
                            <StatusPill count={sg.draft} label="Draft" style={STATUS_STYLE.draft} />
                          </div>
                        </div>
                        <span className="text-xs font-black text-zinc-500 shrink-0">{sg.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/review"
          className="bg-yellow-400 border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all flex items-center justify-between"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <div>
            <p className="font-black">Review Queue</p>
            <p className="text-sm">{totals?.pending ?? 0} pending approval</p>
          </div>
          <ArrowRight size={20} />
        </Link>

        <Link
          href="/admin/overview"
          className="bg-purple-400 border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all flex items-center justify-between"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <div>
            <p className="font-black">Analytics</p>
            <p className="text-sm">Content performance</p>
          </div>
          <BarChart3 size={20} />
        </Link>

        <Link
          href="/admin/users"
          className="bg-cyan-400 border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all flex items-center justify-between"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <div>
            <p className="font-black">Staff Management</p>
            <p className="text-sm">Manage content creators</p>
          </div>
          <ArrowRight size={20} />
        </Link>
      </div>

      {/* Recent Activity */}
      {recent.length > 0 && (
        <div className="bg-white border-2 border-black" style={{ boxShadow: "4px 4px 0 #000" }}>
          <div className="border-b-2 border-black p-4 flex items-center justify-between">
            <h3 className="font-black text-lg">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase shrink-0 ${STATUS_STYLE[item.status] || STATUS_STYLE.draft}`}>
                  {item.status === "pending" ? "Under Review" : item.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{item.name_en}</p>
                  <p className="text-xs text-zinc-500">{item.category_name} · {item.updated_by_name || "—"}</p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0">
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
                <Link
                  href={`/admin/content/${item.category_slug}`}
                  className="p-1.5 border border-black hover:bg-yellow-100 transition-all shrink-0"
                >
                  <Eye size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
