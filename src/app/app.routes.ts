import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./core/auth/sign-in.component').then(
        (m) => m.SignInComponent,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell-layout.component').then(
        (m) => m.ShellLayoutComponent,
      ),
    children: [
      {
        path: 'patient',
        loadChildren: () =>
          import('./remotes/patient.remote').then(
            (m) => m.PATIENT_REMOTE_ROUTES,
          ),
      },
      {
        path: 'agent',
        loadChildren: () =>
          import('./remotes/agent.remote').then(
            (m) => m.AGENT_REMOTE_ROUTES,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'patient',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./layout/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];