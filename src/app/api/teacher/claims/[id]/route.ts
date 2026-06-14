import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rewardClaims } from "@/db/schema/content";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/teacher/claims/[id] — the teacher decides on a claim.
 *
 * Body: { action: "accept" | "reject" | "fulfill", note?: string }
 *   accept   pending  → accepted   (teacher will prepare the item)
 *   reject   pending|accepted → rejected   (cost refunded automatically)
 *   fulfill  accepted → fulfilled  (item handed to the student — closed)
 *
 * Only the teacher the claim is routed to (or an admin) may decide it.
 */
const TRANSITIONS: Record<string, { from: string[]; to: string }> = {
  accept: { from: ["pending"], to: "accepted" },
  reject: { from: ["pending", "accepted"], to: "rejected" },
  fulfill: { from: ["accepted"], to: "fulfilled" },
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "teacher" && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const claimId = Number(id);
  if (!Number.isInteger(claimId)) {
    return NextResponse.json({ error: "Invalid claim id" }, { status: 400 });
  }

  const { action, note } = await req.json();
  const transition = TRANSITIONS[action as string];
  if (!transition) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const [claim] = await db
    .select()
    .from(rewardClaims)
    .where(eq(rewardClaims.id, claimId))
    .limit(1);
  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  // Ownership: teachers may only act on claims routed to them.
  if (session.role !== "admin" && claim.teacherId !== session.id) {
    return NextResponse.json({ error: "Not your class's claim" }, { status: 403 });
  }

  if (!transition.from.includes(claim.status)) {
    return NextResponse.json(
      { error: `Cannot ${action} a claim that is "${claim.status}".` },
      { status: 409 }
    );
  }

  const now = new Date();
  const [updated] = await db
    .update(rewardClaims)
    .set({
      status: transition.to,
      decidedAt: now,
      decidedBy: session.id,
      fulfilledAt: transition.to === "fulfilled" ? now : claim.fulfilledAt,
      teacherNote: typeof note === "string" ? note.slice(0, 280) : claim.teacherNote,
    })
    .where(eq(rewardClaims.id, claimId))
    .returning();

  return NextResponse.json({ success: true, claim: updated });
}
