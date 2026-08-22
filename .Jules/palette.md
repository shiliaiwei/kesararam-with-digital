## 2024-05-18 - Missing ARIA labels and titles on icon-only action links/buttons
**Learning:** Icon-only action links/buttons inside lists and data tables (like View, Edit, Delete) often lack `aria-label` and `title` attributes in this app, making them completely opaque to screen readers and difficult to understand visually for some users.
**Action:** When adding new icon-only actions, ensure both `aria-label` (for screen readers) and `title` (for native visual tooltip) are included.
