# Requirements Document

## Introduction

This specification defines the refinement of two architectural component boundaries in the KWD Learn platform to improve maintainability, clarify responsibilities, and correct documentation inconsistencies discovered through codebase analysis.

The two boundary refinements are:

1. **Identity & Access Component Split**: Evaluating whether the current single Identity & Access component (which handles both authentication and authorization) should be split into separate Authentication and Access Control components to reduce fan-in and clarify separation of concerns.

2. **Rank & Leaderboard Write Pattern Clarification**: Correcting the "read-only" claim about the Rank & Leaderboard component, which actually performs writes to `gameParticipants.rank` (session-ephemeral) and `leaderboardEntries` (persistent state via `lib/ranking.ts`).

## Glossary

- **Architecture_Document**: The canonical architecture specification at `.kiro/specs/learn-architecture/architecture_selection.md`
- **Identity_Access_Component**: Current component responsible for JWT authentication, OAuth, 2FA, and 3-tier access resolution (guest/user/class-pro)
- **Authentication_Component**: Proposed component handling pure identity operations (JWT mint/verify, OAuth, 2FA)
- **Access_Control_Component**: Proposed component handling authorization policy (resolveAccess, subscription checks, tier enforcement)
- **Rank_Leaderboard_Component**: Current component described as "read-only" that derives rank from lifetimePoints and serves leaderboard queries
- **Session_Ephemeral_Rank**: The `gameParticipants.rank` column written during live sessions to show real-time leaderboard position; discarded when session ends
- **Persistent_Leaderboard_State**: The `leaderboardEntries` table written by `updateRankingsForAllPeriods()` in `lib/ranking.ts` for windowed leaderboards (weekly/monthly/all-time)
- **Derived_Rank**: Rank tier and division computed on-demand from `users.lifetimePoints` via `lib/ranks.ts`; never stored
- **Fan_In**: The number of components that depend on a given component (Identity & Access currently has fan-in of 4)

## Requirements

### Requirement 1: Document and Analyze Identity & Access Split Options

**User Story:** As a platform architect, I want to understand the trade-offs between keeping Identity & Access as a single component versus splitting it into Authentication and Access Control, so that I can make an informed decision about component boundaries.

#### Acceptance Criteria

1. THE Architecture_Document SHALL document both Option A (single component) and Option B (split components) in the "Identity & Access Component Split" section
2. THE Architecture_Document SHALL list the coupling analysis: JWT → role → subscription tier → access decision flow
3. FOR Option A, THE Architecture_Document SHALL document the pro (tight coupling justifies single component) and con (4-of-6 fan-in creates bottleneck)
4. FOR Option B, THE Architecture_Document SHALL document the pro (clearer separation, access policy evolution independence) and con (adds interface between auth session and access resolution)
5. THE Architecture_Document SHALL state which option is selected with rationale

### Requirement 2: Clarify Rank & Leaderboard Write Patterns

**User Story:** As a developer, I want accurate documentation of which rank/leaderboard writes are session-ephemeral versus persistent, so that I understand the actual data flow when implementing or debugging.

#### Acceptance Criteria

1. THE Architecture_Document SHALL correct the "read-only" claim for the Rank & Leaderboard component
2. THE Architecture_Document SHALL distinguish between Session_Ephemeral_Rank (`gameParticipants.rank`) and Persistent_Leaderboard_State (`leaderboardEntries`)
3. THE Architecture_Document SHALL document that Derived_Rank from `lib/ranks.ts` is never stored (read-only pattern)
4. THE Architecture_Document SHALL document that `lib/ranking.ts` writes persistent leaderboard state for windowed periods
5. THE Architecture_Document SHALL document that session-ephemeral rank is written by Live Session Engine during active gameplay and discarded at session end

### Requirement 3: Update Information Flow Matrix

**User Story:** As a developer, I want the information flow matrix to reflect actual write patterns, so that I can trace data dependencies accurately.

#### Acceptance Criteria

1. THE Architecture_Document SHALL update the information flow matrix row for Rank & Leaderboard component
2. THE information flow matrix SHALL show Rank & Leaderboard → Persistence with "R/W: gameParticipants.rank (ephemeral), leaderboardEntries (persistent)"
3. THE information flow matrix SHALL show Rank & Leaderboard → Persistence with "R: users.lifetimePoints, pointsLedger (for derived rank)"
4. THE information flow matrix SHALL preserve the "read-only for derived rank, read-write for leaderboard tables" distinction

### Requirement 4: Update Component Responsibility Table

**User Story:** As a developer, I want the component responsibility table to accurately describe what each component owns and writes, so that I understand component boundaries when making changes.

#### Acceptance Criteria

1. THE Architecture_Document SHALL update the Rank & Leaderboard component's "Owned State" column
2. THE "Owned State" column SHALL list: `lifetimePoints` (derived read), `pointsLedger` (read for derived rank), `leaderboardEntries` (windowed leaderboard state), `gameParticipants.rank` (session-ephemeral)
3. THE "Responsibility" column SHALL state: "Derives rank/division from lifetimePoints via ranks.ts (never stored). Maintains windowed leaderboard state (weekly/monthly/all-time) in leaderboardEntries. Writes session-ephemeral rank to gameParticipants during live sessions."
4. IF the Identity & Access split is selected, THE component table SHALL be updated to show Authentication and Access Control as separate rows with their respective owned state and responsibilities

