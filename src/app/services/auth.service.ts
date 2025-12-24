import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/types';
import { environment } from 'environments/environment';

/**
 * Service for managing user authentication with Etsy OAuth.
 * Handles login, token management, and user information retrieval.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  private userSubject = new BehaviorSubject<User | null>(null);

  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user if token exists
    if (this.getToken()) {
      this.getUserInfo().subscribe();
    }
  }

  getLoginUrl(): Observable<{ auth_url: string; code_verifier: string }> {
    return this.http.get<{ auth_url: string; code_verifier: string }>(`${this.apiUrl}/auth/login`);
  }

  handleCallback(code: string, code_verifier: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/auth/callback`, { code, code_verifier })
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.userSubject.next(response.user);
        })
      );
  }

  getUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/user`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.clearToken();
        this.userSubject.next(null);
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

  clearToken(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
