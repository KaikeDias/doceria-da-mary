# Catálogo público lendo do Supabase

## Objetivo

Fazer a landing page (`/`) e o modal de detalhes exibirem as categorias visíveis e os produtos publicados que estão no banco, com estados de carregamento, erro e cardápio vazio.

## Contexto

Hoje a landing lê categorias e produtos fixos de `features/catalog/catalog.ts` (specs `atualizacao-design-landing-page` e `modais-detalhes-produtos`). A base técnica está em `specs/integracao-supabase-base`. O banco já tem os mesmos 6 produtos e 4 categorias visíveis, com a Caixa de Docinhos oculta.

Esta especificação **atualiza** as specs citadas apenas na origem dos dados e nos estados novos. Layout, filtros, cards, modal, hover e animações continuam como estão.

## Regras de negócio

- RN01: A casca da landing (cabeçalho, textos, seções, rodapé) continua pré-renderizada. Categorias e produtos são buscados **no navegador** ao abrir a página, por `CatalogRepository.load()`.
- RN02: Produtos vêm da view `cardapio_publico` (publicados e com categoria visível ou sem categoria), ordenados por `ordem`. Categorias vêm de `categorias` com `visivel = true`, ordenadas por `ordem` — o filtro explícito vale mesmo quando o navegador tem sessão de admin.
- RN03: Mapeamento do produto: `slug` → `id`; `nome`, `descricao`, `detalhes`, `observacao_preco`, `informacoes` → `name`, `description`, `details`, `priceNote`, `information`; `categoria_slug` → `categoryId` e `categoria_rotulo` → `categoryLabel` (vazios sem categoria); preço e imagens conforme a spec base.
- RN04: Fotos: a principal é a de menor `posicao` em `produto_imagens`; as demais formam a galeria do modal na ordem de `posicao`, com texto alternativo "{nome} — foto {n}".
- RN05: Mapeamento da categoria: `slug` → `id`; `nome` → `name` (chip); `rotulo` → `label` (cards); `imagem_url` conforme a spec base.
- RN06: O filtro por categoria continua no cliente, sem nova busca.
- RN07: Preço ausente exibe "Sob consulta" no card e no modal (rótulo "Preço"). No modal, a observação abaixo do preço aparece para "A partir de" e "Sob consulta": `observacao_preco` ou, se vazia, "Consulte as opções e o valor final pelo WhatsApp".
- RN08: Estado **carregando**: a grade de categorias mostra 4 blocos de skeleton e a grade de produtos 3 cards de skeleton; os chips de filtro mostram só "Todos". A região fica com `aria-busy="true"`.
- RN09: Estado **erro**: no lugar da grade de produtos, a mensagem de carregamento da spec base e o botão "Tentar de novo", que repete a busca voltando ao estado carregando. A grade de categorias fica vazia.
- RN10: Estado **vazio**: sem nenhum produto publicado, a grade mostra "Em breve, novos doces por aqui." Com produtos, mas nenhum na categoria filtrada, continua "Nenhum doce nesta categoria por enquanto.".
- RN11: Produto sem foto exibe, no card, um bloco neutro com a mesma proporção da foto; categoria sem imagem exibe o card sem imagem.
- RN12: Links de WhatsApp e Instagram continuam vindo de `public-config.ts`.
- RN13: `catalog.ts` deixa de conter dados: mantém só os tipos e as funções puras (`filterProducts`, `formatPrice`).

## Requisitos funcionais

- RF01: `CatalogRepository.load(): Promise<{ categories, products }>` com implementação Supabase (duas leituras em paralelo e uma terceira das imagens dos produtos retornados). (RN02–RN05)
- RF02: `Home` com estado `loading | ready | error`, busca iniciada com `afterNextRender` e "Tentar de novo". (RN01, RN08–RN10)
- RF03: `Product` ganha `categoryLabel` e `image` passa a ser a URL completa (vazia sem foto); `price` passa a aceitar `null`. `ProductCard` e `ProductDetails` usam esses campos. (RN03, RN07, RN11)
- RF04: `formatPrice(null)` devolve "Sob consulta". (RN07)
- RF05: Remover os dados de `catalog.ts` e mover os exemplos usados pelos testes unitários para `catalog.fixture.ts`. (RN13)

## Requisitos não funcionais

- RNF01: O HTML pré-renderizado da `/` não contém produtos e não há chamada ao banco no build.
- RNF02: Skeletons com `skeleton` do daisyUI; sem rolagem horizontal em 320 e 1440 px nos estados novos.
- RNF03: Estados anunciados: grade com `aria-busy` no carregamento e mensagem de erro em `role="alert"`.
- RNF04: Testes unitários usam um `CatalogRepository` falso; o mapeamento tem testes com respostas de exemplo do banco; o Playwright intercepta `/rest/v1` com fixtures dos 6 produtos atuais, para que os testes existentes de detalhes, hover e animações continuem válidos.
- RNF05: Cobertura ≥ 90% por unidade alterada.

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | Com o banco respondendo, a landing mostra as categorias visíveis e os produtos publicados com nome, categoria, descrição, preço e foto vindos do banco. |
| CA02 | O repositório mapeia uma linha de `cardapio_publico` e suas imagens para `Product` (RN03, RN04), inclusive produto sem categoria, sem foto e sem preço. |
| CA03 | O modal exibe `detalhes`, observação de preço, "Bom saber" e todas as fotos em ordem de `posicao`.                                                      |
| CA04 | Enquanto carrega, aparecem os skeletons e `aria-busy="true"`; ao terminar, somem.                                                                       |
| CA05 | Com falha na leitura, aparecem a mensagem e "Tentar de novo"; clicar repete a busca e, com sucesso, exibe o cardápio.                                   |
| CA06 | Sem produtos publicados, aparece "Em breve, novos doces por aqui.".                                                                                     |
| CA07 | Produto sem preço mostra "Sob consulta" no card e no modal; produto sem foto mostra o bloco neutro.                                                     |
| CA08 | Filtros por categoria continuam funcionando sem nova busca.                                                                                             |
| CA09 | Build estático da `/` sem produtos no HTML; testes unitários e Playwright existentes passam com o Supabase simulado; cobertura ≥ 90%.                   |

## Casos de erro

| Caso                                    | Tratamento esperado                                           |
| --------------------------------------- | ------------------------------------------------------------- |
| Sem internet / Supabase fora do ar      | Estado de erro (RN09).                                        |
| Falha só na leitura das imagens         | Estado de erro (a leitura é tratada como uma operação só).    |
| Foto principal não carrega no navegador | Comportamento atual do card e do modal (imagem indisponível). |
| Produto de categoria oculta             | Não aparece (regra D2, aplicada pela view).                   |

## Fora de escopo

- Pré-renderizar os produtos no HTML (SEO), Realtime e paginação.
- Configurações do site vindas do banco.
- Alterar layout, animações ou hover existentes.

### Visibilidade na API (2026-10-30)

- RN14: RLS de produtos e referencias de imagens exige publicacao e categoria visivel (ou produto sem categoria), inclusive em consultas diretas; administradores leem tudo.
- CA10: Visitante e usuario comum nao leem produtos de categoria oculta nem suas referencias; administrador le e gerencia ambos.
- CA11: Testes SQL executam as politicas reais para visitante, usuario comum e administrador.
