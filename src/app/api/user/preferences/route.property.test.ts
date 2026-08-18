import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

/**
 * Feature: learning-hub-quiz-system, Property 16: Audio Mute Preference Persistence
 * 
 * **Validates: Requirements 20.4**
 * 
 * For any user, setting audioMuted in preferences should persist to the database,
 * and retrieving preferences should return the same audioMuted value (round-trip property).
 */

describe("Property 16: Audio Mute Preference Persistence", () => {
  it("should persist audioMuted preference round-trip", { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async (audioMuted) => {
        // Create a test user for this iteration
        const [user] = await db
          .insert(users)
          .values({
            username: `proptest_${Date.now()}_${Math.random()}`,
            email: `proptest_${Date.now()}_${Math.random()}@example.com`,
            passwordHash: "test_hash",
            role: "student",
            audioMuted: false,
          })
          .returning();

        try {
          // Set preference
          await db
            .update(users)
            .set({ audioMuted, updatedAt: new Date() })
            .where(eq(users.id, user.id));

          // Retrieve preference
          const [retrieved] = await db
            .select({ audioMuted: users.audioMuted })
            .from(users)
            .where(eq(users.id, user.id));

          // Should match what was set
          expect(retrieved.audioMuted).toBe(audioMuted);
        } finally {
          // Clean up test user
          await db.delete(users).where(eq(users.id, user.id));
        }
      }),
      { numRuns: 10 }
    );
  });

  it("should handle multiple sequential updates", { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
        async (audioMutedSequence) => {
          // Create a test user for this iteration
          const [user] = await db
            .insert(users)
            .values({
              username: `proptest_${Date.now()}_${Math.random()}`,
              email: `proptest_${Date.now()}_${Math.random()}@example.com`,
              passwordHash: "test_hash",
              role: "student",
              audioMuted: false,
            })
            .returning();

          try {
            // Apply each update in sequence
            for (const audioMuted of audioMutedSequence) {
              await db
                .update(users)
                .set({ audioMuted, updatedAt: new Date() })
                .where(eq(users.id, user.id));
            }

            // Retrieve final preference
            const [retrieved] = await db
              .select({ audioMuted: users.audioMuted })
              .from(users)
              .where(eq(users.id, user.id));

            // Should match the last value in sequence
            const lastValue =
              audioMutedSequence[audioMutedSequence.length - 1];
            expect(retrieved.audioMuted).toBe(lastValue);
          } finally {
            // Clean up test user
            await db.delete(users).where(eq(users.id, user.id));
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it("should maintain preference across multiple reads", { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(fc.boolean(), async (audioMuted) => {
        // Create a test user for this iteration
        const [user] = await db
          .insert(users)
          .values({
            username: `proptest_${Date.now()}_${Math.random()}`,
            email: `proptest_${Date.now()}_${Math.random()}@example.com`,
            passwordHash: "test_hash",
            role: "student",
            audioMuted: false,
          })
          .returning();

        try {
          // Set preference once
          await db
            .update(users)
            .set({ audioMuted, updatedAt: new Date() })
            .where(eq(users.id, user.id));

          // Read multiple times
          const reads = await Promise.all([
            db
              .select({ audioMuted: users.audioMuted })
              .from(users)
              .where(eq(users.id, user.id)),
            db
              .select({ audioMuted: users.audioMuted })
              .from(users)
              .where(eq(users.id, user.id)),
            db
              .select({ audioMuted: users.audioMuted })
              .from(users)
              .where(eq(users.id, user.id)),
          ]);

          // All reads should return the same value
          for (const [retrieved] of reads) {
            expect(retrieved.audioMuted).toBe(audioMuted);
          }
        } finally {
          // Clean up test user
          await db.delete(users).where(eq(users.id, user.id));
        }
      }),
      { numRuns: 10 }
    );
  });
});
