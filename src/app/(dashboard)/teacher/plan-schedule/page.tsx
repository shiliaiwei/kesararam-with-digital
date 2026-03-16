import { PlanSchedule } from "@/components/dashboard/plan-schedule";

export const metadata = {
  title: "Schedule Plan | Teacher Panel",
};

export default function TeacherPlanSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
            Plan Schedule
          </h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Global standard 12-week agenda tracker
          </p>
        </div>
      </div>

      <PlanSchedule role="teacher" />
    </div>
  );
}
