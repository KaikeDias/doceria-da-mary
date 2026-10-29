import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';
import { MenuStore } from './features/admin/menu-store';

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
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cardapio' },
      {
        path: 'cardapio',
        title: 'Cardápio | Painel Doceria da Mary',
        loadComponent: () => import('./features/admin/cardapio').then((m) => m.Cardapio),
      },
      {
        path: 'cardapio/novo',
        title: 'Novo produto | Painel Doceria da Mary',
        loadComponent: () => import('./features/admin/produto-form').then((m) => m.ProdutoForm),
      },
      {
        path: 'cardapio/:id/editar',
        title: 'Editar produto | Painel Doceria da Mary',
        canActivate: [
          (route: ActivatedRouteSnapshot) =>
            !!inject(MenuStore).find(route.paramMap.get('id')!) ||
            inject(Router).createUrlTree(['/admin/cardapio']),
        ],
        loadComponent: () => import('./features/admin/produto-form').then((m) => m.ProdutoForm),
      },
      {
        path: 'categorias',
        title: 'Categorias | Painel Doceria da Mary',
        loadComponent: () => import('./features/admin/categorias').then((m) => m.Categorias),
      },
    ],
  },
];
