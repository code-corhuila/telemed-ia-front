import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { ApiClientService } from './api-client.service';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiClientService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ApiClientService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('sends GET requests through the API gateway base path', () => {
    service
      .get<{ id: string }>('/patients/me')
      .subscribe();

    const request = httpTesting.expectOne(
      '/api/v1/patients/me',
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      id: '11111111-1111-1111-1111-111111111111',
    });
  });

  it('adds Idempotency-Key to POST requests', () => {
    const payload = {
      reason: 'Dolor de cabeza',
    };

    service
      .post(
        '/preconsultations',
        payload,
        'test-idempotency-key',
      )
      .subscribe();

    const request = httpTesting.expectOne(
      '/api/v1/preconsultations',
    );

    expect(request.request.method).toBe('POST');

    expect(
      request.request.headers.get('Idempotency-Key'),
    ).toBe('test-idempotency-key');

    expect(request.request.body).toEqual(payload);

    request.flush({});
  });
});