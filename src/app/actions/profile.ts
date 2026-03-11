"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function updateProfileAction(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const displayName = (formData.get("displayName") as string)?.trim() || null;
  const avatarRaw = formData.get("avatar") as string | null;

  // Validate + normalise avatar
  let avatar: string | null = null;
  if (avatarRaw) {
    try {
      const parsed = JSON.parse(avatarRaw) as { face?: string; head?: string };
      if (parsed.face || parsed.head) {
        avatar = JSON.stringify({
          face: parsed.face ?? "",
          head: parsed.head ?? "",
        });
      }
    } catch {
      return { error: "Invalid avatar data." };
    }
  }

  // Detect if avatar actually changed (simple string comparison)
  const oldAvatar = session.avatar ?? null;
  const avatarChanged = avatar !== null && avatar !== oldAvatar;

  try {
    await db
      .update(users)
      .set({
        ...(displayName ? { displayName } : {}),
        avatar,
        updatedAt: new Date(),
        ...(avatarChanged ? { avatarChangedAt: new Date() } : {}),
      })
      .where(eq(users.id, session.id));
  } catch (err) {
    console.error("[profile update error]", err);
    return { error: "Failed to update profile. Please try again." };
  }

  // Re-fetch user then re-issue JWT so the cookie reflects new avatar
  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user) return { error: "User not found." };

  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.displayName ?? user.username,
    role: user.role,
    avatar: user.avatar ?? null,
  });

  const cookieStore = await cookies();
  cookieStore.set("kwd_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain:
      process.env.NODE_ENV === "production"
        ? ".kesararamwithdigital.tech"
        : undefined,
    maxAge: user.role === "student" ? 7 * 24 * 60 * 60 : 8 * 60 * 60,
  });

  return { success: true };
}
