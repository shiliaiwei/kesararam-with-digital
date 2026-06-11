# data-content

Offline **source material** for the quiz/learning content. These files are used
to author and seed the question bank — the live app reads questions from the
database, **not** from this folder. Reorganized by file type:

```
data-content/
├── csv/                       Source CSV per category (1_Road_Traffic.csv … 8_General.csv)
├── questions/                 Main question text per category (.txt)
├── backups/                   Human-readable backup exports (*_Backup.txt)
├── image-prompts/             AI image-generation prompts per category
├── prompts-clean/             Cleaned prompt variants (with emotion)
├── prompts-clean-no-emotion/  Cleaned prompt variants (no emotion)
├── scripts/                   Helper scripts (e.g. fetch_all_categories_db.py)
└── misc/                      audit-report.json, prt.txt, supportemotion.txt
```

## Categories
1. Road Traffic · 2. Road Sign · 3. Priority · 4. Driving ·
5. Technical · 6. Emergency · 7. Loading · 8. General

> Note: `docs/scripts/generate_backup.py` reads from `csv/` and writes to
> `backups/`. Update its paths if this layout changes.
