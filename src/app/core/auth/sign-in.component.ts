import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from './session.service';

/**
 * DEVELOPMENT-ONLY sign in. Paste a JWT issued by dev-token.sh from -infra.
 * This component is replaced by the identity portal, and MUST NOT reach main.
 */
@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="sign-in">
      <h1>TeleMed IA</h1>
      <p>Pega el token de desarrollo (dev-token.sh del repo <code>-infra</code>).</p>
      <form (submit)="signIn()">
        <div class="field">
          <label for="token">Token</label>
          <textarea
            id="token"
            name="token"
            rows="4"
            [(ngModel)]="token"
            required
            aria-describedby="token-error"
          ></textarea>
          @if (error()) {
            <span id="token-error" class="error">{{ error() }}</span>
          }
        </div>
        <button type="submit" [disabled]="token.trim().length === 0">Entrar</button>
      </form>
    </section>
  `,
  styles: [
    `.sign-in { max-width: 480px; margin: 4rem auto; padding: 2rem; background: white; border: 1px solid var(--color-border); border-radius: 6px; }
     textarea { width: 100%; font-family: monospace; font-size: 0.8rem; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected token = '';
  protected readonly error = signal<string | null>(null);

  protected signIn(): void {
    if (this.token.trim().length === 0) {
      this.error.set('El token no puede estar vacío.');
      return;
    }
    this.session.signIn(this.token.trim());
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/patient';
    this.router.navigateByUrl(returnUrl);
  }
}