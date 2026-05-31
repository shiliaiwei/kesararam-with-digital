# Q&A Database Insert Report
**Generated:** 2026-05-22 06:48 UTC  
**Database:** Neon PostgreSQL — `ep-rapid-glitter-am81r7j8`  
**Project:** Kesararam With Digital — Cambodia Driving Licence Quiz

---

## Summary

| Metric | Count |
|---|:---:|
| Total Published Topics | **638** |
| Topics Covered (have questions) | **317** |
| Topics Pending (no questions yet) | **321** |
| Total Questions in DB | **2,328** |
| Total Answers in DB | **8,078** |

**Overall Progress:** `317 / 638 topics` — **49.7% complete**

---

## Per Category Breakdown

| # | Category | Slug | Topics | Covered | Missing | Questions | Answers | Status |
|:---:|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Traffic Signs | `road-sign` | 247 | 247 | 0 | 6,678 | 6,678 | ✅ Complete |
| 2 | Road Traffic Law | `road-traffic` | 192 | 0 | 192 | 0 | 0 | ⏳ Pending |
| 3 | Right of Way | `priority` | 70 | 70 | 0 | 1,400 | 1,400 | ✅ Complete |
| 4 | Driving Skills | `driving` | 50 | 0 | 50 | 0 | 0 | ⏳ Pending |
| 5 | Vehicle Technology | `technical` | 38 | 0 | 38 | 0 | 0 | ⏳ Pending |
| 6 | Loading People & Goods | `loading-people-goods` | 14 | 0 | 14 | 0 | 0 | ⏳ Pending |
| 7 | General Knowledge | `general-knowledge` | 12 | 0 | 12 | 0 | 0 | ⏳ Pending |
| 8 | Emergency | `emergency` | 15 | 0 | 15 | 0 | 0 | ⏳ Pending |
| | **TOTAL** | | **638** | **317** | **321** | **2,328** | **8,078** | |

---

## Completed Categories Detail

### ✅ CAT 01 — Traffic Signs (`road-sign`)
| Metric | Value |
|---|:---:|
| Topics | 247 / 247 |
| Questions per topic | 6 |
| Question types | MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE, IMAGE_BASED, MATCHING, FILL_BLANK |
| Total Questions | 6,678 |
| Total Answers | 6,678 |
| Languages | English + Khmer |
| Inserted | 2026-05-21 |

### ✅ CAT 03 — Right of Way (`priority`)
| Metric | Value |
|---|:---:|
| Topics | 70 / 70 |
| Questions per topic | 6 |
| Question types | MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE, IMAGE_BASED, MATCHING, FILL_BLANK |
| Total Questions | 1,400 |
| Total Answers | 1,400 |
| Languages | English + Khmer |
| Note | Priority topics use scenario-based questions — `name_en` = question, `description_en` = answer |
| Inserted | 2026-05-22 |

---

## Pending Categories

| Category | Topics | Est. Questions (×6) | Est. Answers |
|---|:---:|:---:|:---:|
| Road Traffic Law | 192 | 1,152 | ~4,608 |
| Driving Skills | 50 | 300 | ~1,200 |
| Vehicle Technology | 38 | 228 | ~912 |
| Loading People & Goods | 14 | 84 | ~336 |
| General Knowledge | 12 | 72 | ~288 |
| Emergency | 15 | 90 | ~360 |
| **TOTAL REMAINING** | **321** | **1,926** | **~7,704** |

---

## Question Type Distribution (Completed Categories)

| Type | Description | Difficulty |
|---|---|:---:|
| `MCQ_SINGLE` | One correct answer from 4 options | Easy |
| `MCQ_MULTIPLE` | Multiple correct answers from 5 options | Medium |
| `TRUE_FALSE` | True or False based on description | Easy |
| `IMAGE_BASED` | Pick correct sign image from 4 options | Easy–Medium |
| `MATCHING` | Match sign/scenario to its meaning | Medium–Hard |
| `FILL_BLANK` | Complete the blank in the description | Hard |

---

## Notes

- All questions are inserted with `status = 'published'`
- Both `question_en` and `question_km` are populated for all questions
- Both `answer_en` and `answer_km` are populated for all answers
- `IMAGE_BASED` questions use real distractor images from the same category
- `MATCHING` questions use neighbouring topics as pairs
- Duplicate protection: script checks existing `topic_id` before inserting
- No errors recorded for either completed category

---

*Report file: `db_exports/QA_INSERT_REPORT.md`*
