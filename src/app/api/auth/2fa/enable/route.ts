import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { verifyTotp, generateBackupCodes, serializeBackupCodes } from "@/lib/twofa";
import { decryptSecret } from "@/lib/twofa-crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/2fa/enable  { code }
 * Confirms enrollment: verifies a 6-digit code against the pending secret.
 * On success, enables 2FA, generates one-time backup codes (returned ONCE),
 * and stores only their hashes.
 */
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { code } = await req.json().catch(() => ({}));
    if (!code) {
        return NextResponse.json({ error: "A 6-digit code is required." }, { status: 400 });
    }

    const [user] = await db
        .select({ id: users.id, secret: users.twoFactorSecret, enabled: users.twoFactorEnabled })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

    if (!user || !user.secret) {
        return NextResponse.json({ error: "No pending 2FA setup. Start setup first." }, { status: 400 });
    }
    if (user.enabled) {
        return NextResponse.json({ error: "2FA is already enabled." }, { status: 400 });
    }

    let secret: string;
    try {
        secret = decryptSecret(user.secret);
    } catch {
        return NextResponse.json({ error: "Setup is corrupted. Please restart setup." }, { status: 400 });
    }

    if (!verifyTotp(String(code), secret)) {
        return NextResponse.json({ error: "Incorrect code. Check your authenticator app and try again." }, { status: 400 });
    }

    const { plain, hashes } = generateBackupCodes(8);

    await db
        .update(users)
        .set({
            twoFactorEnabled: true,
            twoFactorBackupCodes: serializeBackupCodes(hashes),
            twoFactorEnrolledAt: new Date(),
        })
        .where(eq(users.id, user.id));

    // Backup codes are shown exactly once.
    return NextResponse.json({ success: true, backupCodes: plain });
}
