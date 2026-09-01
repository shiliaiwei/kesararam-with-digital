# Contributing to Kesararam With Digital

This document outlines the internal development and code quality standards for **Kesararam With Digital**.

---

## Testing and Code Quality

Before submitting a branch or opening a pull request, verify that all test suites and type checks pass:

```bash
pnpm test
pnpm tsc --noEmit
pnpm lint
```

---

## Design System and Brand Guidelines

Kesararam With Digital strictly enforces a **Brutalist Road-Sign and Caution-Tape** design identity:

- **Colors**: Road sign yellow (`#eab308`), solid black (`#000000`), white (`#ffffff`), and traffic semantics (red = danger/stop, green = success/go, blue = info).
- **Geometry**: Sharp or structured borders (`border-2 border-black` or `border-[3px] border-black`), hard offset drop-shadows (no Gaussian blur).
- **Icons**: Library icons only (Lucide Icons). No emoji or raw Unicode symbols in UI surfaces.
- **Typography**: Kantumruy Pro and Roboto for bilingual Khmer and English readability.

---

## Branch and Review Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Implement scoped changes adhering to domain boundaries.
3. Verify test suites and linters pass (`pnpm test && pnpm lint && pnpm exec tsc --noEmit`).
4. Commit with descriptive semantic messages (`feat: ...`, `fix: ...`, `refactor: ...`).
5. Submit a pull request for team review.

---

## Proprietary Rights & Licensing

Kesararam With Digital is a private, proprietary software project. All contributions, code, assets, and documentation submitted to this repository become the proprietary intellectual property of Kesararam With Digital under its [Proprietary License](LICENSE).
