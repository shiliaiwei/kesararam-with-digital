import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** GET /api/auth/2fa/status — whether the current user has 2FA enabled. */
export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const [user] = await db
        .select({ enabled: users.twoFactorEnabled, enrolledAt: users.twoFactorEnrolledAt })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ enabled: user.enabled, enrolledAt: user.enrolledAt });
}
