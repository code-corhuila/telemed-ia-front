import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { SessionService } from '../auth/session.service';
import { ApiError } from './api-error';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  const session = {
    getToken: vi.fn(),
    signOut: vi.fn(),
  };

  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    session.getToken.mockReset();
    session.signOut.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([apiInterceptor]),
        ),
        provideHttpClientTesting(),
        {
          provide: SessionService,
          useValue: session,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('adds bearer authorization and correlation id', () => {
    session.getToken.mockReturnValue('synthetic-token');

    http.get('/api/v1/test').subscribe();

    const request =
      httpTesting.expectOne('/api/v1/test');

    expect(
      request.request.headers.get('Authorization'),
    ).toBe('Bearer synthetic-token');

    const correlationId =
      request.request.headers.get('X-Correlation-Id');

    expect(correlationId).toBeTruthy();

    request.flush({});
  });

  it('signs out when the API returns 401', async () => {
    session.getToken.mockReturnValue(
      'synthetic-token',
    );

    const response = firstValueFrom(
      http.get('/api/v1/protected'),
    );

    const request = httpTesting.expectOne(
      '/api/v1/protected',
    );

    request.flush(
      {
        error: 'UNAUTHORIZED',
        message: 'Session expired',
        details: [],
        traceId: 'trace-test',
      },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    await expect(response).rejects.toBeTruthy();

    expect(session.signOut).toHaveBeenCalledOnce();
  });

  it('normalises the API error envelope', async () => {
    session.getToken.mockReturnValue(null);

    const response = firstValueFrom(
      http.get('/api/v1/test'),
    );

    const request =
      httpTesting.expectOne('/api/v1/test');

    request.flush(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: [
          {
            field: 'email',
            message: 'Invalid email',
          },
        ],
        traceId: 'trace-123',
      },
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );

    try {
      await response;
      throw new Error(
        'Expected request to fail',
      );
    } catch (error) {
      const apiError = error as ApiError;

      expect(apiError.status).toBe(400);
      expect(apiError.code).toBe(
        'VALIDATION_ERROR',
      );
      expect(apiError.message).toBe(
        'Invalid request',
      );
      expect(apiError.traceId).toBe(
        'trace-123',
      );
    }
  });
});