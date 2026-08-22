# Kesararam With Digital (KWD)

**The Way of Safety · វិថី សុវត្ថិភាព**

Kesararam With Digital (KWD) is an open-source, bilingual (Khmer and English) digital road safety education platform. Built with Next.js 15, React 19, and Neon Serverless PostgreSQL, KWD digitizes traffic law, road signs, and safe driving theory through interactive curriculum modules, GameKit activities, and real-time classroom challenges for students and educators in Cambodia.

---

## Overview

Road traffic accidents remain a critical public safety challenge in Cambodia. KWD addresses this by transforming standard road traffic curriculum into a modern, accessible digital learning experience.

The platform includes:
- **Comprehensive Bilingual Curriculum**: 8 official road safety categories covering 247 traffic signs and 5,925 validated questions in both Khmer and English.
- **Interactive GameKit**: Engaging mini-games (Sign Connect, Tick Sign, Word Bank, Traffic Commander) designed for primary and secondary school students.
- **Real-Time Multiplayer Challenges**: Classroom challenge lobbies enabling teachers to host live quizzes with instant score calculation and leaderboard ranking.
- **Role-Based Architecture**: Dedicated interfaces for Students, Teachers, Content Staff, and Platform Administrators.

---

## Open Educational Dataset

All curriculum data is openly available in machine-readable and human-readable formats under [`data/categories/`](data/categories):

| Category Folder | Category Name (English / Khmer) | Topics | Linked Questions | Formats |
| :--- | :--- | :---: | :---: | :---: |
| `01_road-sign/` | Traffic Signs / សញ្ញាចរាចរ | 247 | 2,966 | JSON, MD, TXT |
| `02_road-traffic/` | Road Traffic Law / ច្បាប់ចរាចរ | 192 | 1,728 | JSON, MD, TXT |
| `03_priority/` | Right of Way / សិទ្ធិដំណើរ | 70 | 70 | JSON, MD, TXT |
| `04_driving/` | Driving Skills / ជំនាញបើកបរ | 50 | 450 | JSON, MD, TXT |
| `05_technical/` | Vehicle Technology / បច្ចេកទេសយានយន្ត | 38 | 342 | JSON, MD, TXT |
| `06_loading-people-goods/` | Loading People & Goods / ការដឹកអ្នកដំណើរ | 14 | 126 | JSON, MD, TXT |
| `07_general-knowledge/` | General Knowledge / ចំណេះដឹងទូទៅ | 12 | 108 | JSON, MD, TXT |
| `08_emergency/` | Emergency / អាសន្ន | 15 | 135 | JSON, MD, TXT |
| **Total** | **8 Categories** | **638** | **5,925** | **Full Dataset** |

---

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19, Tailwind CSS, Lucide Icons
- **Database**: Neon Serverless PostgreSQL
- **ORM / Query Builder**: Drizzle ORM
- **Authentication**: Stateless Jose JWT cookies with role-based routing
- **Testing**: Vitest for unit and integration testing

---

## Background and Recognition

KWD was founded by a team of young Cambodian female students from Siem Reap as a **Technovation Girls 2026** project (Team #50777).

- **National Champion (1st Place · Junior Division)**: Technovation Girls Cambodia 2026 Finals at the American University of Phnom Penh (AUPP).
- **Global Semifinalist**: Selected by Technovation Worldwide HQ as one of only three teams representing Cambodia in the Global Semifinals.
- **United Nations SDG Alignment**: Aligned with **SDG 4 (Quality Education)** and **SDG 11 (Sustainable Cities and Communities)**.

---

## Contributing

Contributions to the codebase, design systems, and curriculum translations are welcome. Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).
