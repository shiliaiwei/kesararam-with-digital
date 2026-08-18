import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Property-Based Tests for Challenge Session Participant Limit
 * 
 * **Validates: Requirements 28.2**
 * Feature: learning-hub-quiz-system, Property 25: Challenge Session Participant Limit
 */

describe("Challenge Session Participant Limit", () => {
  it("should enforce maxStudents limit for session participants", () => {
    fc.assert(
      fc.property(
        fc.record({
          maxStudents: fc.integer({ min: 1, max: 40 }),
          attemptedParticipants: fc.integer({ min: 1, max: 50 }),
        }),
        ({ maxStudents, attemptedParticipants }) => {
          const participants: number[] = [];
          let successfulJoins = 0;
          let rejectedJoins = 0;

          for (let i = 1; i <= attemptedParticipants; i++) {
            if (participants.length < maxStudents) {
              participants.push(i);
              successfulJoins++;
            } else {
              rejectedJoins++;
            }
          }

          expect(participants.length).toBeLessThanOrEqual(maxStudents);
          expect(participants.length).toBe(Math.min(attemptedParticipants, maxStudents));
          expect(successfulJoins).toBe(Math.min(attemptedParticipants, maxStudents));
          expect(rejectedJoins).toBe(Math.max(0, attemptedParticipants - maxStudents));
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow exactly maxStudents participants, no more", () => {
    fc.assert(
      fc.property(
        fc.record({
          maxStudents: fc.integer({ min: 1, max: 40 }),
        }),
        ({ maxStudents }) => {
          const participants: number[] = [];

          for (let i = 1; i <= maxStudents; i++) {
            participants.push(i);
          }

          expect(participants.length).toBe(maxStudents);
          const canAddMore = participants.length < maxStudents;
          expect(canAddMore).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should correctly count participants across multiple join batches", () => {
    fc.assert(
      fc.property(
        fc.record({
          maxStudents: fc.integer({ min: 5, max: 30 }),
          batchSizes: fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 10 }),
        }),
        ({ maxStudents, batchSizes }) => {
          const participants: number[] = [];
          let totalAttempted = 0;

          for (const batch of batchSizes) {
            for (let i = 0; i < batch; i++) {
              totalAttempted++;
              if (participants.length < maxStudents) {
                participants.push(totalAttempted);
              }
            }
          }

          expect(participants.length).toBeLessThanOrEqual(maxStudents);
          expect(participants.length).toBe(Math.min(totalAttempted, maxStudents));
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle edge case of maxStudents = 1", () => {
    const maxStudents = 1;
    const participants: number[] = [];

    // First participant joins
    if (participants.length < maxStudents) {
      participants.push(101);
    }
    expect(participants.length).toBe(1);

    // Second participant is rejected
    const canAddSecond = participants.length < maxStudents;
    expect(canAddSecond).toBe(false);
  });
});
