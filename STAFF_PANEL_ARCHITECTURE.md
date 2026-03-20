# Staff Panel - Complete Content Management System

## System Overview

A comprehensive staff dashboard for managing all educational content across categories with admin approval workflow, media management, and game mode integration.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAFF PANEL WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

Staff Creates Content
        ↓
   [PENDING] ← Staff can edit/delete own content
        ↓
   Admin Reviews (Dashboard Metrics)
        ↓
    ┌───────┴───────┐
    ↓               ↓
[APPROVED]      [REJECTED]
    ↓               ↓
Published       Staff notified
to Frontend     Can revise & resubmit
    ↓
Linked to Game Modes:
- Flashcards
- Quiz
- Practice Test
- Challenge
```

---

## Database Schema Enhancements

### 1. Enhanced contentItems Table
```sql
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS
  video_url TEXT,
  logo_url TEXT,
  brand_url TEXT,
  resource_type TEXT, -- 'qa' | 'flashcard' | 'quiz' | 'challenge' | 'mixed'
  tags TEXT[], -- Array of tags for better categorization
  metadata JSONB; -- Flexible metadata storage
```

### 2. Media Resources Table (New)
```sql
CREATE TABLE media_resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'image' | 'audio' | 'video' | 'logo' | 'brand'
  url TEXT NOT NULL,
  source TEXT NOT NULL, -- 'cloudinary' | 'external'
  cloudinary_id TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- for audio/video
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_resources_type ON media_resources(type);
CREATE INDEX idx_media_resources_created_by ON media_resources(created_by);
```

### 3. Content-Media Relationship Table (New)
```sql
CREATE TABLE content_media (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
  media_id INTEGER REFERENCES media_resources(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL, -- 'primary' | 'thumbnail' | 'reference' | 'explanation'
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, media_id, usage_type)
);
```

### 4. Game Mode Links Table (New)
```sql
CREATE TABLE game_mode_content (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL, -- 'flashcard' | 'quiz' | 'practice' | 'challenge'
  is_active BOOLEAN DEFAULT true,
  difficulty_override TEXT, -- Override content difficulty for specific mode
  points_override INTEGER, -- Override points for specific mode
  time_limit_override INTEGER, -- Override time limit
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, game_mode)
);
```

### 5. Staff Activity Metrics Table (New)
```sql
CREATE TABLE staff_activity_metrics (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),
  action_type TEXT NOT NULL, -- 'create' | 'update' | 'delete' | 'submit'
  content_id INTEGER REFERENCES content_items(id),
  category_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_activity_staff_id ON staff_activity_metrics(staff_id);
CREATE INDEX idx_staff_activity_created_at ON staff_activity_metrics(created_at);
```

### 6. Admin Review Metrics Table (New)
```sql
CREATE TABLE admin_review_metrics (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id),
  content_id INTEGER REFERENCES content_items(id),
  action TEXT NOT NULL, -- 'approved' | 'rejected' | 'requested_changes'
  review_time INTEGER, -- Time taken to review in seconds
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Staff Panel Features

### 1. Dashboard Overview
- Total content created
- Pending approvals
- Approved content
- Rejected content (with reasons)
- Recent activity
- Quick actions

### 2. Content Management by Category
- **Traffic Signs**: Image-based with descriptions
- **Road Traffic**: Q&A with law references
- **Priority**: Scenario-based with diagrams
- **Driving**: Practical demonstrations
- **Technical**: Vehicle knowledge
- **Loading**: Safety regulations
- **General Knowledge**: Mixed content
- **Emergency**: Procedures and contacts

### 3. Media Library
- Upload to Cloudinary
- External URL input
- Media browser
- Organize by type (image/audio/video/logo/brand)
- Reusable across content
- Preview and metadata

### 4. Game Mode Configuration
- Link content to specific game modes
- Override difficulty per mode
- Set custom points/time limits
- Enable/disable per mode

### 5. Bulk Operations
- Import content from CSV/JSON
- Bulk status updates
- Batch media uploads
- Mass category assignment

---

