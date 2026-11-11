import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { SessionService } from '../core/auth/session.service';
import { ApiClientService } from '../core/http/api-client.service';
import { ShellLayoutComponent } from './shell-layout.component';

/** Professional DEC-016: "Mi perfil" opens the professional portal's own-profile page. */
async function renderShell(role: string) {
  await TestBed.configureTestingModule({
    imports: [ShellLayoutComponent],
    providers: [
      provideRouter([]),
      {
        provide: SessionService,
        useValue: { getRole: () => role, getName: () => 'Persona de prueba', signOut: () => undefined },
      },
      { provide: ApiClientService, useValue: { get: () => EMPTY } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ShellLayoutComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ShellLayoutComponent professional profile entry', () => {
  it('links "Mi perfil" of a professional to its own profile', async () => {
    const element = await renderShell('PROFESSIONAL');

    const entry = element.querySelector<HTMLAnchorElement>('nav a.nav-item[href="/professionals/me"]');
    expect(entry?.textContent).toContain('Mi perfil');
    expect(element.querySelector('.nav-item--disabled')?.textContent ?? '').not.toContain('Mi perfil');
  });
});
