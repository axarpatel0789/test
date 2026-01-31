import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  // Change this to your real logging endpoint
  private readonly endpoint = '/api/logs';
  private readonly TIMEOUT_MS = 5000;
  private readonly RATE_LIMIT_MS = 1000;
  private lastLogTime = 0;
  private logQueue: unknown[] = [];
  private isProcessing = false;
  private loggedErrors = new Set<string>();
  private readonly MAX_STORED_ERRORS = 100;
  private errorLogs: unknown[] = [];

  constructor(private http: HttpClient) {
    this.loadErrorLogs();
  }

  sendLog(payload: unknown) {
    try {
      // Skip logging if it's from the logging service itself
      if ((payload as any)?.source === 'logging-service') {
        return;
      }

      // Deduplicate: Don't log the same error multiple times
      const errorKey = this.getErrorKey(payload);
      if (this.loggedErrors.has(errorKey)) {
        return;
      }

      // Store error key to prevent duplicates
      this.loggedErrors.add(errorKey);
      if (this.loggedErrors.size > this.MAX_STORED_ERRORS) {
        // Clear old entries if we have too many
        const iter = this.loggedErrors.values().next();
        const firstKey = iter.value;
        if (firstKey !== undefined) {
          this.loggedErrors.delete(firstKey);
        }
      }

      // Store error log locally in memory
      this.errorLogs.push(payload);

      const now = Date.now();
      
      // Rate limiting: wait at least 1 second between log requests
      if (now - this.lastLogTime < this.RATE_LIMIT_MS) {
        // Queue the log instead of sending immediately
        this.logQueue.push(payload);
        return;
      }

      this.lastLogTime = now;
      this.sendLogRequest(payload);
      this.processQueue();
    } catch (err) {
      // Silent fail
    }
  }

  // Get all logged errors
  getErrorLogs(): unknown[] {
    return this.errorLogs;
  }

  // Export errors as JSON
  exportErrorsAsJson(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }

  // Save errors to local storage
  private loadErrorLogs(): void {
    try {
      const stored = localStorage.getItem('app-error-logs');
      if (stored) {
        this.errorLogs = JSON.parse(stored);
      }
    } catch (e) {
      // Ignore parsing errors
      this.errorLogs = [];
    }
  }

  // Persist errors to local storage whenever they occur
  private persistErrorLogs(): void {
    try {
      localStorage.setItem('app-error-logs', JSON.stringify(this.errorLogs));
    } catch (e) {
      // Silently fail if localStorage is full or unavailable
    }
  }

  private getErrorKey(payload: unknown): string {
    const p = payload as any;
    // Create unique key from source, message, and URL to deduplicate same errors
    return `${p?.source}-${p?.message}-${p?.request?.url}`;
  }

  private sendLogRequest(payload: unknown) {
    // Fire-and-forget with timeout, NO RETRY
    this.http.post(this.endpoint, payload).pipe(
      timeout(this.TIMEOUT_MS)
    ).subscribe({
      next: () => {
        this.persistErrorLogs();
        this.processQueue();
      },
      error: (err) => {
        // Silent fail - don't retry or log
        this.persistErrorLogs();
        this.processQueue();
      },
    });
  }

  private processQueue() {
    if (this.isProcessing || this.logQueue.length === 0) return;
    
    this.isProcessing = true;
    setTimeout(() => {
      const payload = this.logQueue.shift();
      if (payload) {
        this.lastLogTime = Date.now();
        this.sendLogRequest(payload);
      }
      this.isProcessing = false;
    }, this.RATE_LIMIT_MS);
  }

  serializeError(error: unknown) {
    if (!error) return null;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'object') {
      const out: any = {};
      try {
        // copy enumerable and non-enumerable props
        Object.getOwnPropertyNames(error).forEach((k) => {
          try { out[k] = (error as any)[k]; } catch (e) { out[k] = String(e); }
        });
      } catch (e) {
        return { serializationError: String(e) };
      }
      return out;
    }

    return String(error);
  }
}
