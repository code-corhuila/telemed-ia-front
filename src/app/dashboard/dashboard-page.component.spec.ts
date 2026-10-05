import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  it('shows the patient dashboard main sections', async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(
      DashboardPageComponent,
    );

    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Bienvenido');
    expect(element.textContent).toContain('Próxima cita');
    expect(element.textContent).toContain('Historial');

    expect(element.textContent).toContain(
      'Hablar con el Asistente IA',
    );

    expect(element.textContent).toContain(
      'Tus próximas citas',
    );
  });
});