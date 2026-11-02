# Doceria da Mary

Site de uma doceria artesanal: landing page com cardápio digital que leva o visitante ao WhatsApp para fazer o pedido, e painel administrativo para a própria doceria manter produtos, categorias e informações do site. Não há carrinho, checkout, pagamento online nem contas de clientes.

## Funcionalidades

**Site público (`/`)**

- Apresentação, categorias, cardápio, sobre, encomendas, contato e rodapé, com layout responsivo.
- Cardápio carregado do Supabase, com filtro por categoria, skeleton, estado de erro com "Tentar de novo" e cardápio vazio.
- Modal de detalhes do produto: preço fixo, variável ou "Sob consulta", galeria de fotos e botão de pedido.
- Links `wa.me` com mensagem pronta para cada contexto (pedido, encomenda, dúvida, produto). O site não envia mensagens.
- Textos, contatos, logo, imagem principal e região atendida vêm das configurações do site; metadados de SEO e JSON-LD são gerados a partir delas.
- Página de "não encontrado" para rotas desconhecidas.

**Painel administrativo (`/login`, `/admin`)**

- Login com Supabase Auth; só usuários cadastrados em `administradores` entram no painel.
- Cardápio: indicadores, busca, filtros, publicar/ocultar e excluir produtos.
- Formulário de produto com validação e até 5 fotos (JPG, PNG ou WEBP) enviadas ao Storage.
- Categorias: criar, editar, excluir e mostrar/ocultar.
- Configurações do site: nome, textos, contatos, horários, região, logo e imagem principal.

## Stack

- Angular 22 (standalone, OnPush, Signals, zoneless) e TypeScript 6 strict.
- Tailwind CSS 4, daisyUI 5 (tema `doceria-mary`) e `@lucide/angular`.
- Supabase: Postgres com RLS, Auth e Storage, acessados direto do navegador com `@supabase/supabase-js`. Não há API própria; a segurança está nas políticas do banco.
- Vitest (cobertura V8) para testes unitários, Playwright (Chrome) para testes de navegador e Prettier para formatação.
- Hospedagem estática na Vercel.

## Pré-requisitos

- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` e npm >= 11.
- Google Chrome instalado, para os testes Playwright.

## Comandos

```sh
npm ci                                # instala as dependências
npm start                             # servidor de desenvolvimento em http://localhost:4200
npm run build                         # build de produção em dist/doceria-da-mary/browser
npm test -- --watch=false --coverage  # testes unitários com cobertura
npm run test:e2e                      # testes Playwright em http://127.0.0.1:4201
npm run format:check                  # confere a formatação (não há lint)
npm run format                        # aplica a formatação
```

Os testes unitários usam repositórios falsos e os testes Playwright simulam o Supabase (`tests/browser/supabase-mock.ts`); nenhum deles acessa o banco real.

## Supabase

A URL do projeto e a chave **publishable** ficam em `src/environments/environment.ts` (produção) e `environment.development.ts`. Essa chave é pública por design; o que protege os dados é o RLS.

O schema está versionado em `supabase/migrations/` e o projeto é ligado pela CLI (`supabase/config.toml`):

```sh
npx supabase db push                                            # aplica as migrations pendentes
npx supabase gen types typescript --linked > src/app/core/supabase/database.types.ts
```

Para criar a administradora, cadastre o usuário em **Authentication** e depois:

```sql
insert into public.administradores (user_id, nome)
select id, 'Mary' from auth.users where email = 'email-da-mary@exemplo.com';
```

Desative também "Allow new users to sign up" em **Authentication > Sign In / Providers**.

## Renderização e publicação

O build usa `outputMode: "static"`. Só a casca da `/` é pré-renderizada; o catálogo é buscado no navegador e `/login` e `/admin/**` renderizam no cliente via `index.csr.html`. Nenhum servidor Node.js roda em produção.

O `vercel.json` define o build, a pasta publicada, as reescritas de `/login` e `/admin/**` para `index.csr.html` e copia esse arquivo para `404.html`.

## Estrutura

```text
src/app/
  core/auth/            # sessão, login e guards (adminGuard, guestGuard)
  core/config/          # configurações do site e links do WhatsApp
  core/supabase/        # client, tipos gerados e fake para testes
  features/home/        # landing page
  features/catalog/     # repositório do catálogo, cards e modal de detalhes
  features/auth/        # tela de login
  features/admin/       # layout do painel, cardápio, produtos, categorias e configurações
  features/not-found/   # página 404
  app.routes.ts         # rotas lazy; supabase-js fica fora do bundle inicial da landing
  app.routes.server.ts  # prerender da / e client nas demais rotas
public/                 # logo, fotos, fontes, ícones e referências de design (fora do build)
supabase/               # config da CLI e migrations
tests/browser/          # testes Playwright
specs/                  # spec.md e tasks.md por funcionalidade
docs/                   # status, roadmap, decisões e descrições de MR
```

## Documentação

- [AGENTS.md](AGENTS.md): fluxo de desenvolvimento orientado por especificação (SDD).
- [ARCHITECTURE.md](ARCHITECTURE.md): arquitetura, rotas, decisões e convenções.
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md): estado atual e pendências.
- [specs/](specs/): especificação, tarefas e evidências de cada funcionalidade.

## Pendências

- Publicar na Vercel e validar rotas e 404 ([hospedagem-vercel](specs/hospedagem-vercel/tasks.md)).
- Aplicar a migration da região atendida e validar o JSON-LD ([seo-landing](specs/seo-landing/tasks.md)).
- Cadastrar fotos originais dos produtos e confirmar informações comerciais (antecedência, conservação, alérgenos).

## Desenvolvimento isolado

Development usa apenas http://127.0.0.1:54321. Com Docker ativo, execute `npx supabase start` e `npx supabase migration up --local`. Confira a chave anon local em `npx supabase status` e ajuste `environment.development.ts` se sua CLI usar outra chave. Cadastre um administrador local conforme o procedimento acima, no Studio local. Nunca use credenciais de administrador de producao para testar localmente.

Antes de publicar esta revisao, aplique as migrations 20261030210000 e 20261030211000. Testes reais das politicas: `npx supabase test db` (requer Supabase local iniciado).
