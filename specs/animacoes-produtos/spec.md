# Animações dos produtos

## Objetivo

Dar destaque aos cards ao passar o mouse e suavizar a abertura dos detalhes do produto.

## Contexto

O usuário solicitou ampliação e elevação do card no hover e uma transição suave ao abrir o modal. A funcionalidade complementa `specs/modais-detalhes-produtos/spec.md`; os componentes e os layouts existentes são preservados após a animação.

## Regras de negócio

- RN01: Com mouse ou outro ponteiro preciso que suporte hover, ampliar o card em 2%, deslocá-lo 6 px para cima e reforçar sua sombra. Ao retirar o ponteiro, voltar suavemente ao estado original.
- RN02: O hover é somente visual e não altera tamanho das células da grade, posição dos produtos vizinhos ou as ações existentes. Dispositivos exclusivamente de toque não devem manter um card ampliado após o toque.
- RN03: Ao abrir os detalhes pela foto ou pelo nome, animar a entrada do painel e do fundo externo em 280 ms, sem atrasar o gerenciamento de foco ou o bloqueio do fundo. A mesma entrada deve ocorrer em cada reabertura e por acionamento de teclado.
- RN04: Em `prefers-reduced-motion: reduce`, manter card e modal em seus estados finais, sem ampliação, deslocamento ou animação. Todos os controles continuam operáveis.

## Requisitos funcionais

- RF01: Aplicar transição de 220 ms em transformação e sombra do card, com aceleração suave, nos dois sentidos do hover. (RN01–RN02)
- RF02: No desktop, abrir o modal com aumento de opacidade e transformação de escala de 0,96 para 1 e deslocamento vertical de 16 px para zero. (RN03)
- RF03: No mobile (até 700 px), abrir o painel inferior com aumento de opacidade e deslocamento de 32 px para zero, sem ampliação lateral. O fundo escurecido deve surgir gradualmente junto ao painel. (RN03)
- RF04: Desativar as transições e animações de movimento para a preferência de movimento reduzido. (RN04)

## Requisitos não funcionais

- RNF01: Usar CSS e os componentes existentes, sem dependências novas ou temporizadores JavaScript.
- RNF02: Preservar semântica, foco, teclado, toque, rolagem, filtros, pedido direto e fechamento do modal. A animação não deve atrasar uma solicitação de fechamento nem deixar o fundo bloqueado.
- RNF03: Evitar alteração de layout e overflow horizontal externo. A composição final continua sendo a especificada nos designs dos modais.

## Critérios de aceitação

- CA01: No Chrome com ponteiro preciso, passar o mouse amplia e eleva o card com sombra reforçada e transição; retirar o mouse restaura o estado original suavemente. Os produtos vizinhos mantêm posição e tamanho e a página não ganha overflow horizontal.
- CA02: Abrir/reabrir um produto no desktop aplica a animação de opacidade/escala/deslocamento e a entrada do fundo. Ao terminar, o painel ocupa sua posição original. Foto, nome, teclado e fechamento continuam funcionando.
- CA03: No mobile, a entrada usa somente opacidade/deslocamento vertical e termina no painel inferior existente. Um toque não produz o hover de ampliação, o preço/CTA continuam acessíveis e a página não ganha overflow horizontal.
- CA04: Com movimento reduzido, não há transformação de hover ou animação de entrada no painel/fundo. Os detalhes ainda abrem e fecham normalmente.
- CA05: Os critérios CA01–CA04 possuem testes em navegador; regressões unitárias, testes dos modais, build estático e formatação dos arquivos alterados passam. Alterações de lógica, caso necessárias, mantêm cobertura unitária mínima de 90% conforme `AGENTS.md`.

## Casos de erro

- Ponteiro sai durante a transição: reverter a partir do estado visual atual, sem salto.
- Modal fecha durante a entrada: fechar e restaurar contexto normalmente, sem esperar os 280 ms.
- Sistema solicita movimento reduzido: aplicar RN04, sem impedir consulta ou pedido.

## Fora de escopo

- Animar o fechamento do modal, transformar geometricamente o card na janela, adicionar gestos ou mudar os acionadores de detalhes.
- Alterar conteúdo, preços, contatos, regras de pedido, rotas, dependências, backend ou publicação.
