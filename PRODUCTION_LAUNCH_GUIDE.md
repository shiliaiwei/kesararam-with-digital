# KWD Production Launch Guide

> Cambodia Driving Theory Platform — Official Release Checklist

---

## What Was Already Fixed

| File | Change |
|------|--------|
| `src/lib/auth.ts` | Removed `"kwd-fallback-secret"` fallback — now throws if `JWT_SECRET` is missing |
| `next.config.ts` | Removed `ignoreBuildErrors: true` — added HSTS, Permissions-Policy, DNS-Prefetch headers |

---

## ⚠️ Critical Warning

Passwords are hashed with **SHA-256** — it is fast, meaning brute-force is cheap.
Acceptable to ship now, but plan to migrate to **bcrypt** or **argon2** within the first month.

---

## Step 1 — Create Fresh Neon Database

1. Go to [neon.tech](https://neon.tech) → New Project
2. Name: `kwd-production`
3. Region: `ap-southeast-1` (Singapore — closest to Cambodia)
4. Copy the connection string:

```
postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

> Never reuse your dev database. Fresh DB = clean slate, no test data leaking into production.

---

## Step 2 — Run Migrations on Production DB

Temporarily set `.env.local` `DATABASE_URL` to the new Neon production URL, then run:

```bash
npm run db:migrate
npm run db:verify
```

After verify passes, revert `.env.local` back to your dev DB.

---

## Step 3 — Generate a Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the 128-character output. This is your `JWT_SECRET`.
Never reuse the dev secret.

---

## Step 4 — Create Production Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) → create a new cloud named `kwd-prod`
2. Settings → Access Keys → create a new API key pair
3. Copy: Cloud Name, API Key, API Secret

---

## Step 5 — Deploy to Vercel

1. Push code to GitHub — confirm `.env.local` is in `.gitignore`
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework: Next.js (auto-detected)
4. **Do not deploy yet** — configure environment variables first

In Vercel → Settings → Environment Variables, add all of the following:

```env
# Database
DATABASE_URL=postgresql://...neon-prod-url...?sslmode=require

# Auth
JWT_SECRET=<128-char hex from step 3>

# App URLs
NEXT_PUBLIC_APP_URL=https://kesararamwithdigital.tech
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.kesararamwithdigital.tech
NODE_ENV=production

# Cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@kwd-prod
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=kwd-prod
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google
GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PHOTOS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_API_KEY=...

# AI Services
GROQ_API_KEY=...
OPENAI_API_KEY=...
PERPLEXITY_API_KEY=...
IMAGINE_KEY=...
IMAGINE_TOKEN=Bearer ...
```

> For `GOOGLE_PHOTOS_PRIVATE_KEY` in Vercel — paste the full key with literal `\n` characters. Vercel handles newlines correctly.

5. Now deploy.

---

## Step 6 — Connect Your Domain

In Vercel → Settings → Domains:

- Add `kesararamwithdigital.tech`
- Add `dashboard.kesararamwithdigital.tech`

Vercel provides the DNS records to add in your domain registrar. HTTPS is automatic.

---

## Step 7 — Create Your First Admin User

After deploy, you need a seed admin account. Run this locally to generate the password hash:

```bash
node -e "
const crypto = require('crypto');
const pw = 'YOUR_STRONG_PASSWORD_HERE';
console.log(crypto.createHash('sha256').update(pw).digest('hex'));
"
```

Then open Neon's SQL Editor (neon.tech → your project → SQL Editor) and run:

```sql
INSERT INTO users (username, email, password_hash, role, is_active, login_attempts)
VALUES (
  'admin',
  'admin@kesararamwithdigital.tech',
  '<hash_from_above>',
  'admin',
  true,
  0
);
```

---

## Step 8 — Fix TypeScript Build Errors

The `ignoreBuildErrors` flag is now removed. Run:

```bash
npm run build
```

Fix any TypeScript errors that surface. These were silently hidden before — they are real bugs.

---

## Security Checklist

| Item | Status |
|------|--------|
| JWT fallback secret removed | ✅ Fixed |
| Cookie: `httpOnly` + `secure` + `sameSite` | ✅ Already good |
| Account lockout after 9 failed logins | ✅ Already good |
| IP rate limit on login (5 attempts / 60s) | ✅ Already good |
| `X-Frame-Options: DENY` | ✅ Already good |
| `Strict-Transport-Security` (HSTS) | ✅ Fixed |
| `Permissions-Policy` header | ✅ Fixed |
| Admin-only subscription assignment | ✅ Already good |
| Server-side score calculation (anti-cheat) | ✅ Already good |
| `DATABASE_URL` throws if missing | ✅ Already good |
| `.env.local` in `.gitignore` | ✅ Verify manually |
| SHA-256 passwords | ⚠️ Plan to migrate to bcrypt |
| In-memory IP rate limiter (resets on restart) | ⚠️ Fine for now — use Redis later |
| TypeScript build errors ignored | ✅ Fixed — must resolve before deploy |

---

## Post-Launch First Week Checklist

- [ ] Log in as admin, create your first teacher account
- [ ] Test a live game session end-to-end
- [ ] Verify Cloudinary image uploads work
- [ ] Check AI chat (Suar) responds correctly
- [ ] Monitor Neon dashboard for query performance
- [ ] Set Vercel spend limits — Settings → Billing — to avoid surprise bills
- [ ] Enable Neon connection pooling if expecting more than 50 concurrent users

---

## Known Risks — Plan to Fix After Launch

### 1. SHA-256 Password Hashing (High Priority)
SHA-256 is not designed for passwords. Migrate to bcrypt within the first month.

Files to update:
- `src/app/actions/auth.ts` — `hashPassword()` function
- `src/app/actions/users.ts` — `hashPassword()` function

Migration plan: on next login, re-hash with bcrypt and update the stored hash.

### 2. In-Memory Rate Limiter (Medium Priority)
The IP rate limiter in `src/app/actions/auth.ts` uses a `Map` in memory.
It resets on every Vercel cold start, meaning the 5-attempt limit can be bypassed.

Fix: replace with [Upstash Redis](https://upstash.com) or Vercel KV.

### 3. SSE Timeout on Vercel Hobby Plan (Medium Priority)
Live game sessions use Server-Sent Events (SSE). Vercel Hobby plan has a 30-second function timeout.
For live games with longer sessions, upgrade to Vercel Pro or configure `maxDuration` in route config.

---

## Architecture Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | JWT (HS256) in HTTP-only cookie |
| Media | Cloudinary |
| AI | Groq, OpenAI, Google, Perplexity |
| Real-time | Server-Sent Events (SSE) |
| Hosting | Vercel |
| i18n | next-intl (English + Khmer) |

---

## Full Technology Stack

### Core Framework

| Technology | Version | Role |
|-----------|---------|------|
| Next.js | 16.1.6 | Full-stack React framework — App Router, Server Actions, API Routes |
| React | 19.2.3 | UI rendering — concurrent features, server components |
| TypeScript | 5.x | Static typing across the entire codebase |
| Node.js | 20.x | Server runtime for API routes and server actions |

### Rendering Strategy

The app uses a hybrid rendering model:

- Server Components — default for all pages (zero client JS unless needed)
- Client Components — only for interactive UI (game, chat, forms)
- Server Actions — form submissions, auth, user mutations (no API round-trip)
- API Routes — game sessions, SSE streams, AI chat, Cloudinary uploads

### Database

| Technology | Version | Role |
|-----------|---------|------|
| PostgreSQL | 16 (Neon) | Primary relational database |
| Neon Serverless | 1.0.2 | HTTP-based Postgres driver — works in Vercel Edge/Serverless |
| Drizzle ORM | 0.45.1 | Type-safe SQL query builder and schema manager |
| Drizzle Kit | 0.31.9 | Migration generator and schema push tool |

Database connection uses the Neon HTTP driver (`@neondatabase/serverless`) instead of a traditional TCP connection — this is required for Vercel's serverless environment where persistent connections are not supported.

### Database Schema — All Tables

| Table | Purpose |
|-------|---------|
| `users` | All user accounts — students, teachers, admin, staff |
| `sessions` | Login session tracking — IP, user agent, active/logout state |
| `categories` | 8 knowledge categories (traffic signs, road law, etc.) |
| `topics` | Topic-level content with bilingual fields (EN/KH) |
| `questions` | Question bank — linked to topics |
| `answers` | Answer options per question — MCQ, true/false, image selection |
| `content_items` | Legacy content model — flashcards, Q&A items |
| `flashcards` | Front/back flashcard pairs linked to content items |
| `content_approvals` | Approval audit trail for content items |
| `traffic_signs` | Traffic sign library with approval workflow |
| `traffic_sign_approvals` | Approval audit trail for traffic signs |
| `road_markings` | Road marking reference data (curbs, signals, longitudinal) |
| `game_sessions` | Live multiplayer game sessions with 6-char codes |
| `game_participants` | Players in a live session with scores and streaks |
| `game_session_answers` | Append-only answer records per participant (anti-cheat) |
| `challenge_sessions` | Teacher-led challenge sessions |
| `challenge_participants` | Participants in challenge sessions |
| `daily_challenge_sets` | Daily challenge question pools |
| `quizzes` | Quiz definitions |
| `quiz_questions` | Questions assigned to a quiz |
| `quiz_attempts` | User quiz attempt records |
| `quiz_answers` | Per-question answer records within an attempt |
| `leaderboard_entries` | Rankings by period (weekly / monthly / all-time) |
| `user_progress` | Per-user content completion tracking |
| `user_streaks` | Daily play streak tracking |
| `game_scores` | Historical game score records |
| `subscriptions` | Plan assignments (free / teacher_pro / school) |
| `media_resources` | Cloudinary and external media registry |
| `content_media` | Content-to-media relationship table |
| `game_mode_content` | Content linked to specific game modes |
| `game_modes` | Game mode definitions |
| `learning_mode_settings` | Per-topic learning mode configuration |
| `staff_category_assignments` | Which categories each staff member manages |
| `staff_activity_metrics` | Staff action tracking (create, update, submit) |
| `admin_review_metrics` | Admin review time and action tracking |
| `audit_logs` | System-wide audit trail — all sensitive actions |

### Authentication & Security

| Technology | Role |
|-----------|------|
| jose 6.x | JWT signing and verification (HS256 algorithm) |
| HTTP-only cookies | Token storage — inaccessible to JavaScript |
| SHA-256 (crypto) | Password hashing (built-in Node.js — no external dep) |
| IP rate limiting | In-memory Map — 5 login attempts per 60 seconds per IP |
| Account lockout | 9 failed attempts → 24-hour lock |
| Session invalidation | All previous sessions invalidated on new login |
| Role-based access | student / teacher / admin / staff — enforced server-side |

Token expiry by role:
- student: 7 days
- teacher / admin / staff: 8 hours

### Real-Time Communication

| Technology | Role |
|-----------|------|
| Server-Sent Events (SSE) | One-way server → client push for live game state |
| In-process event bus | `Map<sessionCode, Set<ReadableStreamDefaultController>>` |
| EventSource API | Browser-native SSE client — no library needed |
| Exponential backoff | Auto-reconnect on disconnect — up to 5 retries, max 30s delay |

SSE event types broadcast during a live game:
- `lobby_update` — participant list changes
- `question_start` — new question with timer window
- `question_end` — correct answer revealed + leaderboard
- `leaderboard` — live ranking update
- `session_paused` / `session_resumed`
- `session_end` — final podium and leaderboard
- `ping` — keepalive
- `warning` — host messages

### AI Services

| Service | Model | Role |
|---------|-------|------|
| OpenAI | gpt-4o-mini | Primary AI for Suar conversational assistant |
| Groq | llama3-8b-8192 | Fallback AI when OpenAI is unavailable |
| Google APIs | Gemini / Vision | Additional AI capabilities |
| Perplexity | — | Search-augmented AI queries |

The AI chat system uses a cascade pattern: OpenAI first → Groq fallback → 503 error. The system prompt is locked to Cambodia driving theory topics only, responds in Khmer by default, and caps messages at 2000 characters and history at 20 turns.

### Media Management

| Technology | Role |
|-----------|------|
| Cloudinary | Image and audio hosting — CDN delivery |
| next-cloudinary 6.x | Next.js Cloudinary integration — optimized image component |
| Google Photos API | Service account access to Google Photos albums |
| googleapis 171.x | Google API client for Photos integration |

Media sources tracked per content item: `url` (external) or `cloudinary` (managed). Audio supported in both English and Khmer per content item.

### UI & Styling

| Technology | Version | Role |
|-----------|---------|------|
| Tailwind CSS | 4.x | Utility-first CSS — no custom CSS files |
| @tailwindcss/postcss | 4.x | PostCSS integration for Tailwind v4 |
| shadcn/ui | 4.0.3 | Accessible component primitives |
| @base-ui/react | 1.2.0 | Headless UI primitives |
| lucide-react | 0.577.0 | Icon library |
| react-icons | 5.6.0 | Extended icon set |
| tw-animate-css | 1.4.0 | CSS animation utilities for Tailwind |
| next-themes | 0.4.6 | Dark/light mode theming |
| vaul | 1.1.2 | Drawer component |
| sonner | 2.0.7 | Toast notifications |

Design system: Neo-Brutalism — sharp corners (0px border-radius), 2–4px solid black borders, hard offset shadows (`4px 4px 0 #000`), no gradients, no blur.

### Data Visualization & Tables

| Technology | Version | Role |
|-----------|---------|------|
| Recharts | 2.15.4 | Charts for analytics dashboards |
| @tanstack/react-table | 8.21.3 | Headless table with sorting, filtering, pagination |

### Drag & Drop

| Technology | Version | Role |
|-----------|---------|------|
| @dnd-kit/core | 6.3.1 | Drag-and-drop engine |
| @dnd-kit/sortable | 10.0.0 | Sortable list implementation |
| @dnd-kit/modifiers | 9.0.0 | Drag constraint modifiers |
| @dnd-kit/utilities | 3.2.2 | DnD utility helpers |

Used in content management for reordering questions and answers.

### Animation

| Technology | Version | Role |
|-----------|---------|------|
| GSAP | 3.14.2 | High-performance animations — hero section, transitions |

### Internationalization

| Technology | Version | Role |
|-----------|---------|------|
| next-intl | 4.8.3 | i18n routing and translation loading |
| Custom `t` object | — | Static translation map in `src/lib/translations.ts` |

Supported languages: English (`en`) and Khmer (`kh`). All content items store bilingual fields: `titleEn` / `titleKm`, `descriptionEn` / `descriptionKm`, `questionEn` / `questionKm`, `answerEn` / `answerKm`. Audio also stored per language.

### Validation

| Technology | Version | Role |
|-----------|---------|------|
| Zod | 4.3.6 | Runtime schema validation for API inputs |

### Testing

| Technology | Version | Role |
|-----------|---------|------|
| Vitest | 4.1.0 | Unit and integration test runner |
| fast-check | 4.6.0 | Property-based testing — generates random inputs to find edge cases |
| @vitest/ui | 4.1.0 | Visual test UI |

Test files cover: quiz engine, fair algorithm, ranking system, approval workflow, content creation, progress tracking, file upload, inactive content exclusion.

### Deployment & Infrastructure

| Technology | Role |
|-----------|------|
| Vercel | Hosting — serverless functions, CDN, automatic HTTPS |
| Neon | Serverless PostgreSQL — auto-scaling, branching, HTTP driver |
| GitHub | Source control and CI/CD trigger |

---

## Algorithms

### 1. Scoring Algorithm (`src/lib/game-engine.ts`)

Used in every live game session and solo quiz.

```
totalPoints = baseScore + speedBonus + streakBonus
```

Base score by difficulty:
- easy → 1 point
- medium → 2 points
- hard → 3 points

Speed bonus (speed mode only):
```
speedBonus = floor(baseScore × (remainingTimeMs / totalTimeMs))
```

Streak bonus (consecutive correct answers):
- 2–3 correct → +1
- 4–5 correct → +2
- 6+ correct → +3

Equal mode: speed bonus is always 0. Only base + streak count.

### 2. Fair Question Selection Algorithm (`src/lib/fair-algorithm.ts`)

Used in solo practice and quiz modes to prevent repetition and target weak areas.

Steps:
1. Fetch user's last 100 quiz answers for the category
2. Identify weak topics — subtopics with < 60% correct rate over 3+ attempts (max 3 weak topics returned)
3. Exclude recently answered questions — last 50 question IDs filtered out
4. Group remaining questions by subtopic
5. Allocate 40% of the question count to weak topics (prioritized)
6. Fill remaining 60% with balanced distribution across all subtopics (round-robin)
7. Fisher-Yates shuffle the final selection
8. Return exactly `questionCount` questions

### 3. Fisher-Yates Shuffle (`src/app/api/game/sessions/route.ts`)

Used when creating a live game session to randomize question order so all players see questions in a different sequence.

```
for i from length-1 down to 1:
  j = random integer from 0 to i
  swap(array[i], array[j])
```

### 4. Game State Machine (`src/lib/game-engine.ts`)

Valid state transitions for a game session:

```
lobby  →  active  →  paused  →  active
                  ↓             ↓
                ended         ended
lobby  →  ended (host cancels before start)
```

Any transition not in this map is rejected server-side.

### 5. Ranking Algorithm (`src/lib/ranking.ts`)

Runs after every quiz or challenge completion. Updates all three leaderboard periods simultaneously.

Steps:
1. Calculate `periodStart` for weekly (Sunday), monthly (1st), and all-time (epoch)
2. Upsert leaderboard entry — increment score, correctAnswers, totalAttempts
3. Re-rank all entries for that period: sort by `score DESC`, then `correctAnswers DESC`
4. Write rank integers back to each row

Runs for both category-specific and overall (null categoryId) leaderboards.

### 6. Subscription Enforcement (`src/lib/subscription.ts`)

Checked before every session creation:

1. Fetch active subscription for the host (falls back to free plan on any DB error — never blocks)
2. Count sessions created this calendar month by the host
3. If `used >= limits.maxSessionsPerMonth` → block with upgrade message
4. If `requestedMaxPlayers > limits.maxPlayersPerSession` → block with upgrade message
5. Admin role bypasses all checks

Plan limits:

| Plan | Max Players | Sessions/Month |
|------|------------|----------------|
| free | 10 | 1 |
| teacher_pro | 50 | unlimited |
| school | 200 | unlimited |

### 7. Content Type Detection (`src/lib/game-engine.ts`)

Maps a question's answer count and media to a game type:

```
answerCount == 2                          → true_false
hasImage AND 2 ≤ answerCount ≤ 4         → image_pick
otherwise                                 → mcq
```

Used to filter compatible questions when creating a session for a specific game mode.

### 8. SSE Event Bus (`src/lib/game-event-bus.ts`)

In-process pub/sub for live game events. No external message broker.

```
Map<sessionCode → Set<ReadableStreamDefaultController>>
```

- `subscribe(code, ctrl)` — adds a stream controller when a client connects
- `unsubscribe(code, ctrl)` — removes on disconnect; deletes the key when the set is empty
- `broadcast(code, event)` — serializes event as `data: {...}\n\n` and enqueues to all controllers
- Failed enqueues (disconnected clients) are silently ignored

### 9. Web Audio Synthesis (`src/lib/game-sounds.ts`)

All game sounds are synthesized at runtime using the Web Audio API — no audio files needed.

Techniques used:
- Oscillator nodes — sine, square, sawtooth waveforms for tones
- Exponential gain ramp — natural sound decay
- White noise buffer + bandpass filter — synthesized clap/snap effects
- Scheduled playback — multiple tones queued with `startDelay` offsets for chords and fanfares

Sound events: correct answer, incorrect answer, countdown tick, urgent tick, question start/end, game end, crowd clapping, cheer, rank 1/2/3 fanfares, podium, streak, warning.

### 10. IP Rate Limiting (`src/app/actions/auth.ts`)

Simple in-memory sliding window per IP address:

```
Map<"login:{ip}" → { count: number, resetAt: timestamp }>
```

- Window: 60 seconds
- Limit: 5 attempts per window
- On exceed: returns wait time in seconds
- Resets automatically when `resetAt` passes

Note: resets on Vercel cold start. Plan to replace with Redis for production scale.

### 11. Account Lockout (`src/app/actions/auth.ts`)

Progressive lockout on failed password attempts:

- Increments `loginAttempts` counter on each wrong password
- At 9 failed attempts: sets `lockedUntil = now + 24 hours`
- On successful login: resets `loginAttempts = 0`, clears `lockedUntil`
- Locked accounts show a generic "contact administrator" message

### 12. Session Code Generation (`src/lib/game-engine.ts`)

Generates a 6-character alphanumeric code for live game sessions:

```
charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
code = 6 random chars from charset
```

Collision check: up to 10 attempts to find a code not currently in use as an active lobby. Probability of collision is negligible at normal scale (36^6 = ~2.1 billion combinations).

---

## API Surface

### Auth
- `POST /api/auth/me` — get current session user

### Game
- `POST /api/game/sessions` — create live session (teacher/admin)
- `GET /api/game/sessions` — list sessions for current user
- `GET /api/game/sessions/[code]` — get session state
- `POST /api/game/sessions/[code]/join` — join as participant
- `POST /api/game/sessions/[code]/answer` — submit answer
- `POST /api/game/sessions/[code]/next` — advance to next question (host)
- `POST /api/game/sessions/[code]/end` — end session (host)
- `GET /api/game/sessions/[code]/events` — SSE stream
- `GET /api/game/solo` — start solo practice session
- `GET /api/game/categories` — categories available for game

### Quiz
- `POST /api/quiz/start` — start a quiz attempt
- `POST /api/quiz/answer` — submit answer in quiz
- `POST /api/quiz/complete` — finalize quiz attempt
- `GET /api/quiz/history` — user quiz history

### Content
- `GET /api/content/[categorySlug]` — public content for a category
- `POST /api/content/create` — create content item (staff)
- `PUT /api/content/update` — update content item (staff)
- `POST /api/content/upload` — upload media for content

### Admin
- `GET /api/admin/users-with-plans` — all users with subscription data
- `GET /api/admin/pending-content` — content awaiting review
- `POST /api/admin/approve/[contentId]` — approve content
- `POST /api/admin/reject/[contentId]` — reject content
- `GET /api/admin/subscriptions` — all subscriptions
- `POST /api/admin/subscriptions` — assign subscription
- `GET /api/admin/login-metrics` — login attempt analytics

### Staff
- `GET /api/staff/topics` — topics managed by staff
- `POST /api/staff/topics` — create topic
- `GET /api/staff/content` — content items for staff
- `GET /api/staff/analytics` — staff activity metrics

### AI
- `POST /api/ai/chat` — Suar AI conversational assistant

### Leaderboard
- `GET /api/leaderboard` — global leaderboard by period
- `GET /api/leaderboard/user` — current user's ranking

### User
- `GET /api/user/stats` — user statistics
- `PUT /api/user/settings` — update user settings
- `PUT /api/user/preferences` — update preferences
- `PUT /api/user/account` — update account details

### Misc
- `GET /api/health` — deployment health check
- `POST /api/log-error` — client-side error reporting
- `GET /api/traffic-signs` — traffic sign library
- `GET /api/categories` — all categories
- `GET /api/public/topics` — public topic listing
- `GET /api/leaderboard` — public leaderboard
