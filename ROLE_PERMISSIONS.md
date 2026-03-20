# Role-Based Permissions for Traffic Signs System

## Overview
This document defines the permissions and capabilities for each user role in the traffic signs content management system.

---

## 1. Public (No Login Required)

### Can Access:
- `/road-sign` - Public traffic signs page
- View all **approved** and **active** traffic signs
- Click signs to view detailed popup with:
  - Bilingual descriptions (EN/KM)
  - Audio playback (EN/KM)
  - Sign classification info
- Practice Test mode (no data saved)

### Cannot Access:
- Admin dashboard
- Content creation
- Score tracking
- User progress
- Authenticated game modes

### API Endpoints:
- `GET /api/traffic-signs` - List approved signs
- `GET /api/traffic-signs/[id]` - Get single sign details

---

## 2. Student Role

### Can Access:
Everything Public users can access, PLUS:
- Personal dashboard
- All game modes with progress tracking:
  - Flashcards
  - Quiz Mode (with scoring)
  - Challenge Mode (live competitions)
- View personal statistics
- Track learning progress
- Join teacher-created challenges

### Cannot Access:
- Content creation
- Admin dashboard
- Teacher tools
- Content approval

### API Endpoints:
- All public endpoints
- `POST /api/quiz/attempt` - Submit quiz attempts
- `GET /api/progress/my-progress` - View personal progress
- `POST /api/challenge/join` - Join live challenges

---

## 3. Teacher Role

### Can Access:
Everything Students can access, PLUS:
- View all **approved** traffic signs
- Create custom quizzes/challenges
- Select specific signs for assignments
- Configure difficulty levels
- Create live challenge sessions
- View student progress in their classes
- Manage class enrollments

### Cannot Access:
- Content creation (traffic signs)
- Content approval
- Admin-only features
- Edit/delete traffic signs

### API Endpoints:
- All student endpoints
- `GET /api/traffic-signs/approved` - List all approved signs
- `POST /api/teacher/quiz/create` - Create custom quiz
- `POST /api/teacher/challenge/create` - Create challenge session
- `GET /api/teacher/class/[id]/progress` - View class progress

### Dashboard Routes:
- `/teacher/quizzes` - Manage quizzes
- `/teacher/challenges` - Create/manage challenges
- `/teacher/classes` - View classes and students
- `/teacher/analytics` - Student performance analytics

---

## 4. Staff Role

### Can Access:
- Create new traffic sign content
- Edit **own** pending/rejected content
- View all content statuses
- Upload images to Cloudinary
- Upload audio files
- View submission history

### Cannot Access:
- Approve/reject content
- Edit approved content
- Delete any content
- Publish content to frontend
- View other staff members' drafts

### Workflow:
1. Create new traffic sign → Status: **pending**
2. Submit for admin review
3. If **rejected**: Can edit and resubmit
4. If **approved**: Cannot edit (admin only)

### API Endpoints:
- `POST /api/admin/traffic-signs` - Create new sign
- `PUT /api/admin/traffic-signs/[id]` - Update own pending/rejected signs
- `GET /api/admin/traffic-signs?createdBy=me` - View own submissions

### Dashboard Routes:
- `/staff/content/create` - Create new content
- `/staff/content/my-submissions` - View submission status

---

## 5. Admin Role

### Can Access:
**FULL ACCESS** to all features:
- Review all pending content
- Approve or reject with comments
- Edit any content (regardless of status)
- Delete any content
- Publish/unpublish content
- View audit logs
- Manage all users
- Override any restrictions

### Approval Workflow:
1. View pending submissions
2. Review content quality
3. **Approve** → Status: approved, isActive: true
4. **Reject** → Status: rejected, add reason
5. Audit trail created automatically

### API Endpoints:
- `GET /api/admin/traffic-signs` - List all signs (any status)
- `GET /api/admin/traffic-signs?status=pending` - Filter by status
- `POST /api/admin/traffic-signs` - Create sign
- `PUT /api/admin/traffic-signs/[id]` - Update any sign
- `DELETE /api/admin/traffic-signs/[id]` - Delete any sign
- `POST /api/admin/traffic-signs/[id]/approve` - Approve sign
- `POST /api/admin/traffic-signs/[id]/reject` - Reject sign
- `GET /api/admin/audit-logs` - View all actions

### Dashboard Routes:
- `/admin/content/road-sign` - Manage all traffic signs
- `/admin/content/pending` - Review pending approvals
- `/admin/logs` - View audit logs
- `/admin/users` - Manage users

---

## Content Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

Staff Creates Content
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
    ↓
[INACTIVE] ← Admin can deactivate
```

---

## Permission Matrix

| Feature | Public | Student | Teacher | Staff | Admin |
|---------|--------|---------|---------|-------|-------|
| View approved signs | ✅ | ✅ | ✅ | ✅ | ✅ |
| View sign details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Practice test | ✅ | ✅ | ✅ | ✅ | ✅ |
| Flashcards | ❌ | ✅ | ✅ | ✅ | ✅ |
| Quiz with scoring | ❌ | ✅ | ✅ | ✅ | ✅ |
| Join challenges | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create quizzes | ❌ | ❌ | ✅ | ❌ | ✅ |
| Create challenges | ❌ | ❌ | ✅ | ❌ | ✅ |
| View class progress | ❌ | ❌ | ✅ | ❌ | ✅ |
| Create content | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit own pending | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit any content | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve content | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reject content | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete content | ❌ | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Security Implementation

### Middleware Protection
All API routes use `verifyAuth()` middleware:

```typescript
const user = await verifyAuth(request);
if (!user || !["admin", "staff"].includes(user.role)) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Database-Level Security
- Foreign key constraints ensure data integrity
- Audit trail tracks all admin actions
- Soft deletes preserve history

### Frontend Protection
- Route guards check user role
- UI elements hidden based on permissions
- API calls validated on backend

---

## Game Mode Integration

### Flashcards
- Uses approved traffic signs
- Front: Sign image
- Back: Name + description
- Audio support for both languages

### Quiz Mode
- Multiple choice questions
- "What does this sign mean?"
- Score tracking (logged in users only)
- Time limits per question

### Practice Test (Public)
- No login required
- Random selection of approved signs
- No score saved to database
- Instant feedback
- Unlimited attempts

### Challenge Mode (Teacher-Created)
- Teacher creates live session
- Students join with room code
- Real-time competition
- Leaderboard with rankings
- Time-based scoring

---

## Best Practices

### For Staff:
1. Create high-quality content with accurate translations
2. Use clear, high-resolution images
3. Provide audio in both languages
4. Follow naming conventions
5. Submit for review promptly

### For Admins:
1. Review content within 24-48 hours
2. Provide clear rejection reasons
3. Maintain content quality standards
4. Monitor audit logs regularly
5. Communicate with staff about standards

### For Teachers:
1. Create diverse quizzes covering all sign types
2. Adjust difficulty based on student level
3. Use challenges to engage students
4. Monitor student progress regularly
5. Provide feedback to students

---

## Future Enhancements

- [ ] Bulk approval for admins
- [ ] Content versioning
- [ ] Collaborative editing
- [ ] Advanced analytics dashboard
- [ ] Automated content suggestions
- [ ] Multi-language support (beyond EN/KM)
