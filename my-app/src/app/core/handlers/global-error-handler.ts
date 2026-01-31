import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logging = inject(LoggingService);

  constructor() {
    // Listen for unhandled promise rejections and log them
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        try {
          console.error('Unhandled Promise Rejection:', event.reason);
          const payload = {
            level: 'error',
            source: 'unhandledrejection',
            message: (event.reason && (event.reason as any).message) || String(event.reason),
            error: this.logging.serializeError(event.reason),
            time: new Date().toISOString(),
            url: typeof location !== 'undefined' ? location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          };
          this.logging.sendLog(payload);
        } catch (e) {
          console.warn('[GlobalErrorHandler] failed to log unhandledrejection', e);
        }
      });
    }
  }

  handleError(error: unknown): void {
    try {
      // Only log if it's not already logged by interceptor (http errors)
      if (!(error instanceof Error && error.name === 'HttpErrorResponse')) {
        const payload = {
          level: 'error',
          source: 'frontend',
          message: (error && (error as any).message) || String(error),
          error: this.logging.serializeError(error),
          time: new Date().toISOString(),
        };

        // Best effort: don't block app flow
        this.logging.sendLog(payload);
      }
    } catch (e) {
      // silently fail
    }
  }
}