### Requirement 5: Maintain Design-Induced Invariant DI-1

**User Story:** As a developer, I want to preserve the "rank is stateless at write-time" invariant, so that rank tier/division cannot drift from lifetimePoints.

#### Acceptance Criteria

1. THE Architecture_Document SHALL preserve Design-Induced Invariant DI-1: "Rank is stateless at write-time"
2. THE DI-1 invariant SHALL clarify that rank tier/division from `lib/ranks.ts` is never stored, only session-ephemeral leaderboard position (`gameParticipants.rank`) is stored
3. THE DI-1 invariant SHALL state that windowed leaderboard state (`leaderboardEntries.rank`) represents position in a period's leaderboard, not the user's tier/division
4. THE DI-1 invariant SHALL be enforced by the fact that both Solo Play Engine and Live Session Engine only increment `lifetimePoints`, and Rank & Leaderboard re-derives tier/division on every read

### Requirement 6: Update File-to-Component Map

**User Story:** As a developer, I want the file-to-component map to include ranking.ts in the correct component, so that I can navigate to the right files when working on leaderboard features.

#### Acceptance Criteria

1. THE Architecture_Document SHALL list `src/lib/ranking.ts` under the Rank & Leaderboard component in the File-to-Component Map
2. THE file listing SHALL note: "updateRankingsForAllPeriods() writes leaderboardEntries for windowed leaderboards"
3. THE file listing SHALL distinguish `lib/ranks.ts` (pure derivation, no writes) from `lib/ranking.ts` (persistent writes)

### Requirement 7: Decision Rationale Documentation

**User Story:** As a future maintainer, I want to understand why architectural decisions were made, so that I can evaluate whether to revisit them when requirements change.

#### Acceptance Criteria

1. THE Architecture_Document SHALL include a "Decision Rationale" section for the Identity & Access split
2. THE rationale SHALL explain which option was selected and why
3. THE rationale SHALL document what conditions would trigger revisiting the decision (e.g., "if fan-in exceeds 5 components" or "if access policy requires independent versioning")
4. IF Option A (single component) is selected, THE rationale SHALL document how the high fan-in is mitigated (e.g., "isolated in two files: auth.ts and gamekit/access.ts")

### Requirement 8: Validate Consistency Across Document

**User Story:** As a reviewer, I want all sections of the architecture document to be consistent after changes, so that there are no conflicting claims.

#### Acceptance Criteria

1. WHEN the Architecture_Document is updated, THE Recommended Architecture section SHALL match the Components table
2. WHEN the Architecture_Document is updated, THE Information Flow matrix SHALL match the Key Design-Induced Invariants
3. WHEN the Architecture_Document is updated, THE File-to-Component Map SHALL match the Components table
4. WHEN Rank & Leaderboard write patterns are corrected, THE "Key Design-Induced Invariants" section SHALL be consistent with the "Information Flow" section
5. IF any section makes a claim about "read-only" or "write-only" behavior, THE claim SHALL be verified against the actual file-to-component map entries

## Special Considerations

### Session-Ephemeral vs Persistent State

The distinction between session-ephemeral rank (`gameParticipants.rank`) and persistent leaderboard state (`leaderboardEntries`) is critical:

- **Session-ephemeral**: Written during live session to show real-time position; discarded when session ends; NOT used for historical queries
- **Persistent leaderboard state**: Written at session end (or quiz completion) for windowed leaderboard queries (weekly/monthly/all-time); survives session end
- **Derived rank**: Computed on-demand from `lifetimePoints` via `lib/ranks.ts`; represents tier (Rookie/Rising/Gold/Platinum/Diamond/Mythic) and division (IV/III/II/I); never stored

### Authentication vs Access Control Interface

If the Identity & Access split is selected, the interface between the two components must be defined:

- **Authentication exports**: `JWTPayload` (session data), `getSession()` (current user), `signToken()`, `verifyToken()`
- **Access Control imports**: `JWTPayload` type and `getSession()` to resolve subscription tier and class enrollment
- **Access Control exports**: `resolveAccess()`, `AccessDecision` type, `AccessTier` type
- **Existing callers**: Solo Play Engine and Live Session Engine currently call `getSession()` and `resolveAccess()`; both calls would remain unchanged if split properly

### No New Infrastructure Required

This is a refactoring and documentation update only. No new tables, libraries, or external services are introduced. The changes are:

1. Architecture document updates to reflect actual implementation
2. Optional code reorganization (if Identity & Access split is selected) to move files between `lib/auth.ts` + `lib/gamekit/access.ts` → separate directories
3. No schema changes, no API contract changes, no user-facing behavior changes

### Parser and Serializer Requirements

This feature does not introduce parsers or serializers. The architecture document is a markdown file consumed by humans, not machines.
