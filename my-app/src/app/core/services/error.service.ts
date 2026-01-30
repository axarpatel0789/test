import { Injectable, signal, Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private _message = signal<string | null>(null);
  readonly message = this._message as Signal<string | null>;

  show(message: string) {
    this._message.set(message);
    // auto-clear after a short delay
    setTimeout(() => this.clear(), 5000);
  }

  clear() {
    this._message.set(null);
  }
}
