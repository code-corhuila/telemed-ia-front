import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';

import { SessionService } from './session.service';

// The refresh token is kept next to the access token so sign-out can revoke it.
describe('SessionService refresh token', () => {
  afterEach(() => sessionStorage.clear());

  it('keeps the refresh token given at sign-in', () => {
    const session = TestBed.inject(SessionService);

    session.signIn('header.payload.signature', 'refresh-1');

    expect(session.getRefreshToken()).toBe('refresh-1');
  });

  it('still accepts a sign-in with the access token only, and drops any older refresh token', () => {
    const session = TestBed.inject(SessionService);
    session.signIn('header.payload.signature', 'refresh-1');

    session.signIn('other.payload.signature');

    expect(session.getToken()).toBe('other.payload.signature');
    expect(session.getRefreshToken()).toBeNull();
  });

  it('forgets both tokens on sign-out', () => {
    const session = TestBed.inject(SessionService);
    session.signIn('header.payload.signature', 'refresh-1');

    session.signOut();

    expect(session.getToken()).toBeNull();
    expect(session.getRefreshToken()).toBeNull();
  });

  it('reads the refresh token stored by an earlier page load', () => {
    TestBed.inject(SessionService).signIn('header.payload.signature', 'refresh-1');
    TestBed.resetTestingModule();

    expect(TestBed.inject(SessionService).getRefreshToken()).toBe('refresh-1');
  });
});
