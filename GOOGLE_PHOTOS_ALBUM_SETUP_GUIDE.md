# Google Photos Album Setup Guide

## Important: Google Photos Limitations

⚠️ **Google Photos only supports:**
- ✅ Images (JPG, PNG, GIF, etc.)
- ✅ Videos (MP4, MOV, AVI, etc.)

❌ **Google Photos does NOT support:**
- ❌ Audio files (MP3, WAV, etc.)
- ❌ PDFs
- ❌ Documents

## Recommended Hybrid Approach

### Use Google Photos For:
1. **Road Signs** - Images of traffic signs
2. **Road Traffic** - Traffic images and videos
3. **Priority** - Intersection diagrams and images
4. **Driving Skills** - Demonstration videos and diagrams
5. **Vehicle Technology** - Engine diagrams and images
6. **Loading** - Weight charts and loading diagrams
7. **General Knowledge** - Infographics and images
8. **Emergency** - First aid images and scenario photos

### Keep Google Drive For:
- 🔊 **Audio files** (English/Khmer explanations)
- 📄 **PDFs** (Laws, guides, documents)
- 📁 **Documents** (Text files, spreadsheets)

---

## Google Photos Album Structure

Create these albums in Google Photos:

```
📸 Google Photos Albums
│
├── 🚦 1. Road Signs - Warning
├── 🚦 2. Road Signs - Prohibitory
├── 🚦 3. Road Signs - Mandatory
├── 🚦 4. Road Signs - Informational
│
├── 🚗 5. Road Traffic - Rules
├── 🚗 6. Road Traffic - Speed Limits
├── 🚗 7. Road Traffic - Parking
├── 🚗 8. Road Traffic - Overtaking
│
├── ⚡ 9. Priority - Intersections
├── ⚡ 10. Priority - Roundabouts
├── ⚡ 11. Priority - Pedestrian Crossings
│
├── 🎯 12. Driving Skills - Demonstrations
├── 🎯 13. Driving Skills - Maneuvers
│
├── 🔧 14. Vehicle Tech - Engine
├── 🔧 15. Vehicle Tech - Brakes
├── 🔧 16. Vehicle Tech - Lighting
├── 🔧 17. Vehicle Tech - Safety
│
├── 📦 18. Loading - Weight Charts
├── 📦 19. Loading - Diagrams
│
├── 📚 20. General Knowledge - Infographics
├── 📚 21. General Knowledge - Safety Guides
│
├── 🚨 22. Emergency - First Aid
└── 🚨 23. Emergency - Procedures
```

---

## Step-by-Step Setup

### Step 1: Access Google Photos

1. Go to: https://photos.google.com
2. Sign in with your Google account (same as Google Drive)

### Step 2: Create Albums

For each category:

1. Click **"Albums"** in left sidebar
2. Click **"+ Create album"**
3. Enter album name (e.g., "1. Road Signs - Warning")
4. Click **"Add photos"**
5. Upload your images/videos
6. Click **"Done"**

### Step 3: Share Albums with Service Account

**CRITICAL:** You must share each album with your service account:

1. Open the album
2. Click **"Share"** button (top right)
3. Click **"Get link"**
4. Change to **"Anyone with the link"** (required for service accounts)
5. Copy the link
6. Click **"Done"**

⚠️ **Note:** Google Photos API with service accounts requires albums to be shared. Unlike Google Drive, you cannot directly share with the service account email.

### Alternative: Use OAuth Instead

If you want better control, consider using OAuth 2.0 instead of service account:
- Users sign in with their Google account
- Access their own Google Photos
- More secure and flexible

---

## File Naming Conventions

### Images in Google Photos
```
category-code-description.jpg

Examples:
✅ rs-w-001-sharp-curve.jpg
✅ rt-sl-040-speed-limit.jpg
✅ pr-int-001-intersection.jpg
✅ ds-demo-parallel-parking.jpg
✅ vt-eng-001-engine-diagram.jpg
```

### Videos in Google Photos
```
category-code-description.mp4

Examples:
✅ ds-demo-001-parallel-parking.mp4
✅ rt-demo-002-overtaking.mp4
✅ em-proc-001-first-aid.mp4
```

---

## Upload Recommendations

### Image Quality
- **Format:** JPG or PNG
- **Resolution:** 1920x1080 (Full HD) recommended
- **Aspect Ratio:** 16:9 for consistency
- **File Size:** Google Photos compresses automatically
- **Color:** RGB color space

