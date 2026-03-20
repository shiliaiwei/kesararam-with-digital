# Traffic Signs System - Implementation Guide

## Quick Start

### 1. Database Setup

Run the migration to create the traffic signs tables:

```bash
node scripts/create-traffic-signs-table.mjs
```

This creates:
- `traffic_signs` table with approval workflow
- `traffic_sign_approvals` table for audit trail
- Necessary indexes for performance

### 2. Seed Sample Data (Optional)

Populate with sample traffic signs:

```bash
node scripts/seed-traffic-signs.mjs
```

This adds 8 sample traffic signs (auto-approved for testing).

### 3. Test the System

#### Public Access (No Login)
1. Navigate to `/road-sign`
2. View the 12-column grid of approved signs
3. Click any sign to see the detail popup
4. Test audio playback (if audio URLs are provided)

#### Admin Access
1. Login as admin
2. Navigate to `/admin/content/road-sign`
3. Create a new traffic sign
4. Review pending signs
5. Approve or reject submissions

#### Staff Access
1. Login as staff
2. Navigate to `/staff/content/create` (if route exists)
3. Create new traffic sign content
4. View submission status

---

## API Testing

### Public Endpoints

Get all approved signs:
```bash
curl http://localhost:3000/api/traffic-signs
```

Get single sign:
```bash
curl http://localhost:3000/api/traffic-signs/1
```

### Admin Endpoints (Requires Auth)

Get all signs (any status):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/traffic-signs
```

Get pending signs only:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/traffic-signs?status=pending
```

Create new sign:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titleEn": "Yield Sign",
    "titleKm": "សញ្ញាផ្តល់ផ្លូវ",
    "descriptionEn": "Drivers must slow down and yield to other traffic.",
    "descriptionKm": "អ្នកបើកបរត្រូវបន្ថយល្បឿន និងផ្តល់ផ្លូវដល់ចរាចរផ្សេងទៀត។",
    "imageUrl": "https://example.com/yield.png",
    "signType": "regulatory",
    "category": "priority"
  }' \
  http://localhost:3000/api/admin/traffic-signs
```

Approve sign:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comments": "Looks good!"}' \
  http://localhost:3000/api/admin/traffic-signs/1/approve
```

Reject sign:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Image quality too low", "comments": "Please upload higher resolution"}' \
  http://localhost:3000/api/admin/traffic-signs/1/reject
```

---

## Component Usage

### Public Display Component

```tsx
import { TrafficSignsGrid } from "@/components/traffic-signs/traffic-signs-grid";

export default function RoadSignPage() {
  return (
    <div>
      <h1>Traffic Signs</h1>
      <TrafficSignsGrid />
    </div>
  );
}
```

The component:
- Fetches approved signs automatically
- Displays in responsive 12-column grid
- Opens modal on click with full details
- Supports bilingual audio playback

### Admin Management Component

```tsx
import { TrafficSignsContent } from "@/app/(dashboard)/admin/content/road-sign/traffic-signs-content";

export default function AdminTrafficSignsPage() {
  return <TrafficSignsContent />;
}
```

Features:
- View all signs with status badges
- Filter by status (pending/approved/rejected)
- Search by title
- Approve/reject actions
- Edit/delete capabilities
- Create new signs

---

## Database Schema Reference

### traffic_signs Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| title_en | TEXT | English title |
| title_km | TEXT | Khmer title |
| description_en | TEXT | English description |
| description_km | TEXT | Khmer description |
| image_url | TEXT | Cloudinary image URL |
| audio_url_en | TEXT | English audio URL (optional) |
| audio_url_km | TEXT | Khmer audio URL (optional) |
| sign_type | TEXT | regulatory \| warning \| informational \| guide |
| category | TEXT | speed \| parking \| direction \| etc (optional) |
| status | TEXT | pending \| approved \| rejected \| inactive |
| created_by | INTEGER | User ID of creator |
| approved_by | INTEGER | User ID of approver |
| approved_at | TIMESTAMP | Approval timestamp |
| rejection_reason | TEXT | Reason if rejected |
| is_active | BOOLEAN | Published to frontend |
| sort_order | INTEGER | Display order |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### traffic_sign_approvals Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| sign_id | INTEGER | Reference to traffic_signs |
| admin_id | INTEGER | Admin who performed action |
| action | TEXT | approved \| rejected |
| comments | TEXT | Admin comments |
| created_at | TIMESTAMP | Action timestamp |

---

## Workflow Examples

### Staff Creates Content

1. Staff logs in
2. Navigates to content creation form
3. Fills in:
   - English title & description
   - Khmer title & description
   - Uploads image to Cloudinary
   - Optionally uploads audio files
   - Selects sign type (regulatory/warning/etc)
   - Adds category (optional)
4. Submits → Status: **pending**
5. Waits for admin review

### Admin Reviews Content

1. Admin logs in
2. Navigates to `/admin/content/road-sign`
3. Filters by status: **pending**
4. Reviews submission:
   - Checks image quality
   - Verifies translations
   - Tests audio (if provided)
5. Decision:
   - **Approve** → Sign becomes active on frontend
   - **Reject** → Staff can edit and resubmit

### Public User Views Content

1. Visits `/road-sign` (no login required)
2. Sees 12-column grid of approved signs
3. Clicks a sign
4. Modal opens with:
   - Large image
   - Bilingual titles
   - Bilingual descriptions
   - Audio playback buttons (EN/KM)
   - Sign type and category badges
5. Closes modal or clicks another sign

---

## Integration with Game Modes

### Flashcards Mode

Query approved signs:
```typescript
const signs = await db
  .select()
  .from(trafficSigns)
  .where(
    and(
      eq(trafficSigns.status, "approved"),
      eq(trafficSigns.isActive, true)
    )
  );

