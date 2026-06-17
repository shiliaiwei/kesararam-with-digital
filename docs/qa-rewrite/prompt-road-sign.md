# Authoring Prompt — Road-Sign Q&A
**Category 1 · `road-sign` · Traffic Signs / សញ្ញាចរាចរ**

> Use this prompt to generate the road-sign Q&A set.
> **Before authoring, read [`banned-words-cheatsheet.md`](banned-words-cheatsheet.md) and follow it strictly.**

## Task
Generate **9 questions per topic** for **all 247 road-sign topics**, processed in `sort_order` (then `id`). Link every question to its topic. Total ≈ **2,223 questions**.

## Difficulty mix (per topic)
**easy ×4 · medium ×3 · hard ×2** — leans accessible for students.

## 9-slot suite (per topic)
| Slot | Difficulty | Type |
|------|-----------|------|
| 1 | easy | MCQ (4) — identify / meaning |
| 2 | easy | True / False — basic rule |
| 3 | easy | Image-selection — text question, 4 sign-image options |
| 4 | easy | MCQ (4) — basic fact |
| 5 | medium | MCQ (4) — correct action |
| 6 | medium | Scenario MCQ — apply it |
| 7 | medium | True / False — common misconception |
| 8 | hard | MCQ (4) — why / safety purpose |
| 9 | hard | MCQ (4) / scenario — law, penalty, or edge case |

**Fill-in-the-blank** is also allowed where it fits (still ≤ 4 options).

## Image rule (road-sign ONLY)
- **MCQ & True/False slots** — show the **topic's own real image** (`primary_image_url` — the "owner") above the question; answers are text (4) or ត្រូវ/ខុស (2).
- **Image-selection slot (Sign Challenge)** — **NO image above the question.** The stem is **text only** (it states the meaning); the **4 options are sign images** = the **owner image + 3 random distractors** from other topics. The player matches the text to the correct sign.

## Answer rules
- **Max 4 options per question** (always ≤ 4): MCQ = 4, True/False = 2, fill-in-blank ≤ 4.
- Exactly **one** correct answer (`isCorrect: true`).

## Khmer phrasing styles (approved)
- **Never use the `៖` sign** anywhere.
- **True/False (slots 2, 7)** — write a short real-life **scenario as a statement**; **no `ត្រូវ ឬ ខុស` prefix**. Answers stay **ត្រូវ / ខុស**.
  - true → `អ្នកបើកបរឃើញសញ្ញានេះនៅមុខផ្លូវ ហើយបន្ថយល្បឿនភ្លាម។`
  - misconception (ខុស) → `សុខគិតថា ឃើញសញ្ញានេះ គាត់នៅតែបើកលឿនដដែលបាន។`
- **Meaning (slot 1)** — driver's-eye, not textbook: `ឃើញសញ្ញានេះនៅតាមផ្លូវ តើវាប្រាប់អ្នកបើកបរយ៉ាងណា?`
- **Sign Challenge (slot 3)** — text stem states the meaning, options are images: `តើសញ្ញាមួយណាមានន័យថា "ហាមចូល"?`

## Language rules (all categories)
- Obey **banned-words-cheatsheet.md**: no banned words, no emoji, no `&` (write `និង`), no `*`, no stiff/legal tone.
- Everyday natural Khmer that students actually speak — **not** word-for-word from English.
- **Never carry English grammar that means nothing in Khmer** (e.g. articles "the / a / an"). Write natural Khmer; drop empty function words.
- Keep every question & answer **as short as possible** — one idea per sentence.
- Khmer & English authored **independently**; same meaning, each natural in its own language.

## Scoring — do NOT bake scores into the Q&A (all 7 categories)
- **Never store score or points on a question or answer record.**
- Scoring is computed **at play time, per answer taken**: **base 1 point** per correct answer **+ under 3 bonus** per question from speed, streak, etc.
- Same scoring model across **all 7 categories**.

## Output
**JSON** (import-ready) **+ Markdown** (human review), per the record shape in [`README.md`](README.md) / `sample-v2.json`.
