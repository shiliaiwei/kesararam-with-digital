import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

/** PATCH /api/admin/questions/[id]/status — quick status update */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.id || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const questionId = parseInt(id);
        const { status } = await request.json();

        const allowed = ["draft", "pending", "approved", "published", "rejected"];
        if (!allowed.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await sql`UPDATE questions SET status = ${status} WHERE id = ${questionId}`;

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error("[PATCH /api/admin/questions/[id]/status]", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
