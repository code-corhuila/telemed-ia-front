import { InjectionToken, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { SessionService } from '../auth/session.service';
import { ApiClientService } from '../http/api-client.service';

/**
 * What the shell hands to a portal that is not written in Angular (the React
 * notifications portal), which cannot inject shell/apiClient or shell/session.
 *
 * Norma 5.4.1: the portal still has no HTTP client or session of its own.
 * Requests go through ApiClientService and the shell interceptor (token,
 * X-Correlation-Id, timeout) and fail with the shell ApiError.
 */
export interface ShellBridge {
  readonly api: {
    get<T>(path: string, params?: Record<string, string | number>): Promise<T>;
    post<T>(path: string, body: unknown, idempotencyKey: string): Promise<T>;
    put<T>(path: string, body: unknown): Promise<T>;
    delete<T>(path: string): Promise<T>;
  };

  /** Who is signed in now, or null; read at each call. */
  session(): ShellBridgeSession | null;

  /** Opens a shell route; anything that is not an in-app path is refused. */
  navigate(path: string): Promise<boolean>;
}

export interface ShellBridgeSession {
  /** The identity UUID (the token's sub). */
  readonly userId: string | null;
  readonly role: string | null;
  readonly name: string;
}

// "/documents" yes; "//host", "/\host", "https://…" and relative paths no.
const IN_APP_PATH = /^\/(?![/\\])/;

export function createShellBridge(
  api: ApiClientService,
  session: SessionService,
  router: Router,
): ShellBridge {
  return {
    api: {
      get: (path, params) =>
        firstValueFrom(params ? api.getWithParams(path, params) : api.get(path)),
      post: (path, body, idempotencyKey) =>
        firstValueFrom(api.post(path, body, idempotencyKey)),
      put: (path, body) => firstValueFrom(api.put(path, body)),
      delete: (path) => firstValueFrom(api.delete(path)),
    },

    session: () => {
      if (!session.isAuthenticated()) {
        return null;
      }
      return {
        userId: session.getClaims()?.sub ?? null,
        role: session.getRole(),
        name: session.getName(),
      };
    },

    navigate: (path) =>
      IN_APP_PATH.test(path) ? router.navigateByUrl(path) : Promise.resolve(false),
  };
}

export const SHELL_BRIDGE = new InjectionToken<ShellBridge>('ShellBridge', {
  providedIn: 'root',
  factory: () =>
    createShellBridge(inject(ApiClientService), inject(SessionService), inject(Router)),
});
