import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { LoggingService } from '../services/logging.service';

export const handleErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const logging = inject(LoggingService);

  // Skip logging for logging service itself
  if (req.url.includes('/api/logs')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: any) => {
      try {
        // Only log actual errors, not all requests
        const payload = {
          level: 'error',
          source: 'http',
          message: (error && (error as any).message) || null,
          error: logging.serializeError(error),
          request: {
            url: (req as any).urlWithParams ?? req.url,
            method: req.method,
          },
          time: new Date().toISOString(),
        };

        // Send error to backend (best-effort)
        logging.sendLog(payload);
      } catch (e) {
        // silently fail to avoid blocking
      }

      // rethrow so callers/consumers can still handle it if they want
      return throwError(() => error);
    })
  );
};
