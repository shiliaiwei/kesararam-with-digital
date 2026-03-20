# Traffic Signs System - Complete Flow Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER ROLES & ACCESS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  PUBLIC  │  │ STUDENT  │  │ TEACHER  │  │  STAFF   │  │  ADMIN   │    │
│  │ No Login │  │ Learner  │  │ Educator │  │ Creator  │  │ Approver │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │             │            │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼────────────┘
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PUBLIC PAGES                    AUTHENTICATED PAGES                         │
│  ┌────────────────┐             ┌──────────────────────────────┐           │
│  │ /road-sign     │             │ /dashboard                    │           │
│  │ - 12-col grid  │             │ - Personal stats              │           │
│  │ - Click popup  │             │ - Progress tracking           │           │
│  │ - Audio play   │             │                               │           │
│  │ - Practice test│             │ /teacher/*                    │           │
│  └────────────────┘             │ - Create quizzes              │           │
│                                 │ - Manage challenges           │           │
│  COMPONENTS                     │ - View class progress         │           │
│  ┌────────────────┐             │                               │           │
│  │TrafficSignsGrid│             │ /staff/*                      │           │
│  │ - Fetch signs  │             │ - Create content              │           │
│  │ - Display grid │             │ - View submissions            │           │
│  │ - Modal popup  │             │                               │           │
│  └────────────────┘             │ /admin/content/road-sign      │           │
│                                 │ - Manage all signs            │           │
│                                 │ - Approve/reject              │           │
│                                 │ - Edit/delete                 │           │
│                                 └──────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PUBLIC ENDPOINTS                 AUTHENTICATED ENDPOINTS                    │
│  ┌──────────────────────┐        ┌────────────────────────────────┐        │
│  │ GET /api/            │        │ POST /api/admin/               │        │
│  │   traffic-signs      │        │   traffic-signs                │        │
│  │ - List approved      │        │ - Create new sign              │        │
│  │                      │        │                                │        │
│  │ GET /api/            │        │ PUT /api/admin/                │        │
│  │   traffic-signs/[id] │        │   traffic-signs/[id]           │        │
│  │ - Get single sign    │        │ - Update sign                  │        │
│  └──────────────────────┘        │                                │        │
│                                  │ DELETE /api/admin/             │        │
│  MIDDLEWARE                      │   traffic-signs/[id]           │        │
│  ┌──────────────────────┐        │ - Delete sign                  │        │
│  │ verifyAuth()         │        │                                │        │
│  │ - Check JWT token    │        │ POST /api/admin/               │        │
│  │ - Validate role      │        │   traffic-signs/[id]/approve   │        │
│  │ - Return user        │        │ - Approve sign                 │        │
│  └──────────────────────┘        │                                │        │
│                                  │ POST /api/admin/               │        │
│                                  │   traffic-signs/[id]/reject    │        │
│                                  │ - Reject sign                  │        │
│                                  └────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TABLES                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │ traffic_signs                                                 │          │
│  │ ┌──────────────────────────────────────────────────────────┐ │          │
│  │ │ id, title_en, title_km, description_en, description_km   │ │          │
│  │ │ image_url, audio_url_en, audio_url_km                    │ │          │
│  │ │ sign_type, category, status, is_active                   │ │          │
│  │ │ created_by, approved_by, approved_at, rejection_reason   │ │          │
│  │ │ sort_order, created_at, updated_at                       │ │          │
│  │ └──────────────────────────────────────────────────────────┘ │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │ traffic_sign_approvals (Audit Trail)                         │          │
│  │ ┌──────────────────────────────────────────────────────────┐ │          │
│  │ │ id, sign_id, admin_id, action, comments, created_at      │ │          │
│  │ └──────────────────────────────────────────────────────────┘ │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
│  INDEXES                                                                     │
│  - idx_traffic_signs_status (Fast filtering)                                │
│  - idx_traffic_signs_created_by (User queries)                              │
│  - idx_traffic_signs_sign_type (Type filtering)                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Content Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONTENT CREATION & APPROVAL FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

STAFF CREATES CONTENT
┌─────────────────────┐
│ 1. Staff Login      │
│ 2. Navigate to Form │
│ 3. Fill Details:    │
│    - Titles (EN/KM) │
│    - Descriptions   │
│    - Upload Image   │
│    - Upload Audio   │
│    - Select Type    │
│    - Add Category   │
│ 4. Submit           │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │   PENDING   │ ◄─────────────────┐
    │  Status     │                   │
    └──────┬──────┘                   │
           │                          │
           ▼                          │
ADMIN REVIEWS                         │
┌─────────────────────┐               │
│ 1. Admin Login      │               │
│ 2. View Pending     │               │
│ 3. Review Content:  │               │
│    - Check Quality  │               │
│    - Verify Trans.  │               │
│    - Test Audio     │               │
│ 4. Make Decision    │               │
└──────────┬──────────┘               │
           │                          │
     ┌─────┴─────┐                    │
     ▼           ▼                    │
┌─────────┐  ┌─────────┐             │
│APPROVED │  │REJECTED │             │
│         │  │         │             │
│Status:  │  │Status:  │             │
│approved │  │rejected │             │
│         │  │         │             │
│Active:  │  │Active:  │             │
│true     │  │false    │             │
│         │  │         │             │
│Visible  │  │Reason:  │             │
│on       │  │provided │             │
│Frontend │  │         │             │
└─────────┘  └────┬────┘             │
                  │                  │
                  ▼                  │
           ┌─────────────┐           │
           │ Staff Can   │           │
           │ Edit &      │───────────┘
           │ Resubmit    │
           └─────────────┘

AUDIT TRAIL
Every approval/rejection creates record in traffic_sign_approvals:
- Who (admin_id)
- What (action: approved/rejected)
- When (created_at)
- Why (comments)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC USER JOURNEY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

USER VISITS /road-sign
        │
        ▼
┌───────────────────┐
│ TrafficSignsGrid  │
│ Component Loads   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────────┐
│ useEffect() triggers          │
│ fetchSigns()                  │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ GET /api/traffic-signs        │
│                               │
│ Query:                        │
│ SELECT * FROM traffic_signs   │
│ WHERE status = 'approved'     │
│   AND is_active = true        │
│ ORDER BY sort_order           │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ Response: { signs: [...] }    │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ Render 12-Column Grid         │
│ - Map over signs              │
│ - Display images              │
│ - Add click handlers          │
└─────────┬─────────────────────┘
          │
          ▼
USER CLICKS SIGN
        │
        ▼
┌───────────────────────────────┐
│ setSelectedSign(sign)         │
│ Modal Opens                   │
│                               │
│ Display:                      │
│ - Large image                 │
│ - Bilingual titles            │
│ - Bilingual descriptions      │
│ - Audio buttons (EN/KM)       │
│ - Sign type badge             │
│ - Category badge              │
└───────────────────────────────┘
```

---

## Game Mode Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GAME MODES DATA FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │ APPROVED SIGNS   │
                        │ (Database)       │
                        └────────┬─────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ FLASHCARDS   │ │ QUIZ MODE    │ │ PRACTICE     │
        │              │ │              │ │ TEST         │
        │ Front: Image │ │ Question:    │ │              │
        │ Back: Info   │ │ "What does   │ │ No Login     │
        │ Audio: EN/KM │ │ this mean?"  │ │ No Tracking  │
        │              │ │              │ │ Instant      │
        │ Tracking:    │ │ Options:     │ │ Feedback     │
        │ - Progress   │ │ - 4 choices  │ │              │
        │ - Mastery    │ │              │ │ Random       │
        │              │ │ Tracking:    │ │ Selection    │
        │              │ │ - Score      │ │              │
        │              │ │ - Time       │ │              │
        │              │ │ - Accuracy   │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
                │                │                │
                └────────────────┼────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ CHALLENGE MODE   │
                        │ (Teacher-Led)    │
                        │                  │
                        │ 1. Teacher       │
                        │    Creates       │
                        │    Session       │
                        │                  │
                        │ 2. Selects       │
                        │    Signs         │
                        │                  │
                        │ 3. Students      │
                        │    Join          │
                        │                  │
                        │ 4. Live          │
                        │    Competition   │
                        │                  │
                        │ 5. Real-time     │
                        │    Leaderboard   │
                        └──────────────────┘
```

---

## Teacher Customization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TEACHER WORKFLOW                                          │
└─────────────────────────────────────────────────────────────────────────────┘

TEACHER LOGS IN
        │
        ▼
┌───────────────────────────────┐
│ View All Approved Signs       │
│ GET /api/traffic-signs/       │
│     approved                  │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ Filter & Select Signs         │
│ - By type (regulatory/warning)│
│ - By category (speed/parking) │
│ - By difficulty               │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ Create Custom Quiz            │
│ POST /api/teacher/quiz/create │
│                               │
│ Body:                         │
│ {                             │
│   title: "Speed Signs Quiz",  │
│   signIds: [1, 5, 8, 12],    │
│   difficulty: "medium",       │
│   timeLimit: 30,              │
│   classId: 5                  │
│ }                             │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ OR Create Challenge           │
│ POST /api/teacher/challenge/  │
│      create                   │
│                               │
│ Body:                         │
│ {                             │
│   roomCode: "ABC123",         │
│   signIds: [1, 2, 3, 4, 5],  │
│   maxStudents: 40,            │
│   duration: 600               │
│ }                             │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ Students Join & Play          │
│ - Real-time updates           │
│ - Live scoring                │
│ - Instant feedback            │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ View Results & Analytics      │
│ - Student performance         │
│ - Common mistakes             │
│ - Time analysis               │
│ - Improvement suggestions     │
└───────────────────────────────┘
```

---

## Security & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REQUEST AUTHORIZATION                                     │
└─────────────────────────────────────────────────────────────────────────────┘

CLIENT REQUEST
        │
        ▼
┌───────────────────────────────┐
│ Include JWT Token             │
│ Authorization: Bearer <token> │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ API Route Handler             │
│ - Extract token               │
│ - Call verifyAuth()           │
└─────────┬─────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│ verifyAuth() Middleware       │
│ 1. Decode JWT                 │
│ 2. Verify signature           │
│ 3. Check expiration           │
│ 4. Query user from DB         │
│ 5. Return user object         │
└─────────┬─────────────────────┘
          │
     ┌────┴────┐
     ▼         ▼
┌─────────┐ ┌─────────┐
│ VALID   │ │ INVALID │
│ TOKEN   │ │ TOKEN   │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────────────┐
│ Check   │ │ Return 401      │
│ Role    │ │ Unauthorized    │
└────┬────┘ └─────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Role-Based Access Control   │
│                             │
│ if (user.role === "admin")  │
│   → Full access             │
│                             │
│ if (user.role === "staff")  │
│   → Create/edit own         │
│                             │
│ if (user.role === "teacher")│
│   → View approved only      │
│                             │
│ if (user.role === "student")│
│   → View approved only      │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ Execute Request             │
│ - Query database            │
│ - Process data              │
│ - Return response           │
└─────────────────────────────┘
```

---

## Complete System Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    END-TO-END SYSTEM FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  STAFF   │────▶│  ADMIN   │────▶│ FRONTEND │────▶│ STUDENTS │
│ Creates  │     │ Approves │     │ Displays │     │  Learn   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                 │
     ▼                ▼                 ▼                 ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Content │     │ Review  │     │ Public  │     │ Game    │
│ Form    │     │ Queue   │     │ Grid    │     │ Modes   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │                │                 │                 │
     ▼                ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                  │
│  traffic_signs → traffic_sign_approvals → quiz_attempts     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   ANALYTICS      │
                    │ - Usage stats    │
                    │ - Performance    │
                    │ - Insights       │
                    └──────────────────┘
```

This comprehensive system provides a complete content management workflow with role-based access control, approval workflows, and seamless integration with educational game modes.
