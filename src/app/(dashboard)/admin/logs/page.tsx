import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ScrollText, Shield, Server, Activity, FileText, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let logs: Array<Record<string, unknown>> = [];
  try {
    logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        user: users.displayName,
        username: users.username,
        email: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
  } catch (err) {
    console.error("Error fetching logs:", err);
  }

  // Calculate stats
  const totalLogs = logs.length;
  const todayLogs = logs.filter(log => {
    const today = new Date();
    const logDate = new Date(log.createdAt);
    return logDate.toDateString() === today.toDateString();
  }).length;
  const uniqueUsers = new Set(logs.map(log => log.username).filter(Boolean)).size;
  const errorLogs = logs.filter(log => log.action?.toLowerCase().includes('error')).length;

  const stats = [
    { label: "Total Logs", value: totalLogs.toString(), icon: ScrollText, color: "#3b82f6" },
    { label: "Today", value: todayLogs.toString(), icon: Activity, color: "#22c55e" },
    { label: "Unique Users", value: uniqueUsers.toString(), icon: Shield, color: "#f97316" },
    { label: "Errors", value: errorLogs.toString(), icon: AlertTriangle, color: "#ef4444" },
  ];

  const logCategories = [
    { 
      id: "all", 
      label: "All Logs", 
      icon: ScrollText, 
      color: "#3b82f6",
      description: "Real-time record of all system events and user actions"
    },
    { 
      id: "system", 
      label: "System & Infra", 
      icon: Server, 
      color: "#22c55e",
      description: "OS events, Network traffic, DNS queries, and Container logs"
    },
    { 
      id: "access", 
      label: "Access & Identity", 
      icon: Activity, 
      color: "#f97316",
      description: "Logins, IAM changes, and Resource access"
    },
    { 
      id: "security", 
      label: "Security", 
      icon: Shield, 
      color: "#ef4444",
      description: "IDS/IPS alerts, Firewall logs, and Threat detection"
    },
    { 
      id: "app", 
      label: "App & Service", 
      icon: FileText, 
      color: "#a855f7",
      description: "Database queries, API Gateway events, and Error logs"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-orange-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <ScrollText size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
              System Logs
            </h1>
            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
              Monitor system activity, security events, and operational logs
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

      {/* Log Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logCategories.map((category) => (
          <div
            key={category.id}
            className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 cursor-pointer"
            style={{ borderRadius: "0px" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] flex-shrink-0"
                style={{ backgroundColor: category.color, borderRadius: "0px" }}
              >
                <category.icon size={20} className="text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase tracking-tight text-black mb-2">
                  {category.label}
                </h3>
                <p className="text-xs font-bold text-zinc-600 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Log Stream */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        {/* Card Header */}
        <div className="border-b-2 border-black bg-orange-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            Audit Log Stream
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            Real-time record of all system events and user actions
          </p>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Action
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    User
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black hidden md:table-cell">
                    IP Address
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-black uppercase tracking-widest text-black">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-200 hover:bg-yellow-50">
                    <td className="py-3 px-2 text-xs font-bold text-zinc-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 text-xs font-black uppercase border border-black bg-cyan-400">
                          {log.action}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase">
                          {log.entityType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-black">
                          {log.user || log.username || "System"}
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                          {log.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-zinc-600 hidden md:table-cell">
                      {log.ipAddress || "-"}
                    </td>
                    <td className="py-3 px-2 max-w-[200px] truncate text-xs font-medium text-zinc-500">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm font-bold text-zinc-500 uppercase tracking-wide">
                      No logs found.
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
