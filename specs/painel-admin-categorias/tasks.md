# Tarefas — Painel administrativo, tela de categorias

Especificação: `specs/painel-admin-categorias/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                                                       | Critérios        | Testes        |
| ------------- | ---------------------------------------------------------------------------------------- | ---------------- | ------------- |
| I01           | Rota filha `categorias` com título, pré-renderização e página standalone.                | CA01, CA10       | T01           |
| I02           | Link "Categorias" ativo no menu lateral e na gaveta; "Configurações" segue indisponível. | CA01, CA07       | T01, T07      |
| I03           | Cabeçalho, aviso e botão "Adicionar categoria" indisponível.                             | CA02, CA06       | T02, T06      |
| I04           | Estado em signals com contagem por `categoryId` e formatação de quantidade.              | CA03, CA05       | T03, T05      |
| I05           | Chave de visibilidade acessível e atualização imediata.                                  | CA04, CA09       | T04, T09      |
| I06           | Tabela desktop, cards mobile e ações indisponíveis.                                      | CA02, CA06, CA07 | T02, T06, T07 |
| I07           | Responsividade, foco e acessibilidade.                                                   | CA08, CA09       | T08, T09      |
| I08           | Regressão, cobertura, formatação e build estático.                                       | CA10             | T10           |

## Tarefas de implementação

- [x] I01 — Criar `src/app/features/admin/categorias.ts` e `categorias.html` (standalone, OnPush), adicionar a rota filha `categorias` em `src/app/app.routes.ts` com título "Categorias | Painel Doceria da Mary" e incluir `admin/categorias` em `src/app/app.routes.server.ts`. (CA01)
- [x] I02 — Em `src/app/features/admin/admin.html`, trocar o "Categorias" indisponível por link `routerLink="/admin/categorias"` com `routerLinkActive` e `ariaCurrentWhenActive="page"`, mantendo o padrão de "Cardápio" em desktop e gaveta. Manter "Configurações" indisponível. (CA01, CA07)
- [x] I03 — Implementar cabeçalho "Categorias", subtítulo, aviso informativo (ícone `LucideInfo`) e botão "Adicionar categoria" com `aria-disabled` e texto "(em breve)" para leitores de tela. (CA02, CA06)
- [x] I04 — Implementar signal de categorias a partir de `categories` do catálogo, mais "Datas especiais" oculta (dado demonstrativo, marcado como `shortcut`); contagem por `products` filtrado por `categoryId`; texto "Nenhum produto", "1 produto" ou "{n} produtos". (CA03, CA05)
- [x] I05 — Implementar a chave de visibilidade (`role="switch"`, `aria-checked`, nome "Exibir {categoria} no site", verde de sucesso quando visível, texto "Visível"/"Oculta"). (CA04, CA09)
- [x] I06 — Implementar tabela desktop (colunas Categoria, Produtos, Status no site, Ações) e lista de cards mobile abaixo de 1024 px, com ações "Editar" e "Excluir" indisponíveis (`aria-disabled`, sem ação). (CA02, CA06, CA07)
- [x] I07 — Revisar responsividade (sem overflow de 320 a 1440 px), alvos de 44 px no mobile, foco visível e ícones decorativos ocultos. Usar apenas classes Tailwind/daisyUI, sem CSS puro. (CA08, CA09)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                                         | Critérios |
| --- | ----------------------------------------------------------------------------------------------------------- | --------- |
| T01 | Rota `/admin/categorias`, título, item "Categorias" com `aria-current` e link ativo no menu.                | CA01      |
| T02 | Desktop: cabeçalho, aviso, cinco linhas e colunas com cabeçalhos `scope`.                                   | CA02      |
| T03 | Quantidades de produtos para "Nenhum produto", "1 produto" e "2 produtos".                                  | CA03      |
| T04 | Alternar a chave troca rótulo e `aria-checked` sem mudar a ordem.                                           | CA04      |
| T05 | Estado inicial: "Datas especiais" oculta e as demais visíveis.                                              | CA05      |
| T06 | Ações "Adicionar categoria", "Editar" e "Excluir" indisponíveis não agem nem navegam.                       | CA06      |
| T07 | Mobile: cards no lugar da tabela; "Categorias" destacado na gaveta; "Configurações" segue indisponível.     | CA07      |
| T08 | Playwright: 320, 390, 768, 1023, 1024 e 1440 px sem rolagem horizontal; alvos ≥ 44 px no mobile.            | CA08      |
| T09 | Semântica: `h1`, `role="switch"` com nome, ícones ocultos; foco por teclado na chave.                       | CA09      |
| T10 | Cobertura por unidade, regressões (landing, catálogo, login, cardápio, layout), HTML estático e formatação. | CA10      |

- [x] Criar `src/app/features/admin/categorias.spec.ts` (T01–T06 e ramos de quantidade e alternância). (CA01–CA06)
- [x] Atualizar `src/app/features/admin/admin.spec.ts` (CA08 agora espera apenas "Configurações" como indisponível) e cobrir o link "Categorias" da gaveta. (CA01, CA07)
- [x] Criar `tests/browser/admin-categorias.e2e.ts` com T08 e T09 no navegador. (CA08, CA09)

## Tarefas de validação

- [x] V01 — Capturar a tela em 1440 × 900 e comparar com `public/design/categorias/Categorias@1x.png`; registrar diferenças. (CA02)
- [x] V02 — Executar `npm test -- --watch=false --coverage` e registrar a cobertura por unidade. (CA10)
- [x] V03 — Executar `npm run test:e2e` e registrar resultados. (CA08, CA09)
- [x] V04 — Executar `npm run build` e confirmar `/admin/categorias` no HTML gerado. (CA10)
- [x] V05 — Executar `npm run format:check`. (CA10)
- [x] V06 — Revisar aderência ao `spec.md` e a este `tasks.md`, registrando limitações (sem persistência, sem guarda de rotas, ações indisponíveis).

## Checklist de conclusão

- [x] I01–I07 implementadas dentro do escopo.
- [x] CA01–CA10 cobertos por testes com resultados registrados.
- [x] Cobertura ≥ 90% por unidade implementada.
- [x] Sem CSS puro; apenas Tailwind e daisyUI.
- [x] Sem alterações na landing page, no login nem no catálogo.
- [x] Build estático, formatação e testes existentes aprovados.
- [x] Revisão registrada.
