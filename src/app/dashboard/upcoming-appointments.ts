/** The fields of an appointment-scheduling-api appointment that the home uses. */
export interface AppointmentSummary {
  readonly id: string;
  readonly start: string;
  readonly status: string;
}

/** One page of `GET /appointments/{patient|professional}/{id}`. */
export interface AppointmentPage {
  readonly data: readonly AppointmentSummary[];
}

/** Only these can still take place. */
const ACTIVE_STATUSES = new Set(['CONFIRMED', 'RESCHEDULED']);

// Appointments are booked and shown in Colombian time, whatever the browser's zone.
const TIME_ZONE = 'America/Bogota';

const DATE_FORMAT = new Intl.DateTimeFormat('es-CO', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const TIME_FORMAT = new Intl.DateTimeFormat('es-CO', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Confirmed or rescheduled appointments that have not started yet, soonest first. */
export function upcomingAppointments(
  appointments: readonly AppointmentSummary[],
  now: Date,
  max: number,
): AppointmentSummary[] {
  return appointments
    .filter((appointment) => ACTIVE_STATUSES.has(appointment.status))
    .map((appointment) => ({ appointment, startsAt: Date.parse(appointment.start) }))
    .filter(({ startsAt }) => !Number.isNaN(startsAt) && startsAt > now.getTime())
    .sort((left, right) => left.startsAt - right.startsAt)
    .slice(0, max)
    .map(({ appointment }) => appointment);
}

export function formatAppointmentStart(start: string): { date: string; time: string } {
  const startsAt = new Date(start);
  return { date: DATE_FORMAT.format(startsAt), time: TIME_FORMAT.format(startsAt) };
}
