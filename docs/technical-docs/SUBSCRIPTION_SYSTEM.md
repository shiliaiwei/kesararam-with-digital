# Subscription System Documentation

## Overview

The subscription system is an admin-managed, manual subscription platform with no payment gateway integration. This design prevents cheating and ensures controlled access to premium features.

## Architecture

### Database Schema

**Table: `subscriptions`**
- `id`: Primary key
- `userId`: Foreign key to users table
- `plan`: Enum (`free`, `teacher_pro`, `school`)
- `status`: Enum (`active`, `expired`, `cancelled`, `trial`)
- `isTrial`: Boolean flag for trial subscriptions
- `trialEndsAt`: Trial expiration timestamp
- `startsAt`: Subscription start date
- `endsAt`: Subscription end date (null = lifetime)
- `assignedBy`: Admin who created the subscription
- `note`: Optional admin note
- `createdAt`, `updatedAt`: Timestamps

### Plan Features

#### Free Plan
- **Max Students**: 0
- **Max Classes**: 0
- **Analytics**: ❌
- **Custom Content**: ❌

#### Teacher Pro Plan
- **Max Students**: 50
- **Max Classes**: 5
- **Analytics**: ✅
- **Custom Content**: ✅

#### School Plan
- **Max Students**: Unlimited
- **Max Classes**: Unlimited
- **Analytics**: ✅
- **Custom Content**: ✅

## API Endpoints

### GET `/api/subscriptions`
Get subscriptions (admin: all active, user: own history)

**Query Parameters:**
- `action=stats` (admin only): Get subscription statistics

**Response:**
```json
{
  "subscriptions": [...]
}
```

### GET `/api/subscriptions/[id]`
Get specific subscription details

**Access:** Admin or subscription owner

### PATCH `/api/subscriptions/[id]`
Update subscription (admin only)

**Body:**
```json
{
  "action": "updateStatus" | "cancel" | "extend",
  "status": "active" | "expired" | "cancelled" | "trial",
  "endDate": "2026-12-31T00:00:00Z"
}
```

### POST `/api/subscriptions/create`
Create new subscription (admin only)

**Body:**
```json
{
  "userId": 123,
  "plan": "teacher_pro",
  "status": "active",
  "isTrial": false,
  "startsAt": "2026-01-01T00:00:00Z",
  "endsAt": "2026-12-31T00:00:00Z",
  "note": "Promotional subscription"
}
```

### GET `/api/subscriptions/check`
Check current user's subscription status

**Response:**
```json
{
  "hasActiveSubscription": true,
  "subscription": {
    "plan": "teacher_pro",
    "planName": "Teacher Pro",
    "status": "active",
    "isTrial": false,
    "endsAt": "2026-12-31T00:00:00Z",
    "features": {
      "maxStudents": 50,
      "maxClasses": 5,
      "analytics": true,
      "customContent": true
    }
  }
}
```

## Server Actions

### `getCurrentSubscription()`
Get current user's subscription information

### `getUserQuotaInfo()`
Get user's quota and current usage

**Returns:**
```typescript
{
  quota: {
    plan: "teacher_pro",
    planName: "Teacher Pro",
    classes: {
      current: 3,
      max: 5,
      remaining: 2
    },
    students: {
      current: 25,
      max: 50,
      remaining: 25
    },
    features: {
      analytics: true,
      customContent: true
    }
  }
}
```

### `checkSubscriptionAccess(action)`
Check if user can perform an action

**Actions:**
- `"createClass"`: Check if user can create more classes
- `"addStudent"`: Check if user can add more students
- `"analytics"`: Check if user has analytics access
- `"customContent"`: Check if user can create custom content

**Returns:**
```typescript
{
  allowed: boolean,
  reason?: string
}
```

### `createUserSubscription(data)` (Admin only)
Create a new subscription

### `updateSubscription(id, action, data)` (Admin only)
Update subscription status, cancel, or extend

### `getSubscriptionHistory(userId?)` 
Get subscription history

### `getExpiringSubscriptionsList(daysAhead)` (Admin only)
Get subscriptions expiring within N days

### `processExpiredSubscriptions()` (Admin only)
Batch update expired subscriptions

## Database Queries

Located in `src/db/queries/subscriptions.ts`:

- `getUserActiveSubscription(userId)`: Get user's active subscription
- `getSubscriptionWithUser(subscriptionId)`: Get subscription with user details
- `getUserSubscriptionHistory(userId)`: Get all subscriptions for a user
- `createSubscription(data)`: Create new subscription
- `updateSubscriptionStatus(id, status)`: Update status
- `cancelSubscription(id)`: Cancel subscription
- `extendSubscription(id, newEndDate)`: Extend subscription
- `getExpiringSubscriptions(daysAhead)`: Get expiring subscriptions
- `getExpiredSubscriptions()`: Get expired subscriptions
- `markExpiredSubscriptions()`: Batch update expired subscriptions
- `hasActiveSubscription(userId)`: Check if user has active subscription
- `getUserPlanTier(userId)`: Get user's plan tier
- `canAccessFeature(userId, feature)`: Check feature access
- `getSubscriptionStats()`: Get subscription statistics
- `getAllActiveSubscriptions()`: Get all active subscriptions

## Utility Functions