// Create flashcards
const flashcards = signs.map(sign => ({
  front: sign.imageUrl,
  back: {
    titleEn: sign.titleEn,
    titleKm: sign.titleKm,
    descriptionEn: sign.descriptionEn,
    descriptionKm: sign.descriptionKm,
  },
  audioEn: sign.audioUrlEn,
  audioKm: sign.audioUrlKm,
}));
```

### Quiz Mode

Generate quiz questions:
```typescript
const signs = await getRandomApprovedSigns(10);

const questions = signs.map(sign => ({
  question: `What does this sign mean?`,
  image: sign.imageUrl,
  correctAnswer: sign.titleEn,
  options: generateOptions(sign, allSigns), // Mix with other signs
  points: 10,
  timeLimit: 30,
}));
```

### Practice Test (Public)

Same as Quiz Mode but:
- No authentication required
- Results not saved to database
- Unlimited attempts
- Instant feedback

### Challenge Mode (Teacher)

Teacher creates session:
```typescript
const session = await db.insert(sessions).values({
  teacherId: teacher.id,
  categoryId: roadSignCategoryId,
  challengeType: "traffic-signs",
  maxStudents: 40,
  status: "waiting",
});

// Select specific signs for challenge
const selectedSigns = await db
  .select()
  .from(trafficSigns)
  .where(
    and(
      eq(trafficSigns.status, "approved"),
      eq(trafficSigns.isActive, true),
      eq(trafficSigns.signType, "regulatory") // Teacher filters
    )
  )
  .limit(20);
```

---

## Troubleshooting

### Signs not appearing on frontend

Check:
1. Sign status is "approved"
2. Sign is_active is true
3. Database connection is working
4. API endpoint returns data: `GET /api/traffic-signs`

### Cannot approve signs

Check:
1. User role is "admin"
2. Authentication token is valid
3. Sign exists and is in "pending" status
4. Database foreign keys are correct

### Images not loading

Check:
1. Cloudinary URLs are valid
2. Images are publicly accessible
3. CORS settings allow your domain
4. Image URLs use HTTPS

### Audio not playing

Check:
1. Audio URLs are valid
2. Audio files are in supported format (MP3, WAV)
3. Browser supports HTML5 audio
4. Files are publicly accessible

---

## Performance Optimization

### Database Indexes

Already created:
- `idx_traffic_signs_status` - Fast filtering by status
- `idx_traffic_signs_created_by` - Fast user queries
- `idx_traffic_signs_sign_type` - Fast type filtering

### Caching Strategy

Consider implementing:
```typescript
// Cache approved signs for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
let cachedSigns = null;
let cacheTime = 0;

export async function getApprovedSigns() {
  const now = Date.now();
  if (cachedSigns && now - cacheTime < CACHE_TTL) {
    return cachedSigns;
  }
  
  cachedSigns = await db.select()...;
  cacheTime = now;
  return cachedSigns;
}
```

### Image Optimization

Use Cloudinary transformations:
```typescript
const optimizedUrl = `${sign.imageUrl}?w=400&h=400&f_auto&q_auto`;
```

---

## Next Steps

1. ✅ Database tables created
2. ✅ API routes implemented
3. ✅ Frontend components built
4. ✅ Admin dashboard ready
5. ⏳ Add audio upload functionality
6. ⏳ Integrate with quiz engine
7. ⏳ Create teacher customization tools
8. ⏳ Build analytics dashboard
9. ⏳ Add bulk operations for admins
10. ⏳ Implement content versioning

---

## Support

For issues or questions:
1. Check the SYSTEM_ARCHITECTURE.md
2. Review ROLE_PERMISSIONS.md
3. Test API endpoints with curl
4. Check browser console for errors
5. Review database logs
