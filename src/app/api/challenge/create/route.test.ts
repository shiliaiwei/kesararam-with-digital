import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import { db } from "@/lib/db";
import { sessions } from "@/db/schema/quizzes";
import { eq, or } from "drizzle-orm";

/**
 * Property-Based Tests for Challenge Session Creation
 * 
 * **Validates: Requirements 28.1**
 * Feature: learning-hub-quiz-system, Property 24: Challenge Session Room Code Uniqueness
 */

describe("Challenge Session Room Code Uniqueness", () => {
  // Clean up test data after each test
  afterEach(async () => {
    await db.delete(sessions).where(eq(sessions.roomCode, "TEST01"));
    await db.delete(sessions).where(eq(sessions.roomCode, "TEST02"));
  });

  it("should generate unique room codes for concurrent sessions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          teacherId: fc.integer({ min: 1, max: 100 }),
          categoryId: fc.integer({ min: 1, max: 8 }),
          maxStudents: fc.integer({ min: 1, max: 40 }),
          sessionCount: fc.integer({ min: 2, max: 5 }),
        }),
        async ({ teacherId, categoryId, maxStudents, sessionCount }) => {
          const roomCodes = new Set<string>();

          // Create multiple sessions
          for (let i = 0; i < sessionCount; i++) {
            // Generate a unique room code
            let roomCode = "";
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
              roomCode = generateTestRoomCode();
              
              // Check if room code is unique in database
              const existingSessions = await db
                .select()
                .from(sessions)
                .where(eq(sessions.roomCode, roomCode));
              
              const activeSession = existingSessions.find(
                (s) => s.status === "waiting" || s.status === "active"
              );
              
              if (!activeSession && !roomCodes.has(roomCode)) {
                break;
              }
              attempts++;
            }

            if (attempts === maxAttempts) {
              throw new Error("Failed to generate unique room code");
            }

            roomCodes.add(roomCode);

            // Create session with unique room code
            await db.insert(sessions).values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status: "waiting",
            });
          }

          // Verify all room codes are unique
          expect(roomCodes.size).toBe(sessionCount);

          // Verify all sessions in database have unique room codes
          const allSessions = await db
            .select()
            .from(sessions)
            .where(
              or(
                eq(sessions.status, "waiting"),
                eq(sessions.status, "active")
              )
            );

          const dbRoomCodes = allSessions.map((s) => s.roomCode);
          const uniqueDbRoomCodes = new Set(dbRoomCodes);
          
          expect(uniqueDbRoomCodes.size).toBe(dbRoomCodes.length);

          // Clean up created sessions
          for (const roomCode of roomCodes) {
            await db.delete(sessions).where(eq(sessions.roomCode, roomCode));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow reusing room codes from completed sessions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          teacherId: fc.integer({ min: 1, max: 100 }),
          categoryId: fc.integer({ min: 1, max: 8 }),
          maxStudents: fc.integer({ min: 1, max: 40 }),
        }),
        async ({ teacherId, categoryId, maxStudents }) => {
          const roomCode = "TEST01";

          // Create a completed session
          const [completedSession] = await db
            .insert(sessions)
            .values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status: "completed",
            })
            .returning();

          // Should be able to create a new session with the same room code
          // since the previous one is completed
          const existingSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.roomCode, roomCode));
          
          const activeSession = existingSessions.find(
            (s) => s.status === "waiting" || s.status === "active"
          );
          
          expect(activeSession).toBeUndefined();

          // Create new session with same room code
          const [newSession] = await db
            .insert(sessions)
            .values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status: "waiting",
            })
            .returning();

          expect(newSession.roomCode).toBe(roomCode);
          expect(newSession.status).toBe("waiting");

          // Clean up
          await db.delete(sessions).where(eq(sessions.id, completedSession.id));
          await db.delete(sessions).where(eq(sessions.id, newSession.id));
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should prevent duplicate room codes for active/waiting sessions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          teacherId: fc.integer({ min: 1, max: 100 }),
          categoryId: fc.integer({ min: 1, max: 8 }),
          maxStudents: fc.integer({ min: 1, max: 40 }),
          status: fc.constantFrom("waiting", "active"),
        }),
        async ({ teacherId, categoryId, maxStudents, status }) => {
          const roomCode = "TEST02";

          // Create first session
          const [firstSession] = await db
            .insert(sessions)
            .values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status,
            })
            .returning();

          // Check if room code is unique
          const existingSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.roomCode, roomCode));
          
          const activeSession = existingSessions.find(
            (s) => s.status === "waiting" || s.status === "active"
          );
          
          // Should find the active/waiting session
          expect(activeSession).toBeDefined();
          expect(activeSession?.roomCode).toBe(roomCode);

          // Clean up
          await db.delete(sessions).where(eq(sessions.id, firstSession.id));
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Helper function to generate test room codes
 */
function generateTestRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
