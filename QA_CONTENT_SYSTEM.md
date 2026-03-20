# Q&A Content Management System

## Overview
Comprehensive Q&A content management system for all educational categories with role-based access control, approval workflows, and Cloudinary media integration.

## Supported Categories

### 1. Road Traffic
- Legal framework governing road use
- Law articles and case studies
- Structured Q&A format
- Question numbering (Q1, Q2, etc.)

### 2. Priority
- Road priority rules
- Interactive scenarios
- Intersection diagrams
- Image-based problem solving

### 3. Driving
- Practical driving techniques
- Maneuvers and demonstrations
- Case studies
- Numbered questions

### 4. Technical
- Vehicle mechanics
- Safety features
- Routine maintenance
- Educational Q&A

### 5. Loading People & Goods
- Safe loading practices
- Legal weight limits
- National transport regulations
- Compliance guidelines

### 6. General Knowledge
- Broad driving topics
- Road safety information
- Reference documents
- Useful links and resources

### 7. Emergency
- Emergency procedures
- Contact numbers
- Road incident protocols
- Urgent situation handling

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

Staff Creates Q&A Content
        ↓
   [PENDING] ← Staff can edit
        ↓
   Admin Reviews
        ↓
    ┌───────┴───────┐
    ↓               ↓
[APPROVED]      [REJECTED]
isActive=true   isActive=false
    ↓               ↓
Published       Staff can edit
on Frontend     and resubmit
```

---

## Database Schema

### contentItems Table (Existing)
Already supports Q&A content with:
- `questionEn` / `questionKm` - Bilingual questions
- `answerEn` / `answerKm` - Bilingual answers
- `imageUrl` - Optional scenario/diagram images
- `audioUrlEn` / `audioUrlKm` - Audio support
- `difficulty` - easy | medium | hard
- `subtopic` - Category subdivision
- `scorePoints` - Points for correct answer
- `timeLimit` - Time limit in seconds
- `status` - pending | approved | rejected
- `isActive` - Published to frontend

---

## Components Created

### 1. QAContentGrid (Public Display)
**Location:** `src/components/content/qa-content-grid.tsx`

**Features:**
- Responsive 2-column grid layout
- Question numbering (Q1, Q2, Q3...)
- Difficulty badges
- Image previews
- Click to open detailed modal
- Bilingual content display
- Audio playback support

**Usage:**
```tsx
import { QAContentGrid } from "@/components/content/qa-content-grid";

<QAContentGrid 
  categorySlug="road-traffic" 
  initialContent={content}
/>
```

### 2. QAContentManagement (Admin Dashboard)
**Location:** `src/components/admin/qa-content-management.tsx`

**Features:**
- View all content with status badges
- Filter by status (pending/approved/rejected)
- Filter by difficulty (easy/medium/hard)
- Search questions and answers
- Approve/reject workflow
- Edit/delete capabilities
- Creator information display

**Usage:**
```tsx
import { QAContentManagement } from "@/components/admin/qa-content-management";

<QAContentManagement
  categorySlug="road-traffic"
  categoryId={1}
  categoryTitle="Road Traffic"
/>
```

### 3. QAContentForm (Create/Edit)
**Location:** `src/components/admin/qa-content-form.tsx`

**Features:**
- Bilingual tabs (English/Khmer)
- Cloudinary image browser integration
- Audio URL input with test playback
- Difficulty selection
- Subtopic categorization
- Score points configuration
- Time limit settings
- Form validation

---

## API Endpoints

### Admin Endpoints

#### GET /api/admin/content
Get all content with filters
```bash
GET /api/admin/content?categorySlug=road-traffic&status=pending
```

**Response:**
```json
{
  "content": [
    {
      "content": {
        "id": 1,
        "questionEn": "What is the speed limit in urban areas?",
        "questionKm": "តើល្បឿនកំណត់ក្នុងតំបន់ទីក្រុងគឺប៉ុន្មាន?",
        "answerEn": "The speed limit is 40 km/h...",
        "answerKm": "ល្បឿនកំណត់គឺ ៤០ គីឡូម៉ែត្រក្នុងមួយម៉ោង...",
        "imageUrl": "https://...",
        "difficulty": "medium",
        "status": "pending"
      },
      "creator": {
        "id": 5,
        "username": "staff1",
        "displayName": "John Doe"
      }
    }
  ]
}
```

#### POST /api/admin/content
Create new Q&A content
```bash
POST /api/admin/content
Content-Type: application/json

