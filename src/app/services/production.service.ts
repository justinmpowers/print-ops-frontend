import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PrintSession } from 'models/types';
import { AuthService } from 'services/auth.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    // Reuse the centralized auth header builder to keep token handling consistent
    return this.authService.getAuthHeaders().set('Content-Type', 'application/json');
  }

  // Queue Management
  getProductionQueue(): Observable<{ orders: Order[], total: number }> {
    return this.http.get<{ orders: Order[], total: number }>(
      `${this.apiUrl}/production/queue`,
      { headers: this.getHeaders() }
    );
  }

  updateProductionStatus(orderId: number, status: string, notes?: string): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/orders/${orderId}/production-status`,
      { production_status: status, print_notes: notes },
      { headers: this.getHeaders() }
    );
  }

  updatePriority(orderId: number, priority: number): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/orders/${orderId}/priority`,
      { priority },
      { headers: this.getHeaders() }
    );
  }

  updatePrintTime(orderId: number, estimatedTime: number): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/orders/${orderId}/print-time`,
      { estimated_print_time: estimatedTime },
      { headers: this.getHeaders() }
    );
  }

  // Print Sessions
  getPrintSessions(): Observable<{ sessions: PrintSession[], total: number }> {
    return this.http.get<{ sessions: PrintSession[], total: number }>(
      `${this.apiUrl}/print-sessions`,
      { headers: this.getHeaders() }
    );
  }

  createPrintSession(name: string, orderIds: number[], notes?: string): Observable<PrintSession> {
    return this.http.post<PrintSession>(
      `${this.apiUrl}/print-sessions`,
      { name, order_ids: orderIds, notes },
      { headers: this.getHeaders() }
    );
  }

  getPrintSession(sessionId: number): Observable<PrintSession> {
    return this.http.get<PrintSession>(
      `${this.apiUrl}/print-sessions/${sessionId}`,
      { headers: this.getHeaders() }
    );
  }

  updatePrintSession(
    sessionId: number,
    updates: { name?: string; status?: string; notes?: string; order_ids?: number[] }
  ): Observable<PrintSession> {
    return this.http.put<PrintSession>(
      `${this.apiUrl}/print-sessions/${sessionId}`,
      updates,
      { headers: this.getHeaders() }
    );
  }

  deletePrintSession(sessionId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/print-sessions/${sessionId}`,
      { headers: this.getHeaders() }
    );
  }
}
