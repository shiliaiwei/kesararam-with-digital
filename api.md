# KWD API Documentation

## Overview
This document lists all API endpoints and server actions available in the KWD (Kesararam With Digital) platform.

---

## REST API Endpoints

### 1. Health Check
**Endpoint:** `GET /api/health`

**Description:** Diagnostic endpoint to check environment variables and system status.

**Response:**
```json
{
  "jwt_secret_set": boolean,
  "database_url_set": boolean,
  "node_env": string
}
```

**Authentication:** None

---

### 2. Cloudinary Images
**Endpoint:** `GET /api/cloudinary/images`

**Description:** Fetch images from Cloudinary with folder and tag filtering.

**Query Parameters:**
- `folder` (optional): Filter by folder path (e.g., "avatar/face")
- `tag` (optional): Filter by tag

**Response:**
```json
{
  "resources": [
    {
      "public_id": string,
      "url": string,
      "folder": string,
      "tags": string[],
      "width": number,
      "height": number,
      "created_at": string
    }
  ],
  "total": number,
  "folders": [{ "name": string, "count": number }],
  "categories": [{ "name": string, "count": number }]
}
```

**Authentication:** None

**Errors:**
- `500`: Cloudinary environment variables missing or API error

---

### 3. AI Chat
**Endpoint:** `POST /api/ai/chat`

