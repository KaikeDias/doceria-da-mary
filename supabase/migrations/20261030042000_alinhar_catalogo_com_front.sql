-- =====================================================================
-- Alinha o banco ao modelo do front (features/catalog/catalog.ts,
-- features/admin/menu-store.ts e specs do painel).
--
-- 1. categorias: nome curto (chip) + rótulo (cards e painel), slugs iguais aos ids do front
-- 2. produtos: detalhes, observação de preço, "Bom saber" e limites do formulário
-- 3. views recriadas com as colunas novas
-- 4. dados atualizados para ficarem iguais ao catálogo do front
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) CATEGORIAS
-- ---------------------------------------------------------------------
-- Front: Category { id, name ("Kits"), label ("Kits e presentes"), image }
alter table public.categorias
  add column rotulo text;

update public.categorias set rotulo = nome::text;

update public.categorias
   set nome = 'Kits', slug = 'kits', rotulo = 'Kits e presentes'
 where slug = 'kits-e-presentes';

alter table public.categorias
  alter column rotulo set not null,
  add constraint categorias_rotulo_nao_vazio check (length(trim(rotulo)) > 0);

-- Imagem do card: caminho relativo ao site (ex.: images/chocolate-cake.webp)
-- ou caminho no bucket "site". Nulo = sem imagem.
update public.categorias c
   set imagem_url = v.imagem
  from (values
    ('bolos',      'images/chocolate-cake.webp'),
    ('docinhos',   'images/brigadeiros.webp'),
    ('sobremesas', 'images/dessert-cup.webp'),
    ('kits',       'images/sweet-box.webp')
  ) as v(slug, imagem)
 where c.slug = v.slug;

-- Categoria que o painel já exibe (RN05/RN07 de painel-admin-categorias): oculta
insert into public.categorias (nome, slug, rotulo, visivel, ordem)
values ('Datas especiais', 'datas-especiais', 'Datas especiais', false, 5)
on conflict (nome) do nothing;

-- ---------------------------------------------------------------------
-- 2) PRODUTOS
-- ---------------------------------------------------------------------
-- Front: Product { details, priceNote, information[] }
alter table public.produtos
  add column detalhes         text,
  add column observacao_preco text,
  add column informacoes      jsonb not null default '[]'::jsonb;

-- "Bom saber": [{ "icon": "clock" | "snowflake" | "info", "text": "..." }]
create or replace function public.informacoes_validas(dados jsonb)
returns boolean
language sql
immutable
as $$
  select jsonb_typeof(dados) = 'array'
     and not exists (
       select 1
       from jsonb_array_elements(dados) item
       where jsonb_typeof(item) <> 'object'
          or item->>'icon' is null
          or item->>'icon' not in ('clock', 'snowflake', 'info')
          or coalesce(length(trim(item->>'text')), 0) = 0
     );
$$;

alter table public.produtos
  add constraint produtos_informacoes_validas check (public.informacoes_validas(informacoes)),
  -- Limites do formulário (RN04, RN06 e RN07 de formulario-produto-cardapio)
  add constraint produtos_nome_max       check (length(nome) <= 80),
  add constraint produtos_descricao_max  check (descricao is null or length(descricao) <= 300),
  add constraint produtos_preco_max      check (preco is null or preco <= 99999.99);

-- ---------------------------------------------------------------------
-- 3) VIEWS (recriadas para incluir as colunas novas)
-- ---------------------------------------------------------------------
drop view if exists public.categorias_com_contagem;
drop view if exists public.cardapio_publico;

create view public.categorias_com_contagem
with (security_invoker = true) as
select c.id,
       c.nome,
       c.slug,
       c.rotulo,
       c.imagem_url,
       c.visivel,
       c.ordem,
       c.created_at,
       c.updated_at,
       count(p.id)::int as total_produtos
from public.categorias c
left join public.produtos p on p.categoria_id = c.id
group by c.id;

-- Produto aparece no site se estiver publicado E a categoria estiver visível
-- (ou se não tiver categoria). Categoria oculta esconde os doces dela no site.
create view public.cardapio_publico
with (security_invoker = true) as
select p.id,
       p.slug,
       p.nome,
       p.descricao,
       p.detalhes,
       p.preco,
       p.preco_a_partir,
       p.observacao_preco,
       p.informacoes,
       p.ordem,
       c.id     as categoria_id,
       c.nome   as categoria_nome,
       c.rotulo as categoria_rotulo,
       c.slug   as categoria_slug,
       img.storage_path as imagem_principal
from public.produtos p
left join public.categorias c on c.id = p.categoria_id
left join lateral (
  select storage_path
  from public.produto_imagens i
  where i.produto_id = p.id
  order by i.posicao
  limit 1
) img on true
where p.publicado
  and (p.categoria_id is null or c.visivel is true);

-- ---------------------------------------------------------------------
-- 4) DADOS: iguais ao catálogo do front
-- ---------------------------------------------------------------------
update public.produtos p
   set slug             = v.slug_novo,
       descricao        = v.descricao,
       detalhes         = v.detalhes,
       observacao_preco = v.observacao
  from (values
    ('bolo-de-chocolate',   'bolo-chocolate',
     'Massa fofinha com recheio cremoso e cobertura generosa de chocolate.',
     'Massa fofinha de chocolate, recheio cremoso de brigadeiro e cobertura generosa de ganache, finalizado com rosetas de buttercream de chocolate. Um clássico feito do jeito que a gente gosta: bem servido e cheio de sabor.',
     'Valor varia conforme tamanho e decoração'),
    ('brigadeiros-gourmet', 'brigadeiros',
     'Pequenos clássicos, feitos à mão e finalizados com muito carinho.',
     null, null),
    ('brownie-recheado',    'brownie',
     'Casquinha delicada, interior úmido e uma surpresa a cada mordida.',
     'Casquinha delicada por fora, interior úmido e bem chocolatudo — com uma surpresa cremosa escondida em cada mordida. Perfeito para um café da tarde ou para presentear alguém especial.',
     null),
    ('bolo-de-morango',     'bolo-morango',
     'Camadas leves, creme suave e morangos frescos para celebrar.',
     null, null),
    ('copo-da-felicidade',  'copo-felicidade',
     'Cremes, pedacinhos de bolo e muito sabor em cada colherada.',
     null, null),
    ('caixa-de-docinhos',   'caixa-docinhos',
     'Uma seleção delicada para presentear ou compartilhar bons momentos.',
     null, null)
  ) as v(slug_antigo, slug_novo, descricao, detalhes, observacao)
 where p.slug = v.slug_antigo;

-- Foto principal de cada produto do seed.
-- Os arquivos precisam ser enviados ao bucket "produtos" na pasta "seed/"
-- (mesmos nomes de public/images).
insert into public.produto_imagens (produto_id, storage_path, alt, posicao)
select p.id, 'seed/' || v.arquivo, p.nome, 0
from (values
  ('bolo-chocolate',  'chocolate-cake.webp'),
  ('brigadeiros',     'brigadeiros.webp'),
  ('brownie',         'brownie.webp'),
  ('bolo-morango',    'strawberry-cake.webp'),
  ('copo-felicidade', 'dessert-cup.webp'),
  ('caixa-docinhos',  'sweet-box.webp')
) as v(slug, arquivo)
join public.produtos p on p.slug = v.slug
where not exists (
  select 1 from public.produto_imagens i
  where i.produto_id = p.id and i.posicao = 0
);
