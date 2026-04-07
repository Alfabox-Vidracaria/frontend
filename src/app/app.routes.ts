import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
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
