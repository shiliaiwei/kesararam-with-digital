# ✅ Google Drive API Integration - COMPLETE

## What Was Implemented

Your KWD platform now supports **3 media storage options**:

1. **URL** - Direct links
2. **Cloudinary** - Image optimization & CDN (existing)
3. **Google Drive** - Your new option for PDFs, audio, large files

---

## Files Created

### Backend (API & Services)
- `src/lib/google-drive.ts` - Google Drive service functions
- `src/app/api/media/google-drive/list/route.ts` - List files API
- `src/app/api/media/google-drive/search/route.ts` - Search files API
- `src/app/api/media/google-drive/[fileId]/route.ts` - Get file metadata API

### Frontend (Components)
- `src/components/staff/media/google-drive-picker.tsx` - File picker modal
- Updated: `src/components/staff/media/media-selector.tsx` - Added Google Drive option

### Configuration
- Updated: `.env.local` - Added Google Drive credentials

---

## How It Works

### For Staff (Content Creators)

When creating/editing topics, staff can now choose from 3 sources:

```
[URL] [Cloudinary] [Drive]
```

**Google Drive Option:**
1. Click "Drive" button
2. Browse files from your Google Drive
3. Search by filename
4. Select file
5. URL is automatically generated

### For Users (Students)

Files are served directly from Google Drive with optimized URLs:
- Images: `https://drive.google.com/uc?export=view&id=FILE_ID`
- Audio: Same as images
- PDFs: `https://drive.google.com/file/d/FILE_ID/preview`

---

## Next Steps

### 1. Upload Files to Google Drive

Create a folder structure like:
```
KWD Media/
├── Images/
│   ├── Road Signs/
│   ├── Diagrams/
│   └── Illustrations/
├── Audio/
│   ├── English/
│   └── Khmer/
├── PDFs/
│   └── Learning Resources/
└── Videos/
```

### 2. Share Folder with Service Account

**Important:** Share your media folder with the service account email:
```
kwd-900@kwd2026.iam.gserviceaccount.com
```

**How to share:**
1. Right-click folder in Google Drive
2. Click "Share"
3. Add email: `kwd-900@kwd2026.iam.gserviceaccount.com`
4. Set permission: "Viewer" (read-only)
5. Click "Send"

### 3. (Optional) Set Default Folder

If you want to browse a specific folder by default:

1. Get the folder ID from Google Drive URL:
   ```
   https://drive.google.com/drive/folders/1ABC...XYZ
                                          ↑ This is the folder ID
   ```

2. Add to `.env.local`:
   ```env
   GOOGLE_DRIVE_MEDIA_FOLDER_ID=1ABC...XYZ
   ```

---

## Usage Examples

### Example 1: Upload Audio Files

1. Upload Khmer audio to Google Drive: `lesson-01-kh.mp3`
2. Share folder with service account
3. In staff panel, create/edit topic
4. For "Audio (Khmer)", click "Drive"
5. Search "lesson-01-kh"
6. Select file
7. Save

### Example 2: Upload PDF Resources

1. Upload PDF to Google Drive: `traffic-law-guide.pdf`
2. In General Knowledge page, staff can add as learning resource
3. Students can view/download directly

### Example 3: Large Video Files

1. Upload video to Google Drive (no size limit like Cloudinary)
2. Use in topics or learning resources
3. Embedded player works automatically

---

## API Endpoints

### List Files
```
GET /api/media/google-drive/list
GET /api/media/google-drive/list?folderId=FOLDER_ID
```

### Search Files
```
GET /api/media/google-drive/search?q=traffic
GET /api/media/google-drive/search?q=audio&folderId=FOLDER_ID
```

### Get File Info
```
GET /api/media/google-drive/FILE_ID
```

---

## Recommended Usage

| Content Type | Recommended Source | Why |
|--------------|-------------------|-----|
| Road Signs | Cloudinary | Fast CDN, image optimization |
| Diagrams | Cloudinary | Responsive images |
| Short Audio (<5MB) | Cloudinary | Fast delivery |
| Long Audio (>5MB) | Google Drive | No size limits |
| PDFs | Google Drive | Better for documents |
| Videos | Google Drive | Large file support |
| Learning Resources | Google Drive | Easy management |

---

## Benefits

✅ **No Additional Cost** - Use your existing Google Drive storage
✅ **Easy Management** - Familiar Google Drive interface
✅ **Large Files** - No size limits like Cloudinary
✅ **Organized** - Folder structure you control
✅ **Flexible** - Keep Cloudinary for images, Drive for everything else

---

## Testing

### Test the Integration

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to staff panel:**
   ```
   http://localhost:3000/staff/content/road-sign
   ```

3. **Create/Edit a topic**

4. **Try Google Drive option:**
   - Click "Drive" button
   - Should see file picker modal
   - Should list files from your Google Drive

### Troubleshooting

**If you see "Failed to list files":**
1. Check service account email is correct in `.env.local`
2. Verify private key is properly formatted (with `\n` for line breaks)
3. Make sure folder is shared with service account
4. Check Google Drive API is enabled in Google Cloud Console

**If files don't appear:**
1. Verify files are shared with service account
2. Check folder ID if using specific folder
3. Try without folder ID to see all accessible files

---

## Security Notes

✅ **Service Account** - Uses service account (not OAuth), no user login needed
✅ **Read-Only** - Only reads files, cannot modify/delete
✅ **Private Keys** - Stored in `.env.local`, not committed to git
✅ **Shared Files** - Only accesses files explicitly shared with service account

---

## Future Enhancements

Possible additions:
- [ ] Upload files directly from staff panel to Google Drive
- [ ] Organize files by category automatically
- [ ] Batch operations (select multiple files)
- [ ] File usage tracking
- [ ] Automatic backup from Cloudinary to Google Drive

---

## Support

If you need help:
1. Check `.env.local` has correct credentials
2. Verify folder sharing with service account
3. Test API endpoints directly
4. Check browser console for errors

---

## Summary

🎉 **You now have a hybrid media system:**
- Cloudinary for optimized images
- Google Drive for large files, PDFs, audio
- URL for external resources

Staff can choose the best option for each file type!
