import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/**
 * Routes for the patient-management portal, loaded lazily as a remote.
 *
 * If the remote is down, only this section shows "portal unavailable";
 * the rest of the shell keeps working.
 */
export const PATIENT_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'patient',
        exposedModule: './routes',
      })
        .then((m) => m.PATIENT_ROUTES)
        .catch(() => [
          {
            path: '**',
            component: RemoteUnavailableComponent,
          },
        ]),
  },
];