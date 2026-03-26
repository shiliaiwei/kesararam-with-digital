# KWD — Kesararam With Digital

Cambodian driving knowledge and licensing education platform. Master traffic signs, road laws, and driving theory.

## Design System

### Design Philosophy: Neo-Brutalism

The website follows a neo-brutalist design approach inspired by road markings and traffic safety aesthetics. This creates a bold, functional, and highly accessible interface that mirrors the clarity and directness of road signage.

### Core Visual Principles

- **Sharp corners only**: border-radius: 0 (enforced with inline styles)
- **No gradients**: Solid colors exclusively
- **Bold black borders**: 2px standard, 4px for emphasis
- **Hard shadows**: Offset box-shadows with no blur
- **High contrast**: Black borders on white/colored backgrounds
- **No emoji**: Text-only labels and descriptions
- **Traffic-light colors**: Semantic color system inspired by road safety

### Shape & Structure

#### Border System
```css
/* Standard borders */
border-2 border-black           /* Default for all interactive elements */
border-4 border-black           /* Emphasis (hero cards, featured content) */
border-2 border-yellow-400      /* Yellow accent borders */

/* Caution borders */
border-2 border-[ #ef4444 ]       /* Alert/warning states */
border-b-4 border-yellow-400    /* Section dividers */
```

#### Corner Radius
```tsx
/* Always sharp corners - enforced with inline styles */
style={{ borderRadius: "0px" }}
className="rounded-none"
```

#### Shadow System (Hard Shadows)
```css
/* Neo-brutalism shadows - no blur, pure offset */
shadow-[2px_2px_0_#000]         /* Small - badges, tags, icons */
shadow-[3px_3px_0_#000]         /* Medium - inputs, small cards */
shadow-[4px_4px_0_#000]         /* Large - standard cards, buttons */
shadow-[6px_6px_0_#000]         /* XL - hover states, emphasis */
shadow-[8px_8px_0_#000]         /* XXL - hero elements, featured cards */

/* Colored shadows for specific contexts */
shadow-[4px_4px_0_#eab308]      /* Yellow shadow for CTAs */
shadow-[6px_6px_0_#eab308]      /* Yellow shadow hover state */
```

#### Interactive States
```css
/* Hover: Lift effect */
hover:-translate-x-0.5 hover:-translate-y-0.5
hover:shadow-[6px_6px_0_#000]
hover:-translate-x-1 hover:-translate-y-1
hover:shadow-[8px_8px_0_#000]

/* Active: Press down effect */
active:translate-x-[2px] active:translate-y-[2px]
active:shadow-none

/* Color transitions */
hover:bg-black hover:text-white
transition-all duration-100
transition-all duration-150
```

### Color Palette

#### Traffic-Light Semantic Colors
Inspired by road safety and traffic signals:

```css
/* Primary colors */
--kwd-yellow: #eab308          /* Primary/Warning - Road signs, CTAs */
--kwd-blue: #3b82f6            /* Info/Signals - Traffic lights, links */
--kwd-green: #22c55e           /* Success/Go - Active states, confirmations */
--kwd-red: #ef4444             /* Danger/Stop - Alerts, errors */
--kwd-orange: #f97316          /* Caution - Warning zones, attention */

/* Accent colors */
--kwd-cyan: #06b6d4            /* Accent - Highlights, decorative */
--kwd-purple: #a855f7          /* Special - Premium features, mixed modes */
--kwd-rose: #fda4af            /* Alert background - Soft warnings */



#### Color Usage Patterns

```tsx
/* Hero sections */
bg-yellow-400 border-b-2 border-black

