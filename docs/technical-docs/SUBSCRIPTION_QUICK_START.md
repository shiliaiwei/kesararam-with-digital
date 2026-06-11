# Subscription System - Quick Start Guide

## For Developers

### 1. Check User's Subscription in a Component

```typescript
"use client";

import { useEffect, useState } from "react";
import { getCurrentSubscription } from "@/app/actions/subscriptions";

export function MyComponent() {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    getCurrentSubscription().then(({ subscription }) => {
      setSubscription(subscription);
    });
  }, []);

  if (!subscription) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Plan: {subscription.planName}</h2>
      <p>Status: {subscription.status}</p>
    </div>
  );
}
```

### 2. Check Before Creating a Class

```typescript
import { checkSubscriptionAccess } from "@/app/actions/subscriptions";

async function handleCreateClass() {
  const result = await checkSubscriptionAccess("createClass");
  
  if (!result.allowed) {
    alert(result.reason);
    return;
  }

  // Proceed with class creation
  await createClass(classData);
}
```

### 3. Protect an API Route

```typescript
import { requireSubscription } from "@/middleware/subscription-guard";

export async function POST(request: NextRequest) {
  // Require Teacher Pro or higher
  const error = await requireSubscription(request, "teacher_pro");
  if (error) return error;

  // Your protected logic here
  return NextResponse.json({ success: true });
}
```

### 4. Show Feature Based on Plan

```typescript
"use client";

import { getCurrentSubscription } from "@/app/actions/subscriptions";

export function AnalyticsSection() {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    getCurrentSubscription().then(({ subscription }) => {
      setHasAccess(subscription?.features.analytics || false);
    });
  }, []);

  if (!hasAccess) {
    return (
      <div className="upgrade-prompt">
        <p>Upgrade to Teacher Pro to access analytics</p>
        <button>Upgrade Now</button>
      </div>
    );
  }

  return <AnalyticsDashboard />;
}
```

## For Admins

### 1. Create a Subscription

```typescript
import { createUserSubscription } from "@/app/actions/subscriptions";

// Create annual Teacher Pro subscription
await createUserSubscription({
  userId: 123,
  plan: "teacher_pro",
  status: "active",
  startsAt: new Date(),
  endsAt: new Date("2026-12-31"),
  note: "Annual subscription - paid via bank transfer"
});
```

### 2. Create a Trial

```typescript
// Create 1-month trial
const trialEnd = new Date();
trialEnd.setMonth(trialEnd.getMonth() + 1);

await createUserSubscription({
  userId: 123,
  plan: "teacher_pro",
  status: "trial",
  isTrial: true,
  trialEndsAt: trialEnd,
  note: "1-month free trial"
});
```

### 3. Extend a Subscription

```typescript
import { updateSubscription } from "@/app/actions/subscriptions";

await updateSubscription(subscriptionId, "extend", {
  endDate: new Date("2027-12-31")
});
```

### 4. Cancel a Subscription

```typescript
await updateSubscription(subscriptionId, "cancel");
```

### 5. Check Expiring Subscriptions

```typescript
import { getExpiringSubscriptionsList } from "@/app/actions/subscriptions";

// Get subscriptions expiring in next 7 days
const { subscriptions } = await getExpiringSubscriptionsList(7);

subscriptions.forEach(({ subscription, user }) => {
  console.log(`${user.email} expires on ${subscription.endsAt}`);
});
```

## Plan Comparison

| Feature | Free | Teacher Pro | School |
|---------|------|-------------|--------|
| Students | 0 | 50 | Unlimited |
| Classes | 0 | 5 | Unlimited |
| Analytics | ❌ | ✅ | ✅ |
| Custom Content | ❌ | ✅ | ✅ |

## Common Patterns

### Display Quota Usage

```typescript
import { getUserQuotaInfo } from "@/app/actions/subscriptions";

const { quota } = await getUserQuotaInfo();

console.log(`Classes: ${quota.classes.current}/${quota.classes.max}`);
console.log(`Students: ${quota.students.current}/${quota.students.max}`);
```

### Check Multiple Features

```typescript
const checks = await Promise.all([
  checkSubscriptionAccess("createClass"),
  checkSubscriptionAccess("analytics"),
  checkSubscriptionAccess("customContent"),
]);

const [canCreateClass, hasAnalytics, hasCustomContent] = checks;
```

### Conditional Rendering

```typescript
{subscription.features.analytics && (
  <AnalyticsButton />
)}

{subscription.features.customContent && (
  <CreateContentButton />
)}
```

## API Endpoints Quick Reference

- `GET /api/subscriptions` - List subscriptions
- `GET /api/subscriptions/check` - Check current user's subscription
- `GET /api/subscriptions/[id]` - Get subscription details
- `POST /api/subscriptions/create` - Create subscription (admin)
- `PATCH /api/subscriptions/[id]` - Update subscription (admin)

## Database Queries Quick Reference

```typescript
import {
  getUserActiveSubscription,
  getUserPlanTier,
  hasActiveSubscription,
  getSubscriptionStats,
} from "@/db/queries/subscriptions";

// Get active subscription
const sub = await getUserActiveSubscription(userId);

// Get plan tier
const plan = await getUserPlanTier(userId); // "free" | "teacher_pro" | "school"

// Check if active
const isActive = await hasActiveSubscription(userId);

// Get stats (admin)
const stats = await getSubscriptionStats();
```

## Troubleshooting

### User can't create class
1. Check their current class count
2. Check their plan's maxClasses limit
3. Use `checkSubscriptionAccess("createClass")` to get detailed reason

### Subscription not showing
1. Check if subscription status is "active"
2. Check if endsAt is in the future (or null)
3. Use `getUserActiveSubscription()` to debug

### Feature not accessible
1. Check plan's feature flags in `PLAN_FEATURES`
2. Use `canAccessFeature(userId, feature)` to verify
3. Check subscription status

## Best Practices

1. **Always check before action**: Use `checkSubscriptionAccess()` before allowing users to create classes/add students
2. **Show clear upgrade prompts**: When features are locked, show why and how to upgrade
3. **Cache subscription data**: Fetch once per session, not on every render
4. **Handle errors gracefully**: Subscription checks can fail, have fallbacks
5. **Log admin actions**: All subscription changes are automatically logged in audit_logs

## Next Steps

- Read full documentation: `docs/SUBSCRIPTION_SYSTEM.md`
- Check example components: `src/components/subscription/`
- Review API routes: `src/app/api/subscriptions/`
- Test with different plans in development
