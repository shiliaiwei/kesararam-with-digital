import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { pointsLedger } from "@/db/schema/content";
import { eq, and, sql } from "drizzle-orm";
import { REWARD_ITEMS, getRewardItem } from "@/lib/rewards";

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

    const itemToClaim = getRewardItem(Number(itemId));
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

    // 3. Sum points from ledger where source="live"
    const [livePointsRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)::integer` })
      .from(pointsLedger)
      .where(
        and(
          eq(pointsLedger.userId, session.id),
          eq(pointsLedger.source, "live")
        )
      );
    const totalLivePoints = livePointsRow?.total ?? 0;

    const activePoints = totalLivePoints - spentPoints;

    // 4. Verify points sufficiency
    if (activePoints < itemToClaim.cost) {
      return NextResponse.json({ error: "Insufficient live points" }, { status: 400 });
    }

    // 5. Save new claim record
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
      totalLivePoints,
      lifetimePoints: user.lifetimePoints,
    });
  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
