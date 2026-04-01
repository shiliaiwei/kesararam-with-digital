# KWD — Kesararam With Digital
## Technical Documentation

> Cambodia Driving Theory Education Platform

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Brand Identity](#2-brand-identity)
3. [Architecture](#3-architecture)
4. [Directory Structure](#4-directory-structure)
5. [Data Models](#5-data-models)
6. [Game Engine & Algorithms](#6-game-engine--algorithms)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Live Game Session Flow](#8-live-game-session-flow)
9. [Subscription System](#9-subscription-system)
10. [Content Workflow](#10-content-workflow)
11. [Technology Stack](#11-technology-stack)
12. [API Reference](#12-api-reference)
13. [Internationalization](#13-internationalization)
14. [Design System](#14-design-system)
15. [Deployment](#15-deployment)
16. [Testing](#16-testing)

---

## 1. Project Overview

KWD is a full-stack web platform for Cambodia driving theory exam preparation.
It serves three user tiers simultaneously:

| Tier | Role | Value |
|------|------|-------|
| Students | Free — growth engine | Join games, learn signs, compete |
| Teachers | Core paying users | Host sessions, track progress, analytics |
| Schools | High-value B2B | Multi-teacher, bulk management, branding |

**Eight knowledge categories** aligned to the official exam syllabus:

- Traffic Signs
- Road Traffic Law
- Right of Way
- Driving Skills
- Vehicle Technology
- Loading People & Goods
- General Knowledge
- Emergency

**Learning modalities:**
- Flashcard review
- Solo practice quizzes
- Live multiplayer challenge sessions
- Suar AI conversational assistant
- Leaderboard competition

---

## 2. Brand Identity

**Name:** KWD — Kesararam With Digital

**Design Philosophy:** Neo-Brutalism inspired by road markings and traffic safety

### Visual Rules

| Rule | Value |
|------|-------|
| Border radius | `0px` — always sharp corners |
| Borders | `2px solid black` standard, `4px` for emphasis |
| Shadows | Hard offset, no blur — `4px 4px 0 #000` |
| Gradients | None — solid colors only |
| Transitions | `100–150ms` duration |

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Yellow | `#eab308` | Primary CTA, road warning signs |
| Blue | `#3b82f6` | Info, signals, links |
| Green | `#22c55e` | Success, active states |
| Red | `#ef4444` | Danger, errors, stop |
| Orange | `#f97316` | Caution, attention |
| Purple | `#a855f7` | Premium features |
| Cyan | `#06b6d4` | Accent, highlights |

### Interactive States

```css
/* Hover — lift effect */
hover:-translate-x-0.5 hover:-translate-y-0.5
hover:shadow-[6px_6px_0_#000]

/* Active — press down */
active:translate-x-[2px] active:translate-y-[2px]
active:shadow-none
```

---

## 3. Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (CDN + Edge)               │
├──────────────────────┬──────────────────────────────┤
│  kesararamwithdigital│  dashboard.kesararamwith...   │
│  .tech (Public)      │  digital.tech (Dashboard)     │
│                      │                               │
│  Students / Public   │  Teachers / Admin / Staff     │
└──────────────────────┴──────────────────────────────┘
              │                        │
              └──────────┬─────────────┘
                         │
              ┌──────────▼──────────┐
              │   Next.js App Router │
              │   (API Routes + SSR) │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌─────▼─────┐   ┌────▼────┐
    │  Neon   │    │Cloudinary │   │  AI APIs│
    │Postgres │    │  (Media)  │   │Groq/OAI │
    └─────────┘    └───────────┘   └─────────┘
```

### Rendering Strategy

| Route Type | Strategy |
|------------|----------|
| Public pages | SSR + Static |
| Dashboard pages | SSR (auth-gated) |
| Game session | Client-side + SSE |
| API routes | Server-side only |

### Real-Time Communication

SSE (Server-Sent Events) — unidirectional server-to-client streaming.
No WebSocket infrastructure required.

```
Teacher Control → POST /api/game/sessions/[code]/control
                         ↓
                   Event Bus (in-memory Map)
                         ↓
              Broadcast to all SSE subscribers
                         ↓
              Students receive via EventSource
```

---

## 4. Directory Structure

```
src/
├── app/
│   ├── (public)/          # Student-facing pages
│   │   ├── home/          # Homepage
│   │   ├── play/          # Game interface
│   │   │   ├── [code]/    # Live game join
│   │   │   └── solo/      # Solo practice
│   │   ├── leaderboard/   # Global rankings
│   │   ├── learn/         # Category learning
│   │   ├── profile/       # Student profile
│   │   └── pricing/       # Subscription plans
│   ├── (dashboard)/       # Auth-gated dashboard
│   │   ├── admin/         # Admin tools
│   │   │   ├── users/     # User management
│   │   │   ├── subscriptions/ # Plan management
│   │   │   ├── content/   # Content approval
│   │   │   └── game-sessions/ # Session monitor
│   │   ├── teacher/       # Teacher tools
│   │   │   ├── sessions/  # Host game
│   │   │   └── classes/   # Class management
│   │   └── staff/         # Content creation
│   └── api/               # API route handlers
│       ├── game/          # Game session APIs
│       ├── admin/         # Admin-only APIs
│       ├── auth/          # Authentication
│       ├── leaderboard/   # Rankings
│       ├── user/          # User stats/settings
│       ├── content/       # Content delivery
│       └── ai/            # Suar AI chat
├── components/
│   ├── game/              # Live game UI
│   ├── pricing/           # Upgrade modal, FAB
│   ├── hero/              # Homepage sections
│   ├── learning/          # Quiz, flashcard UI
│   ├── profile/           # Profile editor
│   ├── shared/            # Navbar, footer
│   └── ui/                # Base design system
├── lib/
│   ├── auth.ts            # JWT operations
│   ├── db.ts              # DB connection
│   ├── game-engine.ts     # Scoring + state machine
│   ├── game-event-bus.ts  # SSE broadcast
│   ├── ranking.ts         # Leaderboard calc
│   ├── subscription.ts    # Plan enforcement
│   └── subscription-plans.ts # Plan constants (client-safe)
├── db/
│   └── schema/
│       ├── users.ts
│       ├── game.ts
│       ├── content.ts
│       ├── quizzes.ts
│       └── subscriptions.ts
├── hooks/
│   └── use-game-sse.ts    # SSE lifecycle hook
├── context/
│   └── lang-context.tsx   # Language provider
└── i18n/
    ├── en.json            # English strings
    └── kh.json            # Khmer strings
```

---

## 5. Data Models

### users

```sql
id              serial PRIMARY KEY
username        text UNIQUE NOT NULL
email           text UNIQUE NOT NULL
password_hash   text NOT NULL
role            enum('student','teacher','admin','staff')
display_name    text
avatar          text
audio_muted     boolean DEFAULT false
is_active       boolean DEFAULT true
is_suspended    boolean DEFAULT false
login_attempts  integer DEFAULT 0
locked_until    timestamp
last_login_at   timestamp
highest_score   integer DEFAULT 0
total_games_played integer DEFAULT 0
lifetime_points integer DEFAULT 0
created_at      timestamp DEFAULT now()
```

### game_sessions

```sql
id                    serial PRIMARY KEY
session_code          varchar(6) UNIQUE NOT NULL
host_id               integer REFERENCES users(id)
game_mode             varchar(50)
category              varchar(100)
difficulty            varchar(20)
question_ids          integer[]
current_question_index integer DEFAULT 0
question_started_at   timestamp
status                varchar(20) DEFAULT 'lobby'
scoring_mode          varchar(20) DEFAULT 'speed'
time_per_question     integer DEFAULT 30
max_players           integer DEFAULT 50
started_at            timestamp
ended_at              timestamp
```

### game_participants

```sql
id              serial PRIMARY KEY
session_id      integer REFERENCES game_sessions(id)
user_id         integer REFERENCES users(id)
display_name    varchar(100)
total_score     integer DEFAULT 0
correct_answers integer DEFAULT 0
current_streak  integer DEFAULT 0
is_connected    boolean DEFAULT true
rank            integer DEFAULT 0
UNIQUE(session_id, user_id)
```

### game_session_answers (append-only)

```sql
id               serial PRIMARY KEY
session_id       integer REFERENCES game_sessions(id)
user_id          integer REFERENCES users(id)
question_id      integer
answer_id        integer
answered_at      timestamp
is_correct       boolean
speed_score      integer
streak_bonus     integer
total_points     integer
remaining_time_ms integer
UNIQUE(session_id, user_id, question_id)
```

### subscriptions

```sql
id            serial PRIMARY KEY
user_id       integer REFERENCES users(id)
plan          enum('free','teacher_pro','school')
status        enum('active','trial','expired','cancelled')
is_trial      boolean DEFAULT false
trial_ends_at timestamp
starts_at     timestamp DEFAULT now()
ends_at       timestamp
assigned_by   integer REFERENCES users(id)
note          text
```

### leaderboard_entries

```sql
id              serial PRIMARY KEY
student_id      integer REFERENCES users(id)
category_id     integer (NULL = overall)
score           integer DEFAULT 0
correct_answers integer DEFAULT 0
total_attempts  integer DEFAULT 0
rank            integer
period          text  -- 'weekly' | 'monthly' | 'all-time'
period_start    date
UNIQUE(student_id, category_id, period, period_start)
```

---

## 6. Game Engine & Algorithms

### Scoring Formula

```
Base Score (by difficulty):
  easy   → 1 pt
  medium → 2 pts
  hard   → 3 pts

Speed Bonus (speed mode only):
  speedBonus = baseScore × (remainingTimeMs / totalTimeMs)

Streak Bonus:
  streak 2–3  → +1 pt
  streak 4–5  → +2 pts
  streak 6+   → +3 pts

Total = baseScore + speedBonus + streakBonus
Incorrect answer → 0 pts (all components)
```

### Game State Machine

```
         ┌─────────┐
         │  LOBBY  │
         └────┬────┘
              │ start
         ┌────▼────┐
    ┌────│  ACTIVE │────┐
    │    └────┬────┘    │
  pause       │ end   end
    │    ┌────▼────┐    │
    └───►│  PAUSED │    │
         └────┬────┘    │
              │ end     │
         ┌────▼────┐◄───┘
         │  ENDED  │
         └─────────┘
```

### Question Type Classification

```typescript
answerCount === 2              → true_false
hasImage && 2–4 answers        → image_pick
otherwise                      → mcq
```

### Game Mode Configuration

| Mode | Questions | Time/Q | Types |
|------|-----------|--------|-------|
| Quick Quiz | 10 | 30s | mcq, true_false |
| Speed Round | 20 | 15s | mcq |
| Sign Challenge | 15 | 20s | image_pick |
| Mixed Battle | 20 | 30s | all |
| Daily Challenge | 15 | 30s | all |
| Exam Simulation | 40 | 45s | mcq, true_false |

### Leaderboard Ranking

```
After each game:
  for each period in [weekly, monthly, all-time]:
    1. Compute period start date
    2. Upsert leaderboard entry (score += delta)
    3. Fetch all entries for this leaderboard
    4. Sort by score DESC, correctAnswers DESC
    5. Update rank field for each entry
```

### Session Code Generation

```
Character set: A–Z + 0–9 (36 chars)
Length: 6 characters
Space: 36^6 = ~2.18 billion unique codes
Collision check: query DB before accepting
```

---

## 7. Authentication & Authorization

### JWT Token

```typescript
// Payload
{
  id: number
  email: string
  name: string
  role: "student" | "teacher" | "admin" | "staff"
  avatar?: string
}

// Expiry
student  → 7 days
others   → 8 hours

// Storage
Cookie: kwd_token (HTTP-only)
Algorithm: HS256
```

### Role Path Matrix

| Path Prefix | student | teacher | admin | staff |
|-------------|---------|---------|-------|-------|
| `/admin` | — | — | ✓ | — |
| `/teacher` | — | ✓ | ✓ | — |
| `/staff` | — | — | ✓ | ✓ |
| `/api/admin` | — | — | ✓ | — |
| `/api/teacher` | — | ✓ | ✓ | — |
| `/api/public` | ✓ | ✓ | ✓ | ✓ |
| `/api/user` | ✓ | ✓ | ✓ | ✓ |

### API Authentication Matrix

| Endpoint | Auth Required |
|----------|--------------|
| `GET /api/game/categories` | No |
| `POST /api/game/solo` | No |
| `POST /api/game/sessions/[code]/join` | Yes |
| `POST /api/game/sessions/[code]/answer` | Yes |
| `POST /api/game/sessions/[code]/control` | Yes (teacher/admin) |
| `GET /api/game/sessions/[code]/events` | No (validated post-join) |
| `GET /api/leaderboard` | No |
| `GET /api/user/stats` | Yes |
| `POST /api/admin/subscriptions` | Yes (admin only) |

### Security Measures

- IP-based rate limiting on login: 5 attempts per 60 seconds
- Account lockout after repeated failures
- Server-side score calculation (no client manipulation)
- Append-only answer records (immutable audit trail)
- Unique constraint prevents duplicate answer submissions
- Production session validation against DB (revocation support)

---

## 8. Live Game Session Flow

```
1. TEACHER creates session
   POST /api/game/sessions
   → Validates subscription limits
   → Selects + shuffles questions (Fisher-Yates)
   → Generates 6-char code
   → Returns: { sessionCode, sessionId }

2. STUDENTS join
   POST /api/game/sessions/[code]/join
   → Validates: authenticated, lobby status, not full
   → Creates participant record
   → Broadcasts lobby_update via SSE

3. SSE CONNECTION
   GET /api/game/sessions/[code]/events
   → Registers controller in event bus
   → Streams events as text/event-stream
   → Client reconnects with exponential backoff (max 5 attempts)

4. TEACHER starts game
   POST /api/game/sessions/[code]/control { action: "start" }
   → Validates state transition (lobby → active)
   → Broadcasts question_start event

5. STUDENTS answer
   POST /api/game/sessions/[code]/answer
   → Server calculates score
   → Updates participant record
   → Broadcasts updated leaderboard

6. TEACHER advances
   POST /api/game/sessions/[code]/control { action: "advance" }
   → Broadcasts question_end (correct answer + leaderboard)
   → Broadcasts next question_start
   → On last question → session_end

7. GAME ENDS
   → Final rankings computed
   → session_end broadcast (podium + full leaderboard)
   → syncScoresToUserProfiles() called
   → User lifetime_points, highest_score, total_games_played updated
```

### SSE Event Types

| Event | Trigger | Payload |
|-------|---------|---------|
| `lobby_update` | Player joins/leaves | participants[] |
| `question_start` | Question begins | question, timing, index |
| `question_end` | Question ends | correctAnswerId, leaderboard[] |
| `leaderboard` | Score update | entries[] |
| `session_paused` | Host pauses | — |
| `session_resumed` | Host resumes | — |
| `session_end` | Game over | podium[], finalLeaderboard[] |
| `ping` | Keepalive (15s) | — |
| `warning` | Alert | message |

---

## 9. Subscription System

### Plan Tiers

| Feature | Free | Teacher Pro | School |
|---------|------|-------------|--------|
| Price | $0 | $10/mo | $49/mo |
| Sessions/month | 1 | Unlimited | Unlimited |
| Players/session | 10 | 50 | 200 |
| Categories | 1 | All 8 | All 8 |
| Analytics | — | ✓ | ✓ |
| Export results | — | ✓ | ✓ |
| Advanced modes | — | ✓ | ✓ |
| Suar AI | — | Unlimited | Unlimited |
| Teacher accounts | 1 | 1 | 10 |
| Class management | — | — | ✓ |
| Remove branding | — | ✓ | ✓ |

### Anti-Cheat Design

- Subscriptions assigned by admin only — no self-upgrade
- No payment gateway — no bypass vector
- All enforcement server-side
- Every assignment logged with admin ID
- Trial offers admin-granted only
- New teacher accounts auto-receive 7-day Teacher Pro trial

### Enforcement Flow

```
POST /api/game/sessions
  ↓
enforceSessionCreation(hostId, requestedMaxPlayers)
  ↓
getUserSubscription(hostId)
  ↓ (falls back to free on any DB error)
Check monthly session count
  ↓ (blocked if exceeded)
Check player count vs plan limit
  ↓ (blocked if exceeded)
Allow session creation
```

---

## 10. Content Workflow

### Approval Pipeline

```
Staff creates topic/question
  → status: "draft"
  ↓
Staff submits for review
  → status: "submitted"
  → Appears in admin review queue
  ↓
Admin reviews
  ├── Approve → status: "approved" → eligible for games
  └── Reject  → status: "rejected" → returned with reason
```

### Content Structure

```
Category (8 total)
  └── Topic (learning unit)
        ├── Questions (1–N per topic)
        │     └── Answers (2–5 per question)
        ├── Flashcards
        └── Media (images, audio via Cloudinary)
```

### Question Types

| Type | Trigger | Description |
|------|---------|-------------|
| `mcq` | 3–5 answers, no image | Multiple choice |
| `true_false` | Exactly 2 answers | True or false |
| `image_pick` | Has image + 2–4 answers | Visual selection |

---

## 11. Technology Stack

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | Framework + App Router |
| react | 19.2.3 | UI library |
| typescript | 5.x | Type safety |
| tailwindcss | 4.x | Utility CSS |
| lucide-react | 0.577.0 | Icons |
| recharts | 2.15.4 | Analytics charts |
| gsap | 3.14.2 | Animations |
| sonner | 2.0.7 | Toast notifications |
| vaul | 1.1.2 | Drawer UI |
| @dnd-kit/core | 6.3.1 | Drag and drop |
| @tanstack/react-table | 8.21.3 | Data tables |
| next-intl | 4.8.3 | i18n |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| drizzle-orm | 0.45.1 | Type-safe ORM |
| @neondatabase/serverless | 1.0.2 | Neon HTTP driver |
| jose | 6.2.1 | JWT signing/verification |
| cloudinary | 2.9.0 | Media management |
| groq-sdk | 0.37.0 | Groq LLM API |
| openai | 6.27.0 | OpenAI API |
| googleapis | 171.4.0 | Google APIs |
| zod | 4.3.6 | Schema validation |

### Dev Tools

| Tool | Purpose |
|------|---------|
| vitest | Unit testing |
| fast-check | Property-based testing |
| tsx | TypeScript script runner |
| drizzle-kit | DB migration tooling |
| eslint | Static analysis |

---

## 12. API Reference

### Game

```
POST   /api/game/sessions                    Create session (teacher)
GET    /api/game/sessions                    List sessions
POST   /api/game/sessions/[code]/join        Join session (student)
POST   /api/game/sessions/[code]/answer      Submit answer
POST   /api/game/sessions/[code]/control     Host controls
GET    /api/game/sessions/[code]/events      SSE stream
GET    /api/game/sessions/[code]/state       Current state
GET    /api/game/sessions/[code]/analytics   Post-game analytics
GET    /api/game/categories                  Available categories
POST   /api/game/solo                        Start solo game
POST   /api/game/solo/complete               Complete solo game
```

### Admin

```
GET    /api/admin/subscriptions              List all subscriptions
POST   /api/admin/subscriptions              Assign plan to user
PATCH  /api/admin/subscriptions/[id]         Update subscription
DELETE /api/admin/subscriptions/[id]         Revoke subscription
GET    /api/admin/users-with-plans           Users + current plan
GET    /api/admin/content                    Content management
POST   /api/admin/content/[id]/approve       Approve content
POST   /api/admin/content/[id]/reject        Reject content
```

### User

```
GET    /api/auth/me                          Current user
GET    /api/user/stats                       User statistics + rank
PUT    /api/user/settings                    Update settings
GET    /api/leaderboard                      Global rankings
GET    /api/leaderboard/user/[userId]        User rank
```

### Content

```
GET    /api/content/[categorySlug]           Category content
GET    /api/traffic-signs                    Traffic signs list
GET    /api/public/topics                    Public topics
GET    /api/public/topics/[id]/questions     Topic questions
```

---

## 13. Internationalization

### Supported Languages

| Code | Language | Font |
|------|----------|------|
| `en` | English | Inter |
| `kh` | Khmer | Siemreap / Kantumruy Pro |

### Usage Pattern

```typescript
// Context hook
const { lang } = useLang();
const kh = lang === "kh";
const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

// In JSX
<h1 style={khFont}>
  {kh ? "ចំណាត់ថ្នាក់" : "Final Results"}
</h1>
```

### Translation Files

```json
// src/i18n/en.json
{
  "nav": { "home": "Home", "learn": "Learn", ... },
  "hero": { "headline": "Master Every Road Sign.", ... },
  "categories": { "roadSign": "Traffic Signs", ... }
}
```

### Bilingual Database Fields

All content tables store both language variants:
- `title_en` / `title_km`
- `question_en` / `question_km`
- `answer_en` / `answer_km`
- `description_en` / `description_km`

---

## 14. Design System

### Shadow Scale

```css
shadow-[2px_2px_0_#000]   /* Small — badges, tags */
shadow-[3px_3px_0_#000]   /* Medium — inputs */
shadow-[4px_4px_0_#000]   /* Large — cards, buttons */
shadow-[6px_6px_0_#000]   /* XL — hover states */
shadow-[8px_8px_0_#000]   /* XXL — hero elements */
```

### Button Variants

```tsx
// Primary CTA
className="bg-yellow-400 text-black border-2 border-black
           shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000]
           hover:-translate-x-0.5 hover:-translate-y-0.5
           transition-all duration-100"

// Danger
className="bg-red-500 text-white border-2 border-black
           shadow-[4px_4px_0_#000]"

// Ghost
className="border-2 border-black bg-white
           hover:bg-yellow-300"
```

### Card Pattern

```tsx
<div
  className="border-2 border-black bg-white shadow-[4px_4px_0_#000]"
  style={{ borderRadius: "0px" }}
>
  {/* Road curb stripe */}
  <div className="h-1.5 bg-yellow-400" />
  {/* Content */}
</div>
```

---

## 15. Deployment

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Hosting | Vercel | Next.js deployment |
| Database | Neon | Serverless PostgreSQL |
| Media | Cloudinary | Images + audio CDN |
| Domain | Custom | kesararamwithdigital.tech |

### Environment Variables

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
NEXT_PUBLIC_APP_URL=https://kesararamwithdigital.tech
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GROQ_API_KEY=...
OPENAI_API_KEY=...
```

### Security Headers

```typescript
// Applied to all routes
"X-Frame-Options": "DENY"
"X-Content-Type-Options": "nosniff"
"Referrer-Policy": "strict-origin-when-cross-origin"
```

### Database Migrations

```bash
# Run migration script
npx tsx scripts/run-subscription-migration.ts

# Drizzle kit
npm run db:migrate
npm run db:verify
```

### Build Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start production
npm run lint       # ESLint check
npm run test       # Run tests once
```

---

## 16. Testing

### Test Files

| File | Coverage |
|------|----------|
| `quiz-engine.test.ts` | Scoring algorithm |
| `fair-algorithm.test.ts` | Ranking calculations |
| `approval-workflow.test.ts` | Content approval |
| `progress-tracking.test.ts` | User progress |
| `admin-approval-api.test.ts` | Admin API endpoints |
| `ranking.test.ts` | Leaderboard logic |

### Test Commands

```bash
npm run test        # Run all tests once
npm run test:watch  # Watch mode
npm run test:ui     # Vitest UI dashboard
```

### Property-Based Testing

Uses `fast-check` for invariant testing on scoring and ranking algorithms:

```typescript
// Example: score is always non-negative
fc.assert(fc.property(
  fc.record({ isCorrect: fc.boolean(), difficulty: fc.string(), ... }),
  (params) => calculateScore(params).totalPoints >= 0
));
```

---

## Score Sync Flow (Post-Game)

```
Game Ends
  ↓
syncScoresToUserProfiles()
  ↓
For each participant:
  UPDATE users SET
    total_games_played = total_games_played + 1,
    lifetime_points    = lifetime_points + score,
    highest_score      = GREATEST(highest_score, score)
  WHERE id = participant.userId
  ↓
Leaderboard reflects new rankings
  ↓
Profile shows updated rank + stats
```

---

## Leaderboard Auto-Refresh

- Fetches on mount
- Auto-refreshes every 30 seconds
- Rank change animations: green arrow (up), red arrow (down)
- Top 3 podium: Gold / Silver / Bronze
- Excludes solo practice and guest scores

---

*Last updated: April 2026*
*Status: Production*
*Version: 1.0*
