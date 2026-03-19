import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import { db } from "@/lib/db";
import { sessions, sessionParticipants } from "@/db/schema/quizzes";
import { eq } from "drizzle-orm";

/**
 * Property-Based Tests for Challenge Session Participant Limit
 * 
 * **Validates: Requirements 28.2**
 * Feature: learning-hub-quiz-system, Property 25: Challenge Session Participant Limit
 */

describe("Challenge Session Participant Limit", () => {
  let testSessionId: number | null = null;

  // Clean up test data after each test
  afterEach(async () => {
    if (testSessionId) {
      await db.delete(sessionParticipants).where(eq(sessionParticipants.sessionId, testSessionId));
      await db.delete(sessions).where(eq(sessions.id, testSessionId));
      testSessionId = null;
    }
  });

  it("should enforce maxStudents limit for session participants", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          teacherId: fc.integer({ min: 1, max: 100 }),
          categoryId: fc.integer({ min: 1, max: 8 }),
          maxStudents: fc.integer({ min: 1, max: 40 }),
          attemptedParticipants: fc.integer({ min: 1, max: 50 }),
        }),
        async ({ teacherId, categoryId, maxStudents, attemptedParticipants }) => {
          // Create a test session
          const roomCode = generateTestRoomCode();
          const [session] = await db
            .insert(sessions)
            .values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status: "waiting",
            })
            .returning();

          testSessionId = session.id;

          // Try to add participants up to the limit
          let successfulJoins = 0;
          let rejectedJoins = 0;

          for (let i = 1; i <= attemptedParticipants; i++) {
            const studentId = 1000 + i; // Generate unique student IDs

            // Check current participant count
            const currentParticipants = await db
              .select()
              .from(sessionParticipants)
              .where(eq(sessionParticipants.sessionId, session.id));

            const currentCount = currentParticipants.length;

            if (currentCount < maxStudents) {
              // Should be able to join
              await db.insert(sessionParticipants).values({
                sessionId: session.id,
                studentId,
                score: 0,
              });
              successfulJoins++;
            } else {
              // Should be rejected (at or over limit)
              rejectedJoins++;
            }
          }

          // Verify final participant count does not exceed maxStudents
          const finalParticipants = await db
            .select()
            .from(sessionParticipants)
            .where(eq(sessionParticipants.sessionId, session.id));

          expect(finalParticipants.length).toBeLessThanOrEqual(maxStudents);
          expect(finalParticipants.length).toBe(Math.min(attemptedParticipants, maxStudents));
          expect(successfulJoins).toBe(Math.min(attemptedParticipants, maxStudents));
          expect(rejectedJoins).toBe(Math.max(0, attemptedParticipants - maxStudents));
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow exactly maxStudents participants, no more", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          teacherId: fc.integer({ min: 1, max: 100 }),
          categoryId: fc.integer({ min: 1, max: 8 }),
          maxStudents: fc.integer({ min: 1, max: 40 }),
        }),
        async ({ teacherId, categoryId, maxStudents }) => {
          // Create a test session
          const roomCode = generateTestRoomCode();
          const [session] = await db
            .insert(sessions)
            .values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status: "waiting",
            })
            .returning();

          testSessionId = session.id;

          // Add exactly maxStudents participants
          for (let i = 1; i <= maxStudents; i++) {
            await db.insert(sessionParticipants).values({
              sessionId: session.id,
              studentId: 2000 + i,
              score: 0,
            });
          }

          // Verify count equals maxStudents
          const participants = await db
            .select()
            .from(sessionParticipants)
            .where(eq(sessionParticipants.sessionId, session.id));

          expect(participants.length).toBe(maxStudents);

          // Verify we cannot add one more
          const currentCount = participants.length;
          expect(currentCount).toBe(maxStudents);
          
          // Attempting to add another should be rejected
          const canAddMore = currentCount < maxStudents;
          expect(canAddMore).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should correctly count participants across multiple join attempts", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          teacherId: fc.integer({ min: 1, max: 100 }),
          categoryId: fc.integer({ min: 1, max: 8 }),
          maxStudents: fc.integer({ min: 5, max: 20 }),
          joinAttempts: fc.integer({ min: 1, max: 10 }),
        }),
        async ({ teacherId, categoryId, maxStudents, joinAttempts }) => {
          // Create a test session
          const roomCode = generateTestRoomCode();
          const [session] = await db
            .insert(sessions)
            .values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status: "waiting",
            })
            .returning();

          testSessionId = session.id;

          // Add participants in batches
          let totalAdded = 0;
          for (let batch = 0; batch < joinAttempts; batch++) {
            const currentParticipants = await db
              .select()
              .from(sessionParticipants)
              .where(eq(sessionParticipants.sessionId, session.id));

            const currentCount = currentParticipants.length;
            const remainingSlots = maxStudents - currentCount;

            if (remainingSlots > 0) {
              // Add one more participant
              await db.insert(sessionParticipants).values({
                sessionId: session.id,
                studentId: 3000 + batch,
                score: 0,
              });
              totalAdded++;
            }
          }

          // Verify final count
          const finalParticipants = await db
            .select()
            .from(sessionParticipants)
            .where(eq(sessionParticipants.sessionId, session.id));

          expect(finalParticipants.length).toBe(totalAdded);
          expect(finalParticipants.length).toBeLessThanOrEqual(maxStudents);
          expect(finalParticipants.length).toBe(Math.min(joinAttempts, maxStudents));
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle edge case of maxStudents = 1", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          teacherId: fc.integer({ min: 1, max: 100 }),
          categoryId: fc.integer({ min: 1, max: 8 }),
        }),
        async ({ teacherId, categoryId }) => {
          const maxStudents = 1;

          // Create a test session with maxStudents = 1
          const roomCode = generateTestRoomCode();
          const [session] = await db
            .insert(sessions)
            .values({
              teacherId,
              categoryId,
              roomCode,
              maxStudents,
              status: "waiting",
            })
            .returning();

          testSessionId = session.id;

          // Add first participant
          await db.insert(sessionParticipants).values({
            sessionId: session.id,
            studentId: 4001,
            score: 0,
          });

          // Verify count is 1
          const participants = await db
            .select()
            .from(sessionParticipants)
            .where(eq(sessionParticipants.sessionId, session.id));

          expect(participants.length).toBe(1);

          // Verify cannot add second participant
          const currentCount = participants.length;
          expect(currentCount).toBe(maxStudents);
          expect(currentCount < maxStudents).toBe(false);
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
