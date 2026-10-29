import { RenderMode, ServerRoute } from '@angular/ssr';
import { products } from './features/catalog/catalog';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'admin', renderMode: RenderMode.Prerender },
  { path: 'admin/cardapio', renderMode: RenderMode.Prerender },
  { path: 'admin/cardapio/novo', renderMode: RenderMode.Prerender },
  {
    path: 'admin/cardapio/:id/editar',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => products.map((product) => ({ id: product.id })),
  },
  { path: 'admin/categorias', renderMode: RenderMode.Prerender },
];
