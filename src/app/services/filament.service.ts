import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filament, FilamentUsage } from '../models/types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FilamentService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getFilaments(): Observable<{ filaments: Filament[]; total: number }> {
    return this.http.get<{ filaments: Filament[]; total: number }>(`${this.apiUrl}/filaments`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createFilament(filament: Partial<Filament>): Observable<Filament> {
    return this.http.post<Filament>(`${this.apiUrl}/filaments`, filament, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateFilament(filamentId: number, filament: Partial<Filament>): Observable<Filament> {
    return this.http.put<Filament>(`${this.apiUrl}/filaments/${filamentId}`, filament, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteFilament(filamentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/filaments/${filamentId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  recordUsage(usage: {
    filament_id: number;
    amount_used: number;
    order_id?: number;
    description?: string;
  }): Observable<{ usage: FilamentUsage; filament: Filament }> {
    return this.http.post<{ usage: FilamentUsage; filament: Filament }>(`${this.apiUrl}/filament-usage`, usage, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOrderFilamentUsage(orderId: number): Observable<{ usages: FilamentUsage[]; total_filament_used: number }> {
    return this.http.get<{ usages: FilamentUsage[]; total_filament_used: number }>(`${this.apiUrl}/filament-usage/order/${orderId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
