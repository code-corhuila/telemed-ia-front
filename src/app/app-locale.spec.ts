import { DatePipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { appConfig } from './app.config';

// Remotes are mounted as shell routes, so their date pipes use the shell's locale.
describe('shell locale', () => {
  it('formats dates in Colombian Spanish', () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });

    const locale = TestBed.inject(LOCALE_ID);
    const thursday = '2026-11-12T14:00:00Z';

    expect(locale).toBe('es-CO');
    expect(new DatePipe(locale).transform(thursday, "EEEE, d 'de' MMMM", 'UTC')).toBe(
      'jueves, 12 de noviembre',
    );
  });
});
