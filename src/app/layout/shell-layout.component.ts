import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SessionService } from '../core/auth/session.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="shell-header">
      <span class="brand">TeleMed IA</span>
      <nav>
        <a routerLink="/patient">Paciente</a>
      </nav>
      <button type="button" (click)="signOut()">Salir</button>
    </header>
    <main class="shell-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `.shell-header { display: flex; gap: 1rem; align-items: center; padding: 0.75rem 1rem; background: var(--color-primary); color: white; }
     .brand { font-weight: 600; }
     nav a { color: white; text-decoration: none; }
     .shell-main { padding: 1.5rem; max-width: 960px; margin: 0 auto; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected signOut(): void {
    this.session.signOut();
    this.router.navigateByUrl('/sign-in');
  }
}