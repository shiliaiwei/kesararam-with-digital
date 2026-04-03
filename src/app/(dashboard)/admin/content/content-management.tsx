"use client";

import Link from "next/link";
import { 
  Plus, 
  BookOpen, 
  BarChart3,
  ExternalLink,
  Settings,
  Users,
  Clock,
  CheckCircle
} from "lucide-react";

interface ContentCategory {
  slug: string;
  titleEn: string;
  titleKm: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  itemCount: number;
  activeCount: number;
  lastUpdated: string;
}

const CONTENT_CATEGORIES: ContentCategory[] = [
  {
    slug: "road-sign",
    titleEn: "Traffic Signs",
    titleKm: "សញ្ញាផ្លូវវិថី",
    description: "Road signs, warning signs, and regulatory signs",
    color: "#eab308",
    icon: BookOpen,
    itemCount: 45,
    activeCount: 42,
    lastUpdated: "2024-03-15"
  },
  {
    slug: "road-traffic",
    titleEn: "Road Traffic Law",
    titleKm: "ច្បាប់ចរាចរ",
    description: "Traffic laws, regulations, and legal requirements",
    color: "#3b82f6",
    icon: BookOpen,
    itemCount: 28,
    activeCount: 25,
    lastUpdated: "2024-03-14"
  },
  {
    slug: "priority",
    titleEn: "Right of Way",
    titleKm: "សិទ្ធិដំណើរ",
    description: "Priority rules and intersection management",
    color: "#22c55e",
    icon: BookOpen,
    itemCount: 18,
    activeCount: 16,
    lastUpdated: "2024-03-13"
  },
  {
    slug: "driving",
    titleEn: "Driving Skills",
    titleKm: "ជំនាញបើកបរ",
    description: "Practical driving techniques and best practices",
    color: "#06b6d4",
    icon: BookOpen,
    itemCount: 32,
    activeCount: 30,
    lastUpdated: "2024-03-12"
  },
  {
    slug: "technical",
    titleEn: "Vehicle Technology",
    titleKm: "បច្ចេកវិទ្យាយានយន្ត",
    description: "Vehicle systems, maintenance, and technology",
    color: "#8b5cf6",
    icon: BookOpen,
    itemCount: 24,
    activeCount: 22,
    lastUpdated: "2024-03-11"
  },
  {
    slug: "loading-people-goods",
    titleEn: "Loading People & Goods",
    titleKm: "ការដឹកអ្នកដំណើរ",
    description: "Passenger and cargo transport regulations",
    color: "#f59e0b",
    icon: BookOpen,
    itemCount: 15,
    activeCount: 14,
    lastUpdated: "2024-03-10"
  },
  {
    slug: "general-knowledge",
    titleEn: "General Knowledge",
    titleKm: "ចំណេះដឹងទូទៅ",
    description: "General driving knowledge and road safety",
    color: "#ef4444",
    icon: BookOpen,
    itemCount: 38,
    activeCount: 35,
    lastUpdated: "2024-03-09"
  },
  {
    slug: "emergency",
    titleEn: "Emergency",
    titleKm: "ជំនួយបន្ទាន់",
    description: "Emergency procedures and first aid",
    color: "#dc2626",
    icon: BookOpen,
    itemCount: 12,
    activeCount: 11,
    lastUpdated: "2024-03-08"
  }
];

export function ContentManagement() {
  const totalItems = CONTENT_CATEGORIES.reduce((sum, cat) => sum + cat.itemCount, 0);
  const totalActive = CONTENT_CATEGORIES.reduce((sum, cat) => sum + cat.activeCount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-black">Content Management</h1>
          <p className="text-sm text-zinc-600">
            Manage content for all driving theory categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-400 border-2 border-black font-bold text-sm hover:bg-blue-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100">
            <BarChart3 size={16} />
            Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-400 border-2 border-black font-bold text-sm hover:bg-gray-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-400 border-2 border-black flex items-center justify-center">
              <BookOpen size={20} className="text-black" />
            </div>
            <div>
              <p className="text-2xl font-black text-black">{CONTENT_CATEGORIES.length}</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Categories</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-400 border-2 border-black flex items-center justify-center">
              <Users size={20} className="text-black" />
            </div>
            <div>
              <p className="text-2xl font-black text-black">{totalItems}</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Total Items</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center">
              <CheckCircle size={20} className="text-black" />
            </div>
            <div>
              <p className="text-2xl font-black text-black">{totalActive}</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Active Items</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-400 border-2 border-black flex items-center justify-center">
              <Clock size={20} className="text-black" />
            </div>
            <div>
              <p className="text-2xl font-black text-black">{Math.round((totalActive / totalItems) * 100)}%</p>
              <p className="text-xs font-bold text-zinc-600 uppercase">Active Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CONTENT_CATEGORIES.map((category) => (
          <div
            key={category.slug}
            className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden hover:shadow-[6px_6px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
          >
            {/* Header */}
            <div 
              className="h-3 border-b-2 border-black"
              style={{ backgroundColor: category.color }}
            />

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                  style={{ backgroundColor: category.color }}
                >
                  <category.icon size={18} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg text-black leading-tight">
                    {category.titleEn}
                  </h3>
                  <p 
                    className="text-sm text-zinc-600"
                    style={{ fontFamily: "Siemreap, sans-serif" }}
                  >
                    {category.titleKm}
                  </p>
                </div>
              </div>

              <p className="text-sm text-zinc-700 leading-relaxed">
                {category.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-zinc-600">
                    {category.itemCount} items
                  </span>
                  <span className="font-bold text-green-600">
                    {category.activeCount} active
                  </span>
                </div>
                <span className="text-zinc-500">
                  {new Date(category.lastUpdated).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-black">
                <Link
                  href={`/admin/content/${category.slug}`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-400 border border-black text-xs font-bold hover:bg-blue-300 transition-colors"
                >
                  <Settings size={12} />
                  Manage
                </Link>
                <Link
                  href={`/${category.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-400 border border-black text-xs font-bold hover:bg-gray-300 transition-colors"
                >
                  <ExternalLink size={12} />
                  View
                </Link>
                <Link
                  href={`/admin/content/${category.slug}/new`}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-green-400 border border-black text-xs font-bold hover:bg-green-300 transition-colors"
                >
                  <Plus size={12} />
                  Add
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-6">
        <h2 className="text-lg font-black text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-black bg-yellow-400 hover:bg-yellow-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100">
            <Plus size={20} className="text-black" />
            <div className="text-left">
              <p className="font-black text-sm text-black">Bulk Import</p>
              <p className="text-xs text-zinc-700">Import content from CSV</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border-2 border-black bg-blue-400 hover:bg-blue-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100">
            <BarChart3 size={20} className="text-black" />
            <div className="text-left">
              <p className="font-black text-sm text-black">Generate Report</p>
              <p className="text-xs text-zinc-700">Content usage analytics</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border-2 border-black bg-purple-400 hover:bg-purple-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100">
            <Settings size={20} className="text-black" />
            <div className="text-left">
              <p className="font-black text-sm text-black">Global Settings</p>
              <p className="text-xs text-zinc-700">Configure content rules</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
