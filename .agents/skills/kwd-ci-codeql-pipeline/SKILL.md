---
name: kwd-ci-codeql-pipeline
description: >
  KWD (Kesararam With Digital) GitHub Actions CI/CD, CodeQL security analysis,
  multi-branch synchronization (main + docs), and automated deployment workflows.
  Use when configuring, reviewing, or fixing GitHub Actions workflows (.github/workflows/*),
  resolving CodeQL timeouts/failures, or validating CI quality gates (lint, typecheck, vitest, secrets).
---

# KWD CI/CD & CodeQL Pipeline Standards

## 1. CodeQL Analysis for JavaScript & TypeScript

### The `build-mode: none` Imperative
In modern GitHub Actions CodeQL Action v3 (`github/codeql-action/*@v3`), JavaScript and TypeScript are analyzed directly via AST without requiring an active build step or dependency installation.

**Rules:**
1. **Never** run `pnpm install` or build steps inside the `codeql.yml` workflow for `javascript-typescript`. Doing so causes timeout failures (especially with lockfile version mismatches or toolchain differences).
2. Always specify `build-mode: none` in `github/codeql-action/init@v3`.
3. Set `timeout-minutes: 30` (or less) instead of 60.

### Canonical `codeql.yml` Pattern
```yaml
name: CodeQL Security Analysis

on:
  push:
    branches: [main, docs]
  pull_request:
    branches: [main, docs]
  schedule:
    - cron: "0 8 * * 3"

permissions:
  actions: read
  contents: read
  security-events: write

jobs:
  analyze:
    name: CodeQL Analyze
    runs-on: ubuntu-latest
    timeout-minutes: 30

    strategy:
      fail-fast: false
      matrix:
        language: ["javascript-typescript"]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          build-mode: none
          queries: security-extended

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

---

## 2. Multi-Branch Trigger Synchronization (`main` and `docs`)

Kesararam With Digital maintains two synchronized production branches:
- **`main`**: Primary development & feature trunk.
- **`docs`**: GitHub default repository branch / public portal branch.

**Workflow Rule:**
Every workflow in `.github/workflows/` (`codeql.yml`, `security.yml`, `secret-scan.yml`) **must** list both branches in push and pull_request triggers:
```yaml
on:
  push:
    branches: [main, docs]
  pull_request:
    branches: [main, docs]
```

---

## 3. Package Management & Lockfile Integrity in CI

1. The project sets `frozen-lockfile=false` in `.npmrc`.
2. When executing CI commands (`pnpm install`), always use `--no-frozen-lockfile` (e.g., `run: pnpm install --no-frozen-lockfile`) in `.github/workflows/security.yml` to prevent frozen lockfile mismatch errors across environment versions.

---

## 4. Local Pre-Push Quality Verification Checklist

Before pushing commits or merging to `docs`/`main`, run:
1. `npm run lint` — ESLint validation.
2. `npx tsc --noEmit` — Full TypeScript type-safety check.
3. `pnpm run test` (or `npx vitest --run`) — Unit and integration tests.

---

## 5. Branch Merging & Synchronization Protocol

When the user asks to "merge" or "sync" branches:
```bash
# 1. Ensure working directory is clean
git status

# 2. Sync and push docs
git checkout docs
git merge main
git push origin docs

# 3. Fast-forward main and push
git checkout main
git merge docs
git push origin main

# 4. Return to active branch
git checkout docs
```

---

## 6. Official Domain References

The platform is officially served and verifiable across:
- Primary Custom Domain: `https://kesararamwithdigital.tech`
- Canonical Subdomain: `https://www.kesararamwithdigital.tech`
- Vercel Edge Mirror: `https://kesararamwithdigital.vercel.app`
