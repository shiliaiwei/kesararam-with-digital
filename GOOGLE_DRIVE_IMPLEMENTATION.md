# Google Drive API Implementation Guide

## Option 1: Direct Public Links (Simplest)

### Setup:
1. Upload files to Google Drive
2. Right-click file → Share → Change to "Anyone with the link"
3. Copy the file ID from the share link
4. Use this URL format:

```
https://drive.google.com/uc?export=view&id=FILE_ID
```

### Pros:
- No API key needed
- Simple implementation
- Works immediately

### Cons:
- Manual file management
- No programmatic upload
- Files must be public

---

## Option 2: Google Drive API (Full Integration)

### Step 1: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google Drive API"
4. Create credentials (API Key or OAuth 2.0)

### Step 2: Install Dependencies

```bash
npm install googleapis
```

### Step 3: Environment Variables

Add to `.env.local`:

```env
GOOGLE_DRIVE_API_KEY=your_api_key_here
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
# OR for OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### Step 4: Create Google Drive Service

Create `src/lib/google-drive.ts`:

```typescript
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

// Option A: API Key (read-only, public files)
export function getDriveClient() {
  return google.drive({
    version: 'v3',
    auth: process.env.GOOGLE_DRIVE_API_KEY,
  });
}

// Option B: OAuth (full access)
export function getDriveClientOAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/google/callback'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({
    version: 'v3',
    auth: oauth2Client,
  });
}

// List files in a folder
export async function listFiles(folderId: string) {
  const drive = getDriveClient();
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, size)',
    orderBy: 'name',
  });

  return response.data.files || [];
}

// Get file metadata
export async function getFileMetadata(fileId: string) {
  const drive = getDriveClient();
  
  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, webViewLink, webContentLink, thumbnailLink, size',
  });

  return response.data;
}

// Get direct download URL
export function getDirectUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Get viewable URL (for images)
export function getViewUrl(fileId: string) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// Get embed URL (for videos, PDFs)
export function getEmbedUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
```

### Step 5: Create API Routes

Create `src/app/api/media/google-drive/list/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { listFiles } from '@/lib/google-drive';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId') || process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });
  }

  try {
    const files = await listFiles(folderId);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
```

Create `src/app/api/media/google-drive/[fileId]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getFileMetadata, getViewUrl } from '@/lib/google-drive';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const metadata = await getFileMetadata(params.fileId);
    const viewUrl = getViewUrl(params.fileId);

    return NextResponse.json({
      ...metadata,
      viewUrl,
    });
  } catch (error) {
    console.error('Error getting file:', error);
    return NextResponse.json({ error: 'Failed to get file' }, { status: 500 });
  }
}
```

### Step 6: Update Media Selector Component

Modify `src/components/staff/media/media-selector.tsx`:

```typescript
// Add Google Drive option
const [source, setSource] = useState<'url' | 'cloudinary' | 'google-drive'>('url');

// Add Google Drive file picker
{source === 'google-drive' && (
  <div>
    <button
      onClick={() => openGoogleDrivePicker()}
      className="w-full px-4 py-2 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000]"
    >
      Choose from Google Drive
    </button>
    {selectedFile && (
      <div className="mt-2 p-2 border-2 border-black">
        <p className="text-sm font-bold">{selectedFile.name}</p>
        <img src={getViewUrl(selectedFile.id)} alt="" className="mt-2 max-h-32" />
      </div>
    )}
  </div>
)}
```

---

## Option 3: Hybrid Approach (Recommended)

Use both services for different purposes:

- **Cloudinary**: Images that need optimization (signs, diagrams)
- **Google Drive**: Large files (PDFs, long audio, videos)

### Benefits:
- Best of both worlds
- Cost-effective
- Flexible

### Implementation:

```typescript
// src/lib/media-storage.ts
export type MediaSource = 'cloudinary' | 'google-drive' | 'url';

export interface MediaFile {
  url: string;
  source: MediaSource;
  fileId?: string; // For Google Drive
  publicId?: string; // For Cloudinary
}

export function getMediaUrl(file: MediaFile): string {
  switch (file.source) {
    case 'cloudinary':
      return file.url; // Already optimized URL
    case 'google-drive':
      return getViewUrl(file.fileId!);
    case 'url':
      return file.url;
  }
}

// Determine best source based on file type
export function recommendSource(mimeType: string): MediaSource {
  if (mimeType.startsWith('image/')) {
    return 'cloudinary'; // Images benefit from CDN + optimization
  }
  if (mimeType === 'application/pdf' || mimeType.startsWith('video/')) {
    return 'google-drive'; // Large files
  }
  if (mimeType.startsWith('audio/')) {
    return 'google-drive'; // Audio files
  }
  return 'url';
}
```

---

## Migration Strategy

If you want to migrate from Cloudinary to Google Drive:

### Step 1: Update Database Schema

```sql
-- Add source column to track where media is stored
ALTER TABLE topics ADD COLUMN primary_image_source VARCHAR(20) DEFAULT 'cloudinary';
ALTER TABLE topics ADD COLUMN audio_source_en VARCHAR(20) DEFAULT 'cloudinary';
ALTER TABLE topics ADD COLUMN audio_source_km VARCHAR(20) DEFAULT 'cloudinary';
```

### Step 2: Gradual Migration

1. Keep existing Cloudinary URLs working
2. Add Google Drive as an option for new uploads
3. Migrate files gradually
4. Update URLs in database

---

## Cost Comparison

### Cloudinary Free Tier:
- 25GB storage
- 25GB bandwidth/month
- 25,000 transformations/month

### Google Drive:
- 15GB free (shared with Gmail, Photos)
- $1.99/month for 100GB
- $2.99/month for 200GB
- No bandwidth limits (but has download quotas)

---

## Recommendation

**For your use case (educational platform):**

1. **Keep Cloudinary for images** (road signs, diagrams)
   - Fast delivery
   - Automatic optimization
   - Responsive images

2. **Use Google Drive for:**
   - PDF documents (learning resources)
   - Long audio files (lessons, explanations)
   - Video tutorials (if you add them)

3. **Implementation:**
   - Add Google Drive as an additional option
   - Don't remove Cloudinary
   - Let staff choose based on file type

This gives you flexibility and keeps costs low while maintaining performance!
