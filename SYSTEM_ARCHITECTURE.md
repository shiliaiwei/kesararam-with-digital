# Road Signs System Architecture

## Overview
A comprehensive content management system for Cambodian road signs with role-based access control, approval workflows, and integration with multiple game modes.

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Staff → Create Content → Pending Status                        │
│  Admin → Review & Approve → Active Status                       │
│  Teacher → Customize Game Modes → Student Assignments           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA MANAGEMENT                             │
├─────────────────────────────────────────────────────────────────┤
│  Database: traffic_signs table                                  │
│  - Bilingual content (EN/KM)                                    │
│  - Image URLs (Cloudinary)                                      │
│  - Audio URLs (EN/KM)                                           │
│  - Status: pending | approved | rejected | inactive             │
│  - Approval workflow tracking                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      OUTPUT LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Public Frontend:                                               │
│  - 12-column grid display (approved content only)               │
│  - Click → Popup with details + bilingual audio                │
│  - Practice Test (no login, no tracking)                        │
│                                                                  │
│  Authenticated Users:                                           │
│  - Flashcards Mode                                              │
│  - Quiz Mode (with scoring)                                     │
│  - Challenge Mode (live competitions)                           │
│  - Progress tracking                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Role-Based Access Control

### Staff Role
- **Create** new traffic sign content
- **Edit** own pending/rejected content
- **View** all content statuses
- **Cannot** approve or publish content

### Admin Role
- **Review** all pending content
- **Approve** or **Reject** with comments
- **Publish** approved content to frontend
- **Deactivate** published content
- **Full CRUD** access to all content

### Teacher Role
- **View** all approved content
- **Create** custom quizzes/challenges
- **Select** specific signs for student assignments
- **Configure** difficulty levels
- **Track** student progress

### Student Role
- **View** approved content on public pages
- **Play** all game modes
- **Track** personal progress (when logged in)

### Public (No Login)
- **View** approved content
- **Practice Test** mode only (no data saved)

## Database Schema

### traffic_signs Table
```sql
CREATE TABLE traffic_signs (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_km TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_km TEXT NOT NULL,
  image_url TEXT NOT NULL,
  audio_url_en TEXT,
  audio_url_km TEXT,
  
  -- Classification
  sign_type TEXT NOT NULL, -- warning | regulatory | informational | guide
  category TEXT, -- speed | parking | direction | etc
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | inactive
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### traffic_sign_approvals Table (Audit Trail)
```sql
CREATE TABLE traffic_sign_approvals (
  id SERIAL PRIMARY KEY,
  sign_id INTEGER REFERENCES traffic_signs(id),
  admin_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL, -- approved | rejected
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Staff Endpoints
- `POST /api/traffic-signs/create` - Create new sign
- `PUT /api/traffic-signs/[id]` - Update own pending sign
- `GET /api/traffic-signs/my-content` - View own submissions

### Admin Endpoints
- `GET /api/admin/traffic-signs/pending` - List pending approvals
- `POST /api/admin/traffic-signs/[id]/approve` - Approve sign
- `POST /api/admin/traffic-signs/[id]/reject` - Reject sign
- `PUT /api/admin/traffic-signs/[id]` - Edit any sign
- `DELETE /api/admin/traffic-signs/[id]` - Delete sign

### Public Endpoints
- `GET /api/traffic-signs` - List approved & active signs
- `GET /api/traffic-signs/[id]` - Get single sign details

### Teacher Endpoints
- `GET /api/traffic-signs/approved` - List all approved signs
- `POST /api/teacher/quiz/create` - Create custom quiz with selected signs

## Frontend Components

### Public Display (`/road-sign`)
- 12-column responsive grid
- Sign cards with image + title
- Click → Modal popup with:
  - Full description (EN/KM)
  - Audio player (EN/KM)
  - Sign classification info

### Admin Dashboard (`/admin/content/road-sign`)
- Content management table
- Filter by status (pending/approved/rejected)
- Approve/Reject actions
- Edit/Delete capabilities

### Game Modes Integration

#### 1. Flashcards
- Front: Sign image
- Back: Name + description
- Audio support

#### 2. Quiz Mode
- Multiple choice questions
- "What does this sign mean?"
- Score tracking (logged in users)

#### 3. Practice Test
- No login required
- Random selection of signs
- No score saved
- Instant feedback

#### 4. Challenge Mode
- Teacher creates live session
- Students join with room code
- Real-time competition
- Leaderboard

## Implementation Priority

1. ✅ Database schema migration
2. ✅ Backend API routes (CRUD + approval)
3. ✅ Admin content management UI
4. ✅ Public display with grid + modal
5. ✅ Audio integration
6. ⏳ Game mode integration
7. ⏳ Teacher customization tools

## Security Considerations

- Role-based middleware on all API routes
- Content validation (XSS prevention)
- Image upload restrictions (Cloudinary)
- Audio file validation
- Rate limiting on public endpoints
- Audit logging for all admin actions
