# How to Test Google Photos Integration

## ✅ What Was Added

### 1. Sidebar Menu Items
- **Admin Sidebar**: Added "Google Photos" menu item
- **Staff Sidebar**: Added "Google Photos" menu item
- Both appear between "Media" and "Google Drive"

### 2. Dashboard Cards
- **Staff Homepage**: Added "Google Photos" quick action card
- Appears alongside other quick actions

### 3. Test Page
- **New Test Page**: `/admin/google-photos-test`
- Automated testing of API integration
- Shows detailed results for each test

---

## 🧪 How to Test

### Step 1: Enable the API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **kwd2026**
3. Navigate to: **APIs & Services** > **Library**
4. Search for: **"Photos Library API"**
5. Click **"Enable"**

### Step 2: Start Your Development Server

```bash
npm run dev
```

### Step 3: Run Automated Tests

Visit the test page:
```
http://localhost:3000/admin/google-photos-test
```

Click **"Run Tests"** button to check:
- ✅ Environment variables are set
- ✅ API connection works
- ✅ Can list albums

### Step 4: Check the Sidebar

1. Log in to your dashboard
2. Look at the left sidebar
3. You should see **"Google Photos"** menu item
4. Click it to open the dashboard

### Step 5: Test the Dashboard

Visit:
```
http://localhost:3000/admin/google-photos
```

or

```
http://localhost:3000/staff/google-photos
```

You should see:
- Album grid (if you have albums)
- Or "No albums found" message
- Search and filter options

---

## 🔍 What Each Test Checks

### Test 1: Environment Variables
**Checks:**
- `GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL` is set
- `GOOGLE_PHOTOS_PRIVATE_KEY` is set

**Expected Result:**
```
✅ All environment variables are set correctly
```

**If Failed:**
- Check `.env.local` file
- Verify variables are spelled correctly
- Restart development server

### Test 2: List Albums
**Checks:**
- Can connect to Google Photos API
- Can authenticate with service account
- Can retrieve albums

**Expected Result:**
```
✅ Successfully fetched X albums
```

**If Failed:**
- Check if Photos Library API is enabled
- Verify service account credentials
- Check if you have created albums in Google Photos
- Ensure albums are shared publicly

### Test 3: API Connection
**Checks:**
- Overall API health
- All previous tests passed

**Expected Result:**
```
✅ Google Photos API is working correctly!
```

---

## 📱 Testing Checklist

### Before Testing
- [ ] Google Photos Library API is enabled
- [ ] Environment variables are set in `.env.local`
- [ ] Development server is running
- [ ] You're logged in as admin or staff

### During Testing
- [ ] Visit test page: `/admin/google-photos-test`
- [ ] Click "Run Tests" button
- [ ] All tests show green checkmarks
- [ ] Check sidebar has "Google Photos" menu
- [ ] Click menu item to open dashboard
- [ ] Dashboard loads without errors

### After Testing
- [ ] Create albums in Google Photos
- [ ] Share albums publicly
- [ ] Refresh dashboard to see albums
- [ ] Click an album to browse contents
- [ ] Test search functionality
- [ ] Test filter functionality
- [ ] Test preview modal

---

## 🐛 Troubleshooting

### "Environment Variables" Test Fails

**Problem:** Missing or incorrect environment variables

**Solution:**
1. Check `.env.local` file exists
2. Verify these variables are set:
   ```env
   GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL=kwd-900@kwd2026.iam.gserviceaccount.com
   GOOGLE_PHOTOS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
3. Restart development server: `npm run dev`

### "List Albums" Test Fails

**Problem:** Cannot connect to Google Photos API

**Possible Causes:**
1. **API Not Enabled**
   - Go to Google Cloud Console
   - Enable "Photos Library API"

2. **Wrong Credentials**
   - Verify service account email
   - Check private key is complete
   - Ensure no extra spaces or line breaks

3. **No Albums Created**
   - Create at least one album in Google Photos
   - Share the album publicly (with link)

4. **Service Account Permissions**
   - Service accounts have limited access to Google Photos
   - Albums must be shared publicly
   - Consider using OAuth 2.0 for better access

### Sidebar Menu Not Showing

**Problem:** "Google Photos" menu item not visible

**Solution:**
1. Clear browser cache
2. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Check you're logged in as admin or staff
4. Verify sidebar component was updated

### Dashboard Shows "No Albums Found"

**Problem:** Albums not appearing in dashboard

**Possible Causes:**
1. **No Albums Created**
   - Create albums in Google Photos
   - Upload some photos/videos

2. **Albums Not Shared**
   - Open each album in Google Photos
   - Click "Share" button
   - Set to "Anyone with the link"

3. **API Delay**
   - Wait 1-2 minutes after creating albums
   - Click "Refresh" button in dashboard

---

## 📊 Expected Test Results

### All Tests Pass ✅
```
✅ Environment Variables
   All environment variables are set correctly

✅ List Albums
   Successfully fetched 5 albums

✅ API Connection
   Google Photos API is working correctly!
```

### Some Tests Fail ❌
```
✅ Environment Variables
   All environment variables are set correctly

❌ List Albums
   Failed to list albums: API not enabled

❌ API Connection
   Some tests failed. Check the details above.
```

**Action:** Follow troubleshooting steps above

---

## 🎯 Next Steps After Testing

### If All Tests Pass:
1. ✅ Create albums for your categories
2. ✅ Upload photos and videos
3. ✅ Share albums publicly
4. ✅ Test in staff dashboard
5. ✅ Add to Vercel environment variables
6. ✅ Deploy to production

### If Tests Fail:
1. ❌ Review error messages
2. ❌ Check troubleshooting section
3. ❌ Verify API is enabled
4. ❌ Check environment variables
5. ❌ Try test page again

---

## 🔗 Quick Links

- **Test Page**: http://localhost:3000/admin/google-photos-test
- **Admin Dashboard**: http://localhost:3000/admin/google-photos
- **Staff Dashboard**: http://localhost:3000/staff/google-photos
- **Google Cloud Console**: https://console.cloud.google.com/
- **Google Photos**: https://photos.google.com/

---

## 💡 Tips

1. **Use Test Page First**: Always run the test page before using the dashboard
2. **Check Console**: Open browser DevTools to see detailed error messages
3. **Test Locally**: Test everything locally before deploying to Vercel
4. **Create Sample Album**: Create one test album with a few photos to verify
5. **Share Albums**: Remember to share albums publicly for service account access

---

## ✨ Success Indicators

You'll know it's working when:
- ✅ All tests pass with green checkmarks
- ✅ "Google Photos" appears in sidebar
- ✅ Dashboard loads without errors
- ✅ Albums appear in grid view
- ✅ Can click albums to browse contents
- ✅ Can preview photos and videos
- ✅ Can copy links and use in forms

---

**Ready to test?** Start with the test page and work through the checklist!
