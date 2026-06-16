import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, inviteCodes } from "@/db/schema";
import { sessions } from "@/db/schema/sessions";
import { eq, or, and } from "drizzle-orm";
import { signToken, getRedirectUrl } from "@/lib/auth";
import { assignSignupTrial, normalizePlan } from "@/lib/trial";
import { randomBytes } from "crypto";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kesararamwithdigital.tech";
  const loginUrl = `${baseUrl}/login`;
  const registerUrl = `${baseUrl}/register`;

  if (error) {
    return NextResponse.redirect(`${loginUrl}?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${loginUrl}?error=No+authorization+code+provided`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Google OAuth credentials are not configured.");
    return NextResponse.redirect(
      `${registerUrl}?error=${encodeURIComponent(
        "Google Sign-In is not configured on this server. Contact administrator."
      )}`
    );
  }

  try {
    // 1. Exchange authorization code for Google Tokens
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Google OAuth token exchange failed:", errText);
      return NextResponse.redirect(`${loginUrl}?error=Google+authentication+failed`);
    }

    const { access_token } = await tokenRes.json();

    // 2. Retrieve user information from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      console.error("Failed to fetch Google user profile:", await userRes.text());
      return NextResponse.redirect(`${loginUrl}?error=Failed+to+fetch+user+profile`);
    }

    const googleUser = await userRes.json();
    const { sub: googleId, email, name, picture } = googleUser;

    if (!googleId) {
      return NextResponse.redirect(
        `${loginUrl}?error=${encodeURIComponent("Google profile did not return a valid user ID.")}`
      );
    }

    if (!email) {
      return NextResponse.redirect(`${loginUrl}?error=Google+profile+did+not+return+an+email`);
    }

    // 3. Search for an existing user matching the googleId or email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.googleId, googleId), eq(users.email, email.toLowerCase())))
      .limit(1);

    if (existingUser) {
      // Returning user - Log them in cleanly (no invite code consumption needed)
      let updatePromise: Promise<any> | undefined;
      if (!existingUser.googleId) {
        updatePromise = db
          .update(users)
          .set({ googleId })
          .where(eq(users.id, existingUser.id))
          .catch((err) => {
            console.error("Failed to update googleId:", err);
          });
      }
      return await establishSessionAndRedirect(existingUser, req, updatePromise);
    }

    // New User! Register cleanly with Google details.
    // They will be gated on profile completion (/profile/student) to provide their invite code and school details before they can use the platform.
    // OAuth users never sign in with a password; store a strong random one.
    const randomPassword = hashPassword(randomBytes(32).toString("hex"));

    // Clean google username (e.g. janesmith + 3 numbers)
    const derivedUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(100 + Math.random() * 900);

    // Decode the OAuth state to learn the intended account type (set during
    // registration). Teachers can self-register via Google with a 7-day trial.
    let intent: {
      role?: string; plan?: string;
      schoolName?: string | null; province?: string | null;
    } = {};
    if (state && state !== "login") {
      try {
        intent = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
      } catch {
        intent = {};
      }
    }
    const desiredRole = intent.role === "teacher" ? "teacher" : "student";

    const [newUser] = await db
      .insert(users)
      .values({
        username: derivedUsername,
        email: email.toLowerCase(),
        displayName: name || derivedUsername,
        passwordHash: randomPassword,
        googleId,
        role: desiredRole,
        avatar: picture || null,
        schoolName: desiredRole === "teacher" ? (intent.schoolName || null) : null,
        province: desiredRole === "teacher" ? (intent.province || null) : null,
        isActive: true,
        loginAttempts: 0,
      })
      .returning();

    if (!newUser) {
      throw new Error("Failed to register new user in the database.");
    }

    // New teachers get a 7-day free trial (plan from state, default teacher_pro).
    let trialPromise: Promise<any> | undefined;
    if (desiredRole === "teacher" && newUser?.id) {
      trialPromise = assignSignupTrial(newUser.id, normalizePlan(intent.plan)).catch((err) => {
        console.error("Failed to assign signup trial:", err);
      });
    }

    return await establishSessionAndRedirect(newUser, req, trialPromise);

  } catch (err) {
    console.error("Google Authentication error:", err);
    if (err instanceof Error) {
      console.error(err.stack);
    }
    return NextResponse.redirect(
      `${loginUrl}?error=${encodeURIComponent("A server error occurred during authentication.")}`
    );
  }
}

async function establishSessionAndRedirect(user: any, req: NextRequest, extraDbPromise?: Promise<any>) {
  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.displayName ?? user.username,
    role: user.role,
    avatar: user.avatar ?? null,
  });

  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const promises: Promise<any>[] = [
    // Invalidate previous sessions
    db
      .update(sessions)
      .set({ isActive: false, logoutAt: new Date() })
      .where(and(eq(sessions.userId, user.id), eq(sessions.isActive, true)))
      .catch((err) => {
        console.error("Failed to invalidate old sessions:", err);
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
        console.error("Failed to insert session record:", err);
      }),
  ];

  if (extraDbPromise) {
    promises.push(extraDbPromise);
  }

  await Promise.all(promises);

  const redirectTo = getRedirectUrl(user.role);
  const response = NextResponse.redirect(new URL(redirectTo, req.url).toString());

  // Establish jwt cookie directly on the NextResponse object
  response.cookies.set("kwd_token", token, {
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

  return response;
}
