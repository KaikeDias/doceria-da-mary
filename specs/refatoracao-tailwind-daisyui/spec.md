# Refatoração para Tailwind e DaisyUI

## Objetivo

Aplicar o padrão solicitado pelo usuário: Tailwind para layout, espaçamentos, tipografia, responsividade e hover; DaisyUI para botões, modal e estados; CSS específico somente para personalizações e animações que precisem dele.

## Contexto

A landing page já possui Tailwind 4 e DaisyUI 5, mas a home, os cards e os detalhes de produto concentram cerca de 1.468 linhas de CSS. A refatoração cobre esses componentes e os estilos globais de controles, preservando os comportamentos descritos nas especificações de design, modais, animações dos produtos e hover padrão dos botões.

## Regras de negócio

- RN01: Preservar conteúdo, seis produtos, preços, contatos, mensagens, filtros, âncoras e regras de abertura/fechamento do modal.
- RN02: Preservar a composição dos designs em desktop/mobile e os breakpoints existentes, incluindo 700 px para mobile e ajustes de largura intermediária.
- RN03: Preservar ampliação/elevação dos cards, entrada suave do modal, hover de cor, movimento reduzido, estados indisponíveis e ausência de hover persistente no toque.
- RN04: Manter classes semânticas necessárias para seletores de testes e identificação dos elementos, sem usá-las para reconstruir o layout inteiro em CSS.

## Requisitos funcionais

- RF01: Migrar layout, medidas, espaçamentos, tipografia, cores, responsividade e hover da home, cards e detalhes para utilities Tailwind nos templates. Evitar recriar todas as regras anteriores com `@apply` em classes específicas.
- RF02: Usar componentes DaisyUI `btn` e suas variantes para ações, filtros e controles de imagem; usar `modal` e `modal-box` mantendo o diálogo nativo e sua acessibilidade. Personalizar esses componentes com utilities para respeitar o design.
- RF03: Remover os estilos de componente que ficarem desnecessários. Manter somente os keyframes/regras da animação específica do diálogo, a configuração do tema/fontes e as personalizações compartilhadas realmente necessárias.
- RF04: Definir estilos fundamentais e o padrão compartilhado de controles com Tailwind/DaisyUI. As regras de hover continuam atendendo botões nativos futuros, inclusive sem classe específica, conforme a especificação de hover padrão.

## Requisitos não funcionais

- RNF01: Não adicionar dependências, temporizadores, novos serviços ou mudanças de lógica para fazer a migração visual.
- RNF02: Preservar geração estática, fontes e imagens locais, ausência de overflow entre 320 e 1440 px, foco visível, teclado, toque e semântica dos controles.
- RNF03: Comparar a renderização anterior/posterior em 320, 390, 768, 1024 e 1440 px, incluindo as duas variantes do modal. Diferenças inerentes aos componentes DaisyUI devem ser corrigidas quando alterarem a composição, os controles ou a legibilidade.

## Critérios de aceitação

- CA01: A home usa utilities Tailwind para estrutura, responsividade e tipografia, preservando as seções, categorias, filtros, catálogo, contatos e rodapé nas cinco larguras de validação.
- CA02: Os cards usam utilities Tailwind e botões DaisyUI; foto/nome/pedido continuam operáveis, o hover mantém escala de 1,02 e elevação de 6 px, com retorno suave e sem deslocamento dos vizinhos.
- CA03: Os detalhes usam `dialog.modal` e `.modal-box`, com layout Tailwind e CSS específico restrito à animação. Preço fixo/variável, galeria, estados opcionais, foco, rolagem e fechamento continuam funcionando no desktop e mobile.
- CA04: Hover de cor e estados disponíveis/indisponíveis usam o padrão compartilhado com utilities/variantes Tailwind e DaisyUI; movimento reduzido e toque preservam os comportamentos existentes.
- CA05: Testes unitários e em navegador das funcionalidades preservadas passam, com cobertura mínima de 90% nas unidades alteradas. Build estático, formatação e revisão do diff passam; comparações visuais têm evidências e limitações registradas.

## Casos de erro

- Estilos padrão de DaisyUI alteram dimensões, animação ou foco: ajustar por utilities/variantes, preservando os critérios anteriores.
- Classes condicionais não são detectadas pelo Tailwind: declarar nomes completos de utilities/variantes, sem montar classes por concatenação dinâmica.
- Conteúdo extenso, dados opcionais ausentes, contato indisponível ou falha de imagem: manter as alternativas já especificadas para os modais.

## Fora de escopo

- Redesenhar a página, trocar assets/fontes, alterar dados do catálogo ou comportamento comercial.
- Adicionar dependências, funcionalidades, rotas, backend, commits, MR ou publicação.
