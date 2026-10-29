# Hover padrão dos botões

## Objetivo

Oferecer mudança visível de cor ao passar o mouse sobre os botões do projeto.

## Contexto

O usuário identificou botões sem resposta de hover e solicitou um comportamento padrão. Há controles nativos, filtros, CTAs com `.btn`, pedidos de produto e controles do modal. Esta especificação complementa os modais e as animações dos produtos, sem substituir esses comportamentos.

## Regras de negócio

- RN01: Aplicar hover padrão a todos os `button` e aos links apresentados como botões (`.btn`, `.product-order` e `.details-order`) dentro da landing page, incluindo controles adicionados futuramente com essas mesmas representações.
- RN02: Botões primários e neutros escurecem o fundo mantendo texto claro. Botões claros, filtros não selecionados e controles circulares recebem fundo rosa mais intenso. Filtros selecionados preservam a identidade escura. Ações textuais dos produtos mudam a cor do texto; controles com fotos escurecem levemente a imagem e miniaturas mantêm sua seleção identificável.
- RN03: Aplicar hover somente quando houver ponteiro preciso com suporte a hover. Botões `disabled` ou `aria-disabled="true"` não devem adquirir a aparência de uma ação disponível ao passar o mouse.
- RN04: Retirar o mouse restaura o estado original. A mudança de cores é suave e não altera dimensões, posição, nome, foco ou destino das ações.

## Requisitos funcionais

- RF01: Centralizar as regras de hover em `src/styles.css`, reutilizando a paleta existente e mantendo as variações sem exigir novos handlers de eventos.
- RF02: Transicionar cores de fundo, borda e texto em 160 ms; nos botões com imagem, transicionar o escurecimento visual na mesma duração.
- RF03: Manter elevação do card e abertura suave do modal definidas em `specs/animacoes-produtos/spec.md`. Em movimento reduzido, as cores ainda respondem ao hover, mas sem transição animada.

## Requisitos não funcionais

- RNF01: Usar apenas CSS, sem novas dependências ou mudanças nas regras de pedido, filtros e ciclo do modal.
- RNF02: Preservar foco visível, seleção acessível, legibilidade dos rótulos e alvos de toque existentes.
- RNF03: Evitar efeitos de hover persistentes em telas exclusivamente de toque e mudanças em links de navegação que não são botões.

## Critérios de aceitação

- CA01: No navegador com mouse, CTAs primários/neutros, CTA com contorno, filtro ativo/inativo, nome do produto, pedido direto e controles do modal apresentam mudança visível de cor e retornam ao estado anterior ao retirar o mouse. Um botão nativo simples adicionado à página também recebe o padrão.
- CA02: Foto de produto e miniaturas respondem visualmente ao hover; a miniatura ativa continua marcada e os acionadores abrem os mesmos detalhes. As dimensões dos controles não mudam por causa das regras de cor.
- CA03: Controles desabilitados não respondem como disponíveis; em contexto exclusivamente de toque, a mudança de cor por hover não permanece após tocar. Movimento reduzido elimina as transições de cor, preservando a resposta imediata.
- CA04: Cada critério possui testes em navegador; testes de animações, regressões unitárias, build e formatação dos arquivos alterados passam. Não há nova lógica de aplicação a instrumentar; a cobertura unitária existente permanece acima de 90% nas unidades dos produtos.

## Casos de erro

- Contato indisponível: CTA permanece indisponível e sem hover de ação habilitada.
- Ponteiro sai no meio da transição: retornar suavemente à cor original.
- Dispositivo sem hover ou com movimento reduzido: aplicar RN03 e RF03 sem impedir uso dos controles.

## Fora de escopo

- Alterar ações, conteúdo, paleta base, layout, rotas, controles de navegação ou adicionar animação de fechamento do modal.
- Adicionar dependências, realizar commits ou publicar a aplicação.
