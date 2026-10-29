# Modais de detalhes dos produtos

## Objetivo

Permitir consultar fotos, descrição, preço e informações adicionais de cada produto sem sair do cardápio, com pedido pelo WhatsApp e apresentação adaptada para desktop e mobile.

## Contexto

A landing page Angular possui seis produtos locais em `src/app/features/catalog/catalog.ts`, cards reutilizáveis e links de pedido centralizados em `src/app/core/config/contact-links.ts`. O modelo já distingue preço fixo (`fixed`) de preço inicial variável (`starting-at`), mas contém apenas uma imagem e uma descrição curta por produto. Atualmente não há modal de detalhes.

Esta funcionalidade tem especificação própria e complementa `specs/atualizacao-design-landing-page/spec.md`, cujo escopo original excluía modais. As regras abaixo governam a nova interação; catálogo, filtros e contatos existentes continuam sendo preservados.

### Referências visuais

| Arquivo em `public/design/landing-page/` | Variante                | Elementos de referência                                                                                                                               |
| ---------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modal-detalhes-1.png`                   | Desktop, preço variável | Bolo de Chocolate, galeria com três fotos, categoria, descrição completa, preço inicial de R$ 85,00, observação de variação, bloco “Bom saber” e CTA. |
| `modal-detalhes-2.png`                   | Desktop, preço fixo     | Brownie Recheado, imagem única, descrição completa, preço de R$ 18,00 e CTA, sem galeria de miniaturas nem bloco adicional neste exemplo.             |
| `modal-detalhes-mobile.png`              | Mobile, preço variável  | Painel inferior, foto acima do conteúdo, miniaturas, fechamento sobre a imagem, conteúdo rolável e rodapé fixo com preço e CTA.                       |

Os desktops têm viewport de referência de 1440 × 900 px; o mobile, de 390 × 844 px. As imagens são a fonte de composição, cores, tipografia, espaçamentos e hierarquia. As barras horizontais visíveis nas exportações são artefatos a corrigir, não elementos a reproduzir. Não há referência mobile específica para preço fixo: aplicar a composição mobile com as regras de preço fixo desta especificação.

### Dados disponíveis e decisões de escopo

- As imagens locais atuais estão em `public/images/`, uma por produto. As fotos adicionais representadas nas miniaturas ainda não estão disponíveis como assets individuais. A interface deve suportar múltiplas fotos, mas não deve simular uma galeria com fotos repetidas ou de outros produtos. Enquanto faltarem assets adequados, usar a foto existente e a apresentação de imagem única.
- As descrições completas do Bolo de Chocolate e do Brownie Recheado podem ser transcritas dos respectivos designs como conteúdo demonstrativo do modal. Manter a descrição curta nos cards; para os demais produtos, usar a descrição existente enquanto não houver texto complementar.
- Os designs exemplificam informações como antecedência de encomenda, conservação e alérgenos. O catálogo atual não possui esses dados. A seção “Bom saber” é opcional e deve exibir somente informações explicitamente cadastradas para o produto; não generalizar as informações do bolo para todo o catálogo. A confirmação comercial desses dados permanece pendente antes de seu cadastro como informação real.
- Abertura, fechamento, ciclo da galeria e adaptação mobile do preço fixo não são demonstrados por PNGs estáticos. Os comportamentos definidos abaixo são decisões desta especificação para viabilizar implementação e testes.

## Regras de negócio

- RN01: Cada card deve oferecer abertura dos detalhes pela foto e pelo nome, com acionadores semânticos acessíveis por teclado e nome que identifique o produto. Preservar o CTA direto “Pedir no WhatsApp”; acioná-lo não abre o modal. Não aninhar links e botões.
- RN02: Exibir somente um modal por vez, sempre com os dados do produto selecionado. Abrir os detalhes não altera filtro, URL ou posição de rolagem do catálogo. Ao fechar, preservar esse contexto e devolver o foco ao acionador.
- RN03: Usar o mesmo nome, categoria e preço do catálogo. Valores em centavos devem ser formatados em reais (`pt-BR`), sem conversão ou cálculo de orçamento.
- RN04: Para `starting-at`, exibir “A partir de”, o valor inicial e uma observação de variação. Para Bolo de Chocolate, usar “Valor varia conforme tamanho e decoração”, conforme o design. Para outros produtos sem observação específica cadastrada, usar “Consulte as opções e o valor final pelo WhatsApp”. Não oferecer seletores de tamanho, decoração ou adicionais.
- RN05: Para `fixed`, exibir o rótulo “Preço” e o valor, sem “A partir de” nem observação de preço variável. A existência de galeria ou informações adicionais depende dos dados, não do tipo de preço.
- RN06: A galeria começa na primeira foto a cada abertura. Com duas ou mais fotos, disponibilizar miniaturas, indicação de foto selecionada e contador “atual / total”. No desktop, incluir anterior/próxima; esses controles percorrem as fotos em ciclo. No mobile, as miniaturas garantem a navegação sem exigir gestos. Com uma foto, ocultar miniaturas, setas e contador.
- RN07: O CTA do modal deve usar “Pedir pelo WhatsApp”, ícone local do WhatsApp e a mensagem contextual já gerada por `productWhatsappUrl` para o produto. Abrir em nova aba com `noopener noreferrer` e indicação acessível dessa abertura. A legenda desktop é “Você conversa direto com a Mary — sem compromisso.”; no mobile pode ser omitida para preservar o espaço do rodapé conforme a referência.
- RN08: Sem WhatsApp válido, manter detalhes disponíveis, impedir navegação no CTA e sinalizar “WhatsApp indisponível” de forma visível e acessível. Não substituir a configuração por dados fictícios.
- RN09: Fechar pelo botão “Fechar detalhes”, por `Escape` ou por clique/toque diretamente no fundo externo. Interações dentro do painel não o fecham. O indicador superior mobile é decorativo; arrastar para fechar não é necessário.

## Requisitos funcionais

- RF01: Integrar os acionadores dos cards ao estado do produto selecionado na página, renderizando os detalhes sem nova rota e preservando o pedido direto existente. (RN01–RN02)
- RF02: Apresentar foto, categoria em destaque, nome como título, descrição completa ou curta como alternativa, preço e CTA. Exibir “Bom saber” com itens e ícones decorativos apenas quando houver informações cadastradas; omitir seção e espaço reservado quando vazia. (RN03–RN05, RN07)
- RF03: Suportar uma lista de fotos com identificação acessível de cada imagem e seleção por miniaturas. Destacar a miniatura ativa, sincronizar foto/contador e oferecer os controles previstos por viewport. (RN06)
- RF04: No desktop, centralizar painel claro com cantos arredondados sobre fundo escurecido e desfocado, aproximadamente 1000 px de largura em 1440 px. Posicionar imagem/miniaturas à esquerda e informações à direita; fechamento no canto superior direito. Na referência, o painel variável mede aproximadamente 680 px de altura e o fixo 560 px; adaptar a altura ao conteúdo e à viewport, sem impor essas medidas em telas menores.
- RF05: No desktop, permitir rolagem vertical interna das informações quando necessário, mantendo foto e área inferior do CTA visíveis quando houver altura disponível. O texto de variação fica junto ao preço. O rodapé do CTA deve permanecer separado da área que rola.
- RF06: No mobile, apresentar painel na base da viewport, com cantos superiores arredondados, indicador decorativo, imagem, miniaturas quando disponíveis e conteúdo em coluna. Botão de fechar deve continuar acessível ao rolar. Fixar preço à esquerda e CTA à direita no rodapé do painel, fora da área rolável, respeitando a área segura do dispositivo. A observação de preço variável fica no conteúdo rolável; o rodapé mantém o rótulo “A partir de” e o valor. Para preço fixo, usar “Preço” e valor no mesmo rodapé.
- RF07: Em telas estreitas ou com texto ampliado, permitir quebra ou empilhamento do rodapé para manter preço e CTA legíveis e acionáveis. Reservar espaço para que o último item do conteúdo não fique encoberto pelo rodapé. Miniaturas excedentes podem rolar horizontalmente dentro da galeria.
- RF08: Gerenciar o ciclo do diálogo: foco inicial no fechamento, foco contido no modal, conteúdo de fundo inerte e rolagem da página bloqueada. Ao fechar por qualquer mecanismo, restaurar foco e rolagem e remover bloqueios. Se o acionador tiver sido removido, devolver foco a um controle estável do cardápio. (RN02, RN09)
- RF09: Tratar falha de carregamento de imagem com alternativa visual neutra e identificação do produto, sem erro em ciclo ou bloqueio dos detalhes/CTA. Descrição complementar ausente deve usar a descrição curta; informações e fotos adicionais ausentes não devem gerar áreas vazias. (RN06, RN08)

## Requisitos não funcionais

- RNF01: Reutilizar Angular, fontes locais Cormorant Garamond/DM Sans, tokens visuais, assets e configuração de contato existentes. Não adicionar dependências de aplicação para o modal ou a galeria.
- RNF02: Preservar build estático e pré-renderização. O modal começa fechado; operações de foco, bloqueio e restauração de rolagem devem acontecer somente no navegador e não quebrar renderização/hidratação.
- RNF03: Não gerar rolagem horizontal da página ou do painel em 320, 390, 768, 1024 e 1440 px. A faixa de miniaturas pode rolar internamente. Respeitar a altura disponível também em orientação horizontal.
- RNF04: Usar semântica de diálogo modal com título associado, nomes acessíveis nos controles, texto alternativo das fotos, foco visível e indicação acessível da miniatura selecionada. Ícones e indicador superior são decorativos. Controles devem funcionar por teclado e toque, com alvo de pelo menos 44 × 44 px.
- RNF05: Não usar PNGs de design como interface ou foto de produto e não publicá-los como assets. Ajustar a exclusão de `public/design/` no build: a regra atual exclui apenas arquivos `@4x.png` e não cobre os três novos PNGs dos modais.
- RNF06: Cada critério de aceitação deve possuir pelo menos um teste automatizado correspondente, complementado por inspeção em navegador para layout, foco e rolagem reais. Cada unidade implementada deve atingir pelo menos 90% de cobertura unitária, conforme `AGENTS.md`. Não considerar testes de DOM prova de fidelidade visual.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                                                                                                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | Para qualquer um dos seis produtos, clicar ou acionar por teclado a foto ou o nome abre somente seu modal. Nome, categoria, descrição e preço correspondem ao produto. O CTA direto do card mantém seu destino e não abre detalhes.                                                                                                                                                      |
| CA02 | Bolo de Chocolate mostra “A partir de”, R$ 85,00 e a observação de tamanho/decoração. Outro produto `starting-at` sem observação específica mostra o texto de consulta. Brownie Recheado mostra “Preço” e R$ 18,00, sem rótulos ou observações variáveis; ambos seguem a mesma regra no rodapé mobile.                                                                                   |
| CA03 | Com três fotos de teste, a primeira começa selecionada; miniaturas e setas desktop atualizam foto, estado selecionado e contador; as setas percorrem os extremos em ciclo. No mobile, todas as fotos são acessíveis pelas miniaturas. Fechar/reabrir ou abrir outro produto reinicia na primeira foto.                                                                                   |
| CA04 | Com uma foto, exibir somente a imagem, sem controles/contador. Sem descrição complementar, usar a curta. Sem informações adicionais, omitir “Bom saber”; com itens cadastrados, exibi-los em ambos os tipos de preço. Falha de imagem mostra alternativa sem impedir fechamento ou pedido.                                                                                               |
| CA05 | Em 1440 × 900 px, as duas variantes seguem os respectivos PNGs: painel centralizado, fundo escurecido/desfocado, foto à esquerda, conteúdo à direita, preços e CTA com a hierarquia indicada. Conteúdo longo rola verticalmente sem encobrir CTA ou fechamento. A comparação da galeria considera a disponibilidade dos assets registrada nesta especificação.                           |
| CA06 | Em 390 × 844 px, o preço variável segue a referência mobile: painel inferior, foto/miniaturas acima do texto, fechamento acessível e preço/CTA fixos na base. O preço fixo usa a mesma composição, sem elementos de preço variável. Todos os itens permanecem alcançáveis pela rolagem interna.                                                                                          |
| CA07 | Em 320, 390, 768, 1024 e 1440 px, inclusive com conteúdo longo, o painel fica contido na viewport, sem overflow horizontal externo. Redução da altura, orientação horizontal e ampliação de texto não impedem fechar ou pedir; preço, CTA e último item permanecem acessíveis.                                                                                                           |
| CA08 | Fechamento pelo botão, `Escape` e fundo externo funciona; clique interno não fecha. Foco inicial, ciclo de `Tab`/`Shift+Tab`, isolamento do fundo e bloqueio da rolagem funcionam. Fechar restaura filtro, posição e foco, inclusive com alternativa caso o acionador tenha sido removido.                                                                                               |
| CA09 | CTA do modal usa ícone do WhatsApp, texto previsto, contato centralizado, mensagem do produto, nova aba e proteção dos links. Com contato ausente ou inválido, não há destino navegável e a indisponibilidade é informada; os demais detalhes continuam utilizáveis.                                                                                                                     |
| CA10 | Diálogo possui título associado; fotos e controles têm nomes acessíveis, miniatura ativa é identificável, foco é visível e alvos de toque atendem a 44 × 44 px. Navegação funciona por teclado sem depender de hover ou gestos.                                                                                                                                                          |
| CA11 | Os testes automatizados cobrem CA01–CA10 e unidades alteradas atingem ao menos 90% de cobertura. Build estático e formatação dos arquivos alterados passam, modal inicia fechado, catálogo/filtros/contatos existentes continuam funcionais e nenhum arquivo de `public/design/` integra a publicação. A validação em navegador tem evidências ou pendências explicitamente registradas. |

## Casos de erro

- WhatsApp ausente ou inválido: aplicar RN08, sem bloquear a consulta do produto.
- Imagem que falha ao carregar: aplicar RF09; manter a galeria operável para as demais fotos e evitar novas tentativas em ciclo na alternativa.
- Fotos adicionais, descrição longa ou informações complementares ausentes: aplicar as alternativas de RN06 e RF09, sem inventar conteúdo.
- Texto extenso, muitas miniaturas, viewport baixa ou fonte ampliada: permitir rolagem interna e adaptação do rodapé conforme RF05–RF07, sem cortar os controles.
- Aberturas sucessivas: manter um único diálogo e reiniciar a seleção da foto para o produto aberto, sem conteúdo anterior residual.
- Acionador removido antes do fechamento: restaurar foco no cardápio conforme RF08, sem deixar o foco em elemento inexistente.

## Fora de escopo

- Checkout, carrinho, pagamento, cálculo de orçamento, estoque, seleção de quantidades ou personalização de produtos.
- Backend, API, administração do catálogo, novas rotas, URL compartilhável do modal ou persistência da seleção após recarga.
- Zoom, tela cheia, reprodução automática, gestos de swipe e arrastar o painel para fechar.
- Criar fotos, usar fotos de outros produtos como alternativas ou apresentar conteúdo comercial não fornecido como confirmado.
- Alterar preços, categorias, contatos, mensagens de pedido ou o conteúdo dos cards além dos acionadores de detalhes.
- Implementar código nesta etapa de especificação, realizar commits, abrir MR ou publicar a aplicação.
