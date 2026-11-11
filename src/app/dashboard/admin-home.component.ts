import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessionService } from '../core/auth/session.service';
import { firstName } from './first-name';

/**
 * Home of an administrator: shortcuts to the administration remotes
 * (Accounts from identity, Professionals from professional management)
 * instead of the patient dashboard.
 */
@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomeComponent {
  private readonly session = inject(SessionService);

  protected readonly firstName = computed(
    () => firstName(this.session.getName()),
  );
}
