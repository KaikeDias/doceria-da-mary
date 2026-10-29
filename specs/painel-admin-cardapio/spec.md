# Painel administrativo — estrutura e gerenciamento do cardápio

## Objetivo

Implementar a primeira entrega do painel administrativo da Doceria da Mary: a estrutura de navegação (menu lateral no desktop e menu em gaveta no mobile) e a tela "Gerenciar cardápio", que lista os doces, permite pesquisar, filtrar por categoria e por status e alternar a publicação de cada doce, reproduzindo as referências desktop e mobile.

## Contexto

O projeto é uma landing page Angular standalone com Router, renderização estática, Tailwind CSS, daisyUI, Lucide e testes com Vitest e Playwright. Hoje `/admin` é uma página em branco (componente `Admin`), liberada pelo login provisório `admin`/`admin` de `specs/tela-login`. Não existem backend, banco de dados, sessão ou guarda de rotas. O catálogo do site está em `src/app/features/catalog/catalog.ts` (4 categorias e 6 produtos demonstrativos, sem noção de publicação).

### Referências visuais

| Arquivo em `public/design/`                     | Viewport      | Conteúdo de referência                                                                                          |
| ----------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| `cardapio/Cardápio — lista com produtos@1x.png` | 1440 × 900 px | Menu lateral, cabeçalho, dois indicadores, busca, filtros, tabela de produtos com chave de status e ações.      |
| `cardapio/Cardápio — mobile (cards)@1x.png`     | 390 × 844 px  | Barra superior com menu e atalho do site, indicadores, busca, filtros em duas colunas e produtos em cards.      |
| `categorias/Mobile — menu em drawer@1x.png`     | 390 × 844 px  | Menu em gaveta sobre a tela, com fundo escurecido, botão de fechar e itens de navegação.                        |
| `categorias/Categorias@1x.png`                  | 1440 × 900 px | Usada somente como referência do menu lateral com "Categorias" ativo; a tela de categorias não é desta entrega. |

As imagens são referência de composição, tipografia, cores, espaçamento, ícones e hierarquia. O texto "crie os testes dessa pagina" sobre o botão "Adicionar produto" na referência desktop é um ruído do arquivo de design e **não** deve ser reproduzido.

### Decisões de escopo

- Sem backend, os dados vêm do catálogo demonstrativo existente e o estado de publicação vive somente em memória, reiniciando a cada carga da página. Alterações **não** afetam a landing page nesta entrega.
- Estado inicial de publicação conforme a referência: todos publicados, exceto "Caixa de Docinhos" (oculto), resultando em "5 de 6".
- Não há referências para formulário de produto, menu "…" de ações, confirmações, tela de categorias nem configurações; esses fluxos não são implementados aqui. Os controles que os acionariam aparecem como na referência, porém indisponíveis (ver RN08).
- A estrutura (menu e rotas) pertence ao painel e é reutilizada pelas próximas telas; a tela de categorias terá especificação própria em `specs/`.

## Regras de negócio

- RN01: O painel vive sob `/admin`. `/admin` redireciona para `/admin/cardapio`. O título da página é "Cardápio | Painel Doceria da Mary". Não implementar guarda de rotas, sessão ou autorização nesta etapa; registrar essa ausência como ponto de atenção (qualquer pessoa abre a URL).
- RN02: O menu tem "Cardápio", "Categorias" e "Configurações", no topo, e "Visualizar site" e "Sair" no rodapé. Apenas "Cardápio" tem destino; "Categorias" e "Configurações" são exibidos como indisponíveis (`aria-disabled`, sem navegação) até existirem suas telas. O item da tela atual é destacado em rosa e marcado com `aria-current="page"`.
- RN03: "Visualizar site" abre `/` em nova aba (`target="_blank"`, `rel="noopener"`). "Sair" navega para `/login` na mesma aba; como não há sessão, não encerra nada além da navegação.
- RN04: Indicadores: "Total de produtos" é a quantidade de produtos no painel, independente de filtros; "Publicados no site" mostra a quantidade de publicados e "de {total}". Ambos refletem a alternância de publicação imediatamente.
- RN05: A lista exibe, por produto: imagem, nome, categoria (rótulo "label" da categoria, ex.: "Kits e presentes"), preço e status. O preço usa "A partir de" para `starting-at` e "Preço fixo" para `fixed`, formatado em reais (`R$ 85,00`) a partir de centavos. No mobile, o preço aparece como "a partir de R$ 85,00" ou "R$ 18,00" na linha da categoria (conforme a referência).
- RN06: Filtros combinados com E lógico: busca por nome (sem diferenciar maiúsculas/minúsculas e acentos, ignorando espaços nas extremidades), categoria ("Todas as categorias" por padrão) e status ("Todos", "Publicados", "Ocultos"). A filtragem é imediata, sem botão de aplicar. Os indicadores não mudam com os filtros.
- RN07: A chave de status alterna entre "Publicado" e "Oculto" para aquele produto, sem recarregar a lista e sem mudar a ordem. Com o filtro "Publicados" ou "Ocultos" ativo, o produto alternado deixa a lista imediatamente.
- RN08: "Adicionar produto", "Editar" e o menu "…" aparecem como na referência, mas ficam desabilitados (`aria-disabled`, sem ação, sem aparência de disponibilidade) e com explicação acessível de que a funcionalidade chega em breve. Não inventar formulário, modal ou rota para eles.
- RN09: Estado vazio: sem produtos após filtros, exibir "Nenhum doce encontrado" com orientação para ajustar a busca ou os filtros, e uma ação "Limpar filtros". Os indicadores permanecem.
- RN10: Mobile: abaixo de 1024 px o menu lateral é substituído por barra superior com botão de menu (abre a gaveta), marca e atalho "Visualizar site"; a tabela vira lista de cards. A gaveta fecha pelo botão ×, pela tecla `Esc`, pelo clique no fundo escurecido e ao navegar.

