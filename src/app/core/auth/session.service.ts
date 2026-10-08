import { Injectable, computed, signal } from '@angular/core';

export interface SessionClaims {
  readonly sub?: string;
  readonly name?: string;
  readonly email?: string;
  readonly role?: string;
  readonly iat?: number;
  readonly exp?: number;
}

/**
 * Centralised session storage.
 * Exposed to portals as `shell/session`.
 *
 * Token lives in sessionStorage: it disappears when the tab closes.
 * A portal MUST NOT read/write it directly.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private static readonly TOKEN_KEY =
    'telemed.access-token';

  private readonly tokenSignal =
    signal<string | null>(this.readStored());

  readonly claims = computed<SessionClaims | null>(
    () => {
      const token = this.tokenSignal();

      if (!token) {
        return null;
      }

      return this.decodeClaims(token);
    },
  );

  readonly userId = computed<number | null>(
    () => {
      const sub = this.claims()?.sub;

      if (!sub) {
        return null;
      }

      const id = Number(sub);

      return Number.isInteger(id) && id > 0
        ? id
        : null;
    },
  );

  readonly role = computed<string | null>(
    () => this.claims()?.role ?? null,
  );

  readonly userName = computed<string>(
    () =>
      this.claims()?.name ??
      this.claims()?.email ??
      'Usuario',
  );

  getToken(): string | null {
    return this.tokenSignal();
  }

  getClaims(): SessionClaims | null {
    return this.claims();
  }

  getUserId(): number | null {
    return this.userId();
  }

  getRole(): string | null {
    return this.role();
  }

  getName(): string {
    return this.userName();
  }

  isAuthenticated(): boolean {
    const token = this.tokenSignal();

    if (!token) {
      return false;
    }

    return !this.isExpired(token);
  }

  signIn(token: string): void {
    sessionStorage.setItem(
      SessionService.TOKEN_KEY,
      token,
    );

    this.tokenSignal.set(token);
  }

  signOut(): void {
    sessionStorage.removeItem(
      SessionService.TOKEN_KEY,
    );

    this.tokenSignal.set(null);
  }

  private readStored(): string | null {
    return sessionStorage.getItem(
      SessionService.TOKEN_KEY,
    );
  }

  private decodeClaims(
    token: string,
  ): SessionClaims | null {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const paddedPayload = payload.padEnd(
        payload.length +
          ((4 - (payload.length % 4)) % 4),
        '=',
      );

      const decoded = atob(
        paddedPayload,
      );

      const bytes = Uint8Array.from(
        decoded,
        (character) =>
          character.charCodeAt(0),
      );

      const json = new TextDecoder().decode(
        bytes,
      );

      return JSON.parse(
        json,
      ) as SessionClaims;
    } catch {
      return null;
    }
  }

  private isExpired(
    token: string,
  ): boolean {
    const claims =
      this.decodeClaims(token);

    if (
      !claims ||
      typeof claims.exp !== 'number'
    ) {
      return true;
    }

    return (
      claims.exp * 1000 <= Date.now()
    );
  }
}