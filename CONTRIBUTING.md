# Contributing to Kesararam With Digital

Thank you for your interest in contributing to **Kesararam With Digital**.

---

## Testing and Code Quality

Before submitting a pull request, verify that all test suites and type checks pass:

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

## Pull Request Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Implement scoped changes adhering to domain boundaries.
3. Verify test suites and linters pass.
4. Commit with descriptive semantic messages (`feat: ...`, `fix: ...`, `refactor: ...`).
5. Submit a pull request with a concise description of the changes.

---

## License

By contributing to Kesararam With Digital, you agree that your contributions are licensed under the project's [MIT License](LICENSE).
