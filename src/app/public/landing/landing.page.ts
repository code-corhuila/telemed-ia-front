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

/** Icons are 24×24 stroke paths. */
const BENEFITS = [
  {
    title: 'Disponible a toda hora',
    text: 'Prepara tu consulta con el asistente de día o de noche.',
    icon: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  },
  {
    title: 'Agenda sin llamadas',
    text: 'Consulta horarios disponibles y reserva en minutos.',
    icon: 'M4 7h16v13H4zM4 11h16M9 3v5M15 3v5',
  },
  {
    title: 'Tu médico llega preparado',
    text: 'Recibe un resumen claro de tus síntomas antes de la cita.',
    icon: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  },
  {
    title: 'La atención adecuada',
    text: 'Te orientamos hacia el tipo de profesional que necesitas.',
    icon: 'M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z',
  },
  {
    title: 'Todo en un solo lugar',
    text: 'Tus citas, consultas y documentos, siempre a mano.',
    icon: 'M3 7h7l2 2h9v10H3zM3 7V5h6',
  },
  {
    title: 'Privacidad y seguridad',
    text: 'Tu información médica protegida con control de acceso.',
    icon: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6zM9 12l2 2 4-4',
  },
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
  protected readonly benefits = BENEFITS;

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
