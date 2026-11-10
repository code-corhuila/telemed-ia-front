import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { SessionService } from './session.service';

// identity-api issues the account UUID as `sub`; portals use it to load the user's own data.
describe('SessionService user id', () => {
  afterEach(() => sessionStorage.clear());

  const tokenWith = (claims: Record<string, unknown>): string =>
    `header.${btoa(JSON.stringify(claims)).replace(/=+$/, '')}.signature`;

  it('returns the account UUID from the sub claim', () => {
    const session = TestBed.inject(SessionService);

    session.signIn(tokenWith({ sub: '612ddb16-8496-4be2-8fd7-f9a6e07827cc' }));

    expect(session.getUserId()).toBe('612ddb16-8496-4be2-8fd7-f9a6e07827cc');
  });

  it('returns null when there is no session', () => {
    expect(TestBed.inject(SessionService).getUserId()).toBeNull();
  });

  it('returns null when the token has no sub claim', () => {
    const session = TestBed.inject(SessionService);

    session.signIn(tokenWith({ role: 'PATIENT' }));

    expect(session.getUserId()).toBeNull();
  });
});
