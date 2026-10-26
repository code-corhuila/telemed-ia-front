import { Routes } from '@angular/router';

import { MountedRemoteComponent } from './mounted-remote.component';

/**
 * Routes for the Notifications portal (HU-17/HU-18). It is written in React,
 * so the shell mounts it and hands it the shell bridge instead of routes.
 */
export const NOTIFICATIONS_REMOTE_ROUTES: Routes = [
  {
    path: '',
    component: MountedRemoteComponent,
    data: { remoteName: 'notifications' },
  },
];
