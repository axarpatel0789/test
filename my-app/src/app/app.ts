import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalAlert } from './core/components/global-alert/global-alert';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalAlert],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('my-app');
}
