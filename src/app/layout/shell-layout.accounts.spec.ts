import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { SessionService } from '../core/auth/session.service';
import { ApiClientService } from '../core/http/api-client.service';
import { ShellLayoutComponent } from './shell-layout.component';

/** FR-012: the Accounts entry of the Administration menu (identity portal). */
async function renderShell(role: string) {
  await TestBed.configureTestingModule({
    imports: [ShellLayoutComponent],
    providers: [
      provideRouter([]),
      { provide: ApiClientService, useValue: { get: () => EMPTY } },
      {
        provide: SessionService,
        useValue: { getRole: () => role, getName: () => 'Persona de prueba', signOut: () => undefined },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ShellLayoutComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ShellLayoutComponent accounts entry', () => {
  it('shows Accounts to an administrator', async () => {
    const link = (await renderShell('ADMIN')).querySelector<HTMLAnchorElement>('a[href="/accounts"]');

    expect(link?.textContent).toContain('Cuentas');
  });

  it('hides Accounts from patients and professionals', async () => {
    for (const role of ['PATIENT', 'PROFESSIONAL']) {
      TestBed.resetTestingModule();

      expect((await renderShell(role)).querySelector('a[href="/accounts"]')).toBeFalsy();
    }
  });
});
