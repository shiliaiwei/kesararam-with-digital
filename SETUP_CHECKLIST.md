# 🚀 Google Drive Integration - Complete Setup Checklist

## ✅ Phase 1: Vercel Environment Variables (5 minutes)

### Step 1: Go to Vercel Dashboard
- [ ] Open https://vercel.com/dashboard
- [ ] Select project: `kesararamwithdigital`
- [ ] Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

**Variable 1: Service Account Email**
```
Name: GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL
Value: kwd-900@kwd2026.iam.gserviceaccount.com
Environment: ✓ Production ✓ Preview ✓ Development
```

**Variable 2: Private Key**
```
Name: GOOGLE_DRIVE_PRIVATE_KEY
Value: (Copy from .env.local - the entire key including BEGIN/END lines)
Environment: ✓ Production ✓ Preview ✓ Development
```

**Variable 3: Folder ID (Add later)**
```
Name: GOOGLE_DRIVE_MEDIA_FOLDER_ID
Value: (Leave empty for now)
Environment: ✓ Production ✓ Preview ✓ Development
```

### Step 3: Redeploy
- [ ] Go to **Deployments** tab
- [ ] Click latest deployment → **⋯** → **Redeploy**
- [ ] Wait for deployment to complete (~2 minutes)

---

## ✅ Phase 2: Google Drive Folder Setup (10 minutes)

### Step 1: Create Main Folder
- [ ] Go to https://drive.google.com
- [ ] Click **+ New** → **Folder**
- [ ] Name: `KWD Media`
- [ ] Click **Create**

### Step 2: Create Category Folders

Inside `KWD Media`, create these 8 folders:

- [ ] `1. Road Signs`
- [ ] `2. Road Traffic`
- [ ] `3. Priority (Right of Way)`
- [ ] `4. Driving Skills`
- [ ] `5. Vehicle Technology`
- [ ] `6. Loading People & Goods`
- [ ] `7. General Knowledge`
- [ ] `8. Emergency Situations`

### Step 3: Create Subfolders

**For each category, create subfolders:**

**1. Road Signs:**
- [ ] Warning Signs
- [ ] Prohibitory Signs
- [ ] Mandatory Signs
- [ ] Informational Signs

**2. Road Traffic:**
- [ ] Images
- [ ] Audio/English
- [ ] Audio/Khmer
- [ ] PDFs

**3. Priority:**
- [ ] Intersection Diagrams
- [ ] Roundabouts
- [ ] Pedestrian Crossings

**4. Driving Skills:**
- [ ] Demonstration Videos
- [ ] Maneuver Diagrams
- [ ] Audio Guides

**5. Vehicle Technology:**
- [ ] Engine Diagrams
- [ ] Brake Systems
- [ ] Lighting Systems
- [ ] Safety Features

**6. Loading People & Goods:**
- [ ] Weight Limit Charts
- [ ] Loading Diagrams
- [ ] Safety Guidelines

**7. General Knowledge:**
- [ ] PDFs
- [ ] Links & Resources
- [ ] Infographics

**8. Emergency Situations:**
- [ ] First Aid Guides
- [ ] Emergency Procedures
- [ ] Contact Cards
- [ ] Scenario Images

### Step 4: Share with Service Account (CRITICAL!)
- [ ] Right-click `KWD Media` folder
- [ ] Click **Share**
- [ ] Add: `kwd-900@kwd2026.iam.gserviceaccount.com`
- [ ] Permission: **Viewer**
- [ ] Uncheck "Notify people"
- [ ] Click **Share**

### Step 5: Get Folder ID
- [ ] Open `KWD Media` folder
- [ ] Copy ID from URL: `https://drive.google.com/drive/folders/[THIS_IS_THE_ID]`
- [ ] Go back to Vercel → Environment Variables
- [ ] Update `GOOGLE_DRIVE_MEDIA_FOLDER_ID` with the ID
- [ ] Redeploy again

---

## ✅ Phase 3: Test Integration (5 minutes)

### Test 1: API Endpoint
- [ ] Open: `https://kesararamwithdigital.tech/api/media/google-drive/list`
- [ ] Should see: `{"success":true,"files":[],"count":0}`
- [ ] If error, check environment variables

### Test 2: Staff Dashboard
- [ ] Login to staff panel
- [ ] Go to: `https://kesararamwithdigital.tech/staff`
- [ ] Click **Google Drive** card
- [ ] Should see dashboard with stats
- [ ] Click **Refresh** button
- [ ] Should load files (empty if no files uploaded yet)

