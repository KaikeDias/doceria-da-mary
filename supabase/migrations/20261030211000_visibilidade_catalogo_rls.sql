alter policy "público lê produtos publicados" on public.produtos
using (public.is_admin() or (
  publicado and (categoria_id is null or exists (
    select 1 from public.categorias c where c.id = categoria_id and c.visivel
  ))
));

alter policy "público lê imagens de produtos publicados" on public.produto_imagens
using (public.is_admin() or exists (
  select 1 from public.produtos p where p.id = produto_id and p.publicado
));
