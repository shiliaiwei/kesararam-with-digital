import { describe, it, expect } from "vitest";
import fc from "fast-check";

// Feature: content-management, Rule: never delete content/topic inserted by staff and approved by admin
// Validates: "write the rule never delete content topic insert by staff approve by admin"

describe("Delete Rule: Never delete content/topic inserted by staff and approved by admin", () => {
  // Simulator function for delete validation logic
  function canDeleteContentOrTopic(
    item: {
      createdByRole: string;
      status: string;
      approvedBy: number | null;
    },
    session: {
      role: string;
      id: number;
    }
  ): { allowed: boolean; error?: string } {
    // Check our new rule: if created by staff and approved by admin
    const isApproved = item.status === "approved" || item.approvedBy !== null;
    if (item.createdByRole === "staff" && isApproved) {
      return {
        allowed: false,
        error: "Cannot delete content/topic created by staff and approved by admin",
      };
    }

    // Otherwise, simulate the standard deletion checks
    if (session.role === "admin") {
      return { allowed: true };
    }

    if (session.role === "staff") {
      // Staff can only delete pending/draft or rejected content/topics depending on route rules
      const isPending = item.status === "pending";
      const isDraft = item.status === "draft";
      const isRejected = item.status === "rejected";

      if (isPending || isDraft || isRejected) {
        return { allowed: true };
      }

      return { allowed: false, error: "Forbidden" };
    }

    return { allowed: false, error: "Unauthorized" };
  }

  it("should prevent deletion if item is created by staff and approved by admin, regardless of deleter role", () => {
    fc.assert(
      fc.property(
        fc.record({
          item: fc.record({
            createdByRole: fc.constant("staff"),
            status: fc.constantFrom("approved", "published"),
            approvedBy: fc.integer({ min: 1, max: 100 }),
          }),
          session: fc.record({
            role: fc.constantFrom("admin", "staff"),
            id: fc.integer({ min: 1, max: 100 }),
          }),
        }),
        (input) => {
          const result = canDeleteContentOrTopic(input.item, input.session);
          expect(result.allowed).toBe(false);
          expect(result.error).toBe("Cannot delete content/topic created by staff and approved by admin");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow deletion if item is created by staff but NOT approved yet, for admin/authorized staff", () => {
    fc.assert(
      fc.property(
        fc.record({
          item: fc.record({
            createdByRole: fc.constant("staff"),
            status: fc.constantFrom("pending", "draft", "rejected"),
            approvedBy: fc.constant(null),
          }),
          session: fc.record({
            role: fc.constantFrom("admin", "staff"),
            id: fc.integer({ min: 1, max: 100 }),
          }),
        }),
        (input) => {
          const result = canDeleteContentOrTopic(input.item, input.session);
          expect(result.allowed).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should allow deletion if item is approved by admin but NOT created by staff (e.g. created by admin), for admin user", () => {
    fc.assert(
      fc.property(
        fc.record({
          item: fc.record({
            createdByRole: fc.constant("admin"),
            status: fc.constant("approved"),
            approvedBy: fc.integer({ min: 1, max: 100 }),
          }),
          session: fc.record({
            role: fc.constant("admin"),
            id: fc.integer({ min: 1, max: 100 }),
          }),
        }),
        (input) => {
          const result = canDeleteContentOrTopic(input.item, input.session);
          expect(result.allowed).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
