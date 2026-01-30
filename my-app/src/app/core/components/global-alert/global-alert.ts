import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-global-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-alert.html',
  styleUrls: ['./global-alert.css']
})
export class GlobalAlert {
  private readonly errorService = inject(ErrorService);
  // this is a signal, use it in the template by calling it: message()
  readonly message = this.errorService.message;

  dismiss() {
    this.errorService.clear();
  }
}
