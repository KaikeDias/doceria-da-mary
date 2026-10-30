-- =====================================================================
-- Doceria da Mary — esquema do banco (Supabase / Postgres)
-- Rode tudo de uma vez no SQL Editor do Supabase.
--
-- Telas atendidas:
--   Landing (cardápio + filtros), Detalhes do produto, Login do painel,
--   Admin > Cardápio, Admin > Novo/Editar produto, Admin > Categorias,
--   Admin > Configurações do site.
-- Login: usa o Supabase Auth (e-mail + senha). Não precisa de tabela de senha.
-- =====================================================================

create extension if not exists citext;

-- ---------------------------------------------------------------------
-- Função utilitária: atualiza updated_at automaticamente
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1) ADMINISTRADORES  (quem pode entrar no painel)
--    Liga um usuário do Supabase Auth ao papel de admin.
-- ---------------------------------------------------------------------
create table public.administradores (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nome       text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.administradores where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 2) CATEGORIAS  (Admin > Categorias / chips de filtro na landing)
-- ---------------------------------------------------------------------
create table public.categorias (
  id          uuid primary key default gen_random_uuid(),
  nome        citext not null unique,                -- "Já existe uma categoria com esse nome"
  slug        text   not null unique,
  imagem_url  text,                                  -- card "Encontre seu doce favorito"
  visivel     boolean not null default true,         -- "Mostrar no site"
  ordem       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categorias_nome_nao_vazio check (length(trim(nome)) > 0)
);

create trigger trg_categorias_updated_at
before update on public.categorias
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3) PRODUTOS  (Admin > Cardápio, Novo/Editar produto, cards e detalhes)
-- ---------------------------------------------------------------------
create table public.produtos (
  id             uuid primary key default gen_random_uuid(),
  categoria_id   uuid references public.categorias (id) on delete set null,
                 -- excluir categoria: "os doces continuam salvos, mas ficam sem categoria"
  nome           text not null,
  slug           text not null unique,
  descricao      text,
  preco          numeric(10,2),                      -- null = "Sob consulta"
  preco_a_partir boolean not null default false,     -- "Exibir preço como 'A partir de'"
  publicado      boolean not null default true,      -- "Status no site": Publicado / Oculto
  ordem          integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint produtos_nome_nao_vazio   check (length(trim(nome)) > 0),
  constraint produtos_preco_positivo   check (preco is null or preco >= 0),
  constraint produtos_a_partir_com_preco check (preco_a_partir = false or preco is not null)
);

create index produtos_categoria_idx on public.produtos (categoria_id);
create index produtos_publicado_idx on public.produtos (publicado) where publicado;

create trigger trg_produtos_updated_at
before update on public.produtos
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4) IMAGENS DOS PRODUTOS  (até 5 por produto; posição 0 = principal)
--    O arquivo fica no Storage (bucket "produtos"); aqui guardamos o caminho.
-- ---------------------------------------------------------------------
create table public.produto_imagens (
  id           uuid primary key default gen_random_uuid(),
  produto_id   uuid not null references public.produtos (id) on delete cascade,
  storage_path text not null,                        -- ex.: produtos/<produto_id>/<arquivo>.webp
  alt          text,
  posicao      smallint not null default 0,          -- 0 = "Principal" (aparece no cardápio)
  created_at   timestamptz not null default now(),
  constraint produto_imagens_posicao_valida check (posicao between 0 and 4),
  constraint produto_imagens_posicao_unica unique (produto_id, posicao)
    deferrable initially deferred                     -- permite reordenar numa transação
);

create index produto_imagens_produto_idx on public.produto_imagens (produto_id);

-- Limite de 5 fotos por doce ("Você já adicionou 5 fotos, o máximo por doce.")
create or replace function public.limitar_imagens_produto()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.produto_imagens where produto_id = new.produto_id) >= 5 then
    raise exception 'Um produto pode ter no máximo 5 imagens.';
  end if;
  return new;
end;
$$;

create trigger trg_limitar_imagens_produto
before insert on public.produto_imagens
for each row execute function public.limitar_imagens_produto();

