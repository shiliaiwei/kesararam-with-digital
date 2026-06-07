# 🚀 Quick Start - File Auto-Organizer

## One-Command Setup

```bash
chmod +x .fileorganizer/install.sh && ./.fileorganizer/install.sh
```

## Three Simple Commands

### 1️⃣ Organize Files Now
```bash
./.fileorganizer/organize.sh
```

### 2️⃣ Auto-Organize on Every Commit
```bash
./.fileorganizer/install-git-hook.sh
```

### 3️⃣ Check What Was Organized
```bash
cat .fileorganizer/organize.log
```

## What It Does

| File Type | Goes To |
|-----------|---------|
| `*.md` | `docs/auto-organized/markdown/` |
| `*.sh`, `*.py` | `docs/scripts/` |
| `*.txt`, `*.json` | `data-content/raw-data/` |
| `*backup*` | `docs/archive/auto-backups/` |
| `*.docx`, `*.pdf` | `docs/business-plans/` |
| `*.log`, `*.tmp` | `docs/archive/temp/` |

## What It Never Touches

✅ Config files (package.json, tsconfig.json, etc.)  
✅ Source code (src/, public/)  
✅ Dependencies (node_modules/)  
✅ Important docs (README.md, SECURITY.md)

## Cheat Sheet

```bash
# Run organizer
./.fileorganizer/organize.sh

# See log
cat .fileorganizer/organize.log

# See rules
cat .fileorganizer/rules.json

# Full guide
cat .fileorganizer/AUTOMATION_GUIDE.md

# Usage docs
cat .fileorganizer/README.md
```

## That's It! 🎉

Your project stays clean automatically. No manual organization needed.

---

**Need help?** Read `.fileorganizer/AUTOMATION_GUIDE.md`
