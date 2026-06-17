# Authoring Prompt — Priority Q&A (real-data)
**Category 3 · `priority` · Right of Way / សិទ្ធិដំណើរ**

> Priority signs are intersection diagrams whose **true answer (the vehicle order) already lives in the DB** (`topics.description_*`). We do **NOT invent answers** — we use the real ones. Built by [`scripts/generate-priority-qa.mjs`](../../scripts/generate-priority-qa.mjs).

## Task
**One question per topic** for all **70 priority topics** → **70 questions**.
Source = live DB priority topics: question from `name_*`, **real answer from `description_*`**, image from `primary_image_url`.

## Question shape (every topic)
- **Show the diagram image** above the question (`primary_image_url`).
- **Question** = the topic's meaning question: `ផ្លាកសញ្ញានេះមានន័យដូចម្តេច?` / "What does this sign stand for?"
- **3 options** = the topic's **real answer** (correct) **+ 2 other real answers** from other topics (distractors, different text). Match the correct one to the image.
- `question_type: scenario`. Difficulty: **Sequential = easy · Simultaneous = medium · Left Turn = hard**.

## Answer rules
- **Exactly 3 options**, **one** correct (`isCorrect: true`).
- Options are the REAL `description` text — prefix `ចម្លើយគឺ` / `The answer is` stripped, English boilerplate tails removed. **Never generated.**
- 2 distractors are pulled deterministically from other topics and must differ in text from the correct answer.

## Language rules
- Obey [`banned-words-cheatsheet.md`](banned-words-cheatsheet.md): no banned words, no emoji, no `&`, no `*`, no `៖`.
- Source answers are used **as-is** (real data); a few rows have KM↔EN or digit inconsistencies — clean the source topic rows if needed.

## Scoring — do NOT bake scores into the Q&A (all 7 categories)
- **Never store score or points on a question or answer record.**
- Scoring is computed **at play time, per answer**: base 1 point + under 3 bonus (speed, streak). Same across all categories.

## Output & import
Generator writes `docs/qa-rewrite/categories/cat-03-priority.json` (+ `.md`). Import with `node scripts/import-priority-qa.mjs --replace` (priority is empty → clean first insert).
