"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { signToken, getRedirectUrl } from "@/lib/auth";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { redirect } from "next/navigation";

export interface LoginState {
  error: string;
  redirectTo?: string;
}

function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
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
    const detail = (e as { cause?: { message?: string } }).cause?.message ?? (e instanceof Error ? e.message : String(e));
    console.error("[login] DB SELECT failed:", detail);
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

  // Return the redirect URL — client handles navigation (supports external URLs)
  const redirectParam = (formData.get("redirect") as string) ?? "";
  const redirectTo =
    redirectParam.startsWith("https://") || redirectParam.startsWith("/")
      ? redirectParam
      : getRedirectUrl(user.role);

  return { error: "", redirectTo };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("kwd_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain:
      process.env.NODE_ENV === "production"
        ? ".kesararamwithdigital.tech"
        : undefined,
    maxAge: 0,
  });
  redirect(
    process.env.NODE_ENV === "production"
      ? "https://kesararamwithdigital.tech/login"
      : "/login",
  );
}
