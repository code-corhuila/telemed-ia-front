import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/**
 * Routes for the appointment-scheduling portal, loaded lazily as a remote.
 *
 * If the remote is down, only this section shows "portal unavailable";
 * the rest of the shell keeps working.
 */
export const APPOINTMENT_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'appointment',
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