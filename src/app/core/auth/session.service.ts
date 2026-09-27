import { Injectable, signal } from '@angular/core';

/**
 * Centralised session storage. Exposed to portals as `shell/session`.
 *
 * Token lives in sessionStorage: it disappears when the tab closes.
 * A portal MUST NOT read/write it directly.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private static readonly TOKEN_KEY = 'telemed.access-token';
  private readonly tokenSignal = signal<string | null>(this.readStored());

  getToken(): string | null {
    return this.tokenSignal();
  }

  isAuthenticated(): boolean {
    const token = this.tokenSignal();
    if (!token) return false;
    return !this.isExpired(token);
  }

  signIn(token: string): void {
    sessionStorage.setItem(SessionService.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  signOut(): void {
    sessionStorage.removeItem(SessionService.TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  private readStored(): string | null {
    return sessionStorage.getItem(SessionService.TOKEN_KEY);
  }

  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      if (typeof payload.exp !== 'number') return true;
      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}