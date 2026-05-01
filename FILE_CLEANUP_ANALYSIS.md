# File Cleanup Analysis - KWD Project

**Analysis Date**: 2026-05-01  
**Project**: Kesararam With Digital (KWD) - Cambodian Driving License Education Platform  
**Tech Stack**: Next.js 16, TypeScript, Neon Postgres, Drizzle ORM

---

## 📊 Summary

| Category | Count | Action |
|----------|-------|--------|
| **DELETE NOW** | 15 files | Remove immediately - temporary/completed scripts |
| **KEEP FOR LATER** | 8 files | Archive - may be useful for future maintenance |
| **KEEP (ACTIVE)** | All others | Currently used in production/development |

---

## 🗑️ DELETE NOW (15 files)

These files are temporary, completed one-time scripts, or redundant documentation that should be deleted immediately.

### Root Directory - Temporary Scripts (7 files)

1. **`__error.log`**
   - **Type**: Error log file
   - **Reason**: Temporary log file, should not be in version control
   - **Action**: Delete and add `*.log` to `.gitignore`

2. **`_update_seo.mjs`**
   - **Type**: Temporary utility script
   - **Reason**: One-time SEO update script (prefix `_` indicates temporary)
   - **Action**: Delete

3. **`_write_editor.mjs`**
   - **Type**: Temporary utility script
   - **Reason**: One-time content generation script
   - **Action**: Delete

4. **`_write_home.mjs`**
   - **Type**: Temporary utility script
   - **Reason**: One-time content generation script
   - **Action**: Delete

5. **`test-pdf.js`**
   - **Type**: Test script
   - **Reason**: Temporary testing file, not part of test suite
   - **Action**: Delete

6. **`extract-pdf.cjs`**
   - **Type**: PDF extraction utility (CommonJS)
   - **Reason**: Duplicate of `extract-pdf.mjs`, not used in package.json
   - **Action**: Delete (keep .mjs version if needed)

7. **`extract-pdf.mjs`**
   - **Type**: PDF extraction utility (ES Module)
   - **Reason**: One-time data extraction script, already completed
   - **Action**: Delete (data already extracted to `data-content/`)

### Root Directory - Completed Transformation Scripts (2 files)

8. **`transform_qa_with_emotions.py`**
   - **Type**: Python transformation script
   - **Reason**: Completed - already transformed all Q&A files with emotions
   - **Status**: Task completed and committed (commit: 1faca58)
   - **Action**: Delete

9. **`transform_qa_with_emotions_inline.py`**
   - **Type**: Python transformation script (inline version)
   - **Reason**: Completed - final version used for transformation
   - **Status**: Task completed and committed
   - **Action**: Delete

### Root Directory - Redundant Documentation (5 files)

10. **`SECURITY_DASHBOARD.md`**
    - **Type**: Security documentation
    - **Reason**: Redundant - information covered in main SECURITY.md
    - **Action**: Delete (keep SECURITY.md only)

11. **`SECURITY_QUICKSTART.md`**
    - **Type**: Security documentation
    - **Reason**: Redundant - quick start info in SECURITY.md
    - **Action**: Delete

12. **`SECURITY_SETUP.md`**
    - **Type**: Security documentation
    - **Reason**: Redundant - setup info in SECURITY.md
    - **Action**: Delete

13. **`SECURITY_SUMMARY.txt`**
    - **Type**: Security documentation
    - **Reason**: Redundant - summary in SECURITY.md
    - **Action**: Delete

14. **`START_HERE.md`**
    - **Type**: Getting started guide
    - **Reason**: Redundant - README.md serves as main entry point
    - **Action**: Delete (merge any unique content into README.md)

15. **`TODO_SECURITY_ACTIONS.md`**
    - **Type**: Security action checklist
    - **Reason**: One-time setup checklist, likely completed
    - **Action**: Delete if security setup is complete

### Scripts Directory - Test Scripts (Move to DELETE if not needed)