{
  "categoryId": 1,
  "questionEn": "What does a red traffic light mean?",
  "questionKm": "ភ្លើងចរាចរពណ៌ក្រហមមានន័យថាម៉េច?",
  "answerEn": "A red light means stop completely...",
  "answerKm": "ភ្លើងក្រហមមានន័យថាឈប់ពេញលេញ...",
  "imageUrl": "https://cloudinary.com/...",
  "audioUrlEn": "https://audio.com/en.mp3",
  "audioUrlKm": "https://audio.com/km.mp3",
  "difficulty": "easy",
  "subtopic": "Traffic Signals",
  "scorePoints": 10,
  "timeLimit": 30
}
```

#### PUT /api/admin/content/[id]
Update existing content

#### DELETE /api/admin/content/[id]
Delete content (admin only)

#### POST /api/admin/content/[id]/approve
Approve pending content

#### POST /api/admin/content/[id]/reject
Reject content with reason

---

## Implementation Guide

### Step 1: Update Category Pages

For each category, update the public page to use QAContentGrid:

**Example: Road Traffic**
```tsx
// src/app/(public)/road-traffic/page.tsx
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { QAContentGrid } from "@/components/content/qa-content-grid";

export default function RoadTrafficPage() {
  return (
    <CategoryPageShell
      slug="road-traffic"
      titleEn="Road Traffic"
      titleKh="ចរាចរណ៍ផ្លូវ"
      descEn="Study the legal framework governing road use..."
    >
      <QAContentGrid categorySlug="road-traffic" />
    </CategoryPageShell>
  );
}
```

### Step 2: Create Admin Management Pages

For each category, create an admin management page:

**Example: Road Traffic Admin**
```tsx
// src/app/(dashboard)/admin/content/road-traffic/page.tsx
import { QAContentManagement } from "@/components/admin/qa-content-management";

export default function RoadTrafficAdminPage() {
  return (
    <QAContentManagement
      categorySlug="road-traffic"
      categoryId={2} // Get from database
      categoryTitle="Road Traffic"
    />
  );
}
```

### Step 3: Get Category IDs

Query the database to get category IDs:
```sql
SELECT id, slug, title_en FROM categories;
```

Map slugs to IDs:
- road-sign: 1
- road-traffic: 2
- priority: 3
- driving: 4
- technical: 5
- loading-people-goods: 6
- general-knowledge: 7
- emergency: 8

---

## Cloudinary Integration

### Image Selection
The form includes a Cloudinary media browser that allows:
- Browse existing images
- Select from organized folders
- Preview before selection
- Direct URL insertion

### Audio Files
Two options for audio:
1. **URL Input**: Paste direct URL to audio file
2. **Cloudinary**: Upload to Cloudinary and use URL

**Recommended Audio Format:**
- MP3 format
- Bitrate: 128kbps
- Sample rate: 44.1kHz
- Mono or stereo

---

## Role-Based Permissions

### Public Users
- View approved Q&A content
- Click to see detailed answers
- Play audio (if available)
- Practice test mode (no login)

### Students
- All public features
- Progress tracking
- Quiz mode with scoring
- Challenge participation

### Teachers
- View all approved content
- Create custom quizzes
- Select specific questions
- Configure difficulty levels

### Staff
- Create new Q&A content
- Edit own pending/rejected content
- Cannot approve own content
- View submission status

### Admin
- Full access to all content
- Approve/reject submissions
- Edit any content
- Delete content
- View audit trail

---

## Content Quality Guidelines

### Questions
- Clear and concise
- Unambiguous wording
- Appropriate difficulty level
- Relevant to category

### Answers
- Accurate and complete
- Well-structured
- Include explanations
- Reference laws/regulations when applicable

### Images
- High resolution (min 800x600)
- Clear and relevant
- Properly labeled
- Compressed for web

### Audio
- Clear pronunciation
- Natural pace
- No background noise
- Consistent volume

---

## Game Mode Integration

### Flashcards
- Front: Question + Image
- Back: Answer
- Audio support

### Quiz Mode
- Multiple choice format
- Time limits
- Score tracking
- Difficulty-based selection

### Practice Test
- No login required
- Random question selection
- Instant feedback
- No data saved

### Challenge Mode
- Teacher-created sessions
- Live competition
- Real-time leaderboard
- Category-specific

---

## Testing Checklist

### Public Display
- [ ] Questions display in grid
- [ ] Numbering is correct (Q1, Q2...)
- [ ] Modal opens on click
- [ ] Images load properly
- [ ] Audio plays correctly
- [ ] Bilingual content displays

### Admin Dashboard
- [ ] Can create new content
- [ ] Can edit pending content
- [ ] Can approve content
- [ ] Can reject with reason
- [ ] Filters work correctly
- [ ] Search functions properly

### Workflow
- [ ] Staff can create content
- [ ] Content starts as pending
- [ ] Admin can approve
- [ ] Approved content appears on frontend
- [ ] Rejected content can be edited
- [ ] Audit trail is created

---

## Next Steps

1. ✅ Create Q&A components
2. ✅ Build admin management UI
3. ✅ Implement API routes
4. ⏳ Update all category pages
5. ⏳ Create admin pages for each category
6. ⏳ Test approval workflow
7. ⏳ Add bulk operations
8. ⏳ Implement analytics

---

## Support

For issues or questions:
1. Check existing content in database
2. Verify category IDs are correct
3. Test API endpoints with curl
4. Check browser console for errors
5. Review audit logs for admin actions
