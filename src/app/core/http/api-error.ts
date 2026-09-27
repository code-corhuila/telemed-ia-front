/**
 * Common error envelope returned by every service (norm 5.3.5).
 * Exposed to domain portals so they don't have to declare their own type.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: ReadonlyArray<{ field: string; message: string }>;
  traceId?: string;
}

export const TIMEOUT_STATUS = 0;
export const TIMEOUT_CODE = 'TIMEOUT';