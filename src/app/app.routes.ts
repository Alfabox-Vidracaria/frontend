import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'cadastro',
        loadChildren: () =>
          import('./pages/register/register.routes').then((m) => m.REGISTER_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
