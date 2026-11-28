import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { IdleService } from './services/idle.service';

/**
 * Root component for the 3D Print Shop Manager application.
 * Provides routing outlet for all application views.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: []
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private idleService: IdleService
  ) {}

  ngOnInit(): void {
    // Idle-based auto-logout only matters while a session exists, and is skipped for
    // sessions started with "Keep me signed in".
    this.authService.token$.subscribe(token => {
      if (token && !this.authService.isKeepSignedIn()) {
        this.idleService.start();
      } else {
        this.idleService.stop();
      }
    });
  }
}
