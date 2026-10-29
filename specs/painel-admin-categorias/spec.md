# Painel administrativo — tela de categorias

## Objetivo

Implementar a tela "Categorias" do painel administrativo em `/admin/categorias`, reproduzindo a referência desktop: lista de categorias com a quantidade de produtos, a chave de visibilidade no site e as ações, além do aviso sobre categorias ocultas. Ativar o item "Categorias" do menu lateral, que hoje está indisponível.

## Contexto

O painel foi criado em `specs/painel-admin-cardapio` e já possui o layout (menu lateral desktop, gaveta mobile), a rota-pai `/admin` e a tela `/admin/cardapio`. Não existem backend, persistência ou sessão: o estado de visibilidade vive somente em memória e reinicia a cada carga da página, como na tela de cardápio.

As categorias do catálogo estão em `src/app/features/catalog/catalog.ts` (4 categorias, com `id`, `name`, `label`). Os produtos têm `categoryId`, que permite contar os produtos de cada categoria.

### Referências visuais

| Arquivo em `public/design/`                 | Viewport      | Conteúdo de referência                                                                                                    |
| ------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `categorias/Categorias@1x.png`              | 1440 × 900 px | Menu lateral com "Categorias" ativo, cabeçalho com "Adicionar categoria", aviso informativo e tabela de cinco categorias. |
| `categorias/Mobile — menu em drawer@1x.png` | 390 × 844 px  | Gaveta com "Categorias" como item de menu (sem a tela mobile de conteúdo).                                                |

A referência é de composição, tipografia, cores, espaçamento e hierarquia. Não há referência da tela de categorias em mobile; a versão mobile segue o padrão de cards da tela de cardápio.

### Decisões de escopo

- A referência mostra "Adicionar categoria", editar e excluir como ações habilitadas, mas não há formulário, modal de confirmação nem rota para elas. Essas ações ficam indisponíveis, com o mesmo tratamento de RN08 da spec de cardápio. Os fluxos são uma entrega futura.
- A referência traz cinco categorias. "Datas especiais" não existe no catálogo; entra como dado demonstrativo, oculta e sem produtos, sinalizado no código como `shortcut`.
- A contagem de produtos é derivada do catálogo (`products`), incluindo produtos ocultos no cardápio. A visibilidade dos produtos na tela de cardápio é um estado separado e não altera esta contagem.
- Alterações de visibilidade **não** afetam a landing page nesta entrega.

## Regras de negócio

- RN01: A tela vive em `/admin/categorias`, dentro do layout do painel. O título da página é "Categorias | Painel Doceria da Mary". Sem guarda de rotas, como na tela de cardápio.
- RN02: O item "Categorias" do menu lateral passa a ser um link para `/admin/categorias`, destacado com `aria-current="page"` quando a tela está aberta, e não mais indisponível. "Configurações" continua indisponível (RN02 da spec de cardápio).
- RN03: O cabeçalho mostra o título "Categorias", o subtítulo "Agrupe seus doces do jeito que eles aparecem no site" e o botão "Adicionar categoria", indisponível (RN08 da spec de cardápio).
- RN04: O aviso informativo diz "Categorias ocultas somem dos filtros do site, mas os doces delas continuam salvos aqui no painel." e fica sempre visível.
- RN05: A lista exibe, por categoria, o nome (com ícone), a quantidade de produtos e a visibilidade no site. Ordem: a ordem do catálogo seguida de "Datas especiais".
- RN06: Quantidade de produtos: "Nenhum produto" para zero, "1 produto" para um e "{n} produtos" para os demais, contando os produtos do catálogo com aquele `categoryId`.
- RN07: A chave de visibilidade alterna entre "Visível" e "Oculta" para aquela categoria, de forma imediata e sem mudar a ordem. Estado inicial: todas visíveis, exceto "Datas especiais" (oculta).
- RN08: As ações "Editar" e "Excluir" de cada categoria e o botão "Adicionar categoria" ficam indisponíveis (`aria-disabled`, sem ação, sem aparência de disponibilidade) com explicação acessível de que a funcionalidade chega em breve.
- RN09: Abaixo de 1024 px a tabela vira lista de cards com nome, quantidade, visibilidade e as ações indisponíveis, seguindo a tela de cardápio.

## Requisitos funcionais

