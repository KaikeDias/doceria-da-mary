# Tarefas — Hover padrão dos botões

Especificação: `specs/hover-padrao-botoes/spec.md`.

## Implementação

- [x] I01 — Centralizar transições e hover padrão para botões nativos e links de ação; aplicar variantes primária, neutra, clara e textual. (CA01)
- [x] I02 — Garantir resposta de cor nos controles com foto e miniaturas, preservando seleção e efeitos do card/modal. (CA02)
- [x] I03 — Tratar controles indisponíveis, dispositivos de toque e movimento reduzido. (CA03)

## Testes

- [x] T01 — Comparar cores antes/depois do hover e retorno em cada família de controles, incluindo um botão nativo sem classe específica. (CA01)
- [x] T02 — Verificar escurecimento das fotos, miniaturas, seleção e dimensões dos controles. (CA02)
- [x] T03 — Verificar controles desabilitados, toque e movimento reduzido no navegador. (CA03)
- [x] T04 — Executar testes de animação e regressões unitárias, conferir cobertura existente e build estático. (CA04)

## Validação

- [x] V01 — Inspecionar os estados de hover no navegador e comparar com os estados de repouso, preservando foco e legibilidade. (CA01–CA03)
- [x] V02 — Executar Prettier nos arquivos alterados e `git diff --check`; registrar resultados e limitações. (CA04)

## Checklist de conclusão

- [x] Hover padrão aplicado aos controles previstos.
- [x] Controles desabilitados, toque e movimento reduzido tratados.
- [x] Critérios cobertos e regressões aprovadas.
- [x] Build, formatação e evidências concluídos.

## Evidências e validação — 2026-10-29

- Hover e transições centralizados em `src/styles.css` para botões nativos, CTAs `.btn`, pedidos de produto e controles de modal. Variantes primária e neutra escurecem; controles claros ficam rosa; ações textuais mudam a cor do texto. Imagens dos acionadores e miniaturas escurecem suavemente.
- `tests/browser/button-hover.e2e.ts`: cinco testes aprovados no Chrome. Cobrem CTAs primários/neutros/com contorno, filtros ativos/inativos, nome/pedido do produto, fechamento/pedido/setas/miniaturas do modal, botão nativo sem classe, restauração das cores e manutenção das dimensões.
- Estados `disabled`/`aria-disabled`, seleção de miniatura, movimento reduzido e ausência de hover persistente em contexto de toque foram verificados. Links indisponíveis com aparência de botão não recebem eventos de ponteiro.
- `npm run test:e2e`: 21 testes aprovados, incluindo cinco de hover padrão, seis de animação e dez de regressão dos modais.
- `npm test -- --watch=false --coverage`: 30 testes aprovados. Cobertura global de 99,8% de statements, 98,11% de branches, 98,14% de funções e 100% de linhas; nenhuma nova lógica TypeScript de aplicação foi introduzida.
- `npm run build`: aprovado, uma rota estática e sem alerta de orçamento. Prettier dos arquivos alterados e `git diff --check`: aprovados.
- Capturas de hover do CTA e card inspecionadas visualmente no Chrome, em `/tmp/doceria-button-hover.png` e `/tmp/doceria-card-hover.png`. Paleta, rótulos e foco permanecem legíveis.
- Validação de aderência pelo implementador: CA01–CA04 atendidos pelas verificações acima. Nenhuma lacuna de implementação identificada; regras de pedido, navegação, filtros e controles preservados.
- Limitação da validação: Google Chrome foi exercitado; Firefox e Safari não foram executados. Comandos executados com Node 26.5.0. Nenhuma dependência nova foi adicionada.
