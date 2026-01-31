import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(triggerError: boolean = false): Observable<any[]> {
    // Test scenario: trigger an error
    if (triggerError) {
      return throwError(() => new Error('Test API Error: Failed to load users from server'));
    }
    return this.http.get<any[]>('aa/assets/users.json');
  }
}