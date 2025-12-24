import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommunicationLog, Order, OrderNote } from 'models/types';
import { AuthService } from 'services/auth.service';
import { environment } from 'environments/environment';

/**
 * Service for managing Etsy orders and order-related operations.
 * Handles order synchronization, status updates, notes, and communications.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  syncOrders(): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/sync`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOrders(filters?: {
    status?: string;
    production_status?: string;
    start_date?: string;
    end_date?: string;
    product?: string;
    min_total?: number;
    max_total?: number;
  }): Observable<{ orders: Order[]; total: number }> {
    const params: string[] = [];
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.push(`${key}=${encodeURIComponent(String(value))}`);
        }
      });
    }
    const url = params.length ? `${this.apiUrl}/orders?${params.join('&')}` : `${this.apiUrl}/orders`;

    return this.http.get<{ orders: Order[], total: number }>(url, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  autoAssignFilament(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/${orderId}/auto-assign-filament`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  bulkActions(orderIds: number[], action: string, extra?: any): Observable<{ orders: Order[], total: number }> {
    return this.http.post<{ orders: Order[], total: number }>(
      `${this.apiUrl}/orders/bulk-actions`,
      { order_ids: orderIds, action, ...extra },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  listNotes(orderId: number): Observable<{ notes: OrderNote[]; total: number }> {
    return this.http.get<{ notes: OrderNote[]; total: number }>(
      `${this.apiUrl}/orders/${orderId}/notes`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  addNote(orderId: number, content: string): Observable<OrderNote> {
    return this.http.post<OrderNote>(
      `${this.apiUrl}/orders/${orderId}/notes`,
      { content },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  listCommunications(orderId: number): Observable<{ logs: CommunicationLog[]; total: number }> {
    return this.http.get<{ logs: CommunicationLog[]; total: number }>(
      `${this.apiUrl}/orders/${orderId}/communications`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  addCommunication(orderId: number, payload: { message: string; direction?: string; channel?: string }): Observable<CommunicationLog> {
    return this.http.post<CommunicationLog>(
      `${this.apiUrl}/orders/${orderId}/communications`,
      payload,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  uploadPhoto(orderId: number, file: File): Observable<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ photo_url: string }>(
      `${this.apiUrl}/orders/${orderId}/photo`,
      formData,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  updateShippingLabel(orderId: number, payload: { provider?: string; status?: string; label_url?: string; tracking_number?: string }): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/orders/${orderId}/shipping-label`,
      payload,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}