**Note**: Check if these are still used for debugging before deleting

- `scripts/test-admin-review-api.mjs`
- `scripts/test-api-endpoint.mjs`
- `scripts/test-drizzle-insert.mjs`
- `scripts/test-drizzle-login.mjs`
- `scripts/test-error-msg.mjs`
- `scripts/test-fixed-api.mjs`
- `scripts/test-insert.mjs`
- `scripts/test-login.mjs`
- `scripts/test-topics-insert.mjs`
- `scripts/test-update.mjs`

**Recommendation**: Delete all test-*.mjs files (10 files) - they are ad-hoc test scripts, not part of the formal test suite (Vitest)

---

## 📦 KEEP FOR LATER (8 files)

These files are not currently needed but may be useful for future maintenance, data updates, or debugging.

### Scripts Directory - Utility Scripts

1. **`scripts/fix-img-label.py`**
   - **Type**: Python utility script
   - **Reason**: May be needed to fix image labels in future content updates
   - **Action**: Keep in `scripts/` directory

2. **`scripts/write-popup.py`**
   - **Type**: Python content generation script
   - **Reason**: May be needed to generate popup content in the future
   - **Action**: Keep in `scripts/` directory

3. **`scripts/fix-popup.py`**
   - **Type**: Python utility script
   - **Reason**: May be needed to fix popup content
   - **Action**: Keep in `scripts/` directory

4. **`scripts/write-ccm.py`**
   - **Type**: Python content generation script
   - **Reason**: May be needed for CCM (Custom Content Module) generation
   - **Action**: Keep in `scripts/` directory

5. **`scripts/cleanup-broken-images.mjs`**
   - **Type**: Maintenance script
   - **Reason**: Useful for periodic cleanup of broken image references
   - **Action**: Keep in `scripts/` directory

6. **`scripts/cleanup.mjs`**
   - **Type**: General cleanup script
   - **Reason**: May be useful for future cleanup tasks
   - **Action**: Keep in `scripts/` directory

### Scripts Directory - Database Check Scripts

7. **`scripts/check-existing-topics.mjs`**
   - **Type**: Database verification script
   - **Reason**: Useful for debugging topic-related issues
   - **Action**: Keep in `scripts/` directory

8. **`scripts/check-schema.mjs`**
   - **Type**: Database schema verification
   - **Reason**: Useful for debugging schema issues
   - **Action**: Keep in `scripts/` directory

### Documentation

9. **`FINAL_FORMAT_SUMMARY.md`**
   - **Type**: Documentation
   - **Reason**: Documents the Q&A format transformation
   - **Action**: Keep for reference

10. **`TRANSFORMATION_SUMMARY.md`**
    - **Type**: Documentation
    - **Reason**: Documents the emotional voice tone transformation
    - **Action**: Keep for reference

---

## ✅ KEEP (ACTIVE)

These files are actively used in production or development.

### Configuration Files
- `package.json` - Project dependencies and scripts
- `package-lock.json` - Dependency lock file
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration
- `vitest.config.ts` - Vitest test configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `components.json` - shadcn/ui components configuration
- `vercel.json` - Vercel deployment configuration
- `.gitignore` - Git ignore rules
- `.env.local` - Environment variables (not in git)
- `CNAME` - Custom domain configuration

### Documentation
- `README.md` - Main project documentation
- `SECURITY.md` - Security policy (keep this one)
- `.agent.md` - AI agent instructions

### Source Code
- `src/` - All application source code
- `public/` - Static assets
- `data-content/` - Q&A content data

