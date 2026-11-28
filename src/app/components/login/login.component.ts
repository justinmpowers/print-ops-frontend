import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loading = false;
    loggedOutForInactivity = false;
    keepSignedIn = true;

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loggedOutForInactivity = this.route.snapshot.queryParamMap.get('reason') === 'idle';
        this.keepSignedIn = this.authService.keepSignedInPreference();
    }

    loginWithEtsy(): void {
        this.loading = true;
        this.authService.setKeepSignedInPreference(this.keepSignedIn);
        this.authService.getLoginUrl().subscribe({
            next: (response) => {
                if (!this.authService.startEtsyLogin(response, this.keepSignedIn)) {
                    this.loading = false;
                }
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
