# Tarefas — Estados da tela de cardápio

Especificação: `specs/estados-tela-cardapio/spec.md`.

## Lista de tarefas técnicas e rastreabilidade

| Implementação | Resultado esperado                                              | Critérios        | Testes   |
| ------------- | --------------------------------------------------------------- | ---------------- | -------- |
| I01           | "…" ativo e modal de confirmação de exclusão.                   | CA01, CA02, CA03 | T01–T03  |
| I02           | Estado de cardápio vazio.                                       | CA04             | T04      |
| I03           | Estado de pesquisa sem resultados.                              | CA05             | T05      |
| I04           | Salvamento simulado da chave de publicação e aviso "Salvando…". | CA06             | T06      |
| I05           | Aviso de sucesso com fechamento manual e automático.            | CA03, CA07       | T03, T07 |
| I06           | Responsividade e acessibilidade de modal e avisos.              | CA08             | T08      |
| I07           | Regressão, cobertura, formatação e build estático.              | CA09             | T09      |

## Tarefas de implementação

- [x] I01 — Em `cardapio.html`, trocar o "…" indisponível (tabela e card) por botão "Excluir {nome}" que abre um `<dialog>` modal com ícone `LucideTrash2`, título, texto, "Cancelar" (foco inicial) e "Sim, excluir"; fechar por `Esc`, fundo e "Cancelar"; confirmar remove o produto do signal `items`. (CA01–CA03)
- [x] I02 — Exibir o estado de cardápio vazio quando `items()` estiver vazio, com caixa tracejada, `LucideCake` e "Adicionar primeiro produto" indisponível. (CA04)
- [x] I03 — Substituir o estado vazio atual pelo de pesquisa sem resultados (`LucideSearchX`, título com a busca, botão contornado "Limpar filtros"). (CA05)
- [x] I04 — Implementar signal `saving` com o produto em salvamento; ao alternar, desabilitar as chaves, exibir spinner e "Salvando…" na chave e o aviso "Salvando alterações…"; aplicar a mudança após espera simulada (`shortcut`). (CA06)
- [x] I05 — Implementar signal `message` com aviso de sucesso (`toast`/`alert`, `LucideCircleCheck`, botão × com nome), fechamento automático após 5 s e substituição pela mensagem mais recente. (CA03, CA07)
- [x] I06 — Garantir `role="status"` nos avisos, `aria-busy` na chave, nome/descrição do modal, sem rolagem horizontal e alvos de 44 px no mobile. (CA08)
- [x] I07 — Atualizar `cardapio.spec.ts` e `tests/browser/admin-cardapio.e2e.ts`; conferir cobertura, formatação e build. (CA09)

## Tarefas de testes

| ID  | Cenários automatizados obrigatórios                                                             | Critérios |
| --- | ----------------------------------------------------------------------------------------------- | --------- |
| T01 | "…" abre o modal com título e texto; "Cancelar" focado.                                         | CA01      |
| T02 | "Cancelar" e `Esc` fecham sem excluir.                                                          | CA02      |
| T03 | "Sim, excluir" remove, atualiza indicadores e exibe a mensagem de exclusão.                     | CA03      |
| T04 | Excluir todos os produtos exibe o estado de cardápio vazio e indicadores zerados.               | CA04      |
| T05 | Busca "pudim", filtro sem busca e "Limpar filtros".                                             | CA05      |
| T06 | Salvamento: "Salvando…", `aria-busy`, chaves desabilitadas, aviso, status inalterado até o fim. | CA06      |
| T07 | Mensagens de publicado/oculto, fechamento pelo × e após 5 s.                                    | CA07      |
| T08 | 320 e 1440 px com modal e aviso abertos sem rolagem horizontal; alvos de 44 px.                 | CA08      |
| T09 | Cobertura ≥ 90%, regressões, build estático e formatação.                                       | CA09      |

- [x] Criar e executar T01–T07 em testes unitários (Vitest, temporizadores simulados). (CA01–CA07)
- [x] Criar e executar T01, T03, T06–T08 no Playwright. (CA01, CA03, CA06–CA08)
- [x] Executar T09. (CA09)

## Tarefas de validação

- [x] V01 — Comparar visualmente os cinco estados com as referências em 1440 × 900 px; registrar diferenças. (CA01–CA07)
- [x] V02 — Executar `npm test -- --watch=false --coverage`, `npm run test:e2e`, `npm run build` e `npm run format:check`; registrar resultados. (CA09)
- [x] V03 — Conferir que `catalog.ts`, a landing page e as demais telas do painel não foram alteradas. (CA09)

## Checklist de conclusão

- [x] I01–I07 implementadas dentro do escopo.
- [x] CA01–CA09 cobertos por testes, com resultados registrados.
- [x] Cobertura ≥ 90% por unidade implementada.
- [x] Estados comparados com as referências.
- [x] Sem novas dependências e sem alterações fora da tela de cardápio.
- [x] Ausência de persistência e salvamento simulado sinalizados.

## Resultados registrados (2026-10-29)

- `npm test -- --watch=false --coverage` (Node 26.5): 64 testes passando; `cardapio.ts` 100% linhas / 96% ramos; `cardapio.html` 99% linhas.
- `npx playwright test`: 42 testes passando (13 em `admin-cardapio.e2e.ts`).
- `npm run build`: 5 rotas pré-renderizadas. `npm run format:check` e `git diff --check`: sem pendências.
- V01: capturas em 1440 × 900 conferem com as referências. Diferenças: "Sim, excluir" usa o rosa primário do tema (a referência é levemente mais avermelhada); o aviso aparece com a animação de entrada do daisyUI.
- `admin.spec.ts` passou a selecionar a gaveta por `aria-label`, pois a tela agora tem um segundo `<dialog>`.
- Limitações: salvamento simulado (600 ms) e sem persistência; recarregar restaura o estado inicial.
