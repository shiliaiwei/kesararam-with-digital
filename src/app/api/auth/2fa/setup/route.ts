import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { generateTotpSecret, otpauthUrl } from "@/lib/twofa";
import { encryptSecret } from "@/lib/twofa-crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/2fa/setup
 * Begins enrollment: generates a fresh TOTP secret, stores it encrypted
 * (NOT yet enabled), and returns the otpauth:// URL + base32 secret so the
 * client can render a QR code for an authenticator app (Google/Ente/etc.).
 */
export async function POST() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [user] = await db
        .select({ id: users.id, email: users.email, username: users.username, enabled: users.twoFactorEnabled })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.enabled) {
        return NextResponse.json({ error: "2FA is already enabled. Disable it first to re-enroll." }, { status: 400 });
    }

    const secret = generateTotpSecret();
    const account = user.email || user.username;
    const url = otpauthUrl(account, secret);

    // Store the encrypted secret now; it only becomes active after /enable verifies a code.
    await db
        .update(users)
        .set({ twoFactorSecret: encryptSecret(secret), twoFactorEnabled: false })
        .where(eq(users.id, user.id));

    return NextResponse.json({ otpauthUrl: url, secret, account });
}
