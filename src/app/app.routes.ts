import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './public/guest.guard';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./core/auth/sign-in.component').then(
        (m) => m.SignInComponent,
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./remotes/identity.remote').then(
        (m) => m.IDENTITY_REMOTE_ROUTES,
      ),
  },
  {
    // Only "/" (a matcher, so the authenticated shell stays the route with path '').
    matcher: (segments) => (segments.length === 0 ? { consumed: [] } : null),
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./public/landing/landing.page').then(
        (m) => m.LandingPage,
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
        path: 'documents',
        loadChildren: () =>
          import('./remotes/document.remote').then(
            (m) => m.DOCUMENT_REMOTE_ROUTES,
          ),
      },
            {
        path: 'consultation',
        loadChildren: () =>
          import('./remotes/consultation.remote').then(
            (m) => m.CONSULTATION_REMOTE_ROUTES,
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