import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { of } from 'rxjs';

import { SessionService } from '../core/auth/session.service';
import { ApiClientService } from '../core/http/api-client.service';
import { DashboardPageComponent } from './dashboard-page.component';

async function renderHome(role: string) {
  await TestBed.configureTestingModule({
    imports: [DashboardPageComponent],
    providers: [
      provideRouter([]),
      {
        provide: SessionService,
        useValue: { getRole: () => role, getName: () => 'Laura Gómez', getClaims: () => ({ role }) },
      },
      { provide: ApiClientService, useValue: { getWithParams: () => of({ data: [], meta: {} }) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DashboardPageComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Home for administrators', () => {
  it('shows the administration shortcuts instead of the patient dashboard', async () => {
    const element = await renderHome('ADMIN');

    expect(element.textContent).toContain('Hola, Laura');
    expect(element.querySelector('a[href="/accounts"]')?.textContent).toContain('Ir a cuentas');
    expect(element.querySelector('a[href="/professionals"]')?.textContent).toContain('Ir a profesionales');
    expect(element.textContent).not.toContain('Iniciar preconsulta');
    expect(element.textContent).not.toContain('Tus próximas citas');
  });

  it('keeps the patient dashboard for patients', async () => {
    const element = await renderHome('PATIENT');

    expect(element.textContent).toContain('Iniciar preconsulta');
    expect(element.querySelector('a[href="/accounts"]')).toBeFalsy();
  });
});
