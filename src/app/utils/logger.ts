/**
 * Logging utility for the application
 * TODO: Replace with a proper logging service (e.g., Sentry, LogRocket)
 */

// Environment check - only log in development
const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log debug information (only in development)
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },

  /**
   * Log information (only in development)
   */
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, data);
    }
  },

  /**
   * Log warnings
   * TODO: Send to logging service in production
   */
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
    // TODO: Send to logging service
  },

  /**
   * Log errors
   * TODO: Send to logging service with context
   */
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // TODO: Send to Sentry or other error tracking service
    // TODO: Include user context, page, etc.
  },
};

export default logger;
