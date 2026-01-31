import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { LoggingService } from '../../core/services/logging.service';
import { ErrorStorageService } from '../../core/services/error-storage.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
})
export class UserList implements OnInit {
  users: any[] = [];
  errorLogs: any[] = [];
  testMode = false;
  errorStats: { total: number; lastUpdated: string } = { total: 0, lastUpdated: 'Unknown' };

  constructor(
    private userService: UserService,
    private loggingService: LoggingService,
    private errorStorage: ErrorStorageService
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadErrorStats();
    this.loadErrorsFromJsonFile();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.refreshErrorLogs();
      },
      error: (err) => {
        console.error(err);
        this.refreshErrorLogs();
      }
    });
  }

  // Load error statistics from JSON file
  loadErrorStats() {
    this.errorStorage.getErrorStats().subscribe({
      next: (stats) => {
        this.errorStats = stats;
      },
      error: () => {
        this.errorStats = { total: 0, lastUpdated: 'Unknown' };
      }
    });
  }

  // Load errors from the errors.json file
  loadErrorsFromJsonFile() {
    this.errorStorage.loadErrors().subscribe({
      next: (errors) => {
        console.log('Loaded errors from JSON file:', errors);
      },
      error: (err) => {
        console.warn('Could not load errors from JSON file:', err);
      }
    });
  }

  // Trigger a test error
  triggerError() {
    this.testMode = true;
    this.userService.getUsers(true).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Test error triggered:', err);
        this.refreshErrorLogs();
        this.loadErrorStats();
      }
    });
  }

  // Trigger a frontend JavaScript error (not API related)
  triggerFrontendError() {
    try {
      // Simulate a frontend error - accessing undefined property
      const data: any = null;
      const value = data.someProperty.nestedValue; // This will throw TypeError
    } catch (error) {
      // Rethrow to let GlobalErrorHandler catch it
      throw error;
    }
  }

  // Trigger a calculation error
  triggerCalculationError() {
    const arr: any[] = [];
    const sum = arr.reduce((acc, val) => acc + val, 0); // TypeError: arr is undefined
  }

  // Trigger a logic error
  triggerLogicError() {
    throw new Error('Frontend Logic Error: Invalid user data detected');
  }

  // Refresh error logs from localStorage
  refreshErrorLogs() {
    this.errorLogs = this.loggingService.getErrorLogs();
    this.loadErrorStats();
  }

  // Export errors as JSON file
  downloadErrorsAsJson() {
    const json = this.loggingService.exportErrorsAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Clear error logs
  clearErrorLogs() {
    localStorage.removeItem('app-error-logs');
    this.errorLogs = [];
  }
}
