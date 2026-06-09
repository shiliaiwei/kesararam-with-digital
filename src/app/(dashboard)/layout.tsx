import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ToastProvider } from "@/components/ui/toast-container";
import { getUserSubscription } from "@/lib/subscription";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompleteTeacherProfileForm } from "@/components/profile/complete-teacher-profile-form";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role === "student") redirect("/profile/student");

  // Check if teacher profile is incomplete
  let isProfileIncomplete = false;
  if (session.role === "teacher") {
    try {
      const [user] = await db
        .select({ schoolName: users.schoolName, province: users.province })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);
      if (!user || !user.schoolName || !user.province) {
        isProfileIncomplete = true;
      }
    } catch (err) {
      console.error("[DashboardLayout] profile check failed:", err);
    }
  }

  if (isProfileIncomplete) {
    return (
      <ToastProvider>
        <CompleteTeacherProfileForm />
      </ToastProvider>
    );
  }

  // Fetch plan for teacher sidebar badge
  let planInfo = { plan: "free", isTrial: false, trialEndsAt: null as Date | null, endsAt: null as Date | null };
  if (session.role === "teacher") {
    try {
      const sub = await getUserSubscription(session.id);
      planInfo = { plan: sub.plan, isTrial: sub.isTrial, trialEndsAt: sub.trialEndsAt, endsAt: sub.endsAt };
    } catch { /* ignore */ }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white flex">
        <AppSidebar
          role={session.role as "admin" | "teacher" | "staff"}
          name={session.name}
          email={session.email}
          avatar={session.avatar ?? null}
          plan={planInfo.plan}
          isTrial={planInfo.isTrial}
          trialEndsAt={planInfo.trialEndsAt?.toISOString() ?? null}
          endsAt={planInfo.endsAt?.toISOString() ?? null}
        />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-white">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
