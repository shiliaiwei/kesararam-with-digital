import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "student") {
    redirect("/profile/student");
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <DashboardNav role={session.role as "admin" | "teacher"} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
