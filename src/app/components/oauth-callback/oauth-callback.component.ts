import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <h2>{{ message }}</h2>
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .callback-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      text-align: center;
    }

    h2 {
      color: #333;
      margin-bottom: 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  message = 'Processing your login...';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      
      if (code) {
        // Retrieve code_verifier from sessionStorage
        const code_verifier = sessionStorage.getItem('oauth_code_verifier');
        if (!code_verifier) {
          console.error('No code_verifier found in sessionStorage');
          this.message = 'Login failed. Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          return;
        }
        
        this.authService.handleCallback(code, code_verifier).subscribe(
          () => {
            this.message = 'Login successful! Redirecting...';
            // Clean up sessionStorage
            sessionStorage.removeItem('oauth_code_verifier');
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          },
          (error) => {
            console.error('OAuth callback error:', error);
            this.message = 'Login failed. Redirecting...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        );
      } else {
        this.message = 'No authorization code. Redirecting...';
        this.router.navigate(['/login']);
      }
    });
  }
}
