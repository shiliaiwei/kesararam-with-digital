import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, inviteCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const trimmedCode = code.trim();
    let targetClassId: number | null = null;
    let isInviteCodeTableMatch = false;

    // 1. Try to find in invite_codes first
    const [inviteCodeRecord] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.code, trimmedCode))
      .limit(1);

    if (inviteCodeRecord) {
      if (inviteCodeRecord.isUsed) {
        return NextResponse.json({ error: "This invitation code has already been used. / លេខកូដអញ្ជើញនេះត្រូវបានប្រើប្រាស់រួចហើយ។" }, { status: 400 });
      }
      isInviteCodeTableMatch = true;

      if (inviteCodeRecord.classId) {
        targetClassId = inviteCodeRecord.classId;
      } else {
        // Fallback: find the teacher's first class
        const [firstClass] = await db
          .select()
          .from(classes)
          .where(eq(classes.teacherId, inviteCodeRecord.teacherId))
          .limit(1);
        if (firstClass) {
          targetClassId = firstClass.id;
        }
      }
    } else {
      // 2. Fallback: try classes.code directly
      const [classRecord] = await db
        .select()
        .from(classes)
        .where(eq(classes.code, trimmedCode))
        .limit(1);

      if (classRecord) {
        targetClassId = classRecord.id;
      }
    }

    if (!targetClassId) {
      return NextResponse.json({ error: "Invalid invitation code or class code. / លេខកូដអញ្ជើញ ឬកូដថ្នាក់រៀនមិនត្រឹមត្រូវឡើយ។" }, { status: 400 });
    }

    // Fetch class details
    const [classDetails] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, targetClassId))
      .limit(1);

    if (!classDetails) {
      return NextResponse.json({ error: "Class not found / រកមិនឃើញថ្នាក់រៀន" }, { status: 404 });
    }

    if (classDetails.status === "locked") {
      return NextResponse.json({ error: "This class is locked. New students cannot join. / ថ្នាក់រៀននេះត្រូវបានចាក់សោ។ សិស្សថ្មីមិនអាចចូលរួមបានទេ។" }, { status: 400 });
    }

    if (classDetails.status === "archived") {
      return NextResponse.json({ error: "This class has been archived. / ថ្នាក់រៀននេះត្រូវបានរក្សាទុកក្នុងប័ណ្ណសារហើយ។" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      classInfo: {
        className: classDetails.name,
        schoolName: classDetails.schoolName,
        province: classDetails.province,
        gradeLevel: classDetails.gradeLevel,
        section: classDetails.section,
      }
    });

  } catch (error: any) {
    console.error("Error looking up invite code:", error);
    return NextResponse.json({ error: "Lookup failed / ការស្វែងរកបានបរាជ័យ" }, { status: 500 });
  }
}
