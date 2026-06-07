# 🤖 Automated File Organizer

This system automatically organizes files in the KWD project to maintain a clean structure.

## 📋 How It Works

The file organizer automatically moves files to appropriate folders based on:
- **File type** (extension)
- **File patterns** (naming conventions)
- **Protected files** (critical config files are never moved)

## 🗂️ Organization Rules

### Markdown Files (*.md)
**Destination:** `docs/auto-organized/markdown/`
- All `.md` files except: README.md, SECURITY.md, PROJECT_STRUCTURE.md
- Keeps root clean while preserving important docs

### Scripts (*.sh, *.py)
**Destination:** `docs/scripts/`
- Shell scripts (*.sh)
- Python scripts (*.py)
- Consolidates all utility scripts

### Data Files (*.txt, *.json, *.csv)
**Destination:** `data-content/raw-data/`
- Text files
- JSON data files (except package.json, tsconfig.json, etc.)
- CSV files
- Excludes critical config files

### Backup Files
**Destination:** `docs/archive/auto-backups/`
- Files with "backup" in name
- Files matching *_backup*, backup_*, *backup*
- All backup-related files

### Business Documents (*.docx, *.pdf, *.xlsx)
**Destination:** `docs/business-plans/`
- Word documents
- PDF files
- Excel spreadsheets

### Temporary Files (*.tmp, *.log, *.cache)
**Destination:** `docs/archive/temp/`
- Temporary files
- Log files (except organize.log)
- Cache files

## 🔒 Protected Files (Never Moved)

### Config Files
- package.json, package-lock.json, pnpm-lock.yaml
- tsconfig.json, tsconfig.tsbuildinfo
- next.config.ts, next-env.d.ts
- drizzle.config.ts
- eslint.config.mjs
- postcss.config.mjs
- vitest.config.ts
- components.json
- vercel.json
- .env.local
- .gitignore
- .npmrc
- CNAME

### Important Documentation
- README.md
- SECURITY.md
- PROJECT_STRUCTURE.md

### Directories (Never Scanned/Modified)
- node_modules/
- .git/
- .github/
- .vscode/
- .idea/
- .claude/
- src/
- public/
- scripts/

## 🚀 Usage

### Manual Run
```bash
# Make script executable (first time only)
chmod +x .fileorganizer/organize.sh

# Run organization
./.fileorganizer/organize.sh
```

### Automated Run (Git Hook)
The organizer can run automatically before commits:
```bash
# Install pre-commit hook
cp .fileorganizer/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Check What Will Be Organized (Dry Run)
```bash
# See what files would be moved without actually moving them
./.fileorganizer/organize.sh --dry-run
```

## 📊 Output Locations

After organization, files will be in:

```
docs/
├── auto-organized/
│   └── markdown/           ← Markdown documentation
├── scripts/                ← All scripts (.sh, .py)
├── business-plans/         ← Business documents (.docx, .pdf)
└── archive/
    ├── auto-backups/       ← Backup files
    └── temp/               ← Temporary files

data-content/
└── raw-data/               ← Data files (.txt, .json, .csv)
```

## 📝 Logs

Organization activity is logged to:
- `.fileorganizer/organize.log`

Check this file to see what was moved and when.

## ⚙️ Configuration

Edit `.fileorganizer/rules.json` to:
- Add new file types
- Change destination folders
- Add protected files
- Modify patterns

## 🔄 Workflow Integration

### Option 1: Manual (Recommended for testing)
Run the script whenever you want to clean up:
```bash
./.fileorganizer/organize.sh
```

### Option 2: Git Hook (Auto on commit)
Automatically organize before each commit:
```bash
cp .fileorganizer/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Option 3: Cron Job (Scheduled)
Run daily at midnight:
```bash
crontab -e
# Add: 0 0 * * * cd /path/to/project && ./.fileorganizer/organize.sh
```

## 🛡️ Safety Features

1. **Protected files** - Never moves critical config files
2. **Protected directories** - Never modifies src/, node_modules/, etc.
3. **Logging** - All actions are logged
4. **Reversible** - Files are moved, not deleted
5. **No overwrites** - Won't overwrite existing files

## 🧪 Testing

Test the organizer safely:
```bash
# 1. Create test files
touch test.md test.sh test.txt test_backup.json

# 2. Run organizer
./.fileorganizer/organize.sh

# 3. Check results
ls docs/auto-organized/markdown/
ls docs/scripts/
ls data-content/raw-data/
ls docs/archive/auto-backups/

# 4. Check log
cat .fileorganizer/organize.log
```

## ❓ Troubleshooting

### Files not moving?
- Check if file is in protected list
- Check if directory is in protected list
- Review organize.log for errors

### Wrong destination?
- Edit rules.json to change destinations
- Re-run organizer

### Want to undo?
- Check organize.log for what was moved
- Manually move files back
- Or restore from git: `git checkout <file>`

## 📞 Support

- Check logs: `.fileorganizer/organize.log`
- Review rules: `.fileorganizer/rules.json`
- See project structure: `/PROJECT_STRUCTURE.md`

---

**Auto-organization keeps your project clean!** 🧹✨
