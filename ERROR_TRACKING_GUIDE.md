# Error Tracking & Debugging Guide

## Overview
This project now includes a comprehensive error tracking system to help catch and debug errors in production and development.

## Features

### 1. Automatic Error Capture
- **Global Error Handler**: Catches all unhandled JavaScript errors
- **Promise Rejection Handler**: Catches unhandled promise rejections
- **React Error Boundaries**: Catches React component errors
- **Automatic Logging**: All errors are logged with stack traces and context

### 2. Error Debug Panel (Development Only)
A floating red button appears in the bottom-right corner during development:
- Click to open the error debug panel
- View all captured errors with timestamps
- See stack traces and additional context
- Download error logs as JSON
- Clear error logs

### 3. Error Logging to Server
Errors are automatically sent to `/api/log-error` endpoint where they are:
- Logged to server console
- Can be saved to database (optional)
- Can be sent to external monitoring services (optional)

## How to Use

### During Development

1. **Open the Error Debug Panel**
   - Look for the red circular button with an alert icon in the bottom-right corner
   - Click it to open the debug panel
   - The badge shows the number of errors captured

2. **View Error Details**
   - Each error shows:
     - Error type (error, unhandledRejection, react)
     - Timestamp
     - Error message
     - URL where error occurred
     - Stack trace (expandable)
     - Additional context (expandable)

3. **Download Logs**
   - Click the download icon to save all errors as JSON
   - Share with team members for debugging

4. **Clear Logs**
   - Click the trash icon to clear all logged errors

### Manual Error Logging

You can manually log errors in your code:

```typescript
import { logError } from "@/lib/error-logger";

// Simple error logging
logError("Something went wrong", error);

// With additional context
logError("Failed to submit answer", error, {
  questionId: 123,
  userId: 456,
  sessionCode: "ABC123"
});
```

### In Production

The error debug panel is hidden in production, but errors are still:
- Logged to browser console
- Sent to server endpoint
- Stored in localStorage (last 20 errors)

## Browser Console Commands

Open browser DevTools console and use:

```javascript
// View all logged errors
errorLogger.getLogs()

// Download error logs
errorLogger.downloadLogs()

// Clear error logs
errorLogger.clearLogs()
```

## Chrome Extension for Error Tracking

If you want to use Chrome extensions for error tracking, here are recommended options:

### 1. **Sentry Browser Extension**
- Install from Chrome Web Store
- Provides real-time error tracking
- Free tier available

### 2. **LogRocket**
- Session replay with error tracking
- See exactly what users did before error occurred

### 3. **Bugsnag**
- Automatic error reporting
- Error grouping and analysis

### 4. **Built-in Chrome DevTools**
- Press F12 to open DevTools
- Go to Console tab to see errors
- Go to Sources tab to debug with breakpoints
- Go to Network tab to see API failures

## Integration with External Services

To integrate with services like Sentry, add to `src/lib/error-logger.ts`:

```typescript
private async sendToServer(error: ErrorLog) {
  try {
    // Send to Sentry
    if (window.Sentry) {
      window.Sentry.captureException(new Error(error.message), {
        extra: error.additionalInfo,
      });
    }

    // Send to your API
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });
  } catch (e) {
    // Silently fail
  }
}
```

## Common Errors to Watch For

1. **"onClick is not a function"**
   - Usually means a callback prop is undefined
   - Check that callbacks are properly passed to components

2. **"Cannot read property of undefined"**
   - Data validation issue
   - Add null checks before accessing properties

3. **"Network request failed"**
   - API endpoint issues
   - Check server logs and network tab

4. **"Hydration mismatch"**
   - Server and client rendered different HTML
   - Check for browser-only code running on server

## Best Practices

1. **Always wrap risky code in try-catch**
2. **Use error boundaries for React components**
3. **Validate data before using it**
4. **Log errors with context for easier debugging**
5. **Test error scenarios during development**
6. **Monitor error logs regularly in production**

## Files Added

- `src/lib/error-logger.ts` - Error logging utility
- `src/components/ErrorDebugPanel.tsx` - Debug UI component
- `src/components/game/ErrorBoundary.tsx` - React error boundary
- `src/app/api/log-error/route.ts` - Server endpoint for error logging

## Support

If you encounter errors:
1. Check the Error Debug Panel
2. Download the error logs
3. Check browser console
4. Check server logs
5. Share error logs with the development team
