import { Injectable } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class ConsoleCaptureService {
  private patched = false;

  constructor(private logging: LoggingService) {}

  init() {
    if (this.patched) return;
    this.patched = true;

    // Console capture disabled for performance
    // This was causing excessive HTTP requests on every console call
  }
}
