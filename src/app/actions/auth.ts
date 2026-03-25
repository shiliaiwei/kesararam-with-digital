"use server";

import { db } from "@/lib/db";
import { users, sessions } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { signToken, getRedirectUrl } from "@/lib/auth";
import { cookies, headers } from "next/headers";
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
    const detail =
      (e as { cause?: { message?: string } }).cause?.message ??
      (e instanceof Error ? e.message : String(e));
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
      .set({ loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
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

  // Get request headers for IP and user agent
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  // Invalidate all previous active sessions for this user
  try {
    await db
      .update(sessions)
      .set({ isActive: false, logoutAt: new Date() })
      .where(
        and(
          eq(sessions.userId, user.id),
          eq(sessions.isActive, true)
        )
      );
  } catch (err) {
    console.error("[login] Failed to invalidate previous sessions:", err);
    // non-fatal - continue with login
  }

  // Create new session record
  try {
    await db.insert(sessions).values({
      userId: user.id,
      token,
      ipAddress,
      userAgent,
      isActive: true,
      loginAt: new Date(),
      lastActivityAt: new Date(),
    });
  } catch (err) {
    console.error("[login] Failed to create session record:", err);
    // non-fatal - continue with login
  }

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
  const token = cookieStore.get("kwd_token")?.value;

  // Mark session as inactive
  if (token) {
    try {
      await db
        .update(sessions)
        .set({ isActive: false, logoutAt: new Date() })
        .where(eq(sessions.token, token));
    } catch (err) {
      console.error("[logout] Failed to update session:", err);
      // non-fatal
    }
  }

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
