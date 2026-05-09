/**
 * Admin: update or revoke a specific subscription.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

// PATCH /api/admin/subscriptions/[id] — update status, note, endsAt
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const subId = parseInt(id);
  if (isNaN(subId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { status, note, endsAt } = body;

  const [updated] = await db
    .update(subscriptions)
    .set({
      ...(status && { status }),
      ...(note !== undefined && { note }),
      ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ subscription: updated });
}

// DELETE /api/admin/subscriptions/[id] — revoke (set cancelled)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const subId = parseInt(id);
  if (isNaN(subId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await db
    .update(subscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscriptions.id, subId));

  return NextResponse.json({ success: true });
}
