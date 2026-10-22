import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

const BRAND_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';

/**
 * Public front door of TeleMed IA, shown at / to visitors without a
 * session. Sign-in and registration live in the identity portal (/auth).
 */
@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  constructor() {
    ensureBrandFont(inject(DOCUMENT));
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
