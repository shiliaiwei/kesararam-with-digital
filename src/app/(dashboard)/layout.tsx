import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <AppSidebar
        role={session.role as "admin" | "teacher"}
        name={session.name}
        email={session.email}
        avatar={session.avatar ?? null}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 bg-white">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
