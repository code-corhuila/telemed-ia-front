import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { ShellLayoutComponent } from '../../layout/shell-layout.component';
import { authGuard } from './auth.guard';
import { SessionService } from './session.service';

// Sign-in lives in the identity portal (/auth); /sign-in is the developer token screen.
describe('sign-in destination', () => {
  function session(authenticated: boolean) {
    return {
      isAuthenticated: () => authenticated,
      getRole: () => 'PATIENT',
      getName: () => 'Persona de prueba',
      signOut: vi.fn(),
    };
  }

  it('sends visitors without a session to the identity sign-in, keeping where they were going', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SessionService, useValue: session(false) }],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/appointment' } as RouterStateSnapshot),
    ) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/auth/sign-in?returnUrl=%2Fappointment');
  });

  it('closes the session and opens the identity sign-in', async () => {
    const signedIn = session(true);
    await TestBed.configureTestingModule({
      imports: [ShellLayoutComponent],
      providers: [provideRouter([]), { provide: SessionService, useValue: signedIn }],
    }).compileComponents();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ShellLayoutComponent);
    fixture.detectChanges();

    const button = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Cerrar sesión'),
    )!;
    button.click();

    expect(signedIn.signOut).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/auth/sign-in');
  });
});
