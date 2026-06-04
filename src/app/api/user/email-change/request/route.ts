import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { randomInt } from "crypto";

// ── In-memory OTP store (global so confirm route shares same Map) ─────────────
declare global {
  // eslint-disable-next-line no-var
  var __kwdEmailOtpStore: Map<number, { code: string; newEmail: string; expiresAt: number; attempts: number }> | undefined;
}
if (!global.__kwdEmailOtpStore) global.__kwdEmailOtpStore = new Map();
const otpStore = global.__kwdEmailOtpStore;

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;

// POST /api/user/email-change/request
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const newEmail: string = (body.newEmail ?? "").trim().toLowerCase();

  if (!newEmail || !newEmail.includes("@") || !newEmail.includes(".")) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // Make sure current email exists
  const [currentUser] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  if (!currentUser) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (currentUser.email === newEmail) {
    return NextResponse.json({ error: "New email is the same as the current email." }, { status: 400 });
  }

  // Check the new email is not taken
  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, newEmail))
    .limit(1);
  if (taken) return NextResponse.json({ error: "This email is already registered." }, { status: 400 });

  // Generate 6-digit OTP
  const code = randomInt(100000, 999999).toString();
  otpStore.set(session.id, { code, newEmail, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

  // ── Email send placeholder ──────────────────────────────────────────────────
  // In production, replace this with your email provider (Resend, SendGrid, etc.)
  // Example with Resend:
  //   await resend.emails.send({
  //     from: "noreply@kesararamwithdigital.tech",
  //     to: currentUser.email,
  //     subject: "KWD — Email Change Verification",
  //     html: `<p>Your verification code is <strong>${code}</strong>. Expires in 10 minutes.</p>`,
  //   });
  console.log(`[email-change] OTP for user ${session.id} → ${code} (to: ${currentUser.email})`);

  // Mask current email for display: ke*****@gmail.com
  const [local, domain] = currentUser.email.split("@");
  const masked = `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;

  return NextResponse.json({ sent: true, maskedCurrent: masked });
}
