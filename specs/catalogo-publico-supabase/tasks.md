# Tarefas — Catálogo público lendo do Supabase

Especificação: `specs/catalogo-publico-supabase/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                          | Critérios              | Testes        |
| ------------- | ----------------------------------------------------------- | ---------------------- | ------------- |
| I01           | `CatalogRepository` com leitura e mapeamento Supabase.      | CA01, CA02, CA03       | T01, T02      |
| I02           | Modelo `Product` com `categoryLabel`, URL e preço opcional. | CA03, CA07             | T03, T07      |
| I03           | Estados carregando, erro e vazio na `Home`.                 | CA04, CA05, CA06       | T04–T06       |
| I04           | Dados removidos de `catalog.ts`; fixture para testes.       | CA09                   | T09           |
| I05           | Playwright com Supabase simulado.                           | CA01, CA03, CA08, CA09 | T01, T08, T09 |

## Tarefas de implementação

- [x] I01 — Criar `features/catalog/catalog-repository.ts` com `CatalogRepository` e `SupabaseCatalogRepository` (categorias visíveis, `cardapio_publico`, `produto_imagens` dos ids retornados). (CA01–CA03)
- [x] I02 — Ajustar `Product`, `formatPrice`, `ProductCard` (bloco neutro sem foto) e `ProductDetails` (galeria, rótulo de categoria, "Sob consulta" e observação). (CA03, CA07)
- [x] I03 — Em `Home`, estado `loading | ready | error`, busca com `afterNextRender`, skeletons, erro com "Tentar de novo" e cardápio vazio. (CA04–CA06, CA08)
- [x] I04 — Mover os dados de exemplo para `features/catalog/catalog.fixture.ts` e atualizar os testes. (CA09)
- [x] I05 — Criar `tests/browser/supabase-mock.ts` com fixtures dos 6 produtos e usar nos testes da landing. (CA09)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                        | Critérios |
| --- | ------------------------------------------------------------------------------------------ | --------- |
| T01 | Landing com repositório falso exibe categorias e produtos.                                 | CA01      |
| T02 | Mapeamento de linhas do banco (com/sem categoria, foto, preço, galeria) via `fetch` falso. | CA02      |
| T03 | Modal com detalhes, observação, "Bom saber" e galeria.                                     | CA03      |
| T04 | Skeleton e `aria-busy` durante a carga.                                                    | CA04      |
| T05 | Erro, "Tentar de novo" e sucesso na segunda tentativa.                                     | CA05      |
| T06 | Cardápio vazio.                                                                            | CA06      |
| T07 | "Sob consulta" no card e no modal; bloco neutro sem foto.                                  | CA07      |
| T08 | Filtro por categoria sem nova busca.                                                       | CA08      |
| T09 | Build, Playwright com mock, cobertura e formatação.                                        | CA09      |

- [x] Criar e executar T01–T08 (Vitest).
- [x] Atualizar os testes Playwright da landing para usar o mock e executar T09.

## Tarefas de validação

- [x] V01 — Em `ng serve`, conferir a landing com o banco real: 5 produtos e 4 categorias.
- [x] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.

## Checklist de conclusão

- [x] I01–I05 concluídas.
- [x] CA01–CA09 cobertos por testes.
- [x] Layout, hover e animações sem regressão.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 15 arquivos, 119 testes passando; cobertura geral 99,2% instruções / 96,4% ramos; nenhuma unidade alterada abaixo de 90% de linhas.
- Playwright: 53 testes passando com o Supabase simulado (`tests/browser/supabase-mock.ts`). Executado com o canal `msedge`, pois o Chrome não está instalado nesta máquina; a configuração do repositório continua com `chrome`.
- `npm run build`: 1 rota pré-renderizada (`/`), demais em `index.csr.html`; bundle inicial 405 kB (dentro do orçamento de 500 kB). O HTML da `/` não contém produtos nem chamada ao Supabase.
- `npm run format:check`: arquivos desta funcionalidade formatados; avisos restantes já existiam antes (`AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, `package.json`, `playwright.config.ts`).
- V01: em `ng serve` com o banco real, a landing exibiu 5 produtos e os chips Todos, Bolos, Docinhos, Sobremesas e Kits; `/admin/cardapio` sem sessão foi para `/login`.
- O card passou a mostrar o rótulo da categoria (`categoryLabel`, ex.: "Kits e presentes"); antes recebia o id.
