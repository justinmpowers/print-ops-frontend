import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from 'environments/environment';

const AUTH_EXEMPT_PATHS = ['/auth/login', '/auth/callback', '/auth/refresh'];

/**
 * Attaches the access token to API requests and, on a 401, renews the session once and retries.
 * Only a refresh the server actually rejects sends you to the login page; if the server can't be
 * reached the request just fails and the session is kept for the next try.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isExempt = AUTH_EXEMPT_PATHS.some(path => req.url.includes(path));

  const token = authService.getToken();
  const authorizedReq = (isApiRequest && !isExempt && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !isApiRequest || isExempt) {
        return throwError(() => error);
      }

      // If the session was renewed while this request was in flight (by another request or tab),
      // retry with that token instead of spending the refresh token again.
      const current = authService.getToken();
      const renewed$ = current && current !== token ? of(current) : authService.refreshAccessToken();

      return renewed$.pipe(
        switchMap(newToken => {
          if (!newToken) {
            router.navigate(['/login']);
            return throwError(() => error);
          }
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
        })
      );
    })
  );
};
