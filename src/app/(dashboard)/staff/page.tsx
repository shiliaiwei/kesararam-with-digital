import { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText, Image } from "lucide-react";
import { StatsOverview } from "@/components/staff/dashboard/stats-overview";

export const metadata: Metadata = {
  title: "Staff Dashboard | Kesararam With Digital",
  description: "Manage content, media, and game modes",
};

export default function StaffDashboardPage() {
  const quickActions = [
    {
      title: "Add Content",
      description: "Create new educational content",
      href: "/staff/content/create",
      icon: Plus,
      color: "bg-green-400",
    },
    {
      title: "My Content",
      description: "View and manage your content",
      href: "/staff/content",
      icon: FileText,
      color: "bg-blue-400",
    },
    {
      title: "Media Library",
      description: "Manage images, audio, and videos",
      href: "/staff/media",
      icon: Image,
      color: "bg-purple-400",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Staff Dashboard</h1>
        <p className="text-zinc-600">
          Manage educational content across all categories
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-black text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="bg-white border-2 border-black p-6 hover:shadow-[6px_6px_0_#000] transition-all duration-200 group"
                style={{ boxShadow: "4px 4px 0 #000" }}
              >
                <div
                  className={`w-12 h-12 ${action.color} border-2 border-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} className="text-black" />
                </div>
                <h3 className="text-lg font-black text-black mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-zinc-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Categories Overview */}
      <div>
        <h2 className="text-xl font-black text-black mb-4">Content by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Traffic Signs", slug: "road-sign", count: 0, color: "bg-yellow-400" },
            { name: "Road Traffic", slug: "road-traffic", count: 0, color: "bg-blue-400" },
            { name: "Priority", slug: "priority", count: 0, color: "bg-green-400" },
            { name: "Driving", slug: "driving", count: 0, color: "bg-purple-400" },
            { name: "Technical", slug: "technical", count: 0, color: "bg-red-400" },
            { name: "Loading", slug: "loading-people-goods", count: 0, color: "bg-pink-400" },
            { name: "General", slug: "general-knowledge", count: 0, color: "bg-indigo-400" },
            { name: "Emergency", slug: "emergency", count: 0, color: "bg-orange-400" },
          ].map((category, index) => (
            <Link
              key={index}
              href={`/staff/content/${category.slug}`}
              className="bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0_#000] transition-all"
              style={{ boxShadow: "2px 2px 0 #000" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-black">{category.name}</h3>
                  <p className="text-sm text-zinc-600">Manage content</p>
                </div>
                <div
                  className={`w-10 h-10 ${category.color} border-2 border-black flex items-center justify-center`}
                >
                  <FileText size={20} className="text-black" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
