import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { SessionService } from '../core/auth/session.service';
import { ApiClientService } from '../core/http/api-client.service';
import { ShellLayoutComponent } from './shell-layout.component';

/** HU-17: the inbox (notifications portal) is reached from the sidebar and the topbar bell. */
async function renderShell(role: string) {
  await TestBed.configureTestingModule({
    imports: [ShellLayoutComponent],
    providers: [
      provideRouter([]),
      {
        provide: SessionService,
        useValue: { getRole: () => role, getName: () => 'Persona de prueba', signOut: () => undefined },
      },
      { provide: ApiClientService, useValue: { get: () => of({ unreadCount: 2 }) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ShellLayoutComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ShellLayoutComponent notifications entry', () => {
  it('links the inbox from the sidebar for patients and professionals', async () => {
    for (const role of ['PATIENT', 'PROFESSIONAL']) {
      TestBed.resetTestingModule();
      const element = await renderShell(role);

      const entry = element.querySelector<HTMLAnchorElement>('nav a.nav-item[href="/notifications"]');
      expect(entry?.textContent).toContain('Notificaciones');
      expect(element.querySelector('.nav-item--disabled')?.textContent ?? '').not.toContain('Notificaciones');
    }
  });

  it('shows the bell with the unread count in the topbar', async () => {
    const element = await renderShell('PATIENT');

    const bell = element.querySelector<HTMLAnchorElement>('.topbar app-notifications-bell a[href="/notifications"]');
    expect(bell?.getAttribute('aria-label')).toBe('Notificaciones, 2 sin leer');
  });
});
