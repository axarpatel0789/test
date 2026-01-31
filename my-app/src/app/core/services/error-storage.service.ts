import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ErrorStorageService {
  // Prefer backend endpoints; fallback to static file if backend unavailable
  private readonly backendBase = 'http://localhost:3000';
  private readonly errorFileUrl = `${this.backendBase}/api/errors`;

  constructor(private http: HttpClient) {}

  // Load all errors from JSON file
  loadErrors(): Observable<any[]> {
    // Try backend first, fall back to bundled asset if backend unavailable
    return this.http.get<{ errors: any[]; lastUpdated: string; totalErrors: number }>(`${this.backendBase}/api/errors`).pipe(
      map(response => response.errors || []),
      catchError(() => {
        // fallback to static asset
        return this.http.get<{ errors: any[] }>(`/assets/errors.json`).pipe(
          map(r => r.errors || []),
          catchError(() => of([]))
        );
      })
    );
  }

  // Save error to JSON file (mock backend endpoint)
  saveError(error: any): Observable<any> {
    // In a real app, this would POST to your backend server
    // The backend would append the error to errors.json
    return this.http.post(`${this.backendBase}/api/errors`, error).pipe(
      catchError(() => {
        // If endpoint doesn't exist, just return success so app continues
        return of({ success: true });
      })
    );
  }

  // Save multiple errors
  saveErrors(errors: any[]): Observable<any> {
    return this.http.post(`${this.backendBase}/api/errors/batch`, { errors }).pipe(
      catchError(() => of({ success: true }))
    );
  }

  // Get error statistics
  getErrorStats(): Observable<{ total: number; lastUpdated: string }> {
    return this.http.get<{ totalErrors: number; lastUpdated: string }>(`${this.backendBase}/api/errors`).pipe(
      map(response => ({
        total: response.totalErrors || 0,
        lastUpdated: response.lastUpdated || 'Unknown'
      })),
      catchError(() => of({ total: 0, lastUpdated: 'Unknown' }))
    );
  }

  // Clear all errors (mock endpoint)
  clearErrors(): Observable<any> {
    return this.http.delete(`${this.backendBase}/api/errors`).pipe(
      catchError(() => of({ success: true }))
    );
  }
}
