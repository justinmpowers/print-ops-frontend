import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component for the 3D Print Shop Manager application.
 * Provides routing outlet for all application views.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent {
}
