# Staff Dashboard Redesign - Deployment Checklist

## Pre-Deployment Steps

### 1. Database Migration
Run the migration script to add the `updated_by` column:

```bash
# Option 1: Using psql command
psql -d your_database_name -f scripts/add-updated-by-column.sql

# Option 2: Copy and paste SQL directly
# Open your database client and run:
# scripts/add-updated-by-column.sql
```

**Verify the migration:**
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'topics' AND column_name = 'updated_by';

-- Should return: updated_by | integer
```

### 2. Install Dependencies
No new dependencies required. All changes use existing packages.

### 3. Build the Application
```bash
npm run build
```

### 4. Test Locally
```bash
npm run dev
```

Test the following:
- [ ] Toast notifications appear and dismiss correctly
- [ ] Create new content shows success toast
- [ ] Edit content shows success toast
- [ ] Delete content shows confirmation and success toast
- [ ] Submit for review shows success toast
- [ ] Error cases show error toasts
- [ ] "Last Updated" column shows correct relative time
- [ ] "Updated By" column shows staff names
- [ ] All filters work correctly
- [ ] Search functionality works
- [ ] Status badges display correctly

## Deployment Steps

### 1. Backup Database
```bash
# Create a backup before deploying
pg_dump your_database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Deploy Code
```bash
# Push to your repository
git add .
git commit -m "Staff dashboard redesign with tracking and notifications"
git push origin main

# Deploy to production (adjust for your hosting)
# Vercel: Automatic deployment on push
# Other: Follow your deployment process
```

### 3. Run Migration on Production
```bash
# Connect to production database and run migration
psql -h production-host -d production_db -f scripts/add-updated-by-column.sql
```

### 4. Verify Deployment
- [ ] Visit production site
- [ ] Login as staff member
- [ ] Navigate to content management
- [ ] Test creating content
- [ ] Test editing content
- [ ] Verify toast notifications work
- [ ] Check "Last Updated" and "Updated By" columns

## Post-Deployment

### 1. Monitor for Issues
- Check application logs for errors
- Monitor database performance
- Watch for user feedback

### 2. Train Staff
- Share STAFF_DASHBOARD_REDESIGN.md with staff
- Demonstrate new features
- Explain tracking and audit trail

### 3. Admin Review
- Review content tracking data
- Check staff activity
- Verify audit trail is working

## Rollback Plan

If issues occur, rollback steps:

### 1. Revert Code
```bash
git revert HEAD
git push origin main
```

### 2. Remove Database Column (if needed)
```sql
-- Only if absolutely necessary
ALTER TABLE topics DROP COLUMN IF EXISTS updated_by;
```

### 3. Restore from Backup
```bash
# If major issues occur
psql your_database_name < backup_YYYYMMDD_HHMMSS.sql
```

## Files Changed

### New Files
- `src/components/ui/toast-container.tsx` - Toast context provider
- `src/components/ui/toast-notification.tsx` - Toast component
- `scripts/add-updated-by-column.sql` - Database migration
- `STAFF_DASHBOARD_REDESIGN.md` - Documentation
- `DEPLOYMENT_CHECKLIST.md` - This file

### Modified Files
- `src/components/staff/content/category-content-manager.tsx` - Added tracking and toasts
- `src/components/staff/content/topic-form-modal.tsx` - Added toasts
- `src/components/staff/content/my-topics-list.tsx` - Added toasts and confirmation
- `src/app/(dashboard)/layout.tsx` - Added ToastProvider
- `src/app/api/staff/topics/route.ts` - Added user name joins and updated_by
- `src/app/api/staff/topics/[id]/route.ts` - Added updated_by tracking
- `src/app/globals.css` - Added toast animation

## Success Criteria

Deployment is successful when:
- ✅ No console errors in browser
- ✅ Toast notifications appear and work correctly
- ✅ Content tracking shows correct data
- ✅ All CRUD operations work
- ✅ Filters and search work
- ✅ Staff can create, edit, delete content
- ✅ Admin can see who updated what and when
- ✅ No database errors in logs
- ✅ Performance is acceptable

## Support Contacts

If issues arise:
1. Check browser console for errors
2. Check server logs for API errors
3. Check database logs for query errors
4. Review STAFF_DASHBOARD_REDESIGN.md for usage
5. Contact development team

## Notes

- The `updated_by` column is nullable to support existing data
- Migration sets `updated_by = created_by` for existing records
- Toast notifications auto-dismiss after 4 seconds
- Relative time updates on page refresh (not real-time)
- Delete confirmation is inline (no JS confirm dialog)
- All changes are backward compatible
