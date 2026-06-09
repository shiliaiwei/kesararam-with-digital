import type { Metadata } from "next";
import { TeacherApplyForm } from "./teacher-apply-form";
import type { Plan, Cycle } from "./teacher-apply-form";

const VALID_PLANS = ["teacher_pro", "school", "driving_school"] as const;
const isPlan = (x: string): x is Plan => (VALID_PLANS as readonly string[]).includes(x);

export const metadata: Metadata = {
  title: "Apply for a Teacher plan — KWD",
  description: "Apply for a KWD Teacher, School, or Academy plan.",
};

export default async function TeacherApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cycle?: string }>;
}) {
  const sp = await searchParams;
  const plan: Plan = sp.plan && isPlan(sp.plan) ? sp.plan : "teacher_pro";
  const cycle: Cycle = sp.cycle === "monthly" ? "monthly" : "yearly";

  return (
    <main className="min-h-screen bg-white">
      <TeacherApplyForm initialPlan={plan} initialCycle={cycle} />
    </main>
  );
}
