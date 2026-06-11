import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/password  { currentPassword, newPassword }
 *
 * Self-service password change for ANY signed-in user (students included).
 * Requires the current password, so a hijacked session alone can't lock the
 * real owner out. This is NOT "forgot password" — a user who lost their
 * password still needs a teacher/admin reset.
 */
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json().catch(() => ({}));

    if (!currentPassword || !newPassword) {
        return NextResponse.json(
            { error: "Current and new password are both required." },
            { status: 400 },
        );
    }
    if (String(newPassword).length < 8) {
        return NextResponse.json(
            { error: "New password must be at least 8 characters." },
            { status: 400 },
        );
    }
    if (String(currentPassword) === String(newPassword)) {
        return NextResponse.json(
            { error: "New password must be different from the current one." },
            { status: 400 },
        );
    }

    const [user] = await db
        .select({ id: users.id, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

    if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Constant-time check of the current password (supports legacy hashes).
    const { valid } = verifyPassword(String(currentPassword), user.passwordHash);
    if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    await db
        .update(users)
        .set({ passwordHash: hashPassword(String(newPassword)), updatedAt: new Date() })
        .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
}
