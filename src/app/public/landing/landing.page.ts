import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from './reveal.directive';

const BRAND_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';

const STEPS = [
  { title: 'Crea tu cuenta', text: 'Regístrate con tu correo y tu documento en un minuto.' },
  { title: 'Agenda tu cita', text: 'Elige el profesional y el horario que mejor te queden.' },
  { title: 'Cuéntale al asistente', text: 'Antes de la consulta, describe con tus palabras lo que sientes.' },
  { title: 'Responde sus preguntas', text: 'Te hace preguntas de seguimiento para entender tu caso.' },
  { title: 'Llega a tu consulta', text: 'Tu médico recibe el resumen antes de verte.' },
] as const;

/**
 * Public front door of TeleMed IA, shown at / to visitors without a
 * session. Sign-in and registration live in the identity portal (/auth).
 */
@Component({
  selector: 'app-landing-page',
  imports: [RevealDirective, RouterLink],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  protected readonly steps = STEPS;

  private readonly document = inject(DOCUMENT);

  constructor() {
    ensureBrandFont(this.document);
  }

  /** In-page links without depending on the shell's router scrolling options. */
  protected scrollTo(id: string, event: Event): void {
    event.preventDefault();
    this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/** The shell's index.html loads no web font; the landing page brings its own, once. */
function ensureBrandFont(document: Document): void {
  if (document.head.querySelector('link[data-tm-font]')) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = BRAND_FONT_HREF;
  link.dataset['tmFont'] = '';
  document.head.appendChild(link);
}
