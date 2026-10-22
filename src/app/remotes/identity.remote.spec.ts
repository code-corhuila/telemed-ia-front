import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import manifest from '../../../public/federation.manifest.json';
import { routes } from '../app.routes';
import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';
import { IDENTITY_REMOTE_ROUTES } from './identity.remote';

vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn().mockRejectedValue(new Error('remote down')),
}));

describe('IDENTITY_REMOTE_ROUTES', () => {
  it('is registered in the federation manifest on its own port', () => {
    expect((manifest as Record<string, string>)['identity']).toBe('http://localhost:4206/remoteEntry.json');
  });

  it('is mounted at /auth outside the authGuard, since nobody has a session there yet', async () => {
    const auth = routes.find((route) => route.path === 'auth');

    expect(auth).toBeTruthy();
    expect(auth?.canActivate).toBeUndefined();
    expect(await (auth?.loadChildren as () => Promise<Route[]>)()).toBe(IDENTITY_REMOTE_ROUTES);
  });

  it('falls back to RemoteUnavailableComponent when loadRemoteModule rejects', async () => {
    const loadChildren = IDENTITY_REMOTE_ROUTES[0].loadChildren as () => Promise<Route[]>;

    expect(await loadChildren()).toEqual([{ path: '**', component: RemoteUnavailableComponent }]);
  });

  it('is navigable when loadRemoteModule rejects', async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteUnavailableComponent],
      providers: [provideRouter([{ path: 'auth', children: IDENTITY_REMOTE_ROUTES }])],
    }).compileComponents();
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/auth/sign-in');

    expect(router.url).toBe('/auth/sign-in');
  });
});
