import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectPlanner } from "@/components/dashboard/project-planner";

export const dynamic = "force-dynamic";

export default async function StaffProjectPlannerPage() {
  const session = await getSession();
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    redirect("/login");
  }
  return <ProjectPlanner role="staff" />;
}
