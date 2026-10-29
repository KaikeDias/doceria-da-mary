# Tarefas — Refatoração para Tailwind e DaisyUI

Especificação: `specs/refatoracao-tailwind-daisyui/spec.md`.

## Implementação

- [x] I01 — Registrar renderização anterior e migrar layout, espaçamentos, tipografia e responsividade da home para Tailwind. Remover a folha de estilo desnecessária. (CA01)
- [x] I02 — Migrar cards para utilities e controles DaisyUI, preservando seletores semânticos e animações de hover. (CA02)
- [x] I03 — Migrar o modal para DaisyUI com utilities de layout, mantendo somente CSS específico de animação e o ciclo nativo de diálogo. (CA03)
- [x] I04 — Migrar padrões globais de controles, hover e fundamentos para Tailwind/DaisyUI, preservando tema, fontes, acessibilidade e estados. (CA04)

## Testes

- [x] T01 — Executar regressões de conteúdo/filtros/contatos da home e conferir responsividade nas cinco larguras. (CA01)
- [x] T02 — Executar testes de card, hover, teclado, pedido e ausência de deslocamento dos vizinhos. (CA02)
- [x] T03 — Executar testes de variantes de preço, galeria, estados opcionais, rolagem, foco, fechamento e entrada desktop/mobile. (CA03)
- [x] T04 — Executar testes de hover padrão, botão nativo sem classe, controles indisponíveis, toque e movimento reduzido. (CA04)
- [x] T05 — Medir cobertura das unidades alteradas e executar build estático, formatação e conferência do diff. (CA05)

## Validação

- [x] V01 — Comparar capturas anteriores/posteriores da página e modais em 320, 390, 768, 1024 e 1440 px; corrigir regressões de composição. (CA01–CA03)
- [x] V02 — Conferir que folhas removidas não são referenciadas e que o CSS restante atende às exceções autorizadas, sem duplicar layouts em `@apply`. (CA01–CA04)
- [x] V03 — Registrar comandos, resultados, cobertura, redução de CSS e limitações da validação. (CA05)

## Checklist de conclusão

- [x] Tailwind aplicado à apresentação e ao hover dos componentes.
- [x] DaisyUI aplicado a botões, modal e estados.
- [x] CSS específico restrito a fundamentos, personalizações compartilhadas e animações necessárias.
- [x] Critérios cobertos por regressões e comparação visual.
- [x] Build, testes, cobertura e formatação aprovados, com evidências.

## Evidências — 2026-10-29

- **CSS de fonte:** de 1.468 para 175 linhas (redução de aproximadamente 88%). `home.css` e `product-card.css` removidos; `product-details.css` contém somente 42 linhas de animação. `styles.css` mantém 133 linhas de fontes, tema, fundamentos e padrões compartilhados de controles com Tailwind `@apply`.
- **Apresentação:** utilities nos templates da home, cards e modal controlam composição, medidas, cores, tipografia, responsividade e hover. O breakpoint `desktop` começa em 701 px; a variante `mouse` restringe efeitos a ponteiros precisos com hover. Classes semânticas permanecem como seletores de teste.
- **DaisyUI:** controles usam `btn`, `btn-primary`, `btn-neutral`, `btn-link`, `btn-ghost`, `btn-circle` e `btn-outline`; o diálogo usa `modal`/`modal-box`. A integração nativa continua cuidando do foco e da rolagem. O plugin `rootscrollgutter` foi excluído porque seu ajuste adicional de largura interferia na rolagem já controlada pelo diálogo.
- **Testes unitários:** `npm test -- --watch=false --coverage` aprovou 30 testes em seis arquivos. `home.ts` e `product-card.ts`: 100% de statements, funções e branches; `product-details.ts`: 98,51% de statements, 95,65% de funções, 100% de branches e linhas. Nenhuma lógica comercial foi alterada.
- **Testes no Chrome:** `npm run test:e2e` aprovou 21 testes: cinco de hover, dez dos modais e seis de animação. Foram preservados teclado, foco, rolagem, contexto, pedido direto, galeria, estados indisponíveis, toque e movimento reduzido.
- As asserções textuais unitárias normalizam espaços nas bordas introduzidos pela formatação de templates longos. O teste de duração usa o valor equivalente emitido por Tailwind; os testes de entrada inspecionam as animações CSS do painel/fundo, separando-as das transições de cor dos controles.
- **Validação responsiva adicional:** verificações automatizadas em 320, 390, 768, 1024 e 1440 px confirmaram seis produtos, grade de uma/duas/três colunas conforme a largura, categorias em duas/quatro colunas, ausência de overflow externo e uso de DaisyUI em todos os botões renderizados e no modal.
- **Comparação visual:** 15 capturas anteriores e 15 posteriores (página completa e modais fixo/variável em cada largura), em `/tmp/doceria-tailwind-refactor/before/` e `/tmp/doceria-tailwind-refactor/after/`. Cabeçalho, hero, conteúdo, cores, imagens e composição dos modais foram comparados; arredondamento e altura original do diálogo foram restaurados após os ajustes de DaisyUI.
- A altura acumulada da página completa variou entre 7 e 24 px, em documentos de cerca de 4.400 a 6.600 px, sem cortes, conteúdo ausente ou alteração das grades. As variantes dos modais mantiveram as mesmas dimensões das capturas anteriores; permaneceram pequenas diferenças de renderização de controles/texto. Comparações lado a lado também foram inspecionadas em desktop e mobile.
- **Build:** `npm run build` aprovado, com uma rota estática e sem alerta de orçamento. Bundle inicial: 322,30 kB (estimativa de transferência de 84,61 kB), abaixo do limite de 500 kB. A redução acima se refere ao CSS mantido no código-fonte: o CSS global compilado contém utilities e componentes DaisyUI, totalizando 61,92 kB.
- Conferência automatizada do build: seis cards, modal inicialmente fechado e diretório de designs ausente. Análise do CSS do modal confirmou que, fora dos keyframes, restam somente propriedades de animação; referências às folhas removidas foram eliminadas.
- Prettier em modo de conferência nos arquivos alterados e `git diff --check`: aprovados.

## Validação de aderência pelo implementador

- CA01: testes de conteúdo/filtros/contatos da home, verificação automatizada das grades e comparação visual em cinco larguras.
- CA02: testes de cards, pedido direto, teclado, hover de cor e geometria/retorno da elevação.
- CA03: testes de preços, galeria, estados opcionais, falha de imagem, foco, rolagem, fechamento e animações; inspeção de `dialog.modal` e `.modal-box`.
- CA04: cinco testes de hover padrão e testes de movimento reduzido/toque, com cobertura de controles nativos sem classe e indisponíveis.
- CA05: 30 testes unitários, 21 testes no navegador, cobertura, build estático, formatação e conferência do diff aprovados. Tarefas I01–I04, T01–T05 e V01–V03 concluídas.
- Nenhuma lacuna funcional identificada na refatoração. O CSS específico restante corresponde às exceções autorizadas pela especificação; não foi adicionado layout de componente em classes CSS com `@apply`.
- Limitação: validação realizada no Google Chrome; Firefox e Safari não foram executados. Comandos executados com Node 26.5.0. Não foi realizada revisão independente por outro agente.
