# KWD Platform - Complete Documentation

**Kesararam With Digital** - Cambodian Driving Knowledge and Licensing Education Platform

> Master traffic signs, road laws, and driving theory with an interactive, gamified learning experience.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Features](#features)
7. [Architecture](#architecture)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database Schema](#database-schema)
10. [Game Modes](#game-modes)
11. [Staff Panel](#staff-panel)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

---

## Overview

KWD Platform is a comprehensive web application designed to help Cambodian students prepare for their driving license exam. The platform offers multiple learning modes, real-time quiz games, progress tracking, and administrative tools for content management.

### Key Features

- 🎮 **Multiple Game Modes**: Flashcards, Quizzes, Practice Tests, Live Challenges
- 📊 **Progress Tracking**: Personal analytics, leaderboards, achievement system
- 👨‍🏫 **Teacher Dashboard**: Create and manage live quiz sessions
- 🛠️ **Staff Panel**: Comprehensive content management system
- 📱 **Responsive Design**: Neo-brutalist design inspired by road safety aesthetics
- 🔐 **Secure Authentication**: JWT-based auth with role-based access control
- 🌐 **Bilingual Support**: Khmer and English content

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Server Components + Server Actions

### Backend
- **Runtime**: Node.js
- **Database**: Neon Postgres (Serverless)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **File Upload**: Cloudinary

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Type Checking**: TypeScript
- **Database Tools**: Drizzle Kit

---

## Design System

### Neo-Brutalism Design Philosophy

The platform follows a neo-brutalist design approach inspired by road markings and traffic safety aesthetics, creating a bold, functional, and highly accessible interface.

### Core Visual Principles

- **Sharp corners only**: `border-radius: 0` (no rounded corners)
- **No gradients**: Solid colors exclusively
- **Bold black borders**: 2px standard, 4px for emphasis
- **Hard shadows**: `shadow-[4px_4px_0_#000]` (no blur)
- **High contrast**: Black borders on white/colored backgrounds
- **No emoji**: Text-only labels and descriptions
- **Traffic-light colors**: Semantic color system

### Color Palette

```css
/* Primary Colors */
--yellow: #eab308    /* Primary accent, interactive elements */
--blue: #3b82f6      /* Information, links */
--red: #ef4444       /* Errors, warnings */
--green: #22c55e     /* Success states */

/* Secondary Colors */
--orange: #f97316    /* Caution, pending states */
--cyan: #06b6d4      /* Tertiary accent */
--purple: #a855f7    /* Special features */
--rose: #fda4af      /* Soft alerts */

/* Neutrals */
--black: #000000     /* Borders, shadows, text */
--gray: #a8a8a8      /* Secondary borders */
--white: #ffffff     /* Backgrounds */
--green-dark: #006747 /* Active states */

#25c1a4 brilliant 
```

### Component Standards

All interactive elements must have:
- `border-2 border-black` (minimum)
- `shadow-[4px_4px_0_#000]` for depth
- Zero border-radius
- Solid background colors (no gradients)

---

## Project Structure

```
kesararamwithdigital/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public-facing pages (no auth required)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Registration
│   │   │   ├── about/         # About page
│   │   │   └── leaderboard/   # Public leaderboard
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── teacher/       # Teacher dashboard
│   │   │   ├── student/       # Student dashboard
│   │   │   └── staff/         # Staff content management
│   │   ├── actions/           # Server actions
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── game/              # Game mode components
│   │   └── shared/            # Shared components
│   ├── db/
│   │   ├── schema/            # Drizzle schema definitions
│   │   └── index.ts           # Database connection
│   ├── lib/
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── utils.ts           # General utilities
│   │   └── validations.ts     # Input validation schemas
│   └── middleware.ts          # Next.js middleware (auth, redirects)
├── public/                    # Static assets
├── scripts/                   # Utility scripts
└── drizzle/                   # Database migrations

```

---

## Setup & Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon Postgres account (or local PostgreSQL)
- Cloudinary account (for media uploads)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd kesararamwithdigital
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database (Never expose publicly!)
DATABASE_URL=your_neon_postgres_url

# JWT Authentication
JWT_SECRET=your_secure_random_string_here

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

⚠️ **Security Note**: Never commit `.env.local` to version control!

4. **Run database migrations**
```bash
npm run db:migrate
```

5. **Verify database setup**
```bash
npm run db:verify
```

6. **Start development server**
```bash
npm run dev
```

7. **Open browser**
Navigate to `http://localhost:3000`

---

## Features

### For Students

#### Learning Modes
- **Flashcards**: Spaced repetition learning for traffic signs and rules
- **Quiz Mode**: Self-paced practice with immediate feedback
- **Practice Test**: Simulated exam environment with time limits
- **Live Challenge**: Real-time multiplayer quiz competitions

#### Progress Tracking
- Personal dashboard with statistics
- Lifetime points and high scores
- Achievement badges
- Study streak tracking
- Category-wise performance analytics

#### Social Features
- Global leaderboard
- Profile customization
- Compete with friends in live games

### For Teachers

- Create and host live quiz sessions
- Real-time game management
- View participant scores and analytics
- Generate game codes for students
- Export results

### For Staff/Admins

- **Content Management**
  - CRUD operations for all content categories
  - Bulk import/export
  - Media library management
  - Multi-language support

- **User Management**
  - View all users
  - Assign roles (Student, Teacher, Staff, Admin)
  - Monitor activity

- **Analytics Dashboard**
  - Platform usage statistics
  - Popular content tracking
  - User engagement metrics

---

## Architecture

### System Flow

```
User Request
    ↓
Middleware (auth check)
    ↓
Next.js App Router
    ↓
Server Components (data fetching)
    ↓
Server Actions (mutations)
    ↓
Drizzle ORM
    ↓
Neon Postgres
```

### Data Flow

1. **Authentication**: JWT tokens stored in HTTP-only cookies
2. **Authorization**: Middleware checks user role before route access
3. **Data Fetching**: Server Components fetch data directly from database
4. **Mutations**: Server Actions handle all write operations
5. **Revalidation**: Next.js cache revalidation after mutations

---

## Authentication & Authorization

### Authentication Flow

1. User submits credentials (email/password)
2. Server validates against database
3. JWT token generated and returned
4. Token stored in HTTP-only cookie
5. Middleware validates token on subsequent requests

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Student** | Access learning modes, view own profile, join live games |
| **Teacher** | All student permissions + create/manage live quiz sessions |
| **Staff** | All teacher permissions + manage content (add/edit/delete) |
| **Admin** | All permissions + user management, system settings |

### Protected Routes

- `/admin/*` - Admin only
- `/teacher/*` - Teacher, Staff, Admin
- `/staff/*` - Staff, Admin
- `/student/*` - All authenticated users
- `/play/:code` - Authenticated students (for live games)

### Public Routes

- `/` - Homepage
- `/login` - Login page
- `/signup` - Registration
- `/about` - About page
- `/leaderboard` - Public leaderboard (view only)

---

## Database Schema

### Core Tables

#### Users
```typescript
{
  id: string (uuid)
  email: string (unique)
  password: string (hashed)
  name: string
  role: 'student' | 'teacher' | 'staff' | 'admin'
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### User Profiles
```typescript
{
  id: string (uuid)
  userId: string (FK to users)
  lifetimePoints: integer
  highestScore: integer
  totalGamesPlayed: integer
  currentStreak: integer
  longestStreak: integer
  avatarUrl: string?
  bio: string?
}
```

#### Categories
```typescript
{
  id: string (uuid)
  slug: string (unique)
  nameKh: string
  nameEn: string
  descriptionKh: string?
  descriptionEn: string?
  imageUrl: string?
  order: integer
  isActive: boolean
  createdAt: timestamp
}
```

#### Questions
```typescript
{
  id: string (uuid)
  categoryId: string (FK to categories)
  questionTextKh: string
  questionTextEn: string
  type: 'multiple_choice' | 'true_false'
  imageUrl: string?
  audioUrl: string?
  correctAnswer: string
  explanation: string?
  difficulty: 'easy' | 'medium' | 'hard'
  points: integer
  isActive: boolean
}
```

---

## Game Modes

### 1. Flashcards
- Browse through questions one at a time
- Flip to reveal answer
- Mark as "Know" or "Don't Know"
- Spaced repetition algorithm

### 2. Quiz Mode
- Self-paced practice
- Immediate feedback after each question
- Category-based filtering
- Unlimited attempts

### 3. Practice Test
- Simulated exam environment
- Time limit: 45 minutes
- 40 random questions
- Pass/fail grading (80% threshold)
- Detailed result analysis

### 4. Live Challenge (Kahoot-style)
- Real-time multiplayer
- Teacher hosts, students join with code
- Timed questions (10-30 seconds)
- Points based on speed and accuracy
- Live leaderboard
- Celebration screen at end

---

## Staff Panel

### Content Management

#### Categories
- Create/Edit/Delete categories
- Multilingual content (Khmer + English)
- Image upload via Cloudinary
- Reorder categories
- Toggle active/inactive

#### Questions
- CRUD operations
- Multiple choice or True/False
- Attach images and audio
- Set difficulty and points
- Assign to categories
- Bulk import from CSV/JSON

#### Media Library
- Upload images, audio, video
- Cloudinary integration
- External URL support
- Usage tracking
- Delete unused media

#### Analytics
- Content performance metrics
- Question difficulty analysis
- Popular categories
- User engagement data

---

## Development Guide

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:migrate       # Run database migrations
npm run db:verify        # Verify database schema
npm run db:studio        # Open Drizzle Studio (DB GUI)
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate migration files

# Type Checking
npm run type-check       # Run TypeScript compiler check
```

### Code Conventions

- **File naming**: kebab-case for files, PascalCase for components
- **Component structure**: Server Components by default, add 'use client' only when needed
- **Styling**: Use Tailwind utility classes, follow neo-brutalist standards
- **Server Actions**: All mutations through server actions with 'use server'
- **Error handling**: Use try-catch with proper error messages
- **Type safety**: Strict TypeScript, no 'any' types

### Adding New Features

1. **Define Schema**: Update `src/db/schema/`
2. **Create Migration**: `npm run db:generate`
3. **Run Migration**: `npm run db:push`
4. **Add Server Actions**: `src/app/actions/`
5. **Create Components**: `src/components/`
6. **Add Routes**: `src/app/(public|dashboard)/`
7. **Test**: Manual testing + verify database state

---

## Deployment

### Environment Setup

1. **Neon Postgres**: Create production database
2. **Vercel**: Connect GitHub repository
3. **Environment Variables**: Set in Vercel dashboard
4. **Database Migration**: Run migrations on production DB
5. **Deploy**: Automatic on git push to main branch

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Cloudinary production account configured
- [ ] JWT secret is cryptographically secure
- [ ] CORS settings configured
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] SSL certificate active
- [ ] Custom domain configured

### Performance Optimization

- Use Server Components for better performance
- Implement ISR (Incremental Static Regeneration) where possible
- Optimize images with Next.js Image component
- Enable Vercel Edge caching
- Database query optimization with indexes

---

## Troubleshooting

### Common Issues

#### Issue: "Server Components render error"
**Cause**: Database columns missing from actual database
**Solution**: Run `npm run db:migrate` and `npm run db:verify`

#### Issue: Authentication not working
**Cause**: JWT_SECRET not set or cookies not being sent
**Solution**: Check `.env.local` has JWT_SECRET, verify middleware.ts

#### Issue: Images not uploading
**Cause**: Cloudinary credentials missing or incorrect
**Solution**: Verify Cloudinary environment variables

#### Issue: Database connection errors
**Cause**: DATABASE_URL incorrect or database not accessible
**Solution**: Check connection string, verify Neon database is active

#### Issue: TypeScript errors after schema changes
**Cause**: Generated types out of sync
**Solution**: Run `npm run db:generate` to regenerate types

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=*
```

### Getting Help

- Check existing documentation files
- Review error logs in Vercel dashboard
- Verify database queries in Drizzle Studio
- Check browser console for client-side errors

---

## Security Best Practices

- ✅ Never commit `.env.local` or secrets to git
- ✅ Use HTTP-only cookies for JWT tokens
- ✅ Validate all user inputs on server-side
- ✅ Use parameterized queries (Drizzle ORM handles this)
- ✅ Implement rate limiting on auth endpoints
- ✅ Hash passwords with bcrypt (minimum 10 rounds)
- ✅ Use HTTPS in production
- ✅ Implement CSRF protection
- ✅ Regular security audits with `npm audit`
- ✅ Keep dependencies updated

---

## Quick Reference

### Scoring System
- **Easy questions**: 100 points base
- **Medium questions**: 200 points base
- **Hard questions**: 300 points base
- **Speed bonus**: +0-50% based on answer time
- **Streak multiplier**: Up to 3x for consecutive correct answers

### Game Session Lifecycle

1. **Waiting** - Host creates game, students join with code
2. **Active** - Questions displayed one at a time
3. **Answering** - Students submit answers (time limit)
4. **Results** - Show correct answer and leaderboard
5. **Next Question** - Cycle through all questions
6. **Completed** - Final results and winner celebration

### API Rate Limits

- Authentication: 10 requests/minute per IP
- Content API: 100 requests/minute per user
- Game join: 5 requests/minute per game code

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

Proprietary - All rights reserved

---

## Contact & Support

For questions or support, contact the development team.

---

**Last Updated**: 2026-04-03

---

*This documentation consolidates all project documentation files into a single reference guide. Individual documentation files remain in the repository for historical context and detailed technical specifications.*






# Question Types & Scoring Logic

This document outlines how to create each Question Type in the admin panel and details the backend point calculation system required for the live game engine.

## Creating Question Types

When adding questions in the Admin panel, use the new **Bilingual Toggle (English | Khmer)** at the top of the form to switch between language inputs. This ensures both languages are populated cleanly without cluttering the screen.

### 1. Quiz (Multiple Choice)
- **What it is:** Standard 4-option multiple choice question.
- **How to create:** Select "Quiz". Enter the question. Fill in 4 options and click the radio button next to the **one** correct answer.

### 2. True or False
- **What it is:** A binary choice question.
- **How to create:** Select "True or False". The system will automatically generate "True/ពិត" and "False/ខុស" options. Select the correct one.

### 3. Type Answer
- **What it is:** Students must type the answer themselves.
- **How to create:** Select "Type answer". Add as many variations of the correct answer as possible (e.g., "Apple", "apple", "APPLE"). The backend will check if the student's typed string matches *any* of these options.

### 4. Puzzle
- **What it is:** Students drag and drop items into the correct sequence.
- **How to create:** Select "Puzzle". Add the items in the **exact correct order from top to bottom**. The numbers on the left (1, 2, 3, 4) indicate the correct final sequence.

### 5. Slider
- **What it is:** Students select a number on a sliding scale.
- **How to create:** Select "Slider". Enter the exact correct numeric value in the answer box. 

### 6. Pin Answer (Target Map)
- **What it is:** Students drop a pin on an image.
- **How to create:** Select "Pin Answer". Currently operates using the `image_selection` framework. Future implementations will require X/Y coordinate tracking on an uploaded image map.

---

## Game Engine Scoring & Streaks

> [!IMPORTANT]
> **Solo Mode & Non-Users:**
> Points and streaks are **not recorded** in the database for solo gameplay or unauthenticated users. Scoring is only formally calculated and persisted during **Live Game Mode**.

### 1. Base Score Calculation
Points are calculated when the `/api/game/evaluate` endpoint confirms a correct answer. The base score is determined by the question's set points multiplier and the time taken to answer.

- **Standard Points (Multiplier 1):** Max 1000 points.
- **Double Points (Multiplier 2):** Max 2000 points.
- **No Points (Multiplier 0):** 0 points.

### 2. Streak Bonus System
When a user answers multiple questions correctly in a row, they earn a streak bonus. This bonus scales based on the **Difficulty** of the question answered.

The point bonus added to their total score is calculated as:
- **Easy:** Base Score + `(Streak Count * 1)`
- **Medium:** Base Score + `(Streak Count * 2)`
- **Hard:** Base Score + `(Streak Count * 3)`

**Example:**
If a student is on a 3-answer streak and gets a Medium question correct:
*They receive the standard time-based score + a bonus of 6 points (3 streak * 2 medium).*

If the student answers incorrectly, the streak count resets to 0.



# Kesararam Project: Comprehensive Security Report

This report summarizes the security posture of the project, including an inventory of all public APIs, URL endpoints, active rate limits, and risk profiles.

## 1. Action Completed: Rate Limit Execution
As requested, I have successfully applied the previously unused `simple-rate-limit.ts` logic to the critical, public-facing endpoints that did not have native auth blocks.
- **Challenge Join API (`/api/challenge/join`)**: Protected to prevent attackers from brute-forcing room codes or flooding game sessions.
- **Team Token APIs (`/api/team-token`)**: Both `GET` (generate) and `POST` (verify) endpoints are now strictly rate-limited to stop bot-driven token harvesting or verification spam.

## 2. API & Endpoint Inventory

### Public URLs (Unauthenticated Access)
These routes are exposed to the public and rely on Edge caching, static rendering, or rate limiting for defense:
- `/` (Home page)
- `/login` (Authentication portal, rate-limited internally)
- `/leaderboard` (Displays public ranks)
- `/api/public/topics` (Cached at the Vercel Edge, `s-maxage=300`)
- `/api/public/topics/[id]/questions` (Cached at the Edge)
- `/api/game/solo` (Allows public access to question generation)
- `/api/game/categories` (Publicly lists categories)
- `/api/team-token` (Rate-limited QR token system)
- `/api/challenge/join` (Rate-limited entry portal for students)

### Protected API Routes (Authenticated / Role-Based Access)
These routes are strictly guarded by JWT validation and RBAC. Unauthenticated requests are rejected with a `401 Unauthorized` status.
- `/api/admin/users` (Admin only)
- `/api/staff/content` (Staff only, strict Zod validation)
- `/api/challenge/create` (Staff/Admin only, strict Zod validation)
- `/api/user/settings` (Authenticated users only)
- `/api/content/upload` (Authenticated users only, MIME-type and size restricted)

## 3. Rate Limit Inventory
Below are the active rate limit rules protecting the application:

| Endpoint | Limit Rule | Protection Mechanism | Purpose |
|----------|------------|-----------------------|---------|
| `/login` (`POST`) | 5 attempts / 60 seconds | Custom IP Rate Map | Stops credential stuffing and brute-force password guessing. Temporarily locks out IP. |
| `/api/challenge/join` (`POST`) | 5 requests / 60 seconds | `simple-rate-limit.ts` | Stops bot scripts from brute-forcing active room codes or flooding active sessions. |
| `/api/team-token` (`GET`) | 10 requests / 60 seconds | `simple-rate-limit.ts` | Prevents mass generation of QR short-codes. |
| `/api/team-token` (`POST`) | 20 requests / 60 seconds | `simple-rate-limit.ts` | Prevents attackers from brute-forcing 6-character authentication tokens. |

## 4. Summary of Residual Risks

While the application is currently highly secure and follows modern best practices, here are the residual risks that exist inherently due to architecture choices:
1. **In-Memory Rate Limiting**: The current rate limiters (both the login map and `simple-rate-limit.ts`) store IP addresses *in memory*. If deployed on serverless functions (like Vercel) or multi-node containers, the rate limit is reset on cold starts and is not shared across nodes. This means an attacker hitting different edge nodes could bypass the 5-attempt limit. 
   - *Mitigation*: Migrate to a centralized store like Vercel KV / Redis (e.g., `@upstash/ratelimit`).
2. **Denial of Service via Cloudinary Uploads**: While file size limits exist (5MB/10MB), an authenticated user could still upload thousands of files rapidly, potentially inflating your Cloudinary billing.
   - *Mitigation*: Implement a Redis-backed rate limit specifically on the `/api/content/upload` endpoint per user ID.
3. **Open Redirect Bypass**: I patched the obvious open redirect bypasses. However, attackers continuously find new encoding tricks. 
   - *Mitigation*: If you do not explicitly need the `?redirect=` parameter to go to dynamic URLs, consider dropping it entirely and only using the static `getRedirectUrl(user.role)` logic.
