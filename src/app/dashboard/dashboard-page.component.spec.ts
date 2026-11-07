import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SessionService } from '../core/auth/session.service';
import { ApiClientService } from '../core/http/api-client.service';
import { DashboardPageComponent } from './dashboard-page.component';

const PATIENT_ID = '1f2e3d4c-0000-4000-8000-000000000005';
const PROFESSIONAL_ID = '7a1e9c3f-0000-4000-8000-000000000003';

function page(data: unknown[]) {
  return { data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } };
}

const FUTURE = page([
  { id: 'a2', start: '2099-03-02T15:30:00Z', status: 'RESCHEDULED' },
  { id: 'a1', start: '2099-03-01T13:00:00Z', status: 'CONFIRMED' },
  { id: 'a0', start: '2000-01-01T13:00:00Z', status: 'CONFIRMED' },
  { id: 'ax', start: '2099-03-03T13:00:00Z', status: 'CANCELLED' },
]);

async function renderHome(
  role: string,
  sub: string | undefined,
  response: () => Observable<unknown>,
) {
  const getWithParams = vi.fn(response);

  await TestBed.configureTestingModule({
    imports: [DashboardPageComponent],
    providers: [
      provideRouter([]),
      {
        provide: SessionService,
        useValue: {
          getRole: () => role,
          getName: () => 'Laura Gómez',
          getClaims: () => ({ sub, role }),
        },
      },
      { provide: ApiClientService, useValue: { getWithParams } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DashboardPageComponent);
  fixture.detectChanges();

  return { fixture, element: fixture.nativeElement as HTMLElement, getWithParams };
}

describe('DashboardPageComponent for a patient', () => {
  it('reads the patient appointments through the shell API client', async () => {
    const { getWithParams } = await renderHome('PATIENT', PATIENT_ID, () => of(FUTURE));

    expect(getWithParams).toHaveBeenCalledWith(`/appointments/patient/${PATIENT_ID}`, {
      page: 1,
      limit: 100,
    });
  });

  it('greets the patient and lists only the upcoming appointments, soonest first', async () => {
    const { element } = await renderHome('PATIENT', PATIENT_ID, () => of(FUTURE));

    expect(element.textContent).toContain('¡Hola, Laura!');
    expect(element.textContent).toContain('Hablar con el Asistente IA');

    const cards = Array.from(element.querySelectorAll('[data-testid="appointment-card"]'));
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('1 de marzo');
    expect(cards[0].textContent).toContain('08:00');
    expect(cards[0].textContent).toContain('Confirmada');
    expect(cards[1].textContent).toContain('Reprogramada');

    const next = element.querySelector('[data-testid="next-appointment"]');
    expect(next?.textContent).toContain('1 de marzo');
    expect(element.querySelector('[data-testid="upcoming-count"]')?.textContent).toContain('2');
    expect(element.querySelector('a[href="/appointment"]')).toBeTruthy();
  });

  it('shows the empty state with a link to book when nothing is upcoming', async () => {
    const { element } = await renderHome('PATIENT', PATIENT_ID, () => of(page([])));

    expect(element.querySelector('[data-testid="appointments-empty"]')?.textContent).toContain(
      'No tienes citas próximas',
    );
    expect(element.querySelector('[data-testid="next-appointment"]')?.textContent).toContain(
      'Sin citas próximas',
    );
    expect(element.querySelector('a[href="/appointment/book"]')).toBeTruthy();
  });

  it('shows a loading state until the appointments arrive', async () => {
    const pending = new Subject<unknown>();
    const { fixture, element } = await renderHome('PATIENT', PATIENT_ID, () => pending);

    expect(element.querySelector('[data-testid="appointments-loading"]')).toBeTruthy();

    pending.next(FUTURE);
    pending.complete();
    fixture.detectChanges();

    expect(element.querySelector('[data-testid="appointments-loading"]')).toBeFalsy();
    expect(element.querySelectorAll('[data-testid="appointment-card"]')).toHaveLength(2);
  });

  it('shows an error with a retry that asks again', async () => {
    let calls = 0;
    const { fixture, element, getWithParams } = await renderHome('PATIENT', PATIENT_ID, () =>
      ++calls === 1 ? throwError(() => new Error('unavailable')) : of(FUTURE),
    );

    const error = element.querySelector('[data-testid="appointments-error"]');
    expect(error?.textContent).toContain('No pudimos cargar tus citas');

    (error?.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(getWithParams).toHaveBeenCalledTimes(2);
    expect(element.querySelector('[data-testid="appointments-error"]')).toBeFalsy();
    expect(element.querySelectorAll('[data-testid="appointment-card"]')).toHaveLength(2);
  });

  it('shows the error without calling the API when the session has no user id', async () => {
    const { element, getWithParams } = await renderHome('PATIENT', undefined, () => of(FUTURE));

    expect(getWithParams).not.toHaveBeenCalled();
    expect(element.querySelector('[data-testid="appointments-error"]')).toBeTruthy();
  });
});

describe('DashboardPageComponent for a professional', () => {
  it('shows the professional agenda instead of the pre-consultation card', async () => {
    const { element, getWithParams } = await renderHome('PROFESSIONAL', PROFESSIONAL_ID, () =>
      of(FUTURE),
    );

    expect(getWithParams).toHaveBeenCalledWith(`/appointments/professional/${PROFESSIONAL_ID}`, {
      page: 1,
      limit: 100,
    });
    expect(element.textContent).toContain('¡Hola, Laura!');
    expect(element.textContent).toContain('Tu agenda');
    expect(element.textContent).not.toContain('Iniciar preconsulta');
    expect(element.querySelectorAll('[data-testid="appointment-card"]')).toHaveLength(2);
    expect(element.querySelector('a[href="/appointment/professional"]')).toBeTruthy();
  });

  it('says the agenda is empty in professional words', async () => {
    const { element } = await renderHome('PROFESSIONAL', PROFESSIONAL_ID, () => of(page([])));

    expect(element.querySelector('[data-testid="appointments-empty"]')?.textContent).toContain(
      'No tienes citas en tu agenda',
    );
    expect(element.querySelector('a[href="/appointment/book"]')).toBeFalsy();
  });
});
