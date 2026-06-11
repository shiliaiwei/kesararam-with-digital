/**
 * GameKit access gate — single server-side source of truth for who may play
 * a game and whether their completion is recorded.
 *
 * Tiers:
 *  - guest:     anyone may play; recorded only if logged in
 *  - user:      anyone may play; recorded only if logged in (guests free, unrecorded)
 *  - class-pro: only a student enrolled in a class whose teacher has an active
 *               teacher_pro/school subscription may play (and record)
 */

import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { getUserActiveSubscription } from "@/db/queries/subscriptions";
import type { JWTPayload } from "@/lib/auth";
import type { AccessTier, AccessDecision } from "./types";

const LOCK_MSG = {
    needsLogin: {
        en: "Please sign in to play this game.",
        kh: "សូមចូលគណនីដើម្បីលេងហ្គេមនេះ។",
    },
    studentsOnly: {
        en: "This game is for students linked to a class.",
        kh: "ហ្គេមនេះសម្រាប់សិស្សដែលភ្ជាប់ជាមួយថ្នាក់រៀន។",
    },
    needsClass: {
        en: "Ask your teacher to add you to their class to unlock this game.",
        kh: "សូមស្នើគ្រូបន្ថែមអ្នកទៅក្នុងថ្នាក់ ដើម្បីដោះសោហ្គេមនេះ។",
    },
    needsTeacherPro: {
        en: "This game unlocks when your teacher has a Pro subscription.",
        kh: "ហ្គេមនេះដោះសោ នៅពេលគ្រូរបស់អ្នកមានការជាវ Pro។",
    },
} as const;

/**
 * Find an active class enrollment for a student and return the owning teacherId.
 * Returns null if the student is not enrolled in any active class.
 */
export async function getActiveEnrollmentWithTeacher(
    studentId: number
): Promise<{ classId: number; teacherId: number } | null> {
    const rows = await db
        .select({ classId: classes.id, teacherId: classes.teacherId })
        .from(classEnrollments)
        .innerJoin(classes, eq(classEnrollments.classId, classes.id))
        .where(
            and(
                eq(classEnrollments.studentId, studentId),
                eq(classes.status, "active")
            )
        )
        .limit(1);
    return rows[0] ?? null;
}

/** True iff the teacher has an active teacher_pro or school subscription. */
export async function teacherHasActivePro(teacherId: number): Promise<boolean> {
    const sub = await getUserActiveSubscription(teacherId);
    if (!sub) return false;
    return sub.plan === "teacher_pro" || sub.plan === "school";
}

/**
 * Resolve access for a game tier given the current session.
 * Server-authoritative: never trust client-supplied role/subscription flags.
 */
export async function resolveAccess(
    tier: AccessTier,
    session: JWTPayload | null
): Promise<AccessDecision> {
    switch (tier) {
        case "guest":
            // Anyone may play; recorded only if logged in.
            return { allowed: true, willRecord: !!session };

        case "user":
            return session
                ? { allowed: true, willRecord: true }
                : {
                    allowed: true,
                    willRecord: false,
                    reason: "guest_ok_no_record",
                };

        case "class-pro": {
            if (!session) {
                return {
                    allowed: false,
                    willRecord: false,
                    reason: "needs_login",
                    message: LOCK_MSG.needsLogin,
                };
            }
            if (session.role !== "student") {
                return {
                    allowed: false,
                    willRecord: false,
                    reason: "needs_class",
                    message: LOCK_MSG.studentsOnly,
                };
            }
            const enrollment = await getActiveEnrollmentWithTeacher(session.id);
            if (!enrollment) {
                return {
                    allowed: false,
                    willRecord: false,
                    reason: "needs_class",
                    message: LOCK_MSG.needsClass,
                };
            }
            const pro = await teacherHasActivePro(enrollment.teacherId);
            if (!pro) {
                return {
                    allowed: false,
                    willRecord: false,
                    reason: "needs_teacher_pro",
                    message: LOCK_MSG.needsTeacherPro,
                };
            }
            return { allowed: true, willRecord: true };
        }
    }
}
