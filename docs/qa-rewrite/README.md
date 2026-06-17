# KWD Q&A Rewrite — Build Spec (locked v2)

> **Status (2026-06-17):** Category 1 `road-sign` is **LIVE** with the approved standard set — **2,223 questions / 7,904 answers** (247 topics × 9), built by `scripts/generate-road-sign-qa.mjs` and imported via `scripts/import-road-sign-qa.mjs --replace`.
> The other 7 categories are still **empty** — author next using the per-category prompts (e.g. [`prompt-priority.md`](prompt-priority.md)).

## Targets (approved)
- **≥ 5,715 questions**, covering **all 8 categories**.
- **9 questions per topic** × **638 topics** ≈ **5,742 questions**.
- Difficulty mix per topic: **easy ×4 / medium ×3 / hard ×2** (leans accessible for students).
- Output: **JSON** (import-ready) **+ Markdown** (human review).

## The 8 categories (live DB)
| id | slug | EN / KM | topics | images on Q? |
|----|------|---------|--------|--------------|
| 1 | `road-sign` | Traffic Signs / សញ្ញាចរាចរ | 247 | ✅ yes |
| 2 | `road-traffic` | Road Traffic Law / ច្បាប់ចរាចរ | 192 | no |
| 3 | `priority` | Right of Way / សិទ្ធិដំណើរ | 70 | ✅ yes |
| 4 | `driving` | Driving Skills / ជំនាញបើកបរ | 50 | no |
| 5 | `technical` | Vehicle Technology / បច្ចេកទេសយានយន្ត | 38 | no |
| 6 | `loading-people-goods` | Loading People & Goods / ការដឹកអ្នកដំណើរ | 14 | no |
| 7 | `general-knowledge` | General Knowledge / ចំណេះដឹងទូទៅ | 12 (+new) | no |
| 8 | `emergency` | Emergency / អាសន្ន | 15 | no |

## Image rule (approved)
- A question may carry an image **only** in categories `road-sign` (#1) and `priority` (#3).
- In those two categories **every** question links the topic's real image (`primary_image_url`).
- Image-selection questions use the correct topic image + 3 distractor images from other topics in the same category.
- All other categories: **no images on questions**, even if the topic row has one.

## Per-topic 9-question suite
| Slot | Difficulty | Type |
|------|-----------|------|
| 1 | easy | MCQ (4) — identify / meaning |
| 2 | easy | True / False — basic rule |
| 3 | easy | Image-selection (signs/priority) **or** MCQ |
| 4 | easy | MCQ (4) — basic fact |
| 5 | medium | MCQ (4) — correct action |
| 6 | medium | Scenario MCQ — apply it |
| 7 | medium | True / False — common misconception |
| 8 | hard | MCQ (4) — why / safety purpose |
| 9 | hard | MCQ (4) / scenario — law, penalty, or edge case |

## Khmer language standard (approved tweak: simpler)
- Everyday, natural Khmer that students and ordinary road users actually speak — **not** word-for-word from English.
- Avoid stiff/literary vocabulary unless a legal term is required (then keep it short and clear).
- Spelling fixed from old data: `ឱ្យ` not `អោយ`, `ដើម្បី` not `ដើម្បិ`, `សិទ្ធិ` not `សិទ្ឋិ`, `សម្រាប់` not `សំរាប់`, `សម្គាល់` not `សំគាល់`.
- English and Khmer authored **independently**; same meaning, each natural in its own language.

### ⛔ Banned words, symbols & tone — NEVER use (locked rule)
Applies to **every** field: `question_km`, `hint_km`, `answer_km` (and `*_en` where noted).
These sound stiff, literary, legal, or bureaucratic — **not** how students and everyday road users speak. If a banned word shows up, rewrite the sentence.

**Words you flagged — never use:**
| Banned | Why it's wrong for kids | Use instead |
|--------|------------------------|-------------|
| `ត្រូវ ឬ មិនត្រឹមត្រូវ` | stiff True/False framing | `ត្រូវ ឬ ខុស` |
| `ដ៏` | literary/poetic linker | drop it · `ណាស់` · `ខ្លាំង` |
| `ជានិច្ច` | formal "perpetually" | `រាល់ពេល` · `គ្រប់ពេល` |
| `សេចក្តីថ្លែងការណ៍មួយណា` | bureaucratic "which statement…" | ask the thing directly · `ឃ្លាណាមួយ` |
| `ថ្លែងការណ៍` | official press-release word | `ប្រយោគ` · rephrase |
| `ប៉ប៉ោរ` | odd / bombastic | say it plainly |

**More Khmer words I recommend banning (formal → everyday):**
| Banned | Why | Use instead |
|--------|-----|-------------|
| `នូវ` | formal object marker, spoken Khmer drops it | (delete) |
| `នៃ` | literary "of" | `របស់` · restructure |
| `ឡើយ` | formal negative ender | `ទេ` |
| `ពុំ` | formal "not" | `មិន` · `អត់` |
| `ត្រូវបាន` | passive / translationese | active voice |
| `ទាំងឡាយ` | formal plural | `ទាំងអស់` |
| `នានា` | "various", bookish | `ផ្សេងៗ` · drop |
| `ជាអាទិ៍` | formal "etc." | `ជាដើម` |
| `ប្រការ` | "clause / matter" | `រឿង` · restructure |
| `អនុលោម(តាម)` | "comply with" | `ធ្វើតាម` · `គោរព` |
| `បទប្បញ្ញត្តិ` | legal "provisions" | `ច្បាប់` · `វិន័យ` |
| `នីតិវិធី` | "procedure" | `ជំហាន` · `របៀប` |
| `ប្រតិបត្តិ` | formal "observe (rules)" | `ធ្វើតាម` |
| `ដ៏សែន` | literary "extremely" | `ខ្លាំង` |

**Symbols & tone — never use:**
- **No emoji** anywhere (matches the brand rule — real icons only, never emoji).
- **No `&`** → write `និង` (Khmer) / `and` (English).
- **No `*`**, asterisks, bullets, or decorative symbols inside question/answer text.
- **No academic / legal / "professional" tone.** One idea per sentence, short enough for a 12-year-old to read aloud. **Keep every question & answer as short as possible.** Ask the question directly instead of "Which of the following statements…".

## General Knowledge plan (approved: "keep both")
- Rewrite the existing HIV/health topics cleanly in natural Khmer + English (kept as-is content-wise).
- **Add** new real road-safety / general traffic-knowledge topics so the category is genuinely useful.

## JSON record shape (see `sample-v2.json`)
Each record maps cleanly to the DB:
- → `questions`: `topicCode`/`topicId`, `categoryId`, `difficulty`, `questionType`, `questionEn`, `questionKm`, `imageUrl` (signs/priority only)
- → `answers[]`: `answerEn`, `answerKm`, `isCorrect`, `imageUrl`, `answerType`
- `explanationEn` / `explanationKm`: stored at insert time in the question's hint fields (or a new `explanation` column — confirm during cutover).

## Build & review process
1. ✅ v1 sample (voice) — reviewed.
2. ✅ v2 sample (final JSON format + tweaks) — `sample-v2.json` (this folder). **← you are here**
3. ⏳ On approval: author all 638 topics **category by category**, delivering each category as JSON + MD for incremental review.
4. ⏳ Final full-set review.
5. ⏳ Cutover (separate, explicit step): drop old `questions`/`answers`, insert the new set. **Not started.**

> Faster option: if you want the full set generated in parallel instead of category-by-category,
> say "use a workflow" and I'll fan it out across many subagents (higher token cost).