### Video Quality
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1920x1080 (Full HD) or 1280x720 (HD)
- **Frame Rate:** 30fps or 60fps
- **Duration:** Keep under 5 minutes for better loading
- **Audio:** AAC codec, 128kbps

---

## Organizing Your Content

### What Goes Where?

#### Google Photos (Images & Videos)
```
✅ Road sign photos
✅ Traffic situation images
✅ Intersection diagrams
✅ Driving demonstration videos
✅ Vehicle part images
✅ Loading diagrams
✅ Infographics
✅ Emergency procedure images
```

#### Google Drive (Audio & Documents)
```
✅ Audio explanations (MP3, WAV)
✅ PDF documents (laws, guides)
✅ Text documents
✅ Spreadsheets
✅ Any non-image/video files
```

---

## Quick Setup Script

### 1. Create All Albums at Once

Copy this list and create albums one by one:

```
1. Road Signs - Warning
2. Road Signs - Prohibitory
3. Road Signs - Mandatory
4. Road Signs - Informational
5. Road Traffic - Rules
6. Road Traffic - Speed Limits
7. Road Traffic - Parking
8. Road Traffic - Overtaking
9. Priority - Intersections
10. Priority - Roundabouts
11. Priority - Pedestrian Crossings
12. Driving Skills - Demonstrations
13. Driving Skills - Maneuvers
14. Vehicle Tech - Engine
15. Vehicle Tech - Brakes
16. Vehicle Tech - Lighting
17. Vehicle Tech - Safety
18. Loading - Weight Charts
19. Loading - Diagrams
20. General Knowledge - Infographics
21. General Knowledge - Safety Guides
22. Emergency - First Aid
23. Emergency - Procedures
```

### 2. Batch Upload

For each category:
1. Prepare all images/videos in a folder on your computer
2. Open the corresponding Google Photos album
3. Drag and drop all files at once
4. Wait for upload to complete
5. Share the album (make it public with link)

---

## Testing Your Setup

### After Creating Albums:

1. **Test API Connection:**
   ```
   http://localhost:3000/api/media/google-photos/test
   ```

2. **List Your Albums:**
   ```
   http://localhost:3000/api/media/google-photos/list?type=albums
   ```

3. **Browse in Dashboard:**
   - Go to: http://localhost:3000/admin/google-photos
   - You should see all your albums
   - Click an album to see its contents

---

## Important Notes

### Service Account Limitations

⚠️ **Google Photos API with service accounts has limitations:**

1. **Cannot access user's personal photos** - Only shared albums
2. **Albums must be publicly shared** - Or use OAuth instead
3. **No write access** - Service accounts are read-only
4. **Rate limits** - 10,000 requests per day

### Recommended Alternative: OAuth 2.0

For better experience, consider implementing OAuth:
- Users sign in with Google
- Access their own Google Photos
- No need to share albums publicly
- Better security and control

Would you like me to implement OAuth instead?

---

## Maintenance Checklist

### Weekly Tasks
- [ ] Check new uploads are in correct albums
- [ ] Verify image quality
- [ ] Remove duplicates
- [ ] Update album descriptions

### Monthly Tasks
- [ ] Review storage usage
- [ ] Archive old content
- [ ] Update album organization
- [ ] Check sharing settings

---

## Troubleshooting

### Albums Not Showing in App?

1. ✅ Check albums are shared (public with link)
2. ✅ Verify Google Photos Library API is enabled
3. ✅ Check service account credentials
4. ✅ Wait 1-2 minutes for sync

### Images Not Loading?

1. ✅ Check image format (JPG/PNG)
2. ✅ Verify album sharing settings
3. ✅ Check API quotas
4. ✅ Try refreshing the page

### Videos Not Playing?

1. ✅ Check video format (MP4 recommended)
2. ✅ Verify video codec (H.264)
3. ✅ Check file size (under 500MB)
4. ✅ Test in Google Photos directly first

---

## Summary

### ✅ Do This:
1. Create albums in Google Photos for images/videos
2. Share each album publicly (with link)
3. Keep Google Drive for audio files and PDFs
4. Use the hybrid approach for best results

### ❌ Don't Do This:
1. Don't upload audio files to Google Photos
2. Don't upload PDFs to Google Photos
3. Don't forget to share albums
4. Don't use very large video files (>500MB)

---

## Next Steps

1. ✅ Enable Google Photos Library API in Google Cloud Console
2. ✅ Create albums following the structure above
3. ✅ Upload your images and videos
4. ✅ Share each album publicly
5. ✅ Test in the dashboard
6. ✅ Keep Google Drive for audio/PDFs

Need help with any step? Let me know!
