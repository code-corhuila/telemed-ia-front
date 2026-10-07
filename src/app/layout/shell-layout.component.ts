import {
  ChangeDetectionStrategy,
  Component,
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
  templateUrl: './shell-layout.component.html',
  styleUrl: './shell-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected isAgentRoute(): boolean {
    return this.router.url.startsWith('/agent');
  }

  protected signOut(): void {
    this.session.signOut();
    this.router.navigateByUrl('/sign-in');
  }
}