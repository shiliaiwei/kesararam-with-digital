"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { autoAssignStudentToMatchingClass } from "@/app/actions/classes";

function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

/** Auto-assign a 7-day Teacher Pro trial when a teacher account is created */
async function autoAssignTeacherTrial(userId: number, adminId: number) {
  try {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(subscriptions).values({
      userId,
      plan: "teacher_pro",
      status: "trial",
      isTrial: true,
      trialEndsAt,
      startsAt: now,
      endsAt: null,
      assignedBy: adminId,
      note: "Auto 7-day trial on account creation",
    });
  } catch (e) {
    // Non-fatal — subscription table may not exist yet
    console.warn("[autoAssignTeacherTrial] skipped:", e);
  }
}

export async function createUser(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const username = ((formData.get("username") as string) ?? "")
    .trim()
    .toLowerCase();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const displayName = ((formData.get("displayName") as string) ?? "").trim();
  const schoolName = ((formData.get("schoolName") as string) ?? "").trim();
  const province = ((formData.get("province") as string) ?? "").trim();
  const gradeLevel = ((formData.get("gradeLevel") as string) ?? "").trim();
  const section = ((formData.get("section") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const role =
    (formData.get("role") as "student" | "teacher" | "admin") ?? "student";

  if (!username || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  if ((role === "student" || role === "teacher") && (!schoolName || !province)) {
    return { error: "School name and province are required." };
  }

  if (role === "student" && !gradeLevel) {
    return { error: "Grade level is required for student accounts." };
  }

  try {
    const [newUser] = await db.insert(users).values({
      username,
      email,
      displayName: displayName || null,
      schoolName: schoolName || null,
      province: province || null,
      gradeLevel: gradeLevel || null,
      section: section || null,
      passwordHash: hashPassword(password),
      role,
      isActive: true,
      loginAttempts: 0,
    }).returning({ id: users.id });

    // Auto-assign 7-day Teacher Pro trial for new teacher accounts
    if (role === "teacher" && newUser?.id) {
      await autoAssignTeacherTrial(newUser.id, session.id);
    }

    if (role === "student" && newUser?.id) {
      await autoAssignStudentToMatchingClass(newUser.id, session.id);
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: unknown) {
    const code = (e as { cause?: { code?: string } }).cause?.code;
    const msg = e instanceof Error ? e.message : "";
    if (code === "23505" || msg.includes("unique") || msg.includes("duplicate"))
      return { error: "Username or email already exists." };
    return { error: "Failed to create user." };
  }
}

export async function updateUser(id: number, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const displayName = (formData.get("displayName") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = formData.get("role") as "student" | "teacher" | "admin";
  const isActive = formData.get("isActive") === "true";
  const newPassword = formData.get("password") as string;
  const schoolName = (formData.get("schoolName") as string)?.trim() || null;
  const province = (formData.get("province") as string)?.trim() || null;
  const gradeLevel = (formData.get("gradeLevel") as string)?.trim() || null;
  const section = (formData.get("section") as string)?.trim() || null;

  const updates: Record<string, unknown> = {
    displayName,
    email,
    role,
    isActive,
    schoolName,
    province,
    gradeLevel,
    section,
  };
  if (newPassword) updates.passwordHash = hashPassword(newPassword);

  try {
    await db.update(users).set(updates).where(eq(users.id, id));
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to update user." };
  }
}

export async function deleteUser(id: number) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");
  if (id === session.id) return { error: "Cannot delete your own account." };

  try {
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Failed to deactivate user." };
  }
}

export async function toggleUserActive(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  await db.update(users).set({ isActive }).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function resetUserPassword(id: number, password: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  await db
    .update(users)
    .set({
      passwordHash: hashPassword(password),
      loginAttempts: 0,
      lockedUntil: null,
    })
    .where(eq(users.id, id));
  revalidatePath("/admin/users");
  return { success: true };
}
