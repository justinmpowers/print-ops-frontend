import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loading = false;
    loggedOutForInactivity = false;

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loggedOutForInactivity = this.route.snapshot.queryParamMap.get('reason') === 'idle';
    }

    loginWithEtsy(): void {
        this.loading = true;
        this.authService.getLoginUrl().subscribe({
            next: (response) => {
                if (!this.authService.startEtsyLogin(response)) {
                    this.loading = false;
                }
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
