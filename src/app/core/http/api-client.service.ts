import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * The single HTTP client of the whole system.
 *
 * Every domain portal imports it as `shell/apiClient` via Native Federation.
 * The portal MUST NOT create its own (norm 5.4.1).
 */
@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`);
  }

  getWithParams<T>(path: string, params: Record<string, string | number>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params });
  }

  post<T>(path: string, body: unknown, idempotencyKey: string): Observable<T> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { headers });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}