import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginMetrics } from "@/components/admin/login-metrics";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
          Dashboard
        </h1>
        <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide mt-1">
          System metrics and user activity
        </p>
      </div>

      {/* Login Metrics */}
      <LoginMetrics />
    </div>
  );
}
