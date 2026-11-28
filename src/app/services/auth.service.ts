import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, defer, firstValueFrom, of } from 'rxjs';
import { tap, catchError, finalize, shareReplay } from 'rxjs/operators';
import { User } from '../models/types';
import { environment } from 'environments/environment';

/** Host of Etsy's OAuth page (the backend builds https://www.etsy.com/oauth/connect?...). */
const ETSY_OAUTH_HOST = 'www.etsy.com';

/** Set while the current session was started with "Keep me signed in" (no idle logout, long-lived). */
const KEEP_SIGNED_IN_KEY = 'keep_signed_in';
/** The login page checkbox's last state, so it's ticked the way you left it. Survives logout. */
const KEEP_SIGNED_IN_PREF_KEY = 'login_keep_signed_in';
/** Carries the checkbox across the round trip to Etsy's login page (same tab, like the PKCE verifier). */
const OAUTH_REMEMBER_KEY = 'oauth_remember_me';
/** Where to go once logged in, e.g. the spool page a QR label opened before you were signed in. */
const RETURN_URL_KEY = 'post_login_redirect';
/** Web Locks name that makes tabs take turns refreshing, so two never spend the same refresh token. */
const REFRESH_LOCK = 'printops-token-refresh';

/** An in-app path to return to after login: a single leading slash, nothing that could leave the site. */
function isSafeReturnUrl(url: string | null): url is string {
  return !!url && /^\/(?![\/\\])[A-Za-z0-9\-._~\/?=&%]*$/.test(url)
    && !url.startsWith('/login') && !url.startsWith('/oauth-callback');
}

