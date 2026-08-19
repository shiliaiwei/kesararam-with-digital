## 2024-05-18 - Added ARIA attributes to mobile menu button
**Learning:** Found an icon-only button without an ARIA label in the sidebar, a common pattern that fails screen readers.
**Action:** Next time, review all icon-only toggles and ensure they communicate state with `aria-expanded` and dynamic `aria-label`.