- RF01: Criar a página standalone/OnPush `Categorias` em `src/app/features/admin/`, carregada sob demanda como filha `categorias` da rota `admin`, com título próprio e pré-renderização. (RN01)
- RF02: Habilitar o link "Categorias" no menu lateral e na gaveta mobile, mantendo a mesma estrutura de item do menu. (RN02)
- RF03: Implementar cabeçalho e aviso conforme a referência. (RN03, RN04)
- RF04: Implementar a tabela desktop (colunas Categoria, Produtos, Status no site, Ações) e os cards mobile. (RN05, RN06, RN09)
- RF05: Implementar a chave de visibilidade como controle acessível (`role="switch"`, `aria-checked`, nome com o da categoria), com o verde de sucesso do tema quando visível. (RN07)
- RF06: Manter o estado de visibilidade em signals, inicializado a partir de "Datas especiais" oculta; não alterar `catalog.ts` nem a landing page. (RN07)
- RF07: Usar Tailwind e daisyUI (`toggle`, `btn`, `table` quando aplicável) para estilos; não criar CSS puro. Reaproveitar os ícones Lucide já instalados (`LucideTags`, `LucidePencil`, `LucideTrash2`, `LucidePlus`, `LucideInfo`).

## Requisitos não funcionais

- RNF01: Sem novas dependências, serviços, fontes ou CSS puro; apenas Tailwind/daisyUI e Lucide.
- RNF02: Preservar saída estática e hidratação; o HTML gerado não deve conter credenciais.
- RNF03: Sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px; limite de 1024 px troca tabela e cards.
- RNF04: Acessibilidade: um `h1`, cabeçalhos de tabela com `scope`, chaves com `role="switch"` e nome, ícones decorativos ocultos, controles indisponíveis com explicação acessível e alvos de pelo menos 44 × 44 px no mobile.
- RNF05: Cada critério de aceitação com ao menos um teste automatizado; cada unidade implementada com pelo menos 90% de cobertura unitária (`AGENTS.md`).

## Critérios de aceitação

| ID   | Cenário e resultado esperado                                                                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA01 | `/admin/categorias` abre a tela com o título "Categorias \| Painel Doceria da Mary" e o item "Categorias" do menu lateral marcado com `aria-current="page"`.                        |
| CA02 | Em 1440 × 900 px, a tela segue a referência: cabeçalho, aviso, cinco linhas com nome, quantidade e visibilidade, e as ações indisponíveis.                                          |
| CA03 | A quantidade de produtos segue RN06: "2 produtos" para Bolos e Sobremesas, "1 produto" para Docinhos e Kits e "Nenhum produto" para Datas especiais.                                |
| CA04 | Alternar a chave de uma categoria troca "Visível"/"Oculta" e o `aria-checked`, sem mudar a ordem nem a quantidade de categorias.                                                    |
| CA05 | Estado inicial: "Datas especiais" oculta e as demais visíveis.                                                                                                                      |
| CA06 | "Adicionar categoria", "Editar" e "Excluir" estão indisponíveis, não executam ação nem navegam, por clique e teclado.                                                               |
| CA07 | Em 390 × 844 px, a lista vira cards com nome, quantidade, visibilidade e ações indisponíveis, sem tabela; "Categorias" continua destacado na gaveta.                                |
| CA08 | Em 320, 390, 768, 1024 e 1440 px, não há rolagem horizontal e o limite de 1024 px troca tabela e cards; alvos têm ≥ 44 × 44 px no mobile.                                           |
| CA09 | Semântica: `h1`, cabeçalhos de tabela com `scope`, `role="switch"` com nome e `aria-checked`, ícones decorativos ocultos e foco visível por teclado.                                |
| CA10 | Cada CA01–CA09 tem teste automatizado; cobertura ≥ 90% por unidade; testes existentes (landing, catálogo, login, cardápio e layout do painel) continuam passando; formatação passa. |

## Casos de erro

| Caso                                           | Tratamento esperado                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Categoria sem produtos                         | Exibir "Nenhum produto" (RN06), sem erro.                                                |
| Acionar ação indisponível por teclado ou toque | Nenhuma ação, sem erro e sem alterar o foco.                                             |
| Recarregar a página                            | Visibilidade volta ao estado inicial (RN07); registrado como limitação sem persistência. |
| Acesso direto a `/admin/categorias` sem login  | Tela abre normalmente (sem guarda nesta etapa), como em `/admin/cardapio`.               |

## Fora de escopo

- Criar, editar e excluir categorias, formulários, modais de confirmação e as ações "Adicionar categoria", "Editar" e "Excluir" funcionais.
- Reordenar categorias, busca ou filtros nesta tela.
- Sincronizar a visibilidade das categorias com a landing page, com o cardápio ou com um backend; persistência e autenticação real.
- Configurações e seus fluxos; alterações na landing page, no login ou no catálogo.
- Commits, MR e publicação.