## Requisitos funcionais

- RF01: Criar o layout do painel como componente standalone/OnPush, rota-pai `/admin` com a rota-filha `cardapio`, carregada sob demanda, incluída na renderização estática. Substituir o componente em branco atual por esse layout. Preservar `/`, `/login` e seus redirecionamentos (login com sucesso continua levando a `/admin`). (RN01)
- RF02: Implementar o menu lateral desktop (≥ 1024 px, ~240 px de largura, fundo rosa claro, logo `logo.png` + "Doceria da Mary" + "PAINEL", item ativo em destaque rosa, divisor antes de "Visualizar site"/"Sair") e a gaveta mobile conforme a referência. (RN02, RN03, RN10)
- RF03: Implementar o cabeçalho da tela: título "Gerenciar cardápio" (Cormorant Garamond), subtítulo "Organize os doces que aparecem no seu site" e botão "Adicionar produto" (desktop à direita; mobile em largura total abaixo do subtítulo). (RN08)
- RF04: Implementar os dois indicadores com ícone, rótulo e valor, conforme a referência. (RN04)
- RF05: Implementar busca com ícone e placeholder "Pesquisar doce pelo nome", seletor de categorias e controle segmentado "Todos / Publicados / Ocultos" (desktop); no mobile, busca em largura total e os dois seletores lado a lado ("Categorias" e "Todos"). (RN06)
- RF06: Implementar a tabela desktop (colunas Produto, Categoria, Preço, Status no site, Ações) e os cards mobile (imagem, nome, "…", rótulo de categoria e preço, chave de status e botão "Editar"). Usar as imagens existentes em `public/images/`. (RN05, RN07, RN08)
- RF07: Implementar a chave de publicação como controle acessível (`role="switch"`, `aria-checked`, nome com o do produto) que usa o verde de sucesso do tema quando publicado. (RN07)
- RF08: Derivar a lista, os indicadores e os filtros de um estado em memória inicializado a partir do catálogo existente, sem alterar `catalog.ts` nem o comportamento da landing page. (RN04, RN06)
- RF09: Usar daisyUI/Tailwind e o tema existente (fontes, cores, `rounded`), reaproveitando os ícones Lucide locais; criar apenas utilitários de estilo necessários e sem alterar o estilo da landing page. (RNF01)

## Requisitos não funcionais