-- ---------------------------------------------------------------------
-- 5) CONFIGURAÇÕES DO SITE  (Admin > Configurações — linha única)
-- ---------------------------------------------------------------------
create table public.configuracoes_site (
  id                    smallint primary key default 1,
  -- 1. Identidade
  nome_doceria          text not null default 'Doceria da Mary',
  texto_apresentacao    text,                        -- slogan abaixo do nome
  descricao             text,                        -- rodapé / compartilhamento
  logo_path             text,                        -- Storage: bucket "site"
  -- 2. Contato
  whatsapp              text,                        -- só dígitos, DDD + número (sem +55)
  instagram             text,                        -- só o @, sem link
  email_contato         text,
  mensagem_whatsapp     text,                        -- mensagem padrão dos botões gerais
  -- 3. Atendimento
  horario_atendimento   text,
  regiao_atendida       text,
  endereco              text,
  texto_encomendas      text,
  -- 4. Conteúdo da landing
  hero_titulo           text not null default 'Adoçando seus momentos mais especiais.',
  hero_subtitulo        text,
  hero_imagem_path      text,                        -- Storage: bucket "site"
  sobre_texto           text,
  cta_encomendas_titulo text,
  updated_at            timestamptz not null default now(),

  constraint configuracoes_linha_unica   check (id = 1),
  constraint configuracoes_whatsapp_ok   check (whatsapp is null or whatsapp ~ '^[0-9]{10,11}$'),
  constraint configuracoes_instagram_ok  check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  constraint configuracoes_email_ok      check (email_contato is null or email_contato ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  constraint configuracoes_titulo_ok     check (length(trim(hero_titulo)) > 0)
);

create trigger trg_configuracoes_updated_at
before update on public.configuracoes_site
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 6) VIEWS de apoio
-- ---------------------------------------------------------------------
-- Admin > Categorias: coluna "Produtos" (ex.: "2 produtos")
create view public.categorias_com_contagem
with (security_invoker = true) as
select c.*,
       count(p.id)::int as total_produtos
from public.categorias c
left join public.produtos p on p.categoria_id = c.id
group by c.id;

-- Landing: cardápio público já com categoria e imagem principal
create view public.cardapio_publico
with (security_invoker = true) as
select p.id,
       p.slug,
       p.nome,
       p.descricao,
       p.preco,
       p.preco_a_partir,
       p.ordem,
       c.id    as categoria_id,
       c.nome  as categoria_nome,
       c.slug  as categoria_slug,
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
where p.publicado;

-- ---------------------------------------------------------------------
-- 7) ROW LEVEL SECURITY
--    Visitante (anon): só lê o que está publicado/visível.
--    Admin (logado e cadastrado em administradores): lê e escreve tudo.
-- ---------------------------------------------------------------------
alter table public.administradores    enable row level security;
alter table public.categorias         enable row level security;
alter table public.produtos           enable row level security;
alter table public.produto_imagens    enable row level security;
alter table public.configuracoes_site enable row level security;

-- administradores
create policy "admin lê a própria linha"
  on public.administradores for select
  using (user_id = auth.uid());

-- categorias
create policy "público lê categorias visíveis"
  on public.categorias for select
  using (visivel or public.is_admin());
create policy "admin gerencia categorias"
  on public.categorias for all
  using (public.is_admin()) with check (public.is_admin());

-- produtos
create policy "público lê produtos publicados"
  on public.produtos for select
  using (publicado or public.is_admin());
create policy "admin gerencia produtos"
  on public.produtos for all
  using (public.is_admin()) with check (public.is_admin());

-- produto_imagens
create policy "público lê imagens de produtos publicados"
  on public.produto_imagens for select
  using (
    public.is_admin()
    or exists (select 1 from public.produtos p
               where p.id = produto_id and p.publicado)
  );
create policy "admin gerencia imagens"
  on public.produto_imagens for all
  using (public.is_admin()) with check (public.is_admin());

-- configuracoes_site
create policy "público lê configurações"
  on public.configuracoes_site for select
  using (true);
