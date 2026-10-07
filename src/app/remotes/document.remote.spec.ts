import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Route } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';
import { DOCUMENT_REMOTE_ROUTES } from './document.remote';

vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn().mockRejectedValue(new Error('remote down')),
}));

describe('DOCUMENT_REMOTE_ROUTES', () => {
  it('falls back to RemoteUnavailableComponent when loadRemoteModule rejects', async () => {
    const route: Route = DOCUMENT_REMOTE_ROUTES[0];
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
            path: 'documents',
            children: DOCUMENT_REMOTE_ROUTES,
          },
        ]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);

    await router.navigateByUrl('/documents');

    expect(router.url).toContain('/documents');
  });
});
