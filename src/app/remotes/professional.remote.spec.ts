import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Route } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';
import manifest from '../../../public/federation.manifest.json';
import { PROFESSIONAL_REMOTE_ROUTES } from './professional.remote';

vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn().mockRejectedValue(new Error('remote down')),
}));

describe('PROFESSIONAL_REMOTE_ROUTES', () => {
  it('finds the professional portal in the federation manifest', () => {
    expect((manifest as Record<string, string>)['professional']).toBe('http://localhost:4207/remoteEntry.json');
  });

  it('falls back to RemoteUnavailableComponent when loadRemoteModule rejects', async () => {
    const route: Route = PROFESSIONAL_REMOTE_ROUTES[0];
    const loadChildren = route.loadChildren as () => Promise<Route[]>;

    const fallbackRoutes = await loadChildren();

    expect(fallbackRoutes).toEqual([
      {
        path: '**',
        component: RemoteUnavailableComponent,
      },
    ]);
  });

  it('is navigable when loadRemoteModule rejects', async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteUnavailableComponent],
      providers: [
        provideRouter([
          {
            path: 'professionals',
            children: PROFESSIONAL_REMOTE_ROUTES,
          },
        ]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);

    await router.navigateByUrl('/professionals');

    expect(router.url).toContain('/professionals');
  });
});
