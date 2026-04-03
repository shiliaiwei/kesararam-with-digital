import { ProjectPlanner } from "@/components/dashboard/project-planner";

export const metadata = {
  title: "Project Planner | Teacher Panel",
};

export default function TeacherProjectPlannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProjectPlanner role="teacher" />
    </div>
  );
}
