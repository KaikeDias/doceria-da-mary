import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Doceria da Mary',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    title: 'Login | Doceria da Mary',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
];
