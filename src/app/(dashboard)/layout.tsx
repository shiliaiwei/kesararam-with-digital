import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
    <div className="flex min-h-screen w-full">
      <SidebarProvider>
        <AppSidebar
          role={session.role as "admin" | "teacher"}
          name={session.name}
          email={session.email}
          avatar={session.avatar ?? null}
        />
        <SidebarInset className="flex flex-col bg-muted/40">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
