import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, filter, map, merge, of, startWith, switchMap, timer } from 'rxjs';

import { ApiClientService } from '../core/http/api-client.service';

/** How often the count is read while the user stays on one page. */
const REFRESH_MS = 60_000;

/**
 * Topbar bell (HU-17): opens the notifications inbox and shows how many are
 * unread. The count is read on load, after each navigation (leaving the inbox
 * included) and every minute. A failure only hides the badge.
 */
@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a
      class="bell"
      routerLink="/notifications"
      routerLinkActive="bell--active"
      title="Notificaciones"
      [attr.aria-label]="label()"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      @if (badge(); as text) {
        <span class="bell__badge" aria-hidden="true">{{ text }}</span>
      }
    </a>
  `,
  styles: `
    .bell {
      position: relative;
      display: grid;
      width: 36px;
      height: 36px;
      place-items: center;
      border: 1px solid #e5eaf1;
      border-radius: 50%;
      background: #fff;
      color: #526178;
      transition: background 150ms ease;
    }
    .bell:hover { background: #f7f9fc; }
    .bell--active { border-color: #2c6bed; color: #2c6bed; }
    .bell:focus-visible { outline: 3px solid #9cc3f5; outline-offset: 2px; }
    .bell__badge {
      position: absolute;
      top: -5px;
      right: -6px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border: 2px solid #fff;
      border-radius: 999px;
      background: #2c6bed;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      line-height: 14px;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsBellComponent {
  private readonly api = inject(ApiClientService);
  private readonly router = inject(Router);

  private readonly unreadCount = toSignal(
    merge(timer(REFRESH_MS, REFRESH_MS), this.router.events.pipe(filter((event) => event instanceof NavigationEnd))).pipe(
      startWith(null),
      switchMap(() =>
        this.api.get<{ unreadCount: number }>('/notifications/unread-count').pipe(
          map(({ unreadCount }) => unreadCount),
          catchError(() => of(0)),
        ),
      ),
    ),
    { initialValue: 0 },
  );

  protected readonly badge = computed(() => {
    const count = this.unreadCount();
    if (count <= 0) {
      return null;
    }
    return count > 9 ? '9+' : String(count);
  });

  protected readonly label = computed(() => {
    const count = this.unreadCount();
    return count > 0 ? `Notificaciones, ${count} sin leer` : 'Notificaciones';
  });
}
