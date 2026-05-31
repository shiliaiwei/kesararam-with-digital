import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

const REWARD_ITEMS = [
  { id: 1, name: "Notebook", cost: 500 },
  { id: 2, name: "Pencil", cost: 100 },
  { id: 3, name: "Pen", cost: 150 },
  { id: 4, name: "Ruler", cost: 200 },
  { id: 5, name: "Eraser", cost: 80 },
  { id: 6, name: "Highlighter", cost: 250 },
  { id: 7, name: "Sticky Notes", cost: 300 },
  { id: 8, name: "Geometry Set", cost: 800 },
  { id: 9, name: "Study Planner", cost: 1200 },
];

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const itemToClaim = REWARD_ITEMS.find((r) => r.id === Number(itemId));
    if (!itemToClaim) {
      return NextResponse.json({ error: "Reward item not found" }, { status: 400 });
    }

    // 1. Fetch live user data to check points balance
    const [user] = await db
      .select({
        id: users.id,
        lifetimePoints: users.lifetimePoints,
        claimedRewards: users.claimedRewards,
      })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Parse current claims and calculate spent points
    let claims: Array<{ id: number; claimedAt: number }> = [];
    try {
      claims = JSON.parse(user.claimedRewards || "[]");
    } catch {
      claims = [];
    }

    let spentPoints = 0;
    claims.forEach((claim) => {
      const item = REWARD_ITEMS.find((r) => r.id === claim.id);
      if (item) {
        spentPoints += item.cost;
      }
    });

    const activePoints = user.lifetimePoints - spentPoints;

    // 3. Verify points sufficiency
    if (activePoints < itemToClaim.cost) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    // 4. Save new claim record
    claims.push({
      id: itemToClaim.id,
      claimedAt: Date.now(),
    });

    await db
      .update(users)
      .set({
        claimedRewards: JSON.stringify(claims),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      claimedRewards: claims,
      activePoints: activePoints - itemToClaim.cost,
    });
  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