## Component Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── staff/
│           ├── page.tsx (Dashboard Overview)
│           ├── content/
│           │   ├── page.tsx (Content List)
│           │   ├── create/
│           │   │   └── page.tsx (Create Content)
│           │   ├── [id]/
│           │   │   ├── edit/
│           │   │   │   └── page.tsx (Edit Content)
│           │   │   └── preview/
│           │   │       └── page.tsx (Preview)
│           │   └── [category]/
│           │       └── page.tsx (Category-specific)
│           ├── media/
│           │   ├── page.tsx (Media Library)
│           │   └── upload/
│           │       └── page.tsx (Upload Media)
│           ├── game-modes/
│           │   └── page.tsx (Game Mode Config)
│           └── analytics/
│               └── page.tsx (Staff Analytics)
│
├── components/
│   └── staff/
│       ├── dashboard/
│       │   ├── stats-overview.tsx
│       │   ├── recent-activity.tsx
│       │   └── pending-reviews.tsx
│       ├── content/
│       │   ├── content-list.tsx
│       │   ├── content-form.tsx
│       │   ├── content-preview.tsx
│       │   └── category-selector.tsx
│       ├── media/
│       │   ├── media-library.tsx
│       │   ├── media-uploader.tsx
│       │   ├── media-browser.tsx
│       │   └── media-selector.tsx
│       └── game-modes/
│           ├── mode-configurator.tsx
│           └── mode-preview.tsx
│
└── app/api/
    └── staff/
        ├── content/
        │   ├── route.ts (GET, POST)
        │   ├── [id]/
        │   │   └── route.ts (GET, PUT, DELETE)
        │   └── bulk/
        │       └── route.ts (Bulk operations)
        ├── media/
        │   ├── route.ts (GET, POST)
        │   ├── [id]/
        │   │   └── route.ts (GET, PUT, DELETE)
        │   └── upload/
        │       └── route.ts (Upload handler)
        ├── game-modes/
        │   └── route.ts (Link content to modes)
        └── analytics/
            └── route.ts (Staff metrics)
```

---

## Admin Panel Enhancements

### Admin Dashboard Metrics
- Total pending reviews
- Average review time
- Approval/rejection rates
- Content quality scores
- Staff performance metrics
- Category distribution
- Game mode usage statistics

### Admin Review Interface
- Queue of pending content
- Side-by-side comparison
- Quick approve/reject
- Request changes with comments
- Batch approval
- Priority flagging

---

## Security & Permissions

### Staff Permissions
- ✅ Create content (all categories)
- ✅ Edit own pending/rejected content
- ✅ Delete own pending content
- ✅ Upload media to library
- ✅ Link content to game modes
- ✅ View own analytics
- ❌ Approve content
- ❌ Edit approved content
- ❌ Delete others' content
- ❌ View admin metrics

### Admin Permissions
- ✅ All staff permissions
- ✅ Approve/reject any content
- ✅ Edit any content
- ✅ Delete any content
- ✅ View all analytics
- ✅ Manage staff accounts
- ✅ Configure system settings

---

## API Endpoints

### Staff Content API
```
GET    /api/staff/content              - List own content
POST   /api/staff/content              - Create content
GET    /api/staff/content/[id]         - Get single content
PUT    /api/staff/content/[id]         - Update own content
DELETE /api/staff/content/[id]         - Delete own pending content
POST   /api/staff/content/bulk         - Bulk operations
```

### Staff Media API
```
GET    /api/staff/media                - List media library
POST   /api/staff/media                - Add media reference
POST   /api/staff/media/upload         - Upload to Cloudinary
GET    /api/staff/media/[id]           - Get media details
DELETE /api/staff/media/[id]           - Remove media
```

### Staff Game Modes API
```
GET    /api/staff/game-modes           - List game mode configs
POST   /api/staff/game-modes           - Link content to mode
PUT    /api/staff/game-modes/[id]      - Update mode config
DELETE /api/staff/game-modes/[id]      - Unlink from mode
```

### Staff Analytics API
```
GET    /api/staff/analytics            - Own performance metrics
GET    /api/staff/analytics/activity   - Activity log
```

### Admin Metrics API
```
GET    /api/admin/metrics/overview     - System-wide metrics
GET    /api/admin/metrics/staff        - Staff performance
GET    /api/admin/metrics/content      - Content statistics
GET    /api/admin/metrics/game-modes   - Game mode usage
```

---

## Implementation Priority

### Phase 1: Core Staff Panel (Week 1)
1. ✅ Staff dashboard layout
2. ✅ Content list with filters
3. ✅ Create content form
4. ✅ Edit content form
5. ✅ Basic media uploader

### Phase 2: Media Management (Week 2)
1. Media library component
2. Cloudinary integration
3. External URL support
4. Media browser/selector
5. Reusable media system

### Phase 3: Game Mode Integration (Week 3)
1. Game mode configurator
2. Content-mode linking
3. Override settings
4. Preview functionality

### Phase 4: Analytics & Metrics (Week 4)
1. Staff analytics dashboard
2. Admin metrics overview
3. Activity tracking
4. Performance reports

### Phase 5: Advanced Features (Week 5)
1. Bulk operations
2. Import/export
3. Content templates
4. Collaboration tools

---

## Success Metrics

### Staff Efficiency
- Time to create content
- Approval rate
- Revision cycles
- Content quality score

### Admin Efficiency
- Average review time
- Approval throughput
- Rejection reasons
- Backlog size

### System Health
- Content creation rate
- Approval rate
- Active content ratio
- Game mode coverage

---

## Next Steps

1. Create database migration scripts
2. Build staff dashboard layout
3. Implement content CRUD operations
4. Add media management
5. Integrate game modes
6. Build admin metrics
7. Test complete workflow
8. Deploy and monitor
