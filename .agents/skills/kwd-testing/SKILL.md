---
name: kwd-testing
description: Guidelines for property-based testing (fast-check), unit testing, mock/test users, and cleanup in Kesararam.
---

# KWD Testing Guidelines

This skill documents how to handle testing in the Kesararam project, specifically focusing on property-based testing using `fast-check` and mock/test users.

## 1. Mock/Test Users

To prevent test data from polluting the production/staging database or displaying on public UI, follow these guidelines:

### Naming Conventions
- Always prefix mock/test user usernames with `proptest_` (e.g., `proptest_${Date.now()}_${Math.random()}`).
- Always prefix mock/test user emails with `proptest_` (e.g., `proptest_${Date.now()}_${Math.random()}@example.com`).

### Leaderboard Exclusion
- All queries retrieving users for display on the leaderboard (like the one in `src/app/api/leaderboard/route.ts`) must filter out mock/test users using the condition:
  `users.username NOT LIKE 'proptest_%'`
- Ensure any new leaderboard or stats display checks for this exclusion.

### Strict Cleanup (Finally Block)
- When a test inserts a test user into the database, it must do so inside a `try...finally` block (or `afterEach`/`afterAll` hook) to ensure the user is deleted even if the test fails.
- Example:
  ```typescript
  const [user] = await db.insert(users).values({
    username: `proptest_${Date.now()}_${Math.random()}`,
    email: `proptest_${Date.now()}_${Math.random()}@example.com`,
    role: "student",
    // other fields
  }).returning();

  try {
    // perform test assertions
  } finally {
    await db.delete(users).where(eq(users.id, user.id));
  }
  ```

### Database Cleanup Script
- If test runs are terminated prematurely, orphaned `proptest_` users might remain.
- A utility script is available at `scripts/cleanup-test-users.ts` to clean up these orphaned users:
  ```bash
  PATH="/Users/Apple16/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/tsx scripts/cleanup-test-users.ts
  ```

## 2. Property-Based Testing with fast-check

- Property-based testing is used to verify that a code property holds true for a wide range of randomly generated inputs.
- Keep runs counts configured appropriately (e.g., `{ numRuns: 100 }`) and define timeouts for asynchronous assertions.
- Use `fc.asyncProperty` for properties that interact with database queries or external API calls.
