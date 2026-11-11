import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SessionService } from '../core/auth/session.service';
import { ApiClientService } from '../core/http/api-client.service';
import { AdminHomeComponent } from './admin-home.component';
import { firstName } from './first-name';
import {
  AppointmentPage,
  formatAppointmentStart,
  upcomingAppointments,
} from './upcoming-appointments';

type LoadState = 'loading' | 'ready' | 'error';

interface AppointmentCard {
  readonly id: string;
  readonly date: string;
  readonly time: string;
  readonly status: string;
}

// The API sorts newest first, so the first page holds the upcoming appointments.
const PAGE = { page: 1, limit: 100 } as const;
const SHOWN = 5;

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada',
  RESCHEDULED: 'Reprogramada',
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, AdminHomeComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly session = inject(SessionService);
  private readonly api = inject(ApiClientService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly role = this.session.getRole();

  // An administrator gets the administration shortcuts, not an appointments home.
  protected readonly isAdmin = this.role === 'ADMIN';
  protected readonly isProfessional = this.role === 'PROFESSIONAL';

  protected readonly firstName = firstName(this.session.getName()) || 'Usuario';
  protected readonly appointmentsLink = this.isProfessional
    ? '/appointment/professional'
    : '/appointment';

  protected readonly state = signal<LoadState>('loading');
  protected readonly appointments = signal<readonly AppointmentCard[]>([]);
  protected readonly shownAppointments = computed(() => this.appointments().slice(0, SHOWN));
  protected readonly nextAppointment = computed(() => this.appointments()[0] ?? null);

  constructor() {
    if (!this.isAdmin) {
      this.load();
    }
  }

  protected load(): void {
    const userId = this.session.getClaims()?.sub;

    if (!userId) {
      this.state.set('error');
      return;
    }

    this.state.set('loading');
    const owner = this.isProfessional ? 'professional' : 'patient';

    this.api
      .getWithParams<AppointmentPage>(`/appointments/${owner}/${encodeURIComponent(userId)}`, PAGE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.appointments.set(
            upcomingAppointments(page.data ?? [], new Date(), PAGE.limit).map((appointment) => ({
              id: appointment.id,
              ...formatAppointmentStart(appointment.start),
              status: STATUS_LABELS[appointment.status] ?? appointment.status,
            })),
          );
          this.state.set('ready');
        },
        error: () => this.state.set('error'),
      });
  }
}
