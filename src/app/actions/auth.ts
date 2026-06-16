"use server";

import { db } from "@/lib/db";
import { users, subscriptions } from "@/db/schema";
import { sessions } from "@/db/schema/sessions";
import { eq, or, and } from "drizzle-orm";
import { signToken, getRedirectUrl } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { hashPassword, verifyPassword } from "@/lib/password";
import { redirect } from "next/navigation";
import {
  verifyTotp,
  consumeBackupCode,
  signPending2fa,
  verifyPending2fa,
} from "@/lib/twofa";
import { decryptSecret } from "@/lib/twofa-crypto";

// In-memory IP rate limiter for login (5 attempts / 60s per IP)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

export interface LoginState {
  error: string;
  redirectTo?: string;
  // 2FA: set when the password was correct but a TOTP/backup code is still needed.
  twoFactorRequired?: boolean;
  pendingToken?: string;
}

type DbUser = typeof users.$inferSelect;

/**
 * Issue the real session: rotate sessions, set the auth cookie, compute the
 * post-login redirect. Shared by the normal login path and the 2FA-verify path.
 */
async function establishSession(user: DbUser, redirectParam: string): Promise<LoginState> {
  const headersList = await headers();

  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.displayName ?? user.username,
    role: user.role,
    avatar: user.avatar ?? null,
  });

  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  await Promise.all([
    db
      .update(users)
      .set({ loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
      .where(eq(users.id, user.id))
      .catch(() => {}),
    db
      .update(sessions)
      .set({ isActive: false, logoutAt: new Date() })
      .where(and(eq(sessions.userId, user.id), eq(sessions.isActive, true)))
      .catch((err) => {
        console.error("[login] Failed to invalidate previous sessions:", err);
      }),
    db
      .insert(sessions)
      .values({
        userId: user.id,
        token,
        ipAddress,
        userAgent,
        isActive: true,
        loginAt: new Date(),
        lastActivityAt: new Date(),
      })
      .catch((err) => {
        console.error("[login] Failed to create session record:", err);
      }),
  ]);

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

  const { valid: isValidPassword, needsUpgrade } = verifyPassword(password, user.passwordHash);

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

  // Transparently migrate legacy unsalted SHA-256 hashes to salted scrypt on a
  // successful login, so existing accounts upgrade without a forced reset.
  if (needsUpgrade) {
    try {
      await db
        .update(users)
        .set({ passwordHash: hashPassword(password) })
        .where(eq(users.id, user.id));
    } catch (_) {
      // non-fatal — the user still authenticated with their correct password
    }
  }

  // 2FA: password is correct, but if the account has 2FA we stop here and
  // require a TOTP/backup code before issuing a session.
  if (user.twoFactorEnabled) {
    try {
      await db
        .update(users)
        .set({ loginAttempts: 0, lockedUntil: null })
        .where(eq(users.id, user.id));
    } catch (_) {
      // non-fatal
    }
    const pendingToken = await signPending2fa(user.id);
    return { error: "", twoFactorRequired: true, pendingToken };
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

  await Promise.all([
    // Success — reset attempts
    db
      .update(users)
      .set({ loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
      .where(eq(users.id, user.id))
      .catch(() => {}),
    // Invalidate all previous active sessions for this user
    db
      .update(sessions)
      .set({ isActive: false, logoutAt: new Date() })
      .where(
        and(
          eq(sessions.userId, user.id),
          eq(sessions.isActive, true)
        )
      )
      .catch((err) => {
        console.error("[login] Failed to invalidate previous sessions:", err);
      }),
    // Create new session record
    db
      .insert(sessions)
      .values({
        userId: user.id,
        token,
        ipAddress,
        userAgent,
        isActive: true,
        loginAt: new Date(),
        lastActivityAt: new Date(),
      })
      .catch((err) => {
        console.error("[login] Failed to create session record:", err);
      }),
  ]);

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
  redirectTo?: string;
}

async function autoAssignTeacherTrial(userId: number, adminId: number, plan: string = "teacher_pro") {
  try {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const validPlan = ["teacher_pro", "family", "driving_school"].includes(plan) ? plan as any : "teacher_pro";
    await db.insert(subscriptions).values({
      userId,
      plan: validPlan,
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
  const plan = (formData.get("plan") as string) || "teacher_pro";

  if (!username || !email || !password || !role) {
    return { error: "All required fields must be filled." };
  }

  if (role === "student") {
    if (!schoolName || !province) {
      return { error: "School Name and Province are required for students." };
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

    const concurrentActions: Promise<any>[] = [];

    if (role === "teacher" && newUser?.id) {
      concurrentActions.push(autoAssignTeacherTrial(newUser.id, newUser.id, plan));
    }

    concurrentActions.push(
      db
        .insert(sessions)
        .values({
          userId: newUser.id,
          token,
          ipAddress,
          userAgent,
          isActive: true,
          loginAt: new Date(),
          lastActivityAt: new Date(),
        })
        .catch((sessionErr) => {
          console.error("[registerAction] Non-fatal error creating session record:", sessionErr);
        })
    );

    await Promise.all(concurrentActions);

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

    return { error: "", success: true, redirectTo: getRedirectUrl(newUser.role) };
  } catch (e: any) {
    console.error("[register] failed:", e);
    return { error: e.message || "Failed to register user." };
  }
}

/**
 * Second login step: verify the TOTP (or a one-time backup code) using the
 * short-lived pending token issued after a correct password, then issue the
 * real session.
 */
export async function verifyTwoFactorLoginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const pendingToken = (formData.get("pendingToken") as string) ?? "";
  const code = (formData.get("code") as string)?.trim() ?? "";
  const redirectParam = (formData.get("redirect") as string) ?? "";

  if (!pendingToken) {
    return { error: "Your sign-in session expired. Please log in again." };
  }
  if (!code) {
    return { error: "Enter the 6-digit code.", twoFactorRequired: true, pendingToken };
  }

  const uid = await verifyPending2fa(pendingToken);
  if (!uid) {
    return { error: "Your sign-in session expired. Please log in again." };
  }

  let user2fa: DbUser | undefined;
  try {
    const [found] = await db.select().from(users).where(eq(users.id, uid));
    user2fa = found;
  } catch {
    return { error: "Service unavailable. Please try again later." };
  }

  if (!user2fa || !user2fa.isActive || !user2fa.twoFactorEnabled || !user2fa.twoFactorSecret) {
    return { error: "Could not verify 2FA. Please log in again." };
  }

  let ok = false;
  try {
    ok = verifyTotp(code, decryptSecret(user2fa.twoFactorSecret));
  } catch {
    ok = false;
  }

  // Fall back to a one-time backup code; consume it on success.
  if (!ok) {
    const consumed = consumeBackupCode(user2fa.twoFactorBackupCodes, code);
    if (consumed) {
      ok = true;
      try {
        await db
          .update(users)
          .set({ twoFactorBackupCodes: consumed.remainingJson })
          .where(eq(users.id, user2fa.id));
      } catch {
        // non-fatal
      }
    }
  }

  if (!ok) {
    return { error: "Incorrect code. Try again.", twoFactorRequired: true, pendingToken };
  }

  return establishSession(user2fa, redirectParam);
}