/**
 * Service for managing user authentication with Etsy OAuth.
 * Handles login, access/refresh token management, and user information retrieval.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  private userSubject = new BehaviorSubject<User | null>(null);
  private refreshInFlight$: Observable<string | null> | null = null;

  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Deferred to a microtask: authInterceptor injects AuthService, so firing
    // this HTTP call synchronously during construction causes Angular to see
    // a circular dependency (this provider hasn't finished instantiating yet).
    if (this.getToken()) {
      queueMicrotask(() => this.getUserInfo().subscribe());
    }
  }

  getLoginUrl(): Observable<{ auth_url: string; code_verifier: string }> {
    return this.http.get<{ auth_url: string; code_verifier: string }>(`${this.apiUrl}/auth/login`);
  }

  /**
   * Send the browser to Etsy's OAuth page. Only Etsy's own https URL is accepted, so a bad or
   * tampered login response can't redirect the user (and their PKCE verifier) somewhere else.
   * Returns false, without navigating, if the response isn't a usable Etsy login URL.
   *
   * `keepSignedIn` defaults to the current session's choice (reconnecting Etsy keeps it), or the
   * login checkbox's last state when there's no session.
   */
  startEtsyLogin(
    response: { auth_url?: string; code_verifier?: string },
    keepSignedIn: boolean = this.getToken() ? this.isKeepSignedIn() : this.keepSignedInPreference()
  ): boolean {
    if (!response?.auth_url || !response.code_verifier) return false;
    let url: URL;
    try {
      url = new URL(response.auth_url);
    } catch {
      return false;
    }
    if (url.protocol !== 'https:' || url.hostname !== ETSY_OAUTH_HOST) return false;
    sessionStorage.setItem('oauth_code_verifier', response.code_verifier);
    sessionStorage.setItem(OAUTH_REMEMBER_KEY, keepSignedIn ? '1' : '0');
    window.location.assign(url.href);
    return true;
  }

  handleCallback(code: string, code_verifier: string): Observable<{ token: string; user: User }> {
    const remember_me = sessionStorage.getItem(OAUTH_REMEMBER_KEY) === '1';
    return this.http.post<{ token: string; refresh_token: string; remember_me?: boolean; user: User }>(
      `${this.apiUrl}/auth/callback`, { code, code_verifier, remember_me })
      .pipe(
        tap(response => {
          sessionStorage.removeItem(OAUTH_REMEMBER_KEY);
          // Before setToken: the app decides on idle logout as soon as the token arrives.
          if (response.remember_me) {
            localStorage.setItem(KEEP_SIGNED_IN_KEY, '1');
          } else {
            localStorage.removeItem(KEEP_SIGNED_IN_KEY);
          }
          this.setRefreshToken(response.refresh_token);
          this.setToken(response.token);
          this.userSubject.next(response.user);
        })
      );
  }

  getUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/user`).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  /**
   * Exchange the stored refresh token for a new access/refresh pair. Used by the auth interceptor on 401.
   *
   * Refresh tokens are single-use, so concurrent callers share one request, and tabs take turns
   * through a Web Lock. Emits the new access token, or null when the session is over and the user
   * has to log in again. Errors, leaving the session in place, when the server can't be reached:
   * a deploy or a network blip shouldn't log anyone out.
   */
  refreshAccessToken(): Observable<string | null> {
    if (!this.refreshInFlight$) {
      const tokenBeingReplaced = this.getToken();
      this.refreshInFlight$ = defer(() => this.withRefreshLock(() => this.refreshOnce(tokenBeingReplaced))).pipe(
        finalize(() => { this.refreshInFlight$ = null; }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.refreshInFlight$;
  }

  private async refreshOnce(tokenBeingReplaced: string | null): Promise<string | null> {
    // Another tab may have renewed the session while this one waited for the lock.
    const current = this.getToken();
    if (current && current !== tokenBeingReplaced) return current;

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const response = await firstValueFrom(this.http.post<{ token: string; refresh_token: string }>(
        `${this.apiUrl}/auth/refresh`, { refresh_token: refreshToken }));
      this.setRefreshToken(response.refresh_token);
      this.setToken(response.token);
      return response.token;
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 400 || error.status === 401)) {
        // Rejected. Without Web Locks another tab can rotate the token at the same moment;
        // if it did, its new pair is already stored, so use that rather than logging out.
        if (this.getRefreshToken() !== refreshToken) return this.getToken();
        this.clearToken();
        this.userSubject.next(null);
        return null;
      }
      throw error;
    }
  }

  /** Run a refresh while holding a cross-tab lock. Web Locks need https; elsewhere, just run it. */
  private withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
    const locks: LockManager | undefined = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    // request() resolves with whatever the callback's promise resolves to; its typing nests the promise.
    return locks ? locks.request(REFRESH_LOCK, task) as unknown as Promise<T> : task();
  }

  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.apiUrl}/auth/logout`, { refresh_token: refreshToken }).pipe(
      tap(() => {
        this.clearToken();
        this.userSubject.next(null);
      }),
      catchError(() => {
        // Still clear local state even if the revoke call fails (e.g. token already expired)
        this.clearToken();
        this.userSubject.next(null);
        return of(null);
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(KEEP_SIGNED_IN_KEY);
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** True when this session was started with "Keep me signed in". */
  isKeepSignedIn(): boolean {
    return localStorage.getItem(KEEP_SIGNED_IN_KEY) === '1';
  }

  /** How the login page's "Keep me signed in" box starts out: as last left, ticked the first time. */
  keepSignedInPreference(): boolean {
    return localStorage.getItem(KEEP_SIGNED_IN_PREF_KEY) !== '0';
  }

  setKeepSignedInPreference(keep: boolean): void {
    localStorage.setItem(KEEP_SIGNED_IN_PREF_KEY, keep ? '1' : '0');
  }

  /** Remember a page to open after logging in (only in-app paths are kept). */
  rememberReturnUrl(url: string): void {
    if (isSafeReturnUrl(url)) sessionStorage.setItem(RETURN_URL_KEY, url);
  }

  /** The page to open now that login finished, defaulting to the dashboard. Forgets it afterwards. */
  takeReturnUrl(): string {
    const url = sessionStorage.getItem(RETURN_URL_KEY);
    sessionStorage.removeItem(RETURN_URL_KEY);
    return isSafeReturnUrl(url) ? url : '/dashboard';
  }

  /** Seconds until the current access token expires, or null if there's no valid token. */
  getTokenExpirySeconds(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return null;
      return payload.exp - Math.floor(Date.now() / 1000);
    } catch {
      return null;
    }
  }

  /** @deprecated Authorization headers are now attached centrally by authInterceptor. */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
