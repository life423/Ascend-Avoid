/**
 * Error handling and reporting utilities
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  line?: number;
  column?: number;
}

/**
 * Sets up global error handling
 */
export function setupErrorHandling(): void {
  // Global error handler
  window.addEventListener('error', (event) => {
    const errorInfo: ErrorInfo = {
      message: event.message,
      stack: event.error?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: event.filename || window.location.href,
      line: event.lineno,
      column: event.colno
    };

    logError('JavaScript Error', errorInfo);
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo: ErrorInfo = {
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    logError('Promise Rejection', errorInfo);
  });
}

/**
 * Logs error information
 */
function logError(type: string, errorInfo: ErrorInfo): void {
  console.error(`[${type}]`, errorInfo);

  // In development, show more detailed error information
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${type} Details`);
    console.error('Message:', errorInfo.message);
    console.error('Stack:', errorInfo.stack);
    console.error('Location:', `${errorInfo.url}:${errorInfo.line}:${errorInfo.column}`);
    console.error('User Agent:', errorInfo.userAgent);
    console.error('Timestamp:', new Date(errorInfo.timestamp).toISOString());
    console.groupEnd();
  }

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // sendToErrorReportingService(errorInfo);
  }
}

/**
 * Manually report an error
 */
export function reportError(error: Error, context?: string): void {
  const errorInfo: ErrorInfo = {
    message: context ? `${context}: ${error.message}` : error.message,
    stack: error.stack,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  logError('Manual Error Report', errorInfo);
}

/**
 * Wraps a function to catch and report errors
 */
export function wrapWithErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.catch === 'function') {
        return result.catch((error: Error) => {
          reportError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      reportError(error as Error, context);
      throw error;
    }
  }) as T;
}

/**
 * Wraps an async function to catch and report errors
 */
export function wrapAsyncWithErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      reportError(error as Error, context);
      throw error;
    }
  }) as T;
}
