import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const handleErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: any) => {
      // Human-readable messages
      let message = 'An unexpected error occurred.';

      if (!error) {
        message = 'Unknown error.';
      } else if (error.status === 0) {
        // client-side or network error
        message = 'Network error: please check your internet connection.';
      } else if (error.error && typeof error.error === 'object' && error.error.message) {
        message = error.error.message;
      } else if (error.message) {
        message = error.message;
      } else if (error.statusText) {
        message = error.statusText;
      }

      // log the error to console instead of displaying a global alert
      console.error('HTTP Error intercepted:', error);
      console.error('User message:', message);

      // rethrow so callers/consumers can still handle it if they want
      return throwError(() => error);
    })
  );
};
