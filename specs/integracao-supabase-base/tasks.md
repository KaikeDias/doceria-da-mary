# Tarefas — Integração Supabase: base técnica

Especificação: `specs/integracao-supabase-base/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                        | Critérios  | Testes |
| ------------- | --------------------------------------------------------- | ---------- | ------ |
| I01           | Tipos do banco gerados e ignorados pelo Prettier.         | CA05       | T05    |
| I02           | Serviço `Supabase` com client preguiçoso só no navegador. | CA01       | T01    |
| I03           | Mapeamento de preço e de imagem.                          | CA02, CA03 | T02    |
| I04           | Repositórios abstratos com implementação Supabase padrão. | CA05       | T05    |
| I05           | Rotas de login e painel em `RenderMode.Client`.           | CA04       | T04    |

## Tarefas de implementação

- [x] I01 — Gerar `src/app/core/supabase/database.types.ts` e adicioná-lo ao `.prettierignore`. (CA05)
- [x] I02 — Criar `core/supabase/supabase.ts`: serviço `Supabase` com `client` criado no primeiro acesso via `createClient<Database>` e erro fora do navegador; `publicUrl(bucket, path)`; mensagens `loadError` e `saveError`. (CA01)
- [x] I03 — Em `core/supabase/supabase.ts`, funções `toPrice`, `fromPrice`, `productImageUrl` e `categoryImageUrl`. (CA02, CA03)
- [x] I04 — `CatalogRepository` em `features/catalog/` e `AdminMenuRepository` em `features/admin/`, cada um com implementação Supabase. (CA05)
- [x] I05 — `app.routes.server.ts`: `/` em `Prerender`, demais rotas em `Client`; remover o uso de `catalog.ts`. (CA04)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                      | Critérios |
| --- | ------------------------------------------------------------------------ | --------- |
| T01 | `client` com mesma instância no navegador e erro na plataforma servidor. | CA01      |
| T02 | Preço e imagem nos casos do CA02 e CA03.                                 | CA02–CA03 |
| T04 | Build: `/` pré-renderizada, sem HTML pré-renderizado de `/admin/**`.     | CA04      |
| T05 | Cobertura, testes existentes, build e formatação.                        | CA05      |

- [x] Criar e executar T01 e T02 (Vitest).
- [x] Executar T04 e T05.

## Tarefas de validação

- [x] V01 — Ler `cardapio_publico` com a chave publishable e conferir os 5 produtos publicados com foto.
- [x] V02 — `npm test -- --watch=false --coverage`, `npm run build` e `npm run format:check`.

## Checklist de conclusão

- [x] I01–I05 concluídas.
- [x] CA01–CA05 cobertos por testes.
- [x] Cobertura ≥ 90% por unidade nova.
- [x] Nenhuma chave secreta no repositório.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 15 arquivos, 119 testes passando; cobertura geral 99,2% instruções / 96,4% ramos; nenhuma unidade alterada abaixo de 90% de linhas.
- Playwright: 53 testes passando com o Supabase simulado (`tests/browser/supabase-mock.ts`). Executado com o canal `msedge`, pois o Chrome não está instalado nesta máquina; a configuração do repositório continua com `chrome`.
- `npm run build`: 1 rota pré-renderizada (`/`), demais em `index.csr.html`; bundle inicial 405 kB (dentro do orçamento de 500 kB). O HTML da `/` não contém produtos nem chamada ao Supabase.
- `npm run format:check`: arquivos desta funcionalidade formatados; avisos restantes já existiam antes (`AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, `package.json`, `playwright.config.ts`).
- V01: `cardapio_publico` com a chave publishable devolveu os 5 produtos publicados, cada um com `seed/*.webp`; as 6 fotos do seed respondem 200 no bucket. As duas migrations já constavam como aplicadas no remoto (`supabase migration list --linked`).
- `productImageUrl` não virou função própria: é `publicUrl('produtos', path)`. Foi adicionada `productImagePath` (inverso) para apagar arquivos.
