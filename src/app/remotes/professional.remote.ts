import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/**
 * Routes for the Professional Management portal (administrators), loaded lazily as a remote.
 *
 * If the remote is unavailable, only this section displays the fallback;
 * the rest of the shell remains available.
 */
export const PROFESSIONAL_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'professional',
        exposedModule: './routes',
      })
        .then((module) => module.PROFESSIONAL_ROUTES)
        .catch(() => [
          {
            path: '**',
            component: RemoteUnavailableComponent,
          },
        ]),
  },
];
