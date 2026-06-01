"use server";

import { db } from "@/lib/db";
import { users, subscriptions } from "@/db/schema";
import { sessions } from "@/db/schema/sessions";
import { eq, or, and } from "drizzle-orm";
import { signToken, getRedirectUrl } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";

// In-memory IP rate limiter for login (5 attempts / 60s per IP)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

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

  // IP-based rate limit: 5 attempts per minute per IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const key = `login:${ip}`;
  const existing = ipRateMap.get(key);

  if (existing && now < existing.resetAt) {
    if (existing.count >= 5) {
      const waitSec = Math.ceil((existing.resetAt - now) / 1000);
      return { error: `Too many attempts. Try again in ${waitSec}s.` };
    }
    existing.count++;
  } else {
    ipRateMap.set(key, { count: 1, resetAt: now + 60_000 });
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
  
  const expectedHash = Buffer.from(user.passwordHash, 'utf8');
  const actualHash = Buffer.from(hash, 'utf8');

  let isValidPassword = false;
  if (expectedHash.length === actualHash.length) {
    isValidPassword = timingSafeEqual(expectedHash, actualHash);
  }

  if (!isValidPassword) {
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

  const redirectParam = (formData.get("redirect") as string) ?? "";
  
  let redirectTo = getRedirectUrl(user.role);
  if (redirectParam) {
    if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
      redirectTo = redirectParam;
    } else if (
      redirectParam.startsWith("https://kesararamwithdigital.tech") ||
      redirectParam.startsWith("https://dashboard.kesararamwithdigital.tech")
    ) {
      redirectTo = redirectParam;
    }
  }

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

export interface RegisterState {
  error: string;
  success?: boolean;
}

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
    console.warn("[autoAssignTeacherTrial] skipped:", e);
  }
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const displayName = (formData.get("displayName") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "student";
  
  const schoolName = (formData.get("schoolName") as string)?.trim();
  const province = (formData.get("province") as string)?.trim();
  const gradeLevel = (formData.get("gradeLevel") as string)?.trim();
  const section = (formData.get("section") as string)?.trim();
  const parentContact = (formData.get("parentContact") as string)?.trim();

  if (!username || !email || !password || !role) {
    return { error: "All required fields must be filled." };
  }

  if (role === "student") {
    if (!schoolName || !province || !gradeLevel) {
      return { error: "School Name, Province, and Grade are required for students." };
    }
  } else if (role === "teacher") {
    if (!schoolName || !province) {
      return { error: "School Name and Province are required for teachers." };
    }
  } else {
    return { error: "Invalid role selected." };
  }

  try {
    // Check if username or email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .limit(1);

    if (existing) {
      return { error: "Username or email already exists." };
    }

    const [newUser] = await db.insert(users).values({
      username,
      email,
      displayName: displayName || username,
      passwordHash: hashPassword(password),
      role: role as "student" | "teacher",
      schoolName,
      province,
      gradeLevel: role === "student" ? gradeLevel : null,
      section: section || null,
      parentContact: role === "student" ? parentContact : null,
      isActive: true,
      loginAttempts: 0,
    }).returning({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      avatar: users.avatar
    });

    if (role === "teacher" && newUser?.id) {
      await autoAssignTeacherTrial(newUser.id, newUser.id);
    }

    // Automatically log user in after successful registration
    const token = await signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.displayName ?? newUser.username,
      role: newUser.role,
      avatar: newUser.avatar ?? null,
    });

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Create session record (safely try/catch so db session insertion issues do not crash registration)
    try {
      await db.insert(sessions).values({
        userId: newUser.id,
        token,
        ipAddress,
        userAgent,
        isActive: true,
        loginAt: new Date(),
        lastActivityAt: new Date(),
      });
    } catch (sessionErr) {
      console.error("[registerAction] Non-fatal error creating session record:", sessionErr);
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
      maxAge: newUser.role === "student" ? 7 * 24 * 60 * 60 : 8 * 60 * 60,
    });

    return { error: "", success: true };
  } catch (e: any) {
    console.error("[register] failed:", e);
    return { error: e.message || "Failed to register user." };
  }
}
