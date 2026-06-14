import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rewardClaims } from "@/db/schema/content";
import { eq, and, inArray, desc } from "drizzle-orm";
import { getRewardItem } from "@/lib/rewards";
import {
  resolveStudentClass,
  getClaimBalance,
  CLAIM_HELD_STATUSES,
} from "@/lib/claims";

/**
 * POST /api/user/claim — a student claims a reward item.
 *
 * Creates a PENDING reward_claims row routed to the teacher of the student's
 * class. The teacher accepts (→ prepares to hand over) or rejects (→ refund).
 * Points are spent live: pending/accepted/fulfilled all hold the cost; only a
 * rejection frees it again (see src/lib/claims.ts).
 *
 * Guards: must be a logged-in student, must belong to a class, must have enough
 * available live points, and may not have an in-flight (pending/accepted) claim
 * for the same item.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "student") {
    return NextResponse.json(
      { error: "Only students can claim rewards." },
      { status: 403 }
    );
  }

  try {
    const { itemId, note } = await req.json();
    const item = getRewardItem(Number(itemId));
    if (!item) {
      return NextResponse.json({ error: "Reward item not found" }, { status: 400 });
    }

    // 1. The claim must route to a teacher — student must be in a class.
    const klass = await resolveStudentClass(session.id);
    if (!klass) {
      return NextResponse.json(
        {
          error: "no_class",
          message:
            "Join a class first — reward claims are handed over by your teacher in class.",
        },
        { status: 422 }
      );
    }

    // 2. Block a duplicate in-flight claim for the same item.
    const [active] = await db
      .select({ id: rewardClaims.id })
      .from(rewardClaims)
      .where(
        and(
          eq(rewardClaims.studentId, session.id),
          eq(rewardClaims.itemId, item.id),
          inArray(rewardClaims.status, ["pending", "accepted"])
        )
      )
      .limit(1);
    if (active) {
      return NextResponse.json(
        {
          error: "already_pending",
          message: `You already have a pending "${item.name}" claim with your teacher.`,
        },
        { status: 409 }
      );
    }

    // 3. Check the available (live − spent) balance.
    const balance = await getClaimBalance(session.id);
    if (balance.available < item.cost) {
      return NextResponse.json(
        {
          error: "insufficient_points",
          message: "Not enough live points yet — keep playing live class games!",
          available: balance.available,
          cost: item.cost,
        },
        { status: 400 }
      );
    }

    // 4. Create the pending claim.
    const [claim] = await db
      .insert(rewardClaims)
      .values({
        studentId: session.id,
        classId: klass.classId,
        teacherId: klass.teacherId,
        itemId: item.id,
        itemName: item.name,
        cost: item.cost,
        status: "pending",
        studentNote: typeof note === "string" ? note.slice(0, 280) : null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      claim,
      // available balance AFTER this claim is held
      activePoints: balance.available - item.cost,
      live: balance.live,
    });
  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/user/claim — the logged-in student's claims + their claimable balance.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [claims, balance] = await Promise.all([
    db
      .select()
      .from(rewardClaims)
      .where(eq(rewardClaims.studentId, session.id))
      .orderBy(desc(rewardClaims.createdAt)),
    getClaimBalance(session.id),
  ]);

  return NextResponse.json({ claims, balance, heldStatuses: CLAIM_HELD_STATUSES });
}