- RNF01: Reutilizar Angular standalone, OnPush, signals, tema Tailwind/daisyUI e Lucide já instalados; sem novas dependências, fontes ou serviços externos. Não alterar globalmente breakpoints ou estilos da landing page nem do login.
- RNF02: Preservar saída estática e hidratação; sem APIs exclusivas do navegador durante o build. Mesmo com um painel não protegido, o HTML gerado não deve conter credenciais.
- RNF03: Sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px; os textos longos truncam ou quebram sem cortar controles. A lista pode rolar verticalmente; o menu lateral desktop permanece visível ao rolar.
- RNF04: Acessibilidade: um `h1`; `nav` com nome; botão do menu com nome e `aria-expanded`; gaveta com foco preso, foco inicial no botão de fechar, retorno do foco ao botão de menu ao fechar e `Esc`; tabela com cabeçalhos associados; chaves com `role="switch"`; contagem de resultados anunciada em região viva ao filtrar; foco visível; alvos de pelo menos 44 × 44 px no mobile; ícones decorativos ocultos.
- RNF05: Seguir o padrão de hover/foco existente (mudança de cor sem alterar dimensões); controles indisponíveis não aparentam disponibilidade; respeitar movimento reduzido na animação da gaveta.
- RNF06: Cada critério de aceitação com ao menos um teste automatizado; cada unidade implementada com pelo menos 90% de cobertura unitária (`AGENTS.md`).

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | Abrir `/admin` redireciona para `/admin/cardapio` com título correto; o login com `admin`/`admin` continua levando ao painel; `/` e `/login` não mudam.                                                         |
| CA02 | Em 1440 × 900 px, a tela segue a referência desktop: menu lateral com "Cardápio" ativo, cabeçalho, indicadores "6" e "5 de 6", busca, filtros e seis linhas com imagem, categoria, preço e status.              |
| CA03 | Em 390 × 844 px, a tela segue a referência mobile: barra superior, botão em largura total, indicadores, busca, filtros em duas colunas e produtos em cards; sem menu lateral e sem tabela.                      |
| CA04 | O preço aparece corretamente ("A partir de R$ 85,00" / "Preço fixo R$ 18,00" no desktop; "a partir de R$ 85,00" / "R$ 18,00" no mobile).                                                                        |
| CA05 | A busca filtra por nome ignorando caixa, acentos e espaços nas extremidades; o filtro de categoria e o de status combinam com a busca; os indicadores não mudam com os filtros.                                 |
| CA06 | Alternar a chave de um produto troca "Publicado"/"Oculto", atualiza "Publicados no site" e, com filtro de status ativo, remove o produto da lista; recarregar restaura o estado inicial.                        |
| CA07 | Sem resultados, aparece "Nenhum doce encontrado" e "Limpar filtros" restaura busca, categoria e status.                                                                                                         |
| CA08 | "Adicionar produto", "Editar" e "…" estão indisponíveis, não executam ação nem navegam; "Categorias" e "Configurações" não navegam.                                                                             |
| CA09 | "Visualizar site" abre `/` em nova aba; "Sair" leva a `/login`.                                                                                                                                                 |
| CA10 | No mobile, o botão de menu abre a gaveta (foco no ×, fundo escurecido); × , `Esc`, clique no fundo e navegação a fecham, devolvendo o foco ao botão de menu.                                                    |
| CA11 | Em 320, 390, 768, 1024 e 1440 px, o limite de 1024 px troca menu lateral/gaveta e tabela/cards sem rolagem horizontal; alvos têm ≥ 44 × 44 px no mobile.                                                        |
| CA12 | Semântica e acessibilidade: `h1`, `nav` nomeado, `aria-current`, chaves `role="switch"` com nome e `aria-checked`, cabeçalhos de tabela, região viva com a contagem de resultados e foco visível por teclado.   |
| CA13 | Cada CA01–CA12 tem teste correspondente; cobertura ≥ 90% por unidade; testes existentes (landing, catálogo, login) continuam passando; build estático gera `/`, `/login` e `/admin/cardapio`; formatação passa. |

## Casos de erro

| Caso                                               | Tratamento esperado                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Busca ou filtros sem resultado                     | Estado vazio com "Limpar filtros" (RN09).                                                              |
| Busca somente com espaços                          | Tratada como busca vazia.                                                                              |
| Imagem de produto indisponível                     | Manter a linha/card com fundo neutro no lugar da imagem, sem repetir a tentativa nem quebrar o layout. |
| Acesso direto a `/admin/cardapio` sem login        | Painel abre normalmente (sem guarda nesta etapa); registrado como ponto de atenção.                    |
| Acionar controle indisponível por teclado ou toque | Nenhuma ação, sem erro e sem alterar o foco.                                                           |
| Rota `/admin/` desconhecida                        | Fora do escopo; segue o comportamento atual do roteador.                                               |

## Fora de escopo

- Adicionar, editar, excluir ou reordenar produtos, formulário de produto e menu "…" funcional.
- Tela de categorias (referência `categorias/Categorias@1x.png`), configurações e seus fluxos.
- Backend, banco de dados, persistência, sincronização das alterações com a landing page, autenticação real, sessão, guarda de rotas e logout efetivo.
- Upload e gerenciamento de imagens; paginação, ordenação e busca no servidor.
- Alterar conteúdo ou comportamento da landing page e da tela de login; commits e MR.
