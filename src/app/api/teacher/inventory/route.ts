import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "teacher" && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [user] = await db
    .select({ claimedRewards: users.claimedRewards })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  let inventory = [];
  if (user && user.claimedRewards) {
    try {
      inventory = JSON.parse(user.claimedRewards);
    } catch {
      inventory = [];
    }
  }

  return NextResponse.json({ inventory });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "teacher" && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { inventory } = await req.json();
    if (!Array.isArray(inventory)) {
      return NextResponse.json({ error: "Inventory must be an array" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ claimedRewards: JSON.stringify(inventory) })
      .where(eq(users.id, session.id));

    return NextResponse.json({ success: true, inventory });
  } catch (error) {
    console.error("Error saving teacher inventory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
