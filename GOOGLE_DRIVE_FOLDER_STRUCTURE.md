# Google Drive Folder Structure for KWD Project

## Recommended Folder Organization

Create this structure in your Google Drive:

```
📁 KWD Media (Main Folder)
│
├── 📁 1. Road Signs
│   ├── 📁 Warning Signs
│   ├── 📁 Prohibitory Signs
│   ├── 📁 Mandatory Signs
│   └── 📁 Informational Signs
│
├── 📁 2. Road Traffic
│   ├── 📁 Images
│   │   ├── Traffic Rules
│   │   ├── Speed Limits
│   │   ├── Parking
│   │   └── Overtaking
│   ├── 📁 Audio
│   │   ├── English
│   │   └── Khmer
│   └── 📁 PDFs
│       └── Law References
│
├── 📁 3. Priority (Right of Way)
│   ├── 📁 Intersection Diagrams
│   ├── 📁 Roundabouts
│   └── 📁 Pedestrian Crossings
│
├── 📁 4. Driving Skills
│   ├── 📁 Demonstration Videos
│   ├── 📁 Maneuver Diagrams
│   └── 📁 Audio Guides
│
├── 📁 5. Vehicle Technology
│   ├── 📁 Engine Diagrams
│   ├── 📁 Brake Systems
│   ├── 📁 Lighting Systems
│   └── 📁 Safety Features
│
├── 📁 6. Loading People & Goods
│   ├── 📁 Weight Limit Charts
│   ├── 📁 Loading Diagrams
│   └── 📁 Safety Guidelines
│
├── 📁 7. General Knowledge
│   ├── 📁 PDFs
│   │   ├── Road Safety Guides
│   │   ├── Environmental Guides
│   │   └── Legal Documents
│   ├── 📁 Links & Resources
│   └── 📁 Infographics
│
└── 📁 8. Emergency Situations
    ├── 📁 First Aid Guides
    ├── 📁 Emergency Procedures
    ├── 📁 Contact Cards
    └── 📁 Scenario Images
```

---

## Step-by-Step Setup

### 1. Create Main Folder

1. Go to Google Drive: https://drive.google.com
2. Click **+ New** → **Folder**
3. Name it: `KWD Media`
4. Click **Create**

### 2. Create Category Folders

Inside `KWD Media`, create 8 folders:
- `1. Road Signs`
- `2. Road Traffic`
- `3. Priority (Right of Way)`
- `4. Driving Skills`
- `5. Vehicle Technology`
- `6. Loading People & Goods`
- `7. General Knowledge`
- `8. Emergency Situations`

### 3. Create Subfolders

For each category, create the subfolders as shown in the structure above.

### 4. Share with Service Account

**CRITICAL STEP:**

1. Right-click on `KWD Media` folder
2. Click **Share**
3. In "Add people and groups", paste:
   ```
   kwd-900@kwd2026.iam.gserviceaccount.com
   ```
4. Set permission to: **Viewer**
5. Uncheck "Notify people"
6. Click **Share**

### 5. Get Folder ID

1. Open `KWD Media` folder
2. Look at the URL:
   ```
   https://drive.google.com/drive/folders/1ABC...XYZ
   ```
3. Copy the ID part: `1ABC...XYZ`
4. Add to Vercel environment variables:
   - Name: `GOOGLE_DRIVE_MEDIA_FOLDER_ID`
   - Value: `1ABC...XYZ`

---

## File Naming Conventions

### Images
```
category-code-description.jpg
Examples:
- rs-w-001-sharp-curve.jpg
- rt-sl-040-speed-limit.jpg
- pr-int-001-intersection.jpg
```

### Audio Files
```
category-code-lang.mp3
Examples:
- rs-w-001-en.mp3
- rs-w-001-km.mp3
- rt-sl-040-en.mp3
```

### PDFs
```
category-topic-name.pdf
Examples:
- road-traffic-law-2024.pdf
- emergency-first-aid-guide.pdf
- vehicle-maintenance-manual.pdf
```

---

## File Size Recommendations

| File Type | Recommended Size | Max Size |
|-----------|-----------------|----------|
| Images (JPG/PNG) | < 500 KB | 2 MB |
| Audio (MP3) | < 5 MB | 20 MB |
| PDFs | < 10 MB | 50 MB |
| Videos (MP4) | < 50 MB | 500 MB |

---

## Upload Checklist

Before uploading files:

- [ ] File is in correct folder
- [ ] File name follows naming convention
- [ ] File size is optimized
- [ ] Image is 16:9 aspect ratio (if applicable)
- [ ] Audio quality is good (128kbps minimum)
- [ ] PDF is searchable (not scanned image)

---

## Maintenance

### Weekly Tasks
- [ ] Check for duplicate files
- [ ] Verify file names are consistent
- [ ] Remove unused files
- [ ] Update folder organization if needed

### Monthly Tasks
- [ ] Review storage usage
- [ ] Archive old versions
- [ ] Update documentation
- [ ] Backup important files

---

## Access Control

### Who Can Access?

**Service Account (Read-Only):**
- `kwd-900@kwd2026.iam.gserviceaccount.com`
- Can only read files
- Used by the application

**Staff/Admin (Full Access):**
- Your Google account
- Can upload, edit, delete
- Manages all files

### Security Best Practices

1. ✅ Only share with service account email
2. ✅ Keep service account as "Viewer" only
3. ✅ Don't share individual files publicly
4. ✅ Use folder-level sharing
5. ✅ Regularly audit access permissions

---

## Troubleshooting

### Files Not Showing in App?

1. Check folder is shared with service account
2. Verify folder ID in environment variables
3. Check file permissions (should inherit from folder)
4. Wait 1-2 minutes for Google Drive to sync

### Can't Upload Files?

1. Check your Google Drive storage quota
2. Verify file size limits
3. Check file format is supported
4. Try uploading to different folder

---

## Next Steps

After setting up folders:

1. ✅ Share main folder with service account
2. ✅ Get folder ID and add to Vercel
3. ✅ Upload sample files to test
4. ✅ Test in staff panel
5. ✅ Train staff on folder structure
