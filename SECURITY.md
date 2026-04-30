# Security Policy

## 🚨 Quick Links

- **[Security Dashboard](./SECURITY_DASHBOARD.md)** - Current security status and metrics
- **[Security Setup Guide](./SECURITY_SETUP.md)** - Complete setup instructions
- **[Report a Vulnerability](#reporting-a-vulnerability)** - How to report security issues

---

## Supported Versions

The following versions of Kesararam With Digital are actively maintained and receive security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | ✅ Yes |
| Older branches       | ❌ No  |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please **do not open a public GitHub issue**.

### How to Report

Please use **[GitHub's private vulnerability reporting](https://github.com/shiliaiwei/kesararam/security/advisories/new)** to report security issues confidentially.

Alternatively, you can email the maintainers directly at the contact listed in the repository's profile.

### What to Include

When reporting, please include:
- A clear description of the vulnerability
- Steps to reproduce the issue
- The potential impact (data exposure, XSS, auth bypass, etc.)
- Any suggested fixes (optional but appreciated)

### Response Timeline

| Step | Timeframe |
|------|-----------|
| Acknowledgement of report | Within **48 hours** |
| Initial triage and severity assessment | Within **5 business days** |
| Fix deployed (for critical/high issues) | Within **14 days** |
| Public disclosure (coordinated) | After fix is live |

## Security Measures

This project implements the following security controls:

- **Dependabot** — automated weekly vulnerability scanning of all npm dependencies
- **CodeQL** — static application security testing (SAST) on every pull request
- **npm audit** — automated audit in CI pipeline, blocks merges on high/critical findings
- **Security Headers** — HSTS, CSP, X-Frame-Options, COOP, CORP, COEP, Referrer-Policy
- **SQL Injection Prevention** — parameterized queries via Drizzle ORM
- **Authentication** — JWT-based auth with `jose`, short-lived tokens
- **Input Validation** — Zod schema validation on all API routes

## Acknowledgements

We appreciate all responsible disclosures. Contributors who report valid security issues will be acknowledged in our release notes (with their permission).
