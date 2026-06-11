"use server";

import { db } from "@/lib/db";
import { inviteCodes, users, classes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function generateInviteCode(classId?: number | null) {
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
        classId: classId || null,
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
        classId: inviteCodes.classId,
        className: classes.name,
        usedByUsername: users.username,
        usedByDisplayName: users.displayName,
      })
      .from(inviteCodes)
      .leftJoin(users, eq(inviteCodes.usedById, users.id))
      .leftJoin(classes, eq(inviteCodes.classId, classes.id))
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
    // 1. Try to find in invite_codes first
    const [found] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.code, cleaned))
      .limit(1);

    if (found) {
      if (found.isUsed) {
        return { error: "This invitation code has already been used." };
      }
      let classId = found.classId;
      if (!classId) {
        const [firstClass] = await db
          .select()
          .from(classes)
          .where(eq(classes.teacherId, found.teacherId))
          .limit(1);
        if (firstClass) {
          classId = firstClass.id;
        }
      }
      if (classId) {
        const [cls] = await db
          .select()
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1);
        if (cls) {
          if (cls.status === "locked") {
            return { error: "This class is locked. New students cannot join. / ថ្នាក់រៀននេះត្រូវបានចាក់សោ។ សិស្សថ្មីមិនអាចចូលរួមបានទេ។" };
          }
          if (cls.status === "archived") {
            return { error: "This class has been archived. / ថ្នាក់រៀននេះត្រូវបានរក្សាទុកក្នុងប័ណ្ណសារហើយ។" };
          }
        }
      }
      return { success: true, valid: true };
    }

    // 2. Fallback: try classes.code directly
    const [classRecord] = await db
      .select()
      .from(classes)
      .where(eq(classes.code, cleaned))
      .limit(1);

    if (classRecord) {
      if (classRecord.status === "locked") {
        return { error: "This class is locked. New students cannot join. / ថ្នាក់រៀននេះត្រូវបានចាក់សោ។ សិស្សថ្មីមិនអាចចូលរួមបានទេ។" };
      }
      if (classRecord.status === "archived") {
        return { error: "This class has been archived. / ថ្នាក់រៀននេះត្រូវបានរក្សាទុកក្នុងប័ណ្ណសារហើយ។" };
      }
      return { success: true, valid: true };
    }

    return { error: "Invalid invitation code or class code." };
  } catch (error) {
    console.error("Failed to validate code:", error);
    return { error: "Validation error." };
  }
}
