# Tarefas — Página não encontrada

Especificação: `specs/pagina-nao-encontrada/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                               | Critérios  | Testes |
| ------------- | ------------------------------------------------ | ---------- | ------ |
| I01           | Componente `NotFound` com título, texto e link.  | CA01, CA03 | T01    |
| I02           | Rota `**` com título de aba, no fim de `routes`. | CA01, CA02 | T02    |

## Tarefas de implementação

- [x] I01 — `src/app/features/not-found/not-found.ts`: template com título, texto e link para `/`; `Meta.addTag` de `robots` `noindex` ao criar e `removeTag` ao destruir. (CA01, CA03)
- [x] I02 — `app.routes.ts`: `{ path: '**', title: 'Página não encontrada | Doceria da Mary', loadComponent }`. (CA01, CA02, CA04)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                           | Critérios        |
| --- | --------------------------------------------------------------------------------------------- | ---------------- |
| T01 | `NotFound`: link para `/`; meta `noindex` presente e removida ao destruir.                    | CA01, CA03       |
| T02 | Roteador: caminho inexistente mostra `NotFound` com o título da aba; `/` continua na landing. | CA01, CA02, CA04 |

- [x] Criar e executar T01–T02 (Vitest).

## Tarefas de validação

- [x] V01 — `npm test -- --watch=false --coverage` e `npm run build`.
- [ ] V02 — Status 404 configurado em `specs/hospedagem-vercel` (`404.html` na Vercel); validar após publicar.

## Checklist de conclusão

- [x] I01–I02 concluídas.
- [x] CA01–CA04 cobertos por testes.

## Resultados registrados (2026-10-30)

- `npm test -- --watch=false --coverage`: 19 arquivos, 164 testes passando; `not-found.ts` com 100% de instruções, ramos, funções e linhas.
- `npm run build` passando, 1 rota pré-renderizada.
- Playwright (canal `msedge`, config temporária fora do repositório): suíte existente passando e conferência manual de `/nao-existe` (título, link para `/`, meta `noindex` removida ao voltar).
- V02 pendente: validar na Vercel.
