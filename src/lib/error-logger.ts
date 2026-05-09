/**
 * Client-side error logging utility
 * Captures and logs errors for debugging
 */

export interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  type: 'error' | 'unhandledRejection' | 'react';
  componentStack?: string;
  additionalInfo?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalHandlers();
    }
  }

  private setupGlobalHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        additionalInfo: {
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandledRejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    });
  }

  logError(error: ErrorLog) {
    this.logs.push(error);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console for debugging
    console.error('🔴 Error logged:', error);

    // Store in localStorage for persistence
    try {
      localStorage.setItem('error_logs', JSON.stringify(this.logs.slice(-20)));
    } catch (e) {
      // Ignore localStorage errors
    }

    // Send to server (optional - you can enable this)
    this.sendToServer(error);
  }

  private async sendToServer(error: ErrorLog) {
    try {
      // Only send in production
      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (e) {
      // Silently fail - don't want error logging to cause more errors
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('error_logs');
    } catch (e) {
      // Ignore
    }
  }

  downloadLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Helper function to manually log errors
export function logError(
  message: string,
  error?: Error,
  additionalInfo?: Record<string, any>
) {
  errorLogger.logError({
    type: 'error',
    message,
    stack: error?.stack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    additionalInfo,
  });
}
