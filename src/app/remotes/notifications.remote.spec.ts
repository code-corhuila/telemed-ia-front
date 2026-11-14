import { loadRemoteModule } from '@angular-architects/native-federation';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Route, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import manifest from '../../../public/federation.manifest.json';
import { routes } from '../app.routes';
import { authGuard } from '../core/auth/auth.guard';
import { SHELL_BRIDGE } from '../core/bridge/shell-bridge';
import { NOTIFICATIONS_REMOTE_ROUTES } from './notifications.remote';

vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn(),
}));

const loadRemote = vi.mocked(loadRemoteModule);

describe('NOTIFICATIONS_REMOTE_ROUTES', () => {
  beforeEach(() => {
    loadRemote.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: 'notifications', children: NOTIFICATIONS_REMOTE_ROUTES },
          { path: 'elsewhere', children: [] },
        ]),
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('finds the notifications portal in the federation manifest', () => {
    expect((manifest as Record<string, string>)['notifications']).toBe(
      'http://localhost:4208/remoteEntry.json',
    );
  });

  it('is a signed-in section of the shell', () => {
    const layout = routes.find(
      (route) => route.path === '' && route.canActivate?.includes(authGuard),
    );

    expect(layout?.children?.map((child: Route) => child.path)).toContain('notifications');
  });

  it('mounts the React portal in its page and hands it the shell bridge', async () => {
    const mount = vi.fn().mockReturnValue(() => undefined);
    loadRemote.mockResolvedValue({ mount });

    const harness = await RouterTestingHarness.create('/notifications');

    await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce());
    expect(loadRemote).toHaveBeenCalledWith({
      remoteName: 'notifications',
      exposedModule: './mount',
    });
    const [element, bridge] = mount.mock.calls[0];
    expect(harness.routeNativeElement?.contains(element)).toBe(true);
    expect(bridge).toBe(TestBed.inject(SHELL_BRIDGE));
  });

  it('unmounts the portal when the user leaves the page', async () => {
    const unmount = vi.fn();
    const mount = vi.fn().mockReturnValue(unmount);
    loadRemote.mockResolvedValue({ mount });

    const harness = await RouterTestingHarness.create('/notifications');
    await vi.waitFor(() => expect(mount).toHaveBeenCalledOnce());

    await harness.navigateByUrl('/elsewhere');

    expect(unmount).toHaveBeenCalledOnce();
  });

  it('does not mount a portal that arrives after the user left', async () => {
    let arrive: (remote: unknown) => void = () => undefined;
    loadRemote.mockReturnValue(new Promise((resolve) => (arrive = resolve)));
    const mount = vi.fn();

    const harness = await RouterTestingHarness.create('/notifications');
    await harness.navigateByUrl('/elsewhere');
    arrive({ mount });
    await Promise.resolve();

    expect(mount).not.toHaveBeenCalled();
  });

  it.each([
    ['the remote cannot be loaded', () => loadRemote.mockRejectedValue(new Error('remote down'))],
    ['the remote has no mount', () => loadRemote.mockResolvedValue({})],
    [
      'the mount fails',
      () => loadRemote.mockResolvedValue({
        mount: () => {
          throw new Error('boom');
        },
      }),
    ],
  ])('shows the shell fallback when %s', async (_case, arrange) => {
    arrange();

    const harness = await RouterTestingHarness.create('/notifications');

    await vi.waitFor(() => {
      harness.fixture.detectChanges();
      expect(harness.routeNativeElement?.textContent).toContain(
        'Este portal no está disponible en este momento.',
      );
    });
  });
});
