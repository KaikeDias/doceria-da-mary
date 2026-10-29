# Tarefas — Animações dos produtos

Especificação: `specs/animacoes-produtos/spec.md`.

## Implementação

- [x] I01 — Adicionar transição de transformação/sombra e hover de ampliação/elevação somente para ponteiro preciso com hover, sem alterar a grade. (CA01, CA03)
- [x] I02 — Animar a entrada do diálogo e do fundo externo no desktop e adaptar a entrada ao painel mobile. Preservar o ciclo de foco/abertura/fechamento existente. (CA02–CA03)
- [x] I03 — Desativar movimento de hover e entrada para `prefers-reduced-motion: reduce`. (CA04)

## Testes

- [x] T01 — Testar no navegador transformação e sombra durante hover/retorno, posição dos vizinhos e ausência de overflow. (CA01)
- [x] T02 — Testar quadros de entrada do painel e do fundo desktop, estado final, reabertura, teclado e fechamento durante a animação. (CA02)
- [x] T03 — Testar entrada vertical mobile, estado final e ausência de hover persistente em contexto de toque. (CA03)
- [x] T04 — Testar ausência de animações e de transformação com movimento reduzido, preservando abertura/fechamento. (CA04)
- [x] T05 — Ajustar a sincronização dos testes de geometria dos modais para aguardar o fim da entrada, sem esperas de duração fixa. Executar regressões unitárias e em navegador. (CA05)

## Validação

- [x] V01 — Conferir hover e quadros de entrada em navegador, desktop/mobile e movimento reduzido. (CA01–CA04)
- [x] V02 — Executar testes unitários, testes em navegador, build estático, Prettier nos arquivos alterados e `git diff --check`; registrar resultados e eventuais limitações. (CA05)

## Checklist de conclusão

- [x] Hover de ampliação e elevação implementado, com retorno suave.
- [x] Entrada suave do modal desktop/mobile implementada.
- [x] Preferência de movimento reduzido respeitada.
- [x] Critérios de aceitação cobertos e regressões aprovadas.
- [x] Evidências e limitações registradas.

## Evidências e validação — 2026-10-29

- Implementação somente em CSS: hover com escala de 1,02, elevação de 6 px e sombra; transição de 220 ms no retorno. Entrada de 280 ms com escala/opacidade no desktop e deslocamento vertical no mobile. Movimento reduzido desativa essas animações.
- `tests/browser/product-motion.e2e.ts`: seis testes aprovados no Chrome. Verificam geometria/sombra no hover e retorno, ausência de deslocamento dos vizinhos, quadros inicial/intermediário/final do painel e fundo, reabertura por foto/nome e teclado, fechamento durante a entrada, toque e movimento reduzido.
- `tests/browser/product-details.e2e.ts` aguarda a conclusão das animações antes de medir a geometria do modal, usando `Animation.finished`, sem esperas de duração fixa.
- `npm run test:e2e`: 21 testes aprovados, incluindo os seis de animação, cinco de hover padrão e dez de regressão dos modais.
- `npm test -- --watch=false --coverage`: 30 testes aprovados; cobertura global de 99,8% de statements, 98,11% de branches, 98,14% de funções e 100% de linhas. Não foi adicionada lógica TypeScript de aplicação; as unidades existentes continuam acima do limite de 90%.
- `npm run build`: uma rota estática pré-renderizada, sem alerta de orçamento. Prettier dos arquivos alterados e `git diff --check`: aprovados.
- Hover e quadros intermediários de entrada desktop/mobile inspecionados visualmente no Chrome; capturas temporárias em `/tmp/doceria-card-hover.png`, `/tmp/doceria-modal-entry-desktop.png` e `/tmp/doceria-modal-entry-mobile.png`.
- Validação de aderência pelo implementador: CA01–CA05 atendidos, tarefas concluídas e sem lacunas de implementação identificadas. Sem bibliotecas novas, temporizadores ou mudanças no ciclo do modal. A mudança de cor dos controles é documentada separadamente em `specs/hover-padrao-botoes/`.
- Limitação da validação: navegador exercitado foi Google Chrome; Firefox e Safari não foram executados. Comandos executados com Node 26.5.0.
