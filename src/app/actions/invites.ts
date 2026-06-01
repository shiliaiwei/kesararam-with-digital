"use server";

import { db } from "@/lib/db";
import { inviteCodes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function generateInviteCode() {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    throw new Error("Unauthorized: Only teachers can generate invite codes.");
  }

  // Generate a random uppercase alphanumeric code (e.g., KWD-ABCD-EFGH)
  const rand = randomBytes(4).toString("hex").toUpperCase();
  const code = `KWD-${rand.slice(0, 4)}-${rand.slice(4, 8)}`;

  try {
    const [newCode] = await db
      .insert(inviteCodes)
      .values({
        code,
        teacherId: session.id,
        isUsed: false,
      })
      .returning();
    
    return { success: true, code: newCode };
  } catch (error) {
    console.error("Failed to generate invite code:", error);
    return { error: "Failed to generate unique invite code." };
  }
}

export async function getTeacherInviteCodes() {
  const session = await getSession();
  if (!session || session.role !== "teacher") {
    throw new Error("Unauthorized");
  }

  try {
    const codes = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        isUsed: inviteCodes.isUsed,
        usedAt: inviteCodes.usedAt,
        createdAt: inviteCodes.createdAt,
        usedByUsername: users.username,
        usedByDisplayName: users.displayName,
      })
      .from(inviteCodes)
      .leftJoin(users, eq(inviteCodes.usedById, users.id))
      .where(eq(inviteCodes.teacherId, session.id))
      .orderBy(desc(inviteCodes.createdAt));

    return { success: true, codes };
  } catch (error) {
    console.error("Failed to get invite codes:", error);
    return { error: "Failed to fetch invite codes." };
  }
}

export async function validateInviteCodeAction(code: string) {
  if (!code) return { error: "Code is required" };
  const cleaned = code.trim();

  try {
    const [found] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.code, cleaned))
      .limit(1);

    if (!found) {
      return { error: "Invalid invitation code." };
    }

    if (found.isUsed) {
      return { error: "This invitation code has already been used." };
    }

    return { success: true, valid: true };
  } catch (error) {
    console.error("Failed to validate code:", error);
    return { error: "Validation error." };
  }
}