Located in `src/lib/subscription-utils.ts`:

- `planHasFeature(plan, feature)`: Check if plan has feature
- `canCreateClass(userId, currentCount)`: Check class creation limit
- `canAddStudent(userId, currentCount)`: Check student addition limit
- `canAccessAnalytics(userId)`: Check analytics access
- `canAccessCustomContent(userId)`: Check custom content access
- `getUserQuota(userId, currentCounts)`: Get user's quota info
- `isSubscriptionExpiringSoon(userId)`: Check if expiring within 7 days
- `getSubscriptionDisplayInfo(userId)`: Get formatted subscription info
- `comparePlans(planA, planB)`: Compare plan priorities
- `canUpgradeTo(currentPlan, targetPlan)`: Check if upgrade is possible
- `getUpgradeSuggestions(currentPlan)`: Get available upgrades

## Middleware

Located in `src/middleware/subscription-guard.ts`:

### `requireSubscription(request, minPlan)`
Protect routes requiring specific subscription tier

**Example:**
```typescript
const error = await requireSubscription(request, "teacher_pro");
if (error) return error;
```

### `requireFeature(request, feature)`
Protect routes requiring specific feature

**Example:**
```typescript
const error = await requireFeature(request, "analytics");
if (error) return error;
```

## Usage Examples

### Check if user can create a class

```typescript
import { checkSubscriptionAccess } from "@/app/actions/subscriptions";

const result = await checkSubscriptionAccess("createClass");
if (!result.allowed) {
  alert(result.reason);
  return;
}

// Proceed with class creation
```

### Get user's quota

```typescript
import { getUserQuotaInfo } from "@/app/actions/subscriptions";

const { quota } = await getUserQuotaInfo();
console.log(`Classes: ${quota.classes.current}/${quota.classes.max}`);
console.log(`Students: ${quota.students.current}/${quota.students.max}`);
```

### Create subscription (admin)

```typescript
import { createUserSubscription } from "@/app/actions/subscriptions";

const result = await createUserSubscription({
  userId: 123,
  plan: "teacher_pro",
  status: "active",
  isTrial: true,
  trialEndsAt: new Date("2026-02-01"),
  endsAt: new Date("2026-12-31"),
  note: "1-month trial + annual subscription"
});
```

### Protect API route

```typescript
import { requireSubscription } from "@/middleware/subscription-guard";

export async function POST(request: NextRequest) {
  // Require Teacher Pro or higher
  const error = await requireSubscription(request, "teacher_pro");
  if (error) return error;

  // Protected logic here
}
```

### Check feature access in component

```typescript
"use client";

import { useEffect, useState } from "react";
import { getCurrentSubscription } from "@/app/actions/subscriptions";

export function AnalyticsButton() {
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    getCurrentSubscription().then(({ subscription }) => {
      setCanAccess(subscription?.features.analytics || false);
    });
  }, []);

  if (!canAccess) {
    return <button disabled>Upgrade to access analytics</button>;
  }

  return <button>View Analytics</button>;
}
```

## Admin Tasks

### Create Trial Subscription

```typescript
await createUserSubscription({
  userId: 123,
  plan: "teacher_pro",
  status: "trial",
  isTrial: true,
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  note: "1-month free trial"
});
```

### Extend Subscription

```typescript
await updateSubscription(subscriptionId, "extend", {
  endDate: new Date("2027-12-31")
});
```

### Cancel Subscription

```typescript
await updateSubscription(subscriptionId, "cancel");
```

### Get Expiring Subscriptions

```typescript
const { subscriptions } = await getExpiringSubscriptionsList(7); // Next 7 days
```

### Process Expired Subscriptions (Cron Job)

```typescript
// Run daily
const { count } = await processExpiredSubscriptions();
console.log(`Marked ${count} subscriptions as expired`);
```

## Security Considerations

1. **Admin-Only Operations**: All subscription creation and modification requires admin role
2. **Audit Logging**: All subscription changes are logged in audit_logs table
3. **No Payment Gateway**: Prevents payment fraud and chargebacks
4. **Manual Assignment**: Ensures controlled access and prevents abuse
5. **Token Verification**: All operations require valid JWT token

## Database Relations

```typescript
// User has one active subscription
user.subscription

// User has many assigned subscriptions (as admin)
user.assignedSubscriptions

// Subscription belongs to user
subscription.user

// Subscription assigned by admin
subscription.assignedByUser
```

## Migration

The subscription system was created with migration:
`0004_subscription_system.sql`

To apply:
```bash
npm run db:migrate
```

## Testing

### Test Subscription Creation
```bash
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": 123,
    "plan": "teacher_pro",
    "status": "active",
    "endsAt": "2026-12-31T00:00:00Z"
  }'
```

### Test Subscription Check
```bash
curl http://localhost:3000/api/subscriptions/check \
  -H "Cookie: token=YOUR_TOKEN"
```

## Future Enhancements

- [ ] Email notifications for expiring subscriptions
- [ ] Subscription renewal reminders
- [ ] Usage analytics dashboard
- [ ] Bulk subscription management
- [ ] Subscription templates
- [ ] Grace period after expiration
- [ ] Automatic trial conversion

## Support

For issues or questions, contact the development team or check the audit logs for subscription-related events.
