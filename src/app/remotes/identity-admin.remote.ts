import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/**
 * Administration → Accounts (FR-012), exposed by the identity-and-access
 * portal as `./admin` and mounted under /accounts inside the authGuard.
 * identity-api answers 403 to anyone but an administrator.
 *
 * If the remote is unavailable, only this section displays the fallback;
 * the rest of the shell remains available.
 */
export const IDENTITY_ADMIN_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'identity',
        exposedModule: './admin',
      })
        .then((module) => module.routes)
        .catch(() => [
          {
            path: '**',
            component: RemoteUnavailableComponent,
          },
        ]),
  },
];
