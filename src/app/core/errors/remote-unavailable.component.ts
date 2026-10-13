import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-remote-unavailable',
  standalone: true,
  template: `
    <section class="state state--error" role="alert">
      <h2>Este portal no está disponible en este momento.</h2>
      <p>El resto de la aplicación sigue funcionando.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoteUnavailableComponent {}