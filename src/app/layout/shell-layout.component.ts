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

import { SessionService } from '../core/auth/session.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
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

  protected readonly roleLabel =
    computed(() => {
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

  protected signOut(): void {
    this.session.signOut();
    void this.router.navigateByUrl(
      '/sign-in',
    );
  }
}