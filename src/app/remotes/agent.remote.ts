import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

import { RemoteUnavailableComponent } from '../core/errors/remote-unavailable.component';

/**
 * Routes for the Intelligent Agent portal, loaded lazily as a remote.
 *
 * If the remote is unavailable, only this section displays the fallback;
 * the rest of the shell remains available.
 */
export const AGENT_REMOTE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'agent',
        exposedModule: './routes',
      })
        .then((module) => module.AGENT_ROUTES)
        .catch(() => [
          {
            path: '**',
            component: RemoteUnavailableComponent,
          },
        ]),
  },
];