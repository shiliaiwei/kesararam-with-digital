# Authentication Guide

## Overview
This application uses session-based authentication with different requirements for different features.

## Authentication Requirements

### Features That Require Login (401 if not authenticated)

1. **Live Quiz Games (Students)**
   - Joining a game session requires authentication
   - Students must be logged in to participate
   - If not logged in, they are redirected to `/login?redirect=/play/{CODE}`

2. **Teacher Dashboard**
   - Creating game sessions
   - Managing questions
   - Viewing reports
   - All teacher features require authentication

3. **Profile Settings**
   - Viewing/editing profile
   - Changing password
   - Managing preferences

### Features That Work Without Login

1. **Solo Practice Mode**
   - Non-authenticated users can play
   - Scores are shown but not saved
   - No personal best tracking for guests
   - Full game functionality available

2. **Public Pages**
   - Home page
   - About page
   - Browse categories (now fixed)

## How Authentication Works

### For Students Joining Live Games

1. Student enters game code
2. Student clicks "Join Game"
3. System checks if user is authenticated
4. If NOT authenticated:
   - Returns 401 Unauthorized
   - Frontend redirects to `/login?redirect=/play/{CODE}`
   - After login, user is redirected back to game
5. If authenticated:
   - User joins the game session
   - SSE connection established
   - User sees lobby

### For Solo Practice

1. User selects game mode
2. User selects categories (no auth required)
3. User starts game
4. If authenticated:
   - Scores are saved to database
   - Personal best is tracked
   - Game history is recorded
5. If NOT authenticated:
   - Game works normally
   - Scores shown but not saved
   - No history tracking

## Fixing 401 Errors

### Issue: Students getting 401 when joining games

**Cause**: Student is not logged in

**Solution**: 
1. Student needs to log in first
2. Or create an account if they don't have one
3. The app automatically redirects to login page
4. After login, student is redirected back to the game

**Code Implementation**:
```typescript
if (res.status === 401) {
  // Not logged in - redirect to login with return URL
  router.push(`/login?redirect=/play/${code}`);
  return;
}
```

### Issue: Solo practice showing 401 for categories

**Cause**: Categories API required authentication

**Solution**: ✅ FIXED - Categories API now allows non-authenticated users

**Before**:
```typescript
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ...
}
```

**After**:
```typescript
export async function GET() {
  // Allow both authenticated and non-authenticated users
  const rows = await db.select()...
  return NextResponse.json({ categories: rows });
}
```

## Testing Authentication

### Test Live Game Join (Requires Auth)

1. **Without Login**:
   ```
   1. Open incognito/private window
   2. Go to /play/{GAME_CODE}
   3. Should redirect to /login?redirect=/play/{GAME_CODE}
   4. Login
   5. Should redirect back to game
   6. Should join successfully
   ```

2. **With Login**:
   ```
   1. Login first
   2. Go to /play/{GAME_CODE}
   3. Should join immediately
   4. Should see lobby
   ```

### Test Solo Practice (No Auth Required)

1. **Without Login**:
   ```
   1. Open incognito/private window
   2. Go to /play/solo
   3. Should see game modes
   4. Should see categories
   5. Should be able to start game
   6. Should be able to play
   7. Scores shown but not saved
   ```

2. **With Login**:
   ```
   1. Login first
   2. Go to /play/solo
   3. Should see game modes
   4. Should see categories
   5. Should be able to start game
   6. Should be able to play
   7. Scores saved to database
   8. Personal best tracked
   ```

## API Endpoints Authentication Matrix

| Endpoint | Auth Required | Purpose |
|----------|---------------|---------|
| `GET /api/game/categories` | ❌ No | Get categories for solo practice |
| `POST /api/game/solo` | ❌ No | Start solo game (works for both) |
| `POST /api/game/solo/complete` | ❌ No | Complete solo game (saves if authenticated) |
| `POST /api/game/sessions/[code]/join` | ✅ Yes | Join live game session |
| `GET /api/game/sessions/[code]/events` | ❌ No | SSE connection (validates after join) |
| `POST /api/game/sessions/[code]/answer` | ✅ Yes | Submit answer in live game |
| `POST /api/game/sessions/[code]/control` | ✅ Yes | Teacher controls (start/pause/end) |

## Common Issues and Solutions

### Issue: "Unauthorized" error in console

**Check**:
1. Is the feature supposed to require authentication?
2. Is the user logged in?
3. Is the session cookie present?

**Debug**:
```javascript
// In browser console
document.cookie // Check if session cookie exists
```

### Issue: Redirect loop to login

**Cause**: Session cookie not being set properly

**Solution**:
1. Check if cookies are enabled
2. Check if HTTPS is being used (required for secure cookies)
3. Check cookie domain settings

### Issue: 401 after some time

**Cause**: Session expired

**Solution**:
1. Implement session refresh
2. Or redirect to login
3. Current implementation: Redirects to login

## Best Practices

1. **Always handle 401 errors**:
   ```typescript
   if (res.status === 401) {
     router.push(`/login?redirect=${currentPath}`);
     return;
   }
   ```

2. **Show appropriate messages**:
   - "Please log in to join this game"
   - "Login to save your scores"
   - "Continue as guest" option for solo practice

3. **Preserve user intent**:
   - Use redirect parameter to return to original page
   - Save game code in URL for easy return

4. **Test both scenarios**:
   - Always test with and without authentication
   - Use incognito mode for testing non-authenticated flow

## Summary

- ✅ Live games require authentication (students must log in)
- ✅ Solo practice works without authentication
- ✅ Categories API now works for everyone
- ✅ Proper redirects in place for authentication
- ✅ Clear error messages for users
