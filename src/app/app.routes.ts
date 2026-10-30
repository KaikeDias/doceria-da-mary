import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { CanActivateFn, GuardResult, Routes } from '@angular/router';

// Guardas carregadas sob demanda: o supabase-js fica fora do bundle inicial da landing.
function lazy(load: () => Promise<CanActivateFn>): CanActivateFn {
  return (route, state) => {
    const injector = inject(EnvironmentInjector);
    return load().then(
      (guard) => runInInjectionContext(injector, () => guard(route, state)) as Promise<GuardResult>,
    );
  };
}

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
    canActivate: [lazy(() => import('./core/auth/auth').then((m) => m.guestGuard))],
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    canActivate: [lazy(() => import('./core/auth/auth').then((m) => m.adminGuard))],
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
        canActivate: [lazy(() => import('./features/admin/menu-store').then((m) => m.menuReady))],
        loadComponent: () => import('./features/admin/produto-form').then((m) => m.ProdutoForm),
      },
      {
        path: 'cardapio/:id/editar',
        title: 'Editar produto | Painel Doceria da Mary',
        canActivate: [lazy(() => import('./features/admin/menu-store').then((m) => m.menuReady))],
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
