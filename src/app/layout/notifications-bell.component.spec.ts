import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ApiClientService } from '../core/http/api-client.service';
import { NotificationsBellComponent } from './notifications-bell.component';

@Component({ standalone: true, template: '' })
class StubComponent {}

async function renderBell(...responses: Array<() => Observable<unknown>>) {
  const get = vi.fn();
  for (const response of responses) {
    get.mockImplementationOnce(response);
  }

  await TestBed.configureTestingModule({
    imports: [NotificationsBellComponent],
    providers: [
      provideRouter([
        { path: 'notifications', component: StubComponent },
        { path: 'documents', component: StubComponent },
      ]),
      { provide: ApiClientService, useValue: { get } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(NotificationsBellComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  const element = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    get,
    router: TestBed.inject(Router),
    link: () => element.querySelector<HTMLAnchorElement>('a[href="/notifications"]'),
    badge: () => element.querySelector('.bell__badge'),
  };
}

describe('NotificationsBellComponent', () => {
  it('opens the inbox and shows the unread count', async () => {
    const { get, link, badge } = await renderBell(() => of({ unreadCount: 3 }));

    expect(get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(link()?.getAttribute('aria-label')).toBe('Notificaciones, 3 sin leer');
    expect(badge()?.textContent?.trim()).toBe('3');
  });

  it('caps the badge at 9+', async () => {
    const { link, badge } = await renderBell(() => of({ unreadCount: 12 }));

    expect(link()?.getAttribute('aria-label')).toBe('Notificaciones, 12 sin leer');
    expect(badge()?.textContent?.trim()).toBe('9+');
  });

  it('shows no badge when everything is read', async () => {
    const { link, badge } = await renderBell(() => of({ unreadCount: 0 }));

    expect(link()?.getAttribute('aria-label')).toBe('Notificaciones');
    expect(badge()).toBeNull();
  });

  it('stays a plain link when the count cannot be read', async () => {
    const { link, badge } = await renderBell(() => throwError(() => ({ status: 0, code: 'TIMEOUT' })));

    expect(link()?.getAttribute('aria-label')).toBe('Notificaciones');
    expect(badge()).toBeNull();
  });

  it('reads the count again after each navigation', async () => {
    const { fixture, get, router, badge } = await renderBell(
      () => of({ unreadCount: 3 }),
      () => of({ unreadCount: 0 }),
    );

    await router.navigateByUrl('/documents');
    fixture.detectChanges();

    expect(get).toHaveBeenCalledTimes(2);
    expect(badge()).toBeNull();
  });
});
