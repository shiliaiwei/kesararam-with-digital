"use server";

import { db } from "@/lib/db";
import { classes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

function randomCode(len = 6) {
  return Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, 2 + len)
    .padEnd(len, "0");
}

export async function createClass(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string).trim();
  if (!name) return { error: "Class name is required." };

  const code = randomCode(6);

  try {
    await db.insert(classes).values({
      name,
      teacherId: session.id,
      code,
    });
    revalidatePath("/teacher/classes");
    return { success: true, code };
  } catch {
    return { error: "Failed to create class." };
  }
}

export async function deleteClass(id: number) {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  try {
    await db.delete(classes).where(eq(classes.id, id));
    revalidatePath("/teacher/classes");
    return { success: true };
  } catch {
    return { error: "Failed to delete class." };
  }
}

export async function getTeacherClasses() {
  const session = await getSession();
  if (!session) return [];

  if (session.role === "admin") {
    return db
      .select({
        id: classes.id,
        name: classes.name,
        code: classes.code,
        createdAt: classes.createdAt,
        teacherName: users.displayName,
        teacherEmail: users.email,
      })
      .from(classes)
      .leftJoin(users, eq(classes.teacherId, users.id));
  }

  return db
    .select({
      id: classes.id,
      name: classes.name,
      code: classes.code,
      createdAt: classes.createdAt,
      teacherName: users.displayName,
      teacherEmail: users.email,
    })
    .from(classes)
    .leftJoin(users, eq(classes.teacherId, users.id))
    .where(eq(classes.teacherId, session.id));
}
