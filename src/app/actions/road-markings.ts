"use server";

import { db } from "@/lib/db";
import { roadMarkings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

const REVALIDATE = "/admin/road-markings";

export async function createRoadMarking(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const category = (formData.get("category") as string).trim();
  const nameEn = (formData.get("nameEn") as string).trim();
  const nameKm = ((formData.get("nameKm") as string) ?? "").trim();
  const descriptionEn = (
    (formData.get("descriptionEn") as string) ?? ""
  ).trim();
  const descriptionKm = (
    (formData.get("descriptionKm") as string) ?? ""
  ).trim();
  const imageUrl = ((formData.get("imageUrl") as string) ?? "").trim() || null;
  const colorCode =
    ((formData.get("colorCode") as string) ?? "").trim() || null;
  const sortOrder =
    parseInt((formData.get("sortOrder") as string) ?? "0", 10) || 0;

  if (!category || !nameEn)
    return { error: "Category and name (EN) are required." };
  if (!["curbs", "signals", "longitudinal"].includes(category))
    return { error: "Invalid category." };

  try {
    await db.insert(roadMarkings).values({
      category,
      nameEn,
      nameKm,
      descriptionEn,
      descriptionKm,
      imageUrl,
      colorCode,
      sortOrder,
      isActive: true,
      createdBy: session.id,
    });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch {
    return { error: "Failed to create road marking." };
  }
}

export async function updateRoadMarking(id: number, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  const category = (formData.get("category") as string).trim();
  const nameEn = (formData.get("nameEn") as string).trim();
  const nameKm = ((formData.get("nameKm") as string) ?? "").trim();
  const descriptionEn = (
    (formData.get("descriptionEn") as string) ?? ""
  ).trim();
  const descriptionKm = (
    (formData.get("descriptionKm") as string) ?? ""
  ).trim();
  const imageUrl = ((formData.get("imageUrl") as string) ?? "").trim() || null;
  const colorCode =
    ((formData.get("colorCode") as string) ?? "").trim() || null;
  const sortOrder =
    parseInt((formData.get("sortOrder") as string) ?? "0", 10) || 0;
  const isActive = formData.get("isActive") === "true";

  if (!category || !nameEn)
    return { error: "Category and name (EN) are required." };
  if (!["curbs", "signals", "longitudinal"].includes(category))
    return { error: "Invalid category." };

  try {
    await db
      .update(roadMarkings)
      .set({
        category,
        nameEn,
        nameKm,
        descriptionEn,
        descriptionKm,
        imageUrl,
        colorCode,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(roadMarkings.id, id));
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch {
    return { error: "Failed to update road marking." };
  }
}

export async function deleteRoadMarking(id: number) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  try {
    await db.delete(roadMarkings).where(eq(roadMarkings.id, id));
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch {
    return { error: "Failed to delete road marking." };
  }
}

export async function toggleRoadMarkingActive(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");

  await db
    .update(roadMarkings)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(roadMarkings.id, id));
  revalidatePath(REVALIDATE);
}
