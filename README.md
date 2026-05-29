# 🇰🇭 KWD Platform — Kesararam With Digital
### Cambodian Driving Knowledge & Licensing Education Platform

[![Next.js Version](https://img.shields.io/badge/Next.js-15.5.18-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS Version](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Neon_Postgres-Serverless-00e699?style=for-the-badge&logo=postgresql)](https://neon.tech/)

Master traffic signs, road laws, and driving theory with an interactive, bilingual (English & Khmer), gamified learning experience designed for Cambodian license candidates.

---

## 📚 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [🎨 Design System](#-design-system)
- [📁 Project Structure](#-project-structure)
- [🎮 Game Modes & Scoring Engine](#-game-modes--scoring-engine)
- [🔐 Security & Rate Limiting](#-security--rate-limiting)
- [💻 Development Scripts Reference](#-development-scripts-reference)
- [📝 Contributing & License](#-contributing--license)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher (recommended `v20+` or `v22+`)
- **Database**: A serverless [Neon Postgres](https://neon.tech/) instance (or local PostgreSQL)
- **Media Hosting**: A [Cloudinary](https://cloudinary.com/) account for image & audio uploads

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shiliaiwei/kesararam.git
   cd kesararam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database Connection
   DATABASE_URL="postgres://user:password@host/dbname?sslmode=require"

   # JWT Authentication
   JWT_SECRET="your_secure_cryptographic_random_string_here"

   # Cloudinary Media Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"

   # Application Variables
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```
   > [!WARNING]
   > Never commit `.env.local` or raw credentials to public version control repositories!

4. **Initialize the database**
   ```bash
   # Run migrations
   npm run db:migrate
   # Verify that the schema matches the database
   npm run db:verify
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛠️ Tech Stack

### Core Frontend
- **Framework**: Next.js 15 (App Router with Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS customizations
- **Component Primitives**: shadcn/ui + Base UI

### Core Backend & Services
- **Database**: Neon Serverless Postgres
- **ORM**: Drizzle ORM (Type-safe query building and migrations)
- **Authentication**: JWT token system stored in secure HTTP-only cookies
- **Media Uploads**: Cloudinary integration with size & MIME-type validation

---

## 🎨 Design System

KWD follows a strict **Neo-Brutalist design philosophy** inspired by physical road safety signage and traffic-light color palettes:

- **Border Aesthetics**: Distinct `border-[3px] border-black` boundaries.
- **Corners**: Consistent `rounded-[10px]` styling on cards and buttons.
- **Brutalist Shadow Pop**: Hard, offset flat shadows using tailwind class utility `shadow-[8px_8px_0_#000]` (no blur/glow).
- **Interactive States**: Buttons physically depress down and right when clicked (`active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0_#000]`).
- **Signature Accents**: High-visibility yellow/black `caution-tape` stripes integrated at the base of primary view containers.
- **Color System**:
  - **Yellow (`#eab308`)**: Primary interactive color, warnings, highlights.
  - **Red (`#ef4444`)**: Extreme urgency, speed rounds, delete buttons.
  - **Blue (`#3b82f6`)**: Sign challenges, educational guides.
  - **Green (`#22c55e`)**: Success states, daily challenge badges.
  - **Purple (`#a855f7`)**: Special mixed modes, dashboard subcategories.

---

## 📁 Project Structure

```
kesararam/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public-facing views (Home, Login, Signup, Play)
│   │   ├── (dashboard)/       # Role-protected workspaces (Admin, Staff, Student, Teacher)
│   │   ├── actions/           # Next.js Server Actions (Auth, Content mutations)
│   │   └── api/               # API Router Handlers (Scoring, Leaderboard, Token validation)
│   ├── components/
│   │   ├── ui/                # Base design system primitives (Button, Dialog, Input)
│   │   ├── dashboard/         # Dashboard Shells, Data tables, and Sidebars
│   │   └── game/              # Quiz engine views, Flashcards, and Room lobbies
│   ├── db/
│   │   ├── schema/            # Drizzle relational schema configuration files
│   │   └── index.ts           # Neon Postgres database driver connection
│   ├── lib/
│   │   ├── auth.ts            # Security cryptography, hash, and verification helpers
│   │   └── utils.ts           # Classnames merger and common utility functions
│   └── middleware.ts          # Server-side routing interceptor for Auth & Role verification
├── drizzle/                   # Auto-generated SQL schema migration statements
├── scripts/                   # Migration runners, verification, and developer utility scripts
└── public/                    # Static assets, logos, and illustration resources
```

---

## 🎮 Game Modes & Scoring Engine

### Interactive Question Formats
1. **Quiz (Multiple Choice)**: Standard 4-option questions.
2. **True or False**: Simple binary questions mapping to local translations (ពិត/ខុស).
3. **Type Answer**: Free text-entry validation matching correct answer strings.
4. **Puzzle**: Reorder items into the correct logical sequence.
5. **Slider**: Select an exact numeric value on a draggable scale.
6. **Pin Answer (Target Map)**: Coordinate positioning on road sign diagrams.

### Point Calculation System
> [!IMPORTANT]
> Points, levels, and consecutive answer streaks are calculated and saved **exclusively during Live Game Challenges**. In Solo Play and Unauthenticated mode, scores are not recorded in the database.

- **Base Score Calculation**:
  - **Standard Mode (1x multiplier)**: Yields a maximum of **1000 points** (scales down based on time taken).
  - **Double Points Mode (2x multiplier)**: Yields a maximum of **2000 points**.
  - **No Points Mode (0x multiplier)**: Earns **0 points**.

- **Streak Bonus Math**:
  Correct answers scale their bonus points relative to the question's difficulty:
  $$\text{Final Score} = \text{Time-scaled Base Score} + (\text{Active Streak} \times \text{Difficulty Multiplier})$$

  | Question Difficulty | Multiplier |
  | :--- | :--- |
  | **Easy** | $\text{Streak} \times 1$ |
  | **Medium** | $\text{Streak} \times 2$ |
  | **Hard** | $\text{Streak} \times 3$ |

  *An incorrect answer immediately resets the user's active streak count to 0.*

---

## 🔐 Security & Rate Limiting

The platform implements robust authentication mechanisms backed by targeted rate limit thresholds to prevent bot abuse and room-code guessing:

### Endpoint Rate Limits
| Protected Route | Allowed Requests | Defense Mechanism | Purpose |
| :--- | :--- | :--- | :--- |
| `/login` (`POST`) | 5 attempts / 60 seconds | Custom IP Memory Map | Protects against credential stuffing & dictionary attacks. |
| `/api/challenge/join` | 5 requests / 60 seconds | `simple-rate-limit.ts` | Prevents room-code brute-forcing of active game sessions. |
| `/api/team-token` (`GET`) | 10 requests / 60 seconds | `simple-rate-limit.ts` | Restricts rapid QR shortcode token generation. |
| `/api/team-token` (`POST`) | 20 requests / 60 seconds | `simple-rate-limit.ts` | Restricts automated credential verification spam. |

### Known Limitations & Mitigation
- **In-Memory Limits**: The rate-limit tracker uses local memory. When deploying on serverless architectures (e.g. Vercel), cold starts will clear limits. To mitigate this in high-traffic production settings, configure a centralized storage cache such as Upstash Redis.
- **Media Upload Volumes**: Limit maximum image/audio sizes to 5MB/10MB respectively to control Cloudinary bandwidth.

---

## 💻 Development Scripts Reference

Execute tasks in the project root directory using `npm run <script-name>`:

| Command | Output / Action |
| :--- | :--- |
| `dev` | Starts the local dev server on port `3000` (falls back to `3001` or `3002` if in use). |
| `build` | Compiles and builds the production Next.js optimized bundles. |
| `start` | Launches the pre-built production server. |
| `lint` | Runs ESLint syntax verification. |
| `test` | Executes the Vitest unit tests suite. |
| `db:generate` | Inspects schema changes and generates Drizzle SQL migration files. |
| `db:migrate` | Runs all pending SQL migrations against your target database. |
| `db:push` | Pushes the local schema directly to the database without generating migrations. |
| `db:studio` | Opens the local interactive GUI dashboard for database management. |
| `db:verify` | Compares local Drizzle schemas against the live database mapping for verification. |

---

## 📝 Contributing & License

1. Create a feature branch off the `docs` or `main` branches.
2. Ensure you run `npm run lint` and `npm run test` locally to verify that all type checks pass.
3. Submit a pull request detailing the changes and visual updates.

**License**: Proprietary — All rights reserved. Developed for Cambodian Digital Safety Initiatives.
