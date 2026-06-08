# 🏗️ KWD Project Structure

> **Kesararam With Digital** - Cambodian Driving Education Platform

## 📂 Root Directory Structure

```
kesararam/
├── .claude/                 Kiro AI configuration and skills
├── .github/                 GitHub workflows and CI/CD
├── .vscode/                 VSCode workspace settings
├── docs/                    📚 All documentation (see docs/README.md)
├── public/                  🌐 Static assets and public files
├── src/                     💻 Application source code
├── scripts/                 🔧 Build and deployment scripts
├── data-content/            📊 Content data files
└── node_modules/            📦 Dependencies (auto-generated)
```

## 🗂️ Detailed Structure

### `/src` - Source Code
Main application code organized by Next.js App Router structure:

```
src/
├── app/                     Next.js App Router pages
│   ├── (public)/           Public-facing pages (no auth)
│   ├── (dashboard)/        Protected dashboard pages
│   ├── actions/            Server actions
│   ├── api/                API routes
│   └── globals.css         Global styles
├── components/              React components
│   ├── brand/              Brand-specific components
│   ├── game/               Game/quiz components
│   ├── pricing/            Subscription components
│   └── shared/             Shared UI components
├── context/                 React context providers
├── db/                      Database schema and queries
├── lib/                     Utility libraries
└── types/                   TypeScript type definitions
```

### `/public` - Static Assets
```
public/
├── avatar/                  User avatar assets
├── brand/                   Brand logos and images
├── rewards/                 Reward item images
└── [various images]         Road signs, illustrations, etc.
```

### `/docs` - Documentation
Complete documentation organized by category. See `docs/README.md` for details:
- **business-plans/** - Business documents and reports
- **technical-docs/** - System architecture and development docs
- **scripts/** - Utility scripts and tools
- **brand-assets/** - Brand guidelines and mockups
- **archive/** - Historical backups (not in version control)

### `/data-content` - Content Files
Structured content for the learning platform:
```
data-content/
├── categories/              Learning categories
├── lessons/                 Lesson content
├── questions/               Quiz questions
└── [other content]          Additional learning materials
```

### `/scripts` - Build Scripts
Deployment and build automation scripts.

## 🔑 Key Configuration Files

### Development
- `package.json` - Node dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `vitest.config.ts` - Test configuration
- `eslint.config.mjs` - Linting rules

### Database
- `drizzle.config.ts` - Database ORM configuration

### Deployment
- `vercel.json` - Vercel deployment settings
- `.github/workflows/` - CI/CD pipelines

### Security
- `SECURITY.md` - Security policy and contact
- `.env.local` - Environment variables (not in git)

## 🎯 Key Features by Directory

### Authentication & Authorization
- `src/lib/auth.ts` - JWT authentication
- `src/app/actions/auth.ts` - Auth server actions
- `src/app/(public)/login/` - Login pages
- `src/app/(public)/register/` - Registration pages

### Learning System
- `src/app/(public)/learn/` - Learning content pages
- `src/components/learn/` - Learning UI components
- `data-content/lessons/` - Lesson content

### Quiz & Game System
- `src/app/(public)/play/` - Quiz game pages
- `src/components/game/` - Game UI components
- `data-content/questions/` - Question bank

### Subscription System
- `src/app/api/subscriptions/` - Subscription API
- `src/components/pricing/` - Pricing UI
- `docs/technical-docs/SUBSCRIPTION_SYSTEM.md` - Full docs

### Dashboard (Teacher/Admin)
- `src/app/(dashboard)/teacher/` - Teacher dashboard
- `src/app/(dashboard)/admin/` - Admin dashboard
- External dashboard: `https://dashboard.kesararamwithdigital.tech`

### Student Profile
- `src/app/(public)/u/[username]/` - Public student profiles
- `src/app/(public)/profile/student/` - Student settings
- `src/components/shared/avatar-display.tsx` - Avatar system

## 🌍 Internationalization

### Language Support
- **Khmer (kh)** - Primary language
- **English (en)** - Secondary language

### Font System
- **Google Sans** - UI elements (system font)
- **Siemreap** - Learning content (Khmer)
- **Stack Notch** - English UI elements

### Language Files
- `src/lib/translations.ts` - Translation strings
- `src/context/lang-context.tsx` - Language context

## 🔒 Security & Privacy

### Protected Routes
Authentication middleware protects:
- `/profile/*` - User profiles
- `/api/user/*` - User API endpoints
- Dashboard external site

### Environment Variables
Required in `.env.local`:
- `DATABASE_URL` - Neon PostgreSQL connection
- `JWT_SECRET` - JWT token secret
- `STRIPE_SECRET_KEY` - Payment processing
- `CLOUDINARY_*` - Image hosting

### Security Features
- JWT authentication
- CSRF protection
- Input validation
- Rate limiting on API routes
- Secure password hashing

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Design System
- **Brutalist/Neubrutalism style**
- Sharp corners, thick borders
- Hard shadows: `shadow-[4px_4px_0_#000]`
- Primary color: `#eab308` (yellow)
- Accent color: `#ff0050` (red/pink)

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## 🚀 Development Workflow

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## 📊 Database

### Technology
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM**

### Schema Location
- `src/db/schema.ts` - Database schema definitions
- `src/db/queries.ts` - Common queries

### Migrations
Database migrations managed by Drizzle.

## 🎨 Brand Assets

### Logos
- `public/brand/logo.png` - Main logo
- `public/brand/kwd-black-nobg.svg` - Black logo (no background)

### Brand Guidelines
- See `docs/brand-assets/` for full guidelines
- Skill: `.claude/skills/kwd-brand-design/SKILL.md`

## 📝 Documentation Updates

When adding new features:
1. Update relevant files in `docs/technical-docs/`
2. Add examples to `docs/technical-docs/QUICK_REFERENCE.md`
3. Update this file if structure changes
4. Update `docs/README.md` if adding new doc categories

## 🔄 Recent Changes

### June 7, 2026 - Project Reorganization
- Moved all business documents to `docs/business-plans/`
- Consolidated technical docs in `docs/technical-docs/`
- Archived old backups in `docs/archive/`
- Moved utility scripts to `docs/scripts/`
- Created comprehensive documentation structure
- Added `.gitignore` rules for archives and sensitive files

## 📞 Support & Contact

- **Repository**: GitHub (private)
- **Production**: https://kesararamwithdigital.tech
- **Dashboard**: https://dashboard.kesararamwithdigital.tech
- **Security**: See `SECURITY.md` for vulnerability reporting

---

**Last Updated**: June 7, 2026  
**Maintained by**: KWD Development Team
