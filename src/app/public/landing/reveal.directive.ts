import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Fades an element in the first time it scrolls into view (adds `is-in`).
 * Without IntersectionObserver the element is shown straight away.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const Observer = inject(DOCUMENT).defaultView?.IntersectionObserver;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!Observer) {
        element.classList.add('is-in');
        return;
      }
      const observer = new Observer(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add('is-in');
            observer.disconnect();
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
