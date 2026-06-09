import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { verifyTotp, consumeBackupCode } from "@/lib/twofa";
import { decryptSecret } from "@/lib/twofa-crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/2fa/disable  { code }
 * Turns 2FA off. Requires a valid current TOTP code (or a backup code) so a
 * hijacked session alone can't strip the second factor.
 */
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { code } = await req.json().catch(() => ({}));
    if (!code) {
        return NextResponse.json({ error: "A code is required to disable 2FA." }, { status: 400 });
    }

    const [user] = await db
        .select({
            id: users.id,
            secret: users.twoFactorSecret,
            enabled: users.twoFactorEnabled,
            backup: users.twoFactorBackupCodes,
        })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

    if (!user || !user.enabled || !user.secret) {
        return NextResponse.json({ error: "2FA is not enabled." }, { status: 400 });
    }

    let ok = false;
    try {
        ok = verifyTotp(String(code), decryptSecret(user.secret));
    } catch {
        ok = false;
    }
    if (!ok && consumeBackupCode(user.backup, String(code))) ok = true;

    if (!ok) {
        return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
    }

    await db
        .update(users)
        .set({
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: null,
            twoFactorEnrolledAt: null,
        })
        .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
}
