"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

export async function createUser(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const username = (formData.get("username") as string).trim().toLowerCase();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const displayName = (formData.get("displayName") as string).trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as "student" | "teacher" | "admin";

  if (!username || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  try {
    await db.insert(users).values({
      username,
      email,
      displayName: displayName || null,
      passwordHash: hashPassword(password),
      role,
      isActive: true,
      isSuspended: false,
      loginAttempts: 0,
      createdBy: session.id,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique"))
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

  const updates: Record<string, unknown> = {
    displayName,
    email,
    role,
    isActive,
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
