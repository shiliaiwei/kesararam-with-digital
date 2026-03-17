import { ProjectPlanner } from "@/components/dashboard/project-planner";

export const metadata = {
  title: "Project Planner | Admin Panel",
};

export default function AdminProjectPlannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProjectPlanner role="admin" />
    </div>
  );
}