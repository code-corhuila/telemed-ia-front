import { describe, expect, it } from 'vitest';

import { firstName } from './first-name';

describe('firstName', () => {
  it('returns the first word of the full name', () => {
    expect(firstName('Laura Navegador')).toBe('Laura');
  });

  it('skips a leading title such as "Dr." or "Dra."', () => {
    expect(firstName('Dr. Andres Navegador')).toBe('Andres');
    expect(firstName('Dra. María Gómez')).toBe('María');
  });

  it('keeps the title when it is the only word', () => {
    expect(firstName('Dr.')).toBe('Dr.');
  });

  it('returns an empty string for a blank name', () => {
    expect(firstName('   ')).toBe('');
  });
});
