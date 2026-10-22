import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { LandingPage } from './landing.page';

describe('LandingPage', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('opens with the promise of the platform', () => {
    const page = render();

    expect(page.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Tu atención médica, más simple e inteligente.',
    );
    expect(page.querySelector('.tag')?.textContent).toContain('Telemedicina con asistente de IA');
  });

  it('offers sign-in and registration only in the top bar', () => {
    const page = render();
    const authLinks = [...page.querySelectorAll('a')].filter((link) =>
      link.getAttribute('href')?.startsWith('/auth/'),
    );

    expect(authLinks.map((link) => link.getAttribute('href'))).toEqual(['/auth/sign-in', '/auth/register']);
    expect(authLinks.every((link) => link.closest('header.topbar'))).toBe(true);
  });

  it('names the main navigation and describes the photo', () => {
    const page = render();

    expect(page.querySelector('nav')?.getAttribute('aria-label')).toBe('Principal');
    expect(page.querySelector('.hero-photo img')?.getAttribute('alt')).toBe(
      'Profesional de la salud atendiendo a una paciente con una tableta',
    );
  });

  it('loads the brand typeface once, since the shell index does not', () => {
    render();
    TestBed.createComponent(LandingPage).detectChanges();

    const links = document.head.querySelectorAll('link[data-tm-font]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toContain('family=Manrope');
  });
});
