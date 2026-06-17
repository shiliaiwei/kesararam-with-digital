# Authoring Prompt — Priority Q&A
**Category 3 · `priority` · Right of Way / សិទ្ធិដំណើរ**

> Use this prompt to generate the priority (right-of-way) Q&A set.
> **Before authoring, read [`banned-words-cheatsheet.md`](banned-words-cheatsheet.md) and follow it strictly.**

## Task
Generate **9 questions per topic** for **all 70 priority topics**, processed in `sort_order` (then `id`). Link every question to its topic. Total ≈ **630 questions**.

## Difficulty mix (per topic)
**easy ×4 · medium ×3 · hard ×2** — leans accessible for students.

## 9-slot suite (per topic)
| Slot | Difficulty | Type |
|------|-----------|------|
| 1 | easy | MCQ (4) — who has right of way / identify |
| 2 | easy | True / False — basic rule |
| 3 | easy | Image-selection (scenario) **or** MCQ |
| 4 | easy | MCQ (4) — basic fact |
| 5 | medium | MCQ (4) — correct action |
| 6 | medium | Scenario MCQ — apply it |
| 7 | medium | True / False — common misconception |
| 8 | hard | MCQ (4) — why / safety purpose |
| 9 | hard | MCQ (4) / scenario — law, penalty, or edge case |

**Fill-in-the-blank** is also allowed where it fits (still ≤ 4 options).

## Image rule (priority ONLY — every question must have an image)
- **Every question in this category carries an image.** No text-only questions.
- The correct visual is the **topic's own real image** (`primary_image_url` — the "owner" intersection/scenario).
- **Image-selection** questions: 4 image options = the **owner image + 3 random distractor images** from other topics in the same category.
- **Text-answer** questions: still **show the topic's own image** as the stimulus, 4 text options below.

## Answer rules
- **Max 4 options per question** (always ≤ 4): MCQ = 4, True/False = 2, fill-in-blank ≤ 4.
- Exactly **one** correct answer (`isCorrect: true`).

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
