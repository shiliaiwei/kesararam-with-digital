# Google Photos API Migration Guide

## Overview
This project has been migrated from Google Drive API to Google Photos API for media management.

## What Changed

### 1. API Integration
- **Old**: Google Drive API for file storage
- **New**: Google Photos API for photo and video management

### 2. File Structure
- **Albums** replace folders
- Only supports **images and videos** (no audio, PDFs, or documents)
- Google Photos doesn't provide file sizes via API

### 3. Environment Variables

Add these to your `.env.local` and Vercel:

```env
GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PHOTOS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### 4. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Photos Library API**
3. Use the same service account credentials
4. Required scopes:
   - `https://www.googleapis.com/auth/photoslibrary.readonly`
   - `https://www.googleapis.com/auth/photoslibrary`

### 5. New Components

#### API Routes
- `/api/media/google-photos/list` - List albums or media items
- `/api/media/google-photos/search` - Search media items
- `/api/media/google-photos/album-stats` - Get album statistics
- `/api/media/google-photos/[mediaId]` - Get single media item
- `/api/media/google-photos/test` - Test environment variables

#### Dashboard Pages
- `/admin/google-photos` - Admin dashboard for browsing albums
- `/staff/google-photos` - Staff dashboard (same as admin)

#### Components
- `GooglePhotosPicker` - Modal for selecting photos/videos
- Updated `MediaSelector` - Now includes Google Photos option

### 6. URL Format

Google Photos uses `baseUrl` with parameters:
- Download: `{baseUrl}=d`
- Sized: `{baseUrl}=w{width}-h{height}`
- Thumbnail: `{baseUrl}=w{size}-h{size}-c`

**Important**: Base URLs expire after 60 minutes. For long-term storage, store the media item ID and fetch fresh URLs when needed.

### 7. Limitations

Google Photos API has some limitations compared to Google Drive:
- **No audio files** - Only photos and videos
- **No PDFs or documents** - Only media files
- **No file sizes** - API doesn't provide file size information
- **URL expiration** - Base URLs expire after 60 minutes
- **Album-based** - Content is organized by albums, not folders

### 8. Migration Steps

If you have existing Google Drive media:

1. **Keep both systems** (recommended):
   - Use Google Photos for images and videos
   - Keep Google Drive for audio, PDFs, and documents
   - Update forms to choose appropriate source

2. **Or migrate content**:
   - Download files from Google Drive
   - Upload images/videos to Google Photos albums
   - Organize into albums matching your folder structure
   - Update database references to new URLs

### 9. Testing

Test the integration:
```bash
# Check environment variables
curl http://localhost:3000/api/media/google-photos/test

# List albums
curl http://localhost:3000/api/media/google-photos/list?type=albums

# List media items in an album
curl http://localhost:3000/api/media/google-photos/list?albumId=ALBUM_ID
```

### 10. Usage in Forms

The `MediaSelector` component now supports three sources:
- **URL** - Direct URL input
- **Cloudinary** - Optimized images
- **Photos** - Google Photos (images and videos only)

For audio files, you'll need to use URL or keep Google Drive integration.

## Recommended Setup

For a complete media solution:
1. **Cloudinary** - Optimized images (road signs, diagrams)
2. **Google Photos** - Large photo/video collections (organized by albums)
3. **Google Drive** (optional) - Audio files, PDFs, documents

## Support

If you encounter issues:
1. Check environment variables are set correctly
2. Verify Google Photos Library API is enabled
3. Check service account has proper permissions
4. Review API quotas in Google Cloud Console
