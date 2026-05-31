import { db } from "../../lib/db";
import { auditLogs, type NewAuditLog } from "../schema/audit";
import { eq, desc } from "drizzle-orm";

/**
 * Log an audit event
 */
export async function logAudit(data: {
    userId: number;
    action: string;
    targetType?: string;
    targetId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
}) {
    const auditEntry: NewAuditLog = {
        userId: data.userId,
        action: data.action,
        entityType: data.targetType || null,
        entityId: data.targetId ? parseInt(data.targetId) : null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        details: data.details ? JSON.stringify(data.details) : null,
    };

    const result = await db.insert(auditLogs).values(auditEntry).returning();
    return result[0];
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(userId: number, limit: number = 50) {
    return await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, userId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(
    entityType: string,
    entityId: number,
    limit: number = 50
) {
    return await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityType, entityType))
        .where(eq(auditLogs.entityId, entityId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
}

/**
 * Get all audit logs (admin only)
 */
export async function getAllAuditLogs(limit: number = 100) {
    return await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
}
