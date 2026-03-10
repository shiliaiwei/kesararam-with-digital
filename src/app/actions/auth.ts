"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { signToken, getRedirectUrl } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

interface LoginState {
  error: string;
}

function hashPassword(pw: string): string {
  return createHash("sha256")
    .update(pw + (process.env.JWT_SECRET ?? ""))
    .digest("hex");
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const login = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!login || !password) {
    return { error: "Email/username and password are required." };
  }

  let user: typeof import("@/db/schema").users.$inferSelect | undefined;

  try {
    const [found] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, login), eq(users.username, login)));
    user = found;
  } catch (e) {
    console.error("DB error during login:", e);
    return { error: "Service unavailable. Please try again later." };
  }

  if (!user || !user.isActive) {
    return { error: "Invalid credentials." };
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Your account is locked. Contact your administrator." };
  }

  const hash = hashPassword(password);
  if (user.passwordHash !== hash) {
    const newAttempts = (user.loginAttempts ?? 0) + 1;
    const updates: Record<string, unknown> = { loginAttempts: newAttempts };

    if (newAttempts >= 9) {
      updates.lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    try {
      await db.update(users).set(updates).where(eq(users.id, user.id));
    } catch (_) {
      // non-fatal
    }

    const remaining = Math.max(0, 9 - newAttempts);
    return {
      error:
        remaining > 0
          ? `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
          : "Account locked due to too many failed attempts. Contact your administrator.",
    };
  }

  // Success — reset attempts
  try {
    await db
      .update(users)
      .set({ loginAttempts: 0, lockedUntil: null })
      .where(eq(users.id, user.id));
  } catch (_) {
    // non-fatal
  }

  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.displayName ?? user.username,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set("kwd_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: user.role === "student" ? 7 * 24 * 60 * 60 : 8 * 60 * 60,
  });

  redirect(getRedirectUrl(user.role));
}