create policy "admin atualiza configurações"
  on public.configuracoes_site for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 8) STORAGE (fotos dos doces, logo e imagem principal)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('produtos', 'produtos', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('site',     'site',     true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "público vê imagens"
  on storage.objects for select
  using (bucket_id in ('produtos', 'site'));
create policy "admin envia imagens"
  on storage.objects for insert
  with check (bucket_id in ('produtos', 'site') and public.is_admin());
create policy "admin altera imagens"
  on storage.objects for update
  using (bucket_id in ('produtos', 'site') and public.is_admin());
create policy "admin remove imagens"
  on storage.objects for delete
  using (bucket_id in ('produtos', 'site') and public.is_admin());

-- ---------------------------------------------------------------------
-- 9) DADOS INICIAIS
-- ---------------------------------------------------------------------
insert into public.configuracoes_site (
  id, nome_doceria, texto_apresentacao, descricao, mensagem_whatsapp,
  horario_atendimento, regiao_atendida, texto_encomendas,
  hero_titulo, hero_subtitulo, sobre_texto, cta_encomendas_titulo
) values (
  1,
  'Doceria da Mary',
  'Doces artesanais',
  'Doces artesanais para momentos especiais.',
  'Olá, Mary! Gostaria de fazer uma encomenda.',
  'Segunda a sábado, das 9h às 18h',
  'Toda a cidade e região',
  'Encomendas com pelo menos 2 dias de antecedência. Para festas e datas especiais, fale com a gente com uma semana de antecedência.',
  'Adoçando seus momentos mais especiais.',
  'Doces artesanais feitos com afeto, ingredientes escolhidos com cuidado e aquele sabor que transforma qualquer ocasião em memória.',
  'A Doceria da Mary nasceu do prazer de transformar ingredientes simples em momentos cheios de afeto. Cada doce é preparado com cuidado, da escolha dos sabores ao último detalhe da apresentação.',
  'Tem uma ocasião especial chegando?'
) on conflict (id) do nothing;

insert into public.categorias (nome, slug, ordem, visivel) values
  ('Bolos',            'bolos',            1, true),
  ('Docinhos',         'docinhos',         2, true),
  ('Sobremesas',       'sobremesas',       3, true),
  ('Kits e presentes', 'kits-e-presentes', 4, true)
on conflict (nome) do nothing;

-- Produtos de exemplo (os mesmos das telas). Apague se não quiser.
insert into public.produtos (categoria_id, nome, slug, descricao, preco, preco_a_partir, publicado, ordem)
select c.id, v.nome, v.slug, v.descricao, v.preco, v.a_partir, v.publicado, v.ordem
from (values
  ('bolos',            'Bolo de Chocolate',   'bolo-de-chocolate',   'Massa fofinha com recheio cremoso e cobertura generosa de chocolate.', 85.00, true,  true,  1),
  ('docinhos',         'Brigadeiros Gourmet', 'brigadeiros-gourmet', 'Pequenos clássicos, feitos à mão e finalizados com muito carinho.',   36.00, true,  true,  2),
  ('sobremesas',       'Brownie Recheado',    'brownie-recheado',    'Casquinha delicada, interior úmido e uma surpresa a cada mordida.',     18.00, false, true,  3),
  ('bolos',            'Bolo de Morango',     'bolo-de-morango',     'Camadas leves, creme suave e morangos frescos para celebrar.',          92.00, true,  true,  4),
  ('sobremesas',       'Copo da Felicidade',  'copo-da-felicidade',  'Cremes, pedacinhos de bolo e muito sabor em cada colherada.',           22.00, false, true,  5),
  ('kits-e-presentes', 'Caixa de Docinhos',   'caixa-de-docinhos',   'Uma seleção delicada para presentear ou compartilhar momentos.',        48.00, true,  false, 6)
) as v(cat_slug, nome, slug, descricao, preco, a_partir, publicado, ordem)
join public.categorias c on c.slug = v.cat_slug
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- 10) DEPOIS DE RODAR
--  a) Authentication > Users > "Add user": crie o usuário da Mary (e-mail + senha).
--  b) Rode, trocando o e-mail:
--       insert into public.administradores (user_id, nome)
--       select id, 'Mary' from auth.users where email = 'email-da-mary@exemplo.com';
--  c) Authentication > Sign In / Providers: desative "Allow new users to sign up".
-- =====================================================================
