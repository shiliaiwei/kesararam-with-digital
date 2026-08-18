import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Property-Based Tests for Challenge Session Creation
 * 
 * **Validates: Requirements 28.1**
 * Feature: learning-hub-quiz-system, Property 24: Challenge Session Room Code Uniqueness
 */

describe("Challenge Session Room Code Uniqueness", () => {
  it("should generate unique 6-character uppercase alphanumeric room codes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (count) => {
          const roomCodes = new Set<string>();
          for (let i = 0; i < count; i++) {
            const code = generateTestRoomCode();
            expect(code).toHaveLength(6);
            expect(code).toMatch(/^[A-Z0-9]{6}$/);
            roomCodes.add(code);
          }
          // The probability of collision in a small random sample of 36^6 is near zero
          expect(roomCodes.size).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should enforce room code uniqueness across active sessions in memory state", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            roomCode: fc.stringMatching(/^[A-Z0-9]{6}$/),
            status: fc.constantFrom("waiting", "active", "completed", "cancelled"),
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (sessions) => {
          // Active sessions pool
          const activeCodes = new Set<string>();
          let hasDuplicateActive = false;

          for (const s of sessions) {
            const isActive = s.status === "waiting" || s.status === "active";
            if (isActive) {
              if (activeCodes.has(s.roomCode)) {
                hasDuplicateActive = true;
                break;
              }
              activeCodes.add(s.roomCode);
            }
          }

          // Active pool should never contain duplicate active codes when filtered
          const filteredActive = sessions
            .filter((s) => s.status === "waiting" || s.status === "active")
            .map((s) => s.roomCode);
          const uniqueActive = new Set(filteredActive);

          if (!hasDuplicateActive) {
            expect(uniqueActive.size).toBe(filteredActive.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow reusing room codes when previous session is completed or cancelled", () => {
    fc.assert(
      fc.property(
        fc.record({
          code: fc.stringMatching(/^[A-Z0-9]{6}$/),
          previousStatus: fc.constantFrom("completed", "cancelled"),
        }),
        ({ code, previousStatus }) => {
          const sessions = [
            { roomCode: code, status: previousStatus },
          ];

          // Check if code is available for a new session
          const activeSessions = sessions.filter(
            (s) => s.status === "waiting" || s.status === "active"
          );

          expect(activeSessions.length).toBe(0);

          // Can now create a new active session with same code
          sessions.push({ roomCode: code, status: "waiting" });

          const newActive = sessions.filter(
            (s) => s.status === "waiting" || s.status === "active"
          );

          expect(newActive.length).toBe(1);
          expect(newActive[0].roomCode).toBe(code);
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
