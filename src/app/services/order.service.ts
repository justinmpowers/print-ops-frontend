import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  syncOrders(): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/sync`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOrders(status?: string): Observable<{ orders: Order[]; total: number }> {
    let url = `${this.apiUrl}/orders`;
    if (status) {
      url += `?status=${status}`;
    }

    return this.http.get<{ orders: Order[]; total: number }>(url, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
