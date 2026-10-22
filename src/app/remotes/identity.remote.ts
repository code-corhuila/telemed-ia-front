import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/**
 * Routes for the identity-and-access portal (sign-in, register, password
 * recovery), loaded lazily as a remote under /auth.
 *
 * If the remote is down, only this section shows "portal unavailable";
 * the rest of the shell keeps working.
 */
export const IDENTITY_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'identity',
        exposedModule: './routes',
      })
        .then((m) => m.routes)
        .catch(() => [
          {
            path: '**',
            component: RemoteUnavailableComponent,
          },
        ]),
  },
];
