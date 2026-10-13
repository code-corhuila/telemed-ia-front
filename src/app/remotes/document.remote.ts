import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/**
 * Routes for the Document Generation portal, loaded lazily as a remote.
 *
 * If the remote is unavailable, only this section displays the fallback;
 * the rest of the shell remains available.
 */
export const DOCUMENT_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'document',
        exposedModule: './routes',
      })
        .then((module) => module.DOCUMENT_ROUTES)
        .catch(() => [
          {
            path: '**',
            component: RemoteUnavailableComponent,
          },
        ]),
  },
];
