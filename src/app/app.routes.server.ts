import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'admin', renderMode: RenderMode.Prerender },
  { path: 'admin/cardapio', renderMode: RenderMode.Prerender },
  { path: 'admin/categorias', renderMode: RenderMode.Prerender },
];
