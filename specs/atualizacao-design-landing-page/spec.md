# Atualização do design da landing page

## Objetivo

Adequar a landing page desktop e mobile às novas referências locais, mantendo o catálogo e os contatos já configurados.

## Contexto

As referências são `public/design/landing-page/Landing page — Desktop 1440@4x.png` (1440 × 4300 pixels) e `public/design/landing-page/Landing page — Mobile 390@4x.png` (390 × 6100 pixels). Apesar do sufixo `@4x`, essas são as dimensões reais dos arquivos. Os PNGs são a fonte visual para composição, espaçamentos, cores, tipografia e imagens.

A implementação existente utiliza Angular, fotos e fontes locais, seis produtos demonstrativos, filtros por categoria e links de WhatsApp/Instagram centralizados. A referência mobile termina no início do card Instagram; o restante do contato e o rodapé devem continuar disponíveis, adaptados à largura da tela a partir da composição desktop.

Em solicitação posterior, o usuário determinou duas exceções às referências: remover o aviso "Valores ilustrativos para demonstração" e usar o ícone reconhecível do WhatsApp no CTA do cabeçalho e no card de contato, substituindo os ícones genéricos de mensagem.

## Regras de negócio

- Preservar os seis produtos, suas categorias, descrições, preços e mensagens de pedido.
- Preservar o WhatsApp e o Instagram reais configurados. Os placeholders dos PNGs não substituem esses dados.
- Não exibir o aviso "Valores ilustrativos para demonstração" no desktop nem no mobile; essa remoção não altera os produtos ou preços.
- Clicar em uma categoria deve selecionar seu filtro e navegar ao cardápio; o filtro Todos restaura os seis produtos.
- Links externos mantêm abertura em nova aba e proteção `noopener noreferrer`.
- A alteração é visual; não adiciona checkout, backend ou novas rotas.

## Requisitos funcionais

- RF01: Cabeçalho desktop com marca, navegação e CTA; mobile com logo, nome, subtítulo e CTA compacto "Pedir", conforme a referência, sem botão de menu visível. O CTA utiliza o ícone do WhatsApp nos dois formatos.
- RF02: Hero em duas colunas no desktop e empilhado no mobile, com o texto completo apresentado na referência, dois CTAs, moldura rosa da foto e selo "Feito à mão" também no mobile.
- RF03: Categorias em quatro cards horizontais no desktop; no mobile, grade de duas colunas com imagem acima do nome, rótulo "Kits e presentes" e ação "Explorar" visível. Exibir a legenda "Uma delícia para cada vontade." nos dois formatos.
- RF04: Cardápio com três colunas no desktop e uma no mobile. Cada card mantém foto, categoria, nome, descrição, preço e ação "Pedir no WhatsApp" visíveis nos dois formatos. Filtros mobile permanecem em uma faixa horizontal rolável quando necessário. Não apresentar o aviso de valores ilustrativos nem reservar espaço para ele.
- RF05: Seção sobre com foto ao lado dos textos no desktop e acima no mobile, ambos os parágrafos e badges "Produção artesanal"/"Feito com cuidado" visíveis. Encomendas preserva CTA e descrição completa, com botão ocupando a largura disponível no mobile.
- RF06: Contato desktop com texto à esquerda e dois cards empilhados à direita. No mobile, texto acima dos cards. WhatsApp utiliza card rosa com ícone do WhatsApp e Instagram card claro com seu ícone, ambos com título, descrição e dados reais configurados. A área inteira de cada card deve ser um link acessível. Os ícones são decorativos e os nomes acessíveis dos links permanecem preservados.
- RF07: Preservar âncoras, link de salto para o cardápio e rodapé, incluindo navegação e Instagram, com adaptação para telas estreitas.

## Requisitos não funcionais

- RNF01: Manter identidade visual, fontes locais, assets existentes e geração estática Angular; não carregar os PNGs de referência como substitutos da página.
- RNF02: Evitar rolagem horizontal da página entre 320 e 1440 pixels; a faixa de filtros pode rolar internamente. Em larguras intermediárias, adaptar grades e espaçamentos de forma legível.
- RNF03: Preservar HTML semântico, nomes acessíveis, foco visível, texto alternativo das fotos de conteúdo e seleção de filtro com `aria-pressed`. Controles devem continuar utilizáveis por teclado e toque.
- RNF04: Não adicionar dependências de aplicação para reproduzir o layout. As referências de design não devem integrar os assets publicados.

## Critérios de aceitação

- CA01: Em 1440 px, cabeçalho e hero reproduzem a composição desktop; em 390 px, exibem marca com subtítulo, CTA "Pedir", texto completo, CTAs empilhados e selo visível. Não há menu hambúrguer no cabeçalho mobile. O CTA do cabeçalho exibe o ícone do WhatsApp, sem ícone genérico de mensagem.
- CA02: Categorias apresentam quatro cards no desktop e duas colunas com foto superior no mobile; legenda, nomes completos e ações "Explorar" estão disponíveis. Cada categoria seleciona seus produtos e navega para `#cardapio`.
- CA03: Os seis cards exibem descrição, preço e ação completa nos dois formatos, com três colunas desktop e uma mobile. Todos os filtros funcionam, refletem seleção acessível e permitem restaurar o catálogo completo. O aviso "Valores ilustrativos para demonstração" está ausente do DOM e nenhum espaço é reservado para ele.
- CA04: Sobre e encomendas reproduzem composição, textos completos, badges e CTA das referências; o mobile não oculta o segundo parágrafo de sobre.
- CA05: Contato utiliza dois cards acessíveis, com WhatsApp rosa e Instagram claro, ícones e informações reais. O card do WhatsApp exibe o ícone do WhatsApp, sem ícone genérico de mensagem; os ícones são decorativos. Todos os CTAs preservam nomes acessíveis, destinos e mensagens contextuais configurados.
- CA06: Âncoras, navegação de rodapé, link de salto e foco continuam funcionais; não há overflow horizontal da página em 320, 390, 768, 1024 e 1440 px.
- CA07: Build estático, testes automatizados e formatação dos arquivos alterados passam; fontes e fotos continuam locais e os PNGs de design não são copiados para a publicação. Cada critério possui cobertura automatizada aplicável, complementada por inspeção visual para composição e responsividade. Unidades de código implementadas devem atingir pelo menos 90% de cobertura unitária, conforme `AGENTS.md`.

## Casos de erro

- Uma categoria sem produtos mantém a mensagem vazia existente.
- Configuração de contato ausente mantém link sem destino e sinalização de indisponibilidade; não criar números, perfis ou URLs fictícios.
- Textos e valores maiores devem permanecer dentro dos cards e da viewport; filtros excedentes podem rolar dentro da própria faixa.
- Não remover o contato/rodapé porque a exportação mobile termina antes dessas áreas.

## Fora de escopo

- Alterar catálogo, preços, contatos, regras de pedido ou integrações.
- Criar imagens, redesenhar logo, adicionar páginas, modais, checkout, administração ou backend.
- Publicar, abrir MR ou realizar commits.
- Obter medidas diretamente no Paper; os arquivos locais são a referência disponível.
