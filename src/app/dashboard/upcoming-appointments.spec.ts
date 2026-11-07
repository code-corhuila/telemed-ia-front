import { describe, expect, it } from 'vitest';

import {
  AppointmentSummary,
  formatAppointmentStart,
  upcomingAppointments,
} from './upcoming-appointments';

function appointment(
  id: string,
  start: string,
  status: string,
): AppointmentSummary {
  return { id, start, status };
}

const NOW = new Date('2026-11-07T15:00:00Z');

describe('upcomingAppointments', () => {
  it('keeps only confirmed or rescheduled appointments that have not started, soonest first', () => {
    const result = upcomingAppointments(
      [
        appointment('later', '2026-11-20T14:00:00Z', 'RESCHEDULED'),
        appointment('past', '2026-11-01T14:00:00Z', 'CONFIRMED'),
        appointment('cancelled', '2026-11-10T14:00:00Z', 'CANCELLED'),
        appointment('completed', '2026-11-12T14:00:00Z', 'COMPLETED'),
        appointment('no-show', '2026-11-13T14:00:00Z', 'NO_SHOW'),
        appointment('soon', '2026-11-08T13:00:00Z', 'CONFIRMED'),
      ],
      NOW,
      5,
    );

    expect(result.map((item) => item.id)).toEqual(['soon', 'later']);
  });

  it('drops an appointment that starts right now', () => {
    const result = upcomingAppointments(
      [appointment('now', NOW.toISOString(), 'CONFIRMED')],
      NOW,
      5,
    );

    expect(result).toEqual([]);
  });

  it('returns at most the requested number of appointments', () => {
    const result = upcomingAppointments(
      [
        appointment('a', '2026-11-08T13:00:00Z', 'CONFIRMED'),
        appointment('b', '2026-11-09T13:00:00Z', 'CONFIRMED'),
        appointment('c', '2026-11-10T13:00:00Z', 'CONFIRMED'),
      ],
      NOW,
      2,
    );

    expect(result.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('ignores an appointment whose start is not a valid date', () => {
    const result = upcomingAppointments(
      [appointment('broken', 'not-a-date', 'CONFIRMED')],
      NOW,
      5,
    );

    expect(result).toEqual([]);
  });
});

describe('formatAppointmentStart', () => {
  it('shows the date and the 24-hour time in Bogotá', () => {
    // 13:00 UTC is 08:00 in Bogotá (UTC-5, no daylight saving time).
    const formatted = formatAppointmentStart('2026-11-09T13:00:00Z');

    expect(formatted.date).toContain('9 de noviembre');
    expect(formatted.date.toLowerCase()).toContain('lunes');
    expect(formatted.time).toBe('08:00');
  });
});
