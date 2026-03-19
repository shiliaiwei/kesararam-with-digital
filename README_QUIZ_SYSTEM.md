# Learning Hub Quiz System

A comprehensive bilingual (Khmer/English) quiz and content management system for Cambodian driving education.

## 🎯 Features

### Content Management
- **8 Content Categories**: Road Signs, Road Traffic Law, Priority, Driving Skills, Vehicle Technology, Loading People & Goods, General Knowledge, Emergency
- **Bilingual Support**: All content in Khmer and English with audio playback
- **Media Upload**: Images and audio files via Cloudinary integration
- **Approval Workflow**: Staff create content, admins approve before publication
- **Audit Trail**: Complete history of content creation and approval actions

### Quiz Engine
- **Fair Algorithm**: Intelligent question selection with:
  - Balanced subtopic distribution
  - Recency exclusion (avoids last 50 answered questions)
  - Weak topic prioritization (40% allocation to topics with <60% accuracy)
  - Difficulty adaptation based on user performance
- **4 Learning Modes**: Flashcards, Quiz, Practice Test, Challenge
- **Real-time Scoring**: Immediate feedback with time bonuses for challenge mode
- **Progress Tracking**: Completion tracking per content item and category

### User Roles
- **Student**: Browse content, take quizzes, view progress
- **Staff**: Create and edit content (pending approval)
- **Admin**: Approve content, manage users, full system access

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Cloudinary account (for media uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kesararamwithdigital
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Visit http://localhost:3000

## 📚 API Documentation

### Content Management

#### Get Categories
```http
GET /api/categories
```

#### Browse Content by Category
```http
GET /api/content/[categorySlug]?status=active&difficulty=beginner&search=term&page=1&limit=20
```

#### Get Content Item
```http
GET /api/content/item/[id]
```

#### Create Content (Staff/Admin)
```http
POST /api/content/create
Content-Type: application/json

{
  "categoryId": 1,
  "type": "question",
  "titleEn": "Stop Sign",
  "titleKm": "សញ្ញាឈប់",
  "questionEn": "What does this sign mean?",
  "questionKm": "សញ្ញានេះមានន័យថាអ្វី?",
  "answerEn": "Stop completely",
  "answerKm": "ឈប់ទាំងស្រុង",
  "scorePoints": 10,
  "timeLimit": 30,
  "difficulty": "beginner"
}
```

#### Upload Media (Staff/Admin)
```http
POST /api/content/upload
Content-Type: multipart/form-data

file: [image or audio file]
folder: learning-hub
```

### Approval Workflow (Admin Only)

#### Get Pending Content
```http
GET /api/admin/pending-content?categoryId=1&page=1&limit=20
```

#### Approve Content
```http
POST /api/admin/approve/[contentId]
Content-Type: application/json

{
  "comments": "Approved - looks good"
}
```

#### Reject Content
```http
POST /api/admin/reject/[contentId]
Content-Type: application/json

{
  "comments": "Needs more detail in description"
}
```

#### Toggle Content Active Status
```http
PUT /api/admin/toggle-active/[contentId]
Content-Type: application/json

{
  "isActive": false
}
```

### Quiz Engine

#### Start Quiz
```http
POST /api/quiz/start
Content-Type: application/json

{
  "categoryId": 1,
  "mode": "quiz",
  "difficulty": "beginner",
  "questionCount": 10
}
```

#### Submit Answer
```http
POST /api/quiz/answer
Content-Type: application/json

{
  "attemptId": 123,
  "contentId": 456,
  "answer": "Stop completely",
  "timeSpent": 15
}
```

#### Complete Quiz
```http
POST /api/quiz/complete
Content-Type: application/json

{
  "attemptId": 123
}
```

#### Get Quiz History
```http
GET /api/quiz/history?userId=1&categoryId=1&limit=10
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage
- **67 tests passing**
- **Property-based testing** with fast-check (100 iterations per test)
- Tests cover:
  - Content management and approval workflow
  - Fair Algorithm question selection
  - Quiz engine scoring and completion
  - Role-based access control
  - File upload validation

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: Cloudinary
- **Authentication**: JWT with session-based auth
- **Testing**: Vitest + fast-check (property-based testing)

### Database Schema

Key tables:
- `users` - User accounts with roles
- `categories` - 8 content categories
- `content_items` - Educational content with bilingual fields
- `content_approvals` - Approval workflow audit trail
- `quiz_attempts` - Quiz session records
- `quiz_answers` - Individual question answers
- `user_progress` - Content completion tracking
- `leaderboard_entries` - Rankings by period and category
- `challenge_sessions` - Competitive quiz sessions
- `audit_logs` - System-wide audit trail

## 📊 Implementation Status

### ✅ Completed (Tasks 1-7)
- Database schema with all tables
- Content management APIs (8 endpoints)
- Approval workflow APIs (4 endpoints)
- Fair Algorithm for question selection
- Quiz engine APIs (4 endpoints)
- 67 property-based tests passing
- Cloudinary integration for media uploads

### 🚧 In Progress (Tasks 8-20)
- Progress tracking APIs
- Challenge system APIs
- Ranking system APIs
- User preference APIs
- Frontend React components
- Integration testing

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for:
- Environment variable configuration
- Security best practices
- Role-based access control
- API security measures
- Reporting security issues

## 📝 License

[Your License Here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, contact: [your-email@example.com]
