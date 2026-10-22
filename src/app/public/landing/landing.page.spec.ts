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

    expect(page.querySelector('h1')?.textContent).toContain('Tu atención médica, más simple e inteligente.');
  });

  it('sends visitors to the identity portal to create an account or sign in', () => {
    const page = render();
    const hrefs = [...page.querySelectorAll('a')].map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/auth/register');
    expect(hrefs).toContain('/auth/sign-in');
  });

  it('names the main navigation for screen readers', () => {
    const page = render();

    expect(page.querySelector('nav')?.getAttribute('aria-label')).toBe('Principal');
  });

  it('loads the brand typeface once, since the shell index does not', () => {
    render();
    TestBed.createComponent(LandingPage).detectChanges();

    expect(document.head.querySelectorAll('link[data-tm-font]').length).toBe(1);
  });
});
