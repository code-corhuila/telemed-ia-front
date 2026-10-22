import { Injectable, Injector, inject } from '@angular/core';

import { ApiClientService } from '../http/api-client.service';
import { SessionService } from './session.service';

/**
 * Ends the session: asks identity-api to revoke the refresh token, then
 * closes the local session straight away, whatever the API answers.
 *
 * Kept out of SessionService.signOut() on purpose: the HTTP interceptor
 * calls signOut() on any 401, and a logout request from there could loop.
 */
@Injectable({ providedIn: 'root' })
export class SessionTermination {
  private readonly session = inject(SessionService);
  // Resolved on use, so components that only render the button need no HTTP setup.
  private readonly injector = inject(Injector);

  end(): void {
    const refreshToken = this.session.getRefreshToken();

    if (refreshToken) {
      this.injector
        .get(ApiClientService)
        .post('/auth/logout', { refreshToken }, crypto.randomUUID())
        .subscribe({ error: () => undefined });
    }

    this.session.signOut();
  }
}
