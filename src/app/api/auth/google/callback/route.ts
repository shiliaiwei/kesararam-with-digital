import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, inviteCodes } from "@/db/schema";
import { sessions } from "@/db/schema/sessions";
import { eq, or, and } from "drizzle-orm";
import { signToken, getRedirectUrl } from "@/lib/auth";
import { cookies } from "next/headers";
import { createHash } from "crypto";

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
      if (!existingUser.googleId) {
        await db
          .update(users)
          .set({ googleId })
          .where(eq(users.id, existingUser.id));
      }
      return await establishSessionAndRedirect(existingUser, req);
    }

    // New User! Registration requires a valid, unused teacher invite code.
    // Deserialize form fields passed securely through Google's state parameter
    let inviteCode = "";
    let schoolName = null;
    let province = null;
    let gradeLevel = null;
    let section = null;

    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
        inviteCode = decodedState.code || "";
        schoolName = decodedState.schoolName || null;
        province = decodedState.province || null;
        gradeLevel = decodedState.gradeLevel || null;
        section = decodedState.section || null;
      } catch (e) {
        // Fallback for raw invitation codes
        inviteCode = state;
      }
    }

    if (!inviteCode) {
      return NextResponse.redirect(
        `${registerUrl}?error=${encodeURIComponent(
          "An invitation code is required to register with Google."
        )}`
      );
    }

    // 4. Validate invitation code in database
    const [codeRecord] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.code, inviteCode.trim()))
      .limit(1);

    if (!codeRecord) {
      return NextResponse.redirect(
        `${registerUrl}?error=${encodeURIComponent("Invalid invitation code.")}`
      );
    }

    if (codeRecord.isUsed) {
      return NextResponse.redirect(
        `${registerUrl}?error=${encodeURIComponent(
          "This invitation code has already been used."
        )}`
      );
    }

    // 5. Create new student user inside database transaction & consume code
    const randomPassword = createHash("sha256")
      .update(Math.random().toString() + Date.now().toString())
      .digest("hex");

    // Clean google username (e.g. janesmith + 3 numbers)
    const derivedUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(100 + Math.random() * 900);

    const newUser = await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          username: derivedUsername,
          email: email.toLowerCase(),
          displayName: name || derivedUsername,
          passwordHash: randomPassword,
          googleId,
          role: "student",
          avatar: picture || null,
          schoolName,
          province,
          gradeLevel,
          section,
          isActive: true,
          loginAttempts: 0,
        })
        .returning();

      // Mark invite code as used
      await tx
        .update(inviteCodes)
        .set({
          isUsed: true,
          usedById: insertedUser.id,
          usedAt: new Date(),
        })
        .where(eq(inviteCodes.id, codeRecord.id));

      return insertedUser;
    });

    return await establishSessionAndRedirect(newUser, req);

  } catch (err) {
    console.error("Google Authentication error:", err);
    return NextResponse.redirect(
      `${loginUrl}?error=${encodeURIComponent("A server error occurred during authentication.")}`
    );
  }
}

async function establishSessionAndRedirect(user: any, req: NextRequest) {
  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.displayName ?? user.username,
    role: user.role,
    avatar: user.avatar ?? null,
  });

  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  // Invalidate previous sessions
  try {
    await db
      .update(sessions)
      .set({ isActive: false, logoutAt: new Date() })
      .where(and(eq(sessions.userId, user.id), eq(sessions.isActive, true)));
  } catch (err) {
    console.error("Failed to invalidate old sessions:", err);
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
    console.error("Failed to insert session record:", err);
  }

  // Establish jwt cookie
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

  const redirectTo = getRedirectUrl(user.role);
  return NextResponse.redirect(new URL(redirectTo, req.url).origin + redirectTo);
}
