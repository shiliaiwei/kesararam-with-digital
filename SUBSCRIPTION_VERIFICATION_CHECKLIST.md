# Subscription System - Verification Checklist

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] Migration `0004_subscription_system.sql` is applied
- [ ] `subscriptions` table exists
- [ ] Enums `plan_tier` and `subscription_status` exist
- [ ] Indexes on `user_id` and `status` exist
- [ ] Foreign key constraints are working

**Verify:**
```sql
-- Check table exists
SELECT * FROM subscriptions LIMIT 1;

-- Check enums
SELECT enum_range(NULL::plan_tier);
SELECT enum_range(NULL::subscription_status);

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'subscriptions';
```

### 2. TypeScript Compilation
- [ ] No TypeScript errors (except drizzle-orm module resolution)
- [ ] All imports resolve correctly
- [ ] Types are properly exported

**Verify:**
```bash
cd kesararam
npx tsc --noEmit
```

### 3. Environment Variables
- [ ] `DATABASE_URL` is set
- [ ] `JWT_SECRET` is set
- [ ] Database connection works

**Verify:**
```bash
# Check .env.local
cat .env.local | grep DATABASE_URL
cat .env.local | grep JWT_SECRET
```

### 4. API Endpoints
- [ ] `/api/subscriptions` responds
- [ ] `/api/subscriptions/check` responds
- [ ] `/api/subscriptions/create` requires admin
- [ ] `/api/subscriptions/[id]` responds

**Verify:**
```bash
# Start dev server
npm run dev

# Test check endpoint (requires valid token)
curl http://localhost:3000/api/subscriptions/check \
  -H "Cookie: token=YOUR_TOKEN"
```

### 5. Server Actions
- [ ] `getCurrentSubscription()` works
- [ ] `getUserQuotaInfo()` works
- [ ] `checkSubscriptionAccess()` works
- [ ] Admin actions require admin role

**Verify in component:**
```tsx
import { getCurrentSubscription } from "@/app/actions/subscriptions";

const { subscription } = await getCurrentSubscription();
console.log(subscription);
```

### 6. Components
- [ ] `SubscriptionBadge` renders
- [ ] `QuotaDisplay` shows correct data
- [ ] `UpgradePrompt` shows/hides correctly
- [ ] `FeatureGate` works as expected

**Verify:**
```tsx
import { SubscriptionBadge } from "@/components/subscription";

// Add to any page
<SubscriptionBadge />
```

### 7. Middleware
- [ ] `requireSubscription()` blocks unauthorized users
- [ ] `requireFeature()` checks features correctly
- [ ] Admin bypass works

**Verify in API route:**
```tsx
import { requireSubscription } from "@/middleware/subscription-guard";

const error = await requireSubscription(request, "teacher_pro");
if (error) return error;
```

### 8. Database Queries
- [ ] `getUserActiveSubscription()` returns correct data
- [ ] `createSubscription()` creates records
- [ ] `updateSubscriptionStatus()` updates correctly
- [ ] Relations work (user.subscription)

**Verify:**
```typescript
import { getUserActiveSubscription } from "@/db/queries/subscriptions";

const sub = await getUserActiveSubscription(userId);
console.log(sub);
```

### 9. Audit Logging
- [ ] Subscription creation logs to audit_logs
- [ ] Subscription updates log to audit_logs
- [ ] Admin actions are tracked

**Verify:**
```sql
SELECT * FROM audit_logs 
WHERE action LIKE 'subscription%' 
ORDER BY created_at DESC 
LIMIT 10;
```

### 10. Security
- [ ] Non-admin cannot create subscriptions
- [ ] Users can only view own subscriptions
- [ ] Token verification works on all endpoints
- [ ] SQL injection protection (parameterized queries)

## 🧪 Test Scenarios

### Scenario 1: Create Free User
1. [ ] Create user account
2. [ ] Check subscription (should be free/none)
3. [ ] Try to create class (should fail)
4. [ ] Try to access analytics (should fail)

### Scenario 2: Admin Creates Subscription
1. [ ] Login as admin
2. [ ] Create Teacher Pro subscription for user
3. [ ] Verify subscription appears in database
4. [ ] Verify audit log entry created
5. [ ] User can now create classes (up to 5)

