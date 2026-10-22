import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { SessionService } from '../core/auth/session.service';

/** Matches only without a session, so signed-in users fall through to the dashboard. */
export const guestGuard: CanMatchFn = () => !inject(SessionService).isAuthenticated();
