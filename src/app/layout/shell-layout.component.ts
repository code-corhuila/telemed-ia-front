import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { SessionTermination } from '../core/auth/session-termination.service';
import { SessionService } from '../core/auth/session.service';
import { NotificationsBellComponent } from './notifications-bell.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationsBellComponent,
  ],
  templateUrl:
    './shell-layout.component.html',
  styleUrl:
    './shell-layout.component.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {
  private readonly session =
    inject(SessionService);

  private readonly router =
    inject(Router);

  private readonly termination =
    inject(SessionTermination);

  protected readonly currentName =
    computed(() =>
      this.session.getName(),
    );

  protected readonly currentRole =
    computed(() =>
      this.session.getRole(),
    );

  protected readonly isPatient =
    computed(
      () =>
        this.currentRole() ===
        'PATIENT',
    );

  protected readonly isProfessional =
    computed(
      () =>
        this.currentRole() ===
        'PROFESSIONAL',
    );

  protected readonly isAdmin =
    computed(
      () =>
        this.currentRole() ===
        'ADMIN',
    );

  protected readonly roleLabel =
    computed(() => {
      if (this.isAdmin()) {
        return 'Administrador';
      }

      if (this.isProfessional()) {
        return 'Profesional';
      }

      if (this.isPatient()) {
        return 'Paciente';
      }

      return 'Usuario';
    });

  protected readonly roleDescription =
    computed(() => {
      if (this.isAdmin()) {
        return 'Cuenta de administración';
      }

      if (this.isProfessional()) {
        return 'Cuenta profesional';
      }

      if (this.isPatient()) {
        return 'Cuenta de paciente';
      }

      return 'Cuenta de usuario';
    });

  protected readonly avatarInitial =
    computed(() => {
      const name =
        this.currentName().trim();

      if (!name) {
        return 'U';
      }

      return name
        .charAt(0)
        .toUpperCase();
    });

  protected isAgentRoute(): boolean {
    return this.router.url.startsWith('/agent');
  }

  protected signOut(): void {
    this.termination.end();
    void this.router.navigateByUrl(
      '/auth/sign-in',
    );
  }
}