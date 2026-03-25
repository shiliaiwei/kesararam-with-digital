"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Clock, FileText, TrendingUp } from "lucide-react";

const CATEGORIES = [
  { id: 1, slug: "road-sign",            name: "Traffic Signs",          color: "bg-yellow-400" },
  { id: 2, slug: "road-traffic",         name: "Road Traffic Law",       color: "bg-blue-400"   },
  { id: 3, slug: "priority",             name: "Right of Way",           color: "bg-green-400"  },
  { id: 4, slug: "driving",              name: "Driving Skills",         color: "bg-cyan-400"   },
  { id: 5, slug: "technical",            name: "Vehicle Technology",     color: "bg-purple-400" },
  { id: 6, slug: "loading-people-goods", name: "Loading People & Goods", color: "bg-orange-400" },
  { id: 7, slug: "general-knowledge",    name: "General Knowledge",      color: "bg-red-400"    },
  { id: 8, slug: "emergency",            name: "Emergency",              color: "bg-pink-400"   },
];

interface CategoryStat {
  category_id: number;
  category_slug: string;
  total: number;
  published: number;
  pending: number;
  draft: number;
}

interface MyStats {
  total: number;
  pending: number;
  published: number;
  draft: number;
  rejected: number;
  approved: number;
}

export default function StaffContentPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff/content/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setCategoryStats(d.categoryStats || []);
        setMyStats(d.myStats || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStat = (slug: string) =>
    categoryStats.find((s) => s.category_slug === slug);

  return (
    <div className="p-6 space-y-6">
      {/* Header + My Submissions summary */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black">Content</h1>
          <p className="text-zinc-600 text-sm">Select a category to create or manage content</p>
        </div>

        {/* My Submissions mini-stats */}
        <Link
          href="/staff/submissions"
          className="bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all min-w-[260px]"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-sm flex items-center gap-1.5">
              <TrendingUp size={14} /> My Submissions
            </span>
            <ArrowRight size={14} className="text-zinc-400" />
          </div>
          {loading || !myStats ? (
            <div className="flex gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-8 w-12 bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-black">{myStats.total}</div>
                <div className="text-[10px] font-bold text-zinc-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-blue-600">{myStats.published}</div>
                <div className="text-[10px] font-bold text-zinc-500">Public</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-yellow-600">{myStats.pending}</div>
                <div className="text-[10px] font-bold text-zinc-500">Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-gray-500">{myStats.draft}</div>
                <div className="text-[10px] font-bold text-zinc-500">Draft</div>
              </div>
              {myStats.rejected > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-black text-red-600">{myStats.rejected}</div>
                  <div className="text-[10px] font-bold text-zinc-500">Rejected</div>
                </div>
              )}
            </div>
          )}
        </Link>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const stat = getStat(cat.slug);
          return (
            <Link
              key={cat.id}
              href={`/staff/content/${cat.slug}`}
              className="bg-white border-2 border-black p-4 hover:shadow-[6px_6px_0_#000] transition-all flex items-center gap-4 group"
              style={{ boxShadow: "4px 4px 0 #000" }}
            >
              <div className={`w-3 h-14 ${cat.color} border-r-2 border-black shrink-0`} />

              <div className="flex-1 min-w-0">
                <p className="font-black text-base leading-tight mb-2">{cat.name}</p>

                {loading ? (
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-sm" />
                    <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-sm" />
                  </div>
                ) : stat ? (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-zinc-100 border border-zinc-300">
                      {stat.total} total
                    </span>
                    {stat.published > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1">
                        <Globe size={9} /> {stat.published} public
                      </span>
                    )}
                    {stat.pending > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-300 inline-flex items-center gap-1">
                        <Clock size={9} /> {stat.pending} review
                      </span>
                    )}
                    {stat.draft > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-300 inline-flex items-center gap-1">
                        <FileText size={9} /> {stat.draft} draft
                      </span>
                    )}
                    {stat.total === 0 && (
                      <span className="text-[10px] text-zinc-400 italic">No content yet</span>
                    )}
                  </div>
                ) : null}
              </div>

              <ArrowRight size={18} className="shrink-0 text-zinc-400 group-hover:text-black transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
