import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { ShellLayoutComponent } from './shell-layout.component';

describe('ShellLayoutComponent', () => {
  it('shows navigation to the Intelligent Agent portal', async () => {
    await TestBed.configureTestingModule({
      imports: [ShellLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ShellLayoutComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    const agentLink = element.querySelector<HTMLAnchorElement>(
      'a[href="/agent"]',
    );

    expect(agentLink).toBeTruthy();
    expect(agentLink?.textContent).toContain('Asistente IA');
  });
});