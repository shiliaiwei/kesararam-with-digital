import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/reset-2fa  { userId }
 *
 * Admin-only recovery for a user who lost their authenticator app AND their
 * backup codes. Clears all 2FA fields so the account falls back to
 * password-only login; the user can then re-enrol from Settings → Security.
 *
 * No TOTP code is required here (unlike the self-service /api/auth/2fa/disable)
 * because the acting party is an authenticated admin, not the locked-out user.
 */
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json().catch(() => ({}));
    const id = Number(userId);
    if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: "A valid userId is required." }, { status: 400 });
    }

    const [target] = await db
        .select({ id: users.id, username: users.username, enabled: users.twoFactorEnabled })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (!target) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await db
        .update(users)
        .set({
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: null,
            twoFactorEnrolledAt: null,
        })
        .where(eq(users.id, id));

    console.warn(
        `[2FA RESET] admin "${session.name}" (#${session.id}) reset 2FA for user "${target.username}" (#${id}, was ${target.enabled ? "enabled" : "disabled"})`,
    );

    return NextResponse.json({ success: true, username: target.username });
}
