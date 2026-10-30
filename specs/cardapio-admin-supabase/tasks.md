# Tarefas — Painel › Cardápio com Supabase

Especificação: `specs/cardapio-admin-supabase/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                          | Critérios        | Testes  |
| ------------- | ----------------------------------------------------------- | ---------------- | ------- |
| I01           | `AdminMenuRepository` Supabase (listar, publicar, excluir). | CA01, CA02, CA06 | T01–T02 |
| I02           | `MenuStore` com estado e carga do banco.                    | CA01, CA03       | T03     |
| I03           | Publicar/ocultar com erro de gravação.                      | CA04, CA05       | T04–T05 |
| I04           | Exclusão no banco com "Excluindo…" e erro.                  | CA06, CA07       | T06–T07 |
| I05           | Playwright do cardápio com Supabase simulado.               | CA08             | T08     |

## Tarefas de implementação

- [x] I01 — Criar `features/admin/admin-menu-repository.ts` com `AdminMenuRepository` e a implementação Supabase. (CA01, CA02, CA06, CA07)
- [x] I02 — Reescrever `menu-store.ts` com `state`, `items`, `categories` e `load()`. (CA01, CA03)
- [x] I03 — Em `cardapio.ts/html`, carregar ao abrir, estados de carregando/erro, gravar a chave sem atraso artificial e aviso de erro. (CA03–CA05)
- [x] I04 — Exclusão assíncrona com "Excluindo…", botões desabilitados e aviso de erro. (CA06, CA07)
- [x] I05 — Atualizar `tests/browser/admin-cardapio.e2e.ts` para o mock. (CA08)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                               | Critérios        |
| --- | ----------------------------------------------------------------- | ---------------- |
| T01 | Mapeamento de produtos e categorias com `fetch` falso.            | CA02             |
| T02 | `setPublished` e `deleteProduct` (inclusive falha só no Storage). | CA04, CA06, CA07 |
| T03 | Carregando, erro e "Tentar de novo".                              | CA01, CA03       |
| T04 | Chave grava e mostra sucesso.                                     | CA04             |
| T05 | Falha de gravação mantém a chave e mostra aviso vermelho.         | CA05             |
| T06 | "Excluindo…" e sucesso.                                           | CA06             |
| T07 | Falha ao excluir.                                                 | CA07             |
| T08 | Cobertura, Playwright, build e formatação.                        | CA08             |

- [x] Criar e executar T01–T07 (Vitest).
- [x] Executar T08.

## Tarefas de validação

- [ ] V01 — Em `ng serve` com o banco real, ocultar e publicar um produto e conferir a landing.
- [x] V02 — `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build`, `npm run format:check`.

## Checklist de conclusão

- [x] I01–I05 concluídas.
- [x] CA01–CA08 cobertos por testes.
- [x] Salvamento simulado removido.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 15 arquivos, 119 testes passando; cobertura geral 99,2% instruções / 96,4% ramos; nenhuma unidade alterada abaixo de 90% de linhas.
- Playwright: 53 testes passando com o Supabase simulado (`tests/browser/supabase-mock.ts`). Executado com o canal `msedge`, pois o Chrome não está instalado nesta máquina; a configuração do repositório continua com `chrome`.
- `npm run build`: 1 rota pré-renderizada (`/`), demais em `index.csr.html`; bundle inicial 405 kB (dentro do orçamento de 500 kB). O HTML da `/` não contém produtos nem chamada ao Supabase.
- `npm run format:check`: arquivos desta funcionalidade formatados; avisos restantes já existiam antes (`AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, `package.json`, `playwright.config.ts`).
- Pendente V01: alterar dados no banco real não foi executado (exige login real). O Playwright cobre "ocultar no painel some da landing" com o mock.
