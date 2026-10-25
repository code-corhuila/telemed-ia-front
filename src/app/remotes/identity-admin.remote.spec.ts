import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { describe, expect, it, vi } from 'vitest';

import { routes } from '../app.routes';
import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';
import { IDENTITY_ADMIN_REMOTE_ROUTES } from './identity-admin.remote';

vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn().mockRejectedValue(new Error('remote down')),
}));

describe('IDENTITY_ADMIN_REMOTE_ROUTES', () => {
  it('mounts Administration → Accounts at /accounts inside the authenticated shell', () => {
    const shellRoute = routes.find((route) => route.path === '');

    expect(shellRoute?.canActivate).toBeTruthy();
    expect(shellRoute?.children?.find((route) => route.path === 'accounts')).toBeTruthy();
  });

  it('loads the admin module of the identity portal', async () => {
    const loadChildren = IDENTITY_ADMIN_REMOTE_ROUTES[0].loadChildren as () => Promise<Route[]>;

    await loadChildren();

    expect(loadRemoteModule).toHaveBeenCalledWith({ remoteName: 'identity', exposedModule: './admin' });
  });

  it('falls back to RemoteUnavailableComponent when the remote is down', async () => {
    const loadChildren = IDENTITY_ADMIN_REMOTE_ROUTES[0].loadChildren as () => Promise<Route[]>;

    expect(await loadChildren()).toEqual([{ path: '**', component: RemoteUnavailableComponent }]);
  });

  it('is navigable when the remote is down', async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteUnavailableComponent],
      providers: [provideRouter([{ path: 'accounts', children: IDENTITY_ADMIN_REMOTE_ROUTES }])],
    }).compileComponents();
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/accounts');

    expect(router.url).toContain('/accounts');
  });
});
