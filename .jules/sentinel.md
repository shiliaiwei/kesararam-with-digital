
## 2025-02-18 - Math.random() for Security Codes
**Vulnerability:** Found `Math.random()` used to generate access codes/passwords in `src/app/actions/classes.ts` and `src/app/actions/enrollment.ts`.
**Learning:** This is an insecure PRNG that can be predicted by an attacker.
**Prevention:** Use cryptographically secure pseudo-random number generator (CSPRNG) from `crypto.randomBytes` or `crypto.getRandomValues`.