### Test 3: Content Creation
- [ ] Go to: `https://kesararamwithdigital.tech/staff/content/road-sign`
- [ ] Click **Create New Topic**
- [ ] For "Primary Image", click **Drive** button
- [ ] Should see Google Drive file picker modal
- [ ] If empty, upload a test image to Google Drive first

---

## ✅ Phase 4: Upload Sample Files (10 minutes)

### Upload Test Files

**Test Image:**
- [ ] Upload a road sign image to `1. Road Signs/Warning Signs/`
- [ ] Name: `test-warning-sign.jpg`
- [ ] Size: < 500 KB
- [ ] Aspect ratio: 16:9

**Test Audio:**
- [ ] Upload audio file to `2. Road Traffic/Audio/English/`
- [ ] Name: `test-audio-en.mp3`
- [ ] Size: < 5 MB

**Test PDF:**
- [ ] Upload PDF to `7. General Knowledge/PDFs/`
- [ ] Name: `test-guide.pdf`
- [ ] Size: < 10 MB

### Verify Files Appear
- [ ] Go to staff dashboard → Google Drive
- [ ] Click **Refresh**
- [ ] Should see 3 files
- [ ] Stats should show: 1 image, 1 audio, 1 PDF

---

## ✅ Phase 5: Train Staff (15 minutes)

### Create Staff Guide Document

Share this with your team:

**How to Use Google Drive for Content:**

1. **Upload Files to Google Drive**
   - Go to the correct category folder
   - Upload your file
   - Use proper naming convention

2. **Use in Content Creation**
   - Go to Staff Panel → Content
   - Create/Edit topic
   - For media fields, click **Drive** button
   - Search for your file
   - Select and save

3. **File Requirements**
   - Images: 16:9 aspect ratio, < 2 MB
   - Audio: MP3 format, < 20 MB
   - PDFs: Searchable, < 50 MB
   - Videos: MP4 format, < 500 MB

4. **Naming Convention**
   - Use descriptive names
   - No spaces (use hyphens)
   - Include category code
   - Example: `rs-w-001-sharp-curve.jpg`

---

## ✅ Phase 6: Monitor & Maintain

### Weekly Tasks
- [ ] Check Google Drive storage usage
- [ ] Review uploaded files for quality
- [ ] Remove duplicate files
- [ ] Update folder organization if needed

### Monthly Tasks
- [ ] Audit file access permissions
- [ ] Archive old/unused files
- [ ] Review staff usage patterns
- [ ] Update documentation

---

## 🎯 Success Criteria

You're done when:

✅ API endpoint returns `{"success":true}`
✅ Staff dashboard shows Google Drive stats
✅ File picker modal opens and shows files
✅ Can select files from Google Drive in content creation
✅ Files display correctly on public pages
✅ Staff can upload and use files independently

---

## 🆘 Troubleshooting

### Problem: API returns error
**Solution:**
1. Check environment variables in Vercel
2. Verify private key is complete (including BEGIN/END)
3. Redeploy after changes

### Problem: No files showing
**Solution:**
1. Verify folder is shared with service account
2. Check folder ID is correct
3. Wait 1-2 minutes for Google Drive sync
4. Click Refresh button

### Problem: Can't select files
**Solution:**
1. Check file permissions (should inherit from folder)
2. Verify file type matches (image/audio/pdf)
3. Try uploading to different folder

### Problem: Files not displaying on public pages
**Solution:**
1. Check file is actually in Google Drive
2. Verify URL format is correct
3. Test URL directly in browser
4. Check file sharing settings

---

## 📞 Support

If you need help:
1. Check this checklist first
2. Review `GOOGLE_DRIVE_SETUP_COMPLETE.md`
3. Test API endpoint directly
4. Check browser console for errors
5. Verify Vercel deployment logs

---

## 🎉 Next Steps

After setup is complete:

1. **Migrate existing content** from Cloudinary to Google Drive (optional)
2. **Train all staff members** on new workflow
3. **Create content guidelines** for file organization
4. **Set up backup system** for important files
5. **Monitor usage** and optimize as needed

---

## Summary

You now have:
- ✅ Google Drive API integrated
- ✅ Staff dashboard for file management
- ✅ File picker in content creation
- ✅ Hybrid storage (Cloudinary + Google Drive)
- ✅ Organized folder structure
- ✅ Access control (staff/admin only)

**Total Setup Time:** ~45 minutes
**Difficulty:** Medium
**Status:** Ready for production! 🚀
