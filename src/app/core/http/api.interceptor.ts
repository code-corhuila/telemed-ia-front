import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { SessionService } from '../auth/session.service';
import { ApiError, TIMEOUT_CODE, TIMEOUT_STATUS } from './api-error';

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Adds Authorization and X-Correlation-Id, enforces a timeout, closes the
 * session on 401, and normalises every failure to an ApiError.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const session = inject(SessionService);
  const correlationId = crypto.randomUUID();
  const token = session.getToken();

  const headers = req.headers.set('X-Correlation-Id', correlationId);
  const authorised = token ? headers.set('Authorization', `Bearer ${token}`) : headers;

  return next(req.clone({ headers: authorised })).pipe(
    timeout({ each: REQUEST_TIMEOUT_MS, with: () => throwError(() => buildTimeout(correlationId)) }),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        session.signOut();
      }
      return throwError(() => normalise(err, correlationId));
    }),
  );
};

function buildTimeout(correlationId: string): ApiError {
  return {
    status: TIMEOUT_STATUS,
    code: TIMEOUT_CODE,
    message: 'The request took too long. Please try again.',
    traceId: correlationId,
  };
}

function normalise(err: unknown, fallbackTraceId: string): ApiError {
  if (err && typeof err === 'object' && 'status' in err && 'code' in err) {
    return err as ApiError;
  }
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && 'error' in body) {
      const envelope = body as { error: string; message: string; details?: unknown; traceId?: string };
      return {
        status: err.status,
        code: envelope.error,
        message: envelope.message,
        details: Array.isArray(envelope.details) ? envelope.details as { field: string; message: string }[] : undefined,
        traceId: envelope.traceId ?? fallbackTraceId,
      };
    }
    return {
      status: err.status,
      code: err.status === 0 ? 'NETWORK_ERROR' : 'INTERNAL_ERROR',
      message: err.status === 0 ? 'Cannot reach the server.' : 'Unexpected server error.',
      traceId: fallbackTraceId,
    };
  }
  return {
    status: 0,
    code: 'UNKNOWN',
    message: 'Unexpected error.',
    traceId: fallbackTraceId,
  };
}