### Scripts Directory - Active Scripts
- `scripts/migrate.ts` - Database migration (used in npm scripts)
- `scripts/verify-migration.ts` - Migration verification (used in npm scripts)
- `scripts/generate-jwt-secret.js` - JWT secret generation (used in npm scripts)
- `scripts/check-secrets.sh` - Secret scanning (used in npm scripts)
- `scripts/install-git-hooks.sh` - Git hooks installation (used in npm scripts)
- `scripts/seed-*.ts` - Database seeding scripts
- `scripts/create-*.mjs` - Database table creation scripts
- `scripts/add-*.mjs` - Database migration scripts
- `scripts/check-*.mjs` - Database verification scripts (active)
- `scripts/list-users.mjs` - User management utility
- `scripts/verify-questions.mjs` - Question verification

---

## 🚀 Cleanup Commands

### Step 1: Delete Temporary Files (Root Directory)

```bash
cd kesararam

# Delete temporary scripts and logs
rm __error.log
rm _update_seo.mjs
rm _write_editor.mjs
rm _write_home.mjs
rm test-pdf.js
rm extract-pdf.cjs
rm extract-pdf.mjs

# Delete completed transformation scripts
rm transform_qa_with_emotions.py
rm transform_qa_with_emotions_inline.py

# Delete redundant security documentation
rm SECURITY_DASHBOARD.md
rm SECURITY_QUICKSTART.md
rm SECURITY_SETUP.md
rm SECURITY_SUMMARY.txt
rm START_HERE.md
rm TODO_SECURITY_ACTIONS.md
```

### Step 2: Delete Test Scripts (Scripts Directory)

```bash
cd scripts

# Delete ad-hoc test scripts
rm test-admin-review-api.mjs
rm test-api-endpoint.mjs
rm test-drizzle-insert.mjs
rm test-drizzle-login.mjs
rm test-error-msg.mjs
rm test-fixed-api.mjs
rm test-insert.mjs
rm test-login.mjs
rm test-topics-insert.mjs
rm test-update.mjs
```

### Step 3: Update .gitignore

Add these patterns to `.gitignore` to prevent future temporary files:

```bash
# Add to .gitignore
echo "" >> .gitignore
echo "# Temporary files" >> .gitignore
echo "*.log" >> .gitignore
echo "__*.log" >> .gitignore
echo "_*.mjs" >> .gitignore
echo "test-*.js" >> .gitignore
echo "test-*.mjs" >> .gitignore
```

### Step 4: Commit Changes

```bash
git add .
git commit -m "chore: cleanup temporary files and redundant documentation

- Remove temporary scripts (_*.mjs, test-*.js)
- Remove completed transformation scripts (*.py)
- Remove redundant security documentation
- Remove ad-hoc test scripts
- Update .gitignore to prevent future temporary files"

git push origin docs
```

---

## 📋 Verification Checklist

After cleanup, verify:

- [ ] Application still runs: `npm run dev`
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm run test`
- [ ] Database migrations work: `npm run db:migrate`
- [ ] Security scripts work: `npm run security:full`
- [ ] No broken imports in source code
- [ ] README.md is still comprehensive
- [ ] SECURITY.md contains all necessary security info

---

## 📊 Cleanup Impact

### Before Cleanup
- Root directory: 30+ files (cluttered)
- Scripts directory: 60+ files (many unused)
- Documentation: 6 security files (redundant)

### After Cleanup
- Root directory: ~15 files (clean, essential only)
- Scripts directory: ~40 files (active utilities only)
- Documentation: 3 files (README, SECURITY, .agent)

### Benefits
- ✅ Cleaner project structure
- ✅ Easier navigation
- ✅ Reduced confusion for new developers
- ✅ Faster file searches
- ✅ Better git history (fewer noise files)

---

## 🎯 Recommendations

1. **Create a `scripts/archive/` directory** for scripts you want to keep but rarely use
2. **Document active scripts** in README.md under a "Utility Scripts" section
3. **Use consistent naming**:
   - `test-*.mjs` → Move to proper test suite or delete
   - `_*.mjs` → Always temporary, delete after use
   - `*.py` → Keep only if actively maintained
4. **Regular cleanup**: Review and cleanup every 3 months

---

**Analysis Complete** ✅

**Next Step**: Review this analysis and run the cleanup commands when ready.