**Description:** Chat with Suar AI assistant for driving theory questions.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user" | "assistant",
      "content": string
    }
  ]
}
```

**Response:**
```json
{
  "content": string
}
```

**Authentication:** None

**Features:**
- Supports both Khmer and English
- Uses OpenAI GPT-4o-mini (primary) or Groq Llama3 (fallback)
- Maximum 20 messages in conversation history
- Maximum 2000 characters per message
- Maximum 600 tokens in response

**Errors:**
- `400`: Invalid request format
- `500`: General error
- `503`: AI service unavailable

---

## Server Actions (Form Actions)

### Authentication Actions

#### Login
**Function:** `loginAction(prevState, formData)`

**Form Fields:**
- `email`: Email or username (required)
- `password`: Password (required)
- `redirect`: Optional redirect URL after login

**Returns:**
```typescript
{
  error: string,
  redirectTo?: string
}
```

**Features:**
- Supports login with email or username
- Account lockout after 9 failed attempts (24 hours)
- Sets JWT cookie (`kwd_token`)
- Session duration: 7 days (students), 8 hours (teachers/admin)

---

#### Logout
**Function:** `logoutAction()`

**Description:** Clears authentication cookie and redirects to login page.

**Authentication:** None required

---

### User Management Actions

#### Create User
**Function:** `createUser(formData)`

**Form Fields:**
- `username`: Username (required, unique)
- `email`: Email address (required, unique)
- `displayName`: Display name (optional)
- `password`: Password (required)
- `role`: User role - "student" | "teacher" | "admin" (required)

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Admin only

**Errors:**
- Username or email already exists
- Missing required fields

---

#### Update User
**Function:** `updateUser(id, formData)`

**Parameters:**
- `id`: User ID (number)

**Form Fields:**
- `displayName`: Display name (optional)
- `email`: Email address (required)
- `role`: User role (required)
- `isActive`: Active status (boolean)
- `password`: New password (optional)

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Admin only

---

#### Delete User
**Function:** `deleteUser(id)`

**Parameters:**
- `id`: User ID (number)

**Description:** Deactivates user (soft delete).

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Admin only

**Restrictions:**
- Cannot delete your own account

---

#### Toggle User Active Status
**Function:** `toggleUserActive(id, isActive)`

**Parameters:**
- `id`: User ID (number)
- `isActive`: Active status (boolean)

**Authentication:** Admin only

---

#### Reset User Password
**Function:** `resetUserPassword(id, password)`

**Parameters:**
- `id`: User ID (number)
- `password`: New password (string)

**Description:** Resets password and clears login attempts/lockout.

**Returns:**
```typescript
{
  success: boolean
}
```

**Authentication:** Admin only

---

### Profile Actions

#### Update Profile
**Function:** `updateProfileAction(formData)`

**Form Fields:**
- `displayName`: Display name (optional)
- `avatar`: Avatar JSON string (optional)
  ```json
  {
    "face": "path/to/face.svg",
    "head": "path/to/head.svg"
  }
  ```

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Required (any authenticated user)

**Features:**
- Updates JWT cookie with new profile data
- Tracks avatar change timestamp

---

### Class Management Actions

#### Create Class
**Function:** `createClass(formData)`

**Form Fields:**
- `name`: Class name (required)

**Returns:**
```typescript
{
  success?: boolean,
  code?: string,
  error?: string
}
```

**Authentication:** Teacher or Admin

**Features:**
- Generates random 6-character class code
- Associates class with current teacher

---

#### Delete Class
**Function:** `deleteClass(id)`

**Parameters:**
- `id`: Class ID (number)

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Teacher or Admin

---

#### Get Teacher Classes
**Function:** `getTeacherClasses()`

**Description:** Retrieves classes for current teacher (or all classes for admin).

**Returns:**
```typescript
Array<{
  id: number,
  name: string,
  code: string,
  createdAt: Date,
  teacherName: string | null,
  teacherEmail: string
}>
```

**Authentication:** Teacher or Admin

---

### Road Markings Actions

#### Create Road Marking
**Function:** `createRoadMarking(formData)`

**Form Fields:**
- `category`: Category - "curbs" | "signals" | "longitudinal" (required)
- `nameEn`: English name (required)
- `nameKm`: Khmer name (optional)
- `descriptionEn`: English description (optional)
- `descriptionKm`: Khmer description (optional)
- `imageUrl`: Image URL (optional)
- `colorCode`: Color code (optional)
- `sortOrder`: Sort order (number, default: 0)

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Admin only

---

#### Update Road Marking
**Function:** `updateRoadMarking(id, formData)`

**Parameters:**
- `id`: Road marking ID (number)

**Form Fields:**
- `category`: Category (required)
- `nameEn`: English name (required)
- `nameKm`: Khmer name (optional)
- `descriptionEn`: English description (optional)
- `descriptionKm`: Khmer description (optional)
- `imageUrl`: Image URL (optional)
- `colorCode`: Color code (optional)
- `sortOrder`: Sort order (number)
- `isActive`: Active status (boolean)

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Admin only

---

#### Delete Road Marking
**Function:** `deleteRoadMarking(id)`

**Parameters:**
- `id`: Road marking ID (number)

**Returns:**
```typescript
{
  success?: boolean,
  error?: string
}
```

**Authentication:** Admin only

---

#### Toggle Road Marking Active Status
**Function:** `toggleRoadMarkingActive(id, isActive)`

**Parameters:**
- `id`: Road marking ID (number)
- `isActive`: Active status (boolean)

**Authentication:** Admin only

---

## Authentication & Authorization

### JWT Token
- Cookie name: `kwd_token`
- HttpOnly: Yes
- Secure: Yes (production only)
- SameSite: Lax
- Domain: `.kesararamwithdigital.tech` (production)
- Max Age:
  - Students: 7 days (604,800 seconds)
  - Teachers/Admin: 8 hours (28,800 seconds)

### Token Payload
```typescript
{
  id: number,
  email: string,
  name: string,
  role: "student" | "teacher" | "admin",
  avatar: string | null
}
```

### Role-Based Access Control

| Endpoint/Action | Student | Teacher | Admin |
|----------------|---------|---------|-------|
| Login/Logout | ✅ | ✅ | ✅ |
| Update Profile | ✅ | ✅ | ✅ |
| AI Chat | ✅ | ✅ | ✅ |
| Cloudinary Images | ✅ | ✅ | ✅ |
| Health Check | ✅ | ✅ | ✅ |
| Create Class | ❌ | ✅ | ✅ |
| Delete Class | ❌ | ✅ | ✅ |
| Get Teacher Classes | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |
| Road Markings Management | ❌ | ❌ | ✅ |

---

## Error Handling

### Common Error Responses

**Unauthorized (401):**
```json
{
  "error": "Unauthorized"
}
```

**Bad Request (400):**
```json
{
  "error": "Invalid request"
}
```

**Server Error (500):**
```json
{
  "error": "Failed to perform operation"
}
```

**Service Unavailable (503):**
```json
{
  "content": "សូមទោស — AI service unavailable. Please try again later."
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for:
- Login attempts (already has account lockout after 9 attempts)
- AI chat endpoint
- User creation endpoint

---

## Environment Variables Required

### Database
- `DATABASE_URL`: PostgreSQL connection string

### Authentication
- `JWT_SECRET`: Secret key for JWT signing

### Cloudinary
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### AI Services
- `OPENAI_API_KEY`: OpenAI API key (optional, primary)
- `GROQ_API_KEY`: Groq API key (optional, fallback)

### Environment
- `NODE_ENV`: "development" | "production"

---

## Notes

1. All server actions use Next.js Server Actions pattern with `"use server"` directive
2. Password hashing uses SHA-256 (consider upgrading to bcrypt or argon2)
3. All timestamps are stored in UTC
4. Soft delete is used for users (isActive flag)
5. Hard delete is used for classes and road markings
6. All database operations use Drizzle ORM
7. Path revalidation is used after mutations to update cached data

---

**Last Updated:** March 15, 2026
