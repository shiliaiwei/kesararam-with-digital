# Roles & Permissions (CRUD)

> Source of truth: `roleEnum` in [`src/db/schema/users.ts`](../src/db/schema/users.ts),
> the dashboard guard in [`src/app/(dashboard)/layout.tsx`](../src/app/(dashboard)/layout.tsx),
> and the per-route `session.role` checks across `src/app/api/**`.
> If those change, update this file.

## Roles

The system defines **4 stored roles** plus an implicit **guest**:

```ts
roleEnum = pgEnum("role", ["student", "teacher", "admin", "staff"]);
// default: "student"
```

Authentication is a JWT session resolved by `getSession()` on every API route.
The `(dashboard)/layout.tsx` guard redirects **students** out of the dashboard to
`/profile/student`; only `teacher`, `admin`, and `staff` reach `/dashboard`.

| Role | How you get it | Home area |
|------|----------------|-----------|
| **guest** | not logged in | public site |
| **student** | default on self-signup | `/profile/student`, `/play` |
| **teacher** | self-register (7-day trial) or apply → admin approves | `/teacher/*` |
| **staff** | granted by admin | `/staff/*` |
| **admin** | granted by admin | `/admin/*` (everything) |

Legend: ✅ allowed · 🔒 own records only · ▶️ play/limited · ❌ denied · – n/a

---

## 👤 Guest (unauthenticated)

| Resource | C | R | U | D |
|----------|:-:|:-:|:-:|:-:|
| Public pages (Home, Learn, Leaderboard) | – | ✅ | – | – |
| Solo / daily games | ▶️ capped 9/day, **not saved** | ✅ | – | – |
| Own account | ✅ self-register | – | – | – |

Guest plays are never recorded and cannot claim rewards.

## 🎓 Student

| Resource | C | R | U | D |
|----------|:-:|:-:|:-:|:-:|
| Own profile | – | 🔒 | 🔒 | – |
| Solo/daily games & scores | ▶️ own (tier limit: 67/day solo, more in a class) | 🔒 | – | – |
| Live session | ✅ **join** via code & answer | 🔒 | – | – |
| Reward claims | ✅ claim (live-game points only) | 🔒 | – | – |
| Class enrollment | ✅ join via invite | 🔒 | – | – |
| Leaderboard | – | ✅ | – | – |

Cannot create content, classes, or sessions. Blocked from `/dashboard`.

## 🧑‍🏫 Teacher

Scoped to **own** classes/sessions — the session API rejects non-owners
(`cls.teacherId !== user.id`).

| Resource | C | R | U | D |
|----------|:-:|:-:|:-:|:-:|
| Classes | ✅ | 🔒 | 🔒 | 🔒 |
| Live game sessions | ✅ host | 🔒 | 🔒 control (start/advance/reveal/end) | 🔒 end |
| Session analytics | – | 🔒 | – | – |
| Students in own classes | ✅ add/invite | 🔒 | 🔒 | 🔒 remove |
| Own subscription / plan | ✅ Stripe checkout | 🔒 | 🔒 | – |
| Curriculum / question bank | – | ✅ (to host) | – | – |

## 🛠️ Staff (content / curriculum team)

| Resource | C | R | U | D |
|----------|:-:|:-:|:-:|:-:|
| Topics | ✅ | ✅ | ✅ | ✅ |
| Content / lessons (submissions) | ✅ submit (pending review) | ✅ | ✅ | 🔒 |
| Learning resources | ✅ | ✅ | ✅ | ✅ |
| Media library | ✅ upload | ✅ | ✅ | ✅ |
| Classes | ✅ assist | ✅ | ✅ | ✅ |
| Users / subscriptions / billing | ❌ | ❌ | ❌ | ❌ |

Has a dashboard (`/staff/*`) but **no access to users, subscriptions, or the
admin question bank**. Submitted content is published only after admin review.

## 👑 Admin (superuser)

Full **CRUD on everything**. `role !== "admin"` guards ~98 endpoints. Admin-only:

| Resource | Operations |
|----------|------------|
| Users | create / read / update / delete, change roles |
| Question bank | full CRUD (`/api/admin/questions`) |
| Content review | approve/reject staff submissions (`pending-content`, `review`) |
| Road signs / markings / traffic signs | full CRUD |
| Subscriptions & billing | view/manage all teacher plans |
| Teacher applications | approve → grants teacher role |
| Game sessions (all), logs, debug | read/manage globally |

---

## Permission matrix (resource × role)

C=Create R=Read U=Update D=Delete · 🔒 = own records only

| Resource | Guest | Student | Teacher | Staff | Admin |
|----------|:-----:|:-------:|:-------:|:-----:|:-----:|
| Public pages / leaderboard | R | R | R | R | CRUD |
| Own profile | – | RU🔒 | RU🔒 | RU🔒 | CRUD (all) |
| Solo/daily play & scores | ▶️ (unsaved) | CR🔒 | CR🔒 | CR🔒 | CRUD |
| Reward claims | – | CR🔒 | CR🔒 | CR🔒 | CRUD |
| Classes | – | join | CRUD🔒 | CRUD | CRUD |
| Live game sessions | – | join | CRUD🔒 | – | CRUD |
| Topics / lessons / content | – | R | R | CRU(D🔒) submit→review | CRUD + approve |
| Learning resources / media | – | R | R | CRUD | CRUD |
| Question bank | – | – | R | – | CRUD |
| Road signs / markings | – | R | R | – | CRUD |
| Users | – | – | – | – | CRUD |
| Subscriptions / billing | – | – | R🔒 own + checkout | – | CRUD |
| Teacher applications | apply | – | – | – | approve/reject |
| Logs / debug / system | – | – | – | – | R |

---

## One-line summary

- **Guest** → play (throwaway).
- **Student** → play, earn, claim, join.
- **Teacher** → own classes + live games (self-scoped).
- **Staff** → curriculum / content / media (no people or money).
- **Admin** → everything.