### Scenario 3: Quota Limits
1. [ ] User with Teacher Pro creates 5 classes
2. [ ] Try to create 6th class (should fail)
3. [ ] Check quota display shows 5/5
4. [ ] Upgrade to School plan
5. [ ] Can now create unlimited classes

### Scenario 4: Subscription Expiration
1. [ ] Create subscription with past end date
2. [ ] Run `processExpiredSubscriptions()`
3. [ ] Verify status changed to "expired"
4. [ ] User loses access to premium features

### Scenario 5: Trial Subscription
1. [ ] Admin creates trial subscription
2. [ ] User has access to features
3. [ ] Trial expires
4. [ ] User loses access

## 🔍 Manual Testing

### Test 1: Create Subscription (Admin)
```typescript
// In admin panel or console
import { createUserSubscription } from "@/app/actions/subscriptions";

const result = await createUserSubscription({
  userId: 123, // Replace with real user ID
  plan: "teacher_pro",
  status: "active",
  startsAt: new Date(),
  endsAt: new Date("2026-12-31"),
  note: "Test subscription"
});

console.log(result);
// Should return: { subscription: {...} }
```

### Test 2: Check Subscription (User)
```typescript
// In any component
import { getCurrentSubscription } from "@/app/actions/subscriptions";

const { subscription } = await getCurrentSubscription();
console.log(subscription);
// Should show plan, features, etc.
```

### Test 3: Check Quota
```typescript
import { getUserQuotaInfo } from "@/app/actions/subscriptions";

const { quota } = await getUserQuotaInfo();
console.log(quota);
// Should show classes, students, features
```

### Test 4: Feature Gate
```tsx
import { FeatureGate } from "@/components/subscription";

<FeatureGate feature="analytics">
  <div>Analytics content</div>
</FeatureGate>
// Should show content if user has access
```

### Test 5: API Endpoint
```bash
# Create subscription (admin only)
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -H "Cookie: token=ADMIN_TOKEN" \
  -d '{
    "userId": 123,
    "plan": "teacher_pro",
    "status": "active",
    "endsAt": "2026-12-31T00:00:00Z",
    "note": "Test subscription"
  }'

# Expected: 201 Created with subscription object
```

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'drizzle-orm'"
**Solution:** 
- Restart TypeScript server in IDE
- Run `npm install`
- Reload IDE window

### Issue: "Unauthorized" on API calls
**Solution:**
- Check JWT token is valid
- Verify token is in cookies
- Check JWT_SECRET matches

### Issue: Subscription not showing
**Solution:**
- Check subscription status is "active"
- Check endsAt is in future or null
- Verify userId matches

### Issue: Feature access denied
**Solution:**
- Check user's plan tier
- Verify PLAN_FEATURES configuration
- Check subscription is active

### Issue: Database connection error
**Solution:**
- Verify DATABASE_URL is correct
- Check database is running
- Test connection manually

## 📊 Performance Checks

- [ ] Subscription queries use indexes
- [ ] No N+1 query problems
- [ ] Components don't fetch on every render
- [ ] API responses are fast (<200ms)

**Verify:**
```sql
-- Check query performance
EXPLAIN ANALYZE 
SELECT * FROM subscriptions 
WHERE user_id = 123 AND status = 'active';
-- Should use index
```

## 🔐 Security Audit

- [ ] All admin operations check role
- [ ] JWT tokens are verified
- [ ] SQL queries are parameterized
- [ ] No sensitive data in logs
- [ ] Audit trail is complete

## 📝 Documentation Review

- [ ] README files are clear
- [ ] API documentation is accurate
- [ ] Component props are documented
- [ ] Examples work as shown

## ✅ Final Checks

- [ ] All TypeScript files compile
- [ ] No console errors in browser
- [ ] All tests pass
- [ ] Documentation is complete
- [ ] Code is committed to git

## 🚀 Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 📞 Post-Deployment

- [ ] Test all endpoints in production
- [ ] Verify subscription creation works
- [ ] Check audit logs are recording
- [ ] Monitor for errors
- [ ] Test with real users

---

## Sign-off

- [ ] Developer tested: _________________ Date: _______
- [ ] Code reviewed: _________________ Date: _______
- [ ] QA approved: _________________ Date: _______
- [ ] Ready for production: ☐ Yes ☐ No

## Notes

_Add any additional notes or observations here_

---

**Last Updated:** May 4, 2026
**Version:** 1.0.0
