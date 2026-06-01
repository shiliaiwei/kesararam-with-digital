# Security Policy

## About This Project

**Kesararam With Digital (KWD)** is a free, bilingual (English · ខ្មែរ) road-safety
and driving-education platform built by young Cambodian women from Kesararam for
students across Cambodia. Because our users include **students and minors**, and
because we store accounts, quiz/game progress, and admin-managed learning content,
we treat the security and privacy of that data as a first-class responsibility —
not an afterthought.

This document explains how to report a vulnerability and what protections are
already in place.

---

## Supported Versions

| Version              | Supported          |
| -------------------- | ------------------ |
| Latest (`main` / production) | ✅ Yes      |
| Other branches / forks       | ❌ No       |

Only the currently deployed `main` branch receives security updates. There are no
backported fixes for older commits or branches.

---

## Reporting a Vulnerability

**Please do _not_ open a public GitHub issue, pull request, or discussion for a
security problem.** Public disclosure before a fix puts students' data at risk.

### How to report — preferred

Use **[GitHub Private Vulnerability Reporting](https://github.com/shiliaiwei/kesararam/security/advisories/new)**.
This opens a confidential advisory visible only to you and the maintainers.

If you cannot use GitHub advisories, contact the maintainers privately via the
email listed on the repository profile.

### What to include

A good report helps us fix faster. Please include:

- A clear description of the vulnerability and the affected area (page, API route,
  server action, or dependency).
- Step-by-step reproduction (requests, payloads, or a proof-of-concept).
- The impact you believe it has — e.g. data exposure, account/auth bypass, XSS,
  CSRF, SSRF, privilege escalation, or denial of service.
- Any suggested remediation (optional, but appreciated).

### Response timeline

| Step                                       | Target            |
| ------------------------------------------ | ----------------- |
| Acknowledge your report                    | within **48 hours** |
| Initial triage & severity assessment       | within **5 business days** |
| Fix deployed for critical / high issues    | within **14 days** |
| Coordinated public disclosure              | after the fix is live |

---

## Scope

### In scope

- The web application in this repository (pages, API routes under
  `src/app/api/`, and server actions under `src/app/actions/`).
- Authentication and session handling (JWT via `jose`).
- Data access through Drizzle ORM / Neon Postgres.
- Security misconfigurations (headers, CSP, CORS, cookies).
- Exposure of secrets (`DATABASE_URL`, API keys) in client bundles or git history.

### Out of scope

- Vulnerabilities in third-party services we depend on (Neon, Cloudinary, Pusher,
  Mapbox, Google Analytics, Vercel) — please report those to the respective vendor.
- Reports generated solely by automated scanners with no demonstrated impact.
- Missing security headers on endpoints that are already covered by the global
  policy in `next.config.ts`.
- Best-practice suggestions without a concrete exploit (e.g. "you should add X")
  are welcome as regular issues, not security reports.
- Social engineering, physical attacks, and volumetric DDoS.

---

## Security Measures

The following controls are implemented in this codebase today:

### Application

- **SQL-injection resistant** — all database access uses parameterized queries via
  **Drizzle ORM**; no string-concatenated SQL.
- **Authentication** — short-lived **JWT** tokens signed/verified with `jose`.
- **Input validation** — request payloads validated with **Zod** schemas.
- **Server-only writes** — all database mutations run through `"use server"`
  server actions; secrets (`DATABASE_URL`, API keys) are never exposed to the client.
- **Hardened image loading** — `next/image` restricted to an allowlist of trusted
  remote hosts (`remotePatterns` in `next.config.ts`).

### HTTP security headers (`next.config.ts`)

- **Content-Security-Policy** with `default-src 'self'`, `frame-ancestors 'none'`,
  `base-uri 'self'`, `form-action 'self'`, and `upgrade-insecure-requests`.
- **Strict-Transport-Security** — `max-age=63072000; includeSubDomains; preload`.
- **X-Frame-Options: DENY** and **X-Content-Type-Options: nosniff**.
- **Referrer-Policy: strict-origin-when-cross-origin**.
- **Permissions-Policy** denying camera, microphone, geolocation, payment, USB,
  and FLoC (`interest-cohort`).
- **Cross-Origin-Opener-Policy** and **Cross-Origin-Resource-Policy** set; the
  `X-Powered-By` header is disabled.

### CI / supply chain

- **CodeQL** — static application security testing on pull requests
  (`.github/workflows/codeql.yml`).
- **Secret scanning** — CI blocks committed `.env` files and greps `src/` for
  hardcoded secrets (`.github/workflows/secret-scan.yml`), backed by the local
  `scripts/check-secrets.sh` hook (`npm run security:check`).
- **Security workflow** — `.github/workflows/security.yml` runs
  `pnpm audit --audit-level=critical`, ESLint, a TypeScript typecheck
  (`tsc --noEmit`), and Vitest; critical advisories block merges.
- **Dependabot** — automated dependency vulnerability alerts and update PRs
  (`.github/dependabot.yml`).
- **Local guardrails** — `npm run security:full` (audit + secret check + lint +
  tests) and pre-commit hooks via `npm run security:install-hooks`.

---

## Verify Our Security

You can independently check the production deployment:

- **Headers** — https://securityheaders.com/?q=kesararamwithdigital.tech
- **TLS / SSL** — https://www.ssllabs.com/ssltest/
- **CSP** — https://csp-evaluator.withgoogle.com/

Maintainer-only dashboards:

- **Security alerts** — https://github.com/shiliaiwei/kesararam/security
- **Dependabot** — https://github.com/shiliaiwei/kesararam/security/dependabot

---

## Safe Harbor

We will not pursue or support legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction, and
  service disruption.
- Only interact with accounts they own or have explicit permission to test.
- Give us a reasonable window to remediate before any public disclosure.

Activities conducted consistently with this policy are considered authorized.

## Acknowledgements

We're grateful for every responsible disclosure. With your permission, valid
reporters are credited in our release notes.
