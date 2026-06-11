"use server";

import { db } from "@/lib/db";
import { teacherApplications } from "@/db/schema/subscriptions";

type Plan = "teacher_pro" | "school" | "driving_school";
type Cycle = "monthly" | "yearly";

export interface TeacherApplicationInput {
  displayName: string;
  email: string;
  phone?: string;
  schoolName?: string;
  province?: string;
  plan: string;
  billingCycle: string;
  seats?: number | string | null;
  academyName?: string;
  note?: string;
}

export type SubmitResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

const PLANS: Plan[] = ["teacher_pro", "school", "driving_school"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Public — creates a PENDING teacher application. No account is created here;
 * an admin reviews + verifies payment, then provisions the account & plan.
 */
export async function submitTeacherApplication(
  input: TeacherApplicationInput,
): Promise<SubmitResult> {
  const displayName = clean(input.displayName, 120);
  const email = clean(input.email, 160).toLowerCase();
  const plan = clean(input.plan, 30) as Plan;
  const billingCycle = (input.billingCycle === "yearly" ? "yearly" : "monthly") as Cycle;

  if (displayName.length < 2) return { ok: false, error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!PLANS.includes(plan)) return { ok: false, error: "Please choose a valid plan." };

  let seats: number | null = null;
  if (plan === "school") {
    const n = Number(input.seats);
    seats = Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 1000) : null;
  }

  try {
    const rows = await db
      .insert(teacherApplications)
      .values({
        displayName,
        email,
        phone: clean(input.phone, 60) || null,
        schoolName: clean(input.schoolName, 160) || null,
        province: clean(input.province, 80) || null,
        plan,
        billingCycle,
        seats,
        academyName: plan === "driving_school" ? clean(input.academyName, 160) || null : null,
        note: clean(input.note, 1000) || null,
        status: "pending",
        updatedAt: new Date(),
      })
      .returning({ id: teacherApplications.id });

    return { ok: true, id: rows[0].id };
  } catch (err) {
    console.error("submitTeacherApplication failed:", err);
    return { ok: false, error: "Something went wrong. Please try again or contact us on Telegram." };
  }
}
