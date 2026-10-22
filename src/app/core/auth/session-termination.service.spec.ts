import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ApiClientService } from '../http/api-client.service';
import { SessionTermination } from './session-termination.service';
import { SessionService } from './session.service';

describe('SessionTermination', () => {
  function setUp(refreshToken: string | null, post = vi.fn().mockReturnValue(new Subject())) {
    const session = { getRefreshToken: () => refreshToken, signOut: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionService, useValue: session },
        { provide: ApiClientService, useValue: { post } },
      ],
    });
    return { termination: TestBed.inject(SessionTermination), session, post };
  }

  it('asks identity-api to revoke the refresh token and closes the local session', () => {
    const { termination, session, post } = setUp('refresh-1');

    termination.end();

    expect(post).toHaveBeenCalledWith(
      '/auth/logout',
      { refreshToken: 'refresh-1' },
      expect.stringMatching(/^[0-9a-f-]{36}$/),
    );
    expect(session.signOut).toHaveBeenCalled();
  });

  it('closes the local session even when identity-api cannot be reached', () => {
    const { termination, session } = setUp('refresh-1', vi.fn().mockReturnValue(throwError(() => new Error('down'))));

    termination.end();

    expect(session.signOut).toHaveBeenCalled();
  });

  it('does not call identity-api when there is no refresh token to revoke', () => {
    const { termination, session, post } = setUp(null);

    termination.end();

    expect(post).not.toHaveBeenCalled();
    expect(session.signOut).toHaveBeenCalled();
  });
});
