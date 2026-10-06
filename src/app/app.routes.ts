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
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
      },
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
        path: 'appointment',
        loadChildren: () =>
          import('./remotes/appointment.remote').then(
            (m) => m.APPOINTMENT_REMOTE_ROUTES,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
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