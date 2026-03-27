# Quick Fix Reference Card

## Problem
Student profile page showing "Server Components render error" and API returning 500 errors.

## Root Cause
Database columns defined in schema but never migrated to actual database.

## Solution (3 Steps)

### Step 1: Run Migration
```bash
npm run db:migrate
```
Expected output: `✅ Migration completed successfully!`

### Step 2: Verify Migration
```bash
npm run db:verify
```
Expected output: 
```
✅ All game stats columns exist!
✅ All indexes exist!
```

### Step 3: Test Profile Page
```bash
npm run dev
```
Then navigate to: `http://localhost:3000/profile/student`

## What Was Added

### Database Columns
- `highest_score` (INTEGER, DEFAULT 0)
- `total_games_played` (INTEGER, DEFAULT 0)
- `lifetime_points` (INTEGER, DEFAULT 0)

### Database Indexes
- `users_highest_score_idx`
- `users_lifetime_points_idx`

### NPM Scripts
- `npm run db:migrate` - Run database migrations
- `npm run db:verify` - Verify migration success

## Files Created
- `scripts/migrate.ts` - Migration runner
- `scripts/verify-migration.ts` - Migration verifier
- `SERVER_COMPONENTS_FIX.md` - Detailed docs
- `PROFILE_ERROR_RESOLUTION.md` - Complete guide
- `FIXES_COMPLETE_SUMMARY.md` - Full summary
- `QUICK_FIX_REFERENCE.md` - This file

## Status
✅ All errors fixed
✅ Migration completed
✅ Columns verified
✅ No TypeScript errors
✅ SEO compliant

## If Errors Persist

1. Check database connection:
   ```bash
   echo $DATABASE_URL
   ```

2. Re-run migration:
   ```bash
   npm run db:migrate
   ```

3. Check server logs:
   ```bash
   npm run dev
   ```
   Look for error messages in console

4. Verify columns exist:
   ```bash
   npm run db:verify
   ```

## Support
See detailed documentation in:
- `SERVER_COMPONENTS_FIX.md`
- `PROFILE_ERROR_RESOLUTION.md`
- `FIXES_COMPLETE_SUMMARY.md`
