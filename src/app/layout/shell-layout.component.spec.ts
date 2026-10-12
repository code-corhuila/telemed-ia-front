import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { SessionService } from '../core/auth/session.service';
import { ShellLayoutComponent } from './shell-layout.component';

@Component({ standalone: true, template: '' })
class AgentStubComponent {}

async function renderShell(role: string | null = 'PATIENT') {
  const activeRole = signal<string | null>(role);

  await TestBed.configureTestingModule({
    imports: [ShellLayoutComponent],
    providers: [
      provideRouter([
        { path: 'agent', component: AgentStubComponent },
      ]),
      {
        provide: SessionService,
        useValue: {
          getRole: () => activeRole(),
          getName: () => 'Persona de prueba',
          signOut: () => undefined,
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ShellLayoutComponent);
  fixture.detectChanges();

  return {
    fixture,
    element: fixture.nativeElement as HTMLElement,
    router: TestBed.inject(Router),
  };
}

describe('ShellLayoutComponent', () => {
  it('shows the Intelligent Agent portal to a patient', async () => {
    const { element } = await renderShell('PATIENT');
    const link = element.querySelector<HTMLAnchorElement>('a[href="/agent"]');

    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Preconsulta IA');
  });

  it('shows the current TeleMed IA patient navigation', async () => {
    const { element } = await renderShell('PATIENT');

    for (const label of [
      'Inicio',
      'Mis citas',
      'Agendar cita',
      'Preconsulta IA',
      'Mis consultas',
      'Documentos',
      'Mi perfil',
      'Notificaciones',
      'Cerrar sesi\u00F3n',
    ]) {
      expect(element.textContent).toContain(label);
    }

    expect(element.querySelector('a[href="/consultation"]')).toBeTruthy();
    expect(element.querySelector('a[href="/appointment"]')).toBeTruthy();
  });

  it('keeps the topbar on the Agent route', async () => {
    const { fixture, element, router } = await renderShell('PATIENT');

    await router.navigateByUrl('/agent');
    fixture.detectChanges();

    expect(element.querySelector('.topbar')).toBeTruthy();
    expect(element.querySelector('input[type="search"]')).toBeTruthy();
    expect(element.querySelector('.shell-main')).toBeTruthy();
  });

  it('shows the Document Generation portal to a patient', async () => {
    const { element } = await renderShell('PATIENT');
    const link = element.querySelector<HTMLAnchorElement>('a[href="/documents"]');

    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Documentos');
  });

  it('shows professional navigation and the shared topbar', async () => {
    const { element } = await renderShell('PROFESSIONAL');

    expect(element.querySelector('.topbar')).toBeTruthy();
    expect(element.querySelector('input[type="search"]')).toBeTruthy();
    expect(element.querySelector('.topbar__actions')).toBeTruthy();
    expect(element.querySelector('a[href="/consultation/professional"]')).toBeTruthy();
    expect(element.querySelector('a[href="/appointment/professional"]')).toBeTruthy();
    expect(element.querySelector('a[href="/agent"]')).toBeFalsy();
  });
});
