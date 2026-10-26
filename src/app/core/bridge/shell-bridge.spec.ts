import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { SessionService } from '../auth/session.service';
import { ApiError } from '../http/api-error';
import { apiInterceptor } from '../http/api.interceptor';
import { SHELL_BRIDGE, ShellBridge } from './shell-bridge';

const PATIENT_ID = '7f3c2a9e-1b4d-4c8e-9a6f-2d5b8e1c3a7f';

function tokenFor(claims: Record<string, unknown>): string {
  // A JWT carries UTF-8 JSON in base64url.
  const encode = (value: unknown) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  return `${encode({ alg: 'RS256' })}.${encode(claims)}.signature`;
}

describe('ShellBridge', () => {
  let bridge: ShellBridge;
  let session: SessionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([apiInterceptor]),
        ),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    bridge = TestBed.inject(SHELL_BRIDGE);
    session = TestBed.inject(SessionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('sends requests through the shell HTTP pipeline, with its session token', async () => {
    const token = tokenFor({ sub: PATIENT_ID, role: 'PATIENT', exp: 4102444800 });
    session.signIn(token);

    const response = bridge.api.get<{ unreadCount: number }>(
      '/notifications/unread-count',
    );

    const request = httpTesting.expectOne(
      '/api/v1/notifications/unread-count',
    );
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(request.request.headers.has('X-Correlation-Id')).toBe(true);
    request.flush({ unreadCount: 3 });

    await expect(response).resolves.toEqual({ unreadCount: 3 });
  });

  it('sends query parameters on GET', async () => {
    const response = bridge.api.get('/notifications', { page: 1, size: 20 });

    const request = httpTesting.expectOne(
      (candidate) => candidate.url === '/api/v1/notifications',
    );
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('size')).toBe('20');
    request.flush({ data: [], meta: {} });

    await expect(response).resolves.toEqual({ data: [], meta: {} });
  });

  it('adds the Idempotency-Key to POST requests', async () => {
    const response = bridge.api.post('/notifications/preferences', { email: true }, 'key-1');

    const request = httpTesting.expectOne('/api/v1/notifications/preferences');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBe('key-1');
    request.flush({});

    await response;
  });

  it('resolves a PUT answered with 204 No Content', async () => {
    const response = bridge.api.put('/notifications/read-all', {});

    const request = httpTesting.expectOne('/api/v1/notifications/read-all');
    expect(request.request.method).toBe('PUT');
    request.flush(null, { status: 204, statusText: 'No Content' });

    await expect(response).resolves.toBeNull();
  });

  it('rejects with the shell ApiError built from the error envelope', async () => {
    const response = bridge.api.put('/notifications/abc/read', {});

    httpTesting
      .expectOne('/api/v1/notifications/abc/read')
      .flush(
        { error: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found.', traceId: 'trace-1' },
        { status: 404, statusText: 'Not Found' },
      );

    const expected: ApiError = {
      status: 404,
      code: 'NOTIFICATION_NOT_FOUND',
      message: 'Notification not found.',
      details: undefined,
      traceId: 'trace-1',
    };
    await expect(response).rejects.toEqual(expected);
  });

  it('tells who is signed in, with the identity UUID as the user id', () => {
    session.signIn(tokenFor({
      sub: PATIENT_ID,
      role: 'PATIENT',
      name: 'Laura Gómez',
      exp: 4102444800,
    }));

    expect(bridge.session()).toEqual({
      userId: PATIENT_ID,
      role: 'PATIENT',
      name: 'Laura Gómez',
    });
  });

  it('reads the session at each call, so a sign-out is seen at once', () => {
    session.signIn(tokenFor({ sub: PATIENT_ID, role: 'PATIENT', exp: 4102444800 }));
    session.signOut();

    expect(bridge.session()).toBeNull();
  });

  it('navigates to shell routes', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    await expect(bridge.navigate('/documents')).resolves.toBe(true);

    expect(navigate).toHaveBeenCalledWith('/documents');
  });

  it.each([
    'https://example.com/phishing',
    '//example.com/phishing',
    'javascript:alert(1)',
    'documents',
  ])('refuses to navigate outside the shell: %s', async (target) => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl');

    await expect(bridge.navigate(target)).resolves.toBe(false);

    expect(navigate).not.toHaveBeenCalled();
  });
});
