import { TestBed } from '@angular/core/testing';
import { Route, UrlSegment } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { routes } from '../app.routes';
import { SessionService } from '../core/auth/session.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  function canMatch(authenticated: boolean): boolean {
    TestBed.configureTestingModule({
      providers: [{ provide: SessionService, useValue: { isAuthenticated: () => authenticated } }],
    });
    return TestBed.runInInjectionContext(() => guestGuard({} as Route, [] as UrlSegment[])) as boolean;
  }

  it('lets visitors without a session see the landing page', () => {
    expect(canMatch(false)).toBe(true);
  });

  it('skips the landing page for signed-in users, who go on to the dashboard', () => {
    expect(canMatch(true)).toBe(false);
  });

  it('serves the landing page at / only, before the authenticated shell', async () => {
    const landing = routes.findIndex((route) => route.canMatch?.includes(guestGuard));
    const shell = routes.findIndex((route) => route.path === '' && route.canActivate);
    const matcher = routes[landing].matcher!;
    const segments = (...paths: string[]) => paths.map((path) => new UrlSegment(path, {}));

    expect(landing).toBeGreaterThanOrEqual(0);
    expect(landing).toBeLessThan(shell);
    expect(matcher(segments(), {} as never, routes[landing])).toEqual({ consumed: [] });
    expect(matcher(segments('dashboard'), {} as never, routes[landing])).toBeNull();
    const { LandingPage } = await import('./landing/landing.page');
    expect(await (routes[landing].loadComponent as () => Promise<unknown>)()).toBe(LandingPage);
  });
});
