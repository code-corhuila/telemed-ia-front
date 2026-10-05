import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardStat {
  readonly label: string;
  readonly value: string;
}

interface UpcomingAppointment {
  readonly specialty: string;
  readonly professional: string;
  readonly date: string;
  readonly time: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly patientName = 'Paciente';

  protected readonly stats: readonly DashboardStat[] = [
    {
      label: 'Consultas realizadas',
      value: '0',
    },
    {
      label: 'Próxima cita',
      value: 'Sin citas próximas',
    },
    {
      label: 'Historial',
      value: 'Sin registros recientes',
    },
  ];

  protected readonly upcomingAppointments:
    readonly UpcomingAppointment[] = [];
}