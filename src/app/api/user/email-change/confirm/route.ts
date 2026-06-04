import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

// Shared OTP store — import from request handler via module-level Map.
// Because Next.js hot-reloads can break module identity in dev, we attach it
// to the global object so both route files share the same Map instance.
declare global {
  // eslint-disable-next-line no-var
  var __kwdEmailOtpStore: Map<number, { code: string; newEmail: string; expiresAt: number; attempts: number }> | undefined;
}
if (!global.__kwdEmailOtpStore) {
  global.__kwdEmailOtpStore = new Map();
}
const otpStore = global.__kwdEmailOtpStore;

const MAX_ATTEMPTS = 3;

// POST /api/user/email-change/confirm
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code: string = (body.code ?? "").trim();

  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter a valid 6-digit code." }, { status: 400 });
  }

  const record = otpStore.get(session.id);

  if (!record) {
    return NextResponse.json({ error: "No pending email change. Please request a new code." }, { status: 400 });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(session.id);
    return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
  }

  record.attempts++;

  if (record.attempts > MAX_ATTEMPTS) {
    otpStore.delete(session.id);
    return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 400 });
  }

  if (record.code !== code) {
    const left = MAX_ATTEMPTS - record.attempts;
    return NextResponse.json({
      error: `Incorrect code. ${left} attempt${left !== 1 ? "s" : ""} remaining.`,
    }, { status: 400 });
  }

  // Code is correct — update email
  const newEmail = record.newEmail;
  otpStore.delete(session.id);

  // Final uniqueness check (race-condition guard)
  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, newEmail))
    .limit(1);

  if (taken && taken.id !== session.id) {
    return NextResponse.json({ error: "This email was registered by another account." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ email: newEmail, updatedAt: new Date() })
    .where(eq(users.id, session.id));

  return NextResponse.json({ success: true, email: newEmail });
}
