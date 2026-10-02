import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface DeviceKey {
  id: number;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string | null;
}

/** Only returned when a key is created; the raw key cannot be fetched again. */
export interface CreatedDeviceKey extends DeviceKey {
  key: string;
}

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<{ devices: DeviceKey[]; total: number }> {
    return this.http.get<{ devices: DeviceKey[]; total: number }>(`${this.apiUrl}/devices`);
  }

  create(name: string): Observable<CreatedDeviceKey> {
    return this.http.post<CreatedDeviceKey>(`${this.apiUrl}/devices`, { name });
  }

  revoke(id: number): Observable<DeviceKey> {
    return this.http.delete<DeviceKey>(`${this.apiUrl}/devices/${id}`);
  }
}
