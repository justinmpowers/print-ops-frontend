import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    loading = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    loginWithEtsy(): void {
        this.loading = true;
        this.authService.getLoginUrl().subscribe(
            (response) => {
                if (response.auth_url && response.code_verifier) {
                    // Store code_verifier in sessionStorage for later use
                    sessionStorage.setItem('oauth_code_verifier', response.code_verifier);
                    window.location.href = response.auth_url;
                } else {
                    this.loading = false;
                }
            },
            (error) => {
                this.loading = false;
            }
        );
    }
}
