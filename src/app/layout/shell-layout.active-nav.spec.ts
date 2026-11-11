import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { EMPTY } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { SessionService } from '../core/auth/session.service';
import { ApiClientService } from '../core/http/api-client.service';
import { ShellLayoutComponent } from './shell-layout.component';

@Component({ template: '' })
class BlankPage {}

/** The sidebar marks only the entry of the page being shown. */
async function renderShellAt(role: string, url: string) {
  await TestBed.configureTestingModule({
    imports: [ShellLayoutComponent],
    providers: [
      provideRouter([
        { path: 'appointment/professional/schedule', component: BlankPage },
        { path: 'appointment/professional', component: BlankPage },
      ]),
      {
        provide: SessionService,
        useValue: { getRole: () => role, getName: () => 'Persona de prueba', signOut: () => undefined },
      },
      { provide: ApiClientService, useValue: { get: () => EMPTY } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ShellLayoutComponent);
  await TestBed.inject(Router).navigateByUrl(url);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

function activeEntries(element: HTMLElement): string[] {
  return Array.from(element.querySelectorAll('nav .nav-item--active')).map(
    (entry) => entry.textContent?.trim().replace(/\s+/g, ' ') ?? '',
  );
}

describe('ShellLayoutComponent active navigation entry', () => {
  it('marks only "Mi agenda" on the professional schedule', async () => {
    const element = await renderShellAt('PROFESSIONAL', '/appointment/professional/schedule');

    const active = activeEntries(element);
    expect(active).toHaveLength(1);
    expect(active[0]).toContain('Mi agenda');
  });

  it('marks only "Citas profesionales" on the professional appointments', async () => {
    const element = await renderShellAt('PROFESSIONAL', '/appointment/professional');

    const active = activeEntries(element);
    expect(active).toHaveLength(1);
    expect(active[0]).toContain('Citas profesionales');
  });
});
