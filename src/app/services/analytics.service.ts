import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { environment } from 'environments/environment';

export interface AnalyticsSummary {
  total_orders: number;
  total_revenue: number;
  total_filament_cost: number;
  total_profit: number;
  profit_margin: number;
  avg_order_value: number;
  orders_by_status: { [key: string]: number };
  recent_orders_count: number;
  recent_revenue: number;
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  orders: number;
  profit: number;
  filament_cost: number;
}

export interface RevenueTrends {
  period: 'daily' | 'weekly' | 'monthly';
  trends: RevenueTrend[];
}

export interface ProductPerformance {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
  avg_price: number;
}

export interface ProductPerformanceResponse {
  products: ProductPerformance[];
  total_products: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.apiUrl}/analytics/summary`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getRevenueTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Observable<RevenueTrends> {
    return this.http.get<RevenueTrends>(`${this.apiUrl}/analytics/revenue-trends?period=${period}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getProductPerformance(): Observable<ProductPerformanceResponse> {
    return this.http.get<ProductPerformanceResponse>(`${this.apiUrl}/analytics/product-performance`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
