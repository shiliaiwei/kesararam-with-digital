# 📚 KWD Documentation Structure

This folder contains all project documentation, organized for easy navigation and maintenance.

## 📁 Folder Structure

```
docs/
├── business-plans/          Business documents and strategic planning
├── technical-docs/          Technical documentation and system design
│   ├── learning-system/     Learning feature documentation
│   └── ui-updates/          UI changes and visual updates
├── scripts/                 Utility scripts and tools
├── brand-assets/            Brand guidelines and design mockups
└── archive/                 Historical data and backups
    ├── backups/             Content and database backups
    └── db-exports/          Database export files
```

## 📝 Document Categories

### 🏢 Business Plans (`business-plans/`)
Contains all business-related documentation:
- **BUSINESS_PLAN_README.md** - Business plan overview
- **KWD_Business_Plan.docx** - Main business plan document
- **KWD_Business_Plan_5Y_Professional.docx** - 5-year professional plan
- **KWD_Business_Plan_5Y_Investor_Ready.txt** - Investor-ready plan (text format)
- **KWD_System_Report.docx** - Comprehensive system report

### 🔧 Technical Documentation (`technical-docs/`)
Core technical documentation for developers:
- **SYSTEM_ARCHITECTURE.md** - Overall system architecture
- **SUBSCRIPTION_SYSTEM.md** - Subscription and payment system
- **PLAY_SYSTEM.md** - Game and quiz play system
- **QUESTION_MANAGEMENT_SYSTEM.md** - Question database management
- **RANDOM_QUIZ_ALGORITHM.md** - Quiz generation algorithm
- **SECURITY_FIXES.md** - Security improvements and fixes
- **QUICK_REFERENCE.md** - Quick developer reference
- Plus various implementation summaries and task documentation

#### Learning System (`technical-docs/learning-system/`)
Documentation specific to the learning platform features:
- Deployment guides
- Feature summaries
- Road traffic enhancements
- Sign export features
- Security implementations

#### UI Updates (`technical-docs/ui-updates/`)
Visual changes and design updates:
- Color scheme updates
- UI implementation guides
- Visual change documentation

### 🛠️ Scripts (`scripts/`)
Utility scripts and tools:
- **Python scripts** - Content management and updates
- **TypeScript scripts** - Database testing and validation
- **create_business_plan_docx.py** - Business document generator

### 🎨 Brand Assets (`brand-assets/`)
Brand guidelines and design mockups:
- Logo variations
- Color schemes
- Design mockups
- Brand guidelines

### 📦 Archive (`archive/`)
Historical data and backups (not actively used):
- **backups/** - Old database and content backups
- **db-exports/** - Database export files

## 🔐 Security Notes

- The `archive/` folder is excluded from version control
- Sensitive data should never be committed
- Business plans contain proprietary information
- Review `.gitignore` before committing any documentation

## 📌 Quick Navigation

**For Developers:**
- Start with `technical-docs/SYSTEM_ARCHITECTURE.md`
- Review `technical-docs/QUICK_REFERENCE.md`
- Check specific feature docs in `technical-docs/`

**For Business:**
- See `business-plans/BUSINESS_PLAN_README.md`
- Review system capabilities in `business-plans/KWD_System_Report.docx`

**For Design:**
- Browse `brand-assets/` for brand guidelines
- Check `technical-docs/ui-updates/` for recent visual changes

## 🔄 Maintenance

This structure was reorganized on June 7, 2026 to:
- Separate business and technical documentation
- Archive old backups and exports
- Consolidate utility scripts
- Improve navigation and discoverability

**Reorganization Scripts:**
- `../reorganize.sh` - Initial reorganization
- `../reorganize_phase2.sh` - Docs folder cleanup

---

Last Updated: June 7, 2026