/* Game mode cards */
bg-white border-2 border-black shadow-[4px_4px_0_#000]

/* CTAs */
bg-black text-white border-2 border-black shadow-[4px_4px_0_#000]
bg-yellow-400 text-black border-2 border-yellow-400 shadow-[4px_4px_0_#eab308]

/* Badges */
bg-black text-white px-3 py-1.5 rounded-none
bg-yellow-400 text-black border-2 border-black

/* Icon containers */
border-2 border-black shadow-[2px_2px_0_#000]
style={{ backgroundColor: color }} /* Dynamic color per category */
```

### Typography

#### Font Families
```css
/* Khmer fonts */
--font-kh-header: "Kantumruy Pro", sans-serif  /* Headers, bold text */
--font-kh-body: "Siemreap", sans-serif         /* Body text, paragraphs */

/* Latin fonts */
--font-sans: Inter, sans-serif                  /* Default sans-serif */
```

#### Font Weights & Styles
```css
/* Headers */
font-black (900)                /* Primary headings */
uppercase                       /* All caps for emphasis */
tracking-tighter                /* Tight letter spacing for large text */
tracking-widest                 /* Wide spacing for small labels */

/* Body text */
font-medium (500)               /* Regular body text */
font-bold (700)                 /* Emphasized text, labels */
leading-none                    /* Tight line height for headings */
leading-relaxed                 /* Comfortable reading for paragraphs */

/* Labels & badges */
text-xs font-black uppercase tracking-widest
text-sm font-bold uppercase
```

#### Typography Scale
```tsx
/* Headings */
text-7xl font-black             /* Hero titles (mobile: text-5xl) */
text-5xl font-black             /* Page titles */
text-4xl font-black             /* Section titles */
text-3xl font-black             /* Subsection titles */
text-2xl font-black             /* Card titles */
text-xl font-black              /* Small card titles */

/* Body */
text-lg                         /* Large body text, descriptions */
text-sm                         /* Standard body text */
text-xs                         /* Small text, labels */
text-[10px]                     /* Micro text, metadata */
text-[11px]                     /* Tiny labels */
```

### Background Patterns

#### Grid Background
```css
.grid-bg {
  background-image: 
    linear-gradient(rgba(6, 182, 212, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.07) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

#### Dot Background
```css
.dot-bg {
  background-image: radial-gradient(
    circle, 
    rgba(59, 130, 246, 0.18) 1px, 
    transparent 1px
  );
  background-size: 24px 24px;
}
```

#### Caution Tape
```tsx
/* Decorative warning pattern */
<div className="h-1.5 bg-[repeating-linear-gradient(-45deg,#eab308_0px,#eab308_12px,#000000_12px,#000000_24px)]" />
```

### Component Patterns

#### Hero Section
```tsx
<section className="bg-yellow-400 border-b-2 border-black py-16">
  <div className="max-w-7xl mx-auto px-6">
    <div className="inline-block bg-black text-white text-xs font-black 
                    tracking-widest uppercase px-3 py-1.5 rounded-none">
      Label
    </div>
    <h1 className="text-5xl md:text-7xl font-black text-black leading-none">
      Title
    </h1>
    <p className="text-lg text-black/70 max-w-lg leading-relaxed">
      Description text
    </p>
  </div>
</section>
```

#### Neo-Brutalist Card
```tsx
<div className="bg-white border-2 border-black rounded-none p-6 
                shadow-[4px_4px_0_#000] 
                hover:shadow-[8px_8px_0_#000] 
                hover:-translate-x-1 hover:-translate-y-1 
                transition-all duration-150">
  {/* Content */}
</div>
```


#### Button Variants
```tsx
/* Primary CTA */
<button className="px-6 py-3 bg-black text-white font-black 
                   border-2 border-black rounded-none 
                   shadow-[4px_4px_0_#000] 
                   hover:shadow-[6px_6px_0_#000] 
                   hover:-translate-x-0.5 hover:-translate-y-0.5 
                   transition-all duration-100">
  Click Me
</button>

/* Secondary CTA */
<button className="px-6 py-3 bg-white text-black font-black 
                   border-2 border-black rounded-none 
                   shadow-[4px_4px_0_#000] 
                   hover:shadow-[6px_6px_0_#000] 
                   hover:-translate-x-0.5 hover:-translate-y-0.5 
                   transition-all duration-100">
  Click Me
</button>

/* Yellow accent CTA */
<button className="px-8 py-4 bg-yellow-400 text-black font-black 
                   border-2 border-yellow-400 rounded-none 
                   shadow-[4px_4px_0_#eab308] 
                   hover:shadow-[6px_6px_0_#eab308] 
                   hover:-translate-x-0.5 hover:-translate-y-0.5 
                   transition-all duration-100">
  Start Now
</button>

/* Small action button */
<button className="px-3 py-1.5 text-xs font-black uppercase 
                   tracking-widest border-2 border-black 
                   bg-white text-black shadow-[2px_2px_0_#000] 
                   hover:bg-black hover:text-white 
                   active:shadow-none active:translate-x-[2px] 
                   active:translate-y-[2px] transition-colors">
  Action
</button>
```

#### Badge/Tag
```tsx
/* Black badge */
<span className="inline-block bg-black text-white text-xs font-black 
                 tracking-widest uppercase px-3 py-1.5 rounded-none">
  Label
</span>

/* Colored badge with border */
<span className="text-[10px] font-black tracking-widest uppercase 
                 px-2.5 py-1 border-2 border-black rounded-none"
      style={{ backgroundColor: color }}>
  Badge
</span>

/* Small tag */
<span className="px-1.5 py-0.5 text-[10px] font-black uppercase 
                 border border-black bg-black text-white">
  Tag
</span>
```

#### Icon Container
```tsx
<div className="w-12 h-12 border-2 border-black rounded-none 
                flex items-center justify-center shadow-[2px_2px_0_#000]"
     style={{ backgroundColor: color }}>
  <Icon size={20} className="text-black" />
</div>
```

#### Stats Card
```tsx
<div className="border-2 border-black rounded-none p-5 
                shadow-[4px_4px_0_#000] flex flex-col gap-1">
  <span className="text-3xl font-black" style={{ color }}>
    500+
  </span>
  <span className="text-sm font-bold text-zinc-600">
    Label
  </span>
</div>
```

#### Profile/Identity Card
```tsx
<div className="border-2 border-black bg-white shadow-[4px_4px_0_#000] 
                overflow-hidden">
  {/* Color bar accent */}
  <div className="h-1.5" style={{ background: color }} />
  
  <div className="flex items-center gap-5 p-5">
    <div className="border-2 border-black shadow-[4px_4px_0_#000]">
      {/* Avatar */}
    </div>
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-black text-black leading-none">
        Name
      </h2>
      <p className="text-sm text-zinc-500 font-medium">
        Email
      </p>
    </div>
  </div>
</div>
```

#### Tab Navigation
```tsx
<div className="flex border-2 border-black shadow-[4px_4px_0_#000] 
                overflow-hidden">
  <button className={`flex-1 flex items-center justify-center gap-2 
                      py-2.5 text-xs font-black uppercase tracking-widest 
                      transition-colors border-l-2 border-black first:border-l-0
                      ${active ? 'bg-black text-white' : 'bg-white text-black hover:bg-yellow-400'}`}>
    <Icon className="size-3.5" />
    Tab Label
  </button>
</div>
```

### Layout Structure

#### Dashboard Theme
```css
.kwd-dash {
  --background: #1e2430      /* Dark blue-gray background */
  --foreground: #f0f2f5      /* Light text */
  --primary: #ffd700         /* Yellow accent */
  --card: #252d3d            /* Card background */
  --sidebar: #1a2035         /* Sidebar dark */
}
```

#### Spacing System
```css
/* Consistent Tailwind spacing */
gap-2, gap-3, gap-4, gap-5, gap-6    /* Flexbox/grid gaps */
p-4, p-5, p-6                        /* Card padding */
px-3, px-6, py-2, py-3, py-4         /* Button padding */
space-y-2, space-y-4, space-y-6      /* Vertical spacing */
```

#### Container Widths
```css
max-w-7xl mx-auto px-6               /* Standard page container */
max-w-4xl mx-auto px-6               /* Narrow content */
max-w-2xl                            /* Forms, profiles */
max-w-lg, max-w-xl                   /* Text blocks */
```

### Accessibility Features

- High contrast ratios (black borders on colored backgrounds)
- Clear focus states with ring utilities
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Grayscale images with color on hover for visual hierarchy

### Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4 with custom utilities
- **UI Components**: shadcn/ui (base-nova style)
- **Icons**: Lucide React
- **Database**: Drizzle ORM with Neon PostgreSQL
- **Media**: Cloudinary
- **Internationalization**: next-intl (EN/KH)

### File Structure

```
src/
├── app/
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin panel
│   │   └── teacher/        # Teacher panel
│   ├── (public)/           # Public pages
│   └── globals.css         # Global styles & tokens
├── components/
│   ├── ui/                 # Base UI components
│   ├── dashboard/          # Dashboard-specific
│   ├── shared/             # Shared components
│   └── categories/         # Category components
└── lib/                    # Utilities & helpers
```

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Design Guidelines Summary

1. **Always use 2px black borders** on interactive elements (4px for emphasis)
2. **Apply hard shadows** (no blur) with varied sizes: 2px, 3px, 4px, 6px, 8px
3. **Keep corners sharp** - border-radius: 0 (enforced with inline styles)
4. **Use traffic-light colors** for semantic meaning
5. **Maintain high contrast** for accessibility
6. **Apply hover/active states** with translate + shadow changes
7. **Use uppercase + bold** for emphasis
8. **No gradients or emoji** - keep it brutalist
9. **Colored shadows** for yellow CTAs (#eab308)
10. **Grayscale to color** on hover for images




The Animation Logic
The Animation Logic

remove the traffic icon, all .  and let create new desgin animation roads loop using this style Function of Longitudinal Markings , and Index of Guide Posts, SINGLE YELLOW BROKEN LINE,SINGLE YELLOW SOLID LINE,DOUBLE YELLOW SOLID LINE, DOUBLE YELLOW COMBINATION LINE,DOUBLE YELLOW COMBINATION LINE, SINGLE WHITE BROKEN LINE, WHITE SINGLE SOLID LINE, EDGE LINE, YELLOW-WHITE CURB MARKINGS, RED-WHITE CURB MARKINGS, YELLOW-BLACK MARKINGS ON ROAD DEVIDER BLOCK,  crreate animation loop roads using these style 



 make it design by code to make animation The Animation Logic , take it long and perfect







 The Vienna Convention on Road Signs and Signals

 In article 2 the convention classes all road signs into a number of categories (A–H):

A: Danger warning signs
B: Priority signs
C: Prohibitory or restrictive signs
D: Mandatory signs
E: Special regulation signs
F: Information, facilities, or service signs
G: Direction, position, or indication sign
H: Additional panels


https://gettingaroundgermany.info/parken.shtml
https://www.roadtrafficsigns.com/
https://unece.org/road-traffic-and-road-signs-and-signals-agreements-and-conventions

List of questions (classic view)
What is the correct way to navigate multiple mini-roundabouts?
You have stopped at a red light. The traffic light changes to red and amber. What should you do?
Which vehicles are turning correctly at this roundabout?
When can you drive in a bus lane?
What does this sign mean?
You stop at a pelican crossing with a central island. The light turns green, but someone is still crossing. What should you do?
When can you drive in an operational cycle lane?
You see this sign at the edge of the motorway. What does it mean?
What does this sign mean?
What does this sign mean?
What does this sign mean?
You have arrived at a narrow junction where a lorry is turning. What should you do here?
Where should you start indicating for the left turn pictured?
You wish to cross this dual carriageway. How should you cross?
You see this sign on the motorway. What does it mean?
What does this sign mean?
You see this flashing amber sign on the motorway. What does it mean?
You see children playing on the road in a Home Zone. What should you do?
You are on a single carriageway with three lanes. Who may drive in the centre lane?
You have arrived at a box junction and you have a green light. Can you enter the junction before your path is clear?
What is a Red Route?
Where will you find this sign?
What does this sign mean?
What does this sign mean?
What does this sign mean?
Three cars arrive at a junction. Which cars have priority?
What does this sign mean?
You are waiting for a gap in traffic so you can turn right onto a minor road. Where should you wait?
You see a painted triangle on the road ahead. What does this marking mean?
You arrive at an amber traffic light. What should you do?
You are driving an ordinary car along the motorway. Can you enter this HOV lane?
Two cars are turning right at a junction. In which scenarios are both cars turning legally?
You arrive at a red traffic light with a bike lane and two stop lines. You should stop
What does this sign mean?
Where will you find this sign?
You are on the motorway and you see this sign. What does it mean?
What does this sign mean?
What does this sign mean?
What does this sign mean?
You are on a single-track road and you encounter an oncoming vehicle. What should you do?
What does this sign mean?
You stop at a zebra crossing to let a pedestrian cross. When can you proceed?
You arrive at a section of road bordered by a pair of red lines. What do these lines mean?
What does this sign mean?
You stop at a zebra crossing with a central island to let a pedestrian cross. When can you proceed?
You see this signal on the motorway. What does it mean?
After seeing this sign, what should you beware of?
What precautions should you take when you drive down a steep hill?
You see this sign by the roadside. What is ahead?
What does this sign mean?
















































eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OWMwMmIyNmU0OTQ3M2FkNDRhZjg2NmMiLCJ1c2VySWQiOiI2OWMwMmE0OTQ2NzY0OGNkZWJiZDNmMGEiLCJ2IjozLCJ0eXBlIjoiYXBpX2tleSIsImlhdCI6MTc3NDIwMTYzOCwiZXhwIjo0OTI3ODAxNjM4fQ.OCtulYunvXs6UkrqVBTjAGEQmzXxTPAWIGQuQ6IriYI








































Checkpoint
Restore
let build this shit! make me supprise! and logic.  stop write  document or readme.md start write the code product logic, and more intereacting interface focus, restrict using emoji or any sybole u, using icons only. start serite the code product base on this structure . # Design Document: Kahoot-Style Quiz Game

## Overview

This document describes the technical design for the Kahoot-style live quiz game system built on top of the existing KWD Next.js / PostgreSQL / Drizzle ORM stack. The system adds teacher-hosted live game sessions, solo practice mode, a speed-based scoring engine, real-time leaderboards via Server-Sent Events (SSE), and post-game analytics — all bilingual (English / Khmer) with a neobrutalist Tailwind UI.

The design deliberately keeps the server as the single source of truth for all game state and scoring. Clients are display terminals only; they send minimal input and receive authoritative state updates.

---

## Architecture

```mermaid

graph TD

  subgraph Client

    TC[Teacher Dashboard\n/teacher/sessions/host]

    SC[Student Play Page\n/play/[code]]

    SP[Solo Practice\n/play/solo]

  end

  subgraph Next.js API Routes

    GS[POST /api/game/sessions]

    GJ[POST /api/game/sessions/[code]/join]

    GC[POST /api/game/sessions/[code]/control]

    GA[POST /api/game/sessions/[code]/answer]

    GE[GET  /api/game/sessions/[code]/events  SSE]

    AN[GET  /api/game/sessions/[code]/analytics]

    SL[POST /api/game/solo]

  end

  subgraph Game Engine

    SM[State Machine]

    SQ[Question Selector]

    SC2[Score Calculator]

    LB[Leaderboard Builder]

    EB[SSE Event Bus]

  end

  subgraph Database - Neon PostgreSQL

    CS[game_sessions]

    CP[game_participants]

    GSA[game_session_answers\nappend-only]

    GS2[game_scores]

    LE[leaderboard_entries]

    Q[questions + answers]

  end

  TC -->|HTTP POST| GS

  TC -->|HTTP POST| GC

  SC -->|HTTP POST| GJ

  SC -->|HTTP POST| GA

  SC -->|SSE| GE

  TC -->|SSE| GE

  SP -->|HTTP POST| SL

  GS --> SM

  GJ --> SM

  GC --> SM

  GA --> SC2

  SC2 --> GSA

  SM --> EB

  EB --> GE

  LB --> EB

  SQ --> Q

  SM --> CS

  SM --> CP

  SC2 --> GS2

  LB --> LE

```

### Key Architectural Decisions

- SSE over WebSockets: Next.js App Router handles SSE natively via `ReadableStream`. WebSockets require a separate server process. SSE is unidirectional (server→client) which matches the game's push model; clients POST answers over regular HTTP.

- Server-side game state: All state lives in PostgreSQL. The SSE handler reads from DB on reconnect, enabling seamless client recovery.

- Append-only answers table: `game_session_answers` is never updated after insert. Score recalculation is always a sum query, making tampering detectable.

- In-process event bus: A `Map<sessionCode, Set<ReadableStreamController>>` held in the Next.js process routes SSE events to all subscribers of a session. For multi-instance deployments, this upgrades to a Redis pub/sub channel.

---

## Components and Interfaces

### Game Engine State Machine

```

lobby ──[start]──► active ──[all questions done]──► ended

                     │                                 ▲

                     ├──[host pause]──► paused ──[resume]──┤

                     └──[host end early]──────────────────►┘

```

State transitions are atomic DB updates with optimistic locking (`WHERE status = $expected`).

### API Route Contracts

```

POST /api/game/sessions

  Auth: teacher | admin

  Body: { name, categoryIds[], difficulty, questionCount, timePerQuestion,

          scoringMode, language, gameType, allowLateJoin }

  Response: { sessionCode, sessionId, status: "lobby" }

POST /api/game/sessions/[code]/join

  Auth: student

  Body: { displayName? }

  Response: { participantId, sessionId, currentState }

POST /api/game/sessions/[code]/control

  Auth: host | admin

  Body: { action: "start"|"advance"|"pause"|"resume"|"end" }

  Response: { status, currentQuestionIndex }

POST /api/game/sessions/[code]/answer

  Auth: student (active participant)

  Body: { questionId, answerId, answeredAt: ISO8601 }

  Response: { accepted: true } | { error }

GET /api/game/sessions/[code]/events

  Auth: any participant or host

  Response: text/event-stream

  Events: lobby_update | question_start | question_end | leaderboard | session_end

GET /api/game/sessions/[code]/analytics

  Auth: host | admin

  Response: { summary, perQuestion[], perStudent[] }

POST /api/game/solo

  Auth: student

  Body: { categoryIds[], difficulty, questionCount, timePerQuestion, gameMode }

  Response: { sessionId, questions[] }

```

### SSE Event Payloads

```typescript

type SSEEvent =

  | { type: "lobby_update";    participants: Participant[] }

  | { type: "question_start";  question: QuestionPayload; startsAt: string; endsAt: string }

  | { type: "question_end";    correctAnswerId: number; leaderboard: LeaderboardEntry[] }

  | { type: "leaderboard";     entries: LeaderboardEntry[]; podium?: Participant[] }

  | { type: "session_paused"  }

  | { type: "session_resumed" }

  | { type: "session_end";     podium: Participant[]; finalLeaderboard: LeaderboardEntry[] }

  | { type: "ping" }

```

---

## Data Models

### New Tables (Drizzle schema additions to `src/db/schema/game.ts`)

```typescript

// Replaces/extends challenge_sessions with full game engine fields

export const gameSessions = pgTable("game_sessions", {

  id:               serial("id").primaryKey(),

  sessionCode:      text("session_code").notNull().unique(),       // 6-char alphanumeric

  hostId:           integer("host_id").notNull().references(() => users.id),

  sessionName:      text("session_name").notNull(),

  categoryIds:      integer("category_ids").array().notNull(),

  difficulty:       text("difficulty").notNull().default("mixed"), // easy|medium|hard|mixed

  questionCount:    integer("question_count").notNull(),

  timePerQuestion:  integer("time_per_question").notNull(),        // seconds

  scoringMode:      text("scoring_mode").notNull().default("speed"), // speed|equal

  language:         text("language").notNull().default("both"),    // en|km|both

  gameType:         text("game_type").notNull().default("mixed"),  // mcq|true_false|image_pick|word_puzzle|memory_match|sort_order|mixed

  allowLateJoin:    boolean("allow_late_join").default(true),

  questionIds:      integer("question_ids").array(),               // ordered list set at start

  currentQuestionIndex: integer("current_question_index").default(-1),

  status:           text("status").notNull().default("lobby"),     // lobby|active|paused|ended

  isSoloPractice:   boolean("is_solo_practice").default(false),

  startedAt:        timestamp("started_at"),

  endedAt:          timestamp("ended_at"),

  createdAt:        timestamp("created_at").defaultNow().notNull(),

});

export const gameParticipants = pgTable("game_participants", {

  id:             serial("id").primaryKey(),

  sessionId:      integer("session_id").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),

  userId:         integer("user_id").notNull().references(() => users.id),

  displayName:    text("display_name").notNull(),

  avatar:         text("avatar"),

  totalScore:     integer("total_score").default(0).notNull(),

  correctAnswers: integer("correct_answers").default(0).notNull(),

  currentStreak:  integer("current_streak").default(0).notNull(),

  rank:           integer("rank"),

  isConnected:    boolean("is_connected").default(true),

  lastSeenAt:     timestamp("last_seen_at").defaultNow(),

  joinedAt:       timestamp("joined_at").defaultNow().notNull(),

}, (t) => ({

  sessionUserUnique: unique().on(t.sessionId, t.userId),

}));

// Append-only — never UPDATE, only INSERT

export const gameSessionAnswers = pgTable("game_session_answers", {

  id:              serial("id").primaryKey(),

  sessionId:       integer("session_id").notNull().references(() => gameSessions.id),

  userId:          integer("user_id").notNull().references(() => users.id),

  questionId:      integer("question_id").notNull().references(() => questions.id),

  answerId:        integer("answer_id").references(() => answers.id), // null = timed out

  answeredAt:      timestamp("answered_at").notNull(),                // client-reported, validated server-side

  serverReceivedAt: timestamp("server_received_at").defaultNow().notNull(),

  isCorrect:       boolean("is_correct").notNull(),

  speedScore:      integer("speed_score").notNull().default(0),

  streakBonus:     integer("streak_bonus").notNull().default(0),

  totalPoints:     integer("total_points").notNull().default(0),

  remainingTimeMs: integer("remaining_time_ms"),                      // server-calculated

}, (t) => ({

  // Prevents replay attacks — one answer per user per question per session

  noReplay: unique().on(t.sessionId, t.userId, t.questionId),

}));

```

### Existing Tables Used (no schema changes needed)

- `questions` + `answers` — question content source

- `game_scores` — solo practice results

- `user_streaks` — daily streak tracking

- `leaderboard_entries` — final session rankings

- `users` — auth and role checks

---

## Scoring Algorithm

### Speed Score (server-side only)

```typescript

function calculateSpeedScore(params: {

  isCorrect:       boolean;

  scoringMode:     "speed" | "equal";

  basePoints:      number;   // default 1000

  remainingTimeMs: number;   // server: question_ends_at - server_received_at

  totalTimeMs:     number;   // timePerQuestion * 1000

  currentStreak:   number;   // consecutive correct answers before this one

}): { speedScore: number; streakBonus: number; totalPoints: number } {

  if (!params.isCorrect) return { speedScore: 0, streakBonus: 0, totalPoints: 0 };

  const speedScore = params.scoringMode === "equal"

    ? params.basePoints

    : params.basePoints + Math.floor(

        params.basePoints * (params.remainingTimeMs / params.totalTimeMs)

      );

  // Streak bonus: 10% per consecutive correct after 2nd, capped at 50%

  const streakMultiplier = Math.min(Math.max(params.currentStreak - 1, 0), 5) * 0.10;

  const streakBonus = Math.floor(params.basePoints * streakMultiplier);

  return { speedScore, streakBonus, totalPoints: speedScore + streakBonus };

}

```

### Anti-Cheat Validation (server-side, before score calculation)

```typescript

async function validateAnswer(input: {

  sessionCode: string;

  userId:      number;

  questionId:  number;

  answerId:    number | null;

  answeredAt:  Date;

}): Promise<{ valid: true } | { valid: false; reason: string }> {

  // 1. Session must be active

  // 2. Current question must match questionId

  // 3. User must be an active participant

  // 4. No prior answer for this (session, user, question) — unique constraint

  // 5. Server clock check: now() <= question_started_at + time_limit + 2s grace

  // 6. answeredAt must be within the question window (client clock sanity check)

}

```

---

## Real-Time Layer Design

### SSE Connection Lifecycle

```

Client                          Server

  |── GET /api/game/[code]/events ──►|

  |◄── 200 text/event-stream ────────|

  |◄── data: {type:"ping"} ──────────|  every 15s keepalive

  |◄── data: {type:"question_start"} |  on host advance

  |── POST /api/game/[code]/answer ──►|

  |◄── data: {type:"question_end"} ──|  on timer expire or host advance

  |◄── data: {type:"leaderboard"} ───|

```

### In-Process Event Bus

```typescript

// src/lib/game-event-bus.ts

const bus = new Map<string, Set<ReadableStreamDefaultController>>();

export function subscribe(code: string, ctrl: ReadableStreamDefaultController) {

  if (!bus.has(code)) bus.set(code, new Set());

  bus.get(code)!.add(ctrl);

}

export function unsubscribe(code: string, ctrl: ReadableStreamDefaultController) {

  bus.get(code)?.delete(ctrl);

}

export function broadcast(code: string, event: SSEEvent) {

  const data = `data: ${JSON.stringify(event)}\n\n`;

  bus.get(code)?.forEach(ctrl => {

    try { ctrl.enqueue(data); } catch { /* client disconnected */ }

  });

}

```

### Reconnection (client-side)

The SSE client uses the browser's native `EventSource` with a custom wrapper that:

1. Tracks retry count (max 5)

2. Uses exponential backoff: `delay = min(1000 * 2^attempt, 30000)` ms

3. On reconnect, fetches current session state via `GET /api/game/[code]/state` and reconciles UI

---

## Security / Anti-Cheat Architecture

| Threat | Mitigation |

|---|---|

| Score manipulation | Server calculates all scores; client sends only `{questionId, answerId, answeredAt}` |

| Replay attack | `UNIQUE(session_id, user_id, question_id)` on `game_session_answers` |

| Time cheating | Server uses `server_received_at` vs `question_started_at + time_limit` for timing |

| Multiple submissions | DB unique constraint + first-write-wins; subsequent inserts rejected |

| Unauthorized session access | JWT role check + participant membership check on every answer POST |

| Session hijacking | JWT bound to user; single active session per user enforced |

| Staff creating sessions | Middleware RBAC: `staff` role → 403 on session creation endpoints |

| Late answer injection | Server checks `now() <= question_ends_at + 2s grace` before accepting |

---

## Frontend Component Structure

```

src/app/(public)/play/

  page.tsx                    ← Game mode selection (6 modes)

  [code]/

    page.tsx                  ← Student join + live game view

    components/

      Lobby.tsx               ← Waiting room with participant list

      QuestionRound.tsx       ← Question display + answer buttons

      CountdownTimer.tsx      ← Animated countdown

      AnswerGrid.tsx          ← Color-coded shape buttons (MCQ/T-F)

      ImagePick.tsx           ← Image question variant

      WordPuzzle.tsx          ← Letter scramble interaction

      MemoryMatch.tsx         ← Card flip matching game

      SortOrder.tsx           ← Drag-to-rank interaction

      LeaderboardPanel.tsx    ← Post-round rankings

      Podium.tsx              ← End-of-session top 3

  solo/

    page.tsx                  ← Solo practice setup + game

src/app/(dashboard)/teacher/sessions/

  page.tsx                    ← Session list

  host/

    page.tsx                  ← Session creation form

    [code]/

      page.tsx                ← Host control panel (start/advance/pause/end)

      components/

        HostControls.tsx

        LiveParticipantList.tsx

        QuestionPreview.tsx

        AnalyticsDashboard.tsx

src/app/(dashboard)/admin/

  game-sessions/

    page.tsx                  ← All sessions view + terminate controls

```

---

## Game Modes Configuration

| Mode | Questions | Time/Q | Special Rule |

|---|---|---|---|

| Quick Quiz | 10 | 30s | All categories random |

| Speed Round | unlimited | 60s total | Answer as many as possible in 60s |

| Sign Challenge | 15 | 20s | Image_Pick type only, traffic signs category |

| Mixed Battle | 20 | 30s | All 8 categories, mixed game types |

| Daily Challenge | 15 | 30s | Fixed question set per day, streak tracking |

| Exam Simulation | 40 | 45s | Mirrors real Cambodia driving exam structure |

These are seeded into the existing `game_modes` table via a migration script.

---

## Error Handling

| Scenario | Behavior |

|---|---|

| Invalid room code | 404 with `{ error: "Session not found or expired" }` |

| Session already ended | 410 Gone |

| Session full (>40 participants) | 409 Conflict |

| Answer submitted after time window | 422 with `{ error: "Answer window closed" }` |

| Duplicate answer submission | 409 Conflict (unique constraint) |

| Insufficient approved questions | Session created with reduced count; host notified via SSE `warning` event |

| SSE connection lost | Client auto-reconnects with exponential backoff (max 5 attempts) |

| DB write failure on answer | 500; client retries once; answer not counted if both fail |

| Host disconnects | Session pauses automatically after 60s; admin can resume or terminate |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Room Code Format and Uniqueness

*For any* two distinct game sessions created by the system, their room codes must differ, and every room code must be exactly 6 characters composed only of uppercase alphanumeric characters (A-Z, 0-9).

**Validates: Requirements 1.1**

---

### Property 2: New Session Has Lobby Status

*For any* valid session creation request submitted by a teacher, the resulting game session record must have `status = "lobby"` immediately after creation.

**Validates: Requirements 1.2**

---

### Property 3: Question Set Contains Only Approved Content

*For any* game session configuration (any combination of categories, difficulty, and question count), every question in the generated question set must have `status = "approved"` in the `questions` table and must belong to one of the requested categories with the requested difficulty (or "mixed" when mixed is selected).

**Validates: Requirements 1.4, 11.1**

---

### Property 4: Join Adds Participant to Session

*For any* student submitting a valid room code for a session in `lobby` or `active` (with `allow_late_join = true`) status, after the join request succeeds, the student must appear in the session's participant list with `totalScore = 0`.

**Validates: Requirements 2.1, 2.4**

---

### Property 5: Invalid Room Code Returns Error

*For any* room code that does not correspond to an active session (non-existent, expired, or ended), the join attempt must return an error response and must not create a participant record.

**Validates: Requirements 2.2**

---

### Property 6: Reconnect Preserves Participant State

*For any* participant who disconnects and reconnects within 30 seconds, their `totalScore`, `correctAnswers`, and `currentStreak` in `game_participants` must be identical before and after the reconnect.

**Validates: Requirements 2.6**

---

### Property 7: State Machine Transitions Are Valid

*For any* game session, the sequence of status values must follow the valid transition graph: `lobby → active → (paused ↔ active) → ended`. No transition outside this graph (e.g., `lobby → ended` without going through `active`, or `ended → active`) must ever be persisted.

**Validates: Requirements 3.1, 3.4, 3.5, 3.6**

---

### Property 8: Question Payload Contains Required Fields

*For any* question round broadcast, the SSE `question_start` event payload must contain: `questionId`, `questionText` (in the session language), `answerOptions` (array with at least 2 items), `gameType`, `startsAt`, and `endsAt`.

**Validates: Requirements 4.1, 4.2**

---

### Property 9: Timed-Out Participants Receive Zero Points

*For any* participant who does not submit an answer before `question_ends_at`, the system must insert a `game_session_answers` record with `isCorrect = false`, `totalPoints = 0`, and `answerId = null`.

**Validates: Requirements 4.4**

---

### Property 10: Image URL Included in Payload When Present

*For any* question that has a non-null `imageUrl`, the `question_start` SSE event payload must include the `imageUrl` field.

**Validates: Requirements 4.6**

---

### Property 11: Speed Score Formula Correctness

*For any* correct answer in speed-scoring mode with `basePoints = B`, `remainingTimeMs = R`, and `totalTimeMs = T`, the calculated `speedScore` must equal `B + floor(B * (R / T))`, and `R` must be computed server-side as `question_ends_at - server_received_at`.

**Validates: Requirements 5.1**

---

### Property 12: Incorrect Answer Yields Zero Points

*For any* answer submission where `isCorrect = false` (wrong answer or no answer), `totalPoints` stored in `game_session_answers` must be 0.

**Validates: Requirements 5.2**

---

### Property 13: Streak Bonus Formula Correctness

*For any* participant with `currentStreak = S` (where S ≥ 3) answering correctly, the `streakBonus` must equal `floor(basePoints * min((S - 2), 5) * 0.10)`, and the bonus must never exceed `floor(basePoints * 0.50)`.

**Validates: Requirements 5.3**

---

### Property 14: Total Score Is Sum of Per-Round Points

*For any* participant in any session, their `totalScore` in `game_participants` must equal the sum of all `totalPoints` values in `game_session_answers` for that `(sessionId, userId)` pair.

**Validates: Requirements 5.4**

---

### Property 15: Equal-Points Mode Ignores Answer Time

*For any* correct answer in equal-points scoring mode, `speedScore` must equal `basePoints` regardless of `remainingTimeMs`.

**Validates: Requirements 5.5**

---

### Property 16: Leaderboard Is Sorted and Complete

*For any* leaderboard broadcast after a question round, the entries must be sorted in descending order by `totalScore`, must include every participant in the session, and each entry must contain `userId`, `displayName`, `avatar`, `totalScore`, and `rankChange` (compared to previous round).

**Validates: Requirements 6.1, 6.2**

---

### Property 17: Podium Contains Top 3 by Final Score

*For any* ended session with at least 3 participants, the podium data must contain exactly the 3 participants with the highest `totalScore`, ordered descending.

**Validates: Requirements 6.5**

---

### Property 18: Final Leaderboard Persisted Correctly

*For any* ended session, querying `leaderboard_entries` for that session must return records whose `score` values match the `totalScore` values in `game_participants` for the same session, and the `rank` values must be consistent with descending score order.

**Validates: Requirements 6.6**

---

### Property 19: Content-to-GameType Mapping Is Consistent

*For any* content item, the `mapContentToGameType` function must return the same game type for the same input (deterministic), and the returned type must be compatible with the item's answer structure (e.g., items with exactly 2 answers map to `true_false`, items with an image and 2–4 answers map to `image_pick`, items with 2–4 answers and no image map to `mcq`).

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 11.4**

---

### Property 20: Incompatible Content Items Are Excluded

*For any* session where the selected game type is incompatible with some content items, the final `questionIds` array must contain no incompatible items, and its length must equal `min(requestedCount, compatibleApprovedCount)`.

**Validates: Requirements 1.5, 11.5**

---

### Property 21: Solo Practice Results Payload Is Complete

*For any* completed solo practice session, the results object must contain: `totalScore`, `accuracyPercentage`, `timeTakenSeconds`, and a `perQuestion` array where each entry has `questionId`, `isCorrect`, `pointsEarned`, and `timeTakenMs`.

**Validates: Requirements 8.4**

---

### Property 22: Solo Practice Persisted and Streak Updated

*For any* completed solo practice session, a `game_scores` record must be inserted with the correct `userId`, `gameMode`, `score`, `totalQuestions`, and `correctAnswers`, and the `user_streaks` record for that user must have `lastPlayDate` updated to today.

**Validates: Requirements 8.5**

---

### Property 23: Personal Best Is Maximum Score

*For any* student and any `(categoryIds, difficulty)` combination, the personal best score returned after a solo session must equal the maximum `score` across all `game_scores` records for that `(userId, gameMode, difficulty)` combination.

**Validates: Requirements 8.6**

---

### Property 24: Analytics Payload Is Complete and Accurate

*For any* ended session, the analytics response must contain: a `summary` with `totalParticipants`, `averageScore`, `averageAccuracy`, and `averageTimePerQuestion`; a `perQuestion` array with `correctRate`, `averageAnswerTime`, and `mostSelectedWrongAnswer` for each question; and a `perStudent` array with `totalScore`, `correctAnswers`, `incorrectAnswers`, and `averageAnswerTime` for each participant. The 3 questions with the lowest `correctRate` must be flagged as `needsReview: true`.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

---

### Property 25: CSV Export Contains All Data

*For any* ended session, the CSV export string must contain one row per student with all per-student fields and one row per question with all per-question fields, with no rows omitted.

**Validates: Requirements 9.5**

---

### Property 26: Reconnect Retry Follows Exponential Backoff

*For any* sequence of reconnect attempts after an SSE connection drop, the delay before attempt `n` must equal `min(1000 * 2^(n-1), 30000)` milliseconds, and the total number of attempts must not exceed 5.

**Validates: Requirements 10.3**

---

### Property 27: Audio URL Included in Payload When Present

*For any* question that has a non-null `audioUrlEn` or `audioUrlKm`, the `question_start` SSE event payload must include the corresponding audio URL field for the session's language setting.

**Validates: Requirements 11.3**

---

### Property 28: RBAC — Session Creation Restricted to Teacher/Admin

*For any* user with role `staff` or `student` attempting to call `POST /api/game/sessions`, the response must be HTTP 403 Forbidden and no session record must be created.

**Validates: Requirements 12.1, 12.5**

---

### Property 29: RBAC — Analytics Access Restricted to Host or Admin

*For any* user who is neither the session host nor has the `admin` role, a request to `GET /api/game/sessions/[code]/analytics` must return HTTP 403 Forbidden.

**Validates: Requirements 12.2**

---

### Property 30: RBAC — Admin Can Terminate Any Session

*For any* active session and any user with the `admin` role, a `POST /api/game/sessions/[code]/control` with `action: "end"` must succeed and transition the session to `ended` status.

**Validates: Requirements 12.4**

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. Unit tests cover specific examples, integration points, and error conditions. Property tests verify universal correctness across randomized inputs.

### Unit Tests

Focus areas:

- Session creation with valid and invalid teacher credentials

- Room code collision handling

- Join flow with valid/invalid/expired codes

- State machine transition guards (invalid transitions rejected)

- Answer submission anti-cheat validation (replay, out-of-window, wrong session)

- CSV export format correctness with a known dataset

- SSE event bus subscribe/unsubscribe/broadcast with mock controllers

### Property-Based Tests

Library: **fast-check** (TypeScript, works in Jest/Vitest)

Configuration: minimum 100 runs per property (`{ numRuns: 100 }`).

Each property test must include a comment tag:

`// Feature: kahoot-style-quiz-game, Property N: <property_text>`

Key generators needed:

- `fc.record({ basePoints: fc.integer({min:100,max:2000}), remainingTimeMs: fc.integer({min:0,max:60000}), totalTimeMs: fc.constant(60000) })` — for scoring properties

- `fc.array(fc.record({ isCorrect: fc.boolean(), ... }), {minLength:1, maxLength:40})` — for leaderboard sorting

- `fc.string({ minLength:1, maxLength:100, charset:'alphanumeric' })` — for room code generation

- `fc.record({ role: fc.constantFrom('student','staff','teacher','admin') })` — for RBAC properties

Each correctness property (1–30) must be implemented by exactly one property-based test. Properties that describe UI rendering (e.g., color-coded shapes, visual indicators) are excluded from automated testing.

okay let buid that stand for Core insight for product design

Kids don't play to learn — they learn while playing. The game experience must feel genuinely fun first. Educational value is the byproduct of excellent game design, not a layer added on top of quizzes.  make the Ui more focus trying to winner, and sound inclouding it ,  and make no api or inject query or cheat , make all related to that quiestion and reference Game Mode  →  selects which Question Types are used

─────────────────────────────────────────────────

Quick Quiz      → MCQ + True/False

Speed Round     → MCQ only (fast tapping)

Sign Challenge  → Image Pick only

Mixed Battle    → all 6 types randomly

Daily Challenge → MCQ + True/False + Image Pick

Exam Simulation → MCQ + True/False (mirrors real exam)

 tha all nice . 