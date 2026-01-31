import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { handleErrorInterceptor } from './core/interceptors/handle-error-interceptor';
import { GlobalErrorHandler } from './core/handlers/global-error-handler';
import { ConsoleCaptureService } from './core/services/console-capture.service';

export function initConsoleCapture(consoleCapture: ConsoleCaptureService) {
  return () => consoleCapture.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([handleErrorInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: initConsoleCapture,
      deps: [ConsoleCaptureService],
      multi: true,
    }
  ]
};
