import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, UserPlus, Shield, Clock } from "lucide-react";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let allUsers: {
    id: number;
    username: string;
    email: string;
    displayName: string | null;
    role: "student" | "teacher" | "admin";
    isActive: boolean;
    loginAttempts: number;
    createdAt: Date;
  }[] = [];

  try {
    allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        isActive: users.isActive,
        loginAttempts: users.loginAttempts,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  } catch (err) {
    console.error("[admin users] DB error:", err);
  }

  // Calculate stats
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.isActive).length;
  const adminUsers = allUsers.filter(u => u.role === "admin").length;
  const recentUsers = allUsers.filter(u => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return u.createdAt > dayAgo;
  }).length;

  const stats = [
    { label: "Total Users", value: totalUsers.toString(), icon: Users, color: "#3b82f6" },
    { label: "Active Users", value: activeUsers.toString(), icon: UserPlus, color: "#22c55e" },
    { label: "Admins", value: adminUsers.toString(), icon: Shield, color: "#ef4444" },
    { label: "New (24h)", value: recentUsers.toString(), icon: Clock, color: "#f97316" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Users size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
              User Management
            </h1>
            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
              Manage all platform accounts and permissions
            </p>
          </div>
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

      {/* Users Table Card */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        {/* Card Header */}
        <div className="border-b-2 border-black bg-blue-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            All Users
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            Search, filter, create, edit or remove user accounts
          </p>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <UsersTable initialUsers={allUsers} />
        </div>
      </div>
    </div>
  );
}
