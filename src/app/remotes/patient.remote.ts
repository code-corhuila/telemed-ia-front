import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

/**
 * Routes for the patient-management portal, loaded lazily as a remote.
 * If the remote is down, the shell shows "portal unavailable" instead of
 * crashing the whole app (norm: portal isolation).
 */
export const PATIENT_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../core/errors/remote-unavailable.component').then(
        (m) => m.RemoteUnavailableComponent,
      ),
    children: [
      {
        path: '**',
        loadComponent: () =>
          loadRemoteModule({
            remoteName: 'patient',
            exposedModule: './routes',
          }).then((m) => m.PATIENT_ROUTES),
      },
    ],
  },
